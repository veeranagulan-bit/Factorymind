export interface ComponentTelemetry {
  id: string;
  name: string;
  temp: string;
  status: 'Optimal' | 'Warning' | 'Critical';
  vibration: string;
  rpm?: string;
  load?: string;
  notes: string;
}

export type MachineArchitecture = '5axis' | 'vmc' | 'millturn' | 'bridge' | 'hmc' | 'custom';

export interface MachineInfo {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Warning' | 'Maintenance';
  health: number;
  lastMaintenance: string;
  alerts: number;
  architecture: MachineArchitecture;
  telemetry: Record<string, ComponentTelemetry>;
  linkedFile?: string;
  linkedAudioProfile?: string;
}

export interface AudioProfile {
  id: string;
  name: string;
  machine: string;
  peakFreq: string;
  peakFreqNum: number;
  status: 'Normal' | 'Warning' | 'Critical';
  diagnosis: string;
  harmonicDescription: string;
}

export interface DocItem {
  id: string;
  name: string;
  size: string;
  date: string;
  status: 'Indexed' | 'Processing' | 'Failed';
  chunks: number;
  has3d?: boolean;
  hasAudio?: boolean;
  componentTag?: string;
  linkedMachineId?: string;
  linkedAudioKey?: string;
}

// Initial 5 Fleet Machines
export const initialMachines: MachineInfo[] = [
  { 
    id: 'M-101', 
    name: 'Haas VF-2SS', 
    type: 'Vertical Machining Center', 
    status: 'Warning', 
    health: 78, 
    lastMaintenance: '2026-08-15', 
    alerts: 1,
    architecture: 'vmc',
    telemetry: {
      spindle: {
        id: 'spindle',
        name: 'Haas 12,000 RPM Inline Direct-Drive Spindle',
        temp: '62.4°C (Exceeds 55°C Threshold)',
        status: 'Critical',
        vibration: '0.48 mm/s RMS (High Harmonic)',
        notes: 'Spindle bearing thermal gradient rising. Chiller return flow rate decreased by 22% over last 40 minutes.'
      },
      table: {
        id: 'table',
        name: 'Precision X/Y Coordinate Table',
        temp: '24.1°C',
        status: 'Optimal',
        vibration: '0.08 mm/s RMS',
        notes: 'Guideway lubrication film intact. Optical encoder position error < 0.002 mm.'
      },
      toolchanger: {
        id: 'toolchanger',
        name: 'Side-Mount Tool Changer (24-Pocket)',
        temp: '22.8°C',
        status: 'Optimal',
        vibration: '0.04 mm/s RMS',
        notes: 'Pocket #7 active (10mm 4-Flute Carbide Endmill). Indexing time nominal.'
      }
    }
  },
  { 
    id: 'M-102', 
    name: 'Mazak Integrex i-200', 
    type: 'Multi-Tasking Turning & 5-Axis Milling', 
    status: 'Active', 
    health: 96, 
    lastMaintenance: '2026-07-20', 
    alerts: 0,
    architecture: 'millturn',
    telemetry: {
      chuck: {
        id: 'chuck',
        name: 'Main Turning Spindle Chuck (C-Axis Contouring)',
        temp: '28.2°C',
        status: 'Optimal',
        vibration: '0.12 mm/s RMS',
        notes: 'Hydraulic chuck clamp pressure steady at 2.4 MPa. Spindle runout < 0.0015 mm.'
      },
      baxis: {
        id: 'baxis',
        name: 'B-Axis Tilting Milling Head (240° Travel)',
        temp: '31.0°C',
        status: 'Optimal',
        vibration: '0.14 mm/s RMS',
        notes: 'Direct-drive motor indexing position locked. Roller gear cam backlash zero.'
      }
    }
  },
  { 
    id: 'M-103', 
    name: 'Okuma Genos M560-V', 
    type: 'Heavy-Duty Bridge Column VMC', 
    status: 'Maintenance', 
    health: 45, 
    lastMaintenance: '2026-09-10', 
    alerts: 4,
    architecture: 'bridge',
    telemetry: {
      zaxis: {
        id: 'zaxis',
        name: 'Z-Axis Servo Drive & Dual Ballscrew Assembly',
        temp: '74.5°C (Alarm State)',
        status: 'Critical',
        vibration: '1.24 mm/s RMS (Severe Chattering)',
        notes: 'ALARM 402: Z-Axis Servo Drive Overload. Mechanical binding on linear guide wipers. Urgent service required.'
      }
    }
  },
  { 
    id: 'M-104', 
    name: 'DMG MORI DMU 50', 
    type: '5-Axis Simultaneous Trunnion Milling', 
    status: 'Active', 
    health: 99, 
    lastMaintenance: '2026-09-01', 
    alerts: 0,
    architecture: '5axis',
    telemetry: {
      dmxSpindle: {
        id: 'dmxSpindle',
        name: 'SpeedMASTER 20,000 RPM Spindle',
        temp: '23.4°C Chilled',
        status: 'Optimal',
        vibration: '0.06 mm/s RMS',
        notes: 'Spindle growth compensation (SGS) active. Thermal expansion sensor compensating within 2 microns.'
      },
      trunnion: {
        id: 'trunnion',
        name: 'Swivel Rotary Trunnion Table (B/C Simultaneous)',
        temp: '22.0°C',
        status: 'Optimal',
        vibration: '0.05 mm/s RMS',
        notes: 'Direct-drive torque motors operating at 18% thermal capacity. Dynamic accuracy calibrated.'
      }
    }
  },
  { 
    id: 'M-105', 
    name: 'Makino a61nx', 
    type: 'Horizontal Machining Center (HMC)', 
    status: 'Active', 
    health: 92, 
    lastMaintenance: '2026-08-28', 
    alerts: 0,
    architecture: 'hmc',
    telemetry: {
      hmcSpindle: {
        id: 'hmcSpindle',
        name: 'Horizontal Core-Cooled Spindle (14,000 RPM)',
        temp: '26.8°C',
        status: 'Optimal',
        vibration: '0.09 mm/s RMS',
        notes: 'Core coolant circulation functioning at 100% capacity. Taper cleaning air-purge nominal.'
      },
      tombstone: {
        id: 'tombstone',
        name: 'Dual Pallet Indexer Rotary Tombstone (4-Sided)',
        temp: '23.2°C',
        status: 'Optimal',
        vibration: '0.04 mm/s RMS',
        notes: 'Pallet clamp confirmation hydraulic sensors verified. In-cycle pallet shuttle ready.'
      }
    }
  }
];

