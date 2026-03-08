/**
 * 3D Agent Component - With animations and idle movement
 */
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useRef, useMemo, useState } from 'react';
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
  const primitiveRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(Math.random() * 100);
  
  // 克隆场景
  const clonedScene = useMemo(() => scene ? scene.clone() : null, [scene]);
  
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
  
  // 随机浮动动画
  useFrame((_, delta) => {
    if (groupRef.current) {
      idleTimeRef.current += delta;
      
      const floatSpeed = state === 'working' ? 1.5 : (state === 'walking' ? 3 : 2);
      const floatAmplitude = state === 'working' ? 0.015 : 0.02;
      
      const floatY = Math.sin(idleTimeRef.current * floatSpeed) * floatAmplitude;
      const swayX = Math.sin(idleTimeRef.current * floatSpeed * 0.75) * 0.01;
      
      groupRef.current.position.y = floatY;
      groupRef.current.rotation.y = swayX;
    }
  });
  
  // 如果场景为空，返回占位符
  if (!clonedScene) {
    return (
      <group position={position} onClick={(e: any) => { e.stopPropagation(); onClick?.(); }}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color={color || '#888'} />
        </mesh>
        {name && (
          <Html position={[0, 1.5, 0]} center distanceFactor={10} style={{ pointerEvents: 'none', userSelect: 'none' }}>
            <div style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', whiteSpace: 'nowrap' }}>
              {name}
            </div>
          </Html>
        )}
      </group>
    );
  }
  
  // 点击处理
  const handleClick = (e: any) => {
    e.stopPropagation();
    console.log('[DEBUG] AgentModel3D clicked:', agentId);
    onClick?.();
  };
  
  // 检查并重置模型的 transform
  useEffect(() => {
    if (clonedScene) {
      // 重置 position 和 rotation，保留 scale
      clonedScene.position.set(0, 0, 0);
      clonedScene.rotation.set(0, 0, 0);
      console.log('[DEBUG] Model transform reset, position:', clonedScene.position);
    }
  }, [clonedScene]);
  
  return (
    <group position={position} onClick={handleClick}>
      {/* 模型和标签放在同一个子 group */}
      <group>
        {/* 3D模型 */}
        <primitive
          ref={primitiveRef}
          object={clonedScene}
          scale={scale}
        />
        
        {/* 点击区域 */}
        <mesh visible={false} position={[0, 1, 0]}>
          <boxGeometry args={[1.2, 2, 1.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
        
        {/* 名称标签 */}
        {name && (
          <Html
            position={[0, 2.2, 0]}
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
