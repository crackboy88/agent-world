/**
 * 3D Agent Component - With animations and idle movement
 */
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useRef, useState, Suspense } from 'react';
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
  state?: string;
  onClick?: () => void;
}

const DEFAULT_AGENT_MODEL = '/assets/agents/mixamo.glb';

// 简单的占位符组件
const ModelPlaceholder = ({ color }: { color?: string }) => (
  <mesh castShadow position={[0, 0.5, 0]}>
    <boxGeometry args={[0.5, 1, 0.5]} />
    <meshStandardMaterial color={color || '#888'} />
  </mesh>
);

// 模型加载组件 - 包含3D模型和名称标签
const GLBModelWithLabel = ({ 
  url, 
  color, 
  scale,
  state,
  name,
  onClick
}: { 
  url: string; 
  color?: string; 
  scale: number;
  state: string;
  name?: string;
  onClick?: () => void;
}) => {
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, scene);
  
  const clonedScene = scene ? scene.clone() : null;
  
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
  
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const actionNames = Object.keys(actions);
      const animationMap: Record<string, string[]> = {
        idle: ['Idle', 'idle', 'Stand', 'stand', 'Waiting'],
        walking: ['Walk', 'walk', 'Running', 'running', 'Run'],
        working: ['Work', 'work', 'Working', 'working'],
      };
      const possibleNames = animationMap[state] || animationMap['idle'];
      
      let foundAction = actionNames.find(name => actions[name]);
      if (!foundAction && actionNames.length > 0) {
        foundAction = actionNames[0];
      }
      
      if (foundAction && actions[foundAction]) {
        Object.values(actions).forEach(a => a?.stop());
        actions[foundAction]?.reset().fadeIn(0.3).play();
      }
    }
  }, [actions, state]);
  
  if (!clonedScene) return null;
  
  // 点击处理
  const handleClick = (e: any) => {
    e.stopPropagation();
    console.log('[DEBUG] GLBModel clicked');
    onClick?.();
  };
  
  return (
    <group onClick={handleClick}>
      {/* 3D模型 - 确保可以点击 */}
      <primitive 
        object={clonedScene} 
        scale={scale}
      />
      
      {/* 点击区域 - 覆盖整个模型区域 */}
      <mesh 
        visible={false} 
        position={[0, 1, 0]}
      >
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 名称标签 - 绑定在模型上 */}
      {name && (
        <Html
          position={[0, 2.2, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
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
  const modelToLoad = modelUrl || DEFAULT_AGENT_MODEL;
  const groupRef = useRef<THREE.Group>(null);
  const idleTimeRef = useRef(Math.random() * 100);
  
  // 浮动动画
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
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* 点击区域 - 始终在最外层，不受 GLB 模型影响 */}
      <mesh visible={false} position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 尝试加载GLB模型，如果失败则显示占位符 */}
      <Suspense fallback={<ModelPlaceholder color={color} />}>
        <GLBModelWithLabel 
          url={modelToLoad} 
          color={color} 
          scale={scale} 
          state={state}
          name={name}
        />
      </Suspense>
      
      {/* 名称标签 */}
      {name && (
        <Html
          position={[0, 2.2, 0]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
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

export function preloadAgentModel() {
  useGLTF.preload(DEFAULT_AGENT_MODEL);
}
