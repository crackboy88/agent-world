/**
 * Agent Appearance Settings Component
 */
import { useState } from 'react';
import { useAppStore } from '../../stores';
import { getAssetsByCategory } from '../../config';
import type { Asset } from '../../config';

export const AgentAppearanceSettings = () => {
  const { agents, updateAgentAppearance } = useAppStore();
  const agentModels = getAssetsByCategory('agent');
  
  // 本地状态存储用户选择（保存到 localStorage）
  const [appearances, setAppearances] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('agent-appearances');
    return saved ? JSON.parse(saved) : {};
  });
  
  const handleModelChange = (agentId: string, modelId: string) => {
    const newAppearances = { ...appearances, [agentId]: modelId };
    setAppearances(newAppearances);
    localStorage.setItem('agent-appearances', JSON.stringify(newAppearances));
    
    // 更新 store
    const asset = agentModels.find(a => a.id === modelId);
    if (asset) {
      updateAgentAppearance(agentId, { modelId: asset.id, modelUrl: `/assets/${asset.filename}` });
    }
  };
  
  if (agents.length === 0) {
    return (
      <div className="agent-appearance-settings">
        <h3>🎨 Agent Appearance</h3>
        <p className="text-gray-500 text-sm">No agents connected</p>
      </div>
    );
  }
  
  return (
    <div className="agent-appearance-settings p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">🎨 Agent Appearance</h3>
      
      <div className="space-y-4">
        {agents.map(agent => (
          <div key={agent.id} className="border rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{agent.name}</span>
              <span className="text-xs text-gray-500">{agent.id}</span>
            </div>
            
            <div>
              <label className="text-sm text-gray-600 block mb-1">Model:</label>
              <select
                value={appearances[agent.id] || ''}
                onChange={(e) => handleModelChange(agent.id, e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select model...</option>
                {agentModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentAppearanceSettings;
