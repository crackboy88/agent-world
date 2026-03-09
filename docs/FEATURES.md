# Agent World 功能文档

> 记录 UI 界面与功能的对应关系，确保修改时保持一致性

---

## 1. 项目概览

- **项目名称**: Agent World
- **技术栈**: React + TypeScript + Vite + Zustand + Three.js/R3F + Socket.io
- **后端服务**: Express + Socket.io (端口 3001)
- **前端端口**: 5173

---

## 2. 页面布局

```
┌─────────────────────────────────────────────────────────────┐
│  🌐 Agent World                              [EN]          │  <- Header
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  🔗 Link   │                                                │
│  🤖 Agents │                                                │
│  ⏰ Cron   │              Agent 列表 / 3D 场景              │  <- Main Content
│  📜 Logs   │                                                │
│  ⚙️ Settings│                                                │
│            │                                                │
├────────────┴────────────────────────────────────────────────┤
│  ● 6 Online  ⚡ 0 Running  📋 0 Total                     │  <- Footer
└─────────────────────────────────────────────────────────────┘
```

---

## 3. UI 组件与功能对应表

### 3.1 Header (顶部栏)

**文件**: `src/App.tsx`

| 元素 | 功能 |
|-----|------|
| 🌐 Logo | 显示 "Agent World" |
| EN/中 按钮 | 语言切换 |

**依赖**:
- `useAppStore.locale` - 当前语言
- `useAppStore.setLocale()` - 语言切换

---

### 3.2 Sidebar (左侧侧边栏)

**文件**: `src/components/UI/Sidebar.tsx`

**5 个 Tab**:

| Tab | 图标 | 功能 |
|-----|------|------|
| Link | 🔗 | Gateway 连接管理 |
| Agents | 🤖 | Agent 列表 + 聊天 |
| Cron | ⏰ | Cron 定时任务 |
| Logs | 📜 | 系统日志 |
| Settings | ⚙️ | Agent 外观设置 |

#### 3.2.1 Link (Gateway)

**文件**: `src/components/UI/Sidebar.tsx` - `renderGateway()`

**交互流程**:

| 步骤 | 操作 | 结果 |
|-----|------|------|
| 1 | 点击 "Connect" 按钮 | 弹出 URL 输入框 |
| 2 | 输入 Gateway 地址 + token | 格式: `ws://localhost:18789?token=xxx` |
| 3 | 点击 "OK" | 解析 token 保存到 localStorage，连接 Gateway |
| 4 | 连接成功 | 显示 "Connected"，获取 Agent 列表 |
| 5 | 点击 "Disconnect" | 断开连接，显示 "Disconnected" |

**实现细节**:

- 用户在输入框输入完整 URL + token: `ws://localhost:18789?token=xxx`
- Token 获取方式: 查看 `~/.openclaw/openclaw.json`
- Store 解析 URL 中的 `token` 参数，保存到 localStorage (key: `oc-device-token`)
- 使用 `OpenClawClient` 传入 `token` 参数连接

**显示内容**:

