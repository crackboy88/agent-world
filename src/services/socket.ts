/**
 * OpenClaw Gateway WebSocket 客户端
 * 使用官方 openclaw-client SDK
 * 支持设备身份认证
 */

import { OpenClawClient } from 'openclaw-client';
import type { Agent } from '../types';
import type { DeviceIdentityStore, DeviceTokenStore, DeviceIdentityRecord } from 'openclaw-client';

// 浏览器本地存储实现
const createBrowserStore = <T>(key: string): {
  load: () => Promise<T | null>;
  save: (data: T) => Promise<void>;
} => ({
  load: async () => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  save: async (data: T) => {
    localStorage.setItem(key, JSON.stringify(data));
  },
});

class OpenClawSocketService {
  private client: OpenClawClient | null = null;
  private _isConnected: boolean = false;
  
  // 事件回调
  onAgentUpdate?: (agents: Agent[]) => void;
  onMessage?: (data: { message: { agentId: string; content: string; type: 'incoming' | 'outgoing' } }) => void;
  onLog?: (log: { message: string; level: string; timestamp: number; type?: string }) => void;
  onPresence?: (data: unknown) => void;
  onGatewayStatus?: (status: { connected: boolean; url: string }) => void;
  onChat?: (data: unknown) => void;
  onSessionsUpdate?: (sessions: unknown[]) => void;
  onGatewayEvent?: (event: { type: string; data: unknown }) => void;
  onConnectionChange?: (connected: boolean) => void;

  // 设备身份存储
  private identityStore: DeviceIdentityStore;
  private tokenStore: DeviceTokenStore;

  constructor() {
    // 初始化设备身份存储
    this.identityStore = createBrowserStore<DeviceIdentityRecord>('oc-device-identity');
    this.tokenStore = createBrowserStore<string>('oc-device-token');
  }
  
  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.client?.isConnected() || this._isConnected;
  }

  /**
   * 连接到 Gateway (使用设备身份)
   * URL 可通过 localStorage['gatewayUrl'] 配置
   */
  connect(): void {
    const gatewayUrl = this.getGatewayUrl();
    
    this.client = new OpenClawClient({
      gatewayUrl,
      token: '', // 配对后使用设备令牌，token 字段不再需要
      clientId: 'webchat',
      clientVersion: '1.0.0',
      platform: 'web',
      mode: 'ui',
      // 启用设备身份认证
      deviceIdentity: this.identityStore,
      deviceToken: this.tokenStore,
      onConnection: (connected) => {
        this._isConnected = connected;
        this.onGatewayStatus?.({ connected, url: gatewayUrl });
        this.onConnectionChange?.(connected);
        if (connected) {
          this.onLog?.({ message: '✅ Gateway 连接成功', level: 'info', timestamp: Date.now() });
        } else {
          this.onLog?.({ message: '❌ Gateway 断开连接', level: 'info', timestamp: Date.now() });
        }
      },
      onPairingRequired: (required) => {
        this.onLog?.({ 
          message: required ? '🔗 需要设备配对，请运行: openclaw devices approve --latest' : '✅ 配对完成', 
          level: 'info', 
          timestamp: Date.now() 
        });
      },
    });

    // 订阅事件
    this.client.addEventListener((event) => {
      this.onGatewayEvent?.({ type: event.event, data: event.payload });
      
      switch (event.event) {
        case 'agent':
          // 处理 agent 事件，payload 可能是对象或数组
          if (event.payload) {
            const agents = Array.isArray(event.payload) 
              ? event.payload 
              : [event.payload];
            this.onAgentUpdate?.(agents as Agent[]);
          }
          break;
        case 'presence':
          this.onPresence?.(event.payload);
          break;
        case 'chat':
          this.onChat?.(event.payload);
          break;
        case 'session':
          // 处理 session 事件
          console.log('[Socket] Session event:', event.payload);
          if (Array.isArray(event.payload)) {
            this.onSessionsUpdate?.(event.payload);
          }
          break;
        case 'message':
          // 处理消息事件
          if (event.payload && typeof event.payload === 'object') {
            const msg = event.payload as { message?: { agentId: string; content: string; type: 'incoming' | 'outgoing' } };
            if (msg.message) {
              this.onMessage?.({ message: msg.message });
            }
          }
          break;
        default:
          console.log('Event:', event.event);
      }
    });

    // 连接
    this.client.connect()
      .then(() => {
        this.onLog?.({ message: '🎉 连接成功!', level: 'info', timestamp: Date.now() });
      })
      .catch((err) => {
        this.onLog?.({ message: `❌ 连接失败: ${err}`, level: 'error', timestamp: Date.now() });
      });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
  }

  // ========== 公开 API ==========

  /**
   * 获取 Agent 列表
   */
  async listAgents(): Promise<Agent[]> {
    if (!this.client) throw new Error('Not connected');
    const result = await this.client.listAgents();
    return (result.agents || []) as Agent[];
  }

  /**
   * 调用 Agent
   */
  async invokeAgent(agentId: string, message: string): Promise<unknown> {
    if (!this.client) throw new Error('Not connected');
    return this.client.sendToAgent({ 
      agentId, 
      message,
      idempotencyKey: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  /**
   * 发送聊天消息到指定会话
   */
  async sendChat(sessionKey: string, content: string): Promise<unknown> {
    if (!this.client) throw new Error('Not connected');
    return this.client.sendChat({ 
      sessionKey, 
      message: content,
      idempotencyKey: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  }

  /**
   * 获取会话列表
   */
  async listSessions(agentId?: string): Promise<{ sessions: Array<{ sessionKey: string; title: string; updatedAt: number }> }> {
    if (!this.client) throw new Error('Not connected');
    const result = await this.client.listSessions({ agentId });
    return result;
  }

  /**
   * 获取会话历史
   */
  async getChatHistory(sessionKey: string): Promise<{ messages: Array<{ role: string; content: string; timestamp: number }> }> {
    if (!this.client) throw new Error('Not connected');
    return this.client.getChatHistory({ sessionKey });
  }

  /**
   * 获取 Cron 任务列表
   */
  async listCronJobs(): Promise<any> {
    if (!this.client) throw new Error('Not connected');
    return this.client.listCronJobs({});
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
    const targetAgentId = agentId || 'main';
    return this.invokeAgent(targetAgentId, task.title + (task.description ? `: ${task.description}` : ''));
  }

  /**
   * 获取 Gateway URL
   */
  getGatewayUrl(): string {
    const saved = localStorage.getItem('gatewayUrl');
    return saved || 'ws://localhost:18789';
  }

  /**
   * 设置 Gateway URL
   */
  setUrl(url: string): void {
    localStorage.setItem('gatewayUrl', url);
  }

  /**
   * 连接 Gateway (兼容旧 API)
   */
  connectGateway(url: string): void {
    this.setUrl(url);
    this.connect();
  }

  /**
   * 断开 Gateway (兼容旧 API)
   */
  disconnectGateway(): void {
    this.disconnect();
  }
}

// 导出单例
export const socketService = new OpenClawSocketService();
export default socketService;
