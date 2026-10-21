import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'diagnostics', href: '/dashboard/assistant' },
    { name: 'machine fleet', href: '/dashboard/machines' },
    { name: 'documents', href: '/dashboard/documents' },
    { name: 'architecture', href: '/dashboard/architecture' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-6 md:py-10 bg-gradient-to-b from-[#f1f1f1]/80 to-transparent backdrop-blur-[2px]">
      <div className="grid grid-cols-12 max-w-7xl mx-auto px-6 md:px-12 items-center">
        {/* Left (Cols 1-3) */}
        <div className="col-span-6 md:col-span-3 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 group">
            {/* Geometric industrial clover SVG icon */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-5 h-5 fill-[#1a1a1a] transition-transform duration-300 group-hover:rotate-45"
              aria-hidden="true"
            >
              <path d="M12 7.5a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-4.5 4.5a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm9 0a3 3 0 1 0 3-3 3 3 0 0 0-3 3zm-4.5 4.5a3 3 0 1 0 3 3 3 3 0 0 0-3-3z" />
            </svg>
            <span className="font-['Outfit'] text-xl font-medium tracking-tight text-[#1a1a1a]">
              factorymind
            </span>
          </Link>
        </div>

        {/* Center (Cols 4-9): Desktop-only nav links */}
        <div className="hidden md:flex col-span-6 items-center justify-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-xs font-normal text-zinc-600 hover:text-[#1a1a1a] lowercase transition-colors tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right (Cols 10-12) */}
        <div className="col-span-6 md:col-span-3 flex items-center justify-end gap-5">
          <Link
            to="/dashboard/assistant"
            className="hidden sm:inline-block text-xs font-normal text-zinc-600 hover:text-[#1a1a1a] lowercase transition-colors"
          >
            technician portal
          </Link>
          <Link
            to="/dashboard"
            className="bg-[#1a1a1a] hover:bg-black text-white text-xs px-4 py-2.5 rounded-full font-medium transition-all duration-200 hover:shadow-md flex items-center gap-1.5"
          >
            <span>launch console</span>
            <span className="text-[13px] leading-none">→</span>
          </Link>

          {/* Animated Hamburger Toggle for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 text-[#1a1a1a]"
          >
            <motion.span
              animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-[#1a1a1a] rounded-full transition-transform"
            />
            <motion.span
              animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="w-5 h-0.5 bg-[#1a1a1a] rounded-full"
            />
            <motion.span
              animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="w-5 h-0.5 bg-[#1a1a1a] rounded-full transition-transform"
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[#EDEEF5]/95 backdrop-blur-md border-b border-black/[0.06] mt-4 px-6 py-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-zinc-700 hover:text-[#1a1a1a] lowercase py-1"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                <Link
                  to="/dashboard/assistant"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs text-zinc-600 lowercase"
                >
                  technician portal
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#1a1a1a] text-white text-xs px-4 py-2 rounded-full font-medium"
                >
                  launch console →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
