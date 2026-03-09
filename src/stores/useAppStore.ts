/**
 * 全局状态管理 Store
 * Chen Company Agent World - Global App Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  MapItem,
  Agent, 
  Task, 
  AgentId, 
  MapId, 
  AgentState, 
  SidebarTab,
  GlobalStats 
} from '../types';
import { createTask, updateTaskProgress } from '../types/task';
import { socketService } from '../services/socket';

// 从 identity.md 读取 emoji
const agentIdentityCache: Record<string, string> = {};

const getAgentEmoji = (agentId: string): string => {
  if (agentIdentityCache[agentId]) {
    return agentIdentityCache[agentId];
  }
  
  // 默认 emoji 映射（基于 Agent ID）
  const defaultEmojis: Record<string, string> = {
    'main': '💬',
    'code-expert': '💻',
    'financial-analyst': '📈',
    'materials-scientist': '🔬',
    'political-analyst': '🌍',
    'zhihu': '📝',
  };
  
  return defaultEmojis[agentId] || '🤖';
};

// 日志类型
interface LogEntry {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
}

// 消息类型
interface MessageEntry {
  id: string;
  agentId: string;
  content: string;
  type: 'incoming' | 'outgoing';
  timestamp: number;
}

// Store 状态接口
interface AppState {
  // Data
  maps: MapItem[];
  agents: Agent[];
  
  // Agent appearances (user configured)
  agentAppearances: Record<string, { modelId?: string; modelUrl?: string; color?: string }>;
  tasks: Task[];
  
  // Logs & Messages
  logs: LogEntry[];
  messages: MessageEntry[];
  
  // Selection
  selectedAgentId: AgentId | null;
  selectedMapId: MapId | null;
  
  // UI State
  sidebarOpen: boolean;
  sidebarTab: SidebarTab;
  sidebarWidth: number;
  mapScale: number;
  mapOffset: { x: number; y: number };
  currentTime: string;
  locale: 'zh' | 'en';
  
  // Gateway State
  gatewayConnected: boolean;
  gatewayUrl: string;
  
  // Actions - Data
  initializeStore: () => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  connectGateway: (wsUrl: string) => void;
  disconnectGateway: () => void;
  updateAgentState: (agentId: AgentId, state: AgentState) => void;
  setAgentState: (agentId: string, state: string, progress?: number) => void;
  updateAgentPosition: (agentId: AgentId, position: { x: number; y: number }) => void;
  updateAgentLocation: (agentId: AgentId, locationId: MapId) => void;
  setAgentOnline: (agentId: AgentId, isOnline: boolean) => void;
  setAgentMood: (agentId: AgentId, mood: 'positive' | 'neutral' | 'negative') => void;
  updateAgentAppearance: (agentId: AgentId, appearance: { modelId?: string; modelUrl?: string; color?: string }) => void;
  
  // Actions - Tasks
  assignTask: (agentId: AgentId, taskType: Task['type']) => string;
  sendTask: (agentId: AgentId | null, task: {
    type: string;
    title: string;
    description?: string;
    priority?: Task['priority'];
    params?: Record<string, unknown>;
  }) => string;
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
  
  // Actions - Logs & Messages
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  addMessage: (entry: Omit<MessageEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  
  // Actions - Selection
  selectAgent: (agentId: AgentId | null) => void;
  selectMap: (locationId: MapId | null) => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setSidebarWidth: (width: number) => void;
  setMapScale: (scale: number) => void;
  setMapOffset: (offset: { x: number; y: number }) => void;
  updateCurrentTime: () => void;
  setLocale: (locale: 'zh' | 'en') => void;
  
  // Getters
  getAgentById: (id: AgentId) => Agent | undefined;
  getMapById: (id: MapId) => MapItem | undefined;
  getTasksByAgent: (agentId: AgentId) => Task[];
  getGlobalStats: () => GlobalStats;
}

// 创建 Store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      maps: [],
      agents: [],
      agentAppearances: (() => {
        try {
          const saved = localStorage.getItem('agent-appearances');
          return saved ? JSON.parse(saved) : {};
        } catch {
          return {};
        }
      })(),
      tasks: [],
      logs: [],
      messages: [],
      selectedAgentId: null,
      selectedMapId: null,
      sidebarOpen: true,
      sidebarTab: 'tasks',
      sidebarWidth: 720,
      mapScale: 0.8,      // 初始缩放比例0.8，适配放大后的元素
      mapOffset: { x: 0, y: 120 }, // 初始偏移，匹配Header高度避免遮挡
      currentTime: '00:00:00',
      locale: 'zh',
      gatewayConnected: false,
      gatewayUrl: '',
      
      // Initialize Store
      initializeStore: () => {
        // Don't reset agentAppearances - let persist middleware handle it
        set({
          maps: [],
          tasks: [],
          selectedAgentId: null,
          selectedMapId: null,
        });
        
        // 启动时间更新
        get().updateCurrentTime();
        setInterval(() => get().updateCurrentTime(), 1000);
        
        // 连接 Socket
        get().connectSocket();
      },
      
      // Socket 连接
      connectSocket: () => {
        // Always set up callbacks - they may not be called if already set
        // Remove the guard that prevented re-setup
        // 设置事件回调 - 合并更新而非覆盖
        socketService.onAgentUpdate = (updatedAgents) => {
          const currentAgents = get().agents;
          
          // 过滤掉无效的 agent
          const validUpdated = updatedAgents.filter((a: Agent) => a.id && a.id.trim() !== '');
          
          // 创建当前 agent 的 map
          const currentMap = new Map(currentAgents.map(a => [a.id, a]));
          
          // 合并更新：保留现有 agent，更新匹配的，添加新的
          const mergedAgents = currentAgents.map(existing => {
            const updated = validUpdated.find((a: Agent) => a.id === existing.id);
            if (updated) {
              // 合并更新，保持本地扩展的字段
              return { 
                ...existing, 
                ...updated,
                // 确保关键字段不被覆盖
                position: updated.position || existing.position,
                animation: updated.animation || existing.animation,
              };
            }
            return existing;
          });
          
          // 添加 Gateway 返回的 新 agent（不在当前列表中的）
          validUpdated.forEach((updated: Agent) => {
            if (!currentMap.has(updated.id)) {
              // 新 agent，使用 Gateway 数据，添加默认字段
              mergedAgents.push({
                id: updated.id,
                name: updated.name || updated.id,
                emoji: updated.emoji || getAgentEmoji(updated.id),
                isOnline: updated.isOnline !== false,
                state: updated.state || 'idle',
                currentLocation: updated.currentLocation || 'lobby',
                position: updated.position || { x: 512 + Math.random() * 200, y: 512 + Math.random() * 200 },
                targetPosition: updated.targetPosition,
                animation: updated.animation || 'idle',
                mood: updated.mood || 'neutral',
              });
            }
          });
          
          set({ agents: mergedAgents });
        };
        
        // Gateway 连接后获取 agent 列表
        socketService.onGatewayStatus = async (status) => {
          set({ 
            gatewayConnected: status.connected,
            gatewayUrl: status.url
          });
          
          if (status.connected) {
            // 连接成功后从 Gateway 获取 agent 列表
            try {
              const gatewayAgents = await socketService.listAgents();
              if (gatewayAgents && gatewayAgents.length > 0) {
                // 使用 Gateway 返回的 agent 列表
                const agents: Agent[] = gatewayAgents.map((a: Agent) => ({
                  id: a.id,
                  name: a.name || a.id,
                  emoji: a.emoji || getAgentEmoji(a.id),
                  isOnline: a.isOnline !== false,
                  state: a.state || 'idle',
                  currentLocation: a.currentLocation || 'lobby',
                  position: a.position || { x: 512 + Math.random() * 200, y: 512 + Math.random() * 200 },
                  targetPosition: a.targetPosition,
                  animation: a.animation || 'idle',
                  mood: a.mood || 'neutral',
                }));
                set({ agents });
                
                get().addLog({
                  type: 'success',
                  message: `📥 Fetched ${agents.length}  Agents`
                });
              }
            } catch (error) {
              console.error('Failed to fetch agents from Gateway:', error);
            }
          }
        };
        
        socketService.onMessage = (data) => {
          get().addMessage({
            agentId: data.message.agentId,
            content: data.message.content,
            type: data.message.type
          });
        };
        
        socketService.onLog = (log) => {
          get().addLog({
            type: log.type as 'info' | 'warning' | 'error' | 'success',
            message: log.message
          });
        };
        
        socketService.onGatewayEvent = (event) => {
          console.log('Gateway event:', event.type, event.data);
        };
        
        // 连接 Socket
        socketService.connect();
        
        // 获取 agent 列表（只调用一次）
        const agentsFetched = { done: false };
        const fetchAgents = async () => {
          // fetchAgents called if (agentsFetched.done) return;
          
          try {
            const gatewayAgents = await socketService.listAgents();
            if (gatewayAgents && gatewayAgents.length > 0) {
              // 过滤掉无效的 agent（没有 id）
              const validAgents = gatewayAgents.filter((a: Agent) => a.id && a.id.trim() !== '');
              
              const agents: Agent[] = validAgents.map((a: Agent) => ({
                id: a.id,
                name: a.name || a.id,
                emoji: a.emoji || getAgentEmoji(a.id),
                isOnline: a.isOnline !== false,
                state: a.state || 'idle',
                currentLocation: a.currentLocation || 'lobby',
                position: a.position || { x: 512 + Math.random() * 200, y: 512 + Math.random() * 200 },
                targetPosition: a.targetPosition,
                animation: a.animation || 'idle',
                mood: a.mood || 'neutral',
              }));
              set({ agents });
              get().addLog({
                type: 'success',
                message: `📥 Fetched ${agents.length}  Agents`
              });
            }
          } catch (e) {
            console.error('Failed to fetch agents:', e);
            // 如果失败，1秒后重试
            setTimeout(() => {
              agentsFetched.done = false;
              fetchAgents();
            }, 1000);
          }
        };
        
        // 等待连接成功后通过回调获取 agent
        socketService.onConnectionChange = (connected) => {
          if (connected) {
            fetchAgents();
          }
        };
      },
      
      disconnectSocket: () => {
        socketService.disconnect();
      },
      
      // Gateway 连接
      connectGateway: (wsUrl: string) => {
        // 解析 URL 中的 token 参数
        try {
          const url = new URL(wsUrl);
          const token = url.searchParams.get('token');
          if (token) {
            localStorage.setItem('oc-device-token', token);
            // 移除 token 参数，只保留基础 URL
            url.searchParams.delete('token');
            wsUrl = url.toString();
          }
        } catch (e) {
          // URL 解析失败，使用原始值
        }
        socketService.connectGateway(wsUrl);
      },
      
      disconnectGateway: () => {
        socketService.disconnectGateway();
        set({ gatewayConnected: false });
      },
      
      // Agent Actions
      updateAgentState: (agentId, state) => {
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { ...a, state } : a
          )
        }));
      },
      
      setAgentState: (agentId, state, progress) => {
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              state: state as AgentState,
              progress: progress !== undefined ? progress : a.progress
            } : a
          )
        }));
      },
      
      updateAgentPosition: (agentId, position) => {
        // Move agent to position - start walking animation
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              position,
              targetPosition: position,
              state: 'walking' as AgentState,
              animation: 'walk'
            } : a
          )
        }));
        
        // After a short delay, set back to idle
        setTimeout(() => {
          set((s) => ({
            agents: s.agents.map(a => 
              a.id === agentId ? { 
                ...a, 
                state: 'idle' as AgentState,
                animation: 'idle'
              } : a
            )
          }));
        }, 2000); // Assume it takes 2 seconds to move
      },
      
      updateAgentLocation: (agentId, locationId) => {
        // Simple flat map - just move to a random position
        const targetPosition = {
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100
        };
        
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              currentLocation: locationId,
              targetPosition,
              animation: 'walk',
              state: 'walking' as AgentState
            } : a
          )
        }));
      },
      
      setAgentOnline: (agentId, isOnline) => {
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              isOnline,
              state: isOnline ? 'idle' : 'offline'
            } : a
          )
        }));
      },
      
      setAgentMood: (agentId, mood) => {
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { ...a, mood } : a
          )
        }));
      },
      
      updateAgentAppearance: (agentId, appearance) => {
        set((s) => {
          const newAppearances = {
            ...s.agentAppearances,
            [agentId]: {
              ...s.agentAppearances[agentId],
              ...appearance
            }
          };
          // 保存到 localStorage
          localStorage.setItem('agent-appearances', JSON.stringify(newAppearances));
          return { agentAppearances: newAppearances };
        });
      },
      
      // Logs & Messages Actions
      addLog: (entry) => {
        const log: LogEntry = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          ...entry
        };
        set((s) => ({
          logs: [...s.logs.slice(-99), log] // 保留最近100条
        }));
      },
      
      addMessage: (entry) => {
        const message: MessageEntry = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          ...entry
        };
        set((s) => ({
          messages: [...s.messages.slice(-99), message] // 保留最近100条
        }));
      },
      
      clearLogs: () => {
        set({ logs: [] });
      },
      
      // Task Actions
      assignTask: (agentId, taskType) => {
        const task = createTask(taskType, agentId);
        set((s) => ({
          tasks: [...s.tasks, task],
          agents: s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              state: 'working' as AgentState,
              progress: 0
            } : a
          )
        }));
        return task.id;
      },
      
      // Send task to Gateway via socket
      sendTask: (agentId, task) => {
        // Create local task first
        const localTask = createTask(
          task.type as Task['type'],
          agentId ?? undefined,
          'user'
        );
        
        // Update local state
        set((s) => ({
          tasks: [...s.tasks, { ...localTask, status: 'assigned' as const }],
          agents: agentId ? s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              state: 'working' as AgentState,
              progress: 0
            } : a
          ) : s.agents
        }));
        
        // Send to Gateway if connected
        if (socketService.isConnected()) {
          socketService.sendTask(
            agentId ?? null,
            task
          );
          
          get().addLog({
            type: 'info',
            message: `📤 Task sent: ${task.title}`
          });
        } else {
          get().addLog({
            type: 'warning',
            message: '⚠️ Gateway not connected, task saved locally'
          });
        }
        
        return localTask.id;
      },
      
      updateTaskProgress: (taskId, progress) => {
        set((s) => ({
          tasks: s.tasks.map(t => 
            t.id === taskId ? updateTaskProgress(t, progress) : t
          ),
          agents: s.agents.map(a => {
            const task = s.tasks.find(t => t.id === taskId);
            if (task && task.assignee === a.id) {
              return { ...a, progress };
            }
            return a;
          })
        }));
      },
      
      completeTask: (taskId) => {
        set((s) => ({
          tasks: s.tasks.map(t => 
            t.id === taskId ? { 
              ...t, 
              status: 'completed' as const,
              progress: 100,
              completedAt: Date.now()
            } : t
          ),
          agents: s.agents.map(a => {
            const task = s.tasks.find(t => t.id === taskId);
            if (task && task.assignee === a.id) {
              return { 
                ...a, 
                state: 'idle' as AgentState,
                progress: undefined,
                mood: 'positive' as const
              };
            }
            return a;
          })
        }));
      },
      
      // Selection Actions
      selectAgent: (agentId) => {
        set({ 
          selectedAgentId: agentId,
          sidebarOpen: agentId !== null
        });
      },
      
      selectMap: (locationId) => {
        set({ selectedMapId: locationId });
      },
      
      // UI Actions
      toggleSidebar: () => {
        set((s) => ({ sidebarOpen: !s.sidebarOpen }));
      },
      
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
      
      setSidebarTab: (tab) => {
        set({ sidebarTab: tab });
      },
      
      setSidebarWidth: (width) => {
        set({ sidebarWidth: width });
      },
      
      setMapScale: (scale) => {
        // 缩放范围限制：0.5 ~ 1.5
        const clampedScale = Math.max(0.5, Math.min(1.5, scale));
        set({ mapScale: clampedScale });
      },
      
      setMapOffset: (offset) => {
        set({ mapOffset: offset });
      },
      
      updateCurrentTime: () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        set({ currentTime: `${hours}:${minutes}:${seconds}` });
      },
      
      setLocale: (locale) => {
        set({ locale });
      },
      
      // Getters
      getAgentById: (id) => {
        return get().agents.find(a => a.id === id);
      },
      
      getMapById: (id) => {
        return get().maps.find(r => r.id === id);
      },
      
      getTasksByAgent: (agentId) => {
        return get().tasks.filter(t => t.assignee === agentId);
      },
      
      getGlobalStats: () => {
        const agents = get().agents;
        const tasks = get().tasks;
        
        return {
          onlineAgents: agents.filter(a => a.isOnline).length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          uptime: get().currentTime
        };
      }
    }),
    {
      name: 'chen-company-agent-world',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Gateway connection config
        gatewayUrl: state.gatewayUrl,
        // User preferences
        locale: state.locale,
        // UI preferences
        mapScale: state.mapScale,
        mapOffset: state.mapOffset,
        sidebarOpen: state.sidebarOpen,
        sidebarWidth: state.sidebarWidth,
        sidebarTab: state.sidebarTab,
        // Agent data (positions, appearances)
        agents: state.agents,
        agentAppearances: state.agentAppearances,
      })
    }
  )
);

export default useAppStore;
