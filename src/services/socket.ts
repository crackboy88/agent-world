/**
 * Socket.io 客户端服务 - 直连 Gateway
 * 支持配置、自动重连、完整事件解析
 * 支持消息重试、离线队列、消息状态追踪
 */

import { io, Socket } from 'socket.io-client';
import type { 
  GatewayMessage,
  GatewayEvent,
  GatewayEventPayload,
  GatewayEventType,
  SocketLogEntry,
  SocketServiceConfig,
} from '../types/socket';
import type { Agent } from '../types';

// ==================== 消息状态与队列 ====================

export type MessageStatus = 'pending' | 'sending' | 'success' | 'failed';

export interface QueuedMessage {
  id: string;
  payload: Record<string, unknown>;
  status: MessageStatus;
  retryCount: number;
  createdAt: number;
  lastAttemptAt?: number;
  error?: string;
  onSuccess?: (response?: unknown) => void;
  onFailure?: (error: Error) => void;
}

export interface QueueStatus {
  pending: number;
  sending: number;
  success: number;
  failed: number;
  total: number;
}

// 配置
const CONFIG: SocketServiceConfig = {
  gatewayUrl: 'http://localhost:18789',
  reconnect: true,
  reconnectAttempts: 10,
  reconnectDelay: 3000,
  reconnectionDelayMax: 30000,
  pingInterval: 25000,
  pingTimeout: 10000,
};

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,    // 基础延迟 1s
  maxDelay: 10000,    // 最大延迟 10s
  backoffMultiplier: 2, // 指数退避倍数
};

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts: number = 0;
  // 连接时间戳 (用于重连频率控制)
  private lastConnectTime: number = 0;
  private isManualDisconnect: boolean = false;
  private currentUrl: string = '';

  // ========== 新增: 消息队列与重试 ==========
  private messageQueue: Map<string, QueuedMessage> = new Map();
  private isProcessingQueue: boolean = false;
  private queueProcessTimer: ReturnType<typeof setTimeout> | null = null;

  // 事件回调 - 与原有 API 兼容
  onAgentUpdate?: (agents: Agent[]) => void;
  onMessage?: (data: { message: { agentId: string; content: string; type: 'incoming' | 'outgoing' } }) => void;
  onLog?: (log: SocketLogEntry) => void;
  onGlobalStats?: (stats: unknown) => void;
  onGatewayEvent?: (event: { type: string; data: GatewayEventPayload; timestamp: number }) => void;
  onGatewayStatus?: (status: { connected: boolean; url: string }) => void;
  
  // ========== 新增: 消息状态回调 ==========
  onMessageStatusChange?: (message: QueuedMessage) => void;
  onQueueStatusChange?: (status: QueueStatus) => void;

  /**
   * 连接到 Gateway
   */
  connect(): void {
    const url = this.getGatewayUrl();
    this.connectSocket(url);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.disconnectSocket();
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * 获取 Gateway URL
   */
  getGatewayUrl(): string {
    const saved = localStorage.getItem('gatewayUrl');
    if (saved) return saved;
    // 默认使用 HTTP URL (Socket.io 需要 HTTP)
    return CONFIG.gatewayUrl;
  }

  /**
   * 设置 Gateway URL
   */
  setUrl(url: string): void {
    localStorage.setItem('gatewayUrl', url);
    CONFIG.gatewayUrl = url;
  }

  /**
   * 连接到指定 URL
   */
  connectSocket(url: string): void {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    // 清理旧连接
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Connecting to Gateway:', url);
    CONFIG.gatewayUrl = url;
    this.currentUrl = url;

    try {
      // 创建 Socket.io 连接
      this.socket = io(url, {
        transports: ['websocket', 'polling'],
        reconnection: CONFIG.reconnect,
        reconnectionAttempts: CONFIG.reconnectAttempts,
        reconnectionDelay: CONFIG.reconnectDelay,
        reconnectionDelayMax: CONFIG.reconnectionDelayMax,
        timeout: CONFIG.pingTimeout,
        autoConnect: true,
        query: {
          // 可添加额外查询参数
          client: 'agent-world',
        },
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create socket:', error);
      this.addLog('Socket 创建失败', 'error');
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('✅ Gateway connected (Socket.io)');
      this.reconnectAttempts = 0;
      this.lastConnectTime = Date.now();
      this.isManualDisconnect = false;
      this.onGatewayStatus?.({ connected: true, url: this.currentUrl });
      this.addLog('已连接到 Gateway', 'system');
      
      // ========== 新增: 连接成功后自动发送队列 ==========
      this.processQueue();
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.addLog(`连接错误: ${error.message}`, 'error');
    });

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Gateway disconnected:', reason);
      this.onGatewayStatus?.({ connected: false, url: '' });
      this.addLog(`Gateway 断开: ${reason}`, 'error');

      // 如果不是手动断开，尝试重连
      if (!this.isManualDisconnect && reason !== 'io client disconnect') {
        this.scheduleReconnect();
      }
    });

    // 重连尝试
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnecting... (attempt ${attemptNumber})`);
      this.reconnectAttempts = attemptNumber;
      this.addLog(`正在重连... (${attemptNumber}/${CONFIG.reconnectAttempts})`, 'info');
    });

    // 重连成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.addLog('重连成功', 'success');
      
      // ========== 新增: 重连成功后处理队列 ==========
      this.processQueue();
    });

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('Reconnection failed');
      this.addLog('重连失败，请检查网络', 'error');
    });

    // 处理 Gateway 消息
    this.socket.on('message', (data: unknown) => {
      this.handleMessage(data);
    });

    // 处理 Gateway 事件 (如果 Gateway 使用命名空间)
    this.socket.on('gateway:event', (data: GatewayEvent) => {
      this.handleGatewayEvent(data);
    });

    // 处理错误事件
    this.socket.on('error', (error: { message: string; code?: string }) => {
      console.error('Gateway error:', error);
      this.addLog(`错误: ${error.message}`, 'error');
    });

    // Agent 更新事件
    this.socket.on('agent:update', (data: { agents: Agent[] }) => {
      this.onAgentUpdate?.(data.agents);
    });

    // 任务更新事件 - 使用单独的处理
    this.socket.on('task:update', (data: { taskId: string; progress: number }) => {
      // 触发任务更新回调
      this.onLog?.({
        id: `log-${Date.now()}`,
        type: 'info',
        message: `Task ${data.taskId} progress: ${data.progress}%`,
        timestamp: Date.now()
      });
    });

    // 聊天消息事件
    this.socket.on('chat:message', (data: { message: { agentId: string; content: string; type: 'incoming' | 'outgoing' } }) => {
      this.onMessage?.(data);
    });

    // 在线状态更新
    this.socket.on('presence:update', (data: { message: { agentId: string; content: string; type: 'incoming' | 'outgoing' } }) => {
      this.onMessage?.(data);
    });
  }

  /**
   * 断开 Socket 连接
   */
  disconnectSocket(): void {
    this.isManualDisconnect = true;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.onGatewayStatus?.({ connected: false, url: '' });
    this.addLog('已断开连接', 'system');
  }

  /**
   * 保留方法：用于 WebSocket 兼容
   * @deprecated 使用 Socket.io 后不再需要
   */
  connectGateway(wsUrl: string): void {
    // 将 ws:// 转换为 http://
    const httpUrl = wsUrl.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
    this.connectSocket(httpUrl);
  }

  /**
   * 保留方法：用于 WebSocket 兼容
   * @deprecated 使用 Socket.io 后不再需要
   */
  disconnectGateway(): void {
    this.disconnectSocket();
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.isManualDisconnect) {
      return;
    }

    // 检查连接频率
    const now = Date.now();
    const timeSinceLastConnect = now - this.lastConnectTime;
    if (timeSinceLastConnect < 5000) {
      console.log('Too soon to reconnect, waiting...');
      return;
    }

    if (this.reconnectAttempts >= CONFIG.reconnectAttempts) {
      console.log('Max reconnect attempts reached');
      this.addLog('连接失败，请检查网络', 'error');
      return;
    }

    // 指数退避: 3s, 6s, 12s, 24s...
    const delay = Math.min(
      CONFIG.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      CONFIG.reconnectionDelayMax
    );

    console.log(`Scheduling reconnect in ${delay}ms`);
    this.addLog(`正在重连... (${this.reconnectAttempts + 1}/${CONFIG.reconnectAttempts})`, 'info');

    // Socket.io 会自动重连，这里可以发送自定义重连事件
    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: unknown): void {
    try {
      if (typeof data === 'string') {
        const message = JSON.parse(data) as GatewayMessage;

        // 处理心跳
        if (message.type === 'ping' && message.nonce && message.ts) {
          this.sendPong(message.nonce, message.ts);
          return;
        }

        // ========== 新增: 处理消息响应并更新队列状态 ==========
        if (message.type === 'res' && message.nonce) {
          this.handleMessageResponse(message.nonce, message);
          return;
        }

        // 处理响应
        if (message.type === 'res') {
          if (message.ok && message.payload?.type === 'hello-ok') {
            console.log('Protocol version:', (message.payload as { protocol?: string }).protocol);
          }
          return;
        }

        // 处理事件
        if (message.type === 'event' && message.payload) {
          this.handleGatewayEvent({
            type: 'event',
            payload: message.payload as GatewayEventPayload,
          });
        }
      } else if (typeof data === 'object' && data !== null) {
        // 直接处理对象
        const message = data as GatewayMessage;
        
        // ========== 新增: 处理消息响应 ==========
        if (message.type === 'res' && message.nonce) {
          this.handleMessageResponse(message.nonce, message);
          return;
        }
        
        if (message.type === 'event' && message.payload) {
          this.handleGatewayEvent({
            type: 'event',
            payload: message.payload as GatewayEventPayload,
          });
        }
      }
    } catch (e) {
      // 忽略解析错误
    }
  }

  /**
   * 处理 Gateway 事件
   */
  private handleGatewayEvent(event: GatewayEvent): void {
    if (!event.payload) return;

    const type = (event.payload.type || 'unknown') as GatewayEventType;
    const timestamp = Date.now();

    // 触发通用事件回调
    this.onGatewayEvent?.({ type, data: event.payload, timestamp });

    // 根据事件类型处理日志
    switch (type) {
      case 'chat':
        this.addLog(
          `💬 ${event.payload.agentId}: ${String(event.payload.content || '').slice(0, 30)}...`,
          'info'
        );
        break;
      case 'node.invoke.request':
        this.addLog(
          `⚙️ 调用技能: ${event.payload.skill || 'unknown'}`,
          'info'
        );
        break;
      case 'node.invoke.result':
        this.addLog(
          `✅ 技能完成: ${event.payload.skill || 'unknown'}`,
          'success'
        );
        break;
      case 'presence':
        this.addLog(
          `📍 ${event.payload.agentId} ${event.payload.status === 'online' ? '上线' : '下线'}`,
          'info'
        );
        break;
      case 'heartbeat':
        this.addLog(
          `💓 ${event.payload.agentId} heartbeat`,
          'info'
        );
        break;
      case 'cron':
        this.addLog(
          `⏰ 定时任务: ${event.payload.job}`,
          'info'
        );
        break;
      case 'error':
        this.addLog(
          `❌ 错误: ${event.payload.message}`,
          'error'
        );
        break;
      case 'task.created':
        this.addLog(
          `📝 新任务: ${event.payload.taskType}`,
          'info'
        );
        break;
      case 'task.updated':
        this.addLog(
          `📈 任务进度: ${event.payload.progress}%`,
          'info'
        );
        break;
      case 'task.completed':
        this.addLog(
          `✅ 任务完成`,
          'success'
        );
        break;
      case 'agent.status':
        this.addLog(
          `👤 ${event.payload.agentId} 状态: ${event.payload.state}`,
          'info'
        );
        break;
      default:
        this.addLog(`📋 ${type}`, 'info');
    }
  }

  /**
   * 发送 Pong 响应
   */
  private sendPong(nonce: string, ts: number): void {
    this.socket?.emit('message', JSON.stringify({
      type: 'pong',
      nonce,
      ts,
    }));
  }

  /**
   * 添加日志条目
   */
  private addLog(
    message: string,
    type: 'info' | 'success' | 'error' | 'system' | 'warning'
  ): void {
    const log: SocketLogEntry = {
      id: `log-${Date.now()}`,
      type,
      message,
      timestamp: Date.now(),
    };
    this.onLog?.(log);
  }

  // ==================== 新增: 消息队列与重试 ====================

  /**
   * 发送消息到 Gateway (带重试机制)
   * @param payload 消息内容
   * @param options 选项: onSuccess, onFailure, immediate
   * @returns 消息ID
   */
  send(payload: Record<string, unknown>, options?: {
    onSuccess?: (response?: unknown) => void;
    onFailure?: (error: Error) => void;
    immediate?: boolean;  // 是否立即发送（跳过队列）
  }): string {
    const messageId = payload.nonce as string || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    const queuedMessage: QueuedMessage = {
      id: messageId,
      payload: { ...payload, nonce: messageId },
      status: 'pending',
      retryCount: 0,
      createdAt: Date.now(),
      onSuccess: options?.onSuccess,
      onFailure: options?.onFailure,
    };

    // 如果立即发送且已连接，直接发送
    if (options?.immediate && this.socket?.connected) {
      this.sendMessage(queuedMessage);
    } else {
      // 加入队列
      this.messageQueue.set(messageId, queuedMessage);
      this.notifyQueueStatusChange();
      
      // 如果已连接，自动处理队列
      if (this.socket?.connected) {
        this.processQueue();
      }
    }

    return messageId;
  }

  /**
   * 发送单条消息
   */
  private sendMessage(message: QueuedMessage): void {
    if (!this.socket?.connected) {
      // 连接断开，标记状态
      message.status = 'pending';
      this.notifyMessageStatusChange(message);
      return;
    }

    message.status = 'sending';
    message.lastAttemptAt = Date.now();
    this.notifyMessageStatusChange(message);

    try {
      this.socket.emit('message', JSON.stringify(message.payload));
      
      // 对于非响应式消息（如 event 类型），假设发送成功
      const payload = message.payload as { type?: string };
      if (payload.type === 'event') {
        // 事件类消息不等待响应，直接标记成功
        setTimeout(() => {
          message.status = 'success';
          this.notifyMessageStatusChange(message);
          message.onSuccess?.();
          this.notifyQueueStatusChange();
        }, 500);
      }
      // 对于请求类消息 (type: 'req')，等待响应处理
    } catch (error) {
      this.handleSendError(message, error as Error);
    }
  }

  /**
   * 处理消息响应
   */
  private handleMessageResponse(nonce: string, response: GatewayMessage): void {
    const message = this.messageQueue.get(nonce);
    if (!message) return;

    if (response.ok) {
      message.status = 'success';
      this.notifyMessageStatusChange(message);
      message.onSuccess?.(response);
    } else {
      const error = new Error(response.error || 'Unknown error');
      this.handleSendError(message, error);
    }

    // 从队列中移除成功的消息
    if (message.status === 'success') {
      this.messageQueue.delete(nonce);
    }
    
    this.notifyQueueStatusChange();
  }

  /**
   * 处理发送错误
   */
  private handleSendError(message: QueuedMessage, error: Error): void {
    message.error = error.message;
    message.retryCount++;

    if (message.retryCount >= RETRY_CONFIG.maxRetries) {
      // 超过最大重试次数
      message.status = 'failed';
      this.notifyMessageStatusChange(message);
      message.onFailure?.(error);
      this.addLog(`消息发送失败: ${error.message}`, 'error');
      
      // 从队列中移除失败消息
      this.messageQueue.delete(message.id);
    } else {
      // 安排重试（指数退避）
      message.status = 'pending';
      this.notifyMessageStatusChange(message);
      
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, message.retryCount - 1),
        RETRY_CONFIG.maxDelay
      );
      
      this.addLog(`消息发送失败，${delay}ms 后重试 (${message.retryCount}/${RETRY_CONFIG.maxRetries})`, 'warning');
      
      setTimeout(() => {
        this.sendMessage(message);
      }, delay);
    }
    
    this.notifyQueueStatusChange();
  }

  /**
   * 处理队列
   */
  private processQueue(): void {
    if (this.isProcessingQueue || !this.socket?.connected) {
      return;
    }

    this.isProcessingQueue = true;

    const processNext = () => {
      // 查找pending的消息
      let pendingMessage: QueuedMessage | undefined;
      
      for (const [_, message] of this.messageQueue) {
        if (message.status === 'pending') {
          pendingMessage = message;
          break;
        }
      }

      if (pendingMessage) {
        this.sendMessage(pendingMessage);
        
        // 延迟处理下一条，避免并发
        this.queueProcessTimer = setTimeout(processNext, 200);
      } else {
        this.isProcessingQueue = false;
        // 清理定时器
        if (this.queueProcessTimer) {
          clearTimeout(this.queueProcessTimer);
          this.queueProcessTimer = null;
        }
      }
    };

    processNext();
  }

  /**
   * 通知消息状态变化
   */
  private notifyMessageStatusChange(message: QueuedMessage): void {
    this.onMessageStatusChange?.(message);
  }

  /**
   * 通知队列状态变化
   */
  private notifyQueueStatusChange(): void {
    this.onQueueStatusChange?.(this.getQueueStatus());
  }

  /**
   * 获取队列状态
   */
  getQueueStatus(): QueueStatus {
    let pending = 0;
    let sending = 0;
    let success = 0;
    let failed = 0;

    for (const [, message] of this.messageQueue) {
      switch (message.status) {
        case 'pending': pending++; break;
        case 'sending': sending++; break;
        case 'success': success++; break;
        case 'failed': failed++; break;
      }
    }

    return {
      pending,
      sending,
      success,
      failed,
      total: pending + sending + success + failed,
    };
  }

  /**
   * 获取队列中的消息
   */
  getQueuedMessages(): QueuedMessage[] {
    return Array.from(this.messageQueue.values());
  }

  /**
   * 清除已成功的消息
   */
  clearCompletedMessages(): void {
    for (const [id, message] of this.messageQueue) {
      if (message.status === 'success' || message.status === 'failed') {
        this.messageQueue.delete(id);
      }
    }
    this.notifyQueueStatusChange();
  }

  /**
   * 重试失败的消息
   */
  retryFailedMessages(): void {
    for (const [, message] of this.messageQueue) {
      if (message.status === 'failed') {
        message.status = 'pending';
        message.retryCount = 0;
        message.error = undefined;
      }
    }
    this.notifyQueueStatusChange();
    this.processQueue();
  }

  // ==================== 公开 API ====================

  /**
   * 发送消息到 Gateway (兼容旧API)
   * @deprecated 使用带重试的 send() 方法
   */
  sendLegacy(message: Record<string, unknown>): void {
    if (this.socket?.connected) {
      this.socket.emit('message', JSON.stringify(message));
    } else {
      // 离线时加入队列
      this.send(message, { immediate: false });
    }
  }

  /**
   * 发送任务
   */
  sendTask(taskType: string, agentId?: string, params?: Record<string, unknown>): string {
    return this.send({
      type: 'req',
      nonce: `task-${Date.now()}`,
      ts: Date.now(),
      payload: {
        type: 'task.submit',
        taskType,
        agentId,
        params,
      } as unknown as GatewayEventPayload,
    });
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): void {
    this.send({
      type: 'req',
      nonce: `cancel-${Date.now()}`,
      ts: Date.now(),
      payload: {
        type: 'task.cancel',
        taskId,
      } as unknown as GatewayEventPayload,
    });
  }

  /**
   * 调用 Agent 技能
   */
  invokeSkill(skill: string, params?: Record<string, unknown>): string {
    return this.send({
      type: 'req',
      nonce: `invoke-${Date.now()}`,
      ts: Date.now(),
      payload: {
        type: 'node.invoke.request',
        skill,
        params,
      } as unknown as GatewayEventPayload,
    });
  }

  /**
   * 发送聊天消息
   */
  sendChat(agentId: string, content: string): string {
    return this.send({
      type: 'event',
      payload: {
        type: 'chat',
        agentId,
        content,
        timestamp: Date.now(),
      } as unknown as GatewayEventPayload,
    });
  }

  /**
   * 获取 Socket 实例 (供高级使用)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * 获取配置
   */
  getConfig(): SocketServiceConfig {
    return { ...CONFIG };
  }

  /**
   * 更新配置
   */
  setConfig(config: Partial<SocketServiceConfig>): void {
    Object.assign(CONFIG, config);
  }
}

// 导出单例
export const socketService = new SocketService();
export default socketService;