| 元素 | 功能 |
|-----|------|
| 状态标签 | Connected / Disconnected (基于 `gatewayConnected`) |
| URL | 当前配置的 Gateway 地址 (ws://localhost:18789) |
| Online | 在线 Agent 数量 (X/Y 格式) |
| Connect/Disconnet 按钮 | 根据 `gatewayConnected` 切换 |

**依赖**:
- `useAppStore.gatewayConnected` - 连接状态
- `useAppStore.gatewayUrl` - Gateway 地址
- `useAppStore.connectGateway(url)` - 连接
- `useAppStore.disconnectGateway()` - 断开
- `socketService.connect()` - 底层连接 (使用 token 参数)
- `socketService.disconnect()` - 底层断开

---

#### 3.2.2 Agents (Agent 列表 + 聊天)

**文件**: `src/components/UI/Sidebar.tsx` - `renderAgents()`

**Agent 列表 UI**:

| 元素 | 功能 |
|-----|------|
| 标题 | 🤖 Agents + 数量 (X/Y) |
| Agent 卡片 | 显示头像 (优先用 Gateway 返回的 emoji，否则用映射) + 名称 + 状态 (Idle/Working...) + 💬 (有活跃聊天) |
| Agent 数量 | 从 Gateway 动态获取，有几个显示几个 |

**Emoji 获取逻辑**:
1. 优先使用 Gateway 返回的 `agent.emoji`
2. 如果 Gateway 没返回，则使用本地 `getAgentEmoji()` 函数映射

**Emoji 映射** (getAgentEmoji() fallback):

| Agent ID | Emoji |
|----------|-------|
| main | 💬 |
| code-expert | 💻 |
| financial-analyst | 📈 |
| materials-scientist | 🔬 |
| political-analyst | 🌍 |
| zhihu | 📝 |
| 其他 | 🤖 |

**Agent 列表**:
- 动态从 Gateway 获取，数量不固定

**聊天面板 UI** (点击 Agent 展开):

| 元素 | 功能 |
|-----|------|
| 聊天头部 | Agent 头像 + 名称 + ✕ 关闭按钮 |
| 会话下拉框 | 选择不同会话 (feishu群聊/私聊/heartbeat等) |
| 消息列表 | 👤 用户消息 / 🤖 Agent 消息 + 时间 |
| 输入框 | "Type..." 输入文字 + ➤ 发送按钮 |

**交互流程**:
1. 点击 Agent 卡片 → 展开聊天面板
2. 可选择不同会话 (下拉框)
3. 输入文字 → 点击发送或回车
4. 点击 ✕ 关闭聊天面板

**依赖**:
- `useAppStore.agents` - Agent 列表
- `socketService.sendChat()` - 发送消息
- `socketService.getChatHistory()` - 获取历史消息
- `socketService.listSessions()` - 获取会话列表

---

#### 3.2.3 Cron (定时任务)

**文件**: `src/components/UI/Sidebar.tsx` - `renderTasks()`

| 元素 | 功能 |
|-----|------|
| 标题 | 📋 Cron Jobs + 数量 |
| 任务列表 | 从 Gateway 获取，显示任务名、调度、目标 |

**依赖**:
- `socketService.listCronJobs()` - 获取 Cron 任务

---

#### 3.2.4 Logs (日志)

**文件**: `src/components/UI/Sidebar.tsx` - `renderEvents()`

| 元素 | 功能 |
|-----|------|
| 标题 | 📜 Logs + 数量 |
| 日志列表 | 显示消息内容、时间、类型 |

**依赖**:
- `useAppStore.logs` - 日志数据

---

#### 3.2.5 Settings (设置)

**文件**: `src/components/UI/Sidebar.tsx` + `AgentAppearanceSettings.tsx`

| 元素 | 功能 |
|-----|------|
| Agent 外观设置 | 选择模型、颜色等 |

**依赖**:
- `useAppStore.agentAppearances` - 外观配置
- `useAppStore.updateAgentAppearance()` - 保存外观
- localStorage `agent-appearances` - 持久化

---

### 3.3 Main Content (主内容区) - 3D 场景

**文件**: `src/App.tsx` + `src/components/3D/Scene3D.tsx`

**布局**: 固定布局 - 左侧 Sidebar，右侧 3D 场景（不随 Sidebar 展开/收起变化）

**当前已实现的 3D 场景内容**:

| 元素 | 功能 | 状态 |
|-----|------|------|
| 3D 房间 | 白色墙壁、灰色地板 | ✅ |
| 家具 | 棕色桌子、蓝色椅子 | ✅ |
| Agent 模型 | 3D 人形模型 (GLB/FBX) + SkeletonUtils 克隆实例 | ✅ |
| 名称标签 | 灰色背景 + 白色文字，显示在 Agent 头顶 | ✅ |
| Agent 位置 | 多个 Agent 可同时显示 | ✅ |
| GLB 内置动画 | 使用 useAnimations 播放 GLB 模型自带动画 (idle: sambadance) | ✅ |
| FBX 支持 | 支持 FBX Binary (.fbx) 格式模型加载 | ✅ |
| GLB 动画列表 | 通过 useEffect + console.log 或 DOM 显示调试信息查看 | 方法见下方 |

**支持的 3D 模型格式**:

| 格式 | 状态 |
|-----|------|
| GLB/GLTF | ✅ |
| FBX Binary (.fbx) | ✅ |

**查看 GLB 模型动画列表的方法**:

在 `AgentModel3D.tsx` 中添加调试代码：

```typescript
// 方法1: console.log
useEffect(() => {
  console.log('Animation clips:', animations?.map(a => a.name));
}, [animations]);

// 方法2: DOM 显示 (用于浏览器截图)
useEffect(() => {
  const debug = document.getElementById('debug-animations');
  if (debug && animations?.length > 0) {
    debug.innerHTML = animations.map(a => a.name).join(', ');
  }
}, [animations]);
```

当前 `mixamo.glb` 包含的动画片段：**sambadance**, **TPose**, **mixamo.com**
| 随机走动 | Idle 状态时随机移动位置，到达后保存 | ✅ |
| 边界限制 | 随机走动范围限制在 112-912 坐标 | ✅ |
| 点击选择 | 点击 Agent 选中 | ✅ |
| 位置移动 | 选中 Agent 后点击地图移动 | ✅ |
| 环境光照 | Ambient + Directional + Environment preset | ✅ |
| 右键菜单 | Agent 右键弹出操作菜单 | ❌ 未实现 |

---

### 3.4 Footer (底部状态栏)

**文件**: `src/App.tsx`

| 元素 | 功能 |
|-----|------|
| ● X Online | 在线 Agent 数量 |
| ⚡ X Running | 运行中任务数 |
| 📋 X Total | 总任务数 |

**依赖**:
- `useAppStore.agents` - Agent 状态
- `useAppStore.tasks` - 任务状态

---

## 4. 数据层

### 4.1 核心状态 (useAppStore)

**文件**: `src/stores/useAppStore.ts`

| 状态 | 类型 | 用途 |
|-----|------|------|
| `agents` | `Agent[]` | Agent 列表 |
| `tasks` | `Task[]` | 任务列表 |
| `logs` | `LogEntry[]` | 日志 |
| `selectedAgentId` | `AgentId \| null` | 选中的 Agent |
| `gatewayConnected` | `boolean` | Gateway 连接状态 |
| `gatewayUrl` | `string` | Gateway 地址 |
| `locale` | `'zh' \| 'en'` | 语言 |
| `mapScale` | `number` | 地图缩放 |
| `agentAppearances` | `Record` | Agent 外观配置 |

### 4.2 Socket.io 服务

**文件**: `src/services/socket.ts`

| 方法 | 功能 |
|-----|------|
| `connect()` | 连接 Gateway |
| `disconnect()` | 断开连接 |
| `connectGateway(url)` | 连接指定地址 |
| `disconnectGateway()` | 断开连接 |
| `listAgents()` | 获取 Agent 列表 |
| `sendChat(sessionKey, text)` | 发送聊天 |
| `getChatHistory(sessionKey)` | 获取历史消息 |
| `listSessions(agentId)` | 获取会话列表 |
| `listCronJobs()` | 获取 Cron 任务 |

---

## 5. 持久化

| 数据 | 存储 | Key |
|-----|------|-----|
| Agent 位置/外观 | localStorage | `chen-company-agent-world` |
| Agent 外观配置 | localStorage | `agent-appearances` |
| Gateway 地址 | localStorage | `gatewayUrl` |
| 设备身份 | localStorage | `oc-device-identity` |

---

## 6. 功能变更记录

| 日期 | 修改类型 | 修改内容 | 备注 |
|-----|---------|---------|------|
| 2026-03-08 | 初始文档 | 创建功能文档 | 基于实际页面 |
| 2026-03-08 | Bug修复 | Disconnect 不生效 | 添加状态更新 + 手动断开标志 |
| 2026-03-08 | 优化 | 移除 Header Gateway 按钮 | 由 Sidebar Link 管理 |
| 2026-03-08 | Bug修复 | Gateway 连接失败 (token missing/mismatch/pairing required) | 使用 `token` 参数而非设备身份认证 |
| 2026-03-08 | 优化 | 用户输入框增加 token 提示 | 格式: `ws://localhost:18789?token=xxx` |
| 2026-03-08 | 优化 | Agent 列表 emoji 显示 | 使用 getAgentEmoji() 映射函数，根据 Agent ID 显示对应 emoji |
| 2026-03-08 | 新功能 | Agent 随机走动 | Idle 状态时随机移动位置，到达后保存，不再跳回原点 |
| 2026-03-08 | 新功能 | 边界限制 | 随机走动范围限制在 112-912 坐标 |
| 2026-03-08 | 新功能 | GLB 内置动画 | 使用 SkeletonUtils.clone + useAnimations 播放 GLB 内置动画 |
| 2026-03-08 | 优化 | 环境光照 | 添加 Environment preset 增强材质渲染 |
| 2026-03-08 | Bug修复 | Agent 动画不播放 | 修复 useEffect 中盲目停止动画的问题 |
