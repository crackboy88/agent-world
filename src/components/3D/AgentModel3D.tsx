/**
 * 3D Agent Component - Fixed state transition
 */
import { useEffect, useRef, useMemo } from 'react';
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

const FBX_MODELS = {
  idle: '/assets/agents/HappyIdle.fbx',
  walking: '/assets/agents/Walking.fbx',
  working: '/assets/agents/Talking.fbx',
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
  
  // Get FBX URL based on state
  const fbxUrl = state === 'walking' ? FBX_MODELS.walking : 
                 state === 'working' ? FBX_MODELS.working : FBX_MODELS.idle;
  
  // Load FBX - this triggers re-load when URL changes
  const fbx = useFBX(fbxUrl);
  
  // Clone the FBX - force re-clone when fbxUrl changes
  const sceneClone = useMemo(() => {
    if (!fbx) return null;
    return SkeletonUtils.clone(fbx);
  }, [fbx, agentId]);
  
  // Get animations from the CLONED scene
  const { actions, mixer } = useAnimations(sceneClone?.animations || [], groupRef);
  
  const prevUrlRef = useRef(fbxUrl);
  
  // Play animation whenever fbxUrl changes
  useEffect(() => {
    if (!actions || !mixer || !sceneClone) return;
    
    const animNames = Object.keys(actions);
    if (animNames.length === 0) {
      console.log(`[${agentId}] ⚠️ No animations in ${fbxUrl}`);
      return;
    }
    
    // Always restart animation on FBX change
    Object.values(actions).forEach(a => a?.stop());
    
    const action = actions[animNames[0]];
    if (action) {
      action.reset();
      action.fadeIn(0.15);
      action.play();
      console.log(`[${agentId}] ✅ Playing: "${animNames[0]}" for ${state} (FBX: ${fbxUrl})`);
    }
    
    prevUrlRef.current = fbxUrl;
  }, [fbxUrl, state, sceneClone, actions, mixer, agentId]);
  
  // Procedural animation
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    const t = timeRef.current;
    
    if (state === 'walking') {
      groupRef.current.position.y = Math.sin(t * 8) * 0.03;
    } else {
      groupRef.current.position.y = Math.sin(t * 2) * 0.02;
    }
  });
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.();
  };
  
  return (
    <group ref={groupRef} position={position} onClick={handleClick}>
      {sceneClone ? (
        <primitive object={sceneClone} scale={scale} castShadow receiveShadow />
      ) : (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 1, 0.5]} />
          <meshStandardMaterial color={color || "#888"} />
        </mesh>
      )}
      
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
            {name} ({state})
          </div>
        </Html>
      )}
    </group>
  );
};

export default AgentModel3D;
