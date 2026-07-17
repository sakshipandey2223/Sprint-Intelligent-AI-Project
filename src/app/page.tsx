'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Activity, Sparkles, AlertCircle, Cpu, ShieldCheck
} from 'lucide-react';

// --- Types ---
type AuthState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

export default function Home() {
  const router = useRouter();

  // --- Form States ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // --- Auth Flow States ---
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progressVal, setProgressVal] = useState(0);
  const [shake, setShake] = useState(false);

  // Canvas ref for background particles
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Canvas Neural Network Particle System (GPU Optimized) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 16000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.10)'
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 130) * 0.05})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Form Submission Flow ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthState('error');
      setErrorMessage('Please enter a valid workspace email address.');
      triggerShake();
      return;
    }
    if (password.length < 4) {
      setAuthState('error');
      setErrorMessage('Passphrase must be at least 4 characters long.');
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
      if (progress === 40) {
        setAuthState('verifying');
      }
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
    <div className="relative min-h-screen w-screen bg-[#020617] text-[#F8FAFC] flex items-center justify-center overflow-hidden font-sans">
      
      {/* ── BACKGROUND CANVAS (Neural Network Particles) ── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      {/* ── GLOWING AURORA SPHERES ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-[#22C55E]/8 to-transparent blur-[130px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-indigo-600/8 to-transparent blur-[120px]" />
      </div>

      {/* ── CENTRAL LAYOUT CONTAINER (Bento Style) ── */}
      <div className="relative z-10 w-full max-w-6xl min-h-[620px] mx-4 grid grid-cols-1 lg:grid-cols-12 rounded-[24px] border border-[#334155]/60 bg-gradient-to-b from-[#020617]/85 to-[#0F172A]/85 backdrop-blur-3xl shadow-2xl overflow-hidden">
        
        {/* ── LEFT PANEL: LOGO & AUTH PORTAL (5 Columns) ── */}
        <div className="lg:col-span-5 p-8 flex flex-col justify-between border-r border-[#334155]/50 bg-slate-950/40 relative">
          
          {/* Top: Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22C55E] to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-sm font-extrabold tracking-wider text-[#22C55E] uppercase block leading-none">Sprint Intel</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest">AG-UC-0010</span>
            </div>
          </div>

          {/* Middle: Login Form Content */}
          <div className="my-auto py-8">
            <div className={`transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
              
              {/* Titles */}
              <div className="mb-6">
                <span className="pill pill-green mb-3">WORKSPACE VERIFICATION</span>
                <h2 className="text-2xl font-extrabold tracking-tight text-white mt-1">
                  Authenticate ID
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  Provide credentials to establish analytical data sync.
                </p>
              </div>

              {/* Loader Overlay (Auth Flow) */}
              <AnimatePresence>
                {(authState === 'scanning' || authState === 'verifying' || authState === 'success') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/98 backdrop-blur-md rounded-l-[24px] z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="relative mb-5">
                      <div className="w-14 h-14 rounded-full border border-[#22C55E]/30 flex items-center justify-center">
                        {authState === 'success' ? (
                          <ShieldCheck className="w-8 h-8 text-[#22C55E] animate-bounce" />
                        ) : (
                          <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                        )}
                      </div>
                      {authState !== 'success' && (
                        <div className="absolute inset-0 border border-indigo-500/20 rounded-full scale-125 animate-ping" />
                      )}
                    </div>

                    <span className="font-mono text-xs font-bold tracking-widest text-[#F8FAFC] block">
                      {authState === 'scanning' && 'SCANNING VERIFICATION INDEX...'}
                      {authState === 'verifying' && 'ESTABLISHING HANDSHAKE...'}
                      {authState === 'success' && 'ACCESS AUTORIZED'}
                    </span>

                    {/* Progress Slider */}
                    <div className="w-40 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#22C55E] to-indigo-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progressVal}%` }}
                        transition={{ ease: 'easeInOut' }}
                      />
                    </div>

                    <span className="font-mono text-[9px] text-slate-500 mt-2 block">
                      {authState === 'scanning' && `Parsing security parameters: ${progressVal}%`}
                      {authState === 'verifying' && 'Mapping telemetry context graphs...'}
                      {authState === 'success' && 'Redirecting to analytical view...'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Input fields */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {authState === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-500/35 text-red-300 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {/* Email (Workspace ID) */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                    Identity ID (Email)
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-[#22C55E]' : 'text-slate-500'}`} />
                    <input
                      type="email"
                      required
                      placeholder="manager@sprintintel.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-[#1e293b]/20 hover:bg-[#1e293b]/35 focus:bg-[#020617] border border-[#334155]/60 focus:border-[#22C55E]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] outline-none transition-all placeholder:text-slate-600 font-mono"
                    />
                  </div>
                </div>

                {/* Password (Phrase) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                      Security phrase
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-[#22C55E]' : 'text-slate-500'}`} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full bg-[#1e293b]/20 hover:bg-[#1e293b]/35 focus:bg-[#020617] border border-[#334155]/60 focus:border-[#22C55E]/40 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] outline-none transition-all placeholder:text-slate-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Hint box to clarify credentials (as requested by user "with clear logged in") */}
                <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-slate-400 text-[10px] leading-relaxed">
                  <span className="font-bold text-[#A5B4FC] block mb-1">🔑 Verification Parameters</span>
                  Use any valid email (e.g. <span className="text-white font-mono">admin@intel.ai</span>) and any password &ge; 4 characters to log in.
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full relative flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-[#22C55E] to-indigo-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/10 cursor-pointer overflow-hidden group mt-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine" />
                  <span>Verify and Login</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </form>

            </div>
          </div>

          {/* Bottom: Secure system indicator */}
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono border-t border-slate-900/60 pt-4">
            <span>PERSISTENT SYNC: ACTIVE</span>
            <span>SECURE GATEWAY v1.4</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: PREMIUM MOCKUP SHOWCASE (7 Columns) ── */}
        {/* We place the generated tech picture as a full screen display panel with absolute zero text overlapping */}
        <div className="lg:col-span-7 relative hidden lg:block overflow-hidden bg-slate-950">
          
          {/* Tech Image Display (spans the entire right side) */}
          <img
            src="/sprint_analytics_hero.jpg"
            alt="Sprint Analytics Dashboard"
            className="w-full h-full object-cover opacity-90 object-center transition-all duration-700 hover:scale-105"
          />

          {/* Glowing bottom overlay to blend the image edge */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-[#020617]/40 pointer-events-none" />

          {/* Glassmorphic Badge Overlay (positioned cleanly at the top-right without overlapping header info) */}
          <div className="absolute top-6 right-6 p-4 rounded-xl border border-[#334155]/60 bg-[#020617]/70 backdrop-blur-md max-w-xs pointer-events-none shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22C55E] animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-white tracking-wider uppercase">AI PREDICTOR ENGINE</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              "Neural network modeling predicts 94% sprint delivery completion rate with optimal capacity utilization."
            </p>
          </div>

          {/* Bottom Left Badge */}
          <div className="absolute bottom-6 left-6 p-3 rounded-lg border border-[#334155]/50 bg-slate-950/80 backdrop-blur-sm pointer-events-none">
            <span className="font-mono text-[9px] text-[#22C55E] tracking-widest font-extrabold uppercase">AG-UC-0010 OPERATIONAL VIEWPORT</span>
          </div>

        </div>

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
        @keyframes shine-sweep {
          to { transform: translateX(100%); }
        }
        .group:hover .group-hover\\:animate-shine {
          animation: shine-sweep 1.2s ease;
        }
      `}</style>
    </div>
  );
}
