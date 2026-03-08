// Dynamically get all available agent models
// Note: import.meta.glob is a build-time feature, so we return known models
// In production, this would be generated at build time
export function getAvailableAgentModels() {
  // Return known models - in a real app this would be generated at build time
  return [
    { id: 'mixamo', name: 'Mixamo', filename: 'mixamo.glb', path: '/assets/agents/mixamo.glb' }
  ];
}

// Get all available map item models
export function getAvailableMapModels() {
  return [
    { id: 'table', name: 'Table', filename: 'table.glb', path: '/assets/models/table.glb' },
    { id: 'chair', name: 'Chair', filename: 'chair.glb', path: '/assets/models/chair.glb' },
    { id: 'desk', name: 'Desk', filename: 'desk.glb', path: '/assets/models/desk.glb' },
    { id: 'cabinet', name: 'Cabinet', filename: 'cabinet.glb', path: '/assets/models/cabinet.glb' },
    { id: 'plant-small', name: 'Plant Small', filename: 'plant-small.glb', path: '/assets/models/plant-small.glb' },
    { id: 'plant-large', name: 'Plant Large', filename: 'plant-large.glb', path: '/assets/models/plant-large.glb' },
  ];
}

// Get assets by category (for backward compatibility)
export function getAssetsByCategory(category: 'agent' | 'map') {
  if (category === 'agent') {
    return getAvailableAgentModels();
  } else {
    return getAvailableMapModels();
  }
}
