/**
 * Agent类型定义
 * Chen Company Agent World - Agent Types
 */

import type { RoomId } from './room';

// Agent ID类型
export type AgentId = 
  | 'main'
  | 'code-expert'
  | 'financial-analyst'
  | 'materials-scientist'
  | 'political-analyst'
  | 'zhihu';

// Agent状态类型
export type AgentState = 
  | 'idle'        // 空闲
  | 'working'     // 工作/忙碌
  | 'busy'        // 忙碌中
  | 'thinking'    // 思考/等待
  | 'chatting'    // 对话中
  | 'offline';    // 离线

// Agent情绪类型
export type AgentMood = 
  | 'positive'    // 积极
  | 'neutral'     // 中性
  | 'negative';   // 消极

// 动画类型
export type AnimationType = 
  | 'idle'        // 站立待机
  | 'walk'        // 行走
  | 'work'        // 工作
  | 'think';      // 思考

// 位置
export interface Position {
  x: number;
  y: number;
}

// 技能标签
export interface SkillTag {
  icon: string;   // Emoji图标
  labelZh: string; // 中文标签
  labelEn: string; // 英文标签
}

// Agent接口
export interface Agent {
  id: AgentId;
  name: string;
  nameZh: string;
  nameEn: string;
  skillTag: SkillTag;
  currentRoom: RoomId;
  position: Position;
  targetPosition?: Position; // 移动目标位置
  state: AgentState;
  mood: AgentMood;
  progress?: number; // 任务进度 0-100
  isOnline: boolean;
  animation: AnimationType;
  direction?: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
}

// 技能标签配置
export const SKILL_TAGS: Record<AgentId, SkillTag> = {
  'main': { icon: '📋', labelZh: '全局管理', labelEn: 'Global Management' },
  'code-expert': { icon: '💻', labelZh: '技术开发', labelEn: 'Tech Development' },
  'financial-analyst': { icon: '📊', labelZh: '财务分析', labelEn: 'Financial Analysis' },
  'materials-scientist': { icon: '🔬', labelZh: '材料研发', labelEn: 'Materials R&D' },
  'political-analyst': { icon: '📈', labelZh: '战略分析', labelEn: 'Strategy Analysis' },
  'zhihu': { icon: '✍️', labelZh: '内容运营', labelEn: 'Content Operations' }
};

// 初始Agent配置常量
export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'main',
    name: 'CEO',
    nameZh: '首席执行官',
    nameEn: 'CEO',
    skillTag: SKILL_TAGS['main'],
    currentRoom: 'lobby', // 新Agent出生点
    position: { x: 1200, y: 1300 },
    state: 'idle',
    mood: 'neutral',
    isOnline: true,
    animation: 'idle'
  },
  {
    id: 'code-expert',
    name: '技术总监',
    nameZh: '技术总监',
    nameEn: 'Tech Lead',
    skillTag: SKILL_TAGS['code-expert'],
    currentRoom: 'lobby',
    position: { x: 1250, y: 1350 },
    state: 'idle',
    mood: 'neutral',
    isOnline: true,
    animation: 'idle'
  },
  {
    id: 'financial-analyst',
    name: '财务总监',
    nameZh: '财务总监',
    nameEn: 'Finance Lead',
    skillTag: SKILL_TAGS['financial-analyst'],
    currentRoom: 'lobby',
    position: { x: 1300, y: 1300 },
    state: 'idle',
    mood: 'neutral',
    isOnline: true,
    animation: 'idle'
  },
  {
    id: 'materials-scientist',
    name: '研发总监',
    nameZh: '研发总监',
    nameEn: 'R&D Lead',
    skillTag: SKILL_TAGS['materials-scientist'],
    currentRoom: 'lobby',
    position: { x: 1350, y: 1350 },
    state: 'idle',
    mood: 'neutral',
    isOnline: true,
    animation: 'idle'
  },
  {
    id: 'political-analyst',
    name: '战略总监',
    nameZh: '战略总监',
    nameEn: 'Strategy Lead',
    skillTag: SKILL_TAGS['political-analyst'],
    currentRoom: 'lobby',
    position: { x: 1400, y: 1300 },
    state: 'idle',
    mood: 'neutral',
    isOnline: true,
    animation: 'idle'
  },
  {
    id: 'zhihu',
    name: '运营总监',
    nameZh: '运营总监',
    nameEn: 'Operations Lead',
    skillTag: SKILL_TAGS['zhihu'],
    currentRoom: 'lobby',
    position: { x: 1450, y: 1350 },
    state: 'idle',
    mood: 'neutral',
    isOnline: true,
    animation: 'idle'
  }
];

// Agent移动到指定房间
export function moveAgentToRoom(agent: Agent, roomId: RoomId, rooms: { id: RoomId; position: { x: number; y: number }; width: number; height: number }[]): Agent {
  const room = rooms.find(r => r.id === roomId);
  if (!room) return agent;
  
  // 计算房间中心位置作为目标
  const targetPosition = {
    x: room.position.x + room.width / 2,
    y: room.position.y + room.height / 2
  };
  
  return {
    ...agent,
    currentRoom: roomId,
    targetPosition,
    animation: 'walk'
  };
}

// 获取Agent显示名称
export function getAgentDisplayName(agent: Agent, locale: 'zh' | 'en' = 'zh'): string {
  return locale === 'zh' ? agent.nameZh : agent.nameEn;
}
