import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Settings, 
  Cpu, 
  Database, 
  BarChart, 
  Bell, 
  Search, 
  Wrench, 
  ArrowUpRight,
  Menu,
  X,
  Volume2
} from 'lucide-react';
import { cn } from '../utils/cn';

const sidebarLinks = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Assistant', path: '/dashboard/assistant', icon: MessageSquare },
  { name: 'Machines (Digital Twin)', path: '/dashboard/machines', icon: Wrench },
  { name: 'Acoustic & FFT', path: '/dashboard/acoustics', icon: Volume2 },
  { name: 'Documents & RAG', path: '/dashboard/documents', icon: FileText },
  { name: 'Knowledge Base', path: '/dashboard/vectordb', icon: Database },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart },
  { name: 'Model Core', path: '/dashboard/model', icon: Cpu },
  { name: 'Architecture', path: '/dashboard/architecture', icon: Settings },
];

export default function DashboardLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-zinc-900 font-sans relative selection:bg-brand-green selection:text-black">
      {/* Ambient background video seamlessly connecting the hero animation */}
      <div className="fixed top-0 right-0 w-[60vw] h-[50vh] pointer-events-none opacity-20 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260603_132049_036591b8-6e92-4760-b94c-a7ea6eef315c.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-base/60 to-bg-base" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-base via-transparent to-transparent" />
      </div>

      {/* Desktop Sidebar (visible on laptop/desktop: lg and above) */}
      <aside className="w-64 flex-shrink-0 border-r border-black/[0.06] bg-white/70 backdrop-blur-xl hidden lg:flex flex-col relative z-20">
        <div className="h-16 flex items-center justify-between px-6 border-b border-black/[0.06]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 fill-[#1a1a1a] transition-transform duration-300 group-hover:rotate-45"
              aria-hidden="true"
            >
              <path d="M12 7.5a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-4.5 4.5a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm9 0a3 3 0 1 0 3-3 3 3 0 0 0-3 3zm-4.5 4.5a3 3 0 1 0 3 3 3 3 0 0 0-3-3z" />
            </svg>
            <span className="font-['Outfit'] font-semibold tracking-tight text-lg text-[#1a1a1a]">
              factorymind
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#9fff00]/25 text-black border border-[#9fff00]/50">
            PRO
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-5 px-3">
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150',
                    isActive 
                      ? 'bg-[#1a1a1a] text-white shadow-sm' 
                      : 'text-zinc-600 hover:bg-black/[0.04] hover:text-[#1a1a1a]'
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-[#9fff00]" : "text-zinc-500")} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 px-3">
            <div className="p-3.5 rounded-xl bg-white/80 border border-black/[0.05] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">System State</span>
                <span className="flex h-2 w-2 rounded-full bg-[#9fff00] ring-4 ring-[#9fff00]/20" />
              </div>
              <p className="text-xs font-semibold text-zinc-800">Knowledge Core v2.4</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">SLM neural pipeline synced</p>
              <Link 
                to="/" 
                className="mt-3 text-[11px] font-medium text-zinc-700 hover:text-black flex items-center gap-1 group"
              >
                Return to Landing <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-black/[0.06] bg-white/40">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center text-xs font-medium">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-900 truncate">John Doe</p>
              <p className="text-[10px] text-zinc-500 truncate">Senior Specialist</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (visible when hamburger clicked on phones) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[85vw] h-full bg-white shadow-2xl z-10 flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-6 border-b border-black/[0.06]">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <span className="font-['Outfit'] font-semibold tracking-tight text-lg text-[#1a1a1a]">
                    factorymind
                  </span>
                </Link>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors',
                        isActive 
                          ? 'bg-[#1a1a1a] text-white shadow-xs' 
                          : 'text-zinc-700 hover:bg-black/[0.04]'
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive ? "text-[#9fff00]" : "text-zinc-500")} />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-black/[0.06] bg-zinc-50">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium text-zinc-600 hover:text-black flex items-center justify-between"
                >
                  <span>Return to Landing Page</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-10">
        {/* Topbar: Responsive for Phone & Laptop */}
        <header className="h-14 sm:h-16 flex items-center justify-between border-b border-black/[0.06] bg-white/70 backdrop-blur-md px-4 sm:px-8">
          <div className="flex items-center gap-3 flex-1">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-zinc-700 hover:bg-black/[0.05] transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo */}
            <Link to="/" className="lg:hidden flex items-center gap-1.5 font-['Outfit'] font-semibold text-base text-[#1a1a1a]">
              <span>factorymind</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-[#9fff00]/25 text-black border border-[#9fff00]/40">
                PRO
              </span>
            </Link>

            {/* Desktop Search Capsule */}
            <div className="relative w-80 md:w-96 hidden md:block">
              <div className="bg-white rounded-[6px] border border-black/[0.06] p-1 pl-3.5 flex items-center shadow-xs">
                <Search className="h-3.5 w-3.5 text-zinc-400 mr-2.5 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search resources, documents, logs..." 
                  className="w-full bg-transparent text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="text-zinc-600 hover:text-black p-2 rounded-full hover:bg-black/[0.04] transition-colors relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-[#9fff00] ring-2 ring-white" />
            </button>
            <div className="h-4 w-px bg-black/[0.08] hidden sm:block mx-1" />
            <Link
              to="/"
              className="hidden sm:inline-block text-xs text-zinc-600 hover:text-black font-medium transition-colors"
            >
              Home
            </Link>
          </div>
        </header>

        {/* Scrollable Content Container with Phone and Laptop Padding */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* Mobile Sticky Bottom Navigation Bar (Phones Only) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-black/[0.08] px-3 flex items-center justify-around z-30 shadow-lg">
          <Link
            to="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors py-1 px-2 rounded-lg",
              location.pathname === '/dashboard' ? "text-black font-bold" : "text-zinc-500"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Overview</span>
          </Link>
          <Link
            to="/dashboard/assistant"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors py-1 px-2 rounded-lg relative",
              location.pathname.startsWith('/dashboard/assistant') ? "text-black font-bold" : "text-zinc-500"
            )}
          >
            <span className="relative">
              <MessageSquare className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#9fff00] ring-1 ring-white" />
            </span>
            <span>AI Chat</span>
          </Link>
          <Link
            to="/dashboard/machines"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors py-1 px-2 rounded-lg",
              location.pathname.startsWith('/dashboard/machines') ? "text-black font-bold" : "text-zinc-500"
            )}
          >
            <Wrench className="h-4 w-4" />
            <span>3D Fleet</span>
          </Link>
          <Link
            to="/dashboard/acoustics"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors py-1 px-2 rounded-lg",
              location.pathname.startsWith('/dashboard/acoustics') ? "text-black font-bold" : "text-zinc-500"
            )}
          >
            <Volume2 className="h-4 w-4" />
            <span>FFT Audio</span>
          </Link>
          <Link
            to="/dashboard/documents"
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors py-1 px-2 rounded-lg",
              location.pathname.startsWith('/dashboard/documents') ? "text-black font-bold" : "text-zinc-500"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>Docs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
