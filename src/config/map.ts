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

// Map item type to model file mapping
export const ITEM_MODEL_MAP: Record<ItemType, string> = {
  plant: '/assets/models/plant-small.glb',
  table: '/assets/models/table.glb',
  chair: '/assets/models/chair.glb',
  desk: '/assets/models/desk.glb',
  cabinet: '/assets/models/cabinet.glb',
  other: '/assets/models/table.glb', // fallback
};

/**
 * Get model URL for an item type
 */
export function getModelUrl(type: ItemType): string {
  return ITEM_MODEL_MAP[type] || '/assets/models/table.glb';
}

/**
 * Default map items - sample items for demo
 */
export const DEFAULT_MAP_ITEMS: MapItem[] = [
  // Plants
  { id: 'plant-1', type: 'plant', name: 'Plant 1', position: { x: 200, y: 200 }, color: '#4CAF50' },
  { id: 'plant-2', type: 'plant', name: 'Plant 2', position: { x: 800, y: 200 }, color: '#4CAF50' },
  { id: 'plant-3', type: 'plant', name: 'Plant 3', position: { x: 200, y: 800 }, color: '#4CAF50' },
  
  // Tables
  { id: 'table-1', type: 'table', name: 'Meeting Table', position: { x: 512, y: 512 }, color: '#5D4037' },
  
  // Chairs around the table
  { id: 'chair-1', type: 'chair', name: 'Chair 1', position: { x: 450, y: 460 }, rotation: 0, color: '#1565C0' },
  { id: 'chair-2', type: 'chair', name: 'Chair 2', position: { x: 574, y: 460 }, rotation: Math.PI, color: '#1565C0' },
  { id: 'chair-3', type: 'chair', name: 'Chair 3', position: { x: 450, y: 564 }, rotation: 0, color: '#1565C0' },
  { id: 'chair-4', type: 'chair', name: 'Chair 4', position: { x: 574, y: 564 }, rotation: Math.PI, color: '#1565C0' },
  
  // Desks
  { id: 'desk-1', type: 'desk', name: 'Work Desk 1', position: { x: 200, y: 400 }, color: '#795548' },
  { id: 'desk-2', type: 'desk', name: 'Work Desk 2', position: { x: 800, y: 400 }, color: '#795548' },
  
  // Cabinets
  { id: 'cabinet-1', type: 'cabinet', name: 'Storage Cabinet', position: { x: 100, y: 700 }, color: '#8D6E63' },
];

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
