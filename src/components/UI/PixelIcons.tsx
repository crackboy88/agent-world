/**
 * 像素风图标系统
 * Chen Company Agent World - Pixel Icons
 */

import React from 'react';

// 图标映射
export const ICONS = {
  // Agent 状态
  'status-idle': '💤',
  'status-working': '⚡',
  'status-thinking': '💭',
  'status-chatting': '💬',
  'status-busy': '⏳',
  'status-offline': '⭕',
  
  // 任务类型
  'task-research': '🔍',
  'task-write': '📝',
  'task-analyze': '📊',
  'task-code': '💻',
  'task-article': '✍️',
  'task-meeting': '🗣️',
  'task-collaborate': '🤝',
  'task-other': '📋',
  
  // 房间
  'room-ceo': '🏢',
  'room-finance': '💰',
  'room-meeting': '🗎',
  'room-tech': '💻',
  'room-rnd': '🔬',
  'room-lobby': '🛋️',
  'room-strategy': '📈',
  'room-entrance': '🚪',
  'room-operations': '📱',
  
  // UI 操作
  'ui-zoom-in': '🔍+',
  'ui-zoom-out': '🔍-',
  'ui-reset': '🎯',
  'ui-help': '❓',
  'ui-close': '✕',
  'ui-menu': '☰',
  'ui-add': '➕',
  'ui-delete': '🗑️',
  'ui-edit': '✏️',
  'ui-save': '💾',
  'ui-refresh': '🔄',
  
  // 装饰
  'decor-star': '⭐',
  'decor-heart': '❤️',
  'decor-fire': '🔥',
  'decor-rocket': '🚀',
  'decor-lightning': '⚡',
  'decor-target': '🎯',
  
  // 系统
  'system-success': '✅',
  'system-warning': '⚠️',
  'system-error': '❌',
  'system-info': 'ℹ️',
  'system-clock': '🕐',
  'system-calendar': '📅',
};

// 图标组件
interface PixelIconProps {
  icon: string;
  size?: number;
  className?: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ 
  icon, 
  size = 20, 
  className = '' 
}) => {
  const iconChar = ICONS[icon as keyof typeof ICONS] || '⬜';
  
  return (
    <span 
      className={`pixel-icon ${className}`}
      style={{ 
        fontSize: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {iconChar}
    </span>
  );
};

// 状态徽章组件
interface StatusBadgeProps {
  status: 'online' | 'busy' | 'offline' | 'thinking';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  label,
  size = 'md' 
}) => {
  const statusConfig = {
    online: { icon: '✅', color: 'var(--enterprise-green)', label: label || '在线' },
    busy: { icon: '⏳', color: 'var(--warning)', label: label || '忙碌' },
    offline: { icon: '⭕', color: 'var(--gray-400)', label: label || '离线' },
    thinking: { icon: '💭', color: '#8B5CF6', label: label || '思考中' },
  };
  
  const config = statusConfig[status];
  
  const sizeStyles = {
    sm: { padding: '2px 6px', fontSize: '10px' },
    md: { padding: '4px 10px', fontSize: '12px' },
    lg: { padding: '6px 14px', fontSize: '14px' },
  };
  
  return (
    <span 
      className="status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: `${config.color}20`,
        border: `2px solid ${config.color}`,
        color: config.color,
        fontFamily: 'var(--font-pixel)',
        ...sizeStyles[size]
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

// 任务类型徽章
interface TaskBadgeProps {
  type: string;
}

export const TaskBadge: React.FC<TaskBadgeProps> = ({ type }) => {
  const taskConfig: Record<string, { icon: string; color: string; label: string }> = {
    'research': { icon: '🔍', color: '#3B82F6', label: '查资料' },
    'write-report': { icon: '📝', color: '#10B981', label: '写报告' },
    'analyze': { icon: '📊', color: '#F59E0B', label: '分析' },
    'code-review': { icon: '💻', color: '#8B5CF6', label: '代码审查' },
    'write-article': { icon: '✍️', color: '#EC4899', label: '写文章' },
    'meeting': { icon: '🗣️', color: '#6366F1', label: '会议' },
    'collaborate': { icon: '🤝', color: '#14B8A6', label: '协作' },
  };
  
  const config = taskConfig[type] || { icon: '📋', color: '#6B7280', label: '其他' };
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        background: `${config.color}15`,
        border: `1px solid ${config.color}`,
        borderRadius: '2px',
        fontSize: '11px',
        color: config.color,
        fontFamily: 'var(--font-pixel)'
      }}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

// 房间图标
interface RoomIconProps {
  roomId: string;
  size?: number;
}

export const RoomIcon: React.FC<RoomIconProps> = ({ roomId, size = 24 }) => {
  const roomIcons: Record<string, string> = {
    'ceo-office': '🏢',
    'finance': '💰',
    'meeting-room': '🗎',
    'tech': '💻',
    'rnd': '🔬',
    'lobby': '🛋️',
    'strategy': '📈',
    'entrance': '🚪',
    'operations': '📱',
  };
  
  return (
    <span style={{ fontSize: size }}>{roomIcons[roomId] || '🏠'}</span>
  );
};

export default {
  PixelIcon,
  StatusBadge,
  TaskBadge,
  RoomIcon,
  ICONS
};
