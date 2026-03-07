/**
 * Map Configuration Example
 * 
 * Copy this file to map.local.ts and customize your map:
 * cp config/map.local.example.ts config/map.local.ts
 */

import type { MapItem } from './map';

export const LOCAL_MAP_ITEMS: MapItem[] = [
  // Plants
  { id: 'plant-1', type: 'plant', name: 'Plant 1', position: { x: 100, y: 100 } },
  { id: 'plant-2', type: 'plant', name: 'Plant 2', position: { x: 900, y: 100 } },
  
  // Tables
  { id: 'table-1', type: 'table', name: 'Meeting Table', position: { x: 512, y: 512 } },
  
  // Chairs
  { id: 'chair-1', type: 'chair', name: 'Chair 1', position: { x: 450, y: 480 } },
  { id: 'chair-2', type: 'chair', name: 'Chair 2', position: { x: 574, y: 480 } },
  
  // Desks
  { id: 'desk-1', type: 'desk', name: 'Work Desk', position: { x: 200, y: 300 } },
  { id: 'desk-2', type: 'desk', name: 'Work Desk', position: { x: 800, y: 300 } },
  
  // Cabinets
  { id: 'cabinet-1', type: 'cabinet', name: 'Storage', position: { x: 100, y: 800 } },
];
