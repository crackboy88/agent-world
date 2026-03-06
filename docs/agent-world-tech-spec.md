# Agent 可视化平台技术方案

> 创建日期：2026-03-05
> 项目名称：Chen Company Agent World

---

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Frontend)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  地图渲染   │  │  侧边栏    │  │   全局状态/统计     │  │
│  │  (Canvas)   │  │ (React)     │  │    (React)          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Node.js/Express)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  WebSocket  │  │  Agent 状态  │  │   配置管理          │  │
│  │  Server     │  │  Manager    │  │   (JSON 文件)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      OpenClaw Gateway                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  sessions_  │  │  消息转发   │  │   状态同步          │  │
│  │  list/history│  │            │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术栈

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| 前端框架 | React + TypeScript | 组件化、状态管理成熟 |
| 地图渲染 | Konva.js / PixiJS | 2D  Canvas 渲染，性能好 |
| 状态管理 | Zustand | 轻量级，比 Redux 简单 |
| 后端 | 已移除，直连 Gateway |
| 实时通信 | Socket.io | WebSocket 封装，兼容性好 |
| 部署 | WSL 本地运行 | 用户要求 |

---

## 2. 前端设计

### 2.1 目录结构

```
agent-visualization/
├── public/
│   ├── assets/
│   │   ├── characters/     # agent 形象素材
│   │   ├── rooms/          # 房间背景图
│   │   └── furniture/      # 家具素材
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Map/            # 地图相关组件
│   │   │   ├── CanvasMap.tsx
│   │   │   ├── Room.tsx
│   │   │   ├── AgentSprite.tsx
│   │   │   ├── ConnectionLine.tsx
│   │   │   └── Furniture.tsx
│   │   ├── Sidebar/        # 侧边栏
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AgentInfo.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── TaskButtons.tsx
│   │   │   ├── LogPanel.tsx
│   │   │   └── StatsPanel.tsx
│   │   ├── Header/          # 顶部栏
│   │   │   ├── GlobalStats.tsx
│   │   │   └── Clock.tsx
│   │   └── common/         # 通用组件
│   ├── stores/             # Zustand stores
│   │   ├── agentStore.ts
│   │   ├── roomStore.ts
│   │   └── uiStore.ts
│   ├── hooks/              # 自定义 hooks
│   ├── services/          # API 服务
│   │   ├── websocket.ts
│   │   └── openclaw.ts
│   ├── types/              # TypeScript 类型
│   ├── i18n/               # 国际化
│   │   ├── en.json
│   │   └── zh.json
│   ├── utils/              # 工具函数
│   │   ├── pathfinding.ts  # A* 路径规划
│   │   └── animation.ts    # 动画工具
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### 2.2 核心组件设计

#### 2.2.1 地图组件 (CanvasMap)

```typescript
interface CanvasMapProps {
  width: number;
  height: number;
  scale: number;
  offset: { x: number; y: number };
}

// 主要功能：
// - 使用 Konva.js 渲染 2D 俯视图
// - 支持缩放 (scale 0.5 - 3)
// - 支持拖拽平移
// - 渲染房间、agent、家具、连线
```

#### 2.2.2 Agent 精灵 (AgentSprite)

```typescript
interface AgentSprite {
  id: string;
  name: string;
  avatar: string;          // 2D 形象图片
  position: { x: number; y: number };
  targetPosition?: { x: number; y: number };  // 移动目标
  state: AgentState;
  mood: Mood;
  skills: string[];
  progress?: number;       // 任务进度 0-100
  isOnline: boolean;
  animation: AnimationType; // idle, walking, thinking, working
}

type AgentState = 'idle' | 'thinking' | 'working' | 'chatting' | 'offline';
type Mood = 'happy' | 'neutral' | 'stressed' | 'tired';
type AnimationType = 'idle' | 'walk' | 'work' | 'think';
```

#### 2.2.3 侧边栏 (Sidebar)

```typescript
interface SidebarProps {
  agentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// 布局：
// ┌─────────────────┐
// │  Agent 头像      │
// │  名字 + 状态    │
// │  技能标签       │
// ├─────────────────┤
// │ [任务按钮1]     │
// │ [任务按钮2]     │
// ├─────────────────┤
// │ [对话] [日志]   │
// │                │
// │  内容区域       │
// │                │
// ├─────────────────┤
// │ 活跃统计        │
// │ 工时统计        │
// └─────────────────┘
```

### 2.3 状态管理 (Zustand)

```typescript
// agentStore.ts
interface AgentStore {
  agents: Map<string, AgentSprite>;
  
