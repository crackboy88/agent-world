# Agent World

[![React](https://img.shields.io/badge/React-18.2-blue?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-0.160-green?style=flat-square)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Note**: This project uses [OpenClaw](https://github.com/openclaw) for multi-agent management. It's a demo application showcasing 3D multi-agent visualization with OpenClaw Gateway integration.

3D Multi-Agent Simulation Platform - Web-based Real-time Agent Visualization System with customizable room layouts

## ✨ Features

- 🏢 **3D Scene** - Customizable 3D environment with detailed room layouts
- 🤖 **Multi-Agent Visualization** - Real-time agent status and movement
- 💬 **Real-time Communication** - WebSocket/Socket.io messaging
- 🎮 **Interactive Control** - Right-click menu for task dispatch, camera control
- 🔗 **OpenClaw Integration** - Connect to Gateway for agent management

## 🛠️ Tech Stack

| Category | Technology |
|:---------|:-----------|
| Frontend | React 18 + TypeScript |
| 3D Rendering | Three.js + React Three Fiber |
| State Management | Zustand |
| Backend | Express + Socket.io |
| Build Tool | Vite |
| Communication | WebSocket / SSE |

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

## 🔗 Connecting to OpenClaw Gateway

This section explains how to connect Agent World to your OpenClaw Gateway for real-time agent management.

### Prerequisites

1. **OpenClaw Gateway** - You need a running OpenClaw Gateway instance
2. **Agent Pairing** - Your agents must be paired with the Gateway

### Step 1: Start Gateway

First, make sure your OpenClaw Gateway is running:

```bash
# Check Gateway status
openclaw gateway status

# Start Gateway if not running
openclaw gateway start
```

### Step 2: Start Agent World

```bash
# Development mode
npm run dev

# Or serve the built files
npm run preview
```

Visit http://localhost:5173

> **When Agent World starts, it will automatically attempt to connect to the Gateway and send a pairing request.**

### Step 3: Approve Pairing Request

Now approve the pending pairing request from the Gateway side:

```bash
# Check pending pairing requests
openclaw devices list

# Approve the pending device (usually the most recent one)
openclaw devices approve --latest

# Or approve by specific device ID
openclaw devices approve <device-id>
```

### Step 4: Verify Connection

After approval, the connection should be established. Check in the Agent World UI:

- The Gateway status should show "Connected"
- Your agents should appear online

### Gateway URL Configuration

The default Gateway URL is `ws://localhost:18789`. If you need to connect to a different Gateway:

1. Open the application in your browser
2. Use the Gateway connection panel in the header to change the URL

Or set it via browser console:

```javascript
// In browser console
localStorage.setItem('gatewayUrl', 'ws://your-gateway-ip:18789');
// Then refresh the page
```

### Troubleshooting

#### "Device nonce mismatch" Error

This usually means the device identity is outdated. Try:

```bash
# Clear old device identity from browser localStorage
# Then refresh Agent World to trigger a new pairing request

# On Gateway side, approve the new request
openclaw devices approve --latest
```

#### Connection Timeout

- Check if Gateway is running: `openclaw gateway status`
- Verify firewall rules allow the connection
- Check the Gateway logs for errors

#### Agents Not Showing Online

- Ensure agents are paired and approved
- Check agent status: `openclaw agents list`
- Restart the Gateway if needed

### Network Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Agent World    │ ──────▶ │  OpenClaw        │
│  (Browser)      │  WS     │  Gateway         │
└─────────────────┘         └──────────────────┘
                                   │
                                   ▼
                            ┌──────────────────┐
                            │  OpenClaw       │
                            │  Agents          │
                            └──────────────────┘
```

## ⚙️ Configuration

### Assets Folder

All assets (3D models, sprites, textures) are stored in `public/assets/`:

```
public/assets/
├── models/      # 3D models (.glb, .gltf)
├── sprites/     # 2D sprites (.png, .jpg)
└── textures/    # Texture files
```

**Adding your own assets:**
1. Add your files to the appropriate folder
2. Reference them in the map/agent configuration

### Map Configuration

Edit `src/config/map.ts` to customize map items:

1. Copy the example config:
   ```bash
   cp config/map.local.example.ts config/map.local.ts
   ```

2. Edit `config/map.local.ts` to add items:
   ```typescript
   export const LOCAL_MAP_ITEMS: MapItem[] = [
     { id: 'plant-1', type: 'plant', name: 'Plant', position: { x: 100, y: 100 } },
     { id: 'table-1', type: 'table', name: 'Meeting Table', position: { x: 512, y: 512 } },
   ];
   ```

Available item types: `plant`, `table`, `chair`, `cabinet`, `desk`, `other`

### Agent Appearance

To customize agent appearances:

1. Copy the example config:
   ```bash
   cp config/agent.local.example.ts config/agent.local.ts
   ```

2. Edit `config/agent.local.ts` to customize:
   ```typescript
   export const LOCAL_AGENT_APPEARANCES: AgentAppearance[] = [
     {
       id: 'main',
       name: 'My Agent',
       skinColor: '#FCD34D',
       hairColor: '#1F2937',
       clothesColor: '#3B82F6',
       accentColor: '#F59E0B',
       accessory: '💼',
     },
   ];
   ```

The `.gitignore` already excludes local configs from version control.
    id: 'my-agent',
    name: 'My Agent',
    emoji: '🤖',
    clothes: '#3B82F6',
    accent: '#F59E0B',
    hair: '#1F2937',
    accessory: '⚙️'
  },
};
```

### Room Configuration

Define your own room layout with positions, furniture, and agent assignments.

## 📁 Project Structure

```
agent-world/
├── config/                      # Configuration files
│   ├── agents.default.ts        # Default agents
│   ├── agents.local.example.ts  # Local config example
│   ├── rooms.default.ts        # Default rooms
│   ├── rooms.local.example.ts  # Local config example
│   └── index.ts               # Config loader
├── public/                     # Static assets
├── src/                        # Source code
│   ├── components/            # React components
│   │   ├── 3D/               # 3D scene components
│   │   └── UI/               # UI components
│   ├── services/              # Services (Socket, Gateway)
│   ├── stores/                # Zustand state management
│   └── types/                 # TypeScript types
├── docs/                      # Documentation
└── dist/                      # Build output
```

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 👤 Author

Built with [OpenClaw](https://github.com/openclaw)
