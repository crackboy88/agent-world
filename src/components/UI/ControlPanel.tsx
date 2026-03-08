/**
 * 控制面板组件
 * Chen Company Agent World - Control Panel UI
 * 
 * 功能:
 * - 显示 Gateway 连接状态
 * - 显示 Agent 列表 (名称、在线状态)
 * - 提供"发送任务"表单
 * - 显示任务执行结果/日志
 */

import React, { useState } from 'react';
import { useAppStore } from '../../stores';
import type { Task, AgentId } from '../../types';

interface ControlPanelProps {
  locale?: 'zh' | 'en';
}

const ControlPanel: React.FC<ControlPanelProps> = ({ locale = 'zh' }) => {
  const {
    agents,
    tasks,
    gatewayConnected,
    gatewayUrl,
    connectGateway,
    disconnectGateway,
    assignTask,
    addLog
  } = useAppStore();

  // 表单状态
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [taskContent, setTaskContent] = useState<string>('');
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [tempGatewayUrl, setTempGatewayUrl] = useState(gatewayUrl || 'ws://localhost:18789');

  // 任务类型选项
  const taskTypes = [
    { value: 'research', labelZh: '研究任务', labelEn: 'Research Task' },
    { value: 'code', labelZh: '编码任务', labelEn: 'Code Task' },
    { value: 'analysis', labelZh: '分析任务', labelEn: 'Analysis Task' },
    { value: 'communication', labelZh: '沟通任务', labelEn: 'Communication Task' },
  ];

  const [selectedTaskType, setSelectedTaskType] = useState<string>('research');

  // 处理发送任务
  const handleSendTask = () => {
    if (!selectedAgentId || !taskContent.trim()) {
      addLog({
        type: 'warning',
        message: locale === 'zh' ? 'Select an agent' : 'Select an agent'
      });
      return;
    }

    // 分配任务
    assignTask(selectedAgentId as AgentId, selectedTaskType as Task['type']);
    
    // 添加日志
    const agent = agents.find(a => a.id === selectedAgentId);
    addLog({
      type: 'info',
      message: locale === 'zh' 
        ? `已向 ${agent?.nameZh || selectedAgentId} 发送任务: ${taskContent}`
        : `Sent task to ${agent?.nameEn || selectedAgentId}: ${taskContent}`
    });

    // 清空表单
    setTaskContent('');
    setSelectedAgentId('');
  };

  // 处理 Gateway 连接
  const handleGatewayToggle = () => {
    if (gatewayConnected) {
      disconnectGateway();
      addLog({
        type: 'info',
        message: locale === 'zh' ? 'Disconnected' : 'Disconnected'
      });
    } else {
      connectGateway(tempGatewayUrl);
      setShowGatewayModal(false);
      addLog({
        type: 'info',
        message: locale === 'zh' ? 'Connecting...' : 'Connecting...'
      });
    }
  };

  // 获取在线 Agent 列表
  const onlineAgents = agents.filter(a => a.isOnline);

  // 获取当前 Agent 的任务
  const getAgentTasks = (agentId: string) => {
    return tasks.filter(t => t.assignee === agentId);
  };

  // 获取状态颜色
  const getStatusColor = (state: string) => {
    switch (state) {
      case 'working': return '#10B981';
      case 'thinking': return '#8B5CF6';
      case 'chatting': return '#3B82F6';
      case 'busy': return '#F59E0B';
      case 'offline': return '#9CA3AF';
      default: return '#6B7280';
    }
  };

  // 获取状态文本
  const getStatusText = (state: string) => {
    const statusMap: Record<string, { zh: string; en: string }> = {
      'idle': { zh: '空闲', en: 'Idle' },
      'working': { zh: '工作中', en: 'Working' },
      'thinking': { zh: '思考中', en: 'Thinking' },
      'chatting': { zh: '对话中', en: 'Chatting' },
      'busy': { zh: '忙碌', en: 'Busy' },
      'offline': { zh: '离线', en: 'Offline' }
    };
    return statusMap[state]?.[locale] || state;
  };

  return (
    <div className="control-panel">
      {/* Gateway 状态 */}
      <div className="control-section gateway-status">
        <div className="section-header">
          <h4>🔗 Gateway</h4>
          <span className={`status-badge ${gatewayConnected ? 'connected' : 'disconnected'}`}>
            {gatewayConnected ? (locale === 'zh' ? 'Connected' : 'Connected') : (locale === 'zh' ? 'Disconnected' : 'Disconnected')}
          </span>
        </div>
        <div className="gateway-info">
          <span className="gateway-url">{gatewayUrl || '-'}</span>
          <button 
            className={`gateway-btn ${gatewayConnected ? 'connected' : ''}`}
            onClick={() => gatewayConnected ? handleGatewayToggle() : setShowGatewayModal(!showGatewayModal)}
          >
            {gatewayConnected ? (locale === 'zh' ? 'Disconnect' : 'Disconnect') : (locale === 'zh' ? 'Connect' : 'Connect')}
          </button>
        </div>
        
        {showGatewayModal && (
          <div className="gateway-input-group">
            <input
              type="text"
              value={tempGatewayUrl}
              onChange={(e) => setTempGatewayUrl(e.target.value)}
              placeholder="ws://localhost:18789"
            />
            <button onClick={handleGatewayToggle}>{locale === 'zh' ? 'Confirm' : 'Confirm'}</button>
          </div>
        )}
      </div>

      {/* Agent 列表 */}
      <div className="control-section">
        <div className="section-header">
          <h4>🤖 Agents</h4>
          <span className="agent-count">{onlineAgents.length}/{agents.length}</span>
        </div>
        <div className="agent-list-panel">
          {agents.map(agent => {
            const agentTasks = getAgentTasks(agent.id);
            const runningTask = agentTasks.find(t => t.status === 'running');
            
            return (
              <div 
                key={agent.id} 
                className={`agent-card ${agent.isOnline ? 'online' : 'offline'} ${selectedAgentId === agent.id ? 'selected' : ''}`}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <div className="agent-card-header">
                  <div className="agent-avatar-small">
                    {agent.skillTag?.icon || '🤖'}
                    {agent.isOnline && <span className="online-indicator"></span>}
                  </div>
                  <div className="agent-card-info">
                    <span className="agent-card-name">
                      {locale === 'zh' ? agent.nameZh : agent.nameEn}
                    </span>
                    <span 
                      className="agent-card-state"
                      style={{ color: getStatusColor(agent.state) }}
                    >
                      {getStatusText(agent.state)}
                    </span>
                  </div>
                </div>
                
                {runningTask && (
                  <div className="agent-task-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${runningTask.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{runningTask.progress}%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 发送任务表单 */}
      <div className="control-section task-form">
        <div className="section-header">
          <h4>📤 {locale === 'zh' ? '发送任务' : 'Send Task'}</h4>
        </div>
        
        <div className="form-group">
          <label>{locale === 'zh' ? '选择 Agent' : 'Select Agent'}</label>
          <select 
            value={selectedAgentId} 
            onChange={(e) => setSelectedAgentId(e.target.value)}
          >
            <option value="">
              {locale === 'zh' ? '-- 选择 Agent --' : '-- Select Agent --'}
            </option>
            {onlineAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {locale === 'zh' ? agent.nameZh : agent.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{locale === 'zh' ? '任务类型' : 'Task Type'}</label>
          <select 
            value={selectedTaskType} 
            onChange={(e) => setSelectedTaskType(e.target.value)}
          >
            {taskTypes.map(type => (
              <option key={type.value} value={type.value}>
                {locale === 'zh' ? type.labelZh : type.labelEn}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>{locale === 'zh' ? '任务内容' : 'Task Content'}</label>
          <textarea
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
            placeholder={locale === 'zh' ? '输入任务描述...' : 'Enter task description...'}
            rows={3}
          />
        </div>

        <button 
          className="btn-submit"
          onClick={handleSendTask}
          disabled={!selectedAgentId || !taskContent.trim()}
        >
          {locale === 'zh' ? '发送任务' : 'Send Task'}
        </button>
      </div>

      {/* 任务日志 */}
      <div className="control-section task-logs">
        <div className="section-header">
          <h4>📋 {locale === 'zh' ? '任务日志' : 'Task Logs'}</h4>
          <span className="log-count">{tasks.length}</span>
        </div>
        
        <div className="task-logs-list">
          {tasks.length === 0 ? (
            <div className="empty-logs">
              {locale === 'zh' ? '暂无任务日志' : 'No task logs yet'}
            </div>
          ) : (
            tasks.slice().reverse().slice(0, 10).map(task => (
              <div key={task.id} className={`log-item ${task.status}`}>
                <div className="log-item-header">
                  <span className="log-task-title">
                    {locale === 'zh' ? task.titleZh : task.titleEn}
                  </span>
                  <span className={`log-task-status ${task.status}`}>
                    {task.status}
                  </span>
                </div>
                <div className="log-task-meta">
                  <span>{task.assignee}</span>
                  <span>{task.progress}%</span>
                </div>
                {task.status === 'running' && (
                  <div className="log-progress-bar">
                    <div 
                      className="log-progress-fill" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
