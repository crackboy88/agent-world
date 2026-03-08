/**
 * 3D Scene Component - Loads models from assets folder
 */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AgentModel3D } from './AgentModel3D';
import { MapItem3D } from './MapItem3D';
import type { Agent } from '../../types';
import { DEFAULT_MAP_ITEMS, getModelUrl, type MapItem } from '../../config';

// Simple flat floor
const Floor = ({ size = 20, onClick }: { size?: number; onClick?: (event: THREE.Event) => void }) => {
  return (
    <group>
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow
        onClick={onClick}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#E8E4DF" roughness={0.9} />
      </mesh>
      {/* Grid lines for reference */}
      <gridHelper args={[size, size, '#CCC', '#DDD']} position={[0, 0.01, 0]} />
    </group>
  );
};

// Map Items from config
const MapItems = ({ 
  onItemClick, 
  selectedItemId 
}: { 
  onItemClick?: (id: string) => void;
  selectedItemId?: string;
}) => {
  const items = DEFAULT_MAP_ITEMS;
  
  return (
    <>
      {items && items.map((item: MapItem) => {
        // Convert 2D position to 3D
        const x = (item.position.x - 512) / 100;
        const z = (item.position.y - 512) / 100;
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
  
  // Handle floor click
  const handleFloorClick = (event: THREE.Event) => {
    console.log('[DEBUG] Floor clicked, selectedAgentId:', selectedAgentId);
    if (!selectedAgentId || !onMapClick) {
      console.log('[DEBUG] Floor click ignored - no selected agent');
      return;
    }    
    // Get click point in 3D
    const point = (event as unknown as { point: THREE.Vector3 }).point;
    console.log('[DEBUG] Floor click at point:', point);
    
    // Convert 3D to 2D
    const x = Math.round(point.x * 100 + 512);
    const y = Math.round(point.z * 100 + 512);
    console.log('[DEBUG] Moving to:', { x, y });
    
    onMapClick({ x, y });
  };

  // Handle right-click to deselect
  const handleContextMenu = (e: any) => {
    e.preventDefault?.();
    console.log('[DEBUG] Right-click: deselect agent');
    onDeselect?.();
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <Canvas 
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }} 
        shadows={{ type: THREE.PCFShadowMap }} 
        dpr={[1, 2]}
        onContextMenu={handleContextMenu}
        onPointerMissed={() => {}}
      >
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={3} maxDistance={20} target={[0, 1, 0]} maxPolarAngle={Math.PI / 2 - 0.1} enableDamping dampingFactor={0.05} />
        <ambientLight intensity={0.3} color="#FFF8E7" />
        <directionalLight position={[8, 12, 8]} intensity={1.5} color="#FFF5E6" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
        
        <Floor size={20} onClick={handleFloorClick} />
        
        {/* Map Items from config */}
        <MapItems onItemClick={onItemClick} selectedItemId={selectedItemId} />
        
        {/* Agents - use model from assets */}
        {agents && agents.map(agent => {
        const pos = getAgentPosition(agent);
        const agentScale = selectedAgentId === agent.id ? 1.1 : 1;
        const appearance = agentAppearances[agent.id] || {};
        
        return (
          <group key={`agent-${agent.id}`} onClick={(e: unknown) => { console.log("[DEBUG] Agent clicked:", agent.id); (e as Event).stopPropagation(); onAgentClick?.(agent.id); }}>
            <AgentModel3D
              key={`agent3d-${agent.id}`}
              agentId={agent.id}
              name={agent.name}
              modelUrl={appearance.modelUrl}
              position={pos}
              scale={agentScale}
              color={appearance.color}
              state={agent.state}
              onClick={() => { console.log("[DEBUG] AgentModel3D clicked:", agent.id); onAgentClick?.(agent.id); }}
            />
          </group>
        );
      })}
      
      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={25} blur={2.5} far={10} resolution={256} color="#1a1a1a" />
    </Canvas>
    </div>
  );
};

export default Scene3D;
