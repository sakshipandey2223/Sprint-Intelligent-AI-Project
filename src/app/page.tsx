'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck,
  Activity, Sparkles, AlertCircle, Cpu, BarChart3, Clock, CheckCircle
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';

// --- Types ---
type AuthState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

// --- Mock Live Data for Dashboard Preview ---
const initialSparkData = [
  { day: 'M', velocity: 45, load: 78 },
  { day: 'T', velocity: 65, load: 82 },
  { day: 'W', velocity: 58, load: 64 },
  { day: 'T', velocity: 89, load: 95 },
  { day: 'F', velocity: 95, load: 70 },
  { day: 'S', velocity: 110, load: 60 }
];

export default function Home() {
  const router = useRouter();

  // --- Input & Visibility State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // --- Auth & Interaction State ---
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progressVal, setProgressVal] = useState(0);

  // --- Interactive Mouse Parallax Effects ---
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Map mouse movement to slight rotation/tilt
  const rotateX = useTransform(mouseY, [-400, 400], [6, -6]);
  const rotateY = useTransform(mouseX, [-400, 400], [-6, 6]);

  // --- Live Metrics simulation states ---
  const [kpi1, setKpi1] = useState(0);
  const [kpi2, setKpi2] = useState(0);
  const [pulseActive, setPulseActive] = useState(true);
  const [graphData, setGraphData] = useState(initialSparkData);

  useEffect(() => {
    // KPI Counters counting up on load
    const interval = setInterval(() => {
      setKpi1(prev => (prev < 94 ? prev + 2 : 94));
      setKpi2(prev => (prev < 142 ? prev + 3 : 142));
    }, 30);

    // Periodically change chart data to make it feel "alive"
    const liveChartInterval = setInterval(() => {
      setGraphData(prev =>
        prev.map(item => ({
          ...item,
          velocity: Math.floor(Math.random() * 40) + 70,
          load: Math.floor(Math.random() * 30) + 60
        }))
      );
      setPulseActive(p => !p);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(liveChartInterval);
    };
  }, []);

  // Track cursor position relative to window center
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // --- Handle Login Submission ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthState('error');
      setErrorMessage('Please enter a valid email address');
      triggerShake();
      return;
    }
    if (password.length < 4) {
      setAuthState('error');
      setErrorMessage('Password must be at least 4 characters');
      triggerShake();
      return;
    }

    setAuthState('scanning');
    setErrorMessage('');
    setProgressVal(0);

    // Progress bar tick simulator
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += 10;
      setProgressVal(currentProgress);
      if (currentProgress === 50) {
        setAuthState('verifying');
      }
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setAuthState('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    }, 200);
  };

  // Shake animation trigger logic
  const [shake, setShake] = useState(false);
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617] px-6 py-12"
      style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)',
        backgroundSize: '48px 48px'
      }}
    >
      {/* ── BACKGROUND GLOWS ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Animated gradient mesh */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[35%] right-[20%] w-[45%] h-[45%] rounded-full bg-violet-600/5 blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* ── MASTER CONTAINER ── */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

        {/* ── LEFT PANEL: FLOATING LOGIN CARD (5 Cols) ── */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div
            ref={cardRef}
            style={{
              rotateX: rotateX,
              rotateY: rotateY,
              transformStyle: 'preserve-3d',
              perspective: 1000
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`bento p-8 ${shake ? 'animate-shake' : ''} border border-slate-800/80 shadow-2xl relative`}
          >
            {/* Ambient indicator lights on card */}
            <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#22C55E]/40 to-transparent" />
            <div className="absolute bottom-0 left-24 right-24 h-[1px] bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent" />

            {/* Header / Logo */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                <Cpu className="w-6 h-6 text-white animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
                Sprint Intelligence
              </h2>
              <p className="font-mono text-[10px] text-[#22C55E] tracking-widest uppercase mt-1">
                AG-UC-0010 · Enterprise SaaS
              </p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                AI-powered sprint analytics, predictive insights, and engineering excellence indicators.
              </p>
            </div>

            {/* Scanning / Loading Screen Overlay */}
            <AnimatePresence>
              {(authState === 'scanning' || authState === 'verifying' || authState === 'success') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-[20px] z-20 flex flex-col items-center justify-center p-6 text-center"
                >
                  {/* Cyber shield scan animation */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border border-[#22C55E]/30 flex items-center justify-center">
                      {authState === 'success' ? (
                        <CheckCircle className="w-8 h-8 text-[#22C55E] animate-bounce" />
                      ) : (
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                      )}
                    </div>
                    {authState !== 'success' && (
                      <div className="absolute inset-0 border border-indigo-500/35 rounded-full scale-125 animate-ping" />
                    )}
                  </div>

                  <h3 className="font-mono text-sm font-semibold tracking-wider text-[#F8FAFC]">
                    {authState === 'scanning' && 'SCANNING CREDENTIALS...'}
                    {authState === 'verifying' && 'DECRYPTING CLIENT KEY...'}
                    {authState === 'success' && 'ACCESS GRANTED'}
                  </h3>

                  {/* Progress Line */}
                  <div className="w-48 h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${progressVal}%` }}
                      transition={{ ease: 'easeInOut' }}
                    />
                  </div>

                  <p className="font-mono text-[10px] text-slate-500 mt-2">
                    {authState === 'scanning' && `Analyzing integrity: ${progressVal}%`}
                    {authState === 'verifying' && 'Handshake established with AG-UC-0010 server'}
                    {authState === 'success' && 'Routing to analytical viewport...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Callout */}
              {authState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-red-300 text-xs"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Identity (Email)
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-[#22C55E]' : 'text-slate-500'}`} />
                  <input
                    type="email"
                    required
                    placeholder="manager@sprintintel.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#1e293b]/30 hover:bg-[#1e293b]/50 focus:bg-[#0f172a] border border-slate-800 focus:border-[#22C55E]/40 rounded-xl pl-11 pr-4 py-3 text-sm text-[#F8FAFC] outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Keyphrase (Password)
                  </label>
                  <button type="button" className="text-[10px] text-indigo-400 hover:text-indigo-300 transition font-mono">
                    Reset phrase
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'password' ? 'text-[#22C55E]' : 'text-slate-500'}`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full bg-[#1e293b]/30 hover:bg-[#1e293b]/50 focus:bg-[#0f172a] border border-slate-800 focus:border-[#22C55E]/40 rounded-xl pl-11 pr-11 py-3 text-sm text-[#F8FAFC] outline-none transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remeber me checkbox */}
              <div className="flex items-center justify-between text-xs py-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-800 bg-[#0F172A] text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep Session Open</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full relative flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/10 cursor-pointer overflow-hidden group"
              >
                {/* Shine Sweep animation effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine" />
                <span>Initialize Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <span className="absolute inset-x-0 top-1/2 h-[1px] bg-slate-800" />
              <span className="relative bg-[#0b0f19] px-3 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                Trusted Enterprise Federations
              </span>
            </div>

            {/* SSO / Identity Providers Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Google Workspace', icon: 'G' },
                { name: 'Azure Active Dir', icon: 'A' },
                { name: 'GitHub Enterprise', icon: 'H' },
                { name: 'Okta SSO Single', icon: 'O' }
              ].map((sso) => (
                <button
                  key={sso.name}
                  type="button"
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-800/80 bg-slate-900/40 hover:bg-[#1e293b]/40 text-[11px] text-slate-400 hover:text-slate-200 transition font-medium cursor-pointer"
                >
                  <span className="font-mono text-indigo-400 font-extrabold">{sso.icon}</span>
                  <span className="truncate">{sso.name}</span>
                </button>
              ))}
            </div>

            {/* Footnote */}
            <div className="text-center mt-6 text-[10px] text-slate-500 font-mono">
              Secure endpoint backed by TLS 1.3 & AES-256
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL: LIVE TELEMETRY PREVIEW (7 Cols) ── */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="hidden lg:block">
              <span className="pill pill-green mb-3">SYSTEM TELEMETRY PREVIEW</span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                Observe Velocity & Predictive Health
              </h3>
              <p className="text-sm text-slate-400 max-w-lg mt-2">
                Real-time connection monitoring tracks daily task velocity, epic split values, and individual developer load levels.
              </p>
            </div>

            {/* Bento Grid Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Active Velocity Line chart */}
              <div className="bento p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="icon-box icon-indigo" style={{ width: '26px', height: '26px', borderRadius: '6px' }}>
                      <Activity style={{ width: '13px', height: '13px' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Live Team Velocity</h4>
                      <span className="text-[9px] font-mono text-slate-500">Updates every 3s</span>
                    </div>
                  </div>
                  <span className="pill pill-indigo">89 SP avg</span>
                </div>

                <div className="chart-wrap" style={{ height: '110px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={graphData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.20} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="velocity" stroke="#6366f1" strokeWidth={2} fill="url(#lineGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2: Sprint health dial */}
              <div className="bento p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="icon-box icon-green" style={{ width: '26px', height: '26px', borderRadius: '6px' }}>
                      <Cpu style={{ width: '13px', height: '13px' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Predictive Sprint Health</h4>
                      <span className="text-[9px] font-mono text-slate-500">AI Risk Rating</span>
                    </div>
                  </div>
                  <span className="pill pill-green">Optimal</span>
                </div>

                {/* Donut progress visual */}
                <div className="flex items-center gap-5 my-1">
                  <svg width="60" height="60" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(51,65,85,0.4)" strokeWidth="3.5" />
                    <motion.circle
                      cx="18" cy="18" r="15" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray="94.25"
                      initial={{ strokeDashoffset: 94.25 }}
                      animate={{ strokeDashoffset: 94.25 - (94.25 * kpi1 / 100) }}
                      transition={{ duration: 1.5 }}
                    />
                  </svg>
                  <div>
                    <div className="text-2xl font-bold font-mono text-[#22C55E]">
                      {kpi1}%
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      No blockers registered
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Capacity Radar preview */}
              <div className="bento p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="icon-box icon-sky" style={{ width: '26px', height: '26px', borderRadius: '6px' }}>
                      <BarChart3 style={{ width: '13px', height: '13px' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Resource Load Radar</h4>
                      <span className="text-[9px] font-mono text-slate-500">Roles split mapping</span>
                    </div>
                  </div>
                  <span className="pill pill-sky">Stable</span>
                </div>

                <div style={{ height: '110px', marginTop: '-6px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                      { subject: 'Dev', A: 120 },
                      { subject: 'QA', A: 98 },
                      { subject: 'Design', A: 86 },
                      { subject: 'PM', A: 99 },
                      { subject: 'Ops', A: 85 }
                    ]}>
                      <PolarGrid stroke="rgba(51,65,85,0.30)" />
                      <PolarAngleAxis dataKey="subject" stroke="rgba(71,85,105,0.60)" fontSize={8} fontFamily="var(--font-data)" />
                      <Radar name="Staff" dataKey="A" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.12} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 4: Load metric & capacity indicator */}
              <div className="bento p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="icon-box icon-amber" style={{ width: '26px', height: '26px', borderRadius: '6px' }}>
                      <Clock style={{ width: '13px', height: '13px' }} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-300">Sprint Timeline Flow</h4>
                      <span className="text-[9px] font-mono text-slate-500">Days remaining</span>
                    </div>
                  </div>
                  <span className="pill pill-amber">Day 11</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Progress:</span>
                    <span className="font-mono text-amber-400 font-bold">{kpi2} SP Done</span>
                  </div>
                  <div className="bullet-track">
                    <motion.div
                      className="bullet-fill bg-gradient-to-r from-amber-500 to-indigo-500"
                      style={{ width: '74%' }}
                      initial={{ width: '0%' }}
                      animate={{ width: '74%' }}
                      transition={{ duration: 1.4 }}
                    />
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Estimated delivery time remaining: 3 days
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant Dialogue Box */}
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bento p-5 flex items-start gap-4 border-l-2 border-emerald-500"
            >
              <div className="icon-box icon-green shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-200">AI Assistant Prediction</h5>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  "Sprint 10 velocity is currently pacing 8% higher than average. No active code blockers detected. The likelihood of complete ticket delivery is rated at 94%."
                </p>
              </div>
            </motion.div>
          </motion.div>
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
