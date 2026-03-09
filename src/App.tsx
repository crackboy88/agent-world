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
    agentAppearances,
    updateAgentAppearance,
    updateAgentPosition
  } = useAppStore();
  
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId === selectedAgentId ? undefined : agentId);
  };

  useEffect(() => {
    initializeStore();
    // Force show 3D scene after timeout
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
  
  // Agent 随机走动结束后的位置更新
  const handleAgentMove = (agentId: string, position: { x: number; y: number }) => {
    updateAgentPosition(agentId, position);
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
            className="lang-btn"
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          >
            {locale === 'zh' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      {/* 主体区域 */}
      <div className="main-content">
        {/* 左侧统一侧边栏 */}
        <aside className="sidebar-left">
          <Sidebar locale={locale} />
        </aside>

        {/* 中间 3D 场景 */}
        <main className="map-area">
              <Scene3D 
                agents={agents} 
                selectedAgentId={selectedAgentId} 
                onAgentClick={handleAgentClick}
                agentAppearances={agentAppearances}
                onMapClick={handleMapClick}
                onDeselect={handleDeselect}
                onAgentMove={handleAgentMove}
              />
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
