import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';
import { getFleetMachine, type ComponentTelemetry, type MachineArchitecture } from '../services/fleetStore';

export type { ComponentTelemetry };

interface CncMachineMeshProps {
  machineId: string;
  selectedComponent: string;
  onSelectComponent: (id: string) => void;
}

function CncMachineMesh({ machineId, selectedComponent, onSelectComponent }: CncMachineMeshProps) {
  const spindleRef = useRef<THREE.Group>(null);
  const toolRef = useRef<THREE.Mesh>(null);
  const tableRef = useRef<THREE.Mesh>(null);
  const trunnionRef = useRef<THREE.Group>(null);
  const latheChuckRef = useRef<THREE.Mesh>(null);
  const robotArmRef = useRef<THREE.Group>(null);

  const machine = getFleetMachine(machineId);
  const arch: MachineArchitecture = machine?.architecture || (
    machineId === 'M-101' ? 'vmc' :
    machineId === 'M-102' ? 'millturn' :
    machineId === 'M-103' ? 'bridge' :
    machineId === 'M-104' ? '5axis' :
    machineId === 'M-105' ? 'hmc' : 'custom'
  );

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Rotating tool
    if (toolRef.current) {
      toolRef.current.rotation.y = t * 15;
    }

    // Rotating turning chuck for Mazak Multi-Tasking (M-102)
    if (latheChuckRef.current) {
      latheChuckRef.current.rotation.z = t * 12;
    }

    // 5-Axis tilting trunnion table for DMG MORI DMU 50 (M-104)
    if (trunnionRef.current) {
      trunnionRef.current.rotation.x = Math.sin(t * 0.5) * 0.25;
      trunnionRef.current.rotation.y = Math.cos(t * 0.3) * 0.4;
    }

    // X/Y table motion for standard VMCs
    if (tableRef.current && arch !== '5axis' && arch !== 'custom') {
      tableRef.current.position.x = Math.sin(t * 0.8) * 0.35;
    }

    // Articulated robotic motion for custom 3D model
    if (robotArmRef.current) {
      robotArmRef.current.rotation.y = Math.sin(t * 0.6) * 0.3;
      robotArmRef.current.rotation.z = Math.cos(t * 0.4) * 0.15;
    }
  });

  // Machine Architecture: VMC (Vertical Machining Center)
  if (arch === 'vmc') {
    const isAlert = machine?.status === 'Warning' || machine?.status === 'Maintenance';
    return (
      <group position={[0, -0.6, 0]}>
        {/* Granite Base */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[3.2, 0.4, 2.4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Z Column */}
        <mesh position={[0, 1.2, -0.8]}>
          <boxGeometry args={[1.6, 2.6, 0.8]} />
          <meshStandardMaterial color="#2d3748" roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Guideways */}
        <mesh position={[-0.45, 1.2, -0.38]}>
          <boxGeometry args={[0.08, 2.4, 0.04]} />
          <meshStandardMaterial color="#cbd5e0" roughness={0.1} metalness={0.9} />
        </mesh>
        <mesh position={[0.45, 1.2, -0.38]}>
          <boxGeometry args={[0.08, 2.4, 0.04]} />
          <meshStandardMaterial color="#cbd5e0" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Table */}
        <mesh ref={tableRef} position={[0, 0, 0.2]} onClick={() => onSelectComponent('table')}>
          <boxGeometry args={[1.8, 0.18, 1.2]} />
          <meshStandardMaterial color={selectedComponent === 'table' ? '#38bdf8' : '#4a5568'} roughness={0.4} metalness={0.7} />
          <Html position={[0, 0.3, 0]} center distanceFactor={8}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('table'); }} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-900 shadow-md border border-black/10 hover:scale-110 transition-transform">
              X/Y Table
            </button>
          </Html>
        </mesh>
        {/* Spindle */}
        <group ref={spindleRef} position={[0, 1.3, -0.1]} onClick={() => onSelectComponent('spindle')}>
          <mesh>
            <boxGeometry args={[0.9, 1.1, 0.9]} />
            <meshStandardMaterial color={selectedComponent === 'spindle' ? (isAlert ? '#ef4444' : '#38bdf8') : '#2b2d42'} roughness={0.3} metalness={0.8} />
          </mesh>
          {isAlert && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshBasicMaterial color="#ef4444" wireframe opacity={0.3} transparent />
            </mesh>
          )}
          <mesh position={[0, -0.65, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.4, 24]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.1} metalness={0.95} />
          </mesh>
          <mesh ref={toolRef} position={[0, -0.95, 0]}>
            <cylinderGeometry args={[0.06, 0.02, 0.35, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
          </mesh>
          <Html position={[0, 0.8, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('spindle'); }} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg hover:scale-110 transition-transform ${isAlert ? 'bg-red-600 text-white animate-pulse' : 'bg-[#1a1a1a] text-white'}`}>
              <span className={`h-2 w-2 rounded-full ${isAlert ? 'bg-white' : 'bg-[#9fff00]'}`} />
              Spindle ({isAlert ? 'Overheat / Bearing' : 'Direct-Drive'})
            </button>
          </Html>
        </group>
        {/* ATC */}
        <group position={[-1.3, 1.4, -0.5]} onClick={() => onSelectComponent('toolchanger')}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.15, 16]} />
            <meshStandardMaterial color={selectedComponent === 'toolchanger' ? '#9fff00' : '#4a5568'} roughness={0.4} metalness={0.6} />
          </mesh>
          <Html position={[0, 0.5, 0]} center distanceFactor={8}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('toolchanger'); }} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-900 shadow-md border border-black/10 hover:scale-110 transition-transform">
              ATC (24 Tools)
            </button>
          </Html>
        </group>
      </group>
    );
  }

  // Machine Architecture: Mill-Turn (Multi-Tasking Turning & 5-Axis Milling)
  if (arch === 'millturn') {
    return (
      <group position={[0, -0.5, 0]}>
        {/* Slant Bed Casting */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[3.6, 0.5, 2.2]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.5} />
        </mesh>
        {/* Main Turning Headstock (Left) */}
        <group position={[-1.1, 0.3, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.9, 1.2]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
          </mesh>
          {/* Rotating Lathe Chuck */}
          <mesh ref={latheChuckRef} position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} onClick={() => onSelectComponent('chuck')}>
            <cylinderGeometry args={[0.45, 0.45, 0.2, 24]} />
            <meshStandardMaterial color={selectedComponent === 'chuck' ? '#38bdf8' : '#e2e8f0'} roughness={0.2} metalness={0.9} />
          </mesh>
          <Html position={[0.5, 0.6, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('chuck'); }} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md hover:scale-110 transition-transform">
              Turning Chuck (4,500 RPM)
            </button>
          </Html>
        </group>
        {/* B-Axis Tilting Milling Spindle (Center) */}
        <group position={[0.2, 1.2, 0]} onClick={() => onSelectComponent('baxis')}>
          <mesh rotation={[0, 0, Math.PI / 6]}>
            <boxGeometry args={[0.7, 1.0, 0.7]} />
            <meshStandardMaterial color={selectedComponent === 'baxis' ? '#9fff00' : '#475569'} roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh ref={toolRef} position={[0, -0.7, 0]}>
            <cylinderGeometry args={[0.08, 0.02, 0.3, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
          </mesh>
          <Html position={[0, 0.7, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('baxis'); }} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-900 shadow-md border border-black/10 hover:scale-110 transition-transform">
              B-Axis Milling Head (240°)
            </button>
          </Html>
        </group>
        {/* Tailstock / Sub-Spindle (Right) */}
        <mesh position={[1.2, 0.2, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>
    );
  }

  // Machine Architecture: Bridge (Heavy Duty Bridge Column VMC)
  if (arch === 'bridge') {
    return (
      <group position={[0, -0.6, 0]}>
        {/* Massive Dual-Column Bridge Base */}
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[3.4, 0.5, 2.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Left & Right Bridge Columns */}
        <mesh position={[-1.2, 1.3, -0.4]}>
          <boxGeometry args={[0.6, 2.8, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.7} />
        </mesh>
        <mesh position={[1.2, 1.3, -0.4]}>
          <boxGeometry args={[0.6, 2.8, 1.0]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Crossbeam Bridge */}
        <mesh position={[0, 2.5, -0.4]}>
          <boxGeometry args={[3.0, 0.6, 0.9]} />
          <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Z-Axis Ballscrew with Red Flashing Overload Alert */}
        <mesh position={[0, 1.4, -0.2]} onClick={() => onSelectComponent('zaxis')}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.9} />
          <Html position={[0, 0.5, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('zaxis'); }} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-lg animate-bounce hover:scale-110 transition-transform">
              <span className="h-2 w-2 rounded-full bg-white" />
              Z-Axis Drive (E-402 Overload)
            </button>
          </Html>
        </mesh>
        {/* Heavy Table */}
        <mesh ref={tableRef} position={[0, 0, 0.3]}>
          <boxGeometry args={[2.0, 0.25, 1.3]} />
          <meshStandardMaterial color="#475569" roughness={0.4} metalness={0.8} />
        </mesh>
      </group>
    );
  }

  // Machine Architecture: 5-Axis (Trunnion Table)
  if (arch === '5axis') {
    return (
      <group position={[0, -0.5, 0]}>
        {/* Sculpted Machine Enclosure Base */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[3.2, 0.45, 2.4]} />
          <meshStandardMaterial color="#090a0f" roughness={0.6} metalness={0.6} />
        </mesh>
        {/* Rear Column with Speed-Cutter Head */}
        <mesh position={[0, 1.3, -0.7]}>
          <boxGeometry args={[1.4, 2.6, 0.9]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* High-Precision 20,000 RPM Spindle */}
        <group position={[0, 1.2, -0.1]} onClick={() => onSelectComponent('dmxSpindle')}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.22, 0.8, 24]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh ref={toolRef} position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.015, 0.3, 12]} />
            <meshStandardMaterial color="#9fff00" roughness={0.1} metalness={0.9} />
          </mesh>
          <Html position={[0, 0.65, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('dmxSpindle'); }} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md hover:scale-110 transition-transform">
              SpeedMASTER (20,000 RPM)
            </button>
          </Html>
        </group>
        {/* Dynamic 5-Axis Swivel Trunnion Table */}
        <group ref={trunnionRef} position={[0, 0.15, 0.2]} onClick={() => onSelectComponent('trunnion')}>
          {/* Trunnion Support Arms */}
          <mesh position={[-0.9, 0, 0]}>
            <boxGeometry args={[0.2, 0.6, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          <mesh position={[0.9, 0, 0]}>
            <boxGeometry args={[0.2, 0.6, 0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Circular Rotary C-Axis Platter */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 0.12, 32]} />
            <meshStandardMaterial color={selectedComponent === 'trunnion' ? '#38bdf8' : '#64748b'} roughness={0.2} metalness={0.9} />
          </mesh>
          <Html position={[0, -0.3, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('trunnion'); }} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-900 shadow-md border border-black/10 hover:scale-110 transition-transform">
              5-Axis Trunnion (B/C Rotational)
            </button>
          </Html>
        </group>
      </group>
    );
  }

  // Machine Architecture: HMC (Horizontal Machining Center)
  if (arch === 'hmc') {
    return (
      <group position={[0, -0.5, 0]}>
        {/* Heavy HMC Base */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[3.4, 0.45, 2.6]} />
          <meshStandardMaterial color="#111827" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Column on Linear Ways (Z Axis) */}
        <mesh position={[0, 1.1, -0.8]}>
          <boxGeometry args={[1.5, 2.4, 1.0]} />
          <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Horizontal Spindle Quills */}
        <group position={[0, 1.1, -0.1]} rotation={[Math.PI / 2, 0, 0]} onClick={() => onSelectComponent('hmcSpindle')}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.25, 0.9, 24]} />
            <meshStandardMaterial color={selectedComponent === 'hmcSpindle' ? '#9fff00' : '#374151'} roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh ref={toolRef} position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.07, 0.02, 0.4, 12]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} />
          </mesh>
          <Html position={[0, 0.7, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('hmcSpindle'); }} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-900 shadow-md border border-black/10 hover:scale-110 transition-transform">
              Horizontal Spindle (14,000 RPM)
            </button>
          </Html>
        </group>
        {/* Dual Pallet Changer (Rotary Tombstone) */}
        <group position={[0, 0.3, 0.5]} onClick={() => onSelectComponent('tombstone')}>
          <mesh>
            <boxGeometry args={[0.6, 1.0, 0.6]} />
            <meshStandardMaterial color={selectedComponent === 'tombstone' ? '#38bdf8' : '#4b5563'} roughness={0.4} metalness={0.7} />
          </mesh>
          <Html position={[0, 0.7, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('tombstone'); }} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-md hover:scale-110 transition-transform">
              Pallet Tombstone (4-Sided)
            </button>
          </Html>
        </group>
      </group>
    );
  }

  // Machine Architecture: Custom / Uploaded 3D Model (Kinematic Articulated Robotic Cell)
  return (
    <group position={[0, -0.5, 0]}>
      {/* Precision Circular Riser Plinth */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[1.8, 1.9, 0.4, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
      </mesh>
      {/* Illuminated Optical Tracking Guide Ring */}
      <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.58, 48]} />
        <meshBasicMaterial color="#9fff00" />
      </mesh>
      {/* Rotary Workpiece Platter */}
      <group position={[0.7, 0.1, 0.2]} onClick={() => onSelectComponent('workholding')}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 0.16, 32]} />
          <meshStandardMaterial color={selectedComponent === 'workholding' ? '#38bdf8' : '#334155'} roughness={0.3} metalness={0.9} />
        </mesh>
        {/* Workpiece */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.4, 0.35, 0.4]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.2} metalness={0.9} />
        </mesh>
        <Html position={[0, 0.55, 0]} center distanceFactor={7}>
          <button onClick={(e) => { e.stopPropagation(); onSelectComponent('workholding'); }} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-zinc-900 shadow-md border border-black/10 hover:scale-110 transition-transform">
            Vacuum Workholding
          </button>
        </Html>
      </group>
      {/* Articulated 6-Axis Hybrid Robot Arm */}
      <group ref={robotArmRef} position={[-0.6, 0.1, -0.2]}>
        {/* Base Turret */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.4, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* Shoulder Link */}
        <mesh position={[0.2, 0.7, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.2, 0.9, 0.2]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Wrist & High-Torque Electro-Spindle */}
        <group position={[0.5, 1.2, 0.2]} onClick={() => onSelectComponent('customSpindle')}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.14, 0.6, 24]} />
            <meshStandardMaterial color={selectedComponent === 'customSpindle' ? '#ef4444' : '#10b981'} roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh ref={toolRef} position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.015, 0.3, 16]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.95} />
          </mesh>
          <Html position={[0, 0.6, 0]} center distanceFactor={7}>
            <button onClick={(e) => { e.stopPropagation(); onSelectComponent('customSpindle'); }} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1a1a1a] text-white shadow-lg hover:scale-110 transition-transform border border-white/20">
              Electro-Spindle (Uploaded 3D)
            </button>
          </Html>
        </group>
      </group>
    </group>
  );
}

export default function CncDigitalTwin({
  machineId,
  selectedId,
  onSelectComponent
}: {
  machineId: string;
  selectedId: string;
  onSelectComponent: (id: string) => void;
}) {
  const machine = getFleetMachine(machineId);

  const fallbackNames: Record<string, string> = {
    'M-101': 'Haas VF-2SS (Vertical Machining Center)',
    'M-102': 'Mazak Integrex i-200 (Multi-Tasking Turning & 5-Axis)',
    'M-103': 'Okuma Genos M560-V (Heavy Duty VMC)',
    'M-104': 'DMG MORI DMU 50 (5-Axis Simultaneous Trunnion)',
    'M-105': 'Makino a61nx (Horizontal Machining Center)'
  };

  const displayName = machine?.name ? `${machine.name} (${machine.id})` : (fallbackNames[machineId] || 'Custom 3D Digital Twin');

  return (
    <div className="w-full h-[320px] sm:h-[420px] md:h-[480px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-white to-zinc-100 border border-black/[0.08] shadow-inner">
      {/* 3D Canvas with Responsive Orbit Controls */}
      <Canvas camera={{ position: [2.5, 2.2, 3.8], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 8, 5]} intensity={1.2} />
        <directionalLight position={[-6, 4, -4]} intensity={0.6} />
        <pointLight position={[0, 2, 0]} intensity={0.8} color="#38bdf8" />
        
        <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.08}>
          <CncMachineMesh 
            machineId={machineId}
            selectedComponent={selectedId} 
            onSelectComponent={onSelectComponent} 
          />
        </Float>

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2.5}
          maxDistance={7}
        />
      </Canvas>

      {/* Floating Viewport Hint Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/[0.08] text-[10px] sm:text-xs font-semibold text-zinc-800 shadow-xs pointer-events-none flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        <span>3D Digital Twin • Drag to Rotate / Pinch to Zoom</span>
      </div>

      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-black/[0.08] text-[10px] font-semibold text-zinc-700 shadow-2xs pointer-events-none">
        Active 3D Model: {displayName}
      </div>
    </div>
  );
}
