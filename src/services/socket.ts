/**
 * Socket.io 客户端服务 - 直连 Gateway
 * 支持配置、自动重连、完整事件解析
 */

// 配置
const CONFIG = {
  gatewayUrl: '',
  reconnectTimer: null as ReturnType<typeof setTimeout> | null,
  pingTimer: null as ReturnType<typeof setInterval> | null,
};

class SocketService {
  private gatewayWs: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private lastConnectTime: number = 0;
  private isManualDisconnect: boolean = false;

  // 事件回调
  onAgentUpdate?: (agents: any[]) => void;
  onMessage?: (data: any) => void;
  onLog?: (log: any) => void;
  onGlobalStats?: (stats: any) => void;
  onGatewayEvent?: (event: any) => void;
  onGatewayStatus?: (status: { connected: boolean; url: string }) => void;

  connect() {
    const url = this.getGatewayUrl();
    this.connectGateway(url);
  }

  disconnect() {
    this.disconnectGateway();
  }

  isConnected(): boolean {
    return this.gatewayWs !== null && this.gatewayWs.readyState === WebSocket.OPEN;
  }

  getGatewayUrl(): string {
    const saved = localStorage.getItem('gatewayUrl');
    if (saved) return saved;
    return 'ws://localhost:18789/?token=5a8d91273cf067511ba6aebff67361ced57f54e2c5fb6d8e';
  }

  setUrl(url: string) {
    localStorage.setItem('gatewayUrl', url);
    CONFIG.gatewayUrl = url;
  }

  connectGateway(wsUrl: string) {
    if (this.gatewayWs?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    if (this.gatewayWs) {
      this.gatewayWs.close();
    }

    console.log('Connecting to Gateway:', wsUrl);
    CONFIG.gatewayUrl = wsUrl;
    this.gatewayWs = new WebSocket(wsUrl);

    this.gatewayWs.onopen = () => {
      console.log('✅ Gateway connected');
      this.reconnectAttempts = 0;
      this.lastConnectTime = Date.now();
      this.isManualDisconnect = false;
      this.onGatewayStatus?.({ connected: true, url: wsUrl });
      this.addLog('已连接到 Gateway', 'system');
      this.startPing();
    };

    this.gatewayWs.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.gatewayWs.onclose = (event) => {
      console.log('❌ Gateway disconnected:', event.code);
      this.onGatewayStatus?.({ connected: false, url: '' });
      this.addLog(`Gateway 断开 (${event.code})`, 'error');
      this.stopPing();
      this.scheduleReconnect(wsUrl);
    };

    this.gatewayWs.onerror = (error) => {
      console.error('Gateway error:', error);
      this.addLog('Gateway 连接错误', 'error');
    };
  }

  disconnectGateway() {
    this.isManualDisconnect = true;
    this.stopPing();
    if (CONFIG.reconnectTimer) {
      clearTimeout(CONFIG.reconnectTimer);
      CONFIG.reconnectTimer = null;
    }
    if (this.gatewayWs) {
      this.gatewayWs.close(1000, 'User disconnect');
      this.gatewayWs = null;
    }
    this.onGatewayStatus?.({ connected: false, url: '' });
  }

  private scheduleReconnect(wsUrl: string) {
    // 如果是手动断开连接，不重连
    if (this.isManualDisconnect) {
      return;
    }
    
    // 检查连接频率，防止过快重连
    const now = Date.now();
    const timeSinceLastConnect = now - this.lastConnectTime;
    if (timeSinceLastConnect < 5000) {
      // 5秒内不重复连接
      console.log('Too soon to reconnect, waiting...');
      return;
    }
    
    if (this.reconnectAttempts >= 10) {
      console.log('Max reconnect attempts reached');
      this.addLog('连接失败，请检查网络', 'error');
      return;
    }

    this.reconnectAttempts++;
    // 指数退避: 3s, 6s, 12s, 24s...
    const delay = Math.min(3000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    this.addLog(`正在重连... (${this.reconnectAttempts}/10)`, 'info');

    CONFIG.reconnectTimer = setTimeout(() => {
      this.connectGateway(wsUrl);
    }, delay);
  }

  private startPing() {
    CONFIG.pingTimer = setInterval(() => {
      if (this.gatewayWs?.readyState === WebSocket.OPEN) {
        this.gatewayWs.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }

  private stopPing() {
    if (CONFIG.pingTimer) {
      clearInterval(CONFIG.pingTimer);
      CONFIG.pingTimer = null;
    }
  }

  private handleMessage(rawData: string) {
    try {
      const message = JSON.parse(rawData);

      if (message.nonce && message.ts && !message.type) {
        this.gatewayWs?.send(JSON.stringify({ type: 'pong', nonce: message.nonce, ts: message.ts }));
        return;
      }

      if (message.type === 'res' && message.ok) {
        const payload = message.payload;
        if (payload?.type === 'hello-ok') {
          console.log('Protocol version:', payload.protocol);
        }
        return;
      }

      if (message.type === 'event') {
        this.handleEvent(message.payload);
      }
    } catch (e) {
      // ignore
    }
  }

  private handleEvent(payload: any) {
    if (!payload) return;

    const type = payload.type;
    this.onGatewayEvent?.({ type, data: payload, timestamp: Date.now() });

    switch (type) {
      case 'chat':
        this.addLog(`💬 ${payload.agentId}: ${payload.content?.slice(0, 30)}...`, 'info');
        break;
      case 'node.invoke.request':
        this.addLog(`⚙️ 调用技能: ${payload.skill || 'unknown'}`, 'info');
        break;
      case 'node.invoke.result':
        this.addLog(`✅ 技能完成: ${payload.skill || 'unknown'}`, 'success');
        break;
      case 'presence':
        this.addLog(`📍 ${payload.agentId} ${payload.status === 'online' ? '上线' : '下线'}`, 'info');
        break;
      case 'heartbeat':
        this.addLog(`💓 ${payload.agentId} heartbeat`, 'info');
        break;
      case 'cron':
        this.addLog(`⏰ 定时任务: ${payload.job}`, 'info');
        break;
      case 'error':
        this.addLog(`❌ 错误: ${payload.message}`, 'error');
        break;
      default:
        this.addLog(`📋 ${type}`, 'info');
    }
  }

  private addLog(message: string, type: 'info' | 'success' | 'error' | 'system') {
    this.onLog?.({
      id: `log-${Date.now()}`,
      type,
      message,
      timestamp: Date.now()
    });
  }
}

export const socketService = new SocketService();
export default socketService;
