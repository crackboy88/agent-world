/**
 * Map Item Types
 */

export type ItemType = 'plant' | 'table' | 'chair' | 'cabinet' | 'desk' | 'other';

export interface MapItem {
  id: string;
  type: ItemType;
  name: string;
  position: { x: number; y: number };
  size?: { width: number; height: number; depth?: number };
  color?: string;
  rotation?: number;
}

/**
 * Default map items - empty
 * Users can configure their own map items in map.local.ts
 */
export const DEFAULT_MAP_ITEMS: MapItem[] = [];

/**
 * Available item templates for users to choose from
 */
export const ITEM_TEMPLATES: Record<ItemType, Omit<MapItem, 'id' | 'position'>> = {
  plant: {
    type: 'plant',
    name: 'Plant',
    size: { width: 0.8, height: 1.2, depth: 0.8 },
    color: '#4CAF50',
  },
  table: {
    type: 'table',
    name: 'Table',
    size: { width: 1.5, height: 0.75, depth: 0.8 },
    color: '#5D4037',
  },
  chair: {
    type: 'chair',
    name: 'Chair',
    size: { width: 0.5, height: 0.9, depth: 0.5 },
    color: '#1565C0',
  },
  cabinet: {
    type: 'cabinet',
    name: 'Cabinet',
    size: { width: 1, height: 1.5, depth: 0.5 },
    color: '#8D6E63',
  },
  desk: {
    type: 'desk',
    name: 'Desk',
    size: { width: 1.2, height: 0.75, depth: 0.6 },
    color: '#795548',
  },
  other: {
    type: 'other',
    name: 'Custom Item',
    size: { width: 1, height: 1, depth: 1 },
    color: '#9E9E9E',
  },
};
