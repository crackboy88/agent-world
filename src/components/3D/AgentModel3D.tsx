/**
 * 3D Agent Component - Using state for model
 */
import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * 100);
  
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
  
  // Animate based on state
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    timeRef.current += delta;
    const t = timeRef.current;
    
    switch (state) {
      case 'working':
        // Working: faster bobbing + slight rotation
        groupRef.current.position.y = Math.sin(t * 3) * 0.03;
        groupRef.current.rotation.z = Math.sin(t * 2) * 0.05;
        break;
      case 'thinking':
        // Thinking: slow pulse
        groupRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.02);
        break;
      case 'walking':
        // Walking: bouncy walk motion
        groupRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.1;
        groupRef.current.rotation.y = Math.sin(t * 4) * 0.1;
        break;
      case 'idle':
      default:
        // Idle: gentle breathing
        groupRef.current.position.y = Math.sin(t * 1.5) * 0.02;
        groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.02;
        break;
    }
  });
  
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
