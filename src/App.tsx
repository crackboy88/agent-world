/**
 * 主布局组件
 * Chen Company Agent World
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores';
import Scene3D from './components/3D/Scene3D';
import AgentList from './components/Common/AgentList';
import EventLog from './components/Common/EventLog';
import ControlPanel from './components/UI/ControlPanel';
import LoadingScreen from './components/UI/LoadingScreen';
import ErrorBoundary from './components/Common/ErrorBoundary';
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
  const [gatewayUrl, setGatewayUrl] = useState('ws://localhost:18789');
  const [activePanel, setActivePanel] = useState<'events' | 'tasks' | 'chat'>('events');
  const [leftSidebarTab, setLeftSidebarTab] = useState<'list' | 'control'>('list');
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId === selectedAgentId ? undefined : agentId);
  };

  useEffect(() => {
    initializeStore();
    // 模拟初始加载时间，保证 LoadingScreen 至少有展示机会
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [initializeStore]);

  const handleConnectGateway = () => {
    if (gatewayConnected) {
      disconnectGateway();
    } else if (gatewayUrl) {
      connectGateway(gatewayUrl);
      setShowGatewayInput(false);
    }
  };

  const onlineAgents = Array.isArray(agents) ? agents.filter(a => a.isOnline).length : 0;
  const runningTasks = Array.isArray(tasks) ? tasks.filter(t => t.status === 'running').length : 0;

  return (
    <div className="app-container">
      {/* 首次加载显示 LoadingScreen */}
      {isAppLoading && (
        <LoadingScreen 
          isLoading={isAppLoading} 
          onComplete={() => setIsAppLoading(false)} 
        />
      )}
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
              placeholder="ws://localhost:18789"
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
          <div className="left-sidebar-tabs">
            <button 
              className={leftSidebarTab === 'list' ? 'active' : ''} 
              onClick={() => setLeftSidebarTab('list')}
            >
              🤖 Agents
            </button>
            <button 
              className={leftSidebarTab === 'control' ? 'active' : ''} 
              onClick={() => setLeftSidebarTab('control')}
            >
              🎛️ Control
            </button>
          </div>
          
          {leftSidebarTab === 'list' ? (
            <>
              <div className="panel-header">
                <h3>🤖 Agents</h3>
                <span className="badge">{onlineAgents}/{agents.length}</span>
              </div>
              <AgentList agents={agents} />
            </>
          ) : (
            <ControlPanel locale={locale} />
          )}
        </aside>

        {/* 中间 */}
        <main className="map-area">
          <ErrorBoundary
            fallback={
              <div className="scene-error-fallback">
                <div className="scene-error-content">
                  <span className="scene-error-icon">🗺️</span>
                  <h3>3D 场景加载失败</h3>
                  <p>请尝试刷新页面或检查 WebGL 支持</p>
                  <button onClick={() => window.location.reload()}>🔃 刷新页面</button>
                </div>
              </div>
            }
          >
            <ErrorBoundary
              fallback={
                <div className="scene-loading-fallback">
                  <div className="scene-loading-spinner"></div>
                  <p>加载 3D 场景中...</p>
                </div>
              }
            >
              <Scene3D 
                agents={agents} 
                selectedAgentId={selectedAgentId} 
                onAgentClick={handleAgentClick} 
              />
            </ErrorBoundary>
          </ErrorBoundary>
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
