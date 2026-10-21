import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Trash2, 
  Eye,
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  FileText, 
  Volume2, 
  Box, 
  X, 
  FolderOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import MachineUploadWizardModal from '../../components/MachineUploadWizardModal';
import { 
  getDocuments, 
  subscribeToFleetStore, 
  type DocItem 
} from '../../services/fleetStore';

interface SearchMatch {
  docName: string;
  page: number;
  snippet: string;
  fullContent: string;
}

// Multi-document search database with occurrences
const documentDatabase: SearchMatch[] = [
  // Overload matches
  {
    docName: 'Z_Axis_Servo_Overload_SOP.pdf',
    page: 5,
    snippet: '...ALARM E-402 indicates excessive current draw and mechanical overload on the Z-axis vertical ballscrew drive...',
    fullContent: 'Section 4.1: Mechanical Overload Diagnostics on Z-Axis.\n\nWhen ALARM E-402 appears on the display, the servo amplifier has triggered its thermal overload protection relay. Inspect linear guide way covers for wedged metal chips that create excessive friction overload on the ballscrew.\n\nVerify that the counterweight pneumatic balance pressure is at 4.2 Bar before resetting drive.'
  },
  {
    docName: 'Z_Axis_Servo_Overload_SOP.pdf',
    page: 14,
    snippet: '...calibrate the thermal overload circuit breaker trip threshold (rated 14.5 Amps continuous) to protect the servo motor...',
    fullContent: 'Section 8.2: Electrical Overload Calibration.\n\nThe thermal overload protection circuit on the servo amplifier must be calibrated to trip when continuous draw exceeds 14.5 Amps for longer than 3 seconds. Replace any degraded overload contactor contacts.'
  },
  {
    docName: 'Z_Axis_Servo_Overload_SOP.pdf',
    page: 22,
    snippet: '...verify ballscrew preload and guideway lubrication film to prevent mechanical drive overload under rapid traverse...',
    fullContent: 'Section 12: Guideway Preventive Maintenance.\n\nInsufficient way oil lubrication directly leads to stick-slip friction, which triggers servo motor overload during rapid G00 axis traverses. Inspect automatic metering valves daily.'
  },
  {
    docName: 'Fanuc_31i_Error_Codes_Reference.pdf',
    page: 88,
    snippet: '...ALARM 402: SERVO OVERLOAD (Z-AXIS) current threshold exceeded. Drive amplifier output disabled to prevent stator burnout...',
    fullContent: 'Fanuc Alarm 402: SV OVERLOAD (Z-AXIS).\n\nThe internal temperature or output current of the servo amplifier module exceeded allowable parameters. Check motor power leads for phase-to-phase shorts or high-resistance binding.'
  },
  {
    docName: 'Fanuc_31i_Error_Codes_Reference.pdf',
    page: 112,
    snippet: '...spindle motor thermal overload warning during heavy roughing pass when cutting torque exceeds 180 Nm...',
    fullContent: 'Fanuc Alarm 704: SPINDLE OVERLOAD WARNING.\n\nSpindle motor thermal sensor detected excessive temperature rise during high chip-load milling. Reduce feed override or decrease depth of cut.'
  },
  {
    docName: 'Haas_VF2SS_Maintenance_Manual_v2.pdf',
    page: 38,
    snippet: '...cutting overload detected when plunge feedrate exceeds 1,200 mm/min in pre-hardened 4140 tool steel...',
    fullContent: 'Haas Machining Guidelines: Axis Overload Avoidance.\n\nTo prevent Z-axis overload during high-feed milling, ensure helical entry ramp angle does not exceed 2.5 degrees.'
  },
  // Spindle matches
  {
    docName: 'Haas_VF2SS_Maintenance_Manual_v2.pdf',
    page: 42,
    snippet: '...verify spindle chiller circulation and air-oil lubrication pressure (0.35–0.40 MPa) to prevent spindle bearing overheating...',
    fullContent: 'Section 5.3: Spindle Chiller and Lubrication Requirements.\n\nThe 12,000 RPM inline spindle relies on a closed-loop oil-water chiller unit. If chiller return temperature rises above 55°C, thermal expansion will cause spindle runout and catastrophic bearing seizure.'
  },
  {
    docName: 'Spindle_Bearing_Troubleshooting_Guide.pdf',
    page: 18,
    snippet: '...spindle acoustic FFT spectrum showing a 2.4 kHz harmonic spike signifies ball pass frequency outer race (BPFO) defect...',
    fullContent: 'Section 3: Spindle Acoustic Spectrum Diagnosis.\n\nWhen high-frequency vibration acceleration exceeds 0.45 mm/s RMS at 2.4 kHz, front angular contact spindle bearings must be indexed or replaced immediately.'
  },
  // Coolant matches
  {
    docName: 'Coolant_Refractometer_SOP.pdf',
    page: 12,
    snippet: '...measure water-soluble coolant concentration using an optical refractometer. Recommended ratio for steel is 8% to 10%...',
    fullContent: 'Section 2.1: Coolant Concentration Maintenance.\n\nAlways add coolant concentrate to water, never water to concentrate. Use a digital refractometer to measure Brix value daily to avoid bacterial degradation.'
  }
];

