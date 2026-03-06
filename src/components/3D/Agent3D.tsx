/**
 * 精细版 3D Agent 组件 - 终极优化版
 * 使用 RoundedBox 实现圆角、PBR材质、更好的动画、更多细节
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// 调色板
const COLORS = {
  skin: {
    light: '#FFF0E8',
    base: '#FAD7C8',
    shadow: '#E8B89D',
    dark: '#C99B7D'
  },
  hair: {
    black: '#1A1A1A',
    blackAlt: '#2D2D2D',
    brown: '#4E342E',
    brownAlt: '#5D4037',
    brownDark: '#3E2723',
    blonde: '#D4A574'
  },
  eye: {
    brown: '#5D4037',
    blue: '#1E88E5',
    black: '#212121',
    white: '#FFFFFF',
    pupil: '#000000'
  },
  suit: {
    blue: '#1565C0',
    blueDark: '#0D47A1',
    blueLight: '#1976D2',
    gray: '#37474F',
    grayDark: '#263238',
    black: '#1A1A1A'
  },
  shirt: {
    white: '#FFFFFF',
    lightBlue: '#E3F2FD'
  },
  tie: {
    gold: '#FFD700',
    red: '#C41E3A',
    blue: '#1565C0'
  },
  pants: {
    gray: '#455A64',
    black: '#263238'
  },
  shoes: {
    black: '#1A1A1A',
    brown: '#3E2723'
  },
  accessories: {
    gold: '#FFD700',
    silver: '#C0C0C0'
  }
};

// Agent 配置 - 支持外部模型 + 增强配饰
interface AgentConfig {
  id: string;
  name: string;
  suitColor?: string;
  skinTone?: string;
  hairColor?: string;
  eyeColor?: string;
  tieColor?: string;
  hasGlasses?: boolean;
  hasWatch?: boolean;
  hasBadge?: boolean;
  hasBriefcase?: boolean;
  hasHeadphones?: boolean;
  externalModelUrl?: string;
}

// 身体部位组件 - 圆角优化版
interface BoxPartProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  castShadow?: boolean;
  roughness?: number;
  metalness?: number;
}

const Box: React.FC<BoxPartProps> = ({ position, size, color, castShadow = true, roughness = 0.7, metalness = 0 }) => {
  return (
    <RoundedBox position={position} args={size} radius={0.02} smoothness={4} castShadow={castShadow} receiveShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </RoundedBox>
  );
};

// 球体部位 - 优化
interface SpherePartProps {
  position: [number, number, number];
  args?: [number, number, number];
  color: string;
  roughness?: number;
  metalness?: number;
}

const Sphere: React.FC<SpherePartProps> = ({ position, args = [0.1, 32, 32], color, roughness = 0.6, metalness = 0 }) => {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={args} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
};

// 眼镜组件
const Glasses: React.FC<{
  position: [number, number, number];
  frameColor?: string;
  lensColor?: string;
}> = ({ position, frameColor = '#1A1A1A', lensColor = '#87CEEB' }) => {
  return (
    <group position={position}>
      {/* 镜框 - 左 */}
      <mesh position={[-0.1, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* 镜框 - 右 */}
      <mesh position={[0.1, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.5} />
      </mesh>
      {/* 镜片 */}
      <mesh position={[-0.1, 0, 0.01]}>
        <planeGeometry args={[0.1, 0.06]} />
        <meshStandardMaterial color={lensColor} transparent opacity={0.3} roughness={0.1} />
      </mesh>
      <mesh position={[0.1, 0, 0.01]}>
        <planeGeometry args={[0.1, 0.06]} />
        <meshStandardMaterial color={lensColor} transparent opacity={0.3} roughness={0.1} />
      </mesh>
      {/* 镜桥 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.02, 0.02]} />
        <meshStandardMaterial color={frameColor} roughness={0.3} metalness={0.5} />
      </mesh>
    </group>
  );
};

// 手表组件 - 增强版
const Watch: React.FC<{
  position: [number, number, number];
  bandColor?: string;
  faceColor?: string;
}> = ({ position, bandColor = '#1A1A1A', faceColor = '#FFFFFF' }) => {
  return (
    <group position={position}>
      {/* 表带 */}
      <mesh castShadow>
        <boxGeometry args={[0.065, 0.12, 0.035]} />
        <meshStandardMaterial color={bandColor} roughness={0.95} />
      </mesh>
      {/* 表盘底座 */}
      <mesh position={[0, -0.02, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.012, 24]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.15} metalness={0.9} />
      </mesh>
      {/* 表盘面 */}
      <mesh position={[0, -0.02, 0.027]}>
        <circleGeometry args={[0.032, 24]} />
        <meshStandardMaterial color={faceColor} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* 表盘中心点 */}
      <mesh position={[0, -0.02, 0.028]}>
        <circleGeometry args={[0.008, 12]} />
        <meshStandardMaterial color="#333333" roughness={0.3} />
      </mesh>
      {/* 表冠 */}
      <mesh position={[0.04, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.015, 8]} />
        <meshStandardMaterial color="#C0C0C0" roughness={0.2} metalness={0.85} />
      </mesh>
    </group>
  );
};

