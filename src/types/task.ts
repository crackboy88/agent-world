/**
 * 任务类型定义
 * Chen Company Agent World - Task Types
 */

import type { AgentId } from './agent';

// 任务状态
export type TaskStatus = 
  | 'pending'     // 待处理
  | 'assigned'    // 已分配
  | 'running'     // 执行中
  | 'completed'   // 已完成
  | 'failed';    // 失败

// 任务类型
export type TaskType = 
  | 'research'       // 查资料
  | 'write-report'   // 写报告
  | 'analyze'        // 分析数据
  | 'collaborate'    // 发起协作
  | 'custom';        // 自定义任务

// 任务优先级
export type TaskPriority = 
  | 'low' 
  | 'normal' 
  | 'high' 
  | 'urgent';

// 任务接口
export interface Task {
  id: string;
  title: string;
  titleZh: string;
  titleEn: string;
  description?: string;
  type: TaskType;
  assignee?: AgentId;        // 分配给哪个Agent
  creator?: string;          // 创建者
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;         // 进度 0-100
  createdAt: number;         // 创建时间戳
  updatedAt: number;         // 更新时间戳
  completedAt?: number;      // 完成时间戳
}

// 预设任务类型配置
export interface TaskTypeConfig {
  type: TaskType;
  icon: string;
  labelZh: string;
  labelEn: string;
}

// 预设任务配置
export const PRESET_TASK_TYPES: TaskTypeConfig[] = [
  { type: 'research', icon: '🔍', labelZh: '查资料', labelEn: 'Research' },
  { type: 'write-report', icon: '📝', labelZh: '写报告', labelEn: 'Write Report' },
  { type: 'analyze', icon: '📊', labelZh: '分析数据', labelEn: 'Analyze' },
  { type: 'collaborate', icon: '🤝', labelZh: '发起协作', labelEn: 'Collaborate' }
];

// 预设任务按钮配置（用于UI显示）
export const PRESET_TASK_BUTTONS: { type: TaskType; labelZh: string; labelEn: string }[] = [
  { type: 'research', labelZh: '查资料', labelEn: 'Research' },
  { type: 'write-report', labelZh: '写报告', labelEn: 'Write Report' },
  { type: 'analyze', labelZh: '分析数据', labelEn: 'Analyze' },
  { type: 'collaborate', labelZh: '发起协作', labelEn: 'Collaborate' }
];

// 创建新任务
export function createTask(
  type: TaskType,
  assignee?: AgentId,
  creator?: string
): Task {
  const now = Date.now();
  const typeConfig = PRESET_TASK_TYPES.find(t => t.type === type);
  
  return {
    id: `task-${now}-${Math.random().toString(36).substr(2, 9)}`,
    title: typeConfig ? typeConfig.labelZh : '自定义任务',
    titleZh: typeConfig ? typeConfig.labelZh : '自定义任务',
    titleEn: typeConfig ? typeConfig.labelEn : 'Custom Task',
    type,
    assignee,
    creator,
    status: 'pending',
    priority: 'normal',
    progress: 0,
    createdAt: now,
    updatedAt: now
  };
}

// 更新任务进度
export function updateTaskProgress(task: Task, progress: number): Task {
  const newProgress = Math.min(100, Math.max(0, progress));
  const isCompleted = newProgress >= 100;
  
  return {
    ...task,
    progress: newProgress,
    status: isCompleted ? 'completed' : task.status,
    updatedAt: Date.now(),
    completedAt: isCompleted ? Date.now() : undefined
  };
}

// 获取任务状态颜色
export function getTaskStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    'pending': '#9CA3AF',   // 灰色
    'assigned': '#60A5FA',  // 浅蓝
    'running': '#F59E0B',   // 黄色
    'completed': '#10B981', // 绿色
    'failed': '#EF4444'     // 红色
  };
  return colors[status];
}

// 获取任务类型显示名称
export function getTaskTypeName(task: Task, locale: 'zh' | 'en' = 'zh'): string {
  return locale === 'zh' ? task.titleZh : task.titleEn;
}
