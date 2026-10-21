import { Database, Activity, Settings, Search, CheckCircle2 } from 'lucide-react';

export default function VectorDatabasePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-zinc-900">
      {/* Header with High-Contrast Typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">
            Knowledge Base & Vector Store
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">
            Manage vector embeddings, Qdrant index configuration, and semantic search pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full border border-black/[0.06] shadow-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-700">Database Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Configuration Card */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] flex items-center gap-2">
              <Settings className="h-4 w-4 text-zinc-600" />
              Engine Configuration
            </h2>
            <button className="text-xs font-medium text-zinc-700 hover:text-black border border-black/[0.08] px-3 py-1 rounded-full hover:bg-zinc-50 transition-colors">
              Edit Settings
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between py-3 border-b border-black/[0.05]">
              <span className="text-xs font-medium text-zinc-500">Vector Database</span>
              <span className="text-xs font-semibold text-[#1a1a1a] bg-zinc-100 px-2.5 py-1 rounded-md">Qdrant v1.7.0</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-black/[0.05]">
              <span className="text-xs font-medium text-zinc-500">Embedding Model</span>
              <span className="text-xs font-semibold text-[#1a1a1a]">BAAI/bge-large-en-v1.5</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-black/[0.05]">
              <span className="text-xs font-medium text-zinc-500">Vector Dimension</span>
              <span className="text-xs font-semibold text-[#1a1a1a]">1024 float32</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-black/[0.05]">
              <span className="text-xs font-medium text-zinc-500">Distance Metric</span>
              <span className="text-xs font-semibold text-[#1a1a1a]">Cosine Similarity</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-xs font-medium text-zinc-500">Host URL</span>
              <span className="text-xs font-mono font-medium text-zinc-800 truncate bg-zinc-50 px-2 py-0.5 rounded border border-black/[0.04]">
                tcp://qdrant.factorymind.internal:6333
              </span>
            </div>
          </div>
        </div>

        {/* Storage Stats Card */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] flex items-center gap-2 mb-6">
            <Database className="h-4 w-4 text-zinc-600" />
            Storage & Index Allocation
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-50 p-4 rounded-xl border border-black/[0.05]">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                Total Vectors
              </span>
              <span className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a]">
                45,892
              </span>
            </div>
            <div className="bg-zinc-50 p-4 rounded-xl border border-black/[0.05]">
              <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block mb-1">
                Index Size
              </span>
              <span className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a]">
                142.8 MB
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-600">Index Status</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Fully Optimized
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-full rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-600">Memory Allocation</span>
                <span className="text-[#1a1a1a] font-semibold">45% (3.6 GB / 8.0 GB)</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a1a1a] rounded-full w-[45%]" />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-black/[0.06] text-xs text-zinc-500 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-zinc-600" />
            Last optimized: Today at 04:00 AM UTC
          </div>
        </div>
      </div>

      {/* Semantic Search Sandbox Card */}
      <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
        <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] flex items-center gap-2 mb-1.5">
          <Search className="h-4 w-4 text-zinc-600" />
          Test Retrieval (Vector Sandbox)
        </h2>
        <p className="text-xs text-zinc-500 mb-6">
          Query the embedding model and vector search pipeline directly to verify cosine similarity scoring.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 bg-white rounded-[6px] border border-black/[0.08] p-1 pl-3.5 flex items-center shadow-xs">
            <Search className="h-3.5 w-3.5 text-zinc-400 mr-2.5 shrink-0" />
            <input 
              type="text" 
              placeholder="Enter a test query (e.g. 'spindle alignment procedure', 'coolant concentration')..." 
              className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-1.5"
            />
          </div>
          <button className="px-5 py-2.5 rounded-full bg-[#1a1a1a] hover:bg-black text-white text-xs font-medium transition-colors shadow-xs shrink-0">
            Run Test Query
          </button>
        </div>
      </div>
    </div>
  );
}