  // Actions
  updateAgent: (id: string, data: Partial<AgentSprite>) => void;
  moveAgent: (id: string, target: { x: number; y: number }) => void;
  addAgent: (agent: AgentSprite) => void;
  removeAgent: (id: string) => void;
  
  // Selectors
  getOnlineAgents: () => AgentSprite[];
  getAgentById: (id: string) => AgentSprite | undefined;
}

// roomStore.ts
interface RoomStore {
  rooms: Room[];
  
  getRoomById: (id: string) => Room | undefined;
  getAgentRoom: (agentId: string) => Room | undefined;
}

// uiStore.ts
interface UIStore {
  selectedAgentId: string | null;
  sidebarOpen: boolean;
  activeTab: 'chat' | 'log';
  language: 'zh' | 'en';
  globalStats: GlobalStats;
}
```

---

## 3. 架构设计（2026-03-06 更新）

### 3.1 当前架构：前端直连 Gateway

```
前端 (React) → OpenClaw Gateway (WebSocket)
```

### 3.2 直连 Gateway

前端通过 WebSocket 直接连接 OpenClaw Gateway，无需后端服务器。

```typescript
// 直接连接 Gateway
const ws = new WebSocket('ws://localhost:18789/?token=xxx');
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // 处理事件
};
```

### 3.3 Gateway 事件处理

```typescript
// ping/pong 保持连接
if (message.nonce && message.ts) {
  ws.send(JSON.stringify({ type: 'pong', nonce: message.nonce, ts: message.ts }));
}

// 处理事件
if (message.type === 'event') {
  const payload = message.payload;
  // 解析 chat, invoke, presence 等事件
}
```
  // 订阅实时消息（通过 WebSocket 或轮询）
  subscribe(callback: (message: Message) => void): void;
}
```

---

## 4. 核心功能实现

### 4.1 路径规划 (A* 算法)

```typescript
// 使用 A* 算法实现 agent 移动路径规划
interface PathNode {
  x: number;
  y: number;
  walkable: boolean;
}

function findPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  obstacles: PathNode[]
): { x: number; y: number }[];

// 房间布局示例：
// ┌────┬────┬────┬────┐
// │前台│CEO │会议室│走廊│
// ├────┼────┼────┼────┤
// │技术│财务│    │    │
// ├────┼────┼────┼────┤
// │实验│战略│    │    │
// └────┴────┴────┴────┘
```

### 4.2 动画系统 - Sprite 图集方案

#### 4.2.1 为什么用 Sprite 图集

| 方案 | 优点 | 缺点 |
|------|------|------|
| 实时绘制矩形 | 灵活可交互 | 性能差 (~40 元素/Agent) |
| **Sprite 图集** | **性能好，1次绘制** | 需要预生成 |

#### 4.2.2 实现方式

```typescript
// 1. 预生成所有动画帧为图片
function generateAgentFrame(agentId, frame, size): string {
  // Canvas 绘制像素角色
  // 返回 base64 图片
}

// 2. 缓存 Sprite
let spriteCache: Map<string, AgentSprite> | null = null;

export function getSpriteCache(): Map<string, AgentSprite> {
  if (!spriteCache) {
    spriteCache = generateAllSprites(); // 启动时生成
  }
  return spriteCache;
}

// 3. 渲染时直接用 Image 组件
<Image 
  image={img}
  width={128}
  height={128}
/>
```

#### 4.2.3 配置参数

```typescript
const SPRITE_CONFIG = {
  frameCount: 4,      // 动画帧数
  spriteSize: 256,     // Sprite 图片分辨率
  characterSize: 128,  // 角色显示尺寸(px)
  animationSpeed: 300, // 动画间隔(ms)
};
```

#### 4.2.4 性能对比

| 指标 | 实时绘制 | Sprite 图集 |
|------|----------|-------------|
| DOM/Konva 元素 | ~40/Agent | 1/Agent |
| 内存占用 | 低 | 中等(预生成图片) |
| 渲染性能 | 差 | 优 |

```

### 4.3 配置持久化

```typescript
// 保存到 data/config.json
interface AppConfig {
  agents: AgentConfig[];
  rooms: RoomConfig[];
  tasks: TaskConfig[];
  language: 'zh' | 'en';
  
  // 窗口位置、大小
  windowState: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  };
}

