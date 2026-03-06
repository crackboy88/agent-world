/**
 * 世界时钟组件
 * Chen Company Agent World - World Clock
 */

import React, { useEffect } from 'react';
import { useAppStore } from '../../stores';

const WorldClock: React.FC = () => {
  const { currentTime, updateCurrentTime, locale } = useAppStore();
  
  // 启动时间更新
  useEffect(() => {
    const interval = setInterval(() => {
      updateCurrentTime();
    }, 1000);
    
    return () => clearInterval(interval);
  }, [updateCurrentTime]);
  
  return (
    <div className="world-clock">
      <span className="clock-icon">🕐</span>
      <span className="clock-time">{currentTime}</span>
      <span className="clock-label">
        {locale === 'zh' ? '世界时间' : 'World Time'}
      </span>
    </div>
  );
};

export default WorldClock;
