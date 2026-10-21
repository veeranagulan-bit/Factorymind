import { motion } from 'framer-motion';
import { 
  Search, 
  Clock, 
  FileText, 
  ArrowRight,
  Database,
  Cpu,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ThreeDCore from '../components/ThreeDCore';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-industrial-950 pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3940511a_1px,transparent_1px),linear-gradient(to_bottom,#3940511a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          {/* Scanning Line Effect */}
          <motion.div 
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-sm"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-industrial-900/80 border border-industrial-800 text-cyan-400 text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Next-Gen Manufacturing AI</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6"
            >
              Intelligent <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Knowledge
              </span> <br/>
              for Smarter Manufacturing
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-industrial-400 mb-10 max-w-xl leading-relaxed"
            >
              The domain-specific AI assistant for CNC milling machine maintenance, troubleshooting, and operations.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)]"
              >
                Launch Platform
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/dashboard/architecture" className="w-full sm:w-auto px-8 py-4 rounded-lg bg-industrial-900 border border-industrial-800 text-white text-center font-medium hover:bg-industrial-800 transition-colors">
                View Architecture
              </Link>
            </motion.div>
          </div>

          {/* 3D Animation Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <ThreeDCore />
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-industrial-400 uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-industrial-400 to-transparent" />
        </motion.div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-industrial-950 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Manufacturing Knowledge Shouldn't Be Hard to Find.
            </h2>
            <p className="text-industrial-400 max-w-2xl mx-auto text-lg">
              Traditional document retrieval creates bottlenecks on the factory floor.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: "Manual Search", desc: "Technicians spend valuable time searching through large machine manuals." },
              { icon: Clock, title: "Machine Downtime", desc: "Delayed troubleshooting can increase machine downtime and production loss." },
              { icon: FileText, title: "Scattered Knowledge", desc: "Maintenance procedures, SOPs and troubleshooting information are distributed across multiple documents." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }
                }}
                className="p-8 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-industrial-700 transition-colors group"
              >
                <div className="h-12 w-12 rounded-lg bg-industrial-800 flex items-center justify-center mb-6 group-hover:bg-cyan-900/30 group-hover:text-cyan-400 transition-colors">
                  <item.icon className="h-6 w-6 text-industrial-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-industrial-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution & AI Tech */}
      <section id="ai-technology" className="py-24 bg-industrial-900 border-y border-industrial-800 px-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Meet FactoryMind
            </h2>
            <p className="text-industrial-400 max-w-3xl mx-auto text-lg">
              FactoryMind uses domain-specific AI to understand CNC milling machine documentation and provide fast, context-aware answers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Cpu, name: "Small Language Model", desc: "Generates domain-aware natural language responses." },
              { icon: Search, name: "Transformer", desc: "Understands contextual relationships within language." },
              { icon: Database, name: "Embeddings", desc: "Converts text into meaningful numerical representations." },
              { icon: Database, name: "Vector Database", desc: "Stores embeddings and enables semantic similarity search." },
              { icon: MessageSquare, name: "RAG", desc: "Retrieves relevant documentation before generating an answer." },
              { icon: Cpu, name: "Fine-Tuning", desc: "Adapts the model to CNC manufacturing terminology and response style." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, delay: i * 0.05 } }
                }}
                className="p-6 rounded-xl bg-industrial-950/50 border border-industrial-800 hover:border-cyan-900/50 hover:bg-industrial-900 transition-all backdrop-blur-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-10 w-10 rounded bg-cyan-900/20 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                </div>
                <p className="text-sm text-industrial-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-industrial-950 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-industrial-400 text-lg">
              From manual to instant knowledge in 5 steps.
            </p>
          </motion.div>

          <div className="space-y-12">
            {[
              { step: "01", title: "Upload Documents", desc: "Users upload CNC manuals, Maintenance guides, SOPs, Error-code documentation, and Safety manuals." },
              { step: "02", title: "Process & Chunk", desc: "The system extracts text and divides large documents into meaningful chunks." },
              { step: "03", title: "Generate Embeddings", desc: "Transformer-based embedding models convert document chunks into numerical vectors." },
              { step: "04", title: "Semantic Retrieval", desc: "The Vector Database finds the most relevant information when a user asks a question." },
              { step: "05", title: "Generate Answer", desc: "The SLM uses the retrieved context to generate a clear answer." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
                className="flex flex-col md:flex-row gap-6 items-start md:items-center"
              >
                <div className="text-5xl font-bold text-industrial-800 md:w-32">{item.step}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-industrial-400 text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
