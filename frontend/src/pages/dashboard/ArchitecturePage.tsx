import { motion } from 'framer-motion';
import { 
  Server, 
  Database, 
  Cpu, 
  Layers,
  ArrowDown,
  ShieldCheck
} from 'lucide-react';

export default function ArchitecturePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">System Architecture & Pipeline</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">End-to-end data flow from operator input to vector retrieval and SLM inference.</p>
        </div>
      </div>

      <div className="bg-white/80 border border-black/[0.06] rounded-2xl p-8 md:p-12 max-w-3xl mx-auto backdrop-blur-md shadow-xs">
        <div className="flex flex-col items-center justify-center space-y-4">
          
          {/* Frontend Layer */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-72 bg-zinc-50 border border-black/[0.08] rounded-xl p-4 text-center shadow-xs"
          >
            <Layers className="h-5 w-5 text-zinc-800 mx-auto mb-1.5" />
            <h3 className="text-xs font-semibold text-zinc-900">React 19 + Vite Frontend</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Tailwind v4 · Framer Motion · Three.js</p>
          </motion.div>

          <ArrowDown className="h-5 w-5 text-zinc-400" />

          {/* API Gateway */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-72 bg-zinc-50 border border-black/[0.08] rounded-xl p-4 text-center shadow-xs"
          >
            <Server className="h-5 w-5 text-zinc-800 mx-auto mb-1.5" />
            <h3 className="text-xs font-semibold text-zinc-900">Spring Boot REST API</h3>
            <p className="text-[11px] text-zinc-500 mt-0.5">Auth / Session Guard / Telemetry Routing</p>
          </motion.div>

          <ArrowDown className="h-5 w-5 text-zinc-400" />

          {/* Dual Engine: Vector & Neural Core */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-black/[0.08] rounded-xl p-4 text-center shadow-xs"
            >
              <Database className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
              <h3 className="text-xs font-semibold text-zinc-900">Qdrant Vector DB</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">BGE-Large-En-v1.5 Embeddings</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-black/[0.08] rounded-xl p-4 text-center shadow-xs"
            >
              <Cpu className="h-5 w-5 text-[#1a1a1a] mx-auto mb-1.5" />
              <h3 className="text-xs font-semibold text-zinc-900">Fine-Tuned SLM Core</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Llama-3-8B QLoRA 4-bit Engine</p>
            </motion.div>
          </div>

          <ArrowDown className="h-5 w-5 text-zinc-400" />

          {/* Machine Fleet */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-72 bg-[#1a1a1a] text-white rounded-xl p-4 text-center shadow-md"
          >
            <ShieldCheck className="h-5 w-5 text-[#9fff00] mx-auto mb-1.5" />
            <h3 className="text-xs font-semibold text-white">CNC Workshop Fleet</h3>
            <p className="text-[11px] text-zinc-300 mt-0.5">Fanuc · Mazak · Haas · Okuma Telemetry</p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
