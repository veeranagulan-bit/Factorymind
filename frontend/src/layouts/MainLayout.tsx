import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show public navbar on login page
  if (location.pathname === '/login') return null;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-transparent',
        scrolled || !isHome
          ? 'bg-industrial-950/80 backdrop-blur-md border-industrial-800 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/20 transition-colors">
            <svg
              className="h-5 w-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-wide text-white">FACTORYMIND</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm font-medium text-industrial-300 hover:text-white transition-colors">
            Home
          </Link>
          <a href="#how-it-works" className="text-sm font-medium text-industrial-300 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#ai-technology" className="text-sm font-medium text-industrial-300 hover:text-white transition-colors">
            AI Technology
          </a>
          <a href="#analytics" className="text-sm font-medium text-industrial-300 hover:text-white transition-colors">
            Analytics
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="rounded-md border border-industrial-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-industrial-800"
          >
            Login
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Simple footer for now */}
      <footer className="border-t border-industrial-800 bg-industrial-950 py-8 text-center text-sm text-industrial-400">
        <p>© 2026 FactoryMind. Intelligent Knowledge for Smarter Manufacturing.</p>
      </footer>
    </div>
  );
}
