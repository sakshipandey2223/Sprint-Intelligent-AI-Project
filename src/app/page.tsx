'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

type AuthState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

export default function Home() {
  const router = useRouter();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Auth Flow States
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progressVal, setProgressVal] = useState(0);
  const [shake, setShake] = useState(false);

  // Digital matrix dot states (flanking columns)
  const [leftMatrix, setLeftMatrix] = useState<boolean[][]>([]);
  const [rightMatrix, setRightMatrix] = useState<boolean[][]>([]);

  useEffect(() => {
    // Initialize 6x18 matrix of random binary dots
    const createMatrix = () => 
      Array.from({ length: 18 }, () => 
        Array.from({ length: 6 }, () => Math.random() > 0.65)
      );
    
    setLeftMatrix(createMatrix());
    setRightMatrix(createMatrix());

    // Periodically pulse/flicker the dots
    const interval = setInterval(() => {
      setLeftMatrix(createMatrix());
      setRightMatrix(createMatrix());
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthState('error');
      setErrorMessage('A valid workspace ID is required.');
      triggerShake();
      return;
    }
    if (password.length < 4) {
      setAuthState('error');
      setErrorMessage('Keyphrase must be at least 4 characters.');
      triggerShake();
      return;
    }

    setAuthState('scanning');
    setErrorMessage('');
    setProgressVal(0);

    let progress = 0;
    const timer = setInterval(() => {
      progress += 10;
      setProgressVal(progress);
      if (progress === 40) setAuthState('verifying');
      if (progress >= 100) {
        clearInterval(timer);
        setAuthState('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    }, 150);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#010816] text-[#f8fafc] flex items-center justify-center overflow-hidden font-sans">
      
      {/* ── BACKGROUND SCI-FI FINE GRID ── */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-55"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 162, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 162, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── AMBIENT NEON GLOW CENTER BLURS ── */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[500px] h-[350px] rounded-full bg-gradient-to-r from-cyan-500/25 to-blue-600/15 blur-[130px] opacity-80" />
      </div>

      {/* ── ROTATING CYBERNETIC HUD RINGS (Behind the card, z-0) ── */}
      <div className="absolute pointer-events-none z-0 flex items-center justify-center w-[480px] h-[480px] opacity-25">
        {/* Outer Ring */}
        <svg width="480" height="480" viewBox="0 0 480 480" className="absolute animate-spin-slow">
          <circle cx="240" cy="240" r="220" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="6 24" />
        </svg>
        {/* Inner Ring (Reverse Rotation) */}
        <svg width="480" height="480" viewBox="0 0 480 480" className="absolute animate-spin-reverse-slow">
          <circle cx="240" cy="240" r="180" fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeDasharray="40 20" />
        </svg>
      </div>

      {/* ── CENTRALIZED CYBERNETIC LOGIN GATEPORTAL ── */}
      <div className="relative z-10 flex items-center justify-center w-full max-w-5xl px-4 py-8">
        
        {/* ── BACKGROUND LAYER FOR CIRCUITS & MATRIX DOTS ── */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          
          {/* Left Hand Circuit & Dots */}
          <div className="hidden md:flex items-center absolute right-[50%] mr-[215px]">
            {/* Digital Dot Matrix */}
            <div className="grid grid-cols-6 gap-1 opacity-50 pr-8">
              {leftMatrix.map((row, rIdx) => 
                row.map((active, cIdx) => (
                  <span 
                    key={`${rIdx}-${cIdx}`} 
                    className={`w-1.5 h-1.5 rounded-sm transition-all duration-300 ${
                      active ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]' : 'bg-cyan-950/20'
                    }`}
                  />
                ))
              )}
            </div>

            {/* Circuit Trace SVG */}
            <svg width="220" height="280" viewBox="0 0 220 280" className="overflow-visible">
              {/* Static Background Lines */}
              <path d="M 0 50 L 120 50 L 180 140 L 220 140" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="1.5" />
              <path d="M 40 140 L 220 140" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1.5" />
              <path d="M 0 230 L 120 230 L 180 140" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="1.5" />
              
              {/* Flowing Laser Signal Packets */}
              <path d="M 0 50 L 120 50 L 180 140 L 220 140" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="15 150" className="flow-line" />
              <path d="M 40 140 L 220 140" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="15 150" className="flow-line" style={{ animationDelay: '1.5s' }} />
              <path d="M 0 230 L 120 230 L 180 140" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="15 150" className="flow-line" style={{ animationDelay: '0.8s' }} />

              <circle cx="0" cy="50" r="3" fill="#00e5ff" />
              <circle cx="0" cy="230" r="3" fill="#00e5ff" />
            </svg>
          </div>

          {/* Right Hand Circuit & Dots */}
          <div className="hidden md:flex items-center absolute left-[50%] ml-[215px]">
            {/* Circuit Trace SVG */}
            <svg width="220" height="280" viewBox="0 0 220 280" className="overflow-visible">
              {/* Static Background Lines */}
              <path d="M 220 50 L 100 50 L 40 140 L 0 140" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="1.5" />
              <path d="M 180 140 L 0 140" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1.5" />
              <path d="M 220 230 L 100 230 L 40 140" fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="1.5" />

              {/* Flowing Laser Signal Packets */}
              <path d="M 220 50 L 100 50 L 40 140 L 0 140" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="15 150" className="flow-line" />
              <path d="M 180 140 L 0 140" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="15 150" className="flow-line" style={{ animationDelay: '1.2s' }} />
              <path d="M 220 230 L 100 230 L 40 140" fill="none" stroke="#00e5ff" strokeWidth="2" strokeDasharray="15 150" className="flow-line" style={{ animationDelay: '0.5s' }} />

              <circle cx="220" cy="50" r="3" fill="#00e5ff" />
              <circle cx="220" cy="230" r="3" fill="#00e5ff" />
            </svg>

            {/* Digital Dot Matrix */}
            <div className="grid grid-cols-6 gap-1 opacity-50 pl-8">
              {rightMatrix.map((row, rIdx) => 
                row.map((active, cIdx) => (
                  <span 
                    key={`${rIdx}-${cIdx}`} 
                    className={`w-1.5 h-1.5 rounded-sm transition-all duration-300 ${
                      active ? 'bg-cyan-400 shadow-[0_0_8px_#00e5ff]' : 'bg-cyan-950/20'
                    }`}
                  />
                ))
              )}
            </div>
          </div>

        </div>

        {/* ── MAIN CENTRAL CYBER LOGIN CARD (Higher z-index and solid background) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-[390px] p-8 border-2 border-cyan-500 rounded-2xl shadow-[0_0_35px_rgba(0,229,255,0.35)] z-20 ${
            shake ? 'animate-shake' : ''
          }`}
          style={{
            background: '#020d1c', // Solid background color overrides any crossing SVG lines
          }}
        >
          {/* Cyber decoration brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

          {/* Login Mode Label */}
          <div className="text-center mb-6">
            <span className="font-mono text-sm tracking-[0.25em] text-cyan-400 font-extrabold shadow-[0_0_8px_rgba(0,229,255,0.4)]">
              LOGIN
            </span>
          </div>

          {/* Scanning decryption screen */}
          <AnimatePresence>
            {(authState === 'scanning' || authState === 'verifying' || authState === 'success') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/98 rounded-2xl z-30 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-full border border-cyan-500/35 flex items-center justify-center">
                    {authState === 'success' ? (
                      <ShieldCheck className="w-7 h-7 text-cyan-400" />
                    ) : (
                      <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
                    )}
                  </div>
                  {authState !== 'success' && (
                    <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-125 animate-ping" />
                  )}
                </div>

                <span className="font-mono text-[10px] font-bold tracking-widest text-[#F8FAFC] block">
                  {authState === 'scanning' && 'SCANNING VERIFICATION INDEX...'}
                  {authState === 'verifying' && 'DECRYPTING RSA HANDSHAKE...'}
                  {authState === 'success' && 'ACCESS GRANTED'}
                </span>

                <div className="w-40 h-1 bg-cyan-950/80 rounded-full mt-4 overflow-hidden relative border border-cyan-800/20">
                  <motion.div
                    className="h-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressVal}%` }}
                    transition={{ ease: 'easeInOut' }}
                  />
                </div>

                <span className="font-mono text-[8px] text-slate-500 mt-2 block">
                  {authState === 'scanning' && `Parsing profile index: ${progressVal}%`}
                  {authState === 'verifying' && 'Syncing database variables...'}
                  {authState === 'success' && 'Routing workspace session...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Error Message */}
            {authState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-500/40 text-red-300 text-[11px]"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Email Field (No overlapping icons, clear left padding) */}
            <div className="relative">
              <input
                type="email"
                required
                placeholder="Identity (Email)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#020e1f] hover:bg-[#03152e] border-b-2 border-cyan-850 focus:border-cyan-400 rounded-lg px-4 py-2.5 text-xs text-[#F8FAFC] outline-none transition-all placeholder:text-cyan-850/80 font-mono"
              />
            </div>

            {/* Password Field (No overlapping icons, clear left padding) */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Keyphrase (Password)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#020e1f] hover:bg-[#03152e] border-b-2 border-cyan-850 focus:border-cyan-400 rounded-lg pl-4 pr-10 py-2.5 text-xs text-[#F8FAFC] outline-none transition-all placeholder:text-cyan-850/80 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-850 hover:text-cyan-400 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Credentials hint */}
            <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/30 text-cyan-500/70 text-[9px] leading-relaxed text-center font-mono">
              Use any valid email (e.g. <span className="text-cyan-300 font-bold">admin@intel.ai</span>) and pass &ge; 4 chars.
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full relative flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/10 cursor-pointer overflow-hidden border border-cyan-400/40"
            >
              <span>ACCESS WORKSPACE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </form>

        </motion.div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }

        /* SVG Circuit signal flow animation */
        @keyframes flow {
          0% { stroke-dashoffset: 165; }
          100% { stroke-dashoffset: -165; }
        }
        .flow-line {
          animation: flow 3.5s linear infinite;
        }

        /* Slowly spinning background HUD rings */
        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse-slow {
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 24s linear infinite;
        }
        .animate-spin-reverse-slow {
          animation: spin-reverse-slow 28s linear infinite;
        }
      `}</style>
    </div>
  );
}
