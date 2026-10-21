import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  FileText, 
  Search, 
  ExternalLink, 
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
  AlertTriangle
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

const mockHistory = [
  { id: '1', title: 'Spindle overheating issues', date: 'Today' },
  { id: '2', title: 'Error E-402 troubleshooting', date: 'Today' },
  { id: '3', title: 'Coolant mixture ratio', date: 'Yesterday' },
  { id: '4', title: 'Routine maintenance schedule', date: 'Yesterday' },
  { id: '5', title: 'Tool wear compensation', date: 'Previous 7 Days' },
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [activeWorkOrder, setActiveWorkOrder] = useState<WorkOrder | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmitted = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
      diagnosis: content.split('\n')[0].replace('###', '').trim(),
      requiredParts: isSpindle 
        ? ['SKF 7014 Angular Contact Bearings (Pair)', 'Viton Quad-Ring Seals #VR-42', 'Mobil Velocite No. 6 Spindle Oil']
        : isServo
        ? ['Z-Axis Ball Nut Wiper Set #BW-88', 'Fanuc Alpha i Servo Module A06B', 'Way Lube ISO VG 68']
        : ['Refractometer Calibrated Lens #RF-01', 'Tramp Oil Poly Coalescing Filter', 'Coolant Sump Biocide Concentrate'],
      checklist: [
        'Engage Lockout / Tagout (LOTO) on Main CNC Breaker',
        'Verify hydraulic / pneumatic lines are depressurized',
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
   • Check the lubrication reservoir level and verify no contamination or bubbles in the delivery line.

3. **Bearing Preload & Mechanical Friction**:
   • Perform an unloaded idle test at 1,000 RPM. If temperature spikes rapidly without cutting load, spindle bearings require preload adjustment or replacement.

4. **Tool Taper Cleanliness**:
   • Clean the spindle taper and tool holder shank with an approved lint-free wiper to remove fine chips.

*Recommended action*: Safely pause high-RPM cycles until chiller temperature stabilizes.`;
        responseSources = [
          { id: 's1', title: 'CNC Milling Machine Maintenance Manual', page: '42', relevance: 0.94 },
          { id: 's2', title: 'Spindle Troubleshooting Procedure', page: '18', relevance: 0.88 },
        ];
      } else if (raw.includes('e-402') || raw.includes('402') || raw.includes('servo') || raw.includes('overload')) {
        responseContent = `### 🚨 Error E-402: Z-Axis Servo Drive Overload

Error code **E-402** indicates that the Z-axis servo drive has drawn current above its rated thermal safety limit.

**Step-by-Step Resolution:**
1. **Inspect for Mechanical Binding**:
   • Safely halt the machine and lock out power.
   • Check the Z-axis telescoping way covers for metal chips wedged between wipers.
   • Inspect the Z-axis ballscrew and linear guideway lubrication lines for blockages.

2. **Verify Tooling & Cutting Load**:
   • Confirm that tool feed rate (mm/min) and plunge angle do not exceed maximum motor torque for the workpiece material.

3. **Check Electromagnetic Holding Brake**:
   • Ensure the 24V DC holding brake on the vertical column servo motor is disengaging cleanly when the drive enables.

4. **Clear and Reset**:
   • Clear debris, allow the servo amplifier to cool down for 5 minutes, and perform an axis reset from the CNC controller panel.`;
        responseSources = [
          { id: 'e1', title: 'Error Codes Reference Guide', page: '112', relevance: 0.98 },
          { id: 'e2', title: 'Axis Drive Maintenance SOP', page: '5', relevance: 0.76 },
        ];
      } else if (raw.includes('coolant') || raw.includes('mixture') || raw.includes('ratio') || raw.includes('refractometer')) {
        responseContent = `### 💧 Coolant Mixture & Concentration Standards

Maintaining the correct water-soluble coolant ratio ensures tool longevity, superior surface finish, and machine rust prevention:

• **General Milling (Mild & Alloy Steels)**: **8% to 10%** concentration
• **Aluminum & Non-Ferrous Alloys**: **6% to 8%** concentration
• **Heavy-Duty Tapping / Stainless Steel (304/316)**: **10% to 12%** concentration

**Key Best Practices:**
1. **Always use a Refractometer**: Never guess concentration by color or smell alone. Apply a refractive index multiplier according to your coolant manufacturer's data sheet.
2. **Mixing Order**: Always add **OIL INTO WATER** (never water into oil) while agitating to form a stable emulsion.
3. **Tramp Oil Skimming**: Skim surface tramp oils daily to prevent anaerobic bacterial growth and rancid odors.`;
        responseSources = [
          { id: 'c1', title: 'Coolant Management Best Practices', page: '12', relevance: 0.92 },
          { id: 'c2', title: 'Daily Maintenance Checklist', page: '2', relevance: 0.85 },
        ];
      } else if (raw.includes('tool') || raw.includes('wear') || raw.includes('offset')) {
        responseContent = `### 🔧 Tool Wear Compensation & Offset Management

To calibrate and compensate for progressive tool wear without altering your CAM program:

1. **Measure Critical Dimensions**:
   • Inspect the finished workpiece feature using a calibrated micrometer or height gauge.
   • Calculate wear delta: **Deviation = Actual Dimension - Nominal Print Spec**.

2. **Update the CNC Wear Table**:
   • Navigate to the **Tool Offsets > Wear** page on your controller.
   • Enter the wear offset into the **Wear Column** for the active tool number (do not modify Geometry offset).

3. **Flank Wear Threshold**:
   • If insert flank wear exceeds **0.30 mm** or edge chipping is visible under magnification, index or replace the carbide insert immediately.`;
        responseSources = [
          { id: 't1', title: 'Operator Training Manual', page: '67', relevance: 0.95 },
        ];
      } else {
        responseContent = `I understand your question regarding **"${text}"**.

Here is what the standard operating procedure recommends for this scenario:

1. **Safety First**: Verify that the CNC controller is in a safe state ('Feed Hold' or 'Manual Mode') before performing physical inspections.
2. **Telemetry & Calibration**: Check the controller monitor for any related drive or sensor alarms that may coincide with this issue.
3. **Documentation Cross-Reference**: Consult the OEM maintenance schedule for recommended service intervals and torque specifications.

Could you provide more context, such as the specific machine model (e.g., Haas VF-2SS or Mazak) or any exact alarm codes on the display?`;
        responseSources = [
          { id: 'g1', title: 'General Operations Manual', page: '15', relevance: 0.65 },
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

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      executeSend(q);
    }
  }, [searchParams]);

  return (
    <div className="flex h-[calc(100vh-7rem)] sm:h-[calc(100vh-7.5rem)] -m-4 sm:-m-6 md:-m-8 bg-bg-base overflow-hidden relative font-sans text-zinc-900">
      
      {/* History Sidebar (Laptop/Desktop only) */}
      <div className="w-64 border-r border-black/[0.06] bg-white/70 backdrop-blur-md flex-col hidden lg:flex relative z-10 shrink-0">
        <div className="p-4">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1a1a1a] hover:bg-black px-4 py-2.5 text-xs font-medium text-white transition-all shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            New Conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-6">
            {['Today', 'Yesterday', 'Previous 7 Days'].map(group => (
              <div key={group}>
                <h3 className="px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  {group}
                </h3>
                <div className="space-y-1">
                  {mockHistory.filter(h => h.date === group).map(item => (
                    <button 
                      key={item.id}
                      onClick={() => executeSend(item.title)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-600 hover:bg-black/[0.04] hover:text-[#1a1a1a] truncate transition-colors"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {messages.length === 0 ? (
        /* ================= EMPTY STATE (PHONE & LAPTOP RATIO OPTIMIZED) ================= */
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 sm:px-6 overflow-y-auto py-8">
          <div className="max-w-2xl w-full mx-auto text-center">
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
              {/* Eye Icon Pill UI Element */}
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
                  className="flex-1 bg-transparent border-none text-zinc-900 placeholder:text-zinc-400 focus:outline-none text-xs sm:text-sm py-2"
                />

                {/* Hands-Free Voice Mode Mic Button */}
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
          {/* Chat Header */}
          <div className="h-12 sm:h-14 border-b border-black/[0.06] flex items-center justify-between px-4 sm:px-6 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-20">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-800">Diagnostic Session</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#9fff00]/25 text-black border border-[#9fff00]/40 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> SLM Live
              </span>
            </div>
            
            {/* Action controls: Speaker audio toggle & new chat */}
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
                onClick={() => setMessages([])} 
                className="text-xs text-zinc-500 hover:text-black lg:hidden p-1.5"
                title="Clear chat"
              >
                <Plus className="h-4 w-4" />
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
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white mt-0.5">
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
                        ? 'bg-[#1a1a1a] text-white rounded-tr-sm text-xs sm:text-sm' 
                        : 'bg-white border border-black/[0.06] text-zinc-900 rounded-tl-sm'
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
                            className="p-1 rounded hover:text-black transition-colors" 
                            title="Copy"
                          >
                            {copiedId === message.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          </button>
                          <button 
                            onClick={() => executeSend(messages[messages.length - 2]?.content || 'spindle')}
                            className="p-1 rounded hover:text-black transition-colors" 
                            title="Regenerate"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                          <button className="p-1 rounded hover:text-emerald-600 transition-colors" title="Helpful">
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-white border border-black/[0.08] text-zinc-700 mt-0.5">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1a1a1a] text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-white border border-black/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-xs">
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="h-1.5 w-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
             </div>
          </div>

          {/* Active Chat Input Area (Phone & Laptop responsive) */}
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
                  className="flex-1 bg-transparent border-none text-zinc-900 placeholder:text-zinc-400 focus:outline-none text-xs sm:text-sm py-1.5 sm:py-2"
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

      {/* Sources Sidebar (Desktop/Laptop: lg and above) */}
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
                <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 group-hover:text-black transition-colors">
                  View Source Details <ExternalLink className="h-2.5 w-2.5" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Feature 4: Printable / Exportable Official Work Order Modal */}
      <AnimatePresence>
        {activeWorkOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setActiveWorkOrder(null)} />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white border border-black/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
            >
              {/* Header Bar */}
              <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-zinc-50">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-zinc-900" />
                  <div>
                    <h2 className="font-['Outfit'] font-bold text-base sm:text-lg text-zinc-900 leading-tight">
                      FactoryMind Maintenance Work Order
                    </h2>
                    <p className="text-[11px] text-zinc-500">{activeWorkOrder.id} • Issued: {activeWorkOrder.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-xs font-medium transition-colors shadow-xs"
                  >
                    <Printer className="h-3 w-3" />
                    <span className="hidden sm:inline">Print / Save PDF</span>
                  </button>
                  <button
                    onClick={() => setActiveWorkOrder(null)}
                    className="p-1 rounded-md text-zinc-400 hover:text-black"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Work Order Document Body */}
              <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-zinc-800">
                {/* Equipment & Severity Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-zinc-50 rounded-xl border border-black/[0.05]">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Target Machine</span>
                    <span className="font-semibold text-zinc-900">{activeWorkOrder.machine}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Sub-Assembly</span>
                    <span className="font-semibold text-zinc-900">{activeWorkOrder.component}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Dispatch Urgency</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                      <AlertTriangle className="h-3.5 w-3.5" /> {activeWorkOrder.priority}
                    </span>
                  </div>
                </div>

                {/* AI Diagnostic Findings */}
                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 uppercase tracking-wider mb-2">
                    Diagnostic Analysis & Problem Statement
                  </h3>
                  <div className="p-3.5 rounded-xl border-l-4 border-black bg-zinc-50">
                    <p className="text-zinc-800 leading-relaxed font-medium">
                      {activeWorkOrder.diagnosis}
                    </p>
                  </div>
                </div>

                {/* Required Spare Parts */}
                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 uppercase tracking-wider mb-2">
                    Required OEM Replacement Parts & Consumables
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

                {/* Technician Safety & Verification Checklist */}
                <div>
                  <h3 className="font-['Outfit'] font-bold text-sm text-zinc-900 uppercase tracking-wider mb-2">
                    Lockout / Tagout (LOTO) & Operational Checklist
                  </h3>
                  <div className="space-y-2">
                    {activeWorkOrder.checklist.map((item, i) => (
                      <label key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-zinc-50 cursor-pointer">
                        <input type="checkbox" defaultChecked={i === 0} className="rounded accent-black h-4 w-4" />
                        <span className="text-zinc-800">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sign-off Block */}
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
