/**
 * Config loader - loads map and agent configs from local or defaults
 */

import { DEFAULT_MAP_ITEMS, type MapItem, type ItemType } from './map';
import { DEFAULT_AGENT_APPEARANCES, type AgentAppearance } from './agent';

// Map items
let localMapItems: MapItem[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localModule = require('./map.local');
  if (localModule && localModule.LOCAL_MAP_ITEMS) {
    localMapItems = localModule.LOCAL_MAP_ITEMS;
  }
} catch {
  // local config not found
}

export function getMapItems(): MapItem[] {
  return localMapItems.length > 0 ? localMapItems : DEFAULT_MAP_ITEMS;
}

// Agent appearances
let localAgentAppearances: AgentAppearance[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const localModule = require('./agent.local');
  if (localModule && localModule.LOCAL_AGENT_APPEARANCES) {
    localAgentAppearances = localModule.LOCAL_AGENT_APPEARANCES;
  }
} catch {
  // local config not found
}

export function getAgentAppearance(agentId: string): AgentAppearance | undefined {
  return localAgentAppearances.find(a => a.id === agentId);
}

export function getAllAgentAppearances(): AgentAppearance[] {
  return localAgentAppearances.length > 0 ? localAgentAppearances : DEFAULT_AGENT_APPEARANCES;
}

export type { MapItem, ItemType, AgentAppearance };
