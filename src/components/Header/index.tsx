/**
 * 顶部导航栏组件 - 右侧缩放按钮版
 * Chen Company Agent World - Header
 */

import React from 'react';
import { useAppStore } from '../../stores';

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#3B82F6',
  success: '#10B981',
  text: '#1F2937',
  textLight: '#6B7280',
  bg: '#FFFFFF',
  bgLight: '#F9FAFB',
  border: '#E5E7EB',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    background: COLORS.bg,
    borderBottom: `3px solid ${COLORS.primary}`,
    display: 'grid',
    gridTemplateColumns: '240px 200px 200px 200px 1fr',
    gap: 12,
    padding: '12px 20px',
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    boxSizing: 'border-box',
    minWidth: 1100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 56,
    height: 56,
    background: COLORS.primary,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    boxShadow: '0 2px 0 ' + COLORS.primaryDark,
    flexShrink: 0,
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'var(--font-pixel)',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  },
  logoSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: 'var(--font-pixel)',
    whiteSpace: 'nowrap',
  },
  statCard: {
    width: 200,
    height: '100%',
    background: COLORS.bgLight,
    borderRadius: 10,
    border: `2px solid ${COLORS.border}`,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    cursor: 'pointer',
    minHeight: 80,
    boxSizing: 'border-box',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'var(--font-pixel)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: 'var(--font-pixel)',
    whiteSpace: 'nowrap',
  },
  statValuePrimary: { color: COLORS.primary },
  statValueSuccess: { color: COLORS.success },
  // 右侧控制区
  rightControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  // 按钮样式 - 统一
  button: {
    width: 32,
    height: 32,
    background: COLORS.bg,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'var(--font-pixel)',
  },
  buttonHover: {
    background: '#EFF6FF',
  },
  buttonActive: {
    background: COLORS.primary,
    color: '#FFFFFF',
  },
  // 缩放控制组
  zoomGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  zoomInfo: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'var(--font-pixel)',
    minWidth: 36,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  // 世界时钟
  clockContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: COLORS.primary,
    borderRadius: 10,
    padding: '8px 16px',
    boxShadow: '0 2px 0 ' + COLORS.primaryDark,
    minWidth: 120,
  },
  clockLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'var(--font-pixel)',
    marginBottom: 2,
    whiteSpace: 'nowrap',
  },
  clockTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'var(--font-pixel)',
    letterSpacing: 1,
    whiteSpace: 'nowrap',
  },
  clockDate: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'var(--font-pixel)',
    marginTop: 2,
    whiteSpace: 'nowrap',
  },
};

const Header: React.FC = () => {
  const { agents, tasks, currentTime, locale, setLocale, mapScale, setMapScale, setMapOffset } = useAppStore();
  
  const onlineAgents = agents.filter(a => a.state !== 'offline').length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  const formatTime = (time: string) => time || '00:00:00';
  
  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    };
    return now.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', options);
  };

  // 缩放控制
  const handleZoomIn = () => {
    const newScale = Math.min(1.5, mapScale + 0.1);
    setMapScale(newScale);
  };
  
  const handleZoomOut = () => {
    const newScale = Math.max(0.5, mapScale - 0.1);
    setMapScale(newScale);
  };

  // 重置视图
  const handleResetView = () => {
    setMapScale(0.8);
    setMapOffset({ x: 0, y: 120 });
  };

  return (
    <header style={styles.container}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏢</div>
        <div style={styles.logoText}>
          <div style={styles.logoTitle}>CHEN</div>
          <div style={styles.logoSubtitle}>Agent World</div>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div style={styles.statCard}>
        <div style={styles.statLabel}>
          <span>👥</span>
          <span>{locale === 'zh' ? '在线' : 'Online'}</span>
        </div>
        <div style={{ ...styles.statValue, ...styles.statValuePrimary }}>
          {onlineAgents}/{agents.length}
        </div>
      </div>
      
      <div style={styles.statCard}>
        <div style={styles.statLabel}>
          <span>📋</span>
          <span>{locale === 'zh' ? '任务' : 'Tasks'}</span>
        </div>
        <div style={styles.statValue}>{totalTasks}</div>
      </div>
      
      <div style={styles.statCard}>
        <div style={styles.statLabel}>
          <span>✅</span>
          <span>{locale === 'zh' ? '完成' : 'Done'}</span>
        </div>
        <div style={{ ...styles.statValue, ...styles.statValueSuccess }}>{completedTasks}</div>
      </div>
      
      {/* 右侧控制区 */}
      <div style={styles.rightControls}>
        {/* 语言切换 */}
        <button 
          style={styles.button} 
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          title={locale === 'zh' ? 'English' : '中文'}
        >
          {locale === 'zh' ? 'EN' : '中'}
        </button>
        
        {/* 缩放控制组 */}
        <div style={styles.zoomGroup}>
          <button 
            style={styles.button} 
            onClick={handleZoomOut}
            title={locale === 'zh' ? '缩小' : 'Zoom Out'}
          >
            −
          </button>
          <div style={styles.zoomInfo}>{Math.round(mapScale * 100)}%</div>
          <button 
            style={styles.button} 
            onClick={handleZoomIn}
            title={locale === 'zh' ? '放大' : 'Zoom In'}
          >
            +
          </button>
          <button 
            style={styles.button} 
            onClick={handleResetView}
            title={locale === 'zh' ? '重置视图' : 'Reset View'}
          >
            ⌂
          </button>
        </div>
        
        {/* 世界时钟 */}
        <div style={styles.clockContainer}>
          <div style={styles.clockLabel}>{locale === 'zh' ? '🕐' : '🌍'}</div>
          <div style={styles.clockTime}>{formatTime(currentTime)}</div>
          <div style={styles.clockDate}>{getCurrentDate()}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
