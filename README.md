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
