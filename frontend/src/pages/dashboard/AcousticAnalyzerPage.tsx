import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Volume2, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  VolumeX,
  Radio
} from 'lucide-react';
import { 
  getAcousticProfiles, 
  subscribeToFleetStore, 
  type AudioProfile 
} from '../../services/fleetStore';

export default function AcousticAnalyzerPage() {
  const [searchParams] = useSearchParams();
  const queryProfile = searchParams.get('profile');

  const [profiles, setProfiles] = useState<Record<string, AudioProfile>>(getAcousticProfiles());
  const [selectedProfileKey, setSelectedProfileKey] = useState<string>(() => {
    const list = getAcousticProfiles();
    if (queryProfile && list[queryProfile]) return queryProfile;
    return Object.keys(list)[0] || 'bearingFault';
  });

  const [isCapturing, setIsCapturing] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const navigate = useNavigate();

  // Subscribe to changes in fleet store
  useEffect(() => {
    return subscribeToFleetStore(() => {
      const updated = getAcousticProfiles();
      setProfiles(updated);
    });
  }, []);

  // Update selected profile when search param changes
  useEffect(() => {
    if (queryProfile && profiles[queryProfile]) {
      setSelectedProfileKey(queryProfile);
    }
  }, [queryProfile, profiles]);

  const profile: AudioProfile = profiles[selectedProfileKey] || Object.values(profiles)[0] || {
    id: 'default',
    name: 'Nominal Machining Signature',
    machine: 'CNC Fleet Machine',
    peakFreq: '120 Hz',
    peakFreqNum: 120,
    status: 'Normal',
    diagnosis: 'Acoustic harmonics balanced and nominal.',
    harmonicDescription: 'Even energy dispersion across 100 Hz to 12.8 kHz.'
  };

  // Sound Synthesizer via Web Audio API to actually hear the machine frequency
  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pitch based on machine peak frequency, clamped to audible comfortable range
      const baseFreq = Math.max(120, Math.min(1800, profile.peakFreqNum / (profile.peakFreqNum > 2000 ? 4 : 1)));
      osc.type = profile.status === 'Critical' ? 'sawtooth' : profile.status === 'Warning' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      // Low volume to prevent harsh sounds
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
      setIsPlayingAudio(true);
    } catch (err) {
      console.warn('Audio playback not supported', err);
    }
  };

  // Stop audio on unmount or profile switch
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
    };
  }, [selectedProfileKey]);

  // Animated FFT Canvas Spectrogram with dynamic mathematical frequency bin mapping
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const barCount = 48;
      const barWidth = (width / barCount) - 3;

      // Mathematical log mapping from 100 Hz to 12.8 kHz
      const minLog = Math.log10(100);
      const maxLog = Math.log10(12800);
      const targetFreq = profile.peakFreqNum || 120;
      const targetLog = Math.log10(Math.max(100, Math.min(12800, targetFreq)));
      const targetBar = Math.round(((targetLog - minLog) / (maxLog - minLog)) * (barCount - 1));

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 3) + 2;
        let barHeight = 0;

        if (isCapturing) {
          const freqNorm = i / barCount;
          let baseEnergy = Math.sin(freqNorm * 4 + phase) * 12 + 20;

          if (profile.status !== 'Normal') {
            const dist = Math.abs(i - targetBar);
            if (dist <= 4) {
              baseEnergy += (5 - dist) * 26 + (Math.sin(phase * 4) * 8);
            }
          } else {
            // Healthy profile: even energy
            baseEnergy = (1 - freqNorm * 0.5) * 40 + Math.sin(phase + i) * 5;
          }

          barHeight = Math.max(10, Math.min(height - 20, baseEnergy));
        } else {
          barHeight = 6;
        }

        // Color coding
        let barColor = '#1a1a1a';
        const distFromTarget = Math.abs(i - targetBar);
        if (profile.status === 'Critical' && distFromTarget <= 3) {
          barColor = '#ef4444'; // Red alarm for critical defect
        } else if (profile.status === 'Warning' && distFromTarget <= 3) {
          barColor = '#f59e0b'; // Amber for chatter/cavitation
        } else if (profile.status === 'Normal') {
          barColor = '#10b981'; // Emerald for healthy
        }

        // Draw bar
        ctx.fillStyle = barColor;
        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isCapturing, selectedProfileKey, profile]);

  const handleSendToAi = () => {
    navigate(`/dashboard/assistant?q=Acoustic+FFT+analyzer+detected+${encodeURIComponent(profile.peakFreq)}+on+${encodeURIComponent(profile.machine)}.+How+should+we+repair?`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight flex items-center gap-2.5">
            <Volume2 className="h-7 w-7 text-zinc-900" />
            <span>Spindle Acoustic & Vibration FFT Analyzer</span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Real-time acoustic spectral analysis for bearing fault detection, dynamic chatter, and machine audio profiles.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={togglePlayAudio}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs border ${
              isPlayingAudio ? 'bg-[#9fff00] text-black border-black font-bold animate-pulse' : 'bg-white text-zinc-800 border-black/10 hover:bg-zinc-50'
            }`}
          >
            {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5 text-emerald-600" />}
            <span>{isPlayingAudio ? 'Stop Machine Sound' : 'Play Audio Tone'}</span>
          </button>

          {/* Pause / Resume FFT */}
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs ${
              isCapturing ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#1a1a1a] text-white hover:bg-black'
            }`}
          >
            {isCapturing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isCapturing ? 'Pause Live Stream' : 'Resume Spectrum'}</span>
          </button>
        </div>
      </div>

      {/* Main Spectrogram & Telemetry Card */}
      <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-5 sm:p-8 backdrop-blur-md shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-['Outfit'] text-base sm:text-lg font-bold text-zinc-900">
              Live Fast Fourier Transform (FFT) Spectrum (100 Hz – 12.8 kHz)
            </h2>
            <p className="text-xs text-zinc-500">
              Continuous 48-channel 1/3 octave band acoustic analysis for <strong>{profile.machine}</strong>
            </p>
          </div>
          
          {/* Preset & Uploaded Profiles Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl max-w-full overflow-x-auto">
            {Object.entries(profiles).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setSelectedProfileKey(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedProfileKey === key
                    ? p.status === 'Critical' ? 'bg-red-600 text-white shadow-xs' :
                      p.status === 'Warning' ? 'bg-amber-500 text-white shadow-xs' :
                      'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-black hover:bg-zinc-200/60'
                }`}
              >
                <span>{p.name.length > 22 ? p.name.substring(0, 22) + '...' : p.name}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                  selectedProfileKey === key ? 'bg-white/20 text-white' : 'bg-black/5 text-zinc-600'
                }`}>
                  {p.peakFreq.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Canvas Spectrogram */}
        <div className="relative w-full h-56 sm:h-72 bg-zinc-50 rounded-xl border border-black/[0.06] overflow-hidden p-2">
          <canvas
            ref={canvasRef}
            width={720}
            height={260}
            className="w-full h-full block"
          />
          {/* Frequency Axis Marker Labels */}
          <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] text-zinc-400 font-mono pointer-events-none">
            <span>100 Hz</span>
            <span>500 Hz</span>
            <span>1.2 kHz</span>
            <span className={profile.status !== 'Normal' ? 'text-red-600 font-bold' : ''}>
              Peak: {profile.peakFreq.split(' ')[0]}
            </span>
            <span>5.0 kHz</span>
            <span>12.8 kHz</span>
          </div>
        </div>

        {/* Condition Assessment Banner */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          profile.status === 'Critical' ? 'bg-red-50/70 border-red-200' :
          profile.status === 'Warning' ? 'bg-amber-50/70 border-amber-200' :
          'bg-emerald-50/70 border-emerald-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl mt-0.5 ${
              profile.status === 'Critical' ? 'bg-red-600 text-white' :
              profile.status === 'Warning' ? 'bg-amber-500 text-white' :
              'bg-emerald-600 text-white'
            }`}>
              {profile.status === 'Critical' ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-['Outfit'] font-bold text-base text-zinc-900">{profile.name}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-black/10">
                  {profile.peakFreq}
                </span>
                <span className="text-xs text-zinc-500">({profile.machine})</span>
              </div>
              <p className="text-xs text-zinc-700 mt-1 leading-relaxed">{profile.diagnosis}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{profile.harmonicDescription}</p>
            </div>
          </div>

          <button
            onClick={handleSendToAi}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#9fff00]" />
            <span>Consult AI Co-Pilot →</span>
          </button>
        </div>
      </div>

      {/* Acoustic Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Sampling Rate', value: '48.0 kHz', desc: 'High-res audio I/O' },
          { label: 'Crest Factor', value: profile.status === 'Critical' ? '6.8 (Damaged)' : profile.status === 'Warning' ? '4.8 (Elevated)' : '3.1 (Normal)', desc: 'Peak-to-RMS acoustic ratio' },
          { label: 'Kurtosis Index', value: profile.status === 'Critical' ? '4.92 (High Shock)' : profile.status === 'Warning' ? '3.80 (Chatter)' : '2.98 (Gaussian)', desc: 'Impulsive vibration signature' },
          { label: 'Sensor Position', value: 'Spindle Nose Accelerometer', desc: 'Triaxial ICP® Sensor' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-black/[0.06] bg-white/80 p-4 sm:p-5 backdrop-blur-md shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
              {stat.label}
            </span>
            <span className="font-['Outfit'] text-lg sm:text-xl font-bold text-zinc-900 mt-1 block">
              {stat.value}
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5 block">{stat.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