// Initial Acoustic Profiles
export const initialAudioProfiles: Record<string, AudioProfile> = {
  bearingFault: {
    id: 'bearingFault',
    name: 'Spindle Bearing Outer-Race Flaw',
    machine: 'Haas VF-2SS (Unit M-101)',
    peakFreq: '2,420 Hz (Harmonic Spike)',
    peakFreqNum: 2420,
    status: 'Critical',
    diagnosis: 'High-frequency resonance matches BPFO (Ball Pass Frequency Outer Race) defect on front spindle bearings.',
    harmonicDescription: 'Sharp acoustic peaks detected at 2.4 kHz and 4.8 kHz under 10,000 RPM operation. Imminent bearing surface spalling.'
  },
  toolChatter: {
    id: 'toolChatter',
    name: 'Endmill Dynamic Chatter & Resonant Deflection',
    machine: 'DMG MORI DMU 50 (Unit M-104)',
    peakFreq: '680 Hz Low-Order Chatter',
    peakFreqNum: 680,
    status: 'Warning',
    diagnosis: 'Tool overhang length-to-diameter ratio causing regenerative chatter on titanium finishing pass.',
    harmonicDescription: 'Broad acoustic amplitude hump between 600 Hz and 900 Hz. Surface roughness Ra will exceed tolerance.'
  },
  healthy: {
    id: 'healthy',
    name: 'Nominal Machining Sound Signature',
    machine: 'Mazak Integrex i-200 (Unit M-102)',
    peakFreq: '120 Hz (Baseline Motor Drive)',
    peakFreqNum: 120,
    status: 'Normal',
    diagnosis: 'Harmonic distribution is smooth and well-damped. No bearing defects or abnormal cutting resonance.',
    harmonicDescription: 'Even energy dispersion across 100 Hz to 12 kHz. Acoustic crest factor nominal at 3.2.'
  }
};

