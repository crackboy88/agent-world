/**
 * 统一侧边栏组件
 * Chen Company Agent World - Unified Sidebar
 * 
 * 设计理念: 对话与智能体不分离
 * - Agent 列表始终显示
 * - 选中 Agent 后，对话直接在旁边显示
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores';
import type { Task, AgentId, Agent } from '../../types';

interface SidebarProps {
  locale?: 'zh' | 'en';
}

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
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [taskContent, setTaskContent] = useState<string>('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('research');
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [tempGatewayUrl, setTempGatewayUrl] = useState(gatewayUrl || 'ws://localhost:18789');

  // 对话消息
  const [messages, setMessages] = useState<Record<string, { id: string; text: string; sender: 'user' | 'agent'; time: string }[]>>({
    'assistant': [{ id: '1', text: '你好！我是你的 AI 助手。', sender: 'agent', time: '12:00' }]
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 任务类型
  const taskTypes = [
    { value: 'research', labelZh: '研究', labelEn: 'Research' },
    { value: 'code', labelZh: '编码', labelEn: 'Code' },
    { value: 'analysis', labelZh: '分析', labelEn: 'Analysis' },
    { value: 'communication', labelZh: '沟通', labelEn: 'Comm' },
  ];

  // 导航配置
  const sections = [
    { id: 'gateway' as Section, icon: '🔗', labelZh: '连接', labelEn: 'Link' },
    { id: 'agents' as Section, icon: '🤖', labelZh: '智能体', labelEn: 'Agents' },
    { id: 'tasks' as Section, icon: '📋', labelZh: '任务', labelEn: 'Tasks' },
    { id: 'events' as Section, icon: '📜', labelZh: '日志', labelEn: 'Logs' },
  ];

  // 所有智能体都算作"在线"（无论 idle/working），只有真正离线才算离线
  const onlineAgents = agents.filter((a: Agent) => a.isOnline || a.state !== 'offline');
  const totalAgents = agents.length;
  const selectedAgent = agents.find((a: Agent) => a.id === selectedAgentId);

  // 自动滚动到对话底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedAgentId]);

  const getStatusColor = (state: string) => {
    const colors: Record<string, string> = {
      working: '#10B981', thinking: '#8B5CF6', chatting: '#3B82F6', busy: '#F59E0B'
    };
    return colors[state] || '#6B7280';
  };

  const getStatusText = (state: string) => {
    const map: Record<string, { zh: string; en: string }> = {
      idle: { zh: '空闲', en: 'Idle' }, working: { zh: '工作中', en: 'Working' },
      thinking: { zh: '思考中', en: 'Thinking' }, chatting: { zh: '对话中', en: 'Chatting' },
      busy: { zh: '忙碌', en: 'Busy' }, offline: { zh: '离线', en: 'Offline' }
    };
    return map[state]?.[locale] || state;
  };

  const handleGatewayToggle = () => {
    if (gatewayConnected) {
      disconnectGateway();
      addLog({ type: 'info', message: locale === 'zh' ? '已断开' : 'Disconnected' });
    } else {
      connectGateway(tempGatewayUrl);
      setShowGatewayModal(false);
      addLog({ type: 'info', message: locale === 'zh' ? '连接中...' : 'Connecting...' });
    }
  };

  const handleSendTask = () => {
    if (!selectedAgentId || !taskContent.trim()) return;
    assignTask(selectedAgentId as AgentId, selectedTaskType as Task['type']);
    const agent = agents.find((a: Agent) => a.id === selectedAgentId);
    addLog({ type: 'info', message: locale === 'zh' ? `📤 已向 ${agent?.nameZh} 发送任务` : `📤 Task sent` });
    setTaskContent('');
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || !selectedAgentId) return;
    const newMsg = { id: Date.now().toString(), text, sender: 'user' as const, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => ({ ...prev, [selectedAgentId]: [...(prev[selectedAgentId] || []), newMsg] }));
    
    // 模拟回复
    setTimeout(() => {
      const reply = { 
        id: (Date.now() + 1).toString(), 
        text: locale === 'zh' ? `收到: ${text}` : `Got: ${text}`, 
        sender: 'agent' as const, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => ({ ...prev, [selectedAgentId]: [...(prev[selectedAgentId] || []), reply] }));
    }, 600);
  };

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId === selectedAgentId ? '' : agentId);
  };

  // ========== 渲染函数 ==========

  const renderGateway = () => (
    <div className="sidebar-section">
      <div className="section-header">
        <h3>🔗 Gateway</h3>
        <span className={`status-badge ${gatewayConnected ? 'connected' : 'disconnected'}`}>
          {gatewayConnected ? (locale === 'zh' ? '已连接' : 'Connected') : (locale === 'zh' ? '未连接' : 'Disconnected')}
        </span>
      </div>
      <div className="gateway-info">
        <div className="info-row"><span>{locale === 'zh' ? '地址' : 'URL'}:</span><span className="mono">{gatewayUrl || '-'}</span></div>
        <div className="info-row"><span>{locale === 'zh' ? '在线' : 'Online'}:</span><span>{onlineAgents.length}/{totalAgents}</span></div>
      </div>
      <button className={`btn-full ${gatewayConnected ? 'btn-disconnect' : 'btn-connect'}`} onClick={() => gatewayConnected ? handleGatewayToggle() : setShowGatewayModal(!showGatewayModal)}>
        {gatewayConnected ? (locale === 'zh' ? '断开' : 'Disconnect') : (locale === 'zh' ? '连接' : 'Connect')}
      </button>
      {showGatewayModal && (
        <div className="input-group">
          <input type="text" value={tempGatewayUrl} onChange={(e) => setTempGatewayUrl(e.target.value)} placeholder="ws://localhost:18789" />
          <button onClick={handleGatewayToggle}>{locale === 'zh' ? '确定' : 'OK'}</button>
        </div>
      )}
    </div>
  );

  // Agents + Chat 整合面板
  const renderAgents = () => (
    <div className="sidebar-section agents-panel">
      <div className="section-header">
        <h3>🤖 {locale === 'zh' ? '智能体' : 'Agents'}</h3>
        <span className="badge">{onlineAgents.length}/{totalAgents}</span>
      </div>

      <div className="agents-layout">
        {/* Agent 列表 */}
        <div className="agent-list">
          {agents.map((agent: Agent) => (
            <div 
              key={agent.id} 
              className={`agent-row ${selectedAgentId === agent.id ? 'selected' : ''} ${agent.isOnline ? 'online' : 'offline'}`}
              onClick={() => handleAgentClick(agent.id)}
            >
              <span className="agent-icon">{agent.skillTag?.icon || '🤖'}</span>
              <div className="agent-info">
                <span className="name">{locale === 'zh' ? agent.nameZh : agent.nameEn}</span>
                <span className="state" style={{ color: getStatusColor(agent.state) }}>{getStatusText(agent.state)}</span>
              </div>
              <span className={`status-dot ${agent.isOnline ? 'active' : ''}`}></span>
            </div>
          ))}
        </div>

        {/* 对话面板 - 选中 Agent 时显示 */}
        {selectedAgent ? (
          <div className="chat-panel">
            <div className="chat-header">
              <span className="chat-agent-icon">{selectedAgent.skillTag?.icon || '🤖'}</span>
              <span>{locale === 'zh' ? selectedAgent.nameZh : selectedAgent.nameEn}</span>
              <button className="btn-close" onClick={() => setSelectedAgentId('')}>✕</button>
            </div>
            <div className="chat-messages">
              {(messages[selectedAgentId] || []).map(msg => (
                <div key={msg.id} className={`chat-message ${msg.sender}`}>
                  <span className="msg-avatar">{msg.sender === 'agent' ? (selectedAgent.skillTag?.icon || '🤖') : '👤'}</span>
                  <div className="msg-content">
                    <span className="msg-text">{msg.text}</span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
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
        ) : (
          <div className="chat-placeholder">
            <span>{locale === 'zh' ? '👈 选择一个智能体开始对话' : '👈 Select an agent to chat'}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderTasks = () => {
    interface LogEntry { id: string; message: string; timestamp: number; type: string; }
    
    return (
      <div className="sidebar-section">
        <div className="section-header">
          <h3>📋 {locale === 'zh' ? '任务' : 'Tasks'}</h3>
          <span className="badge">{tasks.length}</span>
        </div>
        
        <div className="task-form">
          <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
            <option value="">{locale === 'zh' ? '-- 选择智能体 --' : '-- Select Agent --'}</option>
            {onlineAgents.map((a: Agent) => <option key={a.id} value={a.id}>{locale === 'zh' ? a.nameZh : a.nameEn}</option>)}
          </select>
          <select value={selectedTaskType} onChange={(e) => setSelectedTaskType(e.target.value)}>
            {taskTypes.map(t => <option key={t.value} value={t.value}>{locale === 'zh' ? t.labelZh : t.labelEn}</option>)}
          </select>
          <textarea value={taskContent} onChange={(e) => setTaskContent(e.target.value)} placeholder={locale === 'zh' ? '任务描述...' : 'Task...'} rows={2} />
          <button className="btn-full btn-submit" onClick={handleSendTask} disabled={!selectedAgentId || !taskContent.trim()}>
            {locale === 'zh' ? '发送任务' : 'Send Task'}
          </button>
        </div>

        <div className="task-list">
          {tasks.length === 0 ? <div className="empty">{locale === 'zh' ? '暂无任务' : 'No tasks'}</div> : 
            tasks.slice().reverse().slice(0, 10).map((task: Task) => (
              <div key={task.id} className={`task-item ${task.status}`}>
                <div className="task-header"><span>{locale === 'zh' ? task.titleZh : task.titleEn}</span><span className={`status ${task.status}`}>{task.status}</span></div>
                <div className="task-meta"><span>👤 {task.assignee}</span><span>{task.progress}%</span></div>
                {task.status === 'running' && <div className="progress"><div style={{ width: `${task.progress}%` }}></div></div>}
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  const renderEvents = () => {
    interface LogEntry { id: string; message: string; timestamp: number; type: string; }
    return (
      <div className="sidebar-section">
        <div className="section-header">
          <h3>📜 {locale === 'zh' ? '日志' : 'Logs'}</h3>
          <span className="badge">{logs.length}</span>
        </div>
        <div className="event-list">
          {logs.length === 0 ? <div className="empty">{locale === 'zh' ? '等待事件...' : 'Waiting...'}</div> : 
            logs.slice().reverse().slice(0, 50).map((log: LogEntry) => (
              <div key={log.id} className={`event-item ${log.type}`}>
                <span className="event-msg">{log.message}</span>
                <span className="event-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  };

  return (
    <div className="unified-sidebar">
      <nav className="sidebar-nav">
        {sections.map(s => (
          <button key={s.id} className={`nav-item ${activeSection === s.id ? 'active' : ''}`} onClick={() => setActiveSection(s.id)}>
            <span className="nav-icon">{s.icon}</span>
            <span className="nav-label">{locale === 'zh' ? s.labelZh : s.labelEn}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-content">
        {activeSection === 'gateway' && renderGateway()}
        {activeSection === 'agents' && renderAgents()}
        {activeSection === 'tasks' && renderTasks()}
        {activeSection === 'events' && renderEvents()}
      </div>
    </div>
  );
};

export default Sidebar;
