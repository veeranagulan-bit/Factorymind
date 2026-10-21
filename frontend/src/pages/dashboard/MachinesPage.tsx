import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Wrench,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  Sparkles,
  Thermometer,
  Activity,
  Layers,
  Check,
  Upload,
  FileText
} from 'lucide-react';
import CncDigitalTwin, { type ComponentTelemetry } from '../../components/CncDigitalTwin';
import MachineUploadWizardModal from '../../components/MachineUploadWizardModal';
import { getFleetMachines, subscribeToFleetStore, type MachineInfo } from '../../services/fleetStore';

export default function MachinesPage() {
  const [searchParams] = useSearchParams();
  const queryMachine = searchParams.get('machine');

  const [machines, setMachines] = useState<MachineInfo[]>(getFleetMachines());
  const [activeMachineId, setActiveMachineId] = useState<string>(() => {
    const list = getFleetMachines();
    if (queryMachine && list.some(m => m.id === queryMachine)) return queryMachine;
    return list[0]?.id || 'M-101';
  });

  const [selectedComponentId, setSelectedComponentId] = useState<string>('spindle');
  const [searchTerm, setSearchTerm] = useState('');
  
  // File Upload Wizard State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');

  const navigate = useNavigate();

  // Subscribe to changes in fleet store
  useEffect(() => {
    return subscribeToFleetStore(() => {
      const updated = getFleetMachines();
      setMachines(updated);
    });
  }, []);

  // Sync active machine from URL query
  useEffect(() => {
    if (queryMachine && machines.some(m => m.id === queryMachine)) {
      setActiveMachineId(queryMachine);
      const m = machines.find(x => x.id === queryMachine);
      if (m && m.telemetry) {
        setSelectedComponentId(Object.keys(m.telemetry)[0] || 'spindle');
      }
    }
  }, [queryMachine, machines]);

  const activeMachine = machines.find(m => m.id === activeMachineId) || machines[0] || {
    id: 'M-101',
    name: 'Haas VF-2SS',
    type: 'Vertical Machining Center',
    status: 'Active' as const,
    health: 95,
    lastMaintenance: '2026-08-15',
    alerts: 0,
    architecture: 'vmc' as const,
    telemetry: {
      spindle: {
        id: 'spindle',
        name: 'Direct Drive Spindle',
        temp: '26.4°C',
        status: 'Optimal' as const,
        vibration: '0.08 mm/s RMS',
        notes: 'Nominal operating conditions.'
      }
    }
  };

  const selectedTelemetry: ComponentTelemetry = 
    activeMachine.telemetry?.[selectedComponentId] || 
    (activeMachine.telemetry ? Object.values(activeMachine.telemetry)[0] : null) || {
      id: 'default',
      name: 'Subsystem Component',
      temp: '25.0°C',
      status: 'Optimal',
      vibration: '0.05 mm/s RMS',
      notes: 'Operating within tolerance.'
    };

  const handleSelectMachine = (id: string) => {
    setActiveMachineId(id);
    const machine = machines.find(m => m.id === id);
    if (machine && machine.telemetry) {
      const defaultComp = Object.keys(machine.telemetry)[0];
      setSelectedComponentId(defaultComp);
    }
  };

  const handleDiagnoseWithAi = () => {
    navigate(`/dashboard/assistant?q=${encodeURIComponent(`Diagnose ${activeMachine.name} (${activeMachine.id}) - ${selectedTelemetry.name}: ${selectedTelemetry.notes}`)}`);
  };

  // Trigger file upload from header
  const handleOpenUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setUploadedFileName(file.name);
    setUploadedFileSize(sizeStr);
    setIsWizardOpen(true);
    e.target.value = ''; // Reset input
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-700 bg-emerald-50 border-emerald-200/50';
      case 'Warning': return 'text-amber-700 bg-amber-50 border-amber-200/50';
      case 'Maintenance': return 'text-red-700 bg-red-50 border-red-200/50';
      default: return 'text-zinc-700 bg-zinc-100 border-zinc-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />;
      case 'Warning': return <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />;
      case 'Maintenance': return <Wrench className="h-3.5 w-3.5 text-red-600" />;
      default: return null;
    }
  };

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFilePicked}
        accept=".pdf,.gltf,.glb,.obj,.stl,.stp,.step,.docx"
        className="hidden"
      />

      {/* Upload & Integration Wizard Modal */}
      <MachineUploadWizardModal
        isOpen={isWizardOpen}
        fileName={uploadedFileName}
        fileSize={uploadedFileSize}
        onClose={() => setIsWizardOpen(false)}
        onCompleted={(_doc, mId) => {
          if (mId) setActiveMachineId(mId);
        }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
            Fleet Digital Twins ({activeMachine.name})
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Click any machine below to inspect its dedicated 3D kinematic model, spatial hot-spots, and telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a1a1a] hover:bg-black text-xs font-semibold text-white transition-all shadow-xs"
          >
            <Upload className="h-3.5 w-3.5 text-[#9fff00]" />
            <span>Upload Machine File & 3D Twin</span>
          </button>
          <button 
            onClick={handleOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-black/[0.08] bg-white text-xs font-medium text-zinc-800 hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Unit</span>
          </button>
        </div>
      </div>

      {/* Interactive Machine Selection Bar directly above the 3D Canvas */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Active Fleet Twin:
        </span>
        {machines.map((m) => (
          <button
            key={m.id}
            onClick={() => handleSelectMachine(m.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
              activeMachineId === m.id
                ? 'bg-[#1a1a1a] text-white border-black shadow-sm'
                : 'bg-white/80 text-zinc-700 border-black/[0.06] hover:bg-white hover:border-black/[0.15]'
            }`}
          >
            <span>{m.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              m.status === 'Maintenance' ? 'bg-red-500 text-white' :
              m.status === 'Warning' ? 'bg-amber-400 text-black' :
              'bg-emerald-400 text-black'
            }`}>
              {m.id}
            </span>
            {activeMachineId === m.id && <Check className="h-3 w-3 text-[#9fff00]" />}
          </button>
        ))}
      </div>

      {/* 3D Digital Twin & Live Component Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Model Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <CncDigitalTwin 
            machineId={activeMachineId}
            selectedId={selectedComponentId} 
            onSelectComponent={(id) => setSelectedComponentId(id)} 
          />
        </div>

        {/* Selected Component Telemetry & Diagnostics HUD */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-xs space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                  Interactive Spatial Hot-Spot
                </span>
                <h3 className="font-['Outfit'] font-bold text-lg text-zinc-900 mt-0.5">
                  {selectedTelemetry.name}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedTelemetry.status)}`}>
                {selectedTelemetry.status}
              </span>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-black/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Thermometer className="h-3.5 w-3.5" />
                  <span>Temperature</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-zinc-900">
                  {selectedTelemetry.temp}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-black/[0.04]">
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Vibration RMS</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-zinc-900">
                  {selectedTelemetry.vibration}
                </div>
              </div>
            </div>

            {/* Diagnostic Field Note */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Engineering Diagnostics & Sensory Log
              </span>
              <p className="text-xs text-amber-950 leading-relaxed">
                {selectedTelemetry.notes}
              </p>
            </div>

            {/* Linked OEM Manual Tag */}
            {activeMachine.linkedFile && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100 text-xs text-zinc-700">
                <FileText className="h-4 w-4 text-zinc-500" />
                <span className="truncate">Bound OEM Asset: <strong>{activeMachine.linkedFile}</strong></span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleDiagnoseWithAi}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Sparkles className="h-4 w-4 text-[#9fff00]" />
              <span>Diagnose {selectedTelemetry.name} with AI Assistant</span>
            </button>

            <button
              onClick={() => navigate(`/dashboard/acoustics`)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-black/[0.08] hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors"
            >
              <span>View Acoustic Spectrogram for Fleet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fleet Overview Data Table */}
      <div className="rounded-2xl border border-black/[0.06] bg-white overflow-hidden shadow-xs">
        <div className="p-4 sm:p-6 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border border-black/[0.08] rounded-full px-3 py-1.5 w-full sm:w-64 bg-zinc-50/50">
              <Search className="h-3.5 w-3.5 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search fleet machines..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden py-1"
              />
            </div>
          </div>
          <button 
            onClick={handleOpenUpload}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-black/[0.08] text-xs font-semibold text-zinc-700 hover:bg-black/[0.03] transition-colors self-start sm:self-auto"
          >
            <Upload className="h-3 w-3" />
            <span>Upload Machine Asset</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50/70 border-b border-black/[0.06] text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="px-4 sm:px-6 py-3 font-medium">Machine ID & Model</th>
                <th className="px-4 sm:px-6 py-3 font-medium hidden md:table-cell">Type</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
                <th className="px-4 sm:px-6 py-3 font-medium">Health</th>
                <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Last Service</th>
                <th className="px-4 sm:px-6 py-3 font-medium text-right">3D Digital Twin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filteredMachines.map((m) => {
                const isSelected = activeMachineId === m.id;
                return (
                  <tr 
                    key={m.id} 
                    onClick={() => handleSelectMachine(m.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-zinc-100/80 font-medium' : 'hover:bg-black/[0.015]'
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="font-semibold text-zinc-900 flex items-center gap-2">
                        <span>{m.name}</span>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#1a1a1a]" />}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">{m.id}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-zinc-700 hidden md:table-cell">{m.type}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(m.status)}`}>
                        {getStatusIcon(m.status)}
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 sm:w-16 bg-zinc-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${m.health > 80 ? 'bg-emerald-500' : m.health > 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${m.health}%` }}
                          />
                        </div>
                        <span className="font-medium text-zinc-900">{m.health}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-zinc-600 hidden sm:table-cell">{m.lastMaintenance}</td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMachine(m.id);
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-[#1a1a1a] text-white shadow-xs' 
                            : 'border border-black/[0.1] text-zinc-800 hover:bg-zinc-100'
                        }`}
                      >
                        <Layers className="h-3 w-3" />
                        <span>{isSelected ? 'Viewing 3D' : 'Switch 3D'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
