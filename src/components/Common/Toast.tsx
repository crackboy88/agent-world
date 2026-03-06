/**
 * Toast 提示组件 - 任务反馈
 * Chen Company Agent World - Toast Notifications
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../stores';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

/** 颜色常量 */
const COLORS = {
  primary: '#2563EB',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  bg: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
};

/** 单个 Toast 项 */
const ToastItem: React.FC<{ 
  toast: Toast; 
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // 进入动画
    requestAnimationFrame(() => setIsVisible(true));
    
    // 自动关闭
    const duration = toast.duration || 3000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (toast.type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'warning': return COLORS.warning;
      case 'info': return COLORS.info;
      default: return COLORS.primary;
    }
  };

  return (
    <div 
      className={`toast-item ${isVisible ? 'visible' : ''} ${isLeaving ? 'leaving' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        background: COLORS.bg,
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        borderLeft: `4px solid ${getColor()}`,
        transform: isVisible ? 'translateX(0)' : 'translateX(120%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s ease',
        minWidth: 280,
        maxWidth: 360,
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>{getIcon()}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 'bold', fontSize: 14, color: COLORS.text, fontFamily: 'var(--font-pixel)' }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4, fontFamily: 'var(--font-pixel)' }}>
            {toast.message}
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: COLORS.textLight,
          cursor: 'pointer',
          fontSize: 14,
          padding: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
};

/** Toast 容器 */
const ToastContainer: React.FC = () => {
  const { tasks, agents } = useAppStore();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevTaskCountRef = useRef(tasks.length);
  const completedTasksRef = useRef<Set<string>>(new Set());

  // 监听任务变化，生成 Toast
  useEffect(() => {
    const prevCount = prevTaskCountRef.current;
    
    // 新任务派发
    if (tasks.length > prevCount) {
      const newTask = tasks[tasks.length - 1];
      const agent = agents.find(a => a.id === newTask.assignee);
      
      if (agent) {
        const newToast: Toast = {
          id: `toast-${Date.now()}`,
          type: 'info',
          title: '📋 任务已派发',
          message: `已发送给 ${agent.nameZh}`,
          duration: 2500,
        };
        setToasts(prev => [...prev, newToast]);
      }
    }
    
    // 任务完成
    tasks.forEach(task => {
      if (task.status === 'completed' && !completedTasksRef.current.has(task.id)) {
        completedTasksRef.current.add(task.id);
        const agent = agents.find(a => a.id === task.assignee);
        
        const newToast: Toast = {
          id: `toast-complete-${task.id}`,
          type: 'success',
          title: '✅ 任务完成',
          message: agent ? `${agent.nameZh} 完成了任务` : '任务已完成',
          duration: 3000,
        };
        setToasts(prev => [...prev, newToast]);
      }
    });
    
    prevTaskCountRef.current = tasks.length;
  }, [tasks, agents]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
