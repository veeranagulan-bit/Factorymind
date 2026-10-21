import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState<'pl' | 'en'>('en');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/dashboard/assistant?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/dashboard/assistant');
    }
  };

  return (
    <section className="relative min-h-[110vh] sm:min-h-[140vh] w-full flex flex-col items-center justify-start overflow-hidden bg-bg-base">
      {/* Background Video Container */}
      <div className="absolute top-[15vh] sm:top-[20vh] left-0 w-full h-[95vh] sm:h-[120vh] z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-100"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4"
        />
        {/* Gradient Mask to smoothly blend video into #EDEEF5 background */}
        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-bg-base to-transparent" />
      </div>

      {/* Hero Content Alignment */}
      <div className="max-w-7xl w-full mx-auto px-8 md:px-16 lg:px-20 relative z-10 grid grid-cols-12 gap-x-4 md:gap-x-8 pt-[24vh] sm:pt-[28vh]">
        <div className="col-span-12 md:col-span-10 md:col-start-2">
          {/* Hero Header */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-['Outfit'] font-normal text-3xl sm:text-4xl md:text-5xl lg:text-[54px] tracking-tight leading-[1.25] md:leading-[1.18]"
          >
            <span className="text-[#1a1a1a]">FactoryMind offers </span>
            <span className="text-[#8e8e8e]">instant knowledge</span>
            <br className="hidden sm:inline" />{' '}
            <span className="text-[#8e8e8e]">and diagnostics to help you maintain</span>
            <br className="hidden sm:inline" />{' '}
            <span className="text-[#8e8e8e]">your </span>
            {/* Eye Icon Pupil UI Element */}
            <span className="w-[28px] md:w-[42px] lg:w-[62px] h-[18px] md:h-[26px] lg:h-[34px] border-[2px] border-[#1a1a1a] rounded-full inline-flex items-center justify-center align-middle mx-1 md:mx-1.5 bg-transparent">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#1a1a1a]" />
            </span>
            <span className="text-[#8e8e8e]"> CNC machinery.</span>
          </motion.h1>

          {/* Search Pill Component */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 sm:mt-10 max-w-md w-full"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-[6px] border border-black/[0.05] p-1 pl-4 flex items-center shadow-sm hover:shadow-md transition-shadow"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about error codes, spindle heat, coolant ratio..."
                className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-1"
              />
              <button
                type="submit"
                aria-label="Submit query"
                className="bg-[#1a1a1a] hover:bg-black text-white w-9 h-9 rounded-full relative flex items-center justify-center transition-colors shrink-0"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-none stroke-currentColor stroke-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Architectural Edge Anchors */}
      {/* Absolute middle right edge: language switching (en — de) */}
      <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={() => setLang(lang === 'en' ? 'pl' : 'en')}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-[#1a1a1a] bg-white/70 backdrop-blur-md border border-black/[0.06] shadow-sm hover:bg-white hover:shadow transition-all flex items-center gap-1.5"
        >
          <span className={lang === 'pl' ? 'font-bold text-[#1a1a1a]' : 'text-zinc-500'}>en</span>
          <span className="text-zinc-400">—</span>
          <span className={lang === 'en' ? 'font-bold text-[#1a1a1a]' : 'text-zinc-500'}>de</span>
        </button>
      </div>

      {/* Absolute bottom left corner */}
      <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 z-20 text-[11px] font-medium tracking-wider text-zinc-500 uppercase select-none">
        FACTORYMIND OS
      </div>

      {/* Absolute bottom right corner */}
      <div className="absolute bottom-6 sm:bottom-10 right-6 sm:right-12 z-20 text-[11px] font-medium tracking-wider text-zinc-500 uppercase select-none">
        CNC DIAGNOSTIC INTELLIGENCE
      </div>
    </section>
  );
}
