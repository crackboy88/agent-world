/**
 * Agent 消息中继服务
 * 通过 Agent 会话转发消息到 Gateway
 */

import { socketService } from './socket';

class AgentRelayService {
  private static instance: AgentRelayService;
  
  static getInstance() {
    if (!AgentRelayService.instance) {
      AgentRelayService.instance = new AgentRelayService();
    }
    return AgentRelayService.instance;
  }
  
  // 发送消息到 Gateway
  async sendToGateway(action: string, payload: Record<string, unknown>): Promise<unknown> {
    // 通过 socket 发送 - 使用公共 API
    if (action === 'agent.invoke') {
      const agentId = payload.agentId as string;
      const message = payload.message as string;
      return socketService.invokeAgent(agentId, message);
    }
    // 其他action可以扩展
    throw new Error(`Unknown action: ${action}`);
  }
  
  // 订阅 Gateway 事件
  subscribe(event: string, callback: (data: unknown) => void) {
    // 事件订阅可以通过 socketService 的回调处理
    if (event === 'agent') {
      socketService.onAgentUpdate = callback as (agents: unknown[]) => void;
    }
  }
}

export const agentRelay = AgentRelayService.getInstance();
