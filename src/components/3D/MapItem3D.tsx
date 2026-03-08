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
  onClick?: () => void;
  isSelected?: boolean;
}

export const MapItem3D = ({ 
  modelUrl, 
  position, 
  rotation = 0, 
  scale = 1, 
  color,
  onClick,
  isSelected
}: MapItem3DProps) => {
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
  
  // 处理点击 - 用 onPointerDown 确保捕获
  const handlePointerDown = (e: any) => {
    e.stopPropagation(); // 阻止事件传播到 Floor
    console.log('[DEBUG] MapItem clicked!');
    onClick?.();
  };
  
  // 渲染模型
  if (clonedScene) {
    return (
      <group 
        position={position} 
        onPointerDown={handlePointerDown}
      >
        {/* 3D 模型 */}
        <primitive
          object={clonedScene}
          rotation={[0, rotation, 0]}
          scale={scale}
        />
        
        {/* 选中高亮效果 */}
        {isSelected && (
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 2]} />
            <meshBasicMaterial color="#4CAF50" opacity={0.3} transparent />
          </mesh>
        )}
      </group>
    );
  }
  
  // Fallback - 简单方块
  return (
    <group position={position} onPointerDown={handlePointerDown}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color || '#888'} />
      </mesh>
    </group>
  );
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
