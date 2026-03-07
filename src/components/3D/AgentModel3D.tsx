/**
 * 3D Agent Component - With animations and idle movement
 */
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentModel3DProps {
  agentId: string;
  position: [number, number, number];
  modelUrl?: string;
  color?: string;
  scale?: number;
  state?: string; // 'idle', 'walking', 'working', etc.
}

// 默认 Agent 模型 URL
const DEFAULT_AGENT_MODEL = '/assets/agents/agent-default.glb';

export const AgentModel3D = ({ 
  agentId, 
  position, 
  modelUrl, 
  color, 
  scale = 1,
  state = 'idle'
}: AgentModel3DProps) => {
  // 使用用户选择的模型，或默认模型
  const modelToLoad = modelUrl || DEFAULT_AGENT_MODEL;
  
  // 加载模型和动画
  const { scene, animations } = useGLTF(modelToLoad);
  const { actions } = useAnimations(animations, scene);
  
  // 用于 idle 动画的 ref
  const groupRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(Math.random() * 100); // 随机起始时间
  
  const clonedScene = scene.clone();
  
  // 应用颜色（如果指定了颜色）
  if (color) {
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
  
  return (
    <group ref={groupRef}>
      <primitive
        object={clonedScene}
        position={position}
        scale={scale}
      />
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
  ];
  models.forEach(url => useGLTF.preload(url));
}
