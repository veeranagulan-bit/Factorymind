import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  Copy, 
  FileText, 
  Search, 
  Plus, 
  Sparkles, 
  Check, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ClipboardCheck, 
  Printer, 
  X,
  History,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

interface Source {
  id: string;
  title: string;
  page: string;
  relevance: number;
}

interface WorkOrder {
  id: string;
  date: string;
  machine: string;
  component: string;
  priority: 'Critical' | 'High' | 'Medium';
  diagnosis: string;
  requiredParts: string[];
  checklist: string[];
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  timeLabel: string;
  messages: Message[];
}

const STORAGE_KEY_CURRENT = 'factorymind_ai_current_chat';
const STORAGE_KEY_HISTORY = 'factorymind_ai_chat_history';
const STORAGE_KEY_ACTIVE_ID = 'factorymind_ai_active_session_id';

const initialHistory: ChatSession[] = [
  {
    id: 'hist-1',
    title: 'Spindle Overheating (62.4°C Alert)',
    createdAt: Date.now() - 3600000,
    timeLabel: 'Today, 10:45 AM',
    messages: [
      {
        id: 'h1-1',
        role: 'user',
        content: 'Diagnose Haas VF-2SS (Unit M-101) spindle temperature rising to 62.4°C and vibration 0.48 mm/s.'
      },
      {
        id: 'h1-2',
        role: 'assistant',
        content: `### ⚠️ Critical Spindle Overheating & Bearing Wear
Spindle bearing temperature (62.4°C) has breached the 55.0°C upper tolerance threshold.

**Root Cause:**
Chiller coolant return flow rate decreased by 22%, causing thermal starvation at the front angular contact ceramic bearings.

**Immediate Actions:**
1. Execute feed hold and inspect chiller heat-exchanger fins.
2. Verify air-oil lubrication mist pressure (**0.35–0.40 MPa**).
3. Check 48-channel FFT spectrogram at 2,420 Hz for harmonic spalling signature.`,
        sources: [
          { id: 'src-1', title: 'Haas_VF2SS_Maintenance_Manual_2024.pdf', page: '42', relevance: 0.96 },
          { id: 'src-2', title: 'Spindle_Bearing_Troubleshooting_Guide.pdf', page: '18', relevance: 0.91 }
        ]
      }
    ]
  },
  {
    id: 'hist-2',
    title: 'Alarm E-402 Z-Axis Servo Overload',
    createdAt: Date.now() - 86400000,
    timeLabel: 'Yesterday, 3:15 PM',
    messages: [
      {
        id: 'h2-1',
        role: 'user',
        content: 'How do I resolve Alarm E-402 on the Okuma Genos M560-V vertical column?'
      },
      {
        id: 'h2-2',
        role: 'assistant',
        content: `### 🚨 Alarm 402: Z-Axis Servo Drive Overload Diagnostics
The servo amplifier has tripped its thermal overload threshold (continuous current > 14.5A for > 3.0s).

**Diagnostic Procedures:**
1. **Mechanical Inspection:** Inspect telescopic stainless steel way covers for wedged chips binding the vertical ballscrew.
2. **Pneumatic Counterbalance:** Ensure cylinder pressure reads 4.2 Bar before resetting servo drive breaker.
3. **Guideway Lubrication:** Verify Mobil Vactra #2 metered oil delivery to Z-axis linear guide trucks.`,
        sources: [
          { id: 'src-3', title: 'Z_Axis_Servo_Overload_SOP.pdf', page: '5', relevance: 0.94 }
        ]
      }
    ]
  },
  {
    id: 'hist-3',
    title: 'Coolant Refractometer Brix Concentration',
    createdAt: Date.now() - 172800000,
    timeLabel: '2 Days Ago',
    messages: [
      {
        id: 'h3-1',
        role: 'user',
        content: 'What is the recommended Brix refractometer reading for titanium milling coolant?'
      },
      {
        id: 'h3-2',
        role: 'assistant',
        content: `### 🧪 Water-Soluble Coolant Concentration
For titanium (Ti-6Al-4V) and stainless steel aerospace alloys:
• Maintain **8.5% to 10.5% Brix** concentration.
• Always add oil concentrate to water (never water to concentrate) to maintain emulsion stability.
• Check weekly pH levels between 8.8 and 9.4 to prevent bacterial degradation.`,
        sources: [
          { id: 'src-4', title: 'Coolant_Refractometer_Calibration_Chart.pdf', page: '12', relevance: 0.88 }
        ]
      }
    ]
  }
];

