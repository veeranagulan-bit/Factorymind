import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  Sliders, 
  X
} from 'lucide-react';
import { 
  addFleetMachine, 
  addAcousticProfile, 
  addDocument, 
  getFleetMachines, 
  type MachineArchitecture, 
  type MachineInfo, 
  type AudioProfile, 
  type DocItem 
} from '../services/fleetStore';

interface MachineUploadWizardModalProps {
  isOpen: boolean;
  fileName: string;
  fileSize: string;
  onClose: () => void;
  onCompleted?: (doc: DocItem, machineId?: string, audioKey?: string) => void;
}

export default function MachineUploadWizardModal({
  isOpen,
  fileName,
  fileSize,
  onClose,
  onCompleted
}: MachineUploadWizardModalProps) {
  const navigate = useNavigate();

  // Mode: 'prompt' | 'custom' | 'success'
  const [step, setStep] = useState<'prompt' | 'custom' | 'success'>('prompt');

  // Custom Form state
  const existingCount = getFleetMachines().length;
  const defaultMachineId = `M-${100 + existingCount + 1}`;
  const defaultCleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');

  const [machineId, setMachineId] = useState(defaultMachineId);
  const [machineName, setMachineName] = useState(defaultCleanName || 'Hermle 5-Axis VMC');
  const [architecture, setArchitecture] = useState<MachineArchitecture>('5axis');
  const [machineStatus, setMachineStatus] = useState<'Active' | 'Warning' | 'Maintenance'>('Active');
  
  // Audio selection
  const [audioPreset, setAudioPreset] = useState<'bearing' | 'chatter' | 'cavitation' | 'healthy' | 'custom'>('healthy');
  const [customPeakFreq, setCustomPeakFreq] = useState('3,200 Hz');

  // Stored results for success screen navigation
  const [createdMachineId, setCreatedMachineId] = useState<string>('');
  const [createdAudioKey, setCreatedAudioKey] = useState<string>('');

  if (!isOpen) return null;

  // Option 1: "OK" Auto-Configure Path
  const handleAutoConfigure = () => {
    const isOverload = fileName.toLowerCase().includes('overload') || fileName.toLowerCase().includes('servo');
    const isSpindle = fileName.toLowerCase().includes('spindle') || fileName.toLowerCase().includes('bearing');
    const isMill = fileName.toLowerCase().includes('5axis') || fileName.toLowerCase().includes('dmu');
    
    const autoArch: MachineArchitecture = isMill ? '5axis' : isSpindle ? 'vmc' : isOverload ? 'bridge' : 'custom';
    const autoStatus = isOverload ? 'Maintenance' : isSpindle ? 'Warning' : 'Active';
    const mId = defaultMachineId;
    const mName = defaultCleanName || 'Automated CNC Unit';

    // 1. Create Machine
    const newMachine: MachineInfo = {
      id: mId,
      name: mName,
      type: `${autoArch.toUpperCase()} Precision Machining Center`,
      status: autoStatus,
      health: autoStatus === 'Active' ? 98 : autoStatus === 'Warning' ? 76 : 42,
      lastMaintenance: new Date().toISOString().split('T')[0],
      alerts: autoStatus === 'Active' ? 0 : 2,
      architecture: autoArch,
      linkedFile: fileName,
      telemetry: {
        spindle: {
          id: 'spindle',
          name: `${mName} High-Speed Spindle`,
          temp: autoStatus === 'Warning' ? '64.2°C (Warning)' : '26.4°C Nominal',
          status: autoStatus === 'Warning' ? 'Critical' : 'Optimal',
          vibration: autoStatus === 'Warning' ? '0.52 mm/s RMS' : '0.07 mm/s RMS',
          notes: `Telemetry synchronized with uploaded OEM asset ${fileName}.`
        },
        workholding: {
          id: 'workholding',
          name: 'Precision Fixture & Kinematics Bed',
          temp: '22.8°C',
          status: 'Optimal',
          vibration: '0.04 mm/s RMS',
          notes: 'Dynamic runout sensor online.'
        }
      }
    };
    addFleetMachine(newMachine);

    // 2. Create Acoustic Audio Profile
    const aKey = `audio_${Date.now()}`;
    const newAudio: AudioProfile = {
      id: aKey,
      name: `${mName} Acoustic Signature`,
      machine: `${mName} (${mId})`,
      peakFreq: autoStatus === 'Warning' ? '2,420 Hz (Bearing BPFO Spike)' : '180 Hz (Harmonic Drive)',
      peakFreqNum: autoStatus === 'Warning' ? 2420 : 180,
      status: autoStatus === 'Warning' ? 'Warning' : 'Normal',
      diagnosis: `Real-time acoustic analysis derived from ${fileName} baseline specification.`,
      harmonicDescription: `FFT audio spectrum synchronized with unit ${mId}.`
    };
    addAcousticProfile(aKey, newAudio);

    // 3. Create Document
    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: fileName,
      size: fileSize,
      date: new Date().toISOString().split('T')[0],
      status: 'Indexed',
      chunks: Math.floor(Math.random() * 200) + 140,
      has3d: true,
      hasAudio: true,
      componentTag: `${autoArch.toUpperCase()} Subsystem & Kinematics`,
      linkedMachineId: mId,
      linkedAudioKey: aKey
    };
    addDocument(newDoc);

    setCreatedMachineId(mId);
    setCreatedAudioKey(aKey);
    setStep('success');

    if (onCompleted) {
      onCompleted(newDoc, mId, aKey);
    }
  };

  // Option 2: Custom Model and Audio Path ("otherwise give the model and audio")
  const handleCustomConfirm = () => {
    const mId = machineId || defaultMachineId;
    const mName = machineName || defaultCleanName;

    // Pick audio profile characteristics
    let peakText = '120 Hz (Balanced)';
    let peakNum = 120;
    let audioStatus: 'Normal' | 'Warning' | 'Critical' = 'Normal';
    let diag = 'Harmonic distribution is smooth. Acoustic crest factor nominal.';
    let desc = 'Nominal balanced cutting acoustic signature.';

    if (audioPreset === 'bearing') {
      peakText = '2,420 Hz (BPFO Bearing Defect)';
      peakNum = 2420;
      audioStatus = 'Critical';
      diag = 'High-frequency resonance matches front spindle bearing outer-race spalling.';
      desc = 'Sharp acoustic harmonics at 2.4 kHz and 4.8 kHz.';
    } else if (audioPreset === 'chatter') {
      peakText = '680 Hz (Endmill Dynamic Chatter)';
      peakNum = 680;
      audioStatus = 'Warning';
      diag = 'Tool overhang vibration causing regenerative deflection.';
      desc = 'Acoustic hump between 600 Hz and 900 Hz.';
    } else if (audioPreset === 'cavitation') {
      peakText = '4,100 Hz (Hydraulic Cavitation)';
      peakNum = 4100;
      audioStatus = 'Warning';
      diag = 'High-pressure coolant pump aeration and micro-bubble collapse.';
      desc = 'Ultrasonic hiss and high-pressure pulsation.';
    } else if (audioPreset === 'custom') {
      peakText = customPeakFreq;
      peakNum = parseInt(customPeakFreq.replace(/[^0-9]/g, '')) || 3200;
      audioStatus = machineStatus === 'Active' ? 'Normal' : machineStatus === 'Warning' ? 'Warning' : 'Critical';
      diag = `Custom acoustic signature configured for ${mName}.`;
      desc = `Spectrogram peak focused at ${customPeakFreq}.`;
    }

    // 1. Add Fleet Machine
    const newMachine: MachineInfo = {
      id: mId,
      name: mName,
      type: `${architecture.toUpperCase()} Machining Center`,
      status: machineStatus,
      health: machineStatus === 'Active' ? 95 : machineStatus === 'Warning' ? 72 : 48,
      lastMaintenance: new Date().toISOString().split('T')[0],
      alerts: machineStatus === 'Active' ? 0 : 2,
      architecture: architecture,
      linkedFile: fileName,
      telemetry: {
        spindle: {
          id: 'spindle',
          name: `${mName} Spindle Assembly`,
          temp: machineStatus === 'Warning' ? '58.9°C' : '25.3°C',
          status: machineStatus === 'Warning' ? 'Critical' : 'Optimal',
          vibration: machineStatus === 'Warning' ? '0.45 mm/s RMS' : '0.08 mm/s RMS',
          notes: `Linked with OEM manual ${fileName}. 3D Kinematics set to ${architecture}.`
        },
        workholding: {
          id: 'workholding',
          name: 'Precision Workholding Bed',
          temp: '22.4°C',
          status: 'Optimal',
          vibration: '0.04 mm/s RMS',
          notes: 'Clamping force nominal.'
        }
      }
    };
    addFleetMachine(newMachine);

    // 2. Add Audio Profile
    const aKey = `audio_${Date.now()}`;
    const newAudio: AudioProfile = {
      id: aKey,
      name: `${mName} Custom FFT Profile`,
      machine: `${mName} (${mId})`,
      peakFreq: peakText,
      peakFreqNum: peakNum,
      status: audioStatus,
      diagnosis: diag,
      harmonicDescription: desc
    };
    addAcousticProfile(aKey, newAudio);

    // 3. Add Document
    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: fileName,
      size: fileSize,
      date: new Date().toISOString().split('T')[0],
      status: 'Indexed',
      chunks: Math.floor(Math.random() * 200) + 160,
      has3d: true,
      hasAudio: true,
      componentTag: `${architecture.toUpperCase()} Custom Model`,
      linkedMachineId: mId,
      linkedAudioKey: aKey
    };
    addDocument(newDoc);

    setCreatedMachineId(mId);
    setCreatedAudioKey(aKey);
    setStep('success');

    if (onCompleted) {
      onCompleted(newDoc, mId, aKey);
    }
  };

  // Option 3: Document Only (Skip 3D and Audio)
  const handleSkip = () => {
    const newDoc: DocItem = {
      id: Date.now().toString(),
      name: fileName,
      size: fileSize,
      date: new Date().toISOString().split('T')[0],
      status: 'Indexed',
      chunks: Math.floor(Math.random() * 150) + 80,
      has3d: false,
      hasAudio: false,
      componentTag: 'Standard OEM Manual'
    };
    addDocument(newDoc);
    if (onCompleted) {
      onCompleted(newDoc);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-black/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] flex items-center justify-between bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#1a1a1a] text-white flex items-center justify-center shadow-sm">
              <Sparkles className="h-5 w-5 text-[#9fff00]" />
            </div>
            <div>
              <h2 className="font-['Outfit'] text-lg font-bold text-zinc-900 tracking-tight">
                Machine Integration Wizard
              </h2>
              <p className="text-xs text-zinc-500">
                Attach interactive 3D Digital Twin and Machine Acoustic Audio
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-zinc-400 hover:text-black hover:bg-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Uploaded File Pill */}
          <div className="flex items-center justify-between p-3.5 bg-zinc-100 rounded-2xl border border-black/[0.05]">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-zinc-700" />
              <div>
                <p className="text-xs font-bold text-zinc-900 truncate max-w-[280px] sm:max-w-[420px]">
                  {fileName}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {fileSize} • Machine Documentation / Spec File
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Uploaded
            </span>
          </div>

          {/* STEP 1: INITIAL PROMPT ("Ask can add audio or 3d model") */}
          {step === 'prompt' && (
            <div className="space-y-6">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="font-['Outfit'] text-base sm:text-lg font-bold text-zinc-900">
                  Can we add a 3D Model and Acoustic Audio for this machine?
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Binding a 3D Digital Twin allows you to inspect interactive kinematics, while adding Acoustic Audio enables real-time 48-channel FFT spectrogram analysis.
                </p>
              </div>

              {/* Two Primary Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1-Click "OK" Auto-Configure */}
                <button
                  onClick={handleAutoConfigure}
                  className="flex flex-col justify-between text-left p-5 rounded-2xl border-2 border-black bg-gradient-to-br from-white to-zinc-50 hover:bg-zinc-100 transition-all shadow-md group relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9fff00] text-black">
                      Recommended (OK)
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-xl bg-black text-[#9fff00] flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="font-['Outfit'] font-bold text-sm text-zinc-900">
                        Give Me "OK" (Auto-Equip)
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Instantly configure a matched 3D Digital Twin and Acoustic FFT profile based on this machine file.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs font-bold text-black">
                    <span>1-Click Confirm (OK)</span>
                    <ArrowRight className="h-4 w-4 text-black group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Custom Model & Audio ("otherwise give the model and audio") */}
                <button
                  onClick={() => setStep('custom')}
                  className="flex flex-col justify-between text-left p-5 rounded-2xl border border-black/10 bg-white hover:border-black/30 hover:bg-zinc-50 transition-all shadow-xs group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                        <Sliders className="h-4 w-4" />
                      </div>
                      <span className="font-['Outfit'] font-bold text-sm text-zinc-900">
                        Custom Model & Audio
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">
                      Select specific 3D machine kinematics (5-Axis, VMC, Lathe, HMC) and FFT audio frequency signature.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs font-bold text-zinc-800">
                    <span>Configure Specific Model & Audio</span>
                    <ArrowRight className="h-4 w-4 text-zinc-800 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              {/* Skip option */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleSkip}
                  className="text-xs text-zinc-400 hover:text-zinc-700 underline underline-offset-4 transition-colors"
                >
                  Skip 3D model & audio (Store document only)
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CUSTOM CONFIGURATION PANEL ("otherwise give the model and audio") */}
          {step === 'custom' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Machine ID and Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Machine Identifier
                  </label>
                  <input
                    type="text"
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs font-mono font-bold bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Machine Name / Model
                  </label>
                  <input
                    type="text"
                    value={machineName}
                    onChange={(e) => setMachineName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs font-bold bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 3D Model Architecture Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Box className="h-4 w-4 text-zinc-700" />
                    <span>Select 3D Digital Twin Architecture</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">Renders in Three.js Canvas</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: '5axis', title: '5-Axis Trunnion', desc: 'DMG MORI Swivel Style' },
                    { id: 'vmc', title: 'Vertical VMC', desc: 'Haas 3-Axis & Tool Carousel' },
                    { id: 'millturn', title: 'Mill-Turn Lathe', desc: 'Mazak Chuck & B-Axis' },
                    { id: 'bridge', title: 'Bridge Column', desc: 'Okuma Heavy Double-Gantry' },
                    { id: 'hmc', title: 'Horizontal HMC', desc: 'Makino Tombstone Pallet' },
                    { id: 'custom', title: 'Robotic Machining', desc: 'Articulated 6-Axis Hybrid' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setArchitecture(item.id as MachineArchitecture)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        architecture === item.id
                          ? 'border-black bg-zinc-900 text-white shadow-sm'
                          : 'border-black/[0.08] bg-zinc-50/50 hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <span className="block text-xs font-bold">{item.title}</span>
                      <span className={`block text-[10px] mt-0.5 ${architecture === item.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Acoustic FFT Audio Profile Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-zinc-700" />
                    <span>Select Acoustic Audio & FFT Frequency Signature</span>
                  </label>
                  <span className="text-[10px] text-zinc-400">Visualizes in 48-Ch Spectrogram</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'bearing', title: 'Spindle Bearing BPFO Defect', freq: '2,420 Hz Harmonic Spike', tag: 'High Vibration' },
                    { id: 'chatter', title: 'Tool Chatter & Deflection', freq: '680 Hz Low-Order Wave', tag: 'Resonance' },
                    { id: 'cavitation', title: 'Coolant Pump Cavitation', freq: '4,100 Hz Ultrasonic Hiss', tag: 'Hydraulic' },
                    { id: 'healthy', title: 'Nominal Machining Sound', freq: '120 Hz Baseline Drive', tag: 'Optimal' },
                    { id: 'custom', title: 'Custom Ultrasonic / Frequency', freq: customPeakFreq, tag: 'Custom Input' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAudioPreset(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        audioPreset === item.id
                          ? 'border-black bg-zinc-900 text-white shadow-sm'
                          : 'border-black/[0.08] bg-zinc-50/50 hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          audioPreset === item.id ? 'bg-[#9fff00] text-black' : 'bg-zinc-200 text-zinc-700'
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <span className={`block text-[11px] font-mono mt-1 ${audioPreset === item.id ? 'text-[#9fff00]' : 'text-zinc-600'}`}>
                        {item.freq}
                      </span>
                    </button>
                  ))}
                </div>
                {audioPreset === 'custom' && (
                  <div className="mt-2 p-3 bg-zinc-50 rounded-xl border border-black/[0.06]">
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">
                      Specify Custom Peak Frequency (e.g. 3,500 Hz or 8,200 Hz):
                    </label>
                    <input
                      type="text"
                      value={customPeakFreq}
                      onChange={(e) => setCustomPeakFreq(e.target.value)}
                      placeholder="e.g. 3,200 Hz"
                      className="w-full px-3 py-1.5 rounded-lg border border-black/10 text-xs font-mono font-bold bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Machine Health & Status */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs font-semibold text-zinc-700">Initial Fleet Status:</span>
                {(['Active', 'Warning', 'Maintenance'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setMachineStatus(st)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      machineStatus === st
                        ? st === 'Active' ? 'bg-emerald-500 text-white border-emerald-600' :
                          st === 'Warning' ? 'bg-amber-500 text-white border-amber-600' :
                          'bg-red-500 text-white border-red-600'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setStep('prompt')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-black hover:bg-zinc-100"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleCustomConfirm}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold shadow-md transition-all"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#9fff00]" />
                  <span>Bind 3D Model & FFT Audio</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & IMMEDIATE SHORTCUTS ("means it should show in digital twin and fft") */}
          {step === 'success' && (
            <div className="space-y-6 text-center sm:text-left animate-in fade-in">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-emerald-900">
                    Machine Asset Successfully Linked to Digital Twin & FFT!
                  </h3>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Unit <strong>{createdMachineId}</strong> is now live in both the 3D Kinematics engine and the 48-Channel Acoustic Analyzer.
                  </p>
                </div>
              </div>

              {/* Where it is now available */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-black/[0.08] bg-zinc-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-blue-600" />
                    <span className="font-['Outfit'] text-xs font-bold text-zinc-900">
                      3D Digital Twin Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Interactive kinematic model rendered with dynamic spindle rotation and telemetry HUD.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/dashboard/machines?machine=${encodeURIComponent(createdMachineId)}`);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1a1a] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Inspect in 3D Digital Twin</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#9fff00]" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-black/[0.08] bg-zinc-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-purple-600" />
                    <span className="font-['Outfit'] text-xs font-bold text-zinc-900">
                      Acoustic FFT Profile Active
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Continuous 48-band frequency spectrogram synchronized with audio harmonic diagnosis.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/dashboard/acoustics?profile=${encodeURIComponent(createdAudioKey)}`);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Analyze in FFT Spectrogram</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl border border-black/10 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Done (Return to View)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