// 徽章/铭牌 - 增强金属质感
const Badge: React.FC<{
  position: [number, number, number];
  color?: string;
}> = ({ position, color = '#FFD700' }) => {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 4]}>
      {/* 徽章主体 */}
      <mesh castShadow>
        <boxGeometry args={[0.06, 0.06, 0.015]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} envMapIntensity={1.5} />
      </mesh>
      {/* 徽章高光 */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.03, 0.03, 0.005]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.9} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

// 3D Agent 精细版 - 增强交互版
export const Agent3D: React.FC<{
  config: AgentConfig;
  position: [number, number, number];
  state?: 'idle' | 'walking' | 'working' | 'thinking';
  scale?: number;
  isSelected?: boolean;
  onClick?: () => void;
}> = ({ config, position, state = 'idle', scale = 1, isSelected = false, onClick }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  
  const skinColor = config.skinTone || COLORS.skin.base;
  const hairColor = config.hairColor || COLORS.hair.black;
  const suitColor = config.suitColor || COLORS.suit.blue;
  const eyeColor = config.eyeColor || COLORS.eye.brown;
  const tieColor = config.tieColor || COLORS.tie.gold;
  
  // 动画 - 终极版
  useFrame((_, delta) => {
    timeRef.current += delta;
    
    if (!groupRef.current) return;
    
    const t = timeRef.current;
    
    switch (state) {
      case 'idle':
        // 呼吸 + 轻微悬浮
        groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.012;
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(t * 0.5) * 0.03;
          headRef.current.rotation.x = Math.sin(t * 0.3) * 0.01;
        }
        // 身体轻微前后摆动
        groupRef.current.rotation.x = Math.sin(t * 0.8) * 0.01;
        // 手臂自然下垂
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 0.5 + 0.5) * 0.02;
        // 选中时轻微弹跳
        if (isSelected) {
          groupRef.current.position.y += Math.sin(t * 3) * 0.02;
        }
        break;
        
      case 'walking':
        // 行走摇摆 - 手臂摆动
        groupRef.current.rotation.z = Math.sin(t * 8) * 0.04;
        groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 8)) * 0.04;
        // 头部跟随身体
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(t * 8) * 0.05;
          headRef.current.rotation.y = Math.sin(t * 4) * 0.02;
        }
        // 手臂摆动
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.3;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.3;
        break;
        
      case 'working':
        // 工作时 - 敲键盘动作
        groupRef.current.rotation.z = Math.sin(t * 3) * 0.02;
        groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.01;
        if (headRef.current) {
          // 头部前倾专注
          headRef.current.rotation.x = 0.1 + Math.sin(t * 2) * 0.05;
          headRef.current.rotation.y = Math.sin(t * 1.5) * 0.03;
        }
        // 手臂敲击动作
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.5 + Math.sin(t * 4) * 0.1;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.5 + Math.sin(t * 4 + 0.5) * 0.1;
        break;
        
      case 'thinking':
        // 思考时 - 抬头/沉思 + 手指动作
        groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.015;
        groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.03;
        if (headRef.current) {
          // 抬头思考
          headRef.current.rotation.x = -0.15 + Math.sin(t * 0.6) * 0.08;
          headRef.current.rotation.y = Math.sin(t * 0.4) * 0.1;
        }
        // 手指动作
        if (leftArmRef.current) leftArmRef.current.rotation.x = -0.3;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -0.3 + Math.sin(t * 2) * 0.15;
        break;
        
      default:
        groupRef.current.position.y = position[1];
        break;
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
      }}
    >
      
      {/* ===== 头部 ===== */}
      <group ref={headRef} position={[0, 1.55, 0]}>
        
        {/* 头发 - 顶层 - 更立体 */}
        <Box position={[0, 0.28, -0.02]} size={[0.54, 0.14, 0.52]} color={hairColor} />
        
        {/* 头发 - 多层刘海 */}
        <Box position={[-0.18, 0.2, 0.18]} size={[0.2, 0.06, 0.1]} color={hairColor} />
        <Box position={[0.18, 0.2, 0.18]} size={[0.2, 0.06, 0.1]} color={hairColor} />
        <Box position={[-0.08, 0.16, 0.22]} size={[0.12, 0.05, 0.08]} color={hairColor} />
        <Box position={[0.08, 0.16, 0.22]} size={[0.12, 0.05, 0.08]} color={hairColor} />
        <Box position={[0, 0.12, 0.24]} size={[0.22, 0.04, 0.06]} color={hairColor} />
        
        {/* 头发 - 侧边层次 */}
        <Box position={[-0.28, 0.08, 0.04]} size={[0.1, 0.28, 0.28]} color={hairColor} />
        <Box position={[0.28, 0.08, 0.04]} size={[0.1, 0.28, 0.28]} color={hairColor} />
        
        {/* 脸部 - 主色 */}
        <Box position={[0, 0, 0]} size={[0.44, 0.4, 0.3]} color={skinColor} />
        
        {/* 太阳穴阴影 */}
        <Box position={[-0.2, 0.02, 0.13]} size={[0.06, 0.22, 0.04]} color={COLORS.skin.shadow} />
        <Box position={[0.2, 0.02, 0.13]} size={[0.06, 0.22, 0.04]} color={COLORS.skin.shadow} />
        
        {/* 眼睛区域 */}
        <Box position={[-0.1, 0.06, 0.14]} size={[0.16, 0.1, 0.03]} color="#F5F5F5" />
        <Box position={[0.1, 0.06, 0.14]} size={[0.16, 0.1, 0.03]} color="#F5F5F5" />
        
        {/* 眼珠 */}
        <Sphere position={[-0.1, 0.06, 0.16]} args={[0.038, 16, 16]} color={eyeColor} />
        <Sphere position={[0.1, 0.06, 0.16]} args={[0.038, 16, 16]} color={eyeColor} />
        
        {/* 瞳孔 */}
        <Sphere position={[-0.1, 0.06, 0.17]} args={[0.022, 12, 12]} color="#000000" />
        <Sphere position={[0.1, 0.06, 0.17]} args={[0.022, 12, 12]} color="#000000" />
        
        {/* 眼神高光 */}
        <Sphere position={[-0.09, 0.075, 0.18]} args={[0.012, 8, 8]} color="#FFFFFF" />
        <Sphere position={[0.11, 0.075, 0.18]} args={[0.012, 8, 8]} color="#FFFFFF" />
        
        {/* 眉毛 */}
        <Box position={[-0.1, 0.15, 0.15]} size={[0.14, 0.03, 0.02]} color={hairColor} />
        <Box position={[0.1, 0.15, 0.15]} size={[0.14, 0.03, 0.02]} color={hairColor} />
        
        {/* 鼻子 */}
        <Box position={[0, -0.02, 0.16]} size={[0.04, 0.06, 0.04]} color={COLORS.skin.shadow} />
        
        {/* 嘴巴 */}
        <Box position={[0, -0.1, 0.14]} size={[0.08, 0.015, 0.02]} color="#B88A7A" />
        
        {/* 耳朵 */}
        <Box position={[-0.24, 0.02, 0.02]} size={[0.05, 0.1, 0.06]} color={skinColor} />
        <Box position={[0.24, 0.02, 0.02]} size={[0.05, 0.1, 0.06]} color={skinColor} />
        
        {/* 耳垂 */}
        <Sphere position={[-0.24, -0.04, 0.02]} args={[0.025, 6, 6]} color={skinColor} />
        <Sphere position={[0.24, -0.04, 0.02]} args={[0.025, 6, 6]} color={skinColor} />
        
        {/* 眼镜（可选） */}
        {config.hasGlasses && (
          <Glasses position={[0, 0.06, 0.14]} frameColor="#1A1A1A" lensColor="#87CEEB" />
        )}
      </group>
      
      {/* ===== 颈部 ===== */}
      <Box position={[0, 1.38, 0]} size={[0.16, 0.08, 0.14]} color={skinColor} />
      
      {/* 领带 */}
      <Box position={[0, 1.28, 0.12]} size={[0.06, 0.16, 0.04]} color={tieColor} />
      <Box position={[0, 1.18, 0.14]} size={[0.1, 0.08, 0.04]} color={tieColor} />
      
      {/* ===== 身体 ===== */}
      <group position={[0, 1.05, 0]}>
        
        {/* 肩膀 */}
        <Box position={[-0.24, 0.15, 0]} size={[0.2, 0.12, 0.18]} color={suitColor} />
        <Box position={[0.24, 0.15, 0]} size={[0.2, 0.12, 0.18]} color={suitColor} />
        
        {/* 西装驳头 */}
        <Box position={[-0.1, 0.28, 0.13]} size={[0.12, 0.1, 0.02]} color={suitColor} />
        <Box position={[0.1, 0.28, 0.13]} size={[0.12, 0.1, 0.02]} color={suitColor} />
        
        {/* 衬衫 */}
        <Box position={[0, 0.28, 0.125]} size={[0.1, 0.12, 0.01]} color={COLORS.shirt.white} />
        
        {/* 领带 */}
        <Box position={[0, 0.22, 0.13]} size={[0.04, 0.14, 0.02]} color={tieColor} />
        <Box position={[0, 0.14, 0.13]} size={[0.06, 0.04, 0.02]} color={tieColor} />
        
        {/* 口袋 */}
        <Box position={[-0.14, 0.05, 0.125]} size={[0.08, 0.06, 0.01]} color={suitColor} />
        <Box position={[0.14, 0.05, 0.125]} size={[0.08, 0.06, 0.01]} color={suitColor} />
        
        {/* 左手臂 */}
        <group ref={leftArmRef} position={[-0.28, 0.12, 0]}>
          <Box position={[0, 0.08, 0]} size={[0.12, 0.18, 0.12]} color={suitColor} />
          <Box position={[0, -0.02, 0]} size={[0.1, 0.04, 0.1]} color={COLORS.shirt.white} />
          <Box position={[0, -0.16, 0]} size={[0.1, 0.16, 0.1]} color={suitColor} />
          <Box position={[0, -0.28, 0.02]} size={[0.08, 0.1, 0.06]} color={skinColor} />
        </group>
        
        {/* 右手臂 */}
        <group ref={rightArmRef} position={[0.28, 0.12, 0]}>
          <Box position={[0, 0.08, 0]} size={[0.12, 0.18, 0.12]} color={suitColor} />
          <Box position={[0, -0.02, 0]} size={[0.1, 0.04, 0.1]} color={COLORS.shirt.white} />
          <Box position={[0, -0.16, 0]} size={[0.1, 0.16, 0.1]} color={suitColor} />
          <Box position={[0, -0.28, 0.02]} size={[0.08, 0.1, 0.06]} color={skinColor} />
          
          {/* 手表（可选） */}
          {config.hasWatch && (
            <Watch position={[0.02, -0.12, 0.04]} bandColor="#1A1A1A" faceColor="#FFFFFF" />
          )}
          
          {/* 耳机（可选） */}
          {config.hasHeadphones && (
            <group position={[-0.32, 0.1, 0]}>
              <mesh>
                <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#1A1A1A" roughness={0.5} metalness={0.3} />
              </mesh>
              <mesh position={[-0.12, 0, 0]}>
                <boxGeometry args={[0.06, 0.1, 0.08]} />
                <meshStandardMaterial color="#1A1A1A" roughness={0.5} />
              </mesh>
            </group>
          )}
        </group>
      </group>
      
      {/* ===== 腰带 ===== */}
      <Box position={[0, 0.78, 0]} size={[0.46, 0.06, 0.24]} color={COLORS.suit.black} />
      <Box position={[0, 0.78, 0.125]} size={[0.08, 0.04, 0.01]} color={COLORS.accessories.gold} />
      
      {/* ===== 公文包（可选） ===== */}
      {config.hasBriefcase && (
        <group position={[0.35, 0.38, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.25, 0.18, 0.1]} />
            <meshStandardMaterial color="#3E2723" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.15, 0.03, 0.08]} />
            <meshStandardMaterial color="#5D4037" roughness={0.6} />
          </mesh>
        </group>
      )}
      
      {/* ===== 裤子 ===== */}
      <group position={[0, 0.52, 0]}>
        <Box position={[-0.1, 0, 0]} size={[0.16, 0.52, 0.16]} color={COLORS.pants.gray} />
        <Box position={[0.1, 0, 0]} size={[0.16, 0.52, 0.16]} color={COLORS.pants.gray} />
        <Box position={[-0.1, -0.28, 0.02]} size={[0.16, 0.04, 0.18]} color={COLORS.pants.gray} />
        <Box position={[0.1, -0.28, 0.02]} size={[0.16, 0.04, 0.18]} color={COLORS.pants.gray} />
      </group>
      
      {/* ===== 鞋子 ===== */}
      <Box position={[-0.1, 0, 0.04]} size={[0.14, 0.08, 0.26]} color={COLORS.shoes.black} />
      <Box position={[0.1, 0, 0.04]} size={[0.14, 0.08, 0.26]} color={COLORS.shoes.black} />
      
      {/* ===== 徽章（可选） ===== */}
      {config.hasBadge && (
        <Badge position={[0.12, 0.25, 0.13]} color="#FFD700" />
      )}
      
    </group>
  );
};

