/**
 * 统一侧边栏组件
 * Chen Company Agent World - Unified Sidebar
 * 
 * 整合功能:
 * - Gateway 连接控制
 * - Agent 列表与对话
 * - 任务管理与创建
 * - 事件日志
 */

import React, { useState } from 'react';
import { useAppStore } from '../../stores';
import type { Task, AgentId, Agent } from '../../types';

interface SidebarProps {
  locale?: 'zh' | 'en';
}

// 功能区类型
type Section = 'gateway' | 'agents' | 'tasks' | 'events';

const Sidebar: React.FC<SidebarProps> = ({ locale = 'zh' }) => {
  const {
    agents,
    tasks,
    logs,
    gatewayConnected,
    gatewayUrl,
    connectGateway,
    disconnectGateway,
    assignTask,
    addLog
  } = useAppStore();

  const [activeSection, setActiveSection] = useState<Section>('agents');

  // 表单状态
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [tempGatewayUrl, setTempGatewayUrl] = useState(gatewayUrl || 'ws://localhost:18789');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [taskContent, setTaskContent] = useState<string>('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('research');

  // 对话状态
  const [chatMessages, setChatMessages] = useState<{ id: string; agentId: string; text: string; sender: 'user' | 'agent'; time: string }[]>([
    { id: '1', agentId: '', text: '你好！', sender: 'agent', time: '12:00' }
  ]);

  // 任务类型选项
  const taskTypes = [
    { value: 'research', labelZh: '研究任务', labelEn: 'Research' },
    { value: 'code', labelZh: '编码任务', labelEn: 'Code' },
    { value: 'analysis', labelZh: '分析任务', labelEn: 'Analysis' },
    { value: 'communication', labelZh: '沟通任务', labelEn: 'Comm' },
  ];

  // 功能区配置 (移除 Chat)
  const sections: { id: Section; icon: string; labelZh: string; labelEn: string }[] = [
    { id: 'gateway', icon: '🔗', labelZh: '连接', labelEn: 'Link' },
    { id: 'agents', icon: '🤖', labelZh: '智能体', labelEn: 'Agents' },
    { id: 'tasks', icon: '📋', labelZh: '任务', labelEn: 'Tasks' },
    { id: 'events', icon: '📜', labelZh: '日志', labelEn: 'Logs' },
  ];

  // 获取在线 Agent 列表
  const onlineAgents = agents.filter((a: Agent) => a.isOnline);

  // 获取当前选中的 Agent
  const selectedAgent = agents.find((a: Agent) => a.id === selectedAgentId);

  // 获取状态颜色
  const getStatusColor = (state: string) => {
    switch (state) {
      case 'working': return '#10B981';
      case 'thinking': return '#8B5CF6';
      case 'chatting': return '#3B82F6';
      case 'busy': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  // 获取状态文本
  const getStatusText = (state: string) => {
    const map: Record<string, { zh: string; en: string }> = {
      'idle': { zh: '空闲', en: 'Idle' },
      'working': { zh: '工作中', en: 'Working' },
      'thinking': { zh: '思考中', en: 'Thinking' },
      'chatting': { zh: '对话中', en: 'Chatting' },
      'busy': { zh: '忙碌', en: 'Busy' },
      'offline': { zh: '离线', en: 'Offline' }
    };
    return map[state]?.[locale] || state;
  };

  // 处理 Gateway 连接
  const handleGatewayToggle = () => {
    if (gatewayConnected) {
      disconnectGateway();
      addLog({ type: 'info', message: locale === 'zh' ? '已断开 Gateway 连接' : 'Disconnected' });
    } else {
      connectGateway(tempGatewayUrl);
      setShowGatewayModal(false);
      addLog({ type: 'info', message: locale === 'zh' ? '正在连接 Gateway...' : 'Connecting...' });
    }
  };

  // 发送任务
  const handleSendTask = () => {
    if (!selectedAgentId || !taskContent.trim()) return;
    assignTask(selectedAgentId as AgentId, selectedTaskType as Task['type']);
    const agent = agents.find((a: Agent) => a.id === selectedAgentId);
    addLog({
      type: 'info',
      message: locale === 'zh' 
        ? `📤 已向 ${agent?.nameZh || selectedAgentId} 发送任务`
        : `📤 Task sent to ${agent?.nameEn || selectedAgentId}`
    });
    setTaskContent('');
  };

  // 发送消息
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      agentId: selectedAgentId,
      text,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages([...chatMessages, newMsg]);
    
    // 模拟 Agent 回复
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        agentId: selectedAgentId,
        text: selectedAgent 
          ? (locale === 'zh' ? `收到消息: ${text}` : `Got it: ${text}`)
          : (locale === 'zh' ? '请先选择一个智能体' : 'Please select an agent first'),
        sender: 'agent' as const,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, reply]);
    }, 500);
  };

  // 处理 Agent 点击
  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId === selectedAgentId ? '' : agentId);
  };

  // ========== 渲染函数 ==========

  // Gateway 面板
  const renderGateway = () => (
    <div className="sidebar-section gateway-section">
      <div className="section-header">
        <h3>🔗 Gateway</h3>
        <span className={`status-badge ${gatewayConnected ? 'connected' : 'disconnected'}`}>
          {gatewayConnected ? (locale === 'zh' ? '已连接' : 'Connected') : (locale === 'zh' ? '未连接' : 'Disconnected')}
        </span>
      </div>
      
      <div className="gateway-info">
        <div className="info-row">
          <span className="label">{locale === 'zh' ? '地址' : 'URL'}:</span>
          <span className="value">{gatewayUrl || '-'}</span>
        </div>
        <div className="info-row">
          <span className="label">{locale === 'zh' ? '在线' : 'Online'}:</span>
          <span className="value">{onlineAgents.length}/{agents.length}</span>
        </div>
      </div>

      <button 
        className={`btn-primary ${gatewayConnected ? 'disconnect' : 'connect'}`}
        onClick={() => gatewayConnected ? handleGatewayToggle() : setShowGatewayModal(!showGatewayModal)}
      >
        {gatewayConnected 
          ? (locale === 'zh' ? '断开连接' : 'Disconnect')
          : (locale === 'zh' ? '连接' : 'Connect')}
      </button>

      {showGatewayModal && (
        <div className="gateway-input-group">
          <input
            type="text"
            value={tempGatewayUrl}
            onChange={(e) => setTempGatewayUrl(e.target.value)}
            placeholder="ws://localhost:18789"
          />
          <button onClick={handleGatewayToggle}>{locale === 'zh' ? '确认' : 'OK'}</button>
        </div>
      )}
    </div>
  );

  // Agents 面板 (包含对话功能)
  const renderAgents = () => (
    <div className="sidebar-section agents-section">
      <div className="section-header">
        <h3>🤖 {locale === 'zh' ? '智能体' : 'Agents'}</h3>
        <span className="badge">{onlineAgents.length}/{agents.length}</span>
      </div>

      <div className="agent-grid">
        {agents.map((agent: Agent) => (
          <div 
            key={agent.id} 
            className={`agent-card-mini ${agent.isOnline ? 'online' : 'offline'} ${selectedAgentId === agent.id ? 'selected' : ''}`}
            onClick={() => handleAgentClick(agent.id)}
          >
            <div className="agent-icon">{agent.skillTag?.icon || '🤖'}</div>
            <div className="agent-info">
              <span className="agent-name">
                {locale === 'zh' ? agent.nameZh : agent.nameEn}
              </span>
              <span 
                className="agent-state"
                style={{ color: getStatusColor(agent.state) }}
              >
                {getStatusText(agent.state)}
              </span>
            </div>
            <span className={`online-dot ${agent.isOnline ? 'active' : ''}`}></span>
          </div>
        ))}
      </div>

      {/* 对话区域 - 选中 Agent 后显示 */}
      {selectedAgent && (
        <div className="agent-chat">
          <div className="section-header">
            <h4>💬 {locale === 'zh' ? selectedAgent.nameZh : selectedAgent.nameEn}</h4>
            <button 
              className="btn-close"
              onClick={() => setSelectedAgentId('')}
            >✕</button>
          </div>
          
          <div className="chat-messages">
            {chatMessages
              .filter(m => m.agentId === selectedAgentId || m.agentId === '')
              .map(msg => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <span className="avatar">
                    {msg.sender === 'agent' ? (selectedAgent?.skillTag?.icon || '🤖') : '👤'}
                  </span>
                  <div className="content">
                    <span className="text">{msg.text}</span>
                    <span className="time">{msg.time}</span>
                  </div>
                </div>
              ))}
          </div>

          <div className="chat-input">
            <input 
              type="text" 
              placeholder={locale === 'zh' ? '发送消息...' : 'Type...'}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button onClick={(e) => {
              const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
              handleSendMessage(input.value);
              input.value = '';
            }}>➤</button>
          </div>
        </div>
      )}
    </div>
  );

  // Tasks 面板
  const renderTasks = () => (
    <div className="sidebar-section tasks-section">
      {/* 任务创建表单 */}
      <div className="task-create">
        <div className="section-header">
          <h3>📤 {locale === 'zh' ? '创建任务' : 'New Task'}</h3>
        </div>
        
        <div className="form-row">
          <select 
            value={selectedAgentId} 
            onChange={(e) => setSelectedAgentId(e.target.value)}
          >
            <option value="">
              {locale === 'zh' ? '-- 选择智能体 --' : '-- Select Agent --'}
            </option>
            {onlineAgents.map((agent: Agent) => (
              <option key={agent.id} value={agent.id}>
                {locale === 'zh' ? agent.nameZh : agent.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
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

        <div className="form-row">
          <textarea
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
            placeholder={locale === 'zh' ? '任务描述...' : 'Task description...'}
            rows={2}
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

      {/* 任务列表 */}
      <div className="task-list">
        <div className="section-header">
          <h3>📋 {locale === 'zh' ? '任务列表' : 'Task List'}</h3>
          <span className="badge">{tasks.length}</span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">{locale === 'zh' ? '暂无任务' : 'No tasks'}</div>
        ) : (
          tasks.slice().reverse().slice(0, 10).map((task: Task) => (
            <div key={task.id} className={`task-item ${task.status}`}>
              <div className="task-header">
                <span className="task-title">
                  {locale === 'zh' ? task.titleZh : task.titleEn}
                </span>
                <span className={`task-status ${task.status}`}>{task.status}</span>
              </div>
              <div className="task-meta">
                <span>👤 {task.assignee}</span>
                <span>{task.progress}%</span>
              </div>
              {task.status === 'running' && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Events 面板
  const renderEvents = () => {
    // 本地 LogEntry 类型
    interface LogEntry {
      id: string;
      message: string;
      timestamp: number;
      type: string;
    }
    
    return (
      <div className="sidebar-section events-section">
        <div className="section-header">
          <h3>📜 {locale === 'zh' ? '事件日志' : 'Event Logs'}</h3>
          <span className="badge">{logs.length}</span>
        </div>

        <div className="event-list">
          {logs.length === 0 ? (
            <div className="empty-state">{locale === 'zh' ? '等待事件...' : 'Waiting for events...'}</div>
          ) : (
            logs.slice().reverse().slice(0, 50).map((log: LogEntry) => (
              <div key={log.id} className={`event-item ${log.type}`}>
                <span className="event-message">{log.message}</span>
                <span className="event-time">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // 渲染当前面板
  const renderContent = () => {
    switch (activeSection) {
      case 'gateway': return renderGateway();
      case 'agents': return renderAgents();
      case 'tasks': return renderTasks();
      case 'events': return renderEvents();
      default: return null;
    }
  };

  return (
    <div className="unified-sidebar">
      {/* 导航栏 */}
      <nav className="sidebar-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            title={locale === 'zh' ? section.labelZh : section.labelEn}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{locale === 'zh' ? section.labelZh : section.labelEn}</span>
          </button>
        ))}
      </nav>

      {/* 内容区 */}
      <div className="sidebar-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;
