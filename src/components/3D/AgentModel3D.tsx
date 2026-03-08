/**
 * 3D Agent Component - Using raw GLTFLoader for better compatibility
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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

// Simple placeholder component
const ModelPlaceholder = ({ color }: { color?: string }) => (
  <mesh castShadow position={[0, 0.5, 0]}>
    <boxGeometry args={[0.5, 1, 0.5]} />
    <meshStandardMaterial color={color || '#888'} />
  </mesh>
);

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
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load GLB model manually
  useEffect(() => {
    console.log('[DEBUG] AgentModel3D: Loading model from', modelToLoad);
    setLoading(true);
    setError(null);
    
    const loader = new GLTFLoader();
    loader.load(
      modelToLoad,
      (gltf) => {
        console.log('[DEBUG] AgentModel3D: Model loaded successfully', gltf.scene);
        setModel(gltf.scene);
        setLoading(false);
      },
      (progress) => {
        console.log('[DEBUG] AgentModel3D: Loading progress', progress.loaded, '/', progress.total);
      },
      (err: any) => {
        console.error('[DEBUG] AgentModel3D: Model load error', err);
        setError(err.message || 'Failed to load model');
        setLoading(false);
      }
    );
  }, [modelToLoad]);
  
  // Apply color to model
  useEffect(() => {
    if (model && color) {
      model.traverse((child) => {
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
  }, [model, color]);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  // Show loading state
  if (loading) {
    return (
      <group position={position} onClick={handleClick}>
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[0.3, 0.6, 0.3]} />
          <meshStandardMaterial color="#666" wireframe />
        </mesh>
        {name && (
          <Html position={[0, 1.2, 0]} center distanceFactor={10}>
            <div style={{ fontSize: '10px', color: '#666' }}>Loading...</div>
          </Html>
        )}
      </group>
    );
  }
  
  // Show error state or model
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* 点击区域 */}
      <mesh visible={false} position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 模型或占位符 */}
      {model ? (
        <primitive object={model} scale={scale} />
      ) : (
        <ModelPlaceholder color={color} />
      )}
      
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
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default AgentModel3D;
