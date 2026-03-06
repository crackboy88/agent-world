/**
 * 全局状态管理 Store
 * Chen Company Agent World - Global App Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Room, 
  Agent, 
  Task, 
  AgentId, 
  RoomId, 
  AgentState, 
  SidebarTab,
  GlobalStats 
} from '../types';
import { ROOMS_CONFIG } from '../types/room';
import { INITIAL_AGENTS } from '../types/agent';
import { createTask, updateTaskProgress } from '../types/task';
import { socketService } from '../services/socket';

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
  rooms: Room[];
  agents: Agent[];
  tasks: Task[];
  
  // Logs & Messages
  logs: LogEntry[];
  messages: MessageEntry[];
  
  // Selection
  selectedAgentId: AgentId | null;
  selectedRoomId: RoomId | null;
  
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
  updateAgentRoom: (agentId: AgentId, roomId: RoomId) => void;
  setAgentOnline: (agentId: AgentId, isOnline: boolean) => void;
  setAgentMood: (agentId: AgentId, mood: 'positive' | 'neutral' | 'negative') => void;
  
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
  selectRoom: (roomId: RoomId | null) => void;
  
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
  getRoomById: (id: RoomId) => Room | undefined;
  getTasksByAgent: (agentId: AgentId) => Task[];
  getGlobalStats: () => GlobalStats;
}

// 创建 Store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      rooms: [],
      agents: [],
      tasks: [],
      logs: [],
      messages: [],
      selectedAgentId: null,
      selectedRoomId: null,
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
        set({
          rooms: ROOMS_CONFIG,
          agents: INITIAL_AGENTS,
          tasks: [],
          selectedAgentId: null,
          selectedRoomId: null,
        });
        
        // 启动时间更新
        get().updateCurrentTime();
        setInterval(() => get().updateCurrentTime(), 1000);
        
        // 连接 Socket
        get().connectSocket();
      },
      
      // Socket 连接
      connectSocket: () => {
        // 设置事件回调
        socketService.onAgentUpdate = (agents) => {
          set({ agents });
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
        
        socketService.onGatewayStatus = (status) => {
          set({ 
            gatewayConnected: status.connected,
            gatewayUrl: status.url
          });
        };
        
        socketService.onGatewayEvent = (event) => {
          console.log('Gateway event:', event.type, event.data);
          // 可以在这里处理各种 Gateway 事件
        };
        
        socketService.connect();
      },
      
      disconnectSocket: () => {
        socketService.disconnect();
      },
      
      // Gateway 连接
      connectGateway: (wsUrl: string) => {
        socketService.connectGateway(wsUrl);
      },
      
      disconnectGateway: () => {
        socketService.disconnectGateway();
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
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { ...a, position } : a
          )
        }));
      },
      
      updateAgentRoom: (agentId, roomId) => {
        const room = get().rooms.find(r => r.id === roomId);
        if (!room) return;
        
        // 计算房间中心位置
        const targetPosition = {
          x: room.position.x + room.position.width / 2,
          y: room.position.y + room.position.height / 2
        };
        
        set((s) => ({
          agents: s.agents.map(a => 
            a.id === agentId ? { 
              ...a, 
              currentRoom: roomId,
              targetPosition,
              animation: 'walk'
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
            message: `📤 任务已发送: ${task.title}`
          });
        } else {
          get().addLog({
            type: 'warning',
            message: '⚠️ Gateway 未连接，任务仅保存在本地'
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
      
      selectRoom: (roomId) => {
        set({ selectedRoomId: roomId });
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
      
      getRoomById: (id) => {
        return get().rooms.find(r => r.id === id);
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
      })
    }
  )
);

export default useAppStore;
