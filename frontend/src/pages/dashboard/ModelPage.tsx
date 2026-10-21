import { Cpu, Zap, RefreshCw } from 'lucide-react';

export default function ModelPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
            Small Language Model (SLM) Core
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Configure, inspect, and benchmark on-premise neural inference for CNC diagnostic telemetry.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Model Card */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-[#9fff00]" />
                </div>
                <div>
                  <h2 className="font-['Outfit'] text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                    FactoryMind-SLM v2.4
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#9fff00]/25 text-black border border-[#9fff00]/40">
                      Active
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Custom LoRA adapter fine-tuned on industrial machining manuals</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-black/[0.04]">
                <span className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Base Model</span>
                <span className="text-xs font-semibold text-zinc-900">Llama-3-8B-Instruct</span>
              </div>
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-black/[0.04]">
                <span className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Fine-Tuning</span>
                <span className="text-xs font-semibold text-zinc-900">QLoRA Rank-64</span>
              </div>
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-black/[0.04]">
                <span className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Quantization</span>
                <span className="text-xs font-semibold text-zinc-900">4-bit AWQ Engine</span>
              </div>
              <div className="bg-zinc-50 p-3.5 rounded-xl border border-black/[0.04]">
                <span className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">Context Length</span>
                <span className="text-xs font-semibold text-zinc-900">8,192 tokens</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-600">Model Inference Latency (TTFT)</span>
                  <span className="text-zinc-900 font-semibold">18ms average</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[25%]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-600">GPU VRAM Utilization</span>
                  <span className="text-zinc-900 font-semibold">5.8 GB / 12 GB (48%)</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a1a1a] rounded-full w-[48%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inference Controls */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] mb-6 flex items-center gap-2">
            <Zap className="h-4 w-4 text-zinc-600" />
            Runtime Parameters
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-600 block mb-1">Temperature (Precision)</label>
              <input type="range" min="0" max="1" step="0.05" defaultValue="0.2" className="w-full accent-black" />
              <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                <span>0.0 (Strict Manuals)</span>
                <span className="font-semibold text-zinc-800">0.20</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Context Window</span>
                <span className="font-semibold text-zinc-900">4,096 tokens</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600">Safety Guardrails</span>
                <span className="text-emerald-700 font-semibold">Active & Enforced</span>
              </div>
            </div>

            <button className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-xs font-medium transition-colors shadow-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Reload Model Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
