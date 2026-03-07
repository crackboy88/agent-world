/**
 * Agent Appearance Settings Component
 */
import { useState } from 'react';
import { useAppStore } from '../../stores';
import { getAssetsByCategory } from '../../config';

export const AgentAppearanceSettings = () => {
  const { agents, agentAppearances, updateAgentAppearance } = useAppStore();
  const agentModels = getAssetsByCategory('agent');
  
  // 当前选择的 agent
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  
  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  const currentAppearance = selectedAgentId ? agentAppearances[selectedAgentId] : null;
  
  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
  };
  
  const handleModelChange = (modelId: string) => {
    if (!selectedAgentId) return;
    
    const asset = agentModels.find(a => a.id === modelId);
    if (asset) {
      updateAgentAppearance(selectedAgentId, { 
        modelId: asset.id, 
        modelUrl: `/assets/${asset.filename}` 
      });
    }
  };
  
  return (
    <div className="agent-appearance-settings p-4">
      <h3 className="text-lg font-semibold mb-4">🎨 Agent Appearance</h3>
      
      {/* Step 1: Select Agent */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">1. Select Agent:</label>
        <select
          value={selectedAgentId}
          onChange={(e) => handleAgentChange(e.target.value)}
          className="w-full p-2 border rounded bg-white"
        >
          <option value="">-- Select Agent --</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>
              {agent.name} ({agent.id})
            </option>
          ))}
        </select>
      </div>
      
      {/* Step 2: Select Appearance */}
      {selectedAgentId && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">2. Select Model:</label>
          <div className="grid grid-cols-2 gap-2">
            {agentModels.map(model => (
              <button
                key={model.id}
                onClick={() => handleModelChange(model.id)}
                className={`p-3 border rounded text-sm transition-all ${
                  currentAppearance?.modelId === model.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{model.name}</div>
              </button>
            ))}
          </div>
          
          {currentAppearance?.modelId && (
            <div className="mt-2 text-sm text-green-600">
              ✓ Applied: {agentModels.find(m => m.id === currentAppearance?.modelId)?.name}
            </div>
          )}
        </div>
      )}
      
      {agents.length === 0 && (
        <p className="text-gray-500 text-sm">No agents connected</p>
      )}
    </div>
  );
};

export default AgentAppearanceSettings;
