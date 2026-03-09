/**
 * 3D Agent Component - Using separate FBX files for each state
 */
import { useEffect, useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimations, Html } from '@react-three/drei';
import { useFBX } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

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

// FBX files for different states
const FBX_MODELS: Record<string, string> = {
  idle: '/assets/agents/HappyIdle.fbx',
  walking: '/assets/agents/Walking.fbx',
  working: '/assets/agents/Talking.fbx',
  walk: '/assets/agents/Walking.fbx',
};

// Debug: force load different FBX based on state to see animations
const getFBXUrl = (state: string): string => {
  if (state === 'idle') return '/assets/agents/HappyIdle.fbx';
  if (state === 'walking' || state === 'walk') return '/assets/agents/Walking.fbx';
  if (state === 'working') return '/assets/agents/Talking.fbx';
  return '/assets/agents/HappyIdle.fbx';
};

export const AgentModel3D = ({ 
  agentId, 
  name,
  position, 
  modelUrl, 
  color, 
  scale = 0.01,
  state = 'idle',
  onClick
}: AgentModel3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * 100);
  
  // Get the appropriate FBX based on state - use state as key to force reload
  const currentFBXUrl = getFBXUrl(state);
  
  // Load FBX model - force reload when state changes
  const fbx = useFBX(currentFBXUrl);
  
  // Debug: show FBX loading in DOM (useEffect to avoid setState during render)
  useEffect(() => {
    const debugEl = typeof document !== 'undefined' ? document.getElementById('debug-info') : null;
    if (debugEl) {
      debugEl.innerHTML = `State: ${state}<br/>FBX: ${currentFBXUrl}<br/>`;
    }
  }, [state, currentFBXUrl]);
  
  // Clone the scene for this agent instance
  const sceneClone = useMemo(() => {
    if (!fbx) return null;
    return SkeletonUtils.clone(fbx);
  }, [fbx, agentId]);
  
  // Set up animations for this agent
  const { actions } = useAnimations(fbx?.animations || [], groupRef);
  
  // Handle state changes - play first available animation
  useEffect(() => {
    if (!actions || !fbx) return;
    
    // Stop all current animations
    Object.values(actions).forEach(action => action?.stop());
    
    // Just use first animation, don't try to match state
    const allAnims = Object.keys(actions);
    const animName = allAnims[0];
    
    console.log(`State: ${state}, Playing: ${animName}`);
    actions[animName]?.play();
  }, [state, currentFBXUrl]);
  
  // Procedural animation (breathing effect)
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    timeRef.current += delta;
    const t = timeRef.current;
    
    // Subtle breathing animation
    groupRef.current.position.y = Math.sin(t * 2) * 0.02;
  });
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {/* 模型 */}
      {sceneClone ? (
        <primitive object={sceneClone} scale={scale} castShadow receiveShadow />
      ) : (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color="#888" />
        </mesh>
      )}
      
      {/* 名称标签 */}
      {name && (
        <Html position={[0, 1.8, 0]} center distanceFactor={10}>
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            fontFamily: 'Arial, sans-serif',
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default AgentModel3D;