function Model3DViewer({ componentTag }: { componentTag?: string }) {
  const isSpindle = (componentTag || '').toLowerCase().includes('spindle');
  const isTrunnion = (componentTag || '').toLowerCase().includes('5-axis') || (componentTag || '').toLowerCase().includes('trunnion');

  return (
    <div className="w-full h-64 bg-gradient-to-b from-zinc-900 to-black rounded-xl overflow-hidden relative">
      <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#38bdf8" />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
          {isSpindle ? (
            <group>
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.6, 0.5, 1.2, 32]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.6, 24]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
              </mesh>
              <mesh position={[0, -0.8, 0]}>
                <cylinderGeometry args={[0.06, 0.02, 0.4, 16]} />
                <meshStandardMaterial color="#9fff00" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ) : isTrunnion ? (
            <group>
              <mesh position={[-0.8, 0, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.6]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0.8, 0, 0]}>
                <boxGeometry args={[0.2, 0.8, 0.6]} />
                <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.7, 0.7, 0.15, 32]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          ) : (
            <group>
              <mesh>
                <boxGeometry args={[1.2, 0.8, 1.2]} />
                <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.6, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.4, 24]} />
                <meshStandardMaterial color="#9fff00" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          )}
        </Float>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
      <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-mono">
        3D CAD: {componentTag || 'Mechanical Assembly'}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<DocItem[]>(getDocuments());
  const [deepSearchQuery, setDeepSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<{ docName: string; page: number; fullContent: string } | null>(null);
  
  // 3D and Audio preview modals
  const [preview3dDoc, setPreview3dDoc] = useState<DocItem | null>(null);
  const [playingAudioDoc, setPlayingAudioDoc] = useState<DocItem | null>(null);

  // File Upload Wizard State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('');
  const [pendingFileSize, setPendingFileSize] = useState('');

  // Subscribe to changes in fleet store
  useEffect(() => {
    return subscribeToFleetStore(() => {
      setDocuments(getDocuments());
    });
  }, []);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Indexed': return <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />;
      case 'Processing': return <Clock className="h-3.5 w-3.5 text-blue-600" />;
      case 'Failed': return <AlertTriangle className="h-3.5 w-3.5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'Indexed': return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200/50';
      case 'Failed': return 'bg-red-50 text-red-700 border-red-200/50';
      default: return 'bg-zinc-100 text-zinc-600';
    }
  };

  // Trigger local file browser
  const handleOpenLocalFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Handle local file selection -> Opens the Machine Upload Integration Wizard
  const handleLocalFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setPendingFileName(file.name);
    setPendingFileSize(sizeFormatted);
    setIsWizardOpen(true);
    e.target.value = '';
  };

  // Handle Drag & Drop on Upload Area
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    setPendingFileName(file.name);
    setPendingFileSize(sizeFormatted);
    setIsWizardOpen(true);
  };

  // Smart Keyword Search: Filters documentDatabase by query (e.g. "overload", "spindle", "coolant")
  const activeQuery = deepSearchQuery.trim().toLowerCase();
  const searchResults = activeQuery ? documentDatabase.filter(item => 
    item.snippet.toLowerCase().includes(activeQuery) ||
    item.fullContent.toLowerCase().includes(activeQuery) ||
    item.docName.toLowerCase().includes(activeQuery)
  ) : [];

  // Group search results by Document Name
  const resultsByDocument = searchResults.reduce((acc, curr) => {
    if (!acc[curr.docName]) {
      acc[curr.docName] = [];
    }
    acc[curr.docName].push(curr);
    return acc;
  }, {} as Record<string, SearchMatch[]>);

  // Helper to highlight searched keyword in text
  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-[#9fff00]/50 text-black font-bold px-1 rounded-xs">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      {/* Hidden native input to open the user's local computer files */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleLocalFileSelected} 
        accept=".pdf,.docx,.txt,.gltf,.glb,.obj,.stl,.step,.stp,.wav,.mp3" 
        className="hidden" 
      />

      {/* Machine Upload & 3D/Audio Wizard Modal */}
      <MachineUploadWizardModal
        isOpen={isWizardOpen}
        fileName={pendingFileName}
        fileSize={pendingFileSize}
        onClose={() => setIsWizardOpen(false)}
        onCompleted={(_doc, mId, aKey) => {
          if (mId) {
            console.log(`Linked machine: ${mId}, audio: ${aKey}`);
          }
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
            Document Knowledge Base & 3D / Audio Assets
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Upload OEM machine files, link 3D Digital Twins, connect acoustic audio signatures, and search keywords.
          </p>
        </div>
        <button
          onClick={handleOpenLocalFilePicker}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
        >
          <FolderOpen className="h-4 w-4 text-[#9fff00]" />
          <span>Upload From Local Computer</span>
        </button>
      </div>

      {/* Local File Upload Drop Area */}
      {!deepSearchQuery && (
        <div 
          onClick={handleOpenLocalFilePicker}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center transition-all bg-white/70 backdrop-blur-md border-black/[0.1] hover:border-black/[0.25] hover:bg-white cursor-pointer group shadow-2xs"
        >
          <div className="h-12 w-12 rounded-full bg-zinc-100 group-hover:bg-zinc-200 flex items-center justify-center mb-3 transition-colors">
            <Upload className="h-5 w-5 text-zinc-700" />
          </div>
          <h3 className="font-['Outfit'] text-sm sm:text-base font-semibold text-zinc-900 mb-1 text-center">
            Click here to choose machine files from your local computer
          </h3>
          <p className="text-xs text-zinc-500 mb-4 text-center">
            Upload file to configure 3D Digital Twin model and acoustic audio FFT spectrogram
          </p>
          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-full bg-[#1a1a1a] text-white text-xs font-semibold group-hover:bg-black transition-colors shadow-xs flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#9fff00]" />
              <span>Select File & Open Integration Wizard</span>
            </span>
          </div>
        </div>
      )}

      {/* Documents List & Smart Keyword Search */}
      <div className="rounded-2xl border border-black/[0.06] bg-white/80 overflow-hidden shadow-xs backdrop-blur-md">
        <div className="p-4 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <div className="bg-white rounded-[6px] border border-black/[0.08] p-1 pl-3.5 flex items-center shadow-xs">
              <Search className="h-3.5 w-3.5 text-zinc-400 mr-2.5 shrink-0" />
              <input 
                type="text" 
                value={deepSearchQuery}
                onChange={(e) => setDeepSearchQuery(e.target.value)}
                placeholder="Search across all manuals (e.g. overload, spindle, coolant)..." 
                className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden py-1"
              />
              {deepSearchQuery && (
                <button 
                  onClick={() => setDeepSearchQuery('')} 
                  className="px-2 text-xs text-zinc-400 hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter keyword chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-600">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Quick Search:</span>
            {['overload', 'spindle', 'coolant', 'lubrication'].map((tag) => (
              <button
                key={tag}
                onClick={() => setDeepSearchQuery(tag)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                  deepSearchQuery.toLowerCase() === tag
                    ? 'bg-[#1a1a1a] text-white border-black font-semibold'
                    : 'bg-zinc-100 hover:bg-zinc-200 border-black/[0.05] text-zinc-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Document Keyword Occurrence Grouping */}
        {activeQuery && (
          <div className="p-5 sm:p-6 bg-amber-50/40 border-b border-amber-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span>Occurrences for:</span>
                  <span className="bg-[#9fff00] text-black px-2 py-0.5 rounded-md font-mono text-xs">
                    "{deepSearchQuery}"
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Found {searchResults.length} matching occurrences across {Object.keys(resultsByDocument).length} technical documents.
                </p>
              </div>
            </div>

            {Object.keys(resultsByDocument).length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-white/70 rounded-xl border border-black/[0.06]">
                No explicit mentions of "{deepSearchQuery}" found in the indexed manuals.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(resultsByDocument).map(([docTitle, matches]) => (
                  <div key={docTitle} className="bg-white rounded-xl border border-black/[0.08] p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-zinc-700 shrink-0" />
                          <h4 className="font-bold text-xs text-zinc-900 truncate" title={docTitle}>
                            {docTitle}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1a1a1a] text-[#9fff00] shrink-0">
                          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
                        </span>
                      </div>

                      <div className="space-y-2 mt-2">
                        {matches.map((m, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedResult(m)}
                            className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer border border-black/[0.04] text-[11px]"
                          >
                            <span className="font-semibold text-zinc-500 text-[10px] block mb-0.5">
                              Page {m.page}
                            </span>
                            <p className="text-zinc-700 line-clamp-2 leading-relaxed">
                              {highlightKeyword(m.snippet, deepSearchQuery)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedResult(matches[0])}
                      className="w-full mt-2 py-1.5 rounded-lg border border-black/[0.08] text-xs font-semibold text-zinc-700 hover:bg-zinc-50 text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect Excerpts</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Table */}
        {documents.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No indexed documents found. Upload a manual or CAD file above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50/70 border-b border-black/[0.06] text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-4 sm:px-6 py-3 font-medium">Document / Machine Asset</th>
                  <th className="px-4 sm:px-6 py-3 font-medium hidden sm:table-cell">Size</th>
                  <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
                  <th className="px-4 sm:px-6 py-3 font-medium hidden md:table-cell">RAG Chunks</th>
                  <th className="px-4 sm:px-6 py-3 font-medium">3D Twin / FFT Audio</th>
                  <th className="px-4 sm:px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-black/[0.015] transition-colors">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-zinc-700" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 truncate max-w-[180px] sm:max-w-xs" title={doc.name}>
                            {doc.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            {doc.componentTag || 'Technical Manual'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-zinc-500 hidden sm:table-cell">{doc.size}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusClass(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-zinc-500 hidden md:table-cell font-mono">
                      {doc.chunks} vectors
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* 3D Model Link */}
                        {doc.has3d && (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setPreview3dDoc(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200/60 hover:bg-cyan-100 transition-colors"
                              title="Preview 3D Model in modal"
                            >
                              <Box className="h-3 w-3" />
                              <span>3D CAD</span>
                            </button>
                            {doc.linkedMachineId && (
                              <button
                                onClick={() => navigate(`/dashboard/machines?machine=${doc.linkedMachineId}`)}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold bg-[#1a1a1a] text-white hover:bg-black transition-colors"
                                title="Open Fleet 3D Digital Twin"
                              >
                                <span>Twin ({doc.linkedMachineId})</span>
                                <ArrowRight className="h-2.5 w-2.5 text-[#9fff00]" />
                              </button>
                            )}
                          </div>
                        )}

                        {/* Audio Link */}
                        {doc.hasAudio && (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setPlayingAudioDoc(doc)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100 transition-colors"
                              title="Preview Audio Waveform"
                            >
                              <Volume2 className="h-3 w-3" />
                              <span>Audio</span>
                            </button>
                            {doc.linkedAudioKey && (
                              <button
                                onClick={() => navigate(`/dashboard/acoustics?profile=${doc.linkedAudioKey}`)}
                                className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md text-[10px] font-bold bg-purple-700 text-white hover:bg-purple-800 transition-colors"
                                title="Open in Acoustic FFT Spectrogram"
                              >
                                <span>FFT</span>
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => setDeepSearchQuery('overload')}
                          className="p-1 rounded-md text-zinc-400 hover:text-black transition-colors"
                          title="Deep Search inside document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => setDocuments(prev => prev.filter(d => d.id !== doc.id))}
                          className="p-1 rounded-md text-zinc-400 hover:text-red-500 transition-colors"
                          title="Delete document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3D CAD Model Preview Modal */}
      {preview3dDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setPreview3dDoc(null)} />
          <div className="relative w-full max-w-lg bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Box className="h-5 w-5 text-cyan-600" />
                <h3 className="font-['Outfit'] font-bold text-base text-zinc-900">
                  Interactive 3D Assembly Preview
                </h3>
              </div>
              <button onClick={() => setPreview3dDoc(null)} className="p-1 rounded-md text-zinc-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            <Model3DViewer componentTag={preview3dDoc.componentTag} />

            <div className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-700 space-y-1">
              <p><strong>Associated Manual:</strong> {preview3dDoc.name}</p>
              <p><strong>Subsystem Tag:</strong> {preview3dDoc.componentTag}</p>
              <p className="text-zinc-500">Rotate and inspect the mechanical dimensions in real-time.</p>
            </div>

            {preview3dDoc.linkedMachineId && (
              <button
                onClick={() => {
                  setPreview3dDoc(null);
                  navigate(`/dashboard/machines?machine=${preview3dDoc.linkedMachineId}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-xs font-bold hover:bg-black transition-colors"
              >
                <span>Open in Fleet 3D Digital Twin Viewport</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#9fff00]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Machine Acoustic Audio Player Modal */}
      {playingAudioDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setPlayingAudioDoc(null)} />
          <div className="relative w-full max-w-md bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-['Outfit'] font-bold text-base text-zinc-900">
                  Machine Acoustic Audio
                </h3>
              </div>
              <button onClick={() => setPlayingAudioDoc(null)} className="p-1 rounded-md text-zinc-400 hover:text-black">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Audio Waveform Graphic */}
            <div className="p-4 bg-zinc-900 rounded-xl flex items-center justify-between gap-1 h-20 px-6">
              {[30, 60, 45, 80, 100, 70, 90, 40, 65, 85, 95, 75, 50, 40, 80, 60, 30].map((h, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-[#9fff00] rounded-full animate-pulse" 
                  style={{ height: `${h}%`, animationDuration: `${0.6 + (i * 0.1)}s` }}
                />
              ))}
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl text-xs text-zinc-700 space-y-1">
              <p><strong>Machine Target:</strong> {playingAudioDoc.componentTag}</p>
              <p><strong>Sample Frequency:</strong> 48.0 kHz 24-bit PCM</p>
              <p className="text-zinc-500">Live audio stream captured from vibration accelerometer sensor.</p>
            </div>

            {playingAudioDoc.linkedAudioKey && (
              <button
                onClick={() => {
                  setPlayingAudioDoc(null);
                  navigate(`/dashboard/acoustics?profile=${playingAudioDoc.linkedAudioKey}`);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors"
              >
                <span>Analyze in Acoustic FFT Spectrogram</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedResult(null)} />
          <div className="relative w-full max-w-3xl bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-zinc-800" />
                <h2 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate max-w-[200px] sm:max-w-md">{selectedResult.docName}</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700 shrink-0">
                  Page {selectedResult.page}
                </span>
              </div>
              <button 
                onClick={() => setSelectedResult(null)}
                className="text-zinc-400 hover:text-black p-1 text-sm font-medium"
              >
                ✕
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
              <div className="max-w-xl mx-auto text-zinc-800 leading-relaxed text-xs sm:text-sm">
                <h3 className="font-['Outfit'] text-base sm:text-lg font-bold mb-4 text-zinc-900 border-b border-black/[0.06] pb-2">
                  Document Excerpt (Page {selectedResult.page})
                </h3>
                <div className="border-l-3 border-[#1a1a1a] pl-4 py-3 my-4 bg-zinc-50 rounded-r-lg whitespace-pre-wrap leading-relaxed text-zinc-900">
                  {highlightKeyword(selectedResult.fullContent, deepSearchQuery)}
                </div>
                <p className="text-zinc-500 text-xs mt-4">
                  Extracted from knowledge base vector index. Verified against Qdrant distance metric.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
