'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck,
  Activity, Sparkles, AlertCircle, Cpu, BarChart3, Clock, CheckCircle2,
  LockKeyhole, Zap, Server, ChevronRight, Layers, Target
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis, YAxis
} from 'recharts';

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

  // --- Interactive States & Metrics ---
  const [activeTab, setActiveTab] = useState<'password' | 'sso'>('password');
  const [kpiScore, setKpiScore] = useState(0);
  const [velocityPoints, setVelocityPoints] = useState(0);
  const [chartData, setChartData] = useState([
    { name: 'D1', val: 65, load: 78 },
    { name: 'D2', val: 78, load: 82 },
    { name: 'D3', val: 72, load: 64 },
    { name: 'D4', val: 95, load: 95 },
    { name: 'D5', val: 110, load: 70 },
    { name: 'D6', val: 125, load: 60 }
  ]);

  // Refs for 3D card tilt & canvas particles
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);

  // --- Canvas Neural Network Particle System ---
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
      const numParticles = Math.floor((canvas.width * canvas.height) / 14000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? 'rgba(34,197,94,0.18)' : 'rgba(99,102,241,0.15)'
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw faint connections (lines)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        // Boundaries bounce
        if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
        if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = p1.color;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99,102,241,${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.8;
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

  // --- Dynamic Analytics Simulators ---
  useEffect(() => {
    // Score counts
    const interval = setInterval(() => {
      setKpiScore(prev => (prev < 94 ? prev + 2 : 94));
      setVelocityPoints(prev => (prev < 142 ? prev + 3 : 142));
    }, 25);

    // Dynamic Chart Shifts
    const chartInterval = setInterval(() => {
      setChartData(prev =>
        prev.map(item => ({
          ...item,
          val: Math.floor(Math.random() * 40) + 80,
          load: Math.floor(Math.random() * 30) + 55
        }))
      );
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(chartInterval);
    };
  }, []);

  // --- 3D Parallax Tilt Effect ---
  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Soft rotation angles
    const tiltX = (y / (rect.height / 2)) * -6;
    const tiltY = (x / (rect.width / 2)) * 6;

    card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  // --- Form Submission Flow ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthState('error');
      setErrorMessage('A valid workspace ID (email) is required.');
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
      if (progress === 40) {
        setAuthState('verifying');
      }
      if (progress >= 100) {
        clearInterval(timer);
        setAuthState('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1100);
      }
    }, 180);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#020617] text-[#F8FAFC] flex overflow-hidden font-sans">
      
      {/* ── BACKGROUND CANVAS (Neural Network Particles) ── */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70" />

      {/* ── GLOWING AURORA SPHERES ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-emerald-500/10 to-indigo-500/0 blur-[130px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-indigo-600/8 to-emerald-500/0 blur-[120px] animate-pulse" style={{ animationDuration: '14s' }} />
      </div>

      {/* ── FULL VIEWPORT CONTENT CONTAINER ── */}
      <div className="relative z-10 w-full flex flex-col lg:flex-row">

        {/* ── LEFT PANEL: LOGO & AUTH PORTAL (Full height container) ── */}
        <div className="w-full lg:w-[460px] shrink-0 border-r border-[#334155]/60 bg-gradient-to-b from-[#020617]/90 to-[#0F172A]/90 backdrop-blur-2xl flex flex-col justify-between p-8 z-10 h-screen overflow-y-auto">
          
          {/* Top: Brand Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#22C55E] to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-mono text-xs font-extrabold tracking-widest text-[#22C55E] uppercase block leading-none">Sprint Intel</span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest">AG-UC-0010</span>
            </div>
          </motion.div>

          {/* Middle: Interactive Login Bento Card */}
          <div className="my-auto py-8">
            <motion.div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`bento p-7 border border-[#334155]/70 shadow-2xl relative transition-all duration-300 ${shake ? 'animate-shake' : ''}`}
            >
              {/* Internal Accent Glow Top Line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent" />

              {/* Login Title */}
              <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <LockKeyhole className="w-4.5 h-4.5 text-[#22C55E]" />
                  Authenticate
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter authorization keys to sync live sprint metrics.
                </p>
              </div>

              {/* Loader Overlay (Auth Flow) */}
              <AnimatePresence>
                {(authState === 'scanning' || authState === 'verifying' || authState === 'success') && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-[20px] z-30 flex flex-col items-center justify-center p-6 text-center"
                  >
                    <div className="relative mb-5">
                      <div className="w-14 h-14 rounded-full border border-[#22C55E]/30 flex items-center justify-center">
                        {authState === 'success' ? (
                          <CheckCircle2 className="w-7 h-7 text-[#22C55E] animate-bounce" />
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
                      {authState === 'verifying' && 'DECRYPTING RSA HANDSHAKE...'}
                      {authState === 'success' && 'TELEMETRY CONNECTION ESTABLISHED'}
                    </span>

                    {/* Progress Slider */}
                    <div className="w-40 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progressVal}%` }}
                        transition={{ ease: 'easeInOut' }}
                      />
                    </div>

                    <span className="font-mono text-[9px] text-slate-500 mt-2 block">
                      {authState === 'scanning' && `Reading identity node: ${progressVal}%`}
                      {authState === 'verifying' && 'Syncing database payload schemas...'}
                      {authState === 'success' && 'Redirecting to executive workspace...'}
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
                    Workspace ID
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
                      className="w-full bg-[#1e293b]/25 hover:bg-[#1e293b]/45 focus:bg-[#020617] border border-[#334155]/60 focus:border-[#22C55E]/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8FAFC] outline-none transition-all placeholder:text-slate-600 font-mono"
                    />
                  </div>
                </div>

                {/* Password (Phrase) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                      Passphrase
                    </label>
                    <button type="button" className="text-[9px] text-indigo-400 hover:text-indigo-300 font-mono">
                      Forgot?
                    </button>
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
                      className="w-full bg-[#1e293b]/25 hover:bg-[#1e293b]/45 focus:bg-[#020617] border border-[#334155]/60 focus:border-[#22C55E]/40 rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F8FAFC] outline-none transition-all placeholder:text-slate-600 font-mono"
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

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full relative flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-[#22C55E] to-indigo-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/10 cursor-pointer overflow-hidden group mt-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-shine" />
                  <span>Access Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </motion.button>
              </form>

              {/* SSO Divider */}
              <div className="relative my-5 text-center">
                <span className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800" />
                <span className="relative bg-[#0d1220] px-3 font-mono text-[8px] text-slate-500 uppercase tracking-widest font-bold">
                  Corporate SAML SSO
                </span>
              </div>

              {/* SSO Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Azure Active', key: 'A' },
                  { name: 'GitHub Enterprise', key: 'G' }
                ].map((sso) => (
                  <button
                    key={sso.name}
                    type="button"
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#334155]/60 bg-slate-900/40 hover:bg-[#1e293b]/40 text-[10px] text-slate-400 hover:text-slate-200 transition font-mono cursor-pointer"
                  >
                    <span className="font-bold text-indigo-400">{sso.key}</span>
                    <span className="truncate">{sso.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom: Footer Info */}
          <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono border-t border-slate-900 pt-4">
            <span>DB ENGINE: ACTIVE</span>
            <span>SECURE SHELL v1.3</span>
          </div>
        </div>

        {/* ── RIGHT PANEL: FULL VIEWPORT ENTERPRISE PREVIEW (Hero visualization) ── */}
        <div
          ref={rightContainerRef}
          className="flex-1 h-screen overflow-y-auto hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#020617]/40 to-[#0F172A]/10 relative z-10"
        >
          {/* Top: Section Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="section-eyebrow">Real-Time Operational Telemetry</div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight leading-none mt-1.5">
                Optimize Sprint Health with Live Metrics
              </h2>
              <p className="text-xs text-slate-400 max-w-xl mt-3 leading-relaxed">
                Connect metrics directly to your planning cycle. Observe velocity trends, evaluate developer workload balance, and preempt blockers before they delay commitments.
              </p>
            </div>

            {/* Simulated server metrics */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '8px',
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
              }}>
                <Server className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="text-[10px] font-bold font-mono text-[#22C55E]">SERVER CORE: LIVE</span>
              </div>
            </div>
          </div>

          {/* Middle: Premium Bento Grid Metrics Panels */}
          <div className="grid grid-cols-12 gap-5 my-8 items-stretch">
            
            {/* 1. Live velocity Sparkline Area Chart (6 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="bento p-6 col-span-6 flex flex-col justify-between min-h-[190px]"
            >
              <div className="flex justify-between items-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="icon-box icon-indigo" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <Activity style={{ width: '13px', height: '13px' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Workspace Task Velocity</h4>
                    <span className="text-[9px] font-mono text-slate-500">Live delta changes</span>
                  </div>
                </div>
                <span className="pill pill-indigo">Avg 94 SP</span>
              </div>

              <div className="chart-wrap" style={{ height: '90px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.24} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* 2. Health Score Circle Gauge (6 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bento p-6 col-span-6 flex flex-col justify-between min-h-[190px]"
            >
              <div className="flex justify-between items-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="icon-box icon-green" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <Cpu style={{ width: '13px', height: '13px' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Composite Sprint Health</h4>
                    <span className="text-[9px] font-mono text-slate-500">Predicted rate</span>
                  </div>
                </div>
                <span className="pill pill-green">Optimal</span>
              </div>

              <div className="flex items-center gap-6 my-auto pt-2">
                <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(51,65,85,0.30)" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15" fill="none" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray="94.25"
                    initial={{ strokeDashoffset: 94.25 }}
                    animate={{ strokeDashoffset: 94.25 - (94.25 * kpiScore / 100) }}
                    transition={{ duration: 1.6 }}
                  />
                </svg>
                <div>
                  <div className="text-2xl font-bold font-mono text-[#22C55E]" style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {kpiScore}%
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Zero blocker risks flagged within local epic timelines.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. Resource load mapping radar (6 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bento p-6 col-span-6 flex flex-col justify-between min-h-[190px]"
            >
              <div className="flex justify-between items-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="icon-box icon-sky" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <BarChart3 style={{ width: '13px', height: '13px' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Staff Allocation Chart</h4>
                    <span className="text-[9px] font-mono text-slate-500">Relative role load</span>
                  </div>
                </div>
                <span className="pill pill-sky">Stable</span>
              </div>

              <div style={{ height: '90px', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                    { subject: 'Dev', A: 120 },
                    { subject: 'QA', A: 92 },
                    { subject: 'Design', A: 78 },
                    { subject: 'PM', A: 104 },
                    { subject: 'Ops', A: 85 }
                  ]}>
                    <PolarGrid stroke="rgba(51,65,85,0.30)" />
                    <PolarAngleAxis dataKey="subject" stroke="rgba(71,85,105,0.60)" fontSize={8} fontFamily="var(--font-data)" />
                    <Radar name="Staff" dataKey="A" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.12} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* 4. Sprint progress timeline metric (6 Cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bento p-6 col-span-6 flex flex-col justify-between min-h-[190px]"
            >
              <div className="flex justify-between items-start">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="icon-box icon-amber" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <Clock style={{ width: '13px', height: '13px' }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Scope Timeline Burn</h4>
                    <span className="text-[9px] font-mono text-slate-500">Days tracking</span>
                  </div>
                </div>
                <span className="pill pill-amber">Day 11/14</span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Total Completion:</span>
                  <span className="font-mono text-amber-400">{velocityPoints} SP</span>
                </div>
                {/* Custom Bullet progress track */}
                <div className="bullet-track" style={{ height: '7px' }}>
                  <motion.div
                    className="bullet-fill bg-gradient-to-r from-amber-500 to-indigo-500"
                    style={{ width: '74%' }}
                    initial={{ width: '0%' }}
                    animate={{ width: '74%' }}
                    transition={{ duration: 1.4 }}
                  />
                  <div className="bullet-target-marker" style={{ left: '80%' }} />
                </div>
                <p className="text-[9px] text-slate-500 font-mono">
                  Calculated projection values estimate complete scope fulfillment.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Bottom: Interactive AI Copilot Prediction Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bento p-5 flex items-start gap-4 border-l-2 border-[#22C55E] bg-[#0F172A]/75 relative overflow-hidden"
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#22C55E]/5 to-transparent skew-x-12 -translate-x-full animate-[shimmer_3.5s_infinite]" />
            
            <div className="icon-box icon-green shrink-0" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
              <Sparkles className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
                AI PREDICTIVE ASSISTANT
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              </h5>
              <p className="text-xs text-slate-400 leading-relaxed mt-1.5 font-sans">
                "Sprint 10 velocity trends are tracking 8% above baseline metrics. General risk modeling shows optimal parameters, indicating a 94% probability of achieving committed story points."
              </p>
            </div>
          </motion.div>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotateX(0deg) rotateY(0deg) translateX(0); }
          25% { transform: rotateX(-2deg) rotateY(-2deg) translateX(-6px); }
          75% { transform: rotateX(2deg) rotateY(2deg) translateX(6px); }
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
