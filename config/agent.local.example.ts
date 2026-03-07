/**
 * Agent Appearance Configuration Example
 * 
 * Copy this file to agent.local.ts and customize:
 * cp config/agent.local.example.ts config/agent.local.ts
 */

import type { AgentAppearance } from './agent';

export const LOCAL_AGENT_APPEARANCES: AgentAppearance[] = [
  {
    id: 'main',
    name: 'Main Agent',
    skinColor: '#FCD34D',
    hairColor: '#1F2937',
    clothesColor: '#3B82F6',
    accentColor: '#F59E0B',
    accessory: '💼',
  },
  {
    id: 'code-expert',
    name: 'Tech Lead',
    skinColor: '#FCD34D',
    hairColor: '#374151',
    clothesColor: '#10B981',
    accentColor: '#06B6D4',
    accessory: '👓',
  },
];
