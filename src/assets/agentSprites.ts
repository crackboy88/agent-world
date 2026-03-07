/**
 * Agent Sprite 图集生成器
 * 预生成所有 Agent 的动画帧为图片
 */

// 默认调色板
const DEFAULT_PALETTE = {
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

// 默认 Agent 颜色（用于未知 Agent）
const DEFAULT_AGENT_COLORS = {
  clothes: '#3B82F6',
  accent: '#F59E0B',
  hair: '#1F2937',
};

// 生成单个 Agent 的单个动画帧
function generateAgentFrame(
  agentId: string, 
  frame: number, 
  totalFrames: number,
  size: number = 64,
  colors?: { clothes?: string; accent?: string; hair?: string }
): string {
  const config = colors || DEFAULT_AGENT_COLORS;
  const PALETTE = DEFAULT_PALETTE;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // 呼吸动画偏移
  const breathOffset = Math.sin((frame / totalFrames) * Math.PI * 2) * 1;

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(size/2, size * 0.85, size * 0.15, size * 0.04, 0, 0, Math.PI * 2);
  ctx.fill();

  // 腿部
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(size * 0.35, size * 0.55, size * 0.12, size * 0.2);
  ctx.fillRect(size * 0.53, size * 0.55, size * 0.12, size * 0.2);
  
  // 鞋子
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.roundRect(size * 0.32, size * 0.72, size * 0.14, size * 0.08, size * 0.02);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(size * 0.54, size * 0.72, size * 0.14, size * 0.08, size * 0.02);
  ctx.fill();

  // 身体
  ctx.fillStyle = config.clothes || '#3B82F6';
  ctx.fillRect(size * 0.25, size * 0.32 + breathOffset, size * 0.5, size * 0.25);

  // 身体阴影
  ctx.fillStyle = config.clothes ? adjustColor(config.clothes, -20) : '#2563EB';
  ctx.fillRect(size * 0.25, size * 0.52 + breathOffset, size * 0.5, size * 0.06);

  // 头部
  ctx.fillStyle = PALETTE.skin;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.22, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // 头发
  ctx.fillStyle = config.hair || '#1F2937';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.18, size * 0.1, Math.PI, Math.PI * 2);
  ctx.fill();

  // 眼睛
  ctx.fillStyle = '#1F2937';
  ctx.beginPath();
  ctx.arc(size * 0.45, size * 0.22, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(size * 0.55, size * 0.22, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // 嘴巴
  ctx.fillStyle = '#E5B44D';
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.28, size * 0.025, 0, Math.PI);
  ctx.fill();

  return canvas.toDataURL();
}

// 调整颜色亮度
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Agent 动画帧类型
export interface AgentSprite {
  agentId: string;
  frames: string[];
}

// 生成所有 Agent 的 Sprite
export function generateAllSprites(agentList?: string[]): Map<string, AgentSprite> {
  const sprites = new Map<string, AgentSprite>();
  const frameCount = 4;
  const spriteSize = 256;
  
  const agents = agentList || ['default'];
  
  agents.forEach(agentId => {
    const frames: string[] = [];
    for (let i = 0; i < frameCount; i++) {
      frames.push(generateAgentFrame(agentId, i, frameCount, spriteSize));
    }
    
    sprites.set(agentId, {
      agentId,
      frames,
    });
  });
  
  return sprites;
}

// 获取 sprite 缓存
export function getSpriteCache(): Map<string, AgentSprite> {
  return generateAllSprites();
}

// 导出默认调色板供外部使用
export { DEFAULT_PALETTE };
