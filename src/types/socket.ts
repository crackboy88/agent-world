/**
 * Gateway Socket.io 消息类型定义
 * Chen Company Agent World - Gateway Protocol Types
 */

// ==================== 基础消息类型 ====================

/** Gateway 消息类型 */
export type GatewayMessageType = 
  | 'req'      // 请求
  | 'res'      // 响应
  | 'event'    // 事件
  | 'ping'     // 心跳
  | 'pong';    // 心跳响应

/** 事件类型 */
export type GatewayEventType = 
  | 'chat'                     // 聊天消息
  | 'presence'                 // Agent 在线状态
  | 'heartbeat'               // 心跳
  | 'node.invoke.request'     // 技能调用请求
  | 'node.invoke.result'      // 技能调用结果
  | 'cron'                     // 定时任务
  | 'error'                    // 错误
  | 'task.created'            // 任务创建
  | 'task.updated'            // 任务更新
  | 'task.completed'          // 任务完成
  | 'agent.status'            // Agent 状态变化
  | 'agent.message'           // Agent 消息
  | 'session.started'         // 会话开始
  | 'session.ended';          // 会话结束

// ==================== 消息结构 ====================

/** Gateway 基础消息 */
export interface GatewayMessage {
  type: GatewayMessageType;
  nonce?: string;           // 唯一标识
  ts?: number;             // 时间戳
  payload?: GatewayPayload;
  ok?: boolean;            // 是否成功
  error?: string;          // 错误信息
}

/** Gateway 负载 */
export interface GatewayPayload {
  type?: GatewayEventType | string;
  [key: string]: unknown;
}

// ==================== 请求/响应 ====================

/** 请求消息 */
export interface GatewayRequest {
  type: 'req';
  nonce: string;
  ts: number;
  payload: GatewayPayload;
}

/** 响应消息 */
export interface GatewayResponse {
  type: 'res';
  nonce: string;
  ts: number;
  ok: boolean;
  payload?: GatewayPayload;
  error?: string;
}

// ==================== 事件消息 ====================

/** 事件消息 */
export interface GatewayEvent {
  type: 'event';
  payload: GatewayEventPayload;
}

/** 事件负载 */
export interface GatewayEventPayload {
  type: GatewayEventType;
  [key: string]: unknown;
}

// ==================== 具体事件类型 ====================

/** 聊天事件 */
export interface ChatEvent {
  type: 'chat';
  agentId: string;
  content: string;
  sessionId?: string;
  timestamp?: number;
}

/** 在线状态事件 */
export interface PresenceEvent {
  type: 'presence';
  agentId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: number;
}

/** 心跳事件 */
export interface HeartbeatEvent {
  type: 'heartbeat';
  agentId: string;
  timestamp: number;
  status?: string;
}

/** 技能调用请求事件 */
export interface NodeInvokeRequestEvent {
  type: 'node.invoke.request';
  skill: string;
  agentId: string;
  params?: Record<string, unknown>;
  taskId?: string;
  nonce?: string;
}

/** 技能调用结果事件 */
export interface NodeInvokeResultEvent {
  type: 'node.invoke.result';
  skill: string;
  agentId: string;
  result?: unknown;
  error?: string;
  taskId?: string;
  nonce?: string;
  duration?: number;
}

/** 定时任务事件 */
export interface CronEvent {
  type: 'cron';
  job: string;
  agentId?: string;
  schedule?: string;
  timestamp?: number;
}

/** 错误事件 */
export interface ErrorEvent {
  type: 'error';
  message: string;
  code?: string;
  agentId?: string;
  details?: Record<string, unknown>;
}

/** 任务创建事件 */
export interface TaskCreatedEvent {
  type: 'task.created';
  taskId: string;
  taskType: string;
  assignee: string;
  createdAt: number;
}

/** 任务更新事件 */
export interface TaskUpdatedEvent {
  type: 'task.updated';
  taskId: string;
  progress: number;
  status?: string;
  updatedAt: number;
}

/** 任务完成事件 */
export interface TaskCompletedEvent {
  type: 'task.completed';
  taskId: string;
  assignee: string;
  completedAt: number;
  result?: unknown;
}

/** Agent 状态事件 */
export interface AgentStatusEvent {
  type: 'agent.status';
  agentId: string;
  state: string;
  progress?: number;
  mood?: string;
}