// 预定义的 Agent 配置
export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  'main': {
    id: 'main',
    name: 'CEO',
    suitColor: COLORS.suit.blue,
    hairColor: COLORS.hair.black,
    eyeColor: COLORS.eye.brown,
    tieColor: COLORS.tie.gold,
    hasBadge: true,
    hasBriefcase: true
  },
  'code-expert': {
    id: 'code-expert',
    name: 'Tech Lead',
    suitColor: COLORS.suit.gray,
    hairColor: COLORS.hair.blackAlt,
    eyeColor: COLORS.eye.black,
    tieColor: COLORS.tie.red,
    hasGlasses: true,
    hasWatch: true,
    hasHeadphones: true
  },
  'financial-analyst': {
    id: 'financial-analyst',
    name: 'CFO',
    suitColor: COLORS.suit.grayDark,
    hairColor: COLORS.hair.brown,
    eyeColor: COLORS.eye.brown,
    tieColor: COLORS.tie.blue,
    hasGlasses: true,
    hasWatch: true,
    hasBriefcase: true
  },
  'materials-scientist': {
    id: 'materials-scientist',
    name: 'R&D Lead',
    suitColor: '#ECEFF1',
    skinTone: COLORS.skin.light,
    hairColor: COLORS.hair.brownDark,
    eyeColor: COLORS.eye.blue,
    tieColor: COLORS.tie.blue,
    hasGlasses: true
  },
  'political-analyst': {
    id: 'political-analyst',
    name: 'Strategy',
    suitColor: '#E65100',
    hairColor: COLORS.hair.black,
    eyeColor: COLORS.eye.brown,
    tieColor: COLORS.tie.gold,
    hasBadge: true,
    hasBriefcase: true
  },
  'zhihu': {
    id: 'zhihu',
    name: 'Operations',
    suitColor: COLORS.suit.blueDark,
    hairColor: COLORS.hair.brown,
    eyeColor: COLORS.eye.brown,
    tieColor: COLORS.tie.red
  }
};
