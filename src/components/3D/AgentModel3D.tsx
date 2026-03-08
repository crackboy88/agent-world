/**
 * 3D Agent Component - Using state for model
 */
import { useEffect, useState } from 'react';
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
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load GLB model
  useEffect(() => {
    setLoading(true);
    setModel(null);
    
    const loader = new GLTFLoader();
    loader.load(
      modelToLoad,
      (gltf) => {
        setModel(gltf.scene);
        setLoading(false);
      },
      undefined,
      (err: any) => {
        setLoading(false);
      }
    );
  }, [agentId, modelToLoad]);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  console.log('[DEBUG] AgentModel3D render:', agentId, 'loading=', loading, 'model=', model ? 'yes' : 'no');
  
  return (
    <group position={position} onClick={handleClick}>
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
