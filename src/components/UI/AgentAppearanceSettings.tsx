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
      
      {/* Step 2: Select Model */}
      {selectedAgentId && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">2. Select Model:</label>
          {agentModels.length > 0 ? (
            <>
              <select
                value={currentAppearance?.modelId || ''}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full p-2 border rounded bg-white"
              >
                {agentModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              
              {currentAppearance?.modelId && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Applied: {agentModels.find(m => m.id === currentAppearance?.modelId)?.name}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">No models available in /assets/agents/</div>
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
