/**
 * Gateway 消息中继服务
 * 浏览器 -> 本地WebSocket -> Gateway
 */

import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_PORT = 18790; // 本地中继端口
const GATEWAY_URL = 'ws://localhost:18789';
const GATEWAY_TOKEN = 'bfd18fa96afbb8f10c18f4fab6d028f541c843b19a6ef650';

interface GatewayMessage {
  id: string;
  action?: string;
  event?: string;
  requestId?: string;
  [key: string]: unknown;
}

class GatewayRelay {
  private wss: WebSocketServer | null = null;
  private gatewayWs: WebSocket | null = null;
  private clients: Set<WebSocket> = new Set();
  private requestId = 0;

  start() {
    this.wss = new WebSocketServer({ port: LOCAL_PORT });
    console.log(`🔄 Gateway 中继服务启动: ws://localhost:${LOCAL_PORT}`);
    
    this.wss.on('connection', (ws) => {
      console.log('📱 浏览器客户端连接');
      this.clients.add(ws);
      
      ws.on('message', (data: Buffer) => {
        this.handleClientMessage(data.toString());
      });
      
      ws.on('close', () => {
        console.log('📱 浏览器客户端断开');
        this.clients.delete(ws);
      });
    });

    this.connectToGateway();
  }

  private connectToGateway() {
    console.log('🔗 连接 Gateway...');
    this.gatewayWs = new WebSocket(GATEWAY_URL);

    this.gatewayWs.on('open', () => {
      console.log('✅ 已连接 Gateway');
      this.sendToGateway('connect', {
        minProtocol: 3,
        maxProtocol: 3,
        client: { id: 'relay', mode: 'ui', version: '1.0.0', platform: 'web' },
        auth: { token: GATEWAY_TOKEN },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
      });
    });

    this.gatewayWs.on('message', (data: Buffer) => {
      this.handleGatewayMessage(data.toString());
    });

    this.gatewayWs.on('close', () => {
      console.log('❌ Gateway 断开，5秒后重连...');
      setTimeout(() => this.connectToGateway(), 5000);
    });

    this.gatewayWs.on('error', (err: Error) => {
      console.error('Gateway 错误:', err.message);
    });
  }

  private handleClientMessage(data: string) {
    try {
      const msg = JSON.parse(data);
      console.log('📤 客户端消息:', msg.action || msg.event);
      this.sendToGateway(msg.action || 'send', msg.payload || msg);
    } catch (e) {
      console.error('解析客户端消息失败:', e);
    }
  }

  private handleGatewayMessage(data: string) {
    try {
      const msg = JSON.parse(data);
      console.log('📥 Gateway 消息:', msg.event || msg.response?.action);
      
      // 转发给所有客户端
      this.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    } catch (e) {
      console.error('解析 Gateway 消息失败:', e);
    }
  }

  private sendToGateway(action: string, payload: object) {
    if (this.gatewayWs?.readyState === WebSocket.OPEN) {
      const msg = {
        id: uuidv4(),
        action,
        requestId: `req-${++this.requestId}`,
        ...payload,
      };
      this.gatewayWs.send(JSON.stringify(msg));
    }
  }
}

// 启动服务
new GatewayRelay().start();
