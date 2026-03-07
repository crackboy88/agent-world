/**
 * 配置加载器
 * Configuration Loader
 * 
 * 加载顺序:
 * 1. config/*.default.ts - 默认配置（推送到仓库）
 * 2. config/*.local.ts - 私有配置（本地保留，不推送到仓库）
 */

import type { AgentConfig } from './agents.default';
import { DEFAULT_AGENTS, DEFAULT_PALETTE, DEFAULT_SPRITE_CONFIG } from './agents.default';
import type { Room } from './rooms.default';
import { DEFAULT_ROOMS } from './rooms.default';

// 私有配置导入 - 使用 optional chaining 避免构建错误
// 用户需要创建 agents.local.ts 和 rooms.local.ts
let localAgents: Record<string, AgentConfig> = {};
let localRooms: Room[] = [];

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localAgentsModule = require('./agents.local');
  if (localAgentsModule && localAgentsModule.LOCAL_AGENTS) {
    localAgents = localAgentsModule.LOCAL_AGENTS;
  }
} catch {
  // local config not found, use defaults
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localRoomsModule = require('./rooms.local');
  if (localRoomsModule && localRoomsModule.LOCAL_ROOMS) {
    localRooms = localRoomsModule.LOCAL_ROOMS;
  }
} catch {
  // local config not found, use defaults
}

/**
 * 获取 Agent 配置
 * 优先使用本地配置，其次使用默认配置
 */
export function getAgentConfig(agentId: string): AgentConfig {
  return localAgents[agentId] || DEFAULT_AGENTS[agentId] || DEFAULT_AGENTS['agent-1'];
}

/**
 * 获取所有 Agent 配置
 */
export function getAllAgentConfigs(): Record<string, AgentConfig> {
  return { ...DEFAULT_AGENTS, ...localAgents };
}

/**
 * 获取房间配置
 * 优先使用本地配置，其次使用默认配置
 */
export function getRoomConfig(roomId: string): Room | undefined {
  const localRoom = localRooms.find(r => r.id === roomId);
  if (localRoom) return localRoom;
  
  return DEFAULT_ROOMS.find(r => r.id === roomId);
}

/**
 * 获取所有房间配置
 */
export function getAllRoomConfigs(): Room[] {
  if (localRooms.length > 0) {
    return localRooms;
  }
  return DEFAULT_ROOMS;
}

/**
 * 获取调色板
 */
export function getPalette() {
  return DEFAULT_PALETTE;
}

/**
 * 获取 Sprite 配置
 */
export function getSpriteConfig() {
  return DEFAULT_SPRITE_CONFIG;
}

// 同步版本别名（用于初始化）
export const getAllAgentConfigsSync = getAllAgentConfigs;
export const getAllRoomConfigsSync = getAllRoomConfigs;
