# Agent World

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Three.js-0.160-green" alt="Three.js">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

> Chen Company 3D多智能体模拟平台 - 基于Web的实时多智能体可视化系统

## ✨ 特性

- 🏢 **3D 办公室场景** - 精细的9房间3D环境建模
- 🤖 **多智能体可视化** - 实时展示Agent状态与移动
- 💬 **实时通信** - WebSocket/Socket.io 实时消息传递
- 🎮 **交互控制** - 右键菜单派发任务、视角控制
- 🔗 **OpenClaw 集成** - 连接 Gateway 实现Agent管理

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 3D 渲染 | Three.js + React Three Fiber |
| 状态管理 | Zustand |
| 后端服务 | Express + Socket.io |
| 构建工具 | Vite |
| 通信协议 | WebSocket / SSE |

## 🚀 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
# 克隆仓库
git clone https://github.com/crackboy88/agent-world.git
cd agent-world

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 构建

```bash
# 生产构建
npm run build
```

构建产物在 `dist/` 目录

## 📁 项目结构

```
agent-world/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   │   ├── 3D/         # 3D 场景组件
│   │   └── UI/         # UI 组件
│   ├── services/       # 服务层 (Socket, Gateway)
│   ├── stores/         # Zustand 状态管理
│   ├── styles/         # 样式文件
│   └── types/          # TypeScript 类型定义
├── docs/               # 项目文档
└── dist/               # 构建输出
```

## 📝 许可证

MIT License - 查看 [LICENSE](LICENSE) 了解详情

## 👤 作者

**Chen Company**
- GitHub: [@crackboy88](https://github.com/crackboy88)
