/**
 * 全局统计组件
 * Chen Company Agent World - Global Stats
 */

import React from 'react';
import { useAppStore } from '../../stores';

const GlobalStats: React.FC = () => {
  const { agents, tasks, locale } = useAppStore();
  
  // 计算统计数据
  const onlineAgents = agents.filter(a => a.isOnline).length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  
  // 统计项配置
  const stats = [
    {
      icon: '🟢',
      labelZh: '在线Agent',
      labelEn: 'Online',
      value: onlineAgents
    },
    {
      icon: '📋',
      labelZh: '总任务',
      labelEn: 'Total',
      value: totalTasks
    },
    {
      icon: '✅',
      labelZh: '已完成',
      labelEn: 'Done',
      value: completedTasks
    },
    {
      icon: '⏱️',
      labelZh: '运行时长',
      labelEn: 'Uptime',
      value: '00:00:00',
      isTime: true
    }
  ];
  
  return (
    <div className="global-stats">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <span className="stat-icon">{stat.icon}</span>
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">
            {locale === 'zh' ? stat.labelZh : stat.labelEn}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GlobalStats;
