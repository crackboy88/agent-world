/**
 * 3D Agent Component - With animations and idle movement
 */
import { useGLTF, useAnimations, Center } from '@react-three/drei';
import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface AgentModel3DProps {
  agentId: string;
  name?: string;
  position: [number, number, number];
  modelUrl?: string;
  color?: string;
  scale?: number;
  state?: string; // 'idle', 'walking', 'working', etc.
  onClick?: () => void;
}

// 默认 Agent 模型 URL
const DEFAULT_AGENT_MODEL = '/assets/agents/agent-default.glb';

// 不同模型的预设偏移（Y轴抬升，使模型底部对齐地面）
const MODEL_OFFSETS: Record<string, number> = {
  '/assets/agents/agent-default.glb': 0,
  '/assets/agents/soldier-animated.glb': 0,
  '/assets/agents/xbot.glb': 0,
  '/assets/agents/character1.glb': 0,
  '/assets/agents/Michelle.glb': 0,
  '/assets/agents/michelle.glb': 0,
};

export const AgentModel3D = ({ 
  agentId, 
  name,
  position, 
  modelUrl, 
  color, 
  scale = 1,
  state = 'idle',
  onClick
}: AgentModel3DProps) => {
  // 使用用户选择的模型，或默认模型
  const modelToLoad = modelUrl || DEFAULT_AGENT_MODEL;
  
  // 加载模型和动画
  const { scene, animations } = useGLTF(modelToLoad);
  const { actions } = useAnimations(animations, scene);
  
  // 用于 idle 动画的 ref
  const groupRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(Math.random() * 100);
  
  // 克隆场景
  const clonedScene = useMemo(() => scene ? scene.clone() : null, [scene]);
  
  // 获取模型的预设偏移
  const modelOffset = MODEL_OFFSETS[modelToLoad] ?? 0;
  
  // 应用颜色到克隆的场景
  useEffect(() => {
    if (clonedScene && color) {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            if (material.color) {
              material.color.set(color);
            }
          }
        }
      });
    }
  }, [clonedScene, color]);
  
  // 播放动画
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const actionNames = Object.keys(actions);
      
      const animationMap: Record<string, string[]> = {
        idle: ['Idle', 'idle', 'Stand', 'stand', 'Waiting', 'Walk', 'walk'],
        walking: ['Walk', 'walk', 'Running', 'running', 'Run'],
        working: ['Work', 'work', 'Working', 'working'],
      };
      
      const possibleNames = animationMap[state] || animationMap['idle'];
      
      let foundAction = null;
      for (const name of possibleNames) {
        const action = actions[name];
        if (action) {
          foundAction = action;
          break;
        }
      }
      
      if (!foundAction && actionNames.length > 0) {
        foundAction = actions[actionNames[0]];
      }
      
      if (foundAction) {
        Object.values(actions).forEach(a => a?.stop());
        foundAction.reset().fadeIn(0.3).play();
      }
      
      return () => {
        if (foundAction) {
          foundAction.fadeOut(0.3);
        }
      };
    }
  }, [actions, state]);
  
  // 随机浮动动画 - 对所有模型都启用（无论是否有 GLB 动画）
  useFrame((_, delta) => {
    if (groupRef.current) {
      idleTimeRef.current += delta;
      
      // 状态相关的浮动幅度
      const floatSpeed = state === 'working' ? 1.5 : (state === 'walking' ? 3 : 2);
      const floatAmplitude = state === 'working' ? 0.015 : 0.02;
      
      // 轻微的上下浮动 + 轻微的左右摇摆
      const floatY = Math.sin(idleTimeRef.current * floatSpeed) * floatAmplitude;
      const swayX = Math.sin(idleTimeRef.current * floatSpeed * 0.75) * 0.01;
      
      groupRef.current.position.y = floatY;
      groupRef.current.rotation.y = swayX;
    }
  });
  
  // 如果场景为空，返回一个可点击的占位符
  if (!clonedScene) {
    return (
      <group position={position} onClick={(e: any) => { e.stopPropagation(); onClick?.(); }}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color={color || '#888'} />
        </mesh>
        {/* 名称标签 */}
        {name && (
          <Html
            position={[0, 1.5, 0]}
            center
            distanceFactor={10}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div style={{
              background: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              {name}
            </div>
          </Html>
        )}
      </group>
    );
  }
  
  // 点击处理函数
  const handleClick = (e: any) => {
    e.stopPropagation();
    console.log('[DEBUG] AgentModel3D clicked:', agentId);
    onClick?.();
  };
  
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* 使用 Center 组件自动居中模型 */}
      <Center top>
        <primitive
          object={clonedScene}
          scale={scale}
        />
      </Center>
      
      {/* 不可见的点击区域 (hitbox) - 覆盖整个模型区域 */}
      <mesh visible={false} position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Agent 名称标签 - 在模型顶部 */}
      {name && (
        <Html
          position={[0, 1.8, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'Arial, sans-serif',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

// 预加载 Agent 模型
export function preloadAgentModel() {
  useGLTF.preload(DEFAULT_AGENT_MODEL);
  
  const models = [
    '/assets/agents/soldier-animated.glb',
    '/assets/agents/xbot.glb',
    '/assets/agents/character1.glb',
    '/assets/agents/Michelle.glb',
  ];
  models.forEach(url => useGLTF.preload(url));
}
