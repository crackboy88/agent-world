/**
 * Agent Sprite 图集生成器
 * 预生成所有 Agent 的动画帧为图片
 */

import { AGENT_ASSETS, PALETTE } from './agentAssets';

// 生成单个 Agent 的单个动画帧
function generateAgentFrame(
  agentId: string, 
  frame: number, 
  totalFrames: number,
  size: number = 64
): string {
  const config = AGENT_ASSETS[agentId] || AGENT_ASSETS['main'];
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // 缩放系数（保留以备将来使用）
  // const _s = size / 32;

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
  ctx.fillStyle = config.clothes;
  ctx.fillRect(size * 0.25, size * 0.32 + breathOffset, size * 0.5, size * 0.25);
  
  // 衣服条纹
  ctx.fillStyle = config.accent;
  ctx.fillRect(size * 0.25, size * 0.5 + breathOffset, size * 0.5, size * 0.06);

  // 头部
  ctx.fillStyle = PALETTE.skin;
  ctx.fillRect(size * 0.3, size * 0.15 + breathOffset, size * 0.4, size * 0.35);

  // 头发
  ctx.fillStyle = config.hair;
  ctx.fillRect(size * 0.28, size * 0.1 + breathOffset, size * 0.44, size * 0.12);

  // 眼睛
  ctx.fillStyle = '#1F2937';
  ctx.fillRect(size * 0.38, size * 0.28 + breathOffset, size * 0.08, size * 0.08);
  ctx.fillRect(size * 0.54, size * 0.28 + breathOffset, size * 0.08, size * 0.08);
  
  // 眼神高光
  ctx.fillStyle = '#FFF';
  ctx.fillRect(size * 0.4, size * 0.29 + breathOffset, size * 0.03, size * 0.03);
  ctx.fillRect(size * 0.56, size * 0.29 + breathOffset, size * 0.03, size * 0.03);

  // 嘴巴
  ctx.fillStyle = '#BE123C';
  ctx.beginPath();
  ctx.roundRect(size * 0.43, size * 0.38 + breathOffset, size * 0.14, size * 0.04, size * 0.02);
  ctx.fill();

  return canvas.toDataURL();
}

// Agent 动画配置
export interface AgentSprite {
  agentId: string;
  frames: string[];      // idle 动画帧
  walkFrames?: string[]; // 行走动画帧
}

// 生成所有 Agent 的 Sprite
export function generateAllSprites(): Map<string, AgentSprite> {
  const sprites = new Map<string, AgentSprite>();
  const frameCount = 4;
  const spriteSize = 256; // 提高分辨率

  Object.keys(AGENT_ASSETS).forEach(agentId => {
    // 生成 idle 动画帧
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

// 预生成并缓存
let spriteCache: Map<string, AgentSprite> | null = null;

export function getSpriteCache(): Map<string, AgentSprite> {
  if (!spriteCache) {
    spriteCache = generateAllSprites();
  }
  return spriteCache;
}

// 获取单个 Agent 的 Sprite
export function getAgentSprite(agentId: string): AgentSprite | undefined {
  return getSpriteCache().get(agentId);
}
