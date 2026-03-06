# Agent 可视化平台需求文档

> 创建日期：2026-03-05
> 项目名称：Chen Company Agent World
> 当前版本：3D

---

## 1. 项目概述

创建一个网页端的可视化的、游戏形式的多智能体模拟平台，每个 agent 在 3D 场景中活动。

---

## 2. 技术栈

- React Three Fiber + Drei
- Three.js
- Vite
- TypeScript

---

## 3. 核心功能

### 3.1 3D 场景
- 室内场景（地板 + 墙壁）
- 家具（桌子、椅子、植物）
- 光照系统（环境光、主光、半球光）
- 特效（粒子、星空、阴影）

### 3.2 Agent
- 6 个精细 Voxel 风格 Agent
- 4 种动作动画（idle/walking/working/thinking）
- Agent 配饰系统（眼镜、手表、徽章、耳机、公文包）
- 点击交互
- 名称标签显示

### 3.3 界面与布局
- 全局统计（顶部居中）
- 侧边栏（日志/任务/对话）
- Gateway 连接状态

---

## 4. Agent 配置

| Agent ID | 名称 | 配饰 |
|----------|------|------|
| main | CEO | 徽章 + 公文包 |
| code-expert | Tech Lead | 眼镜 + 手表 + 耳机 |
| financial-analyst | CFO | 眼镜 + 手表 + 公文包 |
| materials-scientist | R&D Lead | 眼镜 |
| political-analyst | Strategy | 徽章 + 公文包 |
| zhihu | Operations | 无 |

---

## 5. 文件位置

| 文件 | 说明 |
|------|------|
| `src/components/3D/Agent3D.tsx` | Agent 组件 |
| `src/components/3D/Scene3D.tsx` | 场景组件 |
| `src/App.tsx` | 主应用 |

---

## 6. 更新日志

| 日期 | 更新内容 |
|------|---------|
| 2026-03-06 | 完全重构为 3D 版本 |
