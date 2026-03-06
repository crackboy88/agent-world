/**
 * Chen Company Agent 像素素材库
 * Pixel Art Asset Library
 * 
 * 包含所有 Agent 的像素角色设计和 Sprite 图集
 */

// ==================== Agent 配置 ====================

export interface AgentConfig {
  id: string;
  name: string;
  emoji: string;
  clothes: string;   // 衣服颜色
  accent: string;   // 装饰颜色
  hair: string;     // 头发颜色
  accessory: string; // 配饰图标
}

export const AGENT_ASSETS: Record<string, AgentConfig> = {
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

// ==================== 调色板 ====================

export const PALETTE = {
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

// ==================== Sprite 图集 ====================

// Sprite 图集配置
export const SPRITE_CONFIG = {
  frameCount: 4,      // 动画帧数
  spriteSize: 256,     // Sprite 图片分辨率
  characterSize: 128,  // 角色显示尺寸
  animationSpeed: 300, // 动画间隔(ms)
};

// Agent 动画帧类型
export interface AgentSprite {
  agentId: string;
  frames: string[];      // idle 动画帧
  walkFrames?: string[]; // 行走动画帧
}

// 预生成的 Sprite 缓存
let spriteCache: Map<string, AgentSprite> | null = null;

export function getSpriteCache(): Map<string, AgentSprite> {
  if (!spriteCache) {
    // 懒加载，在需要时生成
    import('./agentSprites').then(module => {
      spriteCache = module.getSpriteCache();
    });
  }
  return spriteCache || new Map();
}

// ==================== 辅助函数 ====================

export function getAgentConfig(agentId: string): AgentConfig {
  return AGENT_ASSETS[agentId] || AGENT_ASSETS['main'];
}

export function getAgentColors(agentId: string) {
  const config = getAgentConfig(agentId);
  return {
    clothes: config.clothes,
    accent: config.accent,
    hair: config.hair,
  };
}
