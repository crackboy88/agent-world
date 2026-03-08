/**
 * 3D Scene Component - Simple test version
 */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow onClick={handleClick}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#E8E4DF" />
    </mesh>
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
  onItemClick
}: { 
  agents: Agent[]; 
  selectedAgentId?: string; 
  onAgentClick?: (id: string) => void; 
  agentAppearances?: Record<string, { modelId?: string; modelUrl?: string; color?: string }>;
  onMapClick?: (position: { x: number; y: number }) => void;
  onDeselect?: () => void;
  selectedItemId?: string;
  onItemClick?: (id: string) => void;
}) => {
  console.log('[DEBUG] Scene3D rendering, agents:', agents?.length);
  
  // Convert 2D position to 3D
  const getAgentPosition = (agent: Agent): [number, number, number] => {
    try {
      if (!agent || !agent.position) return [0, 0, 0];
      const posX = agent.position.x ?? 0;
      const posY = agent.position.y ?? 0;
      const x = (posX - 512) / 100;
      const z = (posY - 512) / 100;
      return [x, 0, z];
    } catch (e) {
      console.error('[DEBUG] getAgentPosition error:', e);
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
    <div style={{ width: '100%', height: '100%', minHeight: '400px', background: '#f0f0f0' }}>
      <div style={{ padding: '10px', color: '#666' }}>
        DEBUG: Canvas starting...
      </div>
      <Canvas 
        style={{ height: 'calc(100% - 40px)' }}
        gl={{ antialias: true }} 
        dpr={[1, 2]}
        onContextMenu={handleContextMenu}
        onCreated={() => console.log('[DEBUG] Canvas created!')}
      >
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={3} maxDistance={20} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 12, 8]} intensity={1} />
        
        <Floor size={20} onClick={handleFloorClick} />
        
        {/* Map Items from config */}
        <MapItems onItemClick={onItemClick} selectedItemId={selectedItemId} />
        
        {/* Agents */}
        {agents && agents.map(agent => {
          if (!agent?.id) return null;
          const pos = getAgentPosition(agent);
          const appearance = agentAppearances?.[agent.id] || {};
          
          return (
            <AgentModel3D
              key={`agent3d-${agent.id}`}
              agentId={agent.id}
              name={agent.id}
              modelUrl={appearance.modelUrl}
              position={pos}
              scale={1}
              color={appearance.color}
              state={agent.state}
              onClick={() => onAgentClick?.(agent.id)}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default Scene3D;