// Initial Documents
export const initialDocuments: DocItem[] = [
  { id: '1', name: 'Haas_VF2SS_Maintenance_Manual_2024.pdf', size: '14.2 MB', date: '2026-08-10', status: 'Indexed', chunks: 342, has3d: true, hasAudio: true, componentTag: 'Spindle Chiller Subsystem', linkedMachineId: 'M-101', linkedAudioKey: 'bearingFault' },
  { id: '2', name: 'Mazak_Integrex_i200_Operations_Handbook.pdf', size: '28.6 MB', date: '2026-08-01', status: 'Indexed', chunks: 512, has3d: true, hasAudio: true, componentTag: 'Turning Spindle & Chuck', linkedMachineId: 'M-102', linkedAudioKey: 'healthy' },
  { id: '3', name: 'Spindle_Bearing_Replacement_SOP_v3.pdf', size: '4.8 MB', date: '2026-07-22', status: 'Indexed', chunks: 89, has3d: true, hasAudio: true, componentTag: 'Front Hybrid Ceramic Bearings', linkedMachineId: 'M-101', linkedAudioKey: 'bearingFault' },
  { id: '4', name: 'DMG_MORI_DMU50_5Axis_Kinematics.pdf', size: '19.4 MB', date: '2026-06-15', status: 'Indexed', chunks: 420, has3d: true, hasAudio: true, componentTag: '5-Axis Trunnion Table', linkedMachineId: 'M-104', linkedAudioKey: 'toolChatter' },
  { id: '5', name: 'Coolant_Refractometer_Calibration_Chart.pdf', size: '1.2 MB', date: '2026-05-30', status: 'Indexed', chunks: 24, has3d: false, hasAudio: false, componentTag: 'Water-Soluble Coolant Sumps' },
];

const STORAGE_KEY_MACHINES = 'factorymind_fleet_machines';
const STORAGE_KEY_AUDIO = 'factorymind_audio_profiles';
const STORAGE_KEY_DOCS = 'factorymind_documents';
const EVENT_NAME = 'factorymind_state_changed';

export function getFleetMachines(): MachineInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MACHINES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(initialMachines));
      return initialMachines;
    }
    return JSON.parse(raw);
  } catch {
    return initialMachines;
  }
}

export function addFleetMachine(machine: MachineInfo): void {
  try {
    const list = getFleetMachines();
    const existingIndex = list.findIndex(m => m.id === machine.id);
    let updated: MachineInfo[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = machine;
    } else {
      updated = [...list, machine];
    }
    localStorage.setItem(STORAGE_KEY_MACHINES, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to add fleet machine', err);
  }
}

export function getFleetMachine(id: string): MachineInfo | undefined {
  const machines = getFleetMachines();
  return machines.find(m => m.id === id);
}

export function getAcousticProfiles(): Record<string, AudioProfile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUDIO);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUDIO, JSON.stringify(initialAudioProfiles));
      return initialAudioProfiles;
    }
    return JSON.parse(raw);
  } catch {
    return initialAudioProfiles;
  }
}

export function addAcousticProfile(key: string, profile: AudioProfile): void {
  try {
    const profiles = getAcousticProfiles();
    const updated = { ...profiles, [key]: profile };
    localStorage.setItem(STORAGE_KEY_AUDIO, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to add audio profile', err);
  }
}

export function getDocuments(): DocItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOCS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(initialDocuments));
      return initialDocuments;
    }
    return JSON.parse(raw);
  } catch {
    return initialDocuments;
  }
}

export function addDocument(doc: DocItem): void {
  try {
    const docs = getDocuments();
    const updated = [doc, ...docs];
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (err) {
    console.error('Failed to add document', err);
  }
}

export function subscribeToFleetStore(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
    window.removeEventListener('storage', handler);
  };
}
