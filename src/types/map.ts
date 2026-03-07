/**
 * Map types - Simple flat map, no predefined rooms/locations
 */

export type MapId = string;
export type RoomId = MapId; // Alias for backward compatibility

export interface MapItem {
  id: MapId;
  name: string;
}

// Backward compatibility alias
export type Room = MapItem;

// Empty flat map - all positions are free
export const DEFAULT_MAP: MapItem[] = [];
export const DEFAULT_ROOMS: MapItem[] = []; // Alias

export function getMapItemById(id: string): MapItem | undefined {
  return DEFAULT_MAP.find(item => item.id === id);
}

// Backward compatibility
export function getRoomById(id: string): MapItem | undefined {
  return getMapItemById(id);
}

export function getAllMapItems(): MapItem[] {
  return DEFAULT_MAP;
}

export function getAllRoomConfigs(): MapItem[] {
  return DEFAULT_ROOMS;
}

export function getAllRoomConfigsSync(): MapItem[] {
  return DEFAULT_ROOMS;
}
