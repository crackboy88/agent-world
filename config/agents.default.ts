/**
 * Agent 配置 - 默认模板
 * Agent Configuration - Default Template
 * 
 * 复制此文件为 agents.local.ts 并修改为你的私有配置
 * Copy this file to agents.local.ts and customize for your private config
 */

export interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
  clothes: string;
  accent: string;
  hair: string;
  accessory: string;
}

/**
 * 默认 Agent 列表
 * 可在此添加更多 Agent，或复制为 agents.local.ts 进行私有配置
 */
export const DEFAULT_AGENTS: Record<string, AgentConfig> = {
  'agent-1': { 
    id: 'agent-1', name: 'Agent One', emoji: '👤',
    clothes: '#3B82F6', accent: '#F59E0B', hair: '#1F2937', accessory: '💼'
  },
  'agent-2': { 
    id: 'agent-2', name: 'Agent Two', emoji: '🤖',
    clothes: '#10B981', accent: '#06B6D4', hair: '#374151', accessory: '⚙️'
  },
  'agent-3': { 
    id: 'agent-3', name: 'Agent Three', emoji: '📊',
    clothes: '#8B5CF6', accent: '#EC4899', hair: '#1F2937', accessory: '📈'
  },
};

/**
 * 默认调色板
 */
export const DEFAULT_PALETTE = {
  skin: '#FCD34D',
  skinShadow: '#E5B44D',
  hair: '#1F2937',
  hairLight: '#374151',
  clothes: '#3B82F6',
  clothesDark: '#2563EB',
  accent: '#F59E0B',
  shoe: '#374151',
  shoeDark: '#1F2937',
};

/**
 * Sprite 配置
 */
export const DEFAULT_SPRITE_CONFIG = {
  frameCount: 4,
  spriteSize: 256,
  characterSize: 128,
  animationSpeed: 300,
};
