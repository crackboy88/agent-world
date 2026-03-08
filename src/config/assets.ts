// Dynamically get all available agent models
export function getAvailableAgentModels() {
  const models = import.meta.glob('/assets/agents/*.glb', { eager: true });
  return Object.keys(models).map(path => {
    const filename = path.split('/').pop() || 'unknown';
    const name = filename.replace('.glb', '');
    return {
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      filename: filename,
      path: path
    };
  });
}

// Get all available map item models
export function getAvailableMapModels() {
  const models = import.meta.glob('/assets/models/*.glb', { eager: true });
  return Object.keys(models).map(path => {
    const filename = path.split('/').pop() || 'unknown';
    const name = filename.replace('.glb', '');
    return {
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      filename: filename,
      path: path
    };
  });
}

// Get assets by category (for backward compatibility)
export function getAssetsByCategory(category: 'agent' | 'map') {
  if (category === 'agent') {
    return getAvailableAgentModels();
  } else {
    return getAvailableMapModels();
  }
}
