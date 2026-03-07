/**
 * Agent types - Agent World
 */

import type { MapId } from './map';

// Agent ID type
export type AgentId = string;

// Agent state
export type AgentState = 
  | 'idle'
  | 'working'
  | 'busy'
  | 'thinking'
  | 'chatting'
  | 'offline';

// Agent mood
export type AgentMood = 
  | 'positive'
  | 'neutral'
  | 'negative';

// Animation type
export type AnimationType = 
  | 'idle'
  | 'walk'
  | 'work'
  | 'think';

// Position
export interface Position {
  x: number;
  y: number;
}

// Agent interface
export interface Agent {
  id: AgentId;
  name: string;
  nameZh?: string;
  nameEn?: string;
  emoji?: string;
  skillTag?: { icon: string; labelZh: string; labelEn: string };
  currentLocation: MapId;
  position: Position;
  targetPosition?: Position;
  state: AgentState;
  mood: AgentMood;
  progress?: number;
  isOnline: boolean;
  animation: AnimationType;
  direction?: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
}

// Move agent to location
export function moveAgentToLocation(agent: Agent, locationId: MapId): Agent {
  return {
    ...agent,
    currentLocation: locationId,
    animation: 'walk'
  };
}

// Get agent display name
export function getAgentDisplayName(agent: Agent, locale: 'zh' | 'en' = 'en'): string {
  if (locale === 'zh' && agent.nameZh) return agent.nameZh;
  if (locale === 'en' && agent.nameEn) return agent.nameEn;
  return agent.name;
}
