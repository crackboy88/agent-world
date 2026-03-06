/**
 * 类型定义入口
 * Chen Company Agent World - Type Definitions
 */

// Room types
export * from './room';

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
