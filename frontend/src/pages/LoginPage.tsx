import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-industrial-950">
      {/* Left side: Animated Background */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-industrial-950 overflow-hidden">
        {/* Abstract animated gradient mesh */}
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,#0891b2_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#1e3a8a_0%,transparent_50%)]"
        />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#39405111_1px,transparent_1px),linear-gradient(to_bottom,#39405111_1px,transparent_1px)] bg-[size:2rem_2rem]" />
        
        {/* Floating tech elements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <motion.div 
             animate={{ rotate: 360 }} 
             transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
             className="w-[400px] h-[400px] border border-cyan-500/10 rounded-full border-dashed"
           />
           <motion.div 
             animate={{ rotate: -360 }} 
             transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
             className="absolute w-[300px] h-[300px] border border-blue-500/10 rounded-full border-dotted"
           />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-industrial-950" />
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden lg:overflow-visible">
        {/* Mobile background (hidden on desktop) */}
        <div className="absolute inset-0 lg:hidden z-0 bg-industrial-950">
          <motion.div
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,#0891b2_0%,transparent_40%),radial-gradient(circle_at_80%_70%,#1e3a8a_0%,transparent_50%)]"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10 p-8 rounded-2xl bg-industrial-900/60 backdrop-blur-xl border border-industrial-800 shadow-2xl"
        >
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-cyan-500/10 border border-cyan-500/30">
                <div className="h-3 w-3 bg-cyan-400 rounded-sm" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-industrial-300 hover:text-white transition-colors">FACTORYMIND</span>
            </Link>
            
            <h1 className="text-2xl font-semibold text-white mb-2">Welcome Back</h1>
            <p className="text-industrial-400 text-sm">Sign in to your FactoryMind workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-industrial-300 uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                required
                className="w-full h-11 px-4 rounded-md bg-industrial-950/50 border border-industrial-800 text-white placeholder:text-industrial-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-1 relative">
              <label className="text-xs font-medium text-industrial-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  className="w-full h-11 pl-4 pr-10 rounded-md bg-industrial-950/50 border border-industrial-800 text-white placeholder:text-industrial-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-industrial-500 hover:text-industrial-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-industrial-700 bg-industrial-900 text-cyan-500 focus:ring-cyan-500/30" />
                <span className="text-sm text-industrial-400 group-hover:text-industrial-300 transition-colors">Remember me</span>
              </label>
              
              <a href="#" className="text-sm text-cyan-500 hover:text-cyan-400 transition-colors">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-md bg-white text-black font-semibold hover:bg-industrial-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-industrial-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-industrial-900 px-2 text-industrial-500">OR</span>
            </div>
          </div>

          <button className="mt-6 w-full h-11 flex items-center justify-center gap-2 rounded-md border border-industrial-700 bg-transparent text-white font-medium hover:bg-industrial-800 transition-all">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-industrial-400">
            Don't have an account?{' '}
            <a href="#" className="text-white hover:text-cyan-400 font-medium transition-colors">
              Create Account
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
