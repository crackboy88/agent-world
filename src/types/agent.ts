/**
 * Agent类型定义
 * Agent World - Agent Types
 */

import type { RoomId } from './map';

// Agent ID类型 - 通用字符串类型
export type AgentId = string;

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
  nameZh?: string;  // 可选的中文名
  nameEn?: string;  // 可选的英文名
  emoji?: string;
  skillTag?: SkillTag;  // 可选的技能标签
  currentRoom: RoomId;
  position: Position;
  targetPosition?: Position;
  state: AgentState;
  mood: AgentMood;
  progress?: number;
  isOnline: boolean;
  animation: AnimationType;
  direction?: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
}

// Agent移动到指定房间
export function moveAgentToRoom(agent: Agent, roomId: RoomId, rooms: { id: RoomId; position: { x: number; y: number }; width: number; height: number }[]): Agent {
  const room = rooms.find(r => r.id === roomId);
  if (!room) return agent;
  
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
export function getAgentDisplayName(agent: Agent, locale: 'zh' | 'en' = 'en'): string {
  if (locale === 'zh' && agent.nameZh) return agent.nameZh;
  if (locale === 'en' && agent.nameEn) return agent.nameEn;
  return agent.name;
}
