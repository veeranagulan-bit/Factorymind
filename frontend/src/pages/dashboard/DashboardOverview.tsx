import { motion } from 'framer-motion';
import { 
  FileText, 
  Database, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Activity,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { name: 'Total Documents', value: '1,248', change: '+12%', icon: FileText, color: 'text-zinc-900', bg: 'bg-[#9fff00]/25' },
  { name: 'Indexed Chunks', value: '45,892', change: '+8%', icon: Database, color: 'text-zinc-900', bg: 'bg-zinc-100' },
  { name: 'Questions Asked', value: '8,439', change: '+24%', icon: MessageSquare, color: 'text-zinc-900', bg: 'bg-[#9fff00]/25' },
  { name: 'AI Accuracy', value: '98.2%', change: '+1.2%', icon: CheckCircle, color: 'text-zinc-900', bg: 'bg-zinc-100' },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Outfit'] text-2xl md:text-3xl font-semibold text-[#1a1a1a] tracking-tight">Overview</h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-1">Welcome back. Knowledge system and diagnostic services are active.</p>
        </div>
        <Link 
          to="/dashboard/assistant"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-xs font-medium text-white transition-all hover:bg-black shadow-xs hover:shadow"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white/80 p-6 backdrop-blur-md shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                {stat.change}
                <ArrowUpRight className="ml-0.5 h-3 w-3" />
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500">{stat.name}</p>
              <p className="mt-1 font-['Outfit'] text-3xl font-semibold text-[#1a1a1a] tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a]">Recent Diagnostics & Queries</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Real-time retrieval stream from knowledge base</p>
            </div>
            <Link to="/dashboard/analytics" className="text-xs font-medium text-zinc-700 hover:text-black flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {[
              { q: "Why is the CNC spindle overheating?", time: "10 mins ago", doc: "Maintenance Manual v2", status: "Resolved" },
              { q: "What should I check when spindle vibration increases?", time: "1 hour ago", doc: "Troubleshooting Guide", status: "Resolved" },
              { q: "Error code E-402 on Fanuc controller", time: "3 hours ago", doc: "Error Codes DB", status: "Resolved" },
              { q: "Recommended coolant mixture ratio", time: "5 hours ago", doc: "SOP-142", status: "Resolved" },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between rounded-xl border border-black/[0.05] bg-white p-4 hover:border-black/[0.1] transition-colors shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-900">{item.q}</p>
                    <div className="mt-1.5 flex items-center gap-3 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {item.time}</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {item.doc}</span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-800">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-2xl border border-black/[0.06] bg-white/80 p-6 md:p-8 backdrop-blur-md shadow-xs">
          <h2 className="font-['Outfit'] text-lg font-semibold text-[#1a1a1a] mb-6">Service Health</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-700">Vector Knowledge Index</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9fff00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9fff00]"></span>
                  </span>
                  Connected
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-[#1a1a1a] rounded-full w-[45%]" />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1.5">45% Capacity utilized</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-700">Embedding Engine</span>
                <span className="text-[11px] font-medium text-emerald-700">Active</span>
              </div>
              <p className="text-xs text-zinc-900 bg-white px-3 py-2 rounded-lg border border-black/[0.06]">
                BGE-Large-En-v1.5
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-700">SLM Neural Pipeline</span>
                <span className="text-[11px] font-medium text-emerald-700">Active</span>
              </div>
              <p className="text-xs text-zinc-900 bg-white px-3 py-2 rounded-lg border border-black/[0.06]">
                FactoryMind-Llama-3-8B (LoRA)
              </p>
            </div>
            
            <div className="pt-4 border-t border-black/[0.06]">
               <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#9fff00]/25 flex items-center justify-center border border-[#9fff00]/40">
                     <Activity className="h-4 w-4 text-zinc-900" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">All Pipelines Operational</p>
                    <p className="text-[11px] text-zinc-500">Continuous telemetry sync</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
