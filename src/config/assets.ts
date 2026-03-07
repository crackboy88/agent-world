/**
 * Asset Manifest - 素材清单
 * 
 * 用户可以添加自己的素材到 public/assets/ 文件夹
 */

export type AssetType = 'model' | 'sprite' | 'texture';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  filename: string;
  category?: string;
}

/**
 * 默认素材清单 - 内置素材
 */
export const DEFAULT_ASSETS: Asset[] = [
  // Map Items - Furniture
  { id: 'table', name: 'Table', type: 'model', category: 'furniture', filename: 'models/table.glb' },
  { id: 'chair', name: 'Chair', type: 'model', category: 'furniture', filename: 'models/chair.glb' },
  { id: 'desk', name: 'Desk', type: 'model', category: 'furniture', filename: 'models/desk.glb' },
  { id: 'cabinet', name: 'Cabinet', type: 'model', category: 'furniture', filename: 'models/cabinet.glb' },
  
  // Map Items - Plants
  { id: 'plant-small', name: 'Small Plant', type: 'model', category: 'plant', filename: 'models/plant-small.glb' },
  { id: 'plant-large', name: 'Large Plant', type: 'model', category: 'plant', filename: 'models/plant-large.glb' },
  
  // Agent Models (3D characters with animations)
  { id: 'agent-default', name: 'Simple Character', type: 'model', category: 'agent', filename: 'agents/agent-default.glb' },
  { id: 'agent-soldier', name: 'Soldier (Animated)', type: 'model', category: 'agent', filename: 'agents/soldier-animated.glb' },
  { id: 'agent-xbot', name: 'XBot (Animated)', type: 'model', category: 'agent', filename: 'agents/xbot.glb' },
  { id: 'agent-cesium', name: 'Cesium Man', type: 'model', category: 'agent', filename: 'agents/character1.glb' },
];

export function getAssetUrl(asset: Asset): string {
  return `/assets/${asset.filename}`;
}

export function getAssetById(id: string): Asset | undefined {
  return DEFAULT_ASSETS.find(a => a.id === id);
}

export function getAssetsByCategory(category: string): Asset[] {
  return DEFAULT_ASSETS.filter(a => a.category === category);
}