function saveConfig(config: AppConfig): void;
function loadConfig(): AppConfig;
```

---

## 5. 国际化 (i18n)

```typescript
// zh.json
{
  "header": {
    "onlineAgents": "在线 Agent",
    "runningTasks": "进行中任务",
    "totalMessages": "总消息数"
  },
  "sidebar": {
    "chat": "对话",
    "log": "日志",
    "stats": "统计",
    "tasks": "任务",
    "sendMessage": "发送消息...",
    "workTime": "工作时间",
    "messagesToday": "今日消息"
  },
  "agents": {
    "main": "CEO",
    "code-expert": "技术总监",
    "financial-analyst": "财务总监",
    "materials-scientist": "研发总监",
    "political-analyst": "战略总监"
  },
  "tasks": {
    "research": "查资料",
    "writeReport": "写报告",
    "analyze": "分析数据",
    "brainstorm": "头脑风暴"
  },
  "states": {
    "idle": "空闲",
    "thinking": "思考中",
    "working": "工作中",
    "chatting": "对话中",
    "offline": "离线"
  }
}
```

---

## 6. 部署方案

### 6.1 开发环境

```bash
cd agent-visualization
npm install
npm run dev  # http://localhost:5173
```

前端会直接连接 Gateway，无需启动额外服务。

### 6.2 生产环境

```bash
cd agent-visualization
npm run build
```

### 6.3 端口规划

| 服务 | 端口 |
|------|------|
| 前端 (Vite) | 5173 |
| Gateway | 18789 |
---

## 7. 开发计划

### Phase 1: 基础框架
- [ ] 项目初始化（仅前端）
- [ ] 基础地图渲染（房间、家具）
- [ ] WebSocket 基础通信

### Phase 2: Agent 系统
- [ ] Agent 状态管理
- [ ] Agent 形象渲染（静态）
- [ ] Agent 移动与路径规划

### Phase 3: 交互功能
- [ ] 侧边栏开发
- [ ] 对话功能
- [ ] 任务派发

### Phase 4: 高级功能
- [ ] OpenClaw 集成
- [ ] 动画系统完善
- [ ] 协作关系可视化

### Phase 5: 优化
- [ ] 性能优化
- [ ] 配置持久化
- [ ] 国际化
- [ ] 测试与 Bug 修复

---

## 8. 待确认/待讨论

1. **OpenClaw API 细节** - 如何获取 agent 状态、实时消息
2. **AI 角色形象生成** - 使用什么工具生成 2D 动画形象
3. **房间布局具体设计** - 需要出详细的房间平面图
4. **预设任务内容** - 具体有哪些任务类型

---

## 9. 风险与挑战

| 风险 | 缓解措施 |
|------|---------|
| OpenClaw 实时状态获取 | 先用轮询实现，后期优化 WebSocket |
| 2D 动画素材生成 | 使用 AI 工具批量生成 |
| 性能（多 agent 同时移动） | 使用 Canvas 批量渲染，优化动画 |
| 路径规划复杂度 | 先实现简单直线路径，再升级 A* |

---

## 10. 预期效果

```
┌─────────────────────────────────────────────────────────────────┐
│  🟢 3 在线  │  ⚙️ 2 任务  │  💬 15  │     12:30:45            │
│  全局统计   │        (顶部居中)                              │
├───────────────────────────────────────┬─────────────────────────┤
│                                       │  💻 code-expert         │
│   ┌─────┐    ┌─────┐    ┌─────┐     │  🟢 工作中             │
│   │ 💬  │    │ 💻  │    │ 📈  │     │  💻 技术               │
│   │ main│◄──►│code │◄──►│ fin │     ├─────────────────────────┤
│   └─────┘    └─────┘    └─────┘     │ [查资料] [写报告]       │
│        ↘          ↗                  │ [分析]   [头脑风暴]    │
│   ┌─────┐    ┌─────┐                ├─────────────────────────┤
│   │ 🔬  │    │ 🌍  │                │ [对话]  [日志]          │
│   │scient│   │pol  │                │                         │
│   └─────┘    └─────┘                │ > 12:25 收到任务        │
│                                       │ > 12:26 正在分析...     │
│  (办公楼俯视图)                       │ > 12:28 完成任务        │
│                                       ├─────────────────────────┤
│                                       │ 📊 今日: 5任务 12消息   │
│                                       │ ⏱️ 工时: 2h 15m         │
└───────────────────────────────────────┴─────────────────────────┘
```

---

> 文档状态：初稿，待评审
> 下一步：确认技术方案 → 开始 Phase 1 开发
