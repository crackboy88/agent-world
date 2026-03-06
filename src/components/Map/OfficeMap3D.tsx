/**
 * 3D 办公室地图组件
 * 使用 react-three-fiber 实现
 */

import React, { useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../../stores';

// Agent 颜色配置
const AGENT_COLORS: Record<string, string> = {
  'main': '#3B82F6',
  'code-expert': '#8B5CF6',
  'financial-analyst': '#22C55E',
  'materials-scientist': '#F59E0B',
  'political-analyst': '#EF4444',
  'zhihu': '#EC4899',
};

// 单个 Agent 3D 模型
const Agent3D: React.FC<{
  agent: any;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}> = ({ agent, position, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Group>(null);
  const color = AGENT_COLORS[agent.id] || '#6B7280';
  
  // 浮动动画
  const floatProps = useMemo(() => ({
    speed: agent.state === 'working' ? 3 : 1,
    rotationIntensity: 0.1,
    floatIntensity: 0.3,
  }), [agent.state]);

  return (
    <Float {...floatProps}>
      <group 
        ref={meshRef} 
        position={position}
        onClick={onClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        {/* 身体 */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1, 1.2, 0.8]} />
          <meshStandardMaterial 
            color={color} 
            flatShading 
            emissive={isSelected ? '#FCD34D' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : 0}
          />
        </mesh>
        
        {/* 头部 */}
        <mesh position={[0, 1.55, 0]} castShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#FFD700" flatShading />
        </mesh>
        
        {/* 眼睛 */}
        <mesh position={[-0.15, 1.65, 0.35]}>
          <boxGeometry args={[0.12, 0.12, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        <mesh position={[0.15, 1.65, 0.35]}>
          <boxGeometry args={[0.12, 0.12, 0.05]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* 状态指示器 */}
        {agent.state === 'working' && (
          <mesh position={[0.5, 1.8, 0]}>
            <boxGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.8} />
          </mesh>
        )}
        {agent.state === 'thinking' && (
          <mesh position={[0.5, 1.8, 0]}>
            <boxGeometry args={[0.2, 0.2, 0.1]} />
            <meshStandardMaterial color="#3B82F6" emissive="#3B82F6" emissiveIntensity={0.8} />
          </mesh>
        )}
        
        {/* 在线指示点 */}
        <mesh position={[0.3, 1.3, 0.4]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={agent.isOnline ? '#22C55E' : '#6B7280'} />
        </mesh>
        
        {/* 选中光环 */}
        {isSelected && (
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial color="#FCD34D" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        )}
        
        {/* 名字标签 */}
        <Text
          position={[0, -0.2, 0]}
          fontSize={0.35}
          color="#E2E8F0"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Regular.woff"
        >
          {agent.name}
        </Text>
      </group>
    </Float>
  );
};

// 办公室场景 - 桌子
const OfficeDesk: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* 桌面 */}
      <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* 桌腿 */}
      {[[-1.3, -0.6], [-1.3, 0.6], [1.3, -0.6], [1.3, 0.6]].map(([dx, dz], i) => (
        <mesh key={i} position={[dx, 0.25, dz]} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
    </group>
  );
};

// 地面
const Ground: React.FC = () => {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1E293B" />
      </mesh>
      <gridHelper args={[50, 50, '#334155', '#1E293B']} position={[0, 0.01, 0]} />
    </>
  );
};

// 主场景组件
const Scene3D: React.FC = () => {
  const { agents, selectedAgentId, selectAgent } = useAppStore();
  
  const spacing = 3;
  const startX = -((agents.length - 1) * spacing) / 2;

  // 桌子位置
  const deskPositions: [number, number, number][] = [
    [-6, 0, -3],
    [6, 0, -3],
    [-6, 0, 3],
    [6, 0, 3],
    [0, 0, -5],
  ];

  return (
    <>
      {/* 相机 */}
      <PerspectiveCamera makeDefault position={[0, 8, 14]} fov={50} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
      />
      
      {/* 灯光 */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 15, 10]} 
        intensity={0.8} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#3B82F6" />
      
      {/* 环境 */}
      <Environment preset="city" />
      <fog attach="fog" args={['#0F172A', 15, 40]} />
      
      {/* 地面 */}
      <Ground />
      
      {/* 桌子 */}
      {deskPositions.map((pos, i) => (
        <OfficeDesk key={i} position={pos} />
      ))}
      
      {/* Agents */}
      {agents.map((agent, index) => (
        <Agent3D
          key={agent.id}
          agent={agent}
          position={[startX + index * spacing, 0, 0]}
          isSelected={agent.id === selectedAgentId}
          onClick={() => selectAgent(agent.id)}
        />
      ))}
      
      {/* 阴影 */}
      <ContactShadows 
        position={[0, 0.01, 0]} 
        opacity={0.4} 
        scale={30} 
        blur={2} 
        far={10}
      />
    </>
  );
};

// 导出主组件
const OfficeMap3D: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0F172A' }}>
      <Canvas shadows>
        <Scene3D />
      </Canvas>
    </div>
  );
};

export default OfficeMap3D;
