/**
 * Agent 列表组件
 */

import React from 'react';

interface Agent {
  id: string;
  name: string;
  isOnline: boolean;
  state: string;
}

interface AgentListProps {
  agents: Agent[];
}

export const AgentList: React.FC<AgentListProps> = ({ agents }) => {
  return (
    <div className="agent-list">
      {agents.map(agent => (
        <div key={agent.id} className={`agent-item ${agent.isOnline ? 'online' : 'offline'}`}>
          <div className="agent-avatar">
            {agent.isOnline && <span className="online-dot"></span>}
          </div>
          <div className="agent-info">
            <div className="agent-name">{agent.name}</div>
            <div className="agent-state">{agent.state}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AgentList;
