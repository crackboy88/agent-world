/**
 * 3D Scene Component - Simple test version
 */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import { useState, useEffect, useRef } from 'react';
import { AgentModel3D } from './AgentModel3D';
import { MapItem3D } from './MapItem3D';
import type { Agent } from '../../types';
import { DEFAULT_MAP_ITEMS, getModelUrl, type MapItem } from '../../config';

// Simple floor component
const Floor = ({ size = 20, onClick }: { size?: number; onClick?: (point: THREE.Vector3) => void }) => {
  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick?.(e.point);
  };
  
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow onClick={handleClick}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#D4CFC7" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Grid lines for visual reference */}
      <gridHelper args={[size, size, '#B8B4AB', '#C8C4BD']} position={[0, 0.01, 0]} />
    </group>
  );
};

// Map Items component
const MapItems = ({ onItemClick, selectedItemId }: { onItemClick?: (id: string) => void; selectedItemId?: string }) => {
  const items = DEFAULT_MAP_ITEMS || [];
  
  if (!items || items.length === 0) return null;
  
  return (
    <>
      {items.map((item: MapItem) => {
        const x = ((item.position?.x || 512) - 512) / 100;
        const z = ((item.position?.y || 512) - 512) / 100;
        const modelUrl = getModelUrl(item.type);
        
        return (
          <MapItem3D
            key={item.id}
            modelUrl={modelUrl}
            position={[x, 0, z]}
            rotation={item.rotation || 0}
            color={item.color}
            onClick={() => onItemClick?.(item.id)}
            isSelected={selectedItemId === item.id}
          />
        );
      })}
    </>
  );
};

