/**
 * 快速操作工具栏
 * Chen Company Agent World - Quick Action Toolbar
 */

import React from 'react';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
  action: () => void;
  shortcut?: string;
}

interface QuickActionToolbarProps {
  onResetView: () => void;
  onToggleHelp: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddTask: () => void;
  locale: 'zh' | 'en';
}

const QuickActionToolbar: React.FC<QuickActionToolbarProps> = ({
  onResetView,
  onToggleHelp,
  onZoomIn,
  onZoomOut,
  onAddTask,
  locale
}) => {
  const actions: QuickAction[] = [
    { id: 'zoom-in', icon: '🔍+', label: '放大', labelEn: 'Zoom In', action: onZoomIn, shortcut: '+' },
    { id: 'zoom-out', icon: '🔍-', label: '缩小', labelEn: 'Zoom Out', action: onZoomOut, shortcut: '-' },
    { id: 'reset', icon: '🎯', label: '重置', labelEn: 'Reset', action: onResetView, shortcut: 'R' },
    { id: 'task', icon: '➕', label: '新任务', labelEn: 'New Task', action: onAddTask, shortcut: 'T' },
    { id: 'help', icon: '❓', label: '帮助', labelEn: 'Help', action: onToggleHelp, shortcut: '?' },
  ];

  return (
    <div className="quick-action-toolbar">
      {actions.map(action => (
        <button
          key={action.id}
          className="quick-action-btn"
          onClick={action.action}
          title={`${locale === 'zh' ? action.label : action.labelEn} (${action.shortcut})`}
        >
          <span className="action-icon">{action.icon}</span>
          <span className="action-label">{locale === 'zh' ? action.label : action.labelEn}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActionToolbar;
