/**
 * 3D Agent Component - Using refs for stable model handling
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
  const modelRef = useRef<THREE.Group | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load GLB model using useEffect
  useEffect(() => {
    console.log('[DEBUG] AgentModel3D: Starting load for', agentId);
    
    const loader = new GLTFLoader();
    loader.load(
      modelToLoad,
      (gltf) => {
        console.log('[DEBUG] AgentModel3D: Model loaded for', agentId, gltf.scene);
        modelRef.current = gltf.scene;
        setLoaded(true);
      },
      undefined,
      (err: any) => {
        console.error('[DEBUG] AgentModel3D: Load error for', agentId, err);
        setError(err.message || 'Failed to load');
      }
    );
    
    // Cleanup
    return () => {
      console.log('[DEBUG] AgentModel3D: Cleanup for', agentId);
      if (modelRef.current) {
        modelRef.current = null;
      }
    };
  }, [agentId, modelToLoad]);
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  console.log('[DEBUG] AgentModel3D render:', agentId, 'loaded=', loaded, 'modelRef=', modelRef.current ? 'exists' : 'null');
  
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* 点击区域 */}
      <mesh visible={false} position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2.5, 1.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* 模型或占位符 */}
      {loaded && modelRef.current ? (
        <primitive object={modelRef.current} scale={scale} />
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
