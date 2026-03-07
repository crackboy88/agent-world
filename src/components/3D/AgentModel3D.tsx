/**
 * 3D Agent Component - With animations
 */
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect } from 'react';
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
  const { actions, mixer } = useAnimations(animations);
  
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
      // 尝试找到匹配的动画
      const actionNames = Object.keys(actions);
      
      // 常见动画名称映射
      const animationMap: Record<string, string[]> = {
        idle: ['Idle', 'idle', 'Stand', 'stand', 'Waiting'],
        walking: ['Walk', 'walk', 'Running', 'running', 'Run'],
        working: ['Work', 'work', 'Working', 'working'],
      };
      
      const possibleNames = animationMap[state] || animationMap['idle'];
      
      // 找到匹配的动画
      let foundAction = null;
      for (const name of possibleNames) {
        const action = actions[name];
        if (action) {
          foundAction = action;
          break;
        }
      }
      
      // 如果没找到，使用第一个动画
      if (!foundAction && actionNames.length > 0) {
        foundAction = actions[actionNames[0]];
      }
      
      if (foundAction) {
        // 停止所有动画
        Object.values(actions).forEach(a => a?.stop());
        // 播放选中的动画
        foundAction.reset().fadeIn(0.3).play();
      }
      
      return () => {
        if (foundAction) {
          foundAction.fadeOut(0.3);
        }
      };
    }
  }, [actions, state]);
  
  return (
    <primitive
      object={clonedScene}
      position={position}
      scale={scale}
    />
  );
};

// 预加载 Agent 模型
export function preloadAgentModel() {
  useGLTF.preload(DEFAULT_AGENT_MODEL);
  
  // 预加载其他模型
  const models = [
    '/assets/agents/animated-character.glb',
    '/assets/agents/xbot.glb',
    '/assets/agents/character1.glb',
  ];
  models.forEach(url => useGLTF.preload(url));
}