/** Agent 消息事件 */
export interface AgentMessageEvent {
  type: 'agent.message';
  agentId: string;
  content: string;
  timestamp: number;
}

// ==================== Socket.io 事件 ====================

/** Socket.io 连接状态 */
export type SocketConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

/** Socket.io 事件映射 */
export interface SocketEvents {
  // 传入事件 (Gateway -> Client)
  'gateway:event': GatewayEvent;
  'gateway:status': { connected: boolean; url: string };
  'gateway:error': { message: string; code?: string };
  'agent:update': { agents: GatewayEventPayload[] };
  'task:update': { taskId: string; progress: number };
  'chat:message': ChatEvent;
  'presence:update': PresenceEvent;
  
  // 传出事件 (Client -> Gateway)
  'gateway:send': GatewayMessage;
  'task:submit': { taskType: string; agentId?: string; params?: Record<string, unknown> };
  'task:cancel': { taskId: string };
  'agent:invoke': { skill: string; params?: Record<string, unknown> };
  'chat:send': { agentId: string; content: string };
}

// ==================== 日志条目 ====================

/** Socket 日志条目 */
export interface SocketLogEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  message: string;
  timestamp: number;
  eventType?: GatewayEventType;
  data?: unknown;
}

// ==================== 配置类型 ====================

/** Socket 服务配置 */
export interface SocketServiceConfig {
  gatewayUrl: string;
  reconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  reconnectionDelayMax: number;
  pingInterval: number;
  pingTimeout: number;
}

/** 默认配置 */
export const DEFAULT_SOCKET_CONFIG: SocketServiceConfig = {
  gatewayUrl: 'http://localhost:18789',
  reconnect: true,
  reconnectAttempts: 10,
  reconnectDelay: 3000,
  reconnectionDelayMax: 30000,
  pingInterval: 25000,
  pingTimeout: 10000,
};

// ==================== 类型别名 (兼容旧代码) ====================

/** 连接状态 */
export type ConnectionStatus = SocketConnectionState;

/** Gateway 配置 */
export interface GatewayConfig extends Partial<SocketServiceConfig> {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
}

/** 日志条目 */
export type LogEntry = SocketLogEntry;

// ==================== Socket.io 事件常量 ====================

/** Socket.io 事件名称常量 */
export const SOCKET_EVENTS = {
  // 接收事件
  AGENT_STATUS: 'agent.status',
  TASK_UPDATE: 'task.updated',
  CHAT: 'chat',
  NODE_INVOKE_REQUEST: 'node.invoke.request',
  NODE_INVOKE_RESULT: 'node.invoke.result',
  PRESENCE: 'presence',
  HEARTBEAT: 'heartbeat',
  CRON: 'cron',
  ERROR: 'error',
  GLOBAL_STATS: 'global_stats',
  ROOM_UPDATE: 'room_update',
  
  // 发送事件
  SEND_TASK: 'task:submit',
  SEND_CHAT: 'chat:send',
  NODE_INVOKE: 'agent:invoke',
  HEARTBEAT_PONG: 'heartbeat',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  
  // 系统事件
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
  RECONNECT_ATTEMPT: 'reconnect_attempt',
} as const;

// 兼容别名
export const SocketEvents = SOCKET_EVENTS;

// ============================================================================
// 额外的事件类型
// ============================================================================

// 任务更新事件
export interface TaskUpdateEvent {
  type: 'task.updated';
  taskId: string;
  progress: number;
  status?: string;
  updatedAt: number;
  assignee?: string;
  message?: string;
}

// 全局统计事件
export interface GlobalStatsEvent {
  type: 'global_stats';
  onlineAgents: number;
  totalTasks: number;
  completedTasks: number;
  runningTasks: number;
  timestamp: number;
}

// 房间更新事件
export interface RoomEvent {
  type: 'room_update';
  roomId: string;
  agents: string[];
  timestamp: number;
}

/** 检查是否为 Gateway 消息 */
export function isGatewayMessage(value: unknown): value is GatewayMessage {
  return (
    typeof value === 'object' && 
    value !== null && 
    'type' in value
  );
}

/** 检查是否为事件消息 */
export function isGatewayEvent(value: GatewayMessage): value is GatewayMessage & { type: 'event' } {
  return value.type === 'event' && 'payload' in value;
}

/** 检查是否为响应消息 */
export function isGatewayResponse(value: GatewayMessage): value is GatewayResponse {
  return value.type === 'res';
}
