# Agent World

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Three.js-0.160-green" alt="Three.js">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

> 3D Multi-Agent Simulation Platform - Web-based Real-time Agent Visualization System

## ✨ Features

- 🏢 **3D Office Scene** - 9-room 3D environment with detailed furniture
- 🤖 **Multi-Agent Visualization** - Real-time agent status and movement
- 💬 **Real-time Communication** - WebSocket/Socket.io messaging
- 🎮 **Interactive Control** - Right-click menu for task dispatch, camera control
- 🔗 **OpenClaw Integration** - Connect to Gateway for agent management

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript |
| 3D Rendering | Three.js + React Three Fiber |
| State Management | Zustand |
| Backend | Express + Socket.io |
| Build Tool | Vite |
| Communication | WebSocket / SSE |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9
- OpenClaw Gateway (for agent management)

### Installation

```bash
# Clone the repository
git clone https://github.com/crackboy88/agent-world.git
cd agent-world

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Visit http://localhost:5173

### Build

```bash
# Production build
npm run build
```

Build output in `dist/` directory

## 🔗 Connecting to OpenClaw Gateway

This section explains how to connect Agent World to your OpenClaw Gateway for real-time agent management.

### Prerequisites

1. **OpenClaw Gateway** - You need a running OpenClaw Gateway instance
2. **Agent Pairing** - Your agents must be paired with the Gateway

### Step 1: Verify Gateway Status

Check if your Gateway is running:

```bash
# Check Gateway status
openclaw gateway status

# Start Gateway if not running
openclaw gateway start
```

### Step 2: Pair Your Agents

If your agents are not paired with the Gateway:

```bash
# List available devices/agents
openclaw devices list

# Pair a new agent (follow the on-screen instructions)
openclaw devices pair

# Or approve pending pairings
openclaw devices approve --latest
```

### Step 3: Get Gateway WebSocket URL

The Gateway WebSocket URL typically follows this format:

```
ws://localhost:3000/gateway
```

Or for remote Gateway:

```
ws://YOUR_GATEWAY_IP:3000/gateway
```

### Step 4: Configure Agent World

1. Open the application in your browser
2. Look for the Gateway connection panel in the header
3. Enter your Gateway WebSocket URL
4. Click "Connect"

Alternatively, you can set the Gateway URL in the browser console:

```javascript
// In browser console
localStorage.setItem('gatewayUrl', 'ws://localhost:3000/gateway');
// Then refresh the page
```

### Troubleshooting

#### "Device nonce mismatch" Error

This usually means the device identity is outdated. Try:

```bash
# Re-pair the device
openclaw devices pair

# Or reset and re-approve
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

### Default Configuration

The project comes with generic default agents and room layouts in:

- `config/agents.default.ts` - Default agent definitions
- `config/rooms.default.ts` - Default room layout

### Private Configuration (Local Only)

To customize for your own use case without committing to the repository:

1. Copy the example files:
   ```bash
   cp config/agents.local.example.ts config/agents.local.ts
   cp config/rooms.local.example.ts config/rooms.local.ts
   ```

2. Edit the `*.local.ts` files with your own agents and rooms

3. The `.gitignore` already excludes these files from version control

### Agent Configuration

```typescript
// config/agents.local.ts
export const LOCAL_AGENTS: Record<string, AgentConfig> = {
  'my-agent': {
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
├── config/                # Configuration files
│   ├── agents.default.ts  # Default agents
│   ├── agents.local.example.ts
│   ├── rooms.default.ts  # Default rooms
│   ├── rooms.local.example.ts
│   └── index.ts         # Config loader
├── public/               # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── 3D/         # 3D scene components
│   │   └── UI/         # UI components
│   ├── services/        # Services (Socket, Gateway)
│   ├── stores/          # Zustand state management
│   └── types/           # TypeScript types
├── docs/                # Documentation
└── dist/                # Build output
```

## 📝 License

MIT License - See [LICENSE](LICENSE) for details

## 👤 Author

**Chen Company**
- GitHub: [@crackboy88](https://github.com/crackboy88)
