/**
 * 3D Agent Component - Loads agent model from assets folder
 */
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface AgentModel3DProps {
  agentId: string;
  position: [number, number, number];
  modelUrl?: string;
  color?: string;
  scale?: number;
}

// 默认 Agent 模型 URL
const DEFAULT_AGENT_MODEL = '/assets/agents/agent-default.glb';

export const AgentModel3D = ({ agentId, position, modelUrl, color, scale = 1 }: AgentModel3DProps) => {
  // 使用用户选择的模型，或默认模型
  const modelToLoad = modelUrl || DEFAULT_AGENT_MODEL;
  
  // 加载模型
  const { scene } = useGLTF(modelToLoad);
  
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone();
    
    // 应用颜色（如果指定了）
    if (color) {
      cloned.traverse((child) => {
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
    return cloned;
  }, [scene, color]);
  
  if (!clonedScene) return null;
  
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
}
