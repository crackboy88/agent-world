/**
 * Map types - Simple flat map, no predefined locations
 */

export type MapId = string;

export interface MapItem {
  id: MapId;
  name: string;
}

// Empty flat map - all positions are free
export const DEFAULT_MAP: MapItem[] = [];

export function getMapItemById(id: string): MapItem | undefined {
  return DEFAULT_MAP.find(item => item.id === id);
}

export function getAllMapItems(): MapItem[] {
  return DEFAULT_MAP;
}
