/**
 * 3D Scene Component - Simplified without postprocessing
 */
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment, Float, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Agent3D, AGENT_CONFIGS } from './Agent3D';
import type { Agent, Position } from '../../types';

// Simple Room
const Room = ({ size = 10 }: { size?: number }) => {
  const wallHeight = 4, thickness = 0.2;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#D4C4B0" roughness={0.8} />
      </mesh>
      <mesh position={[0, wallHeight / 2, -size / 2]} receiveShadow castShadow>
        <boxGeometry args={[size, wallHeight, thickness]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.9} />
      </mesh>
      <mesh position={[-size / 2, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[thickness, wallHeight, size]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.9} />
      </mesh>
      <mesh position={[size / 2, wallHeight / 2, -size / 4]} receiveShadow castShadow>
        <boxGeometry args={[thickness, wallHeight, size / 2]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.9} />
      </mesh>
    </group>
  );
};

// Table
const Table = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 0.05, 0.8]} />
      <meshStandardMaterial color="#5D4037" roughness={0.7} />
    </mesh>
    {[[-0.65, 0.35, -0.3], [0.65, 0.35, -0.3], [-0.65, 0.35, 0.3], [0.65, 0.35, 0.3]].map((pos, i) => (
      <mesh key={i} position={pos as [number, number, number]} castShadow>
        <boxGeometry args={[0.08, 0.7, 0.08]} />
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </mesh>
    ))}
  </group>
);

// Chair
const Chair = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) => (
  <group position={position} rotation={rotation}>
    <mesh position={[0, 0.45, 0]} castShadow><boxGeometry args={[0.5, 0.08, 0.5]} /><meshStandardMaterial color="#1565C0" roughness={0.8} /></mesh>
    <mesh position={[0, 0.85, -0.22]} castShadow><boxGeometry args={[0.5, 0.7, 0.06]} /><meshStandardMaterial color="#1565C0" roughness={0.8} /></mesh>
  </group>
);

// Plant
const Plant = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.15, 0]} castShadow><cylinderGeometry args={[0.2, 0.15, 0.3, 8]} /><meshStandardMaterial color="#8D6E63" roughness={0.9} /></mesh>
    {[0, 1, 2, 3].map(i => (
      <mesh key={i} position={[Math.sin(i * Math.PI / 2) * 0.15, 0.5 + i * 0.12, Math.cos(i * Math.PI / 2) * 0.15]} castShadow>
        <sphereGeometry args={[0.12 - i * 0.015, 16, 16]} />
        <meshStandardMaterial color={i % 2 === 0 ? '#4CAF50' : '#66BB6A'} roughness={0.8} />
      </mesh>
    ))}
  </group>
);

// Main Scene
// 固定 Agent 位置（在房间内）
const AGENT_POSITIONS: Record<string, [number, number, number]> = {
  'main': [0, 0, 0],
  'code-expert': [-2, 0, 1],
  'financial-analyst': [2, 0, 1],
  'materials-scientist': [-2, 0, -1],
  'political-analyst': [2, 0, -1],
  'zhihu': [0, 0, 2],
};

export const Scene3D = ({ agents, selectedAgentId, onAgentClick }: { agents: Agent[]; selectedAgentId?: string; onAgentClick?: (id: string) => void }) => {
  // 固定位置，忽略 2D 坐标
  const getAgentPosition = (agentId: string): [number, number, number] => 
    AGENT_POSITIONS[agentId] || [Math.random() * 4 - 2, 0, Math.random() * 4 - 2];

  return (
    <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
      <OrbitControls enablePan enableZoom enableRotate minDistance={3} maxDistance={20} target={[0, 1, 0]} maxPolarAngle={Math.PI / 2 - 0.1} enableDamping dampingFactor={0.05} />
      <Environment preset="city" />
      <ambientLight intensity={0.3} color="#FFF8E7" />
      <directionalLight position={[8, 12, 8]} intensity={1.5} color="#FFF5E6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <hemisphereLight args={['#87CEEB', '#8B7355', 0.4]} />
      
      <Room size={10} />
      <Table position={[-2, 0, -2]} />
      <Chair position={[-2, 0, -1]} rotation={[0, Math.PI, 0]} />
      <Plant position={[3, 0, -3]} />
      <Plant position={[-3, 0, 3]} />
      
      {agents.map(agent => {
        const config = AGENT_CONFIGS[agent.id] || AGENT_CONFIGS['main'];
        const pos = getAgentPosition(agent.id);
        const agentState = agent.state as 'idle' | 'walking' | 'working' | 'thinking';
        return (
          <group key={agent.id} onClick={e => { e.stopPropagation(); onAgentClick?.(agent.id); }}>
            <Float speed={agentState === 'idle' ? 1.5 : 0} rotationIntensity={agentState === 'idle' ? 0.1 : 0} floatIntensity={agentState === 'idle' ? 0.2 : 0}>
              <Agent3D config={config} position={pos} state={agentState} scale={selectedAgentId === agent.id ? 1.1 : 1} isSelected={selectedAgentId === agent.id} onClick={() => onAgentClick?.(agent.id)} />
            </Float>
          </group>
        );
      })}
      
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={20} blur={2.5} far={6} resolution={512} color="#1a1a1a" />
      <Sparkles count={100} scale={12} size={2} speed={0.3} opacity={0.3} color="#FFF8E7" />
      <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={0.5} />
    </Canvas>
  );
};

export default Scene3D;
