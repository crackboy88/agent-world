/**
 * 统一侧边栏组件 - 完整版
 * Chen Company Agent World - Unified Sidebar
 * 
 * 功能:
 * - Gateway 连接控制
 * - Agent 列表与状态
 * - 会话列表管理
 * - 实时聊天 (通过 Gateway)
 * - 任务管理
 * - 事件日志
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores';
import { socketService } from '../../services/socket';
import type { Task, AgentId, Agent } from '../../types';

interface SidebarProps {
  locale?: 'zh' | 'en';
}

type Section = 'gateway' | 'agents' | 'tasks' | 'events';

// 会话类型
interface Session {
  sessionKey: string;
  title: string;
  lastMessage?: string;
  updatedAt: number;
}

// 消息类型
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  time: string;
}

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

  // UI 状态
  const [activeSection, setActiveSection] = useState<Section>('agents');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedSessionKey, setSelectedSessionKey] = useState<string>('');
  const [sessions, setSessions] = useState<Record<string, Session[]>>({});
  const [taskContent, setTaskContent] = useState<string>('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('research');
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [tempGatewayUrl, setTempGatewayUrl] = useState(gatewayUrl || 'ws://localhost:18789');

  // 消息状态: { agentId: { sessionKey: [messages] } }
  const [messages, setMessages] = useState<Record<string, Record<string, ChatMessage[]>>>({});
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

  // 计算属性
  const onlineAgents = agents.filter((a: Agent) => a.isOnline || a.state !== 'offline');
  const totalAgents = agents.length;
  const selectedAgent = agents.find((a: Agent) => a.id === selectedAgentId);

  // 自动滚动
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedAgentId, selectedSessionKey]);

  // 获取会话列表
  const fetchSessions = useCallback(async (agentId: string) => {
    if (!gatewayConnected) return;
    try {
      const result = await socketService.listSessions(agentId);
      if (result?.sessions) {
        setSessions(prev => ({ ...prev, [agentId]: result.sessions }));
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, [gatewayConnected]);

  // 发送聊天消息
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !selectedAgentId || !selectedSessionKey) return;
    
    const msgId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = { 
      id: msgId, 
      text, 
      sender: 'user', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    // 添加用户消息到 UI
    setMessages(prev => ({
      ...prev,
      [selectedAgentId]: {
        ...(prev[selectedAgentId] || {}),
        [selectedSessionKey]: [...(prev[selectedAgentId]?.[selectedSessionKey] || []), newMsg]
      }
    }));

    try {
      // 通过 Gateway 发送
      await socketService.sendChat(selectedSessionKey, text);
      addLog({ type: 'info', message: locale === 'zh' ? `📤 已发送` : `📤 Sent` });
    } catch (err) {
      console.error('Failed to send:', err);
      addLog({ type: 'error', message: locale === 'zh' ? `❌ 发送失败` : `❌ Failed` });
    }
  }, [selectedAgentId, selectedSessionKey, locale, addLog]);

  // 监听聊天事件
  useEffect(() => {
    if (!gatewayConnected) return;
    
    const originalOnChat = socketService.onChat;
    socketService.onChat = (data: unknown) => {
      const chatData = data as { sessionKey?: string; message?: { content?: string; role?: string } };
      if (chatData.sessionKey && chatData.message) {
        const sessionKey = chatData.sessionKey;
        
        // 找到对应的 agent
        let targetAgentId = selectedAgentId;
        for (const [agentId, agentSessions] of Object.entries(sessions)) {
          if (agentSessions.some(s => s.sessionKey === sessionKey)) {
            targetAgentId = agentId;
            break;
          }
        }
        
        if (targetAgentId && sessionKey) {
          const agentMsg: ChatMessage = {
            id: `recv_${Date.now()}`,
            text: chatData.message.content || '',
            sender: chatData.message.role === 'assistant' ? 'agent' : 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prev => ({
            ...prev,
            [targetAgentId]: {
              ...(prev[targetAgentId] || {}),
              [sessionKey]: [...(prev[targetAgentId]?.[sessionKey] || []), agentMsg]
            }
          }));
        }
      }
      originalOnChat?.(data);
    };

    return () => { socketService.onChat = originalOnChat; };
  }, [gatewayConnected, sessions, selectedAgentId]);

  // 选择 Agent 时获取会话
  useEffect(() => {
    if (selectedAgentId && gatewayConnected) {
      fetchSessions(selectedAgentId);
    }
  }, [selectedAgentId, gatewayConnected, fetchSessions]);

  // 选择会话时加载历史消息
  useEffect(() => {
    if (selectedAgentId && selectedSessionKey && gatewayConnected) {
      socketService.getChatHistory(selectedSessionKey)
        .then(result => {
          if (result?.messages) {
            const history: ChatMessage[] = result.messages.map((m: { role: string; content: string; timestamp: number }) => ({
              id: `hist_${m.timestamp}`,
              text: m.content,
              sender: m.role === 'assistant' ? 'agent' : 'user',
              time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setMessages(prev => ({
              ...prev,
              [selectedAgentId]: {
                ...(prev[selectedAgentId] || {}),
                [selectedSessionKey]: history
              }
            }));
          }
        })
        .catch(console.error);
    }
  }, [selectedAgentId, selectedSessionKey, gatewayConnected]);

  // 状态样式
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
      <button className={`btn-full ${gatewayConnected ? 'btn-disconnect' : 'btn-connect'}`} onClick={() => gatewayConnected ? disconnectGateway() : setShowGatewayModal(!showGatewayModal)}>
        {gatewayConnected ? (locale === 'zh' ? '断开' : 'Disconnect') : (locale === 'zh' ? '连接' : 'Connect')}
      </button>
      {showGatewayModal && (
        <div className="input-group">
          <input type="text" value={tempGatewayUrl} onChange={(e) => setTempGatewayUrl(e.target.value)} placeholder="ws://localhost:18789" />
          <button onClick={() => { connectGateway(tempGatewayUrl); setShowGatewayModal(false); }}>{locale === 'zh' ? '确定' : 'OK'}</button>
        </div>
      )}
    </div>
  );

  // Agents + Sessions + Chat
  const renderAgents = () => (
    <div className="sidebar-section agents-panel">
      <div className="section-header">
        <h3>🤖 {locale === 'zh' ? '智能体' : 'Agents'}</h3>
        <span className="badge">{onlineAgents.length}/{totalAgents}</span>
      </div>

      {/* Agent 网格 */}
      <div className="agent-grid-full">
        {agents.map((agent: Agent) => (
          <div key={agent.id} className={`agent-card-large ${selectedAgentId === agent.id ? 'selected' : ''}`}
            onClick={() => { setSelectedAgentId(agent.id === selectedAgentId ? '' : agent.id); setSelectedSessionKey(''); }}>
            <div className="agent-header">
              <span className="agent-icon-lg">{agent.skillTag?.icon || '🤖'}</span>
              <span className="agent-name-lg">{agent.id}</span>
            </div>
            <div className="agent-footer">
              <span className="agent-state-lg" style={{ color: getStatusColor(agent.state) }}>{getStatusText(agent.state)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 会话列表 */}
      {selectedAgentId && sessions[selectedAgentId] && sessions[selectedAgentId].length > 0 && (
        <div className="sessions-list">
          <div className="section-header"><h4>💬 {locale === 'zh' ? '会话' : 'Sessions'}</h4></div>
          <div className="session-items">
            {sessions[selectedAgentId].map((session: Session) => (
              <div key={session.sessionKey} className={`session-item ${selectedSessionKey === session.sessionKey ? 'selected' : ''}`}
                onClick={() => setSelectedSessionKey(session.sessionKey)}>
                <span className="session-title">{session.title || session.sessionKey?.split(':').pop() || 'Session'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 对话面板 */}
      {selectedAgentId && selectedSessionKey ? (
        <div className="chat-panel-compact">
          <div className="chat-header">
            <span className="chat-agent-icon">{selectedAgent?.skillTag?.icon || '🤖'}</span>
            <span>{selectedAgentId}</span>
            <button className="btn-close" onClick={() => setSelectedSessionKey('')}>✕</button>
          </div>
          <div className="chat-messages">
            {(messages[selectedAgentId]?.[selectedSessionKey] || []).map((msg: ChatMessage) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <span className="msg-avatar">{msg.sender === 'agent' ? (selectedAgent?.skillTag?.icon || '🤖') : '👤'}</span>
                <div className="msg-content">
                  <span className="msg-text">{msg.text}</span>
                  <span className="msg-time">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input type="text" placeholder={locale === 'zh' ? '发送消息...' : 'Type...'}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSendMessage((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
            <button onClick={(e) => { const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement; handleSendMessage(input.value); input.value = ''; }}>➤</button>
          </div>
        </div>
      ) : selectedAgentId ? (
        <div className="chat-placeholder">
          <span>{locale === 'zh' ? '👆 选择会话开始对话' : '👆 Select a session to chat'}</span>
        </div>
      ) : null}
    </div>
  );

  // Tasks
  const renderTasks = () => (
    <div className="sidebar-section">
      <div className="section-header">
        <h3>📋 {locale === 'zh' ? '任务' : 'Tasks'}</h3>
        <span className="badge">{tasks.length}</span>
      </div>
      <div className="task-form">
        <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
          <option value="">{locale === 'zh' ? '-- 选择智能体 --' : '-- Select Agent --'}</option>
          {onlineAgents.map((a: Agent) => <option key={a.id} value={a.id}>{a.id}</option>)}
        </select>
        <select value={selectedTaskType} onChange={(e) => setSelectedTaskType(e.target.value)}>
          {taskTypes.map(t => <option key={t.value} value={t.value}>{locale === 'zh' ? t.labelZh : t.labelEn}</option>)}
        </select>
        <textarea value={taskContent} onChange={(e) => setTaskContent(e.target.value)} placeholder={locale === 'zh' ? '任务描述...' : 'Task...'} rows={2} />
        <button className="btn-full btn-submit" onClick={() => { if (selectedAgentId && taskContent) { assignTask(selectedAgentId as AgentId, selectedTaskType as Task['type']); setTaskContent(''); } }} disabled={!selectedAgentId || !taskContent.trim()}>
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

  // Events
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
