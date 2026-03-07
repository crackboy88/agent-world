/**
 * 本地 Agent 配置
 * Local Agent Configuration
 * 
 * 此文件为私有配置示例 - 复制 agents.default.ts 并修改
 * 复制后放入 config/agents.local.ts（已被 gitignore）
 */

import type { AgentConfig } from './agents.default';

/**
 * 私有 Agent 配置示例 - Chen Company
 */
export const LOCAL_AGENTS: Record<string, AgentConfig> = {
  'main': { 
    id: 'main', name: 'CEO', emoji: '💼',
    clothes: '#3B82F6', accent: '#F59E0B', hair: '#1F2937', accessory: '👔'
  },
  'code-expert': { 
    id: 'code-expert', name: 'Tech Lead', emoji: '💻',
    clothes: '#10B981', accent: '#06B6D4', hair: '#374151', accessory: '👓'
  },
  'financial-analyst': { 
    id: 'financial-analyst', name: 'CFO', emoji: '📊',
    clothes: '#8B5CF6', accent: '#EC4899', hair: '#1F2937', accessory: '💰'
  },
  'materials-scientist': { 
    id: 'materials-scientist', name: 'CTO', emoji: '🧪',
    clothes: '#F59E0B', accent: '#EF4444', hair: '#6B7280', accessory: '🔬'
  },
  'political-analyst': { 
    id: 'political-analyst', name: 'Strategy', emoji: '📈',
    clothes: '#EF4444', accent: '#F97316', hair: '#1F2937', accessory: '🌍'
  },
  'zhihu': { 
    id: 'zhihu', name: 'Operations', emoji: '🛠️',
    clothes: '#EC4899', accent: '#8B5CF6', hair: '#374151', accessory: '📱'
  },
};
