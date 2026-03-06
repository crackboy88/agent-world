/**
 * 主布局组件
 * Chen Company Agent World
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores';
import Scene3D from './components/3D/Scene3D';
import AgentList from './components/Common/AgentList';
import EventLog from './components/Common/EventLog';
import './index.css';

const App: React.FC = () => {
  const { 
    initializeStore, 
    agents, 
    tasks, 
    locale, 
    setLocale,
    gatewayConnected,
    connectGateway,
    disconnectGateway,
    logs
  } = useAppStore();
  
  const [showGatewayInput, setShowGatewayInput] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState('ws://localhost:18789/?token=5a8d91273cf067511ba6aebff67361ced57f54e2c5fb6d8e');
  const [activePanel, setActivePanel] = useState<'events' | 'tasks' | 'chat'>('events');
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  
  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId === selectedAgentId ? undefined : agentId);
  };

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleConnectGateway = () => {
    if (gatewayConnected) {
      disconnectGateway();
    } else if (gatewayUrl) {
      connectGateway(gatewayUrl);
      setShowGatewayInput(false);
    }
  };

  const onlineAgents = agents.filter(a => a.isOnline).length;
  const runningTasks = tasks.filter(t => t.status === 'running').length;

  return (
    <div className="app-container">
      {/* 顶部导航栏 */}
      <header className="top-bar">
        <div className="logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">Chen Company</span>
        </div>
        
        <div className="top-nav">
          <button 
            className={`gateway-btn ${gatewayConnected ? 'connected' : ''}`}
            onClick={() => setShowGatewayInput(!showGatewayInput)}
          >
            <span className="status-dot"></span>
            Gateway
          </button>
          
          <button 
            className="lang-btn"
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          >
            {locale === 'zh' ? '中文' : 'EN'}
          </button>
        </div>
        
        {showGatewayInput && (
          <div className="gateway-modal">
            <input
              type="text"
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              placeholder="ws://gateway:18789/?token=..."
            />
            <button onClick={handleConnectGateway}>
              {gatewayConnected ? '断开' : '连接'}
            </button>
          </div>
        )}
      </header>

      {/* 主体区域 */}
      <div className="main-content">
        {/* 左侧 */}
        <aside className="sidebar-left">
          <div className="panel-header">
            <h3>🤖 Agents</h3>
            <span className="badge">{onlineAgents}/{agents.length}</span>
          </div>
          <AgentList agents={agents} />
        </aside>

        {/* 中间 */}
        <main className="map-area">
          {/* 强制显示3D视图 */}
          <Scene3D agents={agents} selectedAgentId={selectedAgentId} onAgentClick={handleAgentClick} />
        </main>

        {/* 右侧 */}
        <aside className="sidebar-right">
          <div className="panel-tabs">
            <button className={activePanel === 'events' ? 'active' : ''} onClick={() => setActivePanel('events')}>📋 事件</button>
            <button className={activePanel === 'tasks' ? 'active' : ''} onClick={() => setActivePanel('tasks')}>📝 任务</button>
            <button className={activePanel === 'chat' ? 'active' : ''} onClick={() => setActivePanel('chat')}>💬 聊天</button>
          </div>
          
          <div className="panel-content">
            {activePanel === 'events' && <EventLog logs={logs} />}
            {activePanel === 'tasks' && (
              <div className="task-list">
                {tasks.length === 0 ? <div className="empty-state">暂无任务</div> : tasks.map(task => (
                  <div key={task.id} className={`task-item ${task.status}`}>
                    <span className="task-title">{task.titleZh}</span>
                    <span className="task-status">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
            {activePanel === 'chat' && (
              <div className="chat-panel">
                <div className="chat-messages">
                  <div className="message system">👋 你好！</div>
                </div>
                <div className="chat-input">
                  <input type="text" placeholder="发送消息..." />
                  <button>➤</button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 底部状态栏 */}
      <footer className="bottom-bar">
        <div className="status-left">
          <span className="status-item online">● {onlineAgents} 在线</span>
          <span className="status-item tasks">⚡ {runningTasks} 任务进行中</span>
          <span className="status-item total">📋 {tasks.length} 总任务</span>
        </div>
        <div className="status-right"></div>
      </footer>
    </div>
  );
};

export default App;
