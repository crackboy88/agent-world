/**
 * Asset Manifest - 素材清单
 * 
 * 用户可以添加自己的素材到 assets/ 文件夹
 * 素材类型：
 * - models/: 3D 模型 (.glb, .gltf)
 * - sprites/: 2D 精灵图 (.png, .jpg)
 * - textures/: 纹理贴图
 */

export type AssetType = 'model' | 'sprite' | 'texture';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  filename: string;  // 文件名
  category?: string;  // 分类: furniture, plant, character, etc.
  defaultConfig?: Record<string, unknown>; // 默认配置
}

/**
 * 默认素材清单 - 内置素材
 * 用户可以替换这些文件或添加新文件
 */
export const DEFAULT_ASSETS: Asset[] = [
  // Map Items - Furniture
  { id: 'table-1', name: 'Table', type: 'model', category: 'furniture', filename: 'models/table.glb' },
  { id: 'chair-1', name: 'Chair', type: 'model', category: 'furniture', filename: 'models/chair.glb' },
  { id: 'desk-1', name: 'Desk', type: 'model', category: 'furniture', filename: 'models/desk.glb' },
  { id: 'cabinet-1', name: 'Cabinet', type: 'model', category: 'furniture', filename: 'models/cabinet.glb' },
  
  // Map Items - Plants
  { id: 'plant-1', name: 'Small Plant', type: 'model', category: 'plant', filename: 'models/plant-small.glb' },
  { id: 'plant-2', name: 'Large Plant', type: 'model', category: 'plant', filename: 'models/plant-large.glb' },
  
  // Agent Sprites (2D)
  { id: 'agent-default', name: 'Default Agent', type: 'sprite', category: 'character', filename: 'sprites/agent-default.png' },
];

/**
 * 获取素材 URL
 */
export function getAssetUrl(asset: Asset): string {
  return `/assets/${asset.filename}`;
}

/**
 * 根据 ID 获取素材
 */
export function getAssetById(id: string): Asset | undefined {
  return DEFAULT_ASSETS.find(a => a.id === id);
}

/**
 * 根据分类获取素材
 */
export function getAssetsByCategory(category: string): Asset[] {
  return DEFAULT_ASSETS.filter(a => a.category === category);
}
