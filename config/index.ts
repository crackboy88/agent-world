/**
 * Config loader - loads map items from local config or defaults
 */

import { DEFAULT_MAP_ITEMS, type MapItem } from './map';

// Try to load local config
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

export type { MapItem, ItemType } from './map';