export const Scene3D = ({ 
  agents, 
  selectedAgentId, 
  onAgentClick, 
  agentAppearances = {},
  onMapClick,
  onDeselect,
  selectedItemId,
  onItemClick,
  onAgentMove
}: { 
  agents: Agent[]; 
  selectedAgentId?: string; 
  onAgentClick?: (id: string) => void; 
  agentAppearances?: Record<string, { modelId?: string; modelUrl?: string; color?: string }>;
  onMapClick?: (position: { x: number; y: number }) => void;
  onDeselect?: () => void;
  selectedItemId?: string;
  onItemClick?: (id: string) => void;
  onAgentMove?: (agentId: string, position: { x: number; y: number }) => void;
}) => {
  // Map bounds (in 2D coordinates: 112-912)
  const MAP_MIN = 112;
  const MAP_MAX = 912;
  
  // Random walking state - store agent IDs that should be walking
  const [wanderingAgents, setWanderingAgents] = useState<Record<string, { targetX: number; targetY: number; startX: number; startY: number; progress: number }>>({});
  const walkTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // When wandering ends, save the final position
  const finalizeWandering = (agentId: string, targetX: number, targetY: number) => {
    if (onAgentMove) {
      onAgentMove(agentId, { x: Math.round(targetX), y: Math.round(targetY) });
    }
  };
  
  // Random walking logic - periodically make random agents walk
  useEffect(() => {
    const updateWandering = () => {
      if (!agents || agents.length === 0) return;
      
      setWanderingAgents(prev => {
        const newWandering = { ...prev };
        
        agents.forEach(agent => {
          // Skip if selected
          if (selectedAgentId === agent.id) {
            if (newWandering[agent.id]) {
              delete newWandering[agent.id];
            }
            return;
          }
          
          // Skip if not idle
          if (agent.state && agent.state !== 'idle') {
            if (newWandering[agent.id]) {
              delete newWandering[agent.id];
            }
            return;
          }
          
          const isWandering = !!newWandering[agent.id];
          const rand = Math.random();
          const currentX = agent.position?.x || 512;
          const currentY = agent.position?.y || 512;
          
          // 20% chance to start wandering
          if (!isWandering && rand < 0.2) {
            // Random target within map bounds
            const targetX = Math.random() * (MAP_MAX - MAP_MIN) + MAP_MIN;
            const targetY = Math.random() * (MAP_MAX - MAP_MIN) + MAP_MIN;
            newWandering[agent.id] = {
              targetX,
              targetY,
              startX: currentX,
              startY: currentY,
              progress: 0
            };
          } 
          // 35% chance to stop wandering - save final position
          else if (isWandering && rand < 0.35) {
            const wander = newWandering[agent.id];
            if (wander) {
              finalizeWandering(agent.id, wander.targetX, wander.targetY);
            }
            delete newWandering[agent.id];
          }
        });
        
        return newWandering;
      });
    };
    
    // Update every 3 seconds
    walkTimerRef.current = setInterval(updateWandering, 3000);
    
    return () => {
      if (walkTimerRef.current) {
        clearInterval(walkTimerRef.current);
      }
    };
  }, [agents, selectedAgentId]);
  
  // Animate wandering agents - update position smoothly
  useEffect(() => {
    const animatePositions = () => {
      setWanderingAgents(prev => {
        const updated = { ...prev };
        let hasUpdates = false;
        
        Object.keys(updated).forEach(agentId => {
          const wander = updated[agentId];
          if (!wander) return;
          
          // Move progress forward
          wander.progress += 0.01;
          
          if (wander.progress >= 1) {
            // Reached target, remove
            delete updated[agentId];
            hasUpdates = true;
          } else {
            hasUpdates = true;
          }
        });
        
        return hasUpdates ? updated : prev;
      });
    };
    
    const animFrame = setInterval(animatePositions, 50);
    return () => clearInterval(animFrame);
  }, []);
  
  // Get agent display state (walking if wandering)
  const getAgentDisplayState = (agent: Agent) => {
    if (wanderingAgents[agent.id]) return 'walking';
    return agent.state || 'idle';
  };
  
  // Get agent position (with wandering offset)
  const getAgentPosition = (agent: Agent): [number, number, number] => {
    const wander = wanderingAgents[agent.id];
    let posX = agent.position?.x || 512;
    let posY = agent.position?.y || 512;
    
    if (wander) {
      // Interpolate position
      const t = Math.min(wander.progress, 1);
      // Ease in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      posX = wander.startX + (wander.targetX - wander.startX) * eased;
      posY = wander.startY + (wander.targetY - wander.startY) * eased;
    }
    
    try {
      const x = (posX - 512) / 100;
      const z = (posY - 512) / 100;
      return [x, 0, z];
    } catch (e) {
      return [0, 0, 0];
    }
  };

  // Handle right-click to deselect
  const handleContextMenu = (e: any) => {
    e?.preventDefault?.();
    onDeselect?.();
  };

  // Handle floor click - convert 3D to 2D
  const handleFloorClick = (point: THREE.Vector3) => {
    const x = Math.round(point.x * 100 + 512);
    const y = Math.round(point.z * 100 + 512);
    onMapClick?.({ x, y });
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <div id="debug-info" style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'rgba(0,0,0,0.7)', color: 'white', padding: 10, fontSize: 12 }}></div>
      <Canvas 
        style={{ height: '100%', background: '#E8E4DF' }}
        gl={{ antialias: true }} 
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={[1, 2]}
        onContextMenu={handleContextMenu}
      >
        <color attach="background" args={['#E8E4DF']} />
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={3} maxDistance={20} />
        
        {/* Ambient - base illumination */}
        <ambientLight intensity={0.7} />
        
        {/* Hemisphere - sky/ground color */}
        <hemisphereLight args={['#87CEEB', '#8B7355', 0.6]} />
        
        {/* Main directional - sun-like */}
        <directionalLight 
          position={[10, 15, 10]} 
          intensity={2} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        
        {/* Fill light - softer from opposite side */}
        <directionalLight 
          position={[-8, 10, -8]} 
          intensity={0.6} 
          color="#E8E4DF"
        />
        
        {/* Point light - extra warmth */}
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#FFF5E6" />
        
        {/* Environment for better GLB material rendering */}
        <Environment preset="apartment" />
        
        {/* Fog for depth */}
        <fog attach="fog" args={['#E8E4DF', 15, 40]} />
        
        {/* Contact shadows for grounded look */}
        <ContactShadows 
          position={[0, 0.01, 0]} 
          opacity={0.5} 
          scale={25} 
          blur={2.5} 
          far={15} 
          color="#1a1a1a"
        />
        
        <Floor size={20} onClick={handleFloorClick} />
        
        {/* Map Items from config */}
        <MapItems onItemClick={onItemClick} selectedItemId={selectedItemId} />
        
        {/* Agents */}
        <Suspense fallback={null}>
        {agents && agents.map(agent => {
          if (!agent?.id) return null;
          const pos = getAgentPosition(agent);
          const appearance = agentAppearances?.[agent.id] || {};
          // Use default model if not set
          const modelUrl = appearance.modelUrl || '/assets/agents/HappyIdle.fbx';
          const agentColor = appearance.color || '#3B82F6';
          // Use wandering state if agent is randomly walking
          const displayState = getAgentDisplayState(agent);
          // FBX models are typically much larger, need to scale down
          const isFBX = modelUrl.toLowerCase().endsWith('.fbx');
          const agentScale = isFBX ? 0.01 : 1;
          
          return (
            <AgentModel3D
              key={`agent3d-${agent.id}`}
              agentId={agent.id}
              name={agent.id}
              modelUrl={modelUrl}
              position={pos}
              scale={agentScale}
              color={agentColor}
              state={displayState}
              onClick={() => onAgentClick?.(agent.id)}
            />
          );
        })}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;
