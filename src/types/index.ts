/**
 * 类型定义入口
 * Chen Company Agent World - Type Definitions
 */

// Socket types
export * from './socket';

// Room types
export * from './map';

// Agent types
export * from './agent';

// Task types
export * from './task';

// Chat & Log types
export interface ChatMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: number;
  type: 'incoming' | 'outgoing';
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: number;
  type: 'info' | 'task' | 'system' | 'warning' | 'error';
}

// UI Types
export interface GlobalStats {
  onlineAgents: number;
  totalTasks: number;
  completedTasks: number;
  uptime: string; // 格式: "2h 30m"
}

// Sidebar types
export type SidebarTab = 'tasks' | 'chat' | 'logs' | 'stats';

// Language types
export type Locale = 'zh' | 'en';

// Config types
export interface AppConfig {
  language: Locale;
  theme: 'light' | 'dark';
  mapScale: number;
  showGrid: boolean;
}

// ==================== Device Identity Types (for openclaw-client) ====================

/** 设备身份记录 (与 openclaw-client 兼容) */
export interface DeviceIdentityRecord {
  /** Hex-encoded SHA-256 of the raw 32-byte public key */
  id: string;
  /** Base64url-encoded (no padding) raw 32-byte public key */
  publicKey: string;
  /** JWK of the Ed25519 private key (for re-import) */
  privateKeyJwk?: JsonWebKey;
}

/** 设备身份存储接口 */
export interface DeviceIdentityStore {
  load(): Promise<DeviceIdentityRecord | null>;
  save(record: DeviceIdentityRecord): Promise<void>;
}

/** 设备 Token 存储接口 */
export interface DeviceTokenStore {
  load(): Promise<string | null>;
  save(token: string): Promise<void>;
}
