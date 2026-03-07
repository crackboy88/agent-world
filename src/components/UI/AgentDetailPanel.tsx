/**
 * Agent 详细信息面板
 * Chen Company Agent World - Agent Detail Panel
 */

import React from 'react';
import type { Agent } from '../../types';

interface AgentDetailPanelProps {
  agent: Agent | null;
  onClose: () => void;
  locale: 'zh' | 'en';
}

const AgentDetailPanel: React.FC<AgentDetailPanelProps> = ({ agent, onClose, locale }) => {
  if (!agent) return null;

  const getStatusColor = () => {
    switch (agent.state) {
      case 'working': return '#10B981';
      case 'thinking': return '#8B5CF6';
      case 'chatting': return '#3B82F6';
      case 'busy': return '#F59E0B';
      case 'offline': return '#9CA3AF';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    const statusMap = {
      'idle': locale === 'zh' ? '空闲' : 'Idle',
      'working': locale === 'zh' ? '工作中' : 'Working',
      'thinking': locale === 'zh' ? '思考中' : 'Thinking',
      'chatting': locale === 'zh' ? '对话中' : 'Chatting',
      'busy': locale === 'zh' ? '忙碌' : 'Busy',
      'offline': locale === 'zh' ? '离线' : 'Offline'
    };
    return statusMap[agent.state] || agent.state;
  };

  return (
    <div className="agent-detail-panel visible">
      <div className="agent-detail-header" style={{ backgroundColor: getStatusColor() }}>
        <div className="agent-avatar-large">{agent.skillTag?.icon}</div>
        <div className="agent-name-large">
          {locale === 'zh' ? agent.nameZh : agent.nameEn}
        </div>
        <div className="agent-role-large">
          {agent.skillTag?.icon} {locale === 'zh' ? agent.skillTag?.labelZh : agent.skillTag?.labelEn}
        </div>
      </div>

      <div className="agent-detail-body">
        <div className="agent-stat-item">
          <span className="agent-stat-label">
            {locale === 'zh' ? '状态' : 'Status'}
          </span>
          <span className="agent-stat-value" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </span>
        </div>

        <div className="agent-stat-item">
          <span className="agent-stat-label">
            {locale === 'zh' ? '当前房间' : 'Current Room'}
          </span>
          <span className="agent-stat-value">
            {agent.currentLocation}
          </span>
        </div>

        <div className="agent-stat-item">
          <span className="agent-stat-label">
            {locale === 'zh' ? '在线状态' : 'Online'}
          </span>
          <span className="agent-stat-value" style={{ 
            color: agent.isOnline ? '#10B981' : '#EF4444' 
          }}>
            {agent.isOnline ? (locale === 'zh' ? '在线' : 'Online') : (locale === 'zh' ? '离线' : 'Offline')}
          </span>
        </div>

        {agent.progress !== undefined && agent.progress > 0 && (
          <div className="agent-stat-item">
            <span className="agent-stat-label">
              {locale === 'zh' ? '任务进度' : 'Task Progress'}
            </span>
            <span className="agent-stat-value">
              {agent.progress}%
            </span>
          </div>
        )}

        <div className="agent-stat-item">
          <span className="agent-stat-label">
            {locale === 'zh' ? '今日任务' : 'Today\'s Tasks'}
          </span>
          <span className="agent-stat-value">
            {Math.floor(Math.random() * 5) + 1}
          </span>
        </div>

        <div className="agent-stat-item">
          <span className="agent-stat-label">
            {locale === 'zh' ? '完成率' : 'Completion Rate'}
          </span>
          <span className="agent-stat-value">
            {Math.floor(Math.random() * 30) + 70}%
          </span>
        </div>
      </div>

      <div className="agent-tasks-section">
        <div className="agent-tasks-title">
          📋 {locale === 'zh' ? '最近任务' : 'Recent Tasks'}
        </div>
        
        <div className="task-item">
          <span>🔍</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px' }}>
              {locale === 'zh' ? '搜索技术资料' : 'Search Tech Resources'}
            </div>
            <div className="task-progress-bar">
              <div className="task-progress-fill" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        <div className="task-item">
          <span>📝</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px' }}>
              {locale === 'zh' ? '撰写周报' : 'Write Weekly Report'}
            </div>
            <div className="task-progress-bar">
              <div className="task-progress-fill" style={{ width: '100%', backgroundColor: '#10B981' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px', borderTop: '2px solid var(--border)' }}>
        <button 
          className="btn-submit" 
          style={{ width: '100%' }}
          onClick={onClose}
        >
          {locale === 'zh' ? '关闭面板' : 'Close Panel'}
        </button>
      </div>
    </div>
  );
};

export default AgentDetailPanel;
