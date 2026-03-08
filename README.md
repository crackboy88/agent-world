# Agent World

[![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-green?style=flat-square)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Note**: This project uses [OpenClaw](https://github.com/openclaw) for multi-agent management. It's a demo application showcasing 3D multi-agent visualization with OpenClaw Gateway integration.

3D Multi-Agent Visualization Platform - Web-based Real-time Agent Management System

## ✨ Features

- 🌐 **3D Scene** - Web-based 3D environment with rooms and furniture
- 🤖 **Multi-Agent Visualization** - Real-time agent status, movement, and selection
- 🎯 **Interactive Control** - Click to select agents, right-click to deselect, drag to move
- 💬 **Real-time Chat** - WebSocket communication with agents
- 🔗 **OpenClaw Integration** - Connect to Gateway for agent management

## 🛠️ Tech Stack

| Category | Technology |
|:---------|:-----------|
| Frontend | React 18 + TypeScript |
| 3D Rendering | Three.js + React Three Fiber |
| State Management | Zustand |
| Backend | Express + Socket.io |
| Build Tool | Vite |
| Communication | Socket.io |

## 🚀 Quick Start (For OpenClaw)

OpenClaw should execute the following commands to set up and run this project:

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/crackboy88/agent-world.git
cd agent-world

# Install dependencies
npm install
```

### Step 2: Start Development Server

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:5173

### Step 3: Build for Production

```bash
# Build for production
npm run build

# Preview the built files
npm run preview
```

## 🔗 OpenClaw Gateway Setup (For OpenClaw)

OpenClaw should perform the following steps to connect to the Gateway:

### Step 1: Start Gateway

```bash
# Check Gateway status
openclaw gateway status

# Start Gateway if not running
openclaw gateway start
```

### Step 2: Approve Pairing Request

When Agent World starts, it will automatically attempt to connect. Approve the pending pairing request:

```bash
# Check pending pairing requests
openclaw devices list

# Approve the pending device
openclaw devices approve --latest
```

### Step 3: Verify Connection

The connection should be established automatically. The Gateway status in Agent World should show "Connected".

### Gateway URL

Default: `ws://localhost:18789`

To change the Gateway URL:

```javascript
// In browser console
localStorage.setItem('gatewayUrl', 'ws://your-gateway-ip:18789');
// Then refresh the page
```

### Troubleshooting

#### "Device nonce mismatch" Error

```bash
# Clear old device identity from browser localStorage, then refresh

# Approve new request
openclaw devices approve --latest
```

#### Connection Timeout

- Check if Gateway is running: `openclaw gateway status`
- Verify firewall rules allow the connection

#### Agents Not Showing Online

- Ensure agents are paired and approved
- Check agent status: `openclaw agents list`

## ⚙️ Configuration

### Assets

Assets are stored in `public/assets/`:

```
public/assets/
├── agents/     # Agent 3D models (.glb)
├── models/     # Map item 3D models (.glb)
└── textures/   # Texture files
```

### Map Configuration

Edit `src/config/map.ts` to customize map items:

```typescript
export const DEFAULT_MAP_ITEMS: MapItem[] = [
  { id: 'plant-1', type: 'plant-small', name: 'Plant', position: { x: 100, y: 100 } },
  { id: 'table-1', type: 'table', name: 'Meeting Table', position: { x: 512, y: 512 } },
];
```

Available item types: `plant-small`, `plant-large`, `table`, `chair`, `desk`, `cabinet`

### Agent Appearance

Edit `src/config/agent.ts` to customize agent appearances:

```typescript
export const DEFAULT_APPEARANCES: Record<string, AgentAppearance> = {
  'main': {
    modelId: 'default',
    modelUrl: '/assets/agents/agent-default.glb',
    color: '#3B82F6',
  },
};
```

## 📁 Project Structure

```
agent-world/
├── public/assets/              # Static assets
│   ├── agents/                 # Agent 3D models
│   ├── models/                 # Map item 3D models
│   └── textures/               # Textures
├── src/
│   ├── components/             # React components
│   │   ├── 3D/                # 3D scene components
│   │   ├── UI/                # UI components
│   │   └── Map/               # Map components
│   ├── config/                 # Configuration files
│   ├── services/               # Socket.io services
│   ├── stores/                 # Zustand state management
│   └── types/                  # TypeScript types
└── dist/                      # Build output
```

## 📝 License

MIT License

## 👤 Built with

[OpenClaw](https://github.com/openclaw)
