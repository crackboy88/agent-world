/**
 * 主布局组件
 * Chen Company Agent World
 */

import React, { useEffect, useState } from 'react';
import { useAppStore } from './stores';
import Scene3D from './components/3D/Scene3D';
import AgentList from './components/Common/AgentList';
import Sidebar from './components/UI/Sidebar';
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
    agentAppearances,
    updateAgentAppearance,
    updateAgentPosition
  } = useAppStore();
  
  const [showGatewayInput, setShowGatewayInput] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState('ws://localhost:18789');
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId === selectedAgentId ? undefined : agentId);
  };

  useEffect(() => {
    initializeStore();
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
  
  // 点击地图：检查是否点击了 Agent，有则选中，否则移动选中的 Agent
  const handleMapClick = (position: { x: number; y: number }) => {
    // 检查点击位置是否有 Agent（半径 30 像素内的 Agent）
    const clickedAgent = agents.find(agent => {
      const dx = agent.position.x - position.x;
      const dy = agent.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 30;
    });
    
    if (clickedAgent) {
      // 选中点击的 Agent
      setSelectedAgentId(clickedAgent.id);
      console.log('[DEBUG] Selected agent from map click:', clickedAgent.id);
    } else if (selectedAgentId) {
      // 移动选中的 Agent
      updateAgentPosition(selectedAgentId, position);
    }
  };

  // 右键取消选择
  const handleDeselect = () => {
    setSelectedAgentId(undefined);
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
          <span className="logo-icon">🌐</span>
          <span className="logo-text">Agent World</span>
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
        {/* 左侧统一侧边栏 */}
        <aside className="sidebar-left">
          <Sidebar locale={locale} />
        </aside>

        {/* 中间 3D 场景 */}
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
                agentAppearances={agentAppearances}
                onMapClick={handleMapClick}
                onDeselect={handleDeselect}
              />
            </ErrorBoundary>
          </ErrorBoundary>
        </main>
      </div>

      {/* 底部状态栏 */}
      <footer className="bottom-bar">
        <div className="status-left">
          <span className="status-item online">● {onlineAgents} {locale === 'zh' ? '在线' : 'Online'}</span>
          <span className="status-item tasks">⚡ {runningTasks} {locale === 'zh' ? '任务进行中' : 'Running'}</span>
          <span className="status-item total">📋 {tasks.length} {locale === 'zh' ? '总任务' : 'Total'}</span>
        </div>
        <div className="status-right"></div>
      </footer>
    </div>
  );
};

export default App;