function FormattedContent({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs md:text-sm leading-relaxed text-zinc-800">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={index} className="h-1.5" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={index} className="font-['Outfit'] font-bold text-sm md:text-base text-[#1a1a1a] mt-2 mb-1">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }

        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletText = trimmed.replace(/^([•\-\*]\s*)/, '');
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="text-[#1a1a1a] font-bold">•</span>
              <span>{renderBold(bulletText)}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numMatch) {
          return (
            <div key={index} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-zinc-900">{numMatch[1]}.</span>
              <span>{renderBold(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={index}>{renderBold(line)}</p>;
      })}
    </div>
  );
}

function renderBold(str: string) {
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function AiAssistantPage() {
  const [searchParams] = useSearchParams();

  // Load chat history from localStorage or fallback to initialHistory
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(initialHistory));
      return initialHistory;
    } catch {
      return initialHistory;
    }
  });

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || `session_${Date.now()}`;
  });

  // Persistent Active Messages: Restore from localStorage so changing tabs NEVER loses conversation
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CURRENT);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmitted = useRef(false);

  // Auto-scroll on new message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Synchronize active messages & chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(messages));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeSessionId);

      // Automatically sync or update this session in the history list
      setChatHistory(prev => {
        const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'CNC Diagnostic Session';
        const cleanTitle = firstUserMsg.length > 38 ? firstUserMsg.slice(0, 38) + '...' : firstUserMsg;

        const sessionToSave: ChatSession = {
          id: activeSessionId,
          title: cleanTitle,
          createdAt: Date.now(),
          timeLabel: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          messages: [...messages]
        };

        const existingIdx = prev.findIndex(s => s.id === activeSessionId);
        let updated: ChatSession[];
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = sessionToSave;
        } else {
          updated = [sessionToSave, ...prev];
        }
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [messages, activeSessionId]);

  // Handle "New Chat" button: Saves current conversation and starts fresh
  const handleNewChat = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'CNC Maintenance Session';
      const cleanTitle = firstUserMsg.length > 38 ? firstUserMsg.slice(0, 38) + '...' : firstUserMsg;

      const currentToSave: ChatSession = {
        id: activeSessionId,
        title: cleanTitle,
        createdAt: Date.now(),
        timeLabel: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: [...messages]
      };

      setChatHistory(prev => {
        const idx = prev.findIndex(s => s.id === activeSessionId);
        let updated: ChatSession[];
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = currentToSave;
        } else {
          updated = [currentToSave, ...prev];
        }
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        return updated;
      });
    }

    // Reset view
    const newSessionId = `session_${Date.now()}`;
    setActiveSessionId(newSessionId);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY_CURRENT);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newSessionId);
    setIsMobileHistoryOpen(false);
  };

  // Switch to a previous conversation from history
  const handleSelectSession = (session: ChatSession) => {
    // If current conversation is unsaved, save it
    if (messages.length > 0 && activeSessionId !== session.id) {
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'CNC Maintenance Session';
      const cleanTitle = firstUserMsg.length > 38 ? firstUserMsg.slice(0, 38) + '...' : firstUserMsg;
      const currentToSave: ChatSession = {
        id: activeSessionId,
        title: cleanTitle,
        createdAt: Date.now(),
        timeLabel: 'Today',
        messages: [...messages]
      };
      setChatHistory(prev => {
        const idx = prev.findIndex(s => s.id === activeSessionId);
        let updated: ChatSession[];
        if (idx >= 0) {
          updated = [...prev];
          updated[idx] = currentToSave;
        } else {
          updated = [currentToSave, ...prev];
        }
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        return updated;
      });
    }

    setActiveSessionId(session.id);
    setMessages(session.messages);
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(session.messages));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, session.id);
    setIsMobileHistoryOpen(false);
  };

  // Delete a conversation from history
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory(prev => {
      const updated = prev.filter(s => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    });

    if (activeSessionId === sessionId) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY_CURRENT);
      const newId = `session_${Date.now()}`;
      setActiveSessionId(newId);
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newId);
    }
  };

  const toggleMute = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setTtsEnabled(prev => !prev);
  };

  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const cleanSpeech = text
        .replace(/###/g, '')
        .replace(/\*\*/g, '')
        .replace(/•/g, '')
        .replace(/\[.*?\]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanSpeech.slice(0, 240));
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis unsupported or suppressed
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
                              (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is supported in Google Chrome, Microsoft Edge, and Safari on desktop and mobile.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        executeSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateWorkOrderFromMessage = (content: string) => {
    const isSpindle = content.toLowerCase().includes('spindle');
    const isServo = content.toLowerCase().includes('402') || content.toLowerCase().includes('servo');

    const newOrder: WorkOrder = {
      id: `WO-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      machine: isSpindle ? 'Haas VF-2SS (Unit M-101)' : isServo ? 'Mazak Integrex i-200 (Unit M-102)' : 'DMG MORI DMU 50 (Unit M-104)',
      component: isSpindle ? 'High-Speed Spindle Cartridge' : isServo ? 'Z-Axis Servo Amplifier & Ballscrew' : 'Coolant Delivery & Chiller Pump',
      priority: isSpindle || isServo ? 'Critical' : 'High',
      diagnosis: isSpindle 
        ? 'Spindle thermal gradient exceeded 55.0°C threshold. Front angular contact bearing acoustic spalling detected at 2,420 Hz.' 
        : isServo
        ? 'Alarm E-402: Z-Axis Servo Drive Overload trip. Telescopic wipers binding against guideway.'
        : 'Coolant flow degradation. Filter particulate saturation causing pump cavitation.',
      requiredParts: isSpindle 
        ? ['Front Hybrid Ceramic Spindle Bearing Set (7014C)', 'Air-Oil Mist Metering Nozzle', 'Synthetic Spindle Chiller Glycol (10L)'] 
        : isServo
        ? ['Z-Axis Servo Drive Contactor Module', 'Ballscrew Wiper Seal Assembly', 'Mobil Vactra #2 Way Lubricant (5L)']
        : ['Water-Soluble Coolant Concentrate', 'Optical Refractometer Brix Standard', 'High-Pressure Inline Mesh Filter (50μm)'],
      checklist: [
        'Perform complete Lockout / Tagout (LOTO) on main 480V disconnect',
        'Drain and flush auxiliary chiller recirculation loop',
        'Inspect mechanical travel limits and wipe guideways',
        'Calibrate temperature / current sensor thresholds',
        'Perform 10-minute dry-run test under 25% rapid override'
      ]
    };

    setActiveWorkOrder(newOrder);
  };

  const executeSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let responseContent = '';
      let responseSources: Source[] = [];

      const raw = text.trim().toLowerCase();
      const clean = raw.replace(/[^\w\s]/gi, '').trim();

      const isGreeting = /^(hi|hello|hey|heyy|heya|good\s*(morning|afternoon|evening)|welcome|greetings|howdy|sup)\b/i.test(clean);
      const isIdentity = /(who\s*are\s*you|what\s*are\s*you|what\s*can\s*you\s*do|introduce\s*yourself|help\b)/i.test(clean);
      const isHowAreYou = /(how\s*are\s*you|hows\s*it\s*going|whats\s*up)/i.test(clean);
      const isThanks = /^(thanks|thank\s*you|thx|great|awesome|perfect|ok|okay|got\s*it|cool|nice)\b/i.test(clean);

      if (isGreeting) {
        responseContent = `Hello! Welcome to FactoryMind Assistant, sir. How can I assist you with your CNC machinery today?

I am ready to help you with:
• **Machine Diagnostics & Troubleshooting** (e.g., spindle overheating, axis vibration, bearing wear)
• **Error Code Analysis** (e.g., Error E-402, servo alarms, drive overloads)
• **Maintenance Specifications** (coolant concentration ratios, lubrication intervals, tool wear offsets)
• **Document Retrieval** (searching OEM manuals, SOPs, and error code databases)

Feel free to ask a question or tell me what machine you are currently inspecting!`;
        responseSources = [];
      } else if (isIdentity) {
        responseContent = `I am **FactoryMind's AI Assistant**—your specialized diagnostic copilot designed for CNC milling machines and industrial workshops.

I am fine-tuned on OEM equipment manuals, maintenance checklists, and controller error databases (Fanuc, Haas, Mazak, Okuma, DMG MORI).

You can ask me to:
1. Diagnose physical symptoms like abnormal spindle heat or vibration.
2. Decode controller error codes and give step-by-step fix recommendations.
3. Check recommended coolant concentration, lubrication intervals, and tool compensation offsets.
4. Search through indexed manuals to retrieve exact page excerpts.

What would you like assistance with today?`;
        responseSources = [];
      } else if (isHowAreYou) {
        responseContent = `I'm functioning at 100% capacity and all diagnostic neural pipelines are active! 

How are your machines performing on the shop floor today? Let me know if you need to troubleshoot any alerts or verify operating parameters.`;
        responseSources = [];
      } else if (isThanks) {
        responseContent = `You're very welcome, sir! 

If any other machine errors or maintenance questions come up, don't hesitate to ask. Have a safe and productive shift!`;
        responseSources = [];
      } else if (raw.includes('spindle') || raw.includes('overheating') || raw.includes('over heating') || raw.includes('heat') || raw.includes('temperature')) {
        responseContent = `### ⚠️ Spindle Overheating Diagnostic & Checklist

Spindle temperatures exceeding normal operating bounds (typically > 55°C–60°C) require immediate attention to prevent thermal bearing seizure and shaft runout.

**Recommended Inspection Steps:**
1. **Chiller & Coolant Circulation**:
   • Check the dedicated spindle chiller unit to verify oil/coolant is flowing without restriction.
   • Inspect chiller intake filters and clear any accumulated shop dust or oil sludge.
   • Ensure chiller setpoint is aligned with ambient base temperature (±1°C).

2. **Air-Oil Lubrication Mist**:
   • Inspect the oil-air pressure regulator. Pressure must read between **0.35–0.40 MPa**.
   • Verify that drop frequency is calibrated to 1 drop every 8–10 minutes.

3. **Bearing Acoustic Health**:
   • Check the 48-channel FFT acoustic spectrum. A harmonic spike around **2.4 kHz** indicates ball pass frequency outer race (BPFO) defect on the front bearings.

*References: Haas VF-2SS Maintenance Manual (Sec. 5.3) & Spindle Bearing Troubleshooting SOP (Page 18).*`;
        responseSources = [
          { id: '1', title: 'Haas_VF2SS_Maintenance_Manual_2024.pdf', page: '42', relevance: 0.95 },
          { id: '2', title: 'Spindle_Bearing_Troubleshooting_Guide.pdf', page: '18', relevance: 0.89 }
        ];
      } else if (raw.includes('402') || raw.includes('e-402') || raw.includes('overload') || raw.includes('servo')) {
        responseContent = `### 🚨 Alarm 402 / E-402: Z-Axis Servo Drive Overload

Alarm 402 signifies that the Z-axis servo drive current exceeded the thermal trip threshold (continuous current > 14.5A for > 3.0s).

**Step-by-Step Resolution:**
1. **Clear Mechanical Binding:** Inspect telescopic stainless steel way covers on the vertical column. Clear any jammed metal chips creating friction.
2. **Pneumatic Counterbalance:** Verify that the cylinder pressure is holding at **4.2 Bar**. If pressure is low, the servo motor carries full headstock weight.
3. **Guideway Lubrication Film:** Inspect the automatic oil metering valves to ensure Mobil Vactra #2 is reaching all 4 linear guide trucks.
4. **Reset Breaker:** Allow the amplifier heat sink to cool for 5 minutes before pressing RESET on the CNC controller.

*References: Z_Axis_Servo_Overload_SOP (Sec. 4.1) & Fanuc 31i Error Codes (Page 88).*`;
        responseSources = [
          { id: '3', title: 'Z_Axis_Servo_Overload_SOP.pdf', page: '5', relevance: 0.98 },
          { id: '4', title: 'Fanuc_31i_Error_Codes_Reference.pdf', page: '88', relevance: 0.92 }
        ];
      } else if (raw.includes('coolant') || raw.includes('brix') || raw.includes('mixture') || raw.includes('refractometer')) {
        responseContent = `### 💧 Coolant Concentration & Refractometer Guidelines

Maintaining correct water-soluble coolant concentration protects cutting tools, prevents workpiece corrosion, and eliminates bacterial rancidity.

**Target Concentration Ratios:**
• **General Machining (Carbon & Alloy Steels):** 6.0% – 8.0% Brix (Refractometer factor 1.0)
• **Heavy Roughing & Titanium (Ti-6Al-4V):** 8.5% – 10.5% Brix
• **Aluminum & Non-Ferrous Alloys:** 5.0% – 7.0% Brix

**Maintenance Rules:**
1. Always add coolant concentrate to water (OIL TO WATER), never water into oil.
2. Check concentration daily using an optical or digital refractometer before the first shift.
3. Maintain sump tramp-oil skimmers to preserve aerobic fluid conditions.`;
        responseSources = [
          { id: '5', title: 'Coolant_Refractometer_Calibration_Chart.pdf', page: '12', relevance: 0.94 }
        ];
      } else {
        responseContent = `### 📋 Technical Diagnostic Analysis

Regarding your inquiry on **"${text.trim()}"**:

1. **Operating Parameters**:
   Verify that all axis servo drives and auxiliary hydraulic units are operating within nominal thermal tolerances ($T < 45^\circ\\text{C}$, vibration RMS $< 0.15\\text{ mm/s}$).

2. **Preventive Verification**:
   Inspect telemetry sensors, lubricant reservoirs, and air pressure regulators (**0.6 MPa** line supply).

3. **Next Steps**:
   If symptoms persist, execute a controlled spindle stop and review controller event logs. You can also generate an automated maintenance work order below for technician sign-off.`;
        responseSources = [
          { id: '6', title: 'Haas_VF2SS_Maintenance_Manual_2024.pdf', page: '12', relevance: 0.82 }
        ];
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        sources: responseSources
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      speakText(responseContent);
    }, 800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    executeSend(input);
  };

  // Handle URL query trigger (e.g. from Fleet page "Diagnose with AI Co-Pilot")
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      executeSend(q);
    }
  }, [searchParams]);

  return (
    <div className="flex h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.5rem)] -m-4 sm:-m-6 md:-m-8 bg-bg-base overflow-hidden relative font-sans text-zinc-900">
      
      {/* ================= HISTORY SIDEBAR (DESKTOP & LAPTOP) ================= */}
      <div className="w-72 border-r border-black/[0.06] bg-white/70 backdrop-blur-md flex-col hidden lg:flex relative z-10 shrink-0">
        <div className="p-4 border-b border-black/[0.06] space-y-2">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] hover:bg-black px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-xs group"
          >
            <Plus className="h-4 w-4 text-[#9fff00] group-hover:scale-110 transition-transform" />
            <span>+ New Conversation</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          <div className="flex items-center justify-between px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <History className="h-3 w-3" /> Saved Conversations ({chatHistory.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {chatHistory.map((session) => {
              const isActive = activeSessionId === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer group flex items-start justify-between gap-2 border",
                    isActive 
                      ? "bg-white border-black/15 shadow-xs font-semibold text-zinc-900" 
                      : "border-transparent text-zinc-600 hover:bg-black/[0.04] hover:text-[#1a1a1a]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className={cn("h-3 w-3 shrink-0", isActive ? "text-[#1a1a1a]" : "text-zinc-400")} />
                      <span className="truncate block font-medium">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-1 pl-4.5 font-mono">
                      <span>{session.timeLabel}</span>
                      <span>•</span>
                      <span>{session.messages.length} msgs</span>
                    </div>
                  </div>

                  {/* Delete conversation button */}
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 rounded transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-600" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= MOBILE SLIDE-OVER HISTORY DRAWER ================= */}
      <AnimatePresence>
        {isMobileHistoryOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-xs" 
              onClick={() => setIsMobileHistoryOpen(false)} 
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl flex flex-col z-10 border-r border-black/10"
            >
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
                <span className="font-['Outfit'] font-bold text-sm text-zinc-900 flex items-center gap-1.5">
                  <History className="h-4 w-4" /> Chat History
                </span>
                <button 
                  onClick={() => setIsMobileHistoryOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 border-b border-black/[0.06]">
                <button 
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1a1a1a] text-white px-4 py-2.5 text-xs font-semibold shadow-xs"
                >
                  <Plus className="h-4 w-4 text-[#9fff00]" />
                  <span>+ New Conversation</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {chatHistory.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-start justify-between gap-2 border",
                      activeSessionId === session.id 
                        ? "bg-zinc-100 border-black/15 font-semibold text-zinc-900" 
                        : "border-transparent text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3 w-3 text-zinc-500 shrink-0" />
                        <span className="truncate block font-medium">{session.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-1 pl-4.5 font-mono">
                        {session.timeLabel} • {session.messages.length} msgs
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1 text-zinc-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MAIN CHAT CONTENT AREA ================= */}
      {messages.length === 0 ? (
        /* ================= EMPTY STATE ================= */
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 sm:px-6 overflow-y-auto py-8">
          
          {/* Mobile top toolbar in empty state */}
          <div className="lg:hidden absolute top-3 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => setIsMobileHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-black/10 text-xs font-semibold text-zinc-700 shadow-2xs"
            >
              <History className="h-3.5 w-3.5" />
              <span>History ({chatHistory.length})</span>
            </button>
            <button
              onClick={toggleMute}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-2xs",
                ttsEnabled ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
              )}
            >
              {ttsEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600" /> : <VolumeX className="h-3.5 w-3.5 text-red-600" />}
              <span>{ttsEnabled ? "Voice ON" : "MUTED"}</span>
            </button>
          </div>

          <div className="max-w-2xl w-full mx-auto text-center mt-6 lg:mt-0">
            {/* Header Animation */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8 }}
              className="font-['Outfit'] font-normal text-2xl sm:text-3xl md:text-5xl tracking-tight leading-[1.25] mb-6 text-[#1a1a1a]"
            >
              <span>Instant knowledge & diagnostics</span>
              <br />
              <span className="text-[#8e8e8e]">for your </span>
              <span className="w-[32px] sm:w-[44px] md:w-[50px] h-[20px] sm:h-[26px] md:h-[28px] border-[2px] border-[#1a1a1a] rounded-full inline-flex items-center justify-center align-middle mx-1 sm:mx-1.5 bg-transparent">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
              </span>
              <span className="text-[#8e8e8e]">machinery.</span>
            </motion.h1>

            {/* Search Pill Component Animation */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.8, delay: 0.15 }}
              className="max-w-xl mx-auto"
            >
              <form 
                onSubmit={handleSend}
                className="bg-white rounded-[8px] sm:rounded-full border border-black/[0.08] p-1.5 pl-3.5 sm:pl-4 flex items-center shadow-sm hover:shadow-md transition-shadow gap-2"
              >
                <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything (or tap mic to speak)..." 
                  className="flex-1 bg-transparent border-none text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden text-xs sm:text-sm py-2"
                />

                {/* Voice Mode Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0",
                    isListening ? "bg-red-500 text-white animate-pulse shadow-md" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  )}
                  title="Voice Mode: Speak to FactoryMind"
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="bg-[#1a1a1a] hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:bg-zinc-300 shrink-0"
                >
                  <Send className="h-3.5 w-3.5 ml-0.5" />
                </button>
              </form>
              
              {isListening && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-red-600 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Listening to operator audio input... speak now!
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  'Hi, how can you help me?',
                  'Why is the spindle overheating?',
                  'Error code E-402 resolution',
                  'Recommended coolant mixture ratio'
                ].map((promptText) => (
                  <button 
                    key={promptText}
                    onClick={() => executeSend(promptText)} 
                    className="px-3 py-1.5 rounded-full bg-white/80 border border-black/[0.06] text-[11px] sm:text-xs text-zinc-600 hover:text-black hover:border-black/[0.15] hover:bg-white transition-all shadow-2xs"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      ) : (
        /* ================= ACTIVE CHAT STATE ================= */
        <div className="flex-1 flex flex-col relative z-10 w-full h-full">
          {/* Top Bar with History & Controls */}
          <div className="h-12 sm:h-14 border-b border-black/[0.06] flex items-center justify-between px-3 sm:px-6 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
            <div className="flex items-center gap-2">
              {/* Mobile history toggle */}
              <button
                onClick={() => setIsMobileHistoryOpen(true)}
                className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 transition-colors"
                title="View Chat History"
              >
                <History className="h-3.5 w-3.5" />
                <span className="text-[11px]">History</span>
              </button>

              <span className="text-xs font-semibold text-zinc-800 hidden sm:inline">Diagnostic Session</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9fff00]/25 text-black border border-[#9fff00]/40 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> SLM Live
              </span>
            </div>
            
            {/* Action controls: Voice ON/MUTED and New Conversation */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-2xs",
                  ttsEnabled 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100" 
                    : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                )}
                title={ttsEnabled ? "Click to Mute AI Voice" : "Voice is Muted - Click to Unmute"}
              >
                {ttsEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-600" /> : <VolumeX className="h-3.5 w-3.5 text-red-600" />}
                <span>{ttsEnabled ? "Voice ON" : "MUTED"}</span>
              </button>

              <button 
                onClick={handleNewChat}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-xs font-semibold transition-all shadow-xs"
                title="Save current chat and start new conversation"
              >
                <Plus className="h-3.5 w-3.5 text-[#9fff00]" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-16 sm:pt-20 pb-36 sm:pb-40">
             <div className="max-w-3xl mx-auto w-full space-y-5">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white mt-0.5">
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "flex flex-col gap-1.5 max-w-[90%] sm:max-w-[85%]",
                    message.role === 'user' ? 'items-end' : 'items-start'
                  )}>
                    <div className={cn(
                      "px-4 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-xs",
                      message.role === 'user' 
                        ? 'bg-[#1a1a1a] text-white rounded-tr-xs text-xs sm:text-sm' 
                        : 'bg-white border border-black/[0.06] text-zinc-900 rounded-tl-xs'
                    )}>
                      {message.role === 'assistant' ? (
                        <FormattedContent text={message.content} />
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center flex-wrap gap-2 px-1">
                        {/* 1-Click Work Order Generator Button */}
                        <button
                          onClick={() => generateWorkOrderFromMessage(message.content)}
                          className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-900 bg-[#9fff00]/30 hover:bg-[#9fff00]/50 px-2.5 py-1 rounded-full border border-[#9fff00]/60 transition-colors shadow-2xs"
                        >
                          <ClipboardCheck className="h-3 w-3" />
                          <span>Generate Work Order</span>
                        </button>

                        <div className="flex items-center gap-1 text-zinc-400">
                          <button 
                            onClick={() => handleCopy(message.id, message.content)}
                            className="p-1 rounded-sm hover:text-black transition-colors" 
                            title="Copy"
                          >
                            {copiedId === message.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white mt-0.5">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="bg-white border border-black/[0.06] rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} />
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
             </div>
          </div>

          {/* Active Chat Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 z-20">
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent -z-10 pointer-events-none h-[150%] -top-[50%]" />
            <div className="max-w-3xl mx-auto relative z-10">
              <form 
                onSubmit={handleSend}
                className="bg-white rounded-[10px] sm:rounded-full border border-black/[0.08] p-1.5 pl-3 sm:pl-5 flex items-center shadow-lg hover:border-black/[0.18] transition-colors gap-1.5 sm:gap-2"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question or speak..." 
                  className="flex-1 bg-transparent border-none text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden text-xs sm:text-sm py-1.5 sm:py-2"
                />

                {/* Voice Input Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shrink-0",
                    isListening ? "bg-red-500 text-white animate-pulse shadow-md" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  )}
                  title="Voice Mode"
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>

                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="bg-[#1a1a1a] hover:bg-black text-white w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                >
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-0.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sources Sidebar (Desktop: xl and above) */}
      {messages.length > 0 && messages[messages.length - 1]?.sources && messages[messages.length - 1]?.sources!.length > 0 && (
        <div className="w-80 border-l border-black/[0.06] bg-white/70 backdrop-blur-md flex-col hidden xl:flex relative z-10 shrink-0">
          <div className="h-14 border-b border-black/[0.06] flex items-center px-4 bg-white/60">
            <h2 className="text-xs font-semibold text-zinc-900 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-500" />
              Retrieved Manual Sources
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages[messages.length - 1].sources?.map((source, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                key={source.id} 
                onClick={() => setSelectedSource(source)}
                className="p-3.5 rounded-xl bg-white border border-black/[0.06] hover:border-black/[0.18] hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                    <FileText className="h-3 w-3" />
                    Page {source.page}
                  </div>
                  <div className="text-[10px] font-semibold text-black bg-[#9fff00]/25 px-2 py-0.5 rounded-full border border-[#9fff00]/40">
                    {Math.round(source.relevance * 100)}% Match
                  </div>
                </div>
                <h3 className="text-xs font-semibold text-zinc-900 mb-2 leading-snug group-hover:text-black transition-colors">
                  {source.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500 group-hover:text-zinc-900 font-medium">
                  <span>View Verified Excerpt</span>
                  <span className="text-zinc-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Work Order Modal */}
      <AnimatePresence>
        {activeWorkOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setActiveWorkOrder(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-black/[0.06] flex items-center justify-between bg-zinc-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center">
                    <ClipboardCheck className="h-4 w-4 text-[#9fff00]" />
                  </div>
                  <div>
                    <h2 className="font-['Outfit'] font-bold text-sm sm:text-base text-zinc-900">
                      Standardized Maintenance Work Order
                    </h2>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Doc Ref: {activeWorkOrder.id} • {activeWorkOrder.date}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="p-1.5 rounded-lg border border-black/10 hover:bg-zinc-100 text-zinc-600 transition-colors"
                    title="Print Work Order"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setActiveWorkOrder(null)}
                    className="p-1.5 rounded-lg border border-black/10 hover:bg-zinc-100 text-zinc-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Work Order Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-black/[0.04]">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Machine Unit</span>
                    <span className="font-bold text-zinc-900">{activeWorkOrder.machine}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Target Assembly</span>
                    <span className="font-bold text-zinc-900">{activeWorkOrder.component}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Urgency Level</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                      activeWorkOrder.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activeWorkOrder.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 uppercase tracking-wider mb-1.5">
                    Engineering Fault Assessment
                  </h3>
                  <p className="text-zinc-700 bg-amber-50/50 p-3 rounded-xl border border-amber-200/40 leading-relaxed">
                    {activeWorkOrder.diagnosis}
                  </p>
                </div>

                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 uppercase tracking-wider mb-2">
                    Required Spare Parts & Consumables
                  </h3>
                  <ul className="space-y-1.5">
                    {activeWorkOrder.requiredParts.map((part, i) => (
                      <li key={i} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-black/[0.04]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#1a1a1a]" />
                        <span className="font-mono text-zinc-900">{part}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 uppercase tracking-wider mb-2">
                    Lockout / Tagout (LOTO) & Operational Checklist
                  </h3>
                  <div className="space-y-2">
                    {activeWorkOrder.checklist.map((item, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer">
                        <input type="checkbox" defaultChecked={i === 0} className="rounded-sm accent-black h-4 w-4" />
                        <span className="text-zinc-800">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-black/[0.08] grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-3">Lead Technician Signature</span>
                    <div className="h-8 border-b-2 border-dashed border-zinc-300 flex items-end">
                      <span className="font-serif italic text-sm text-zinc-600">J. Doe, Master Machinist</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-3">Shop Floor Supervisor Approval</span>
                    <div className="h-8 border-b-2 border-dashed border-zinc-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Viewer Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedSource(null)} />
          <div className="relative w-full max-w-3xl bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-black/[0.06] flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-zinc-800" />
                <h2 className="text-sm font-semibold text-zinc-900">{selectedSource.title}</h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-700">
                  Page {selectedSource.page}
                </span>
              </div>
              <button 
                onClick={() => setSelectedSource(null)}
                className="text-zinc-400 hover:text-black p-1 text-sm font-medium"
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-white">
              <div className="max-w-xl mx-auto text-zinc-800 leading-relaxed text-xs md:text-sm">
                <h3 className="font-['Outfit'] text-lg font-bold mb-4 text-zinc-900 border-b border-black/[0.06] pb-2">
                  Document Excerpt (Page {selectedSource.page})
                </h3>
                <p className="mb-4 text-zinc-600">
                  The following excerpt was verified from the knowledge core regarding the query:
                </p>
                <div className="border-l-2 border-[#1a1a1a] pl-4 py-2.5 my-4 bg-zinc-50 rounded-r-lg">
                  <p className="text-zinc-900 font-medium">
                    "Ensure all safety interlocks are engaged. When dealing with {selectedSource.title.toLowerCase()} issues, the technician must verify calibration settings before initiating high load cycles."
                  </p>
                </div>
                <p className="text-zinc-600">
                  If the vibration or heat threshold continues to fluctuate, verify the coolant flow rate and consult the secondary diagnostic schedule.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
