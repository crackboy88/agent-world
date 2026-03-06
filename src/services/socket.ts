/**
 * OpenClaw Gateway WebSocket 客户端
 * 使用原生 WebSocket + JSON 帧协议
 * 
 * 协议格式:
 * - Request: {"type":"req", "id":"1", "method":"connect", "params": {...}}
 * - Response: {"type":"res", "id":"1", "ok": true, "payload": {...}}
 * - Event: {"type":"event", "event":"agent", "payload": {...}}
 */

import type { Agent } from '../types';

// ==================== 类型定义 ====================

export interface GatewayRequest {
  type: 'req';
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

export interface GatewayResponse {
  type: 'res';
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: {
    code: string;
    message: string;
  };
}

export interface GatewayEvent {
  type: 'event';
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: number;
}

export type GatewayFrame = GatewayRequest | GatewayResponse | GatewayEvent;

// ==================== 配置 ====================

interface Config {
  gatewayUrl: string;
  reconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  reconnectDelayMax: number;
}

const CONFIG: Config = {
  gatewayUrl: 'ws://localhost:18789',
  reconnect: true,
  reconnectAttempts: 10,
  reconnectDelay: 3000,
  reconnectDelayMax: 30000,
};

// ==================== Socket 服务类 ====================

class OpenClawSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private isManualDisconnect: boolean = false;
  private currentUrl: string = '';
  private requestId: number = 0;
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }> = new Map();

  // 事件回调
  onAgentUpdate?: (agents: Agent[]) => void;
  onMessage?: (data: { message: { agentId: string; content: string; type: 'incoming' | 'outgoing' } }) => void;
  onLog?: (log: { message: string; level: string; timestamp: number; type?: string }) => void;
  onPresence?: (data: unknown) => void;
  onGatewayStatus?: (status: { connected: boolean; url: string }) => void;
  onChat?: (data: unknown) => void;
  onGatewayEvent?: (event: { type: string; data: unknown }) => void;

  /**
   * 生成请求 ID
   */
  private generateId(): string {
    return `req_${++this.requestId}_${Date.now()}`;
  }

  /**
   * 发送 JSON 帧
   */
  private send(frame: GatewayFrame): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame));
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const frame = JSON.parse(event.data) as GatewayFrame;

      if (frame.type === 'res') {
        // 处理响应
        const pending = this.pendingRequests.get(frame.id);
        if (pending) {
          if (frame.ok) {
            pending.resolve(frame.payload);
          } else {
            pending.reject(new Error(frame.error?.message || 'Unknown error'));
          }
          this.pendingRequests.delete(frame.id);
        }
      } else if (frame.type === 'event') {
        // 处理事件
        this.handleEvent(frame);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  /**
   * 处理事件
   */
  private handleEvent(event: GatewayEvent): void {
    switch (event.event) {
      case 'agent':
        if (event.payload && typeof event.payload === 'object') {
          this.onAgentUpdate?.(event.payload as unknown as Agent[]);
        }
        break;
      case 'presence':
        this.onPresence?.(event.payload);
        break;
      case 'chat':
        this.onChat?.(event.payload);
        break;
      default:
        console.log('Unknown event:', event.event);
    }
  }

  /**
   * 发送请求并等待响应
   */
  private request(method: string, params?: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const frame: GatewayRequest = {
        type: 'req',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });
      this.send(frame);

      // 超时处理
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  /**
   * 连接到 Gateway
   */
  connect(token?: string): void {
    const url = this.getGatewayUrl();
    this.connectWebSocket(url, token);
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isManualDisconnect = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 获取 Gateway URL
   */
  getGatewayUrl(): string {
    const saved = localStorage.getItem('gatewayUrl');
    if (saved) return saved;
    return CONFIG.gatewayUrl;
  }

  /**
   * 设置 Gateway URL
   */
  setUrl(url: string): void {
    localStorage.setItem('gatewayUrl', url);
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 连接 WebSocket
   */
  private connectWebSocket(url: string, token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    // 清理旧连接
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // 添加 token 到 URL
    const wsUrl = token ? `${url}/?token=${token}` : url;
    console.log('Connecting to Gateway:', wsUrl);
    this.currentUrl = wsUrl;
    this.isManualDisconnect = false;

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ Gateway WebSocket connected');
      this.reconnectAttempts = 0;
      this.isManualDisconnect = false;
      this.onGatewayStatus?.({ connected: true, url: this.currentUrl });
      
      // 连接成功后发送 connect 请求进行认证
      this.sendConnectRequest();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      console.log('Gateway WebSocket closed:', event.code, event.reason);
      this.onGatewayStatus?.({ connected: false, url: this.currentUrl });
      
      if (!this.isManualDisconnect && CONFIG.reconnect) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  /**
   * 发送 connect 请求进行认证
   */
  private async sendConnectRequest(): Promise<void> {
    try {
      const result = await this.request('connect', {
        client: {
          id: 'agent-world',
          version: '1.0.0',
          platform: 'web',
          mode: 'operator',
        },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
      });
      console.log('Connect response:', result);
    } catch (error) {
      console.error('Connect failed:', error);
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect(): void {
    if (this.isManualDisconnect) return;

    if (this.reconnectAttempts >= CONFIG.reconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      CONFIG.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      CONFIG.reconnectDelayMax
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    setTimeout(() => {
      this.connectWebSocket(this.currentUrl);
    }, delay);
  }

  // ========== 公开 API ==========

  /**
   * 获取 Agent 列表
   */
  async listAgents(): Promise<Agent[]> {
    const result = await this.request('agents.list');
    return (result as Agent[]) || [];
  }

  /**
   * 调用 Agent
   */
  async invokeAgent(agentId: string, message: string): Promise<unknown> {
    return this.request('agent.invoke', {
      agentId,
      message,
    });
  }

  /**
   * 发送聊天消息
   */
  async sendChat(agentId: string, content: string): Promise<unknown> {
    return this.request('chat.send', {
      agentId,
      content,
    });
  }

  /**
   * 发送任务
   */
  async sendTask(agentId: string | null, task: {
    type: string;
    title: string;
    description?: string;
    params?: Record<string, unknown>;
  }): Promise<unknown> {
    if (agentId) {
      return this.invokeAgent(agentId, task.title + (task.description ? `: ${task.description}` : ''));
    }
    // 如果没有指定 Agent，发送到默认 Agent
    return this.invokeAgent('main', task.title + (task.description ? `: ${task.description}` : ''));
  }

  /**
   * 兼容旧 API
   */
  connectGateway(url: string): void {
    // 将 ws:// 转换为 HTTP URL (去掉路径和 token)
    const httpUrl = url.replace(/^ws:/, 'http:').split('?')[0];
    this.setUrl(httpUrl);
    this.connect(url.includes('token=') ? undefined : '');
  }

  disconnectGateway(): void {
    this.disconnect();
  }
}

// 导出单例
export const socketService = new OpenClawSocketService();
export default socketService;
