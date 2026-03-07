/**
 * 3D Map Item Component - Loads models from assets folder
 */
import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface MapItem3DProps {
  modelUrl: string;
  position: [number, number, number];
  rotation?: number;
  scale?: number;
  color?: string;
}

export const MapItem3D = ({ modelUrl, position, rotation = 0, scale = 1, color }: MapItem3DProps) => {
  // 尝试加载 GLB 模型
  const { scene } = useGLTF(modelUrl);
  
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const cloned = scene.clone();
    
    // 应用颜色覆盖（如果指定了颜色）
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
  
  // 渲染模型
  if (clonedScene) {
    return (
      <primitive
        object={clonedScene}
        position={position}
        rotation={[0, rotation, 0]}
        scale={scale}
      />
    );
  }
  
  return null;
};

// 预加载所有模型
export function preloadModels() {
  const models = [
    '/assets/models/table.glb',
    '/assets/models/chair.glb',
    '/assets/models/desk.glb',
    '/assets/models/cabinet.glb',
    '/assets/models/plant-small.glb',
    '/assets/models/plant-large.glb',
  ];
  
  models.forEach(url => {
    useGLTF.preload(url);
  });
}
