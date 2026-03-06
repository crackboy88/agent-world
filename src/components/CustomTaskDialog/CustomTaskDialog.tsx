/**
 * 自定义任务对话框
 * Chen Company Agent World - Custom Task Dialog
 */

import React, { useState } from 'react';

interface CustomTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { type: string; content: string; priority: 'low' | 'medium' | 'high' }) => void;
  agentName: string;
}

const TASK_TYPES = [
  { id: 'research', icon: '🔍', label: '查资料', labelEn: 'Research' },
  { id: 'write-report', icon: '📝', label: '写报告', labelEn: 'Write Report' },
  { id: 'analyze', icon: '📊', label: '分析数据', labelEn: 'Analyze' },
  { id: 'code-review', icon: '💻', label: '代码审查', labelEn: 'Code Review' },
  { id: 'write-article', icon: '✍️', label: '写文章', labelEn: 'Write Article' },
  { id: 'meeting', icon: '🗣️', label: '安排会议', labelEn: 'Schedule Meeting' },
  { id: 'collaborate', icon: '🤝', label: '协作任务', labelEn: 'Collaborate' },
  { id: 'other', icon: '📋', label: '其他', labelEn: 'Other' }
];

const CustomTaskDialog: React.FC<CustomTaskDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  agentName 
}) => {
  const [taskType, setTaskType] = useState('research');
  const [taskContent, setTaskContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!taskContent.trim()) return;
    
    onSubmit({
      type: taskType,
      content: taskContent,
      priority
    });
    
    // 重置表单
    setTaskType('research');
    setTaskContent('');
    setPriority('medium');
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>派发任务</h3>
          <button className="dialog-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="dialog-body">
          <div className="dialog-info">
            <span className="agent-badge">👤 {agentName}</span>
          </div>
          
          {/* 任务类型选择 */}
          <div className="form-group">
            <label>任务类型</label>
            <div className="task-type-grid">
              {TASK_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`task-type-btn ${taskType === type.id ? 'active' : ''}`}
                  onClick={() => setTaskType(type.id)}
                >
                  <span className="type-icon">{type.icon}</span>
                  <span className="type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* 任务描述 */}
          <div className="form-group">
            <label>任务描述</label>
            <textarea
              value={taskContent}
              onChange={(e) => setTaskContent(e.target.value)}
              placeholder="详细描述任务内容..."
              rows={4}
            />
          </div>
          
          {/* 优先级 */}
          <div className="form-group">
            <label>优先级</label>
            <div className="priority-selector">
              <button
                className={`priority-btn ${priority === 'low' ? 'active' : ''}`}
                onClick={() => setPriority('low')}
              >
                <span className="priority-dot low"></span>
                低
              </button>
              <button
                className={`priority-btn ${priority === 'medium' ? 'active' : ''}`}
                onClick={() => setPriority('medium')}
              >
                <span className="priority-dot medium"></span>
                中
              </button>
              <button
                className={`priority-btn ${priority === 'high' ? 'active' : ''}`}
                onClick={() => setPriority('high')}
              >
                <span className="priority-dot high"></span>
                高
              </button>
            </div>
          </div>
        </div>
        
        <div className="dialog-footer">
          <button className="btn-cancel" onClick={onClose}>取消</button>
          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={!taskContent.trim()}
          >
            派发任务
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTaskDialog;
