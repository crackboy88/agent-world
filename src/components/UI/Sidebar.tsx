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
import AgentAppearanceSettings from './AgentAppearanceSettings';

interface SidebarProps {
  locale?: 'zh' | 'en';
}

type Section = 'gateway' | 'agents' | 'tasks' | 'events' | 'settings';

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
  const [cronJobs, setCronJobs] = useState<Array<{id: string; name: string; schedule: string; status: string; target: string; agentId: string}>>([]);
  
  // 获取 Cron 任务列表
  useEffect(() => {
    if (activeSection === 'tasks') {
      console.log('[DEBUG] Fetching cron jobs, current:', cronJobs);
      socketService.listCronJobs().then((jobs: any) => {
        console.log('[DEBUG] Cron jobs result:', jobs);
        if (jobs && Array.isArray(jobs)) {
          setCronJobs(jobs);
        }
      }).catch((err: any) => {
        console.log('[DEBUG] Cron jobs error:', err);
      });
    }
  }, [activeSection]);

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
    { id: 'tasks' as Section, icon: '⏰', labelZh: '定时任务', labelEn: 'Cron' },
    { id: 'events' as Section, icon: '📜', labelZh: '日志', labelEn: 'Logs' },
    { id: 'settings' as Section, icon: '⚙️', labelZh: '设置', labelEn: 'Settings' },
  ];

  // 计算属性
  const onlineAgents = agents.filter((a: Agent) => a.isOnline || a.state !== 'offline');
  const totalAgents = agents.length;
  const selectedAgent = agents.find((a: Agent) => a.id === selectedAgentId);

  // 自动滚动
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedAgentId, selectedSessionKey]);

  // 获取 Cron 任务列表
  useEffect(() => {
    if (activeSection !== 'tasks' || !gatewayConnected) return;
    
    const fetchCronJobs = async () => {
      try {
        const result = await socketService.listCronJobs();
        console.log('[Cron] Result:', result);
        if (result?.jobs) {
          setCronJobs(result.jobs);
        }
      } catch (err) {
        console.error('[Cron] Error:', err);
      }
    };
    
    fetchCronJobs();
  }, [activeSection, gatewayConnected]);

  // 监听 Gateway 会话更新
  useEffect(() => {
    if (!gatewayConnected) return;
    
    const originalOnSessionsUpdate = socketService.onSessionsUpdate;
    socketService.onSessionsUpdate = (sessions: unknown[]) => {
      console.log('[Sidebar] Sessions from Gateway:', sessions);
      const sessionsByAgent: Record<string, Session[]> = {};
      (sessions as Array<{ sessionKey: string; agentId?: string; title?: string; updatedAt?: number }>).forEach(s => {
        const agentId = s.agentId || s.sessionKey.split(':')[1] || 'unknown';
        if (!sessionsByAgent[agentId]) sessionsByAgent[agentId] = [];
        sessionsByAgent[agentId].push({
          sessionKey: s.sessionKey,
          title: s.title || s.sessionKey,
          updatedAt: s.updatedAt || Date.now()
        });
      });
      
      setSessions(prev => {
        const merged = { ...prev };
        Object.entries(sessionsByAgent).forEach(([agentId, list]) => {
          if (list.length > 0) merged[agentId] = list;
        });
        return merged;
      });
    };

    return () => { socketService.onSessionsUpdate = originalOnSessionsUpdate; };
  }, [gatewayConnected]);

  // 获取真实会话列表
  const fetchSessions = useCallback(async (agentId: string) => {
    if (!gatewayConnected) return;
    try {
      console.log('[Session] Fetching sessions for:', agentId);
      const result = await socketService.listSessions(agentId);
      console.log('[Session] Result:', result);
      let sessionList: Session[] = [];
      
      // 处理 Gateway 返回的会话格式
      const rawSessions = (result as any)?.sessions || [];
      console.log('[Session] Raw sessions:', rawSessions);
      
      sessionList = rawSessions.map((s: any) => ({
        sessionKey: s.key || s.sessionKey || '',
        title: s.displayName || s.title || s.label || s.key?.split(':').pop() || 'Chat',
        updatedAt: s.updatedAt || s.lastMessage?.timestamp || Date.now()
      }));
      
      console.log('[Session] Parsed sessions:', sessionList);
      
      // 如果没有真实会话，显示提示
      if (sessionList.length === 0) {
        // 不创建假会话，让用户知道没有历史会话
        setSessions(prev => ({ ...prev, [agentId]: [] }));
        // 仍然设置一个临时会话用于新对话
        setSelectedSessionKey(`new:${agentId}`);
        return;
      }
      
      setSessions(prev => ({ ...prev, [agentId]: sessionList }));
      
      // 自动选择最新的会话
      if (sessionList.length > 0) {
        // 按更新时间排序，选最新的
        sessionList.sort((a, b) => b.updatedAt - a.updatedAt);
        setSelectedSessionKey(sessionList[0].sessionKey);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setSelectedSessionKey(`new:${agentId}`);
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
      addLog({ type: 'info', message: false ? `📤 Sent` : `📤 Sent` });
    } catch (err) {
      console.error('Failed to send:', err);
      addLog({ type: 'error', message: false ? `❌ Failed` : `❌ Failed` });
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

  // 选择 Agent 时获取会话并自动选中第一个
  useEffect(() => {
    if (selectedAgentId && gatewayConnected && !selectedSessionKey) {
      fetchSessions(selectedAgentId);
    }
  }, [selectedAgentId, gatewayConnected, selectedSessionKey, fetchSessions]);

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

  // 状态样式 - 增强 null 安全
  const getStatusColor = (state: string | undefined | null) => {
    if (!state) return '#6B7280';
    const colors: Record<string, string> = {
      working: '#10B981', thinking: '#8B5CF6', chatting: '#3B82F6', busy: '#F59E0B'
    };
    return colors[state] || '#6B7280';
  };

  const getStatusText = (state: string | undefined | null) => {
    if (!state) return false ? '未知' : 'Unknown';
    const map: Record<string, { zh: string; en: string }> = {
      idle: { zh: '空闲', en: 'Idle' }, working: { zh: '工作中', en: 'Working' },
      thinking: { zh: '思考中', en: 'Thinking' }, chatting: { zh: '对话中', en: 'Chatting' },
      busy: { zh: '忙碌', en: 'Busy' }, offline: { zh: '离线', en: 'Offline' }
    };
    return map[state]?.[locale] || (false ? '未知' : 'Unknown');
  };

  // ========== 渲染函数 ==========

  const renderGateway = () => (
    <div className="sidebar-section">
      <div className="section-header">
        <h3>🔗 Gateway</h3>
        <span className={`status-badge ${gatewayConnected || onlineAgents.length > 0 ? 'connected' : 'disconnected'}`}>
          {gatewayConnected || onlineAgents.length > 0 ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="gateway-info">
        <div className="info-row"><span>URL:</span><span className="mono">{gatewayUrl || '-'}</span></div>
        <div className="info-row"><span>Online:</span><span>{onlineAgents.length}/{totalAgents}</span></div>
      </div>
      <button className={`btn-full ${gatewayConnected || onlineAgents.length > 0 ? 'btn-disconnect' : 'btn-connect'}`} onClick={() => (gatewayConnected || onlineAgents.length > 0) ? disconnectGateway() : setShowGatewayModal(!showGatewayModal)}>
        {gatewayConnected || onlineAgents.length > 0 ? 'Disconnect' : 'Connect'}
      </button>
      {showGatewayModal && (
        <div className="input-group">
          <input type="text" value={tempGatewayUrl} onChange={(e) => setTempGatewayUrl(e.target.value)} placeholder="ws://localhost:18789" />
          <button onClick={() => { connectGateway(tempGatewayUrl); setShowGatewayModal(false); }}>OK</button>
        </div>
      )}
    </div>
  );

  // Agents + Chat (简化版：直接对话，无需会话列表)
  const renderAgents = () => (
    <div className="sidebar-section agents-panel">
      <div className="section-header">
        <h3>🤖 {false ? 'Agents' : 'Agents'}</h3>
        <span className="badge">{onlineAgents.length}/{totalAgents}</span>
      </div>

      {/* Agent 网格 - 点击获取真实会话 */}
      <div className="agent-grid-full">
        {agents.filter((a: Agent) => a?.id).map((agent: Agent) => {
          try {
            const icon = String(agent.skillTag?.icon || '🤖');
            const state = agent?.state || 'idle';
            return (
              <div key={agent.id} className={`agent-card-large ${selectedAgentId === agent.id ? 'selected' : ''}`}
                onClick={() => {
                  if (selectedAgentId === agent.id) {
                    setSelectedAgentId('');
                    setSelectedSessionKey('');
                  } else {
                    setSelectedAgentId(agent.id);
                    fetchSessions(agent.id);
                  }
                }}>
                <div className="agent-header">
                  <span className="agent-icon-lg">{icon}</span>
                  <span className="agent-name-lg">{agent.id}</span>
                </div>
                <div className="agent-footer">
                  <span className="agent-state-lg" style={{ color: getStatusColor(state) }}>{getStatusText(state)}</span>
                </div>
              </div>
            );
          } catch (e) {
            return null;
          }
        })}
      </div>

      {/* 对话面板 - 选中 agent 时显示 */}
      {selectedAgentId ? (
        <div className="chat-panel-compact">
          <div className="chat-header">
            <span className="chat-agent-icon">{selectedAgent?.skillTag?.icon || '🤖'}</span>
            <span>{selectedAgentId}</span>
            <button className="btn-close" onClick={() => { setSelectedAgentId(''); setSelectedSessionKey(''); }}>✕</button>
          </div>
          
          {/* 会话标签下拉菜单 - 如果有多个会话 */}
          {sessions[selectedAgentId] && sessions[selectedAgentId].length > 1 && (
            <div className="session-dropdown">
              <select 
                value={selectedSessionKey} 
                onChange={(e) => setSelectedSessionKey(e.target.value)}
                className="session-select"
              >
                {sessions[selectedAgentId].filter((s: Session) => s?.sessionKey).map((s: Session) => (
                  <option key={s.sessionKey} value={s.sessionKey}>
                    {(s?.title) || ((s?.sessionKey || '').split(':').pop()) || 'Chat'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* 单个会话时显示标签 */}
          {sessions[selectedAgentId] && sessions[selectedAgentId].length === 1 && (
            <div className="session-header">
              <span className="session-title">
                {(sessions[selectedAgentId][0]?.title) || ((sessions[selectedAgentId][0]?.sessionKey || '').split(':').pop()) || 'Chat'}
              </span>
            </div>
          )}
          
          <div className="chat-messages">
            {selectedSessionKey && messages[selectedAgentId]?.[selectedSessionKey]?.length > 0 ? (
              messages[selectedAgentId]?.[selectedSessionKey].filter((msg: ChatMessage) => msg?.id).map((msg: ChatMessage) => {
                try {
                  // text 可能是字符串或数组
                  let text = '';
                  const msgText = msg?.text as any;
                  if (Array.isArray(msgText)) {
                    // 如果是数组，提取每个元素的 text 字段
                    text = msgText.map((t: any) => t?.text || t?.content || t?.message || '').join('');
                  } else if (typeof msgText === 'string') {
                    text = msgText;
                  } else if (msgText && typeof msgText === 'object') {
                    text = msgText.text || msgText.content || msgText.message || '';
                  }
                  
                  const avatar = msg.sender === 'agent' ? String(selectedAgent?.skillTag?.icon || '🤖') : '👤';
                  const time = msg?.time || '';
                  return (
                    <div key={msg.id} className={`chat-message ${msg.sender}`}>
                      <span className="msg-avatar">{avatar}</span>
                      <div className="msg-content">
                        <div className="msg-text">{text || '(空消息)'}</div>
                        <div className="msg-time">{time}</div>
                      </div>
                    </div>
                  );
                } catch (e) {
                  return null;
                }
              })
            ) : (
              <div className="chat-empty">
                <span className="icon">💬</span>
                <span>{selectedAgentId ? (false ? `Start chatting with ${selectedAgentId}` : `Start chatting with ${selectedAgentId}`) : (false ? 'Select an agent' : 'Select an agent')}</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="chat-input">
            <input type="text" placeholder={false ? '发送消息...' : 'Type...'}
              onKeyDown={(e) => { if (e.key === 'Enter') { handleSendMessage((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = ''; } }} />
            <button onClick={(e) => { const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement; handleSendMessage(input.value); input.value = ''; }}>➤</button>
          </div>
        </div>
      ) : null}
    </div>
  );

  // Tasks - 显示所有Cron任务（启用和禁用）
  const renderTasks = () => {
    console.log('[DEBUG] Rendering tasks, cronJobs:', cronJobs);
    
    // 分类显示 - 改为根据 status 字段
    const enabledJobs = cronJobs.filter((j: any) => j?.status === 'enabled' || j?.status === 'active' || j?.status === 'running');
    const disabledJobs = cronJobs.filter((j: any) => j?.status === 'disabled' || j?.status === 'inactive' || j?.status === 'stopped');
    const otherJobs = cronJobs.filter((j: any) => !['enabled', 'active', 'running', 'disabled', 'inactive', 'stopped'].includes(j?.status));
    
    console.log('[DEBUG] Enabled:', enabledJobs.length, 'Disabled:', disabledJobs.length, 'Other:', otherJobs.length);
    
    return (
      <div className="sidebar-section">
        <div className="section-header">
          <h3>📋 Cron Jobs</h3>
          <span className="badge">{cronJobs.length}</span>
        </div>
        
        {cronJobs.length === 0 ? (
          <div className="empty">No cron jobs</div>
        ) : (
          <>
            {/* 启用的任务 */}
            {enabledJobs.length > 0 && (
              <div className="task-group">
                <div className="task-group-header">Enabled ({enabledJobs.length})</div>
                {enabledJobs.map((job: any) => {
                  const schedule = typeof job?.schedule === 'string' ? job.schedule : (job?.schedule?.expression || job?.schedule?.interval || String(job?.schedule || 'N/A'));
                  const target = typeof job?.target === 'string' ? job.target : (job?.target?.id || String(job?.target || '-'));
                  return (
                    <div key={job?.id || Math.random()} className="task-item enabled">
                      <div className="task-header"><span>{job?.name || 'Unknown'}</span><span className="status enabled">✓</span></div>
                      <div className="task-meta"><span>📅 {schedule}</span><span>🎯 {target}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* 禁用的任务 */}
            {disabledJobs.length > 0 && (
              <div className="task-group">
                <div className="task-group-header">Disabled ({disabledJobs.length})</div>
                {disabledJobs.map((job: any) => {
                  const schedule = typeof job?.schedule === 'string' ? job.schedule : (job?.schedule?.expression || job?.schedule?.interval || String(job?.schedule || 'N/A'));
                  const target = typeof job?.target === 'string' ? job.target : (job?.target?.id || String(job?.target || '-'));
                  return (
                    <div key={job?.id || Math.random()} className="task-item disabled">
                      <div className="task-header"><span>{job?.name || 'Unknown'}</span><span className="status disabled">✗</span></div>
                      <div className="task-meta"><span>📅 {schedule}</span><span>🎯 {target}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* 其他状态的任务 */}
            {otherJobs.length > 0 && (
              <div className="task-group">
                <div className="task-group-header">Other ({otherJobs.length})</div>
                {otherJobs.map((job: any) => {
                  const schedule = typeof job?.schedule === 'string' ? job.schedule : (job?.schedule?.expression || job?.schedule?.interval || String(job?.schedule || 'N/A'));
                  const target = typeof job?.target === 'string' ? job.target : (job?.target?.id || String(job?.target || '-'));
                  return (
                    <div key={job?.id || Math.random()} className="task-item">
                      <div className="task-header"><span>{job?.name || 'Unknown'}</span><span className="status">{job?.status || 'N/A'}</span></div>
                      <div className="task-meta"><span>📅 {schedule}</span><span>🎯 {target}</span></div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Events
  const renderEvents = () => {
    interface LogEntry { id: string; message: string; timestamp: number; type: string; }
    return (
      <div className="sidebar-section">
        <div className="section-header">
          <h3>📜 {false ? '日志' : 'Logs'}</h3>
          <span className="badge">{logs.length}</span>
        </div>
        <div className="event-list">
          {logs.length === 0 ? <div className="empty">{false ? 'Waiting...' : 'Waiting...'}</div> : 
            logs.slice().reverse().slice(0, 50).map((log: any) => (
              <div key={log?.id || Math.random()} className={`event-item ${log?.type || ''}`}>
                <span className="event-msg">{typeof log?.message === 'string' ? log.message : String(log?.message || '')}</span>
                <span className="event-time">{new Date(log?.timestamp || Date.now()).toLocaleTimeString()}</span>
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
            <span className="nav-label">{false ? s.labelZh : s.labelEn}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-content">
        {activeSection === 'gateway' && renderGateway()}
        {activeSection === 'agents' && renderAgents()}
        {activeSection === 'tasks' && renderTasks()}
        {activeSection === 'events' && renderEvents()}
        {activeSection === 'settings' && (
          <div className="settings-panel">
            <AgentAppearanceSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
