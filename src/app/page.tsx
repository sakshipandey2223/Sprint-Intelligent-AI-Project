'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

type AuthState = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';

export default function Home() {
  const router = useRouter();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Auth Flow States
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [progressVal, setProgressVal] = useState(0);
  const [shake, setShake] = useState(false);

  // Terminal rows print simulator
  const [terminalRows, setTerminalRows] = useState<number>(0);

  // Refs for canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Background Network Graph Canvas (from Sentry spec) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const stage = canvas.parentElement;
    if (!stage) return;

    let w: number;
    let h: number;
    let nodes: Array<{ x: number; y: number; vx: number; vy: number; r: number }> = [];
    let animationFrameId: number;

    const resize = () => {
      w = canvas.width = stage.clientWidth * window.devicePixelRatio;
      h = canvas.height = stage.clientHeight * window.devicePixelRatio;
      canvas.style.width = stage.clientWidth + 'px';
      canvas.style.height = stage.clientHeight + 'px';
      initNodes();
    };

    const initNodes = () => {
      const count = Math.max(26, Math.floor((stage.clientWidth * stage.clientHeight) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * window.devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * window.devicePixelRatio,
        r: (Math.random() * 1.4 + 0.9) * window.devicePixelRatio
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const maxDist = 150 * window.devicePixelRatio;

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      // Draw lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.32;
            ctx.strokeStyle = `rgba(45,212,167,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(219,230,239,0.55)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(step);
    };

    window.addEventListener('resize', resize);
    resize();
    step();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Terminal Boot Log Simulation ---
  useEffect(() => {
    const timers = [
      setTimeout(() => setTerminalRows(1), 400),
      setTimeout(() => setTerminalRows(2), 1000),
      setTimeout(() => setTerminalRows(3), 1600),
      setTimeout(() => setTerminalRows(4), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setAuthState('error');
      setErrorMessage('Please enter a valid operator email address.');
      triggerShake();
      return;
    }
    if (password.length < 4) {
      setAuthState('error');
      setErrorMessage('Passphrase must be at least 4 characters.');
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
    <div className="relative min-h-screen w-screen bg-[#080b10] text-[#dbe6ef] flex items-center justify-center overflow-hidden font-sans">
      
      {/* ── BACKGROUND GRID FADE ── */}
      <div className="grid-fade" />

      {/* ── SENTRY SHELL CONTAINER ── */}
      <div className="shell shadow-2xl">
        
        {/* ============ LEFT: LIVE NET / STAGE ============ */}
        <section className="stage" aria-hidden="true">
          <canvas id="net" ref={canvasRef} />
          <div className="scan-line" />

          {/* Top Status and Brand */}
          <div className="stage-top">
            <div className="brand">
              <div className="brand-mark">S</div>
              <div>
                <div className="brand-name">SENTRY // Sprint - Intelligent AI</div>
                <div className="brand-tag">WHITE&nbsp;HAT&nbsp;ACCESS&nbsp;LAYER</div>
              </div>
            </div>
            <div className="status-pill">
              <span className="status-dot" />
              LINK SECURE
            </div>
          </div>

          {/* Middle Headline, Sub & Terminal */}
          <div className="stage-mid">
            <div>
              <div className="headline">
                Access, guarded<br />by <span className="accent">design</span>, not <span className="accent2">assumption</span>.
              </div>
              <p className="sub mt-3">
                Every session on Sentry is encrypted end-to-end and verified against known-good signatures before it ever reaches the vault. Nothing sneaky. Just disciplined security.
              </p>
            </div>

            {/* Terminal simulation */}
            <div className="term">
              {terminalRows >= 1 && (
                <div className="term-row">
                  <span className="tag">[boot]</span> initializing secure channel<span className="ok">... done</span>
                </div>
              )}
              {terminalRows >= 2 && (
                <div className="term-row">
                  <span className="tag">[tls]</span> handshake verified <span className="ok">✓ 256-bit</span>
                </div>
              )}
              {terminalRows >= 3 && (
                <div className="term-row">
                  <span className="tag">[scan]</span> zero known vulnerabilities <span className="ok">✓ clear</span>
                </div>
              )}
              {terminalRows >= 4 && (
                <div className="term-row">
                  <span className="tag">[wait]</span> awaiting credentials<span className="caret" />
                </div>
              )}
            </div>
          </div>

          {/* Footer Metrics */}
          <div className="stage-foot">
            <div>
              <div className="metric-label">ENCRYPTION</div>
              <div className="metric-value teal">AES-256</div>
            </div>
            <div>
              <div className="metric-label">NODES MONITORED</div>
              <div className="metric-value">1,204</div>
            </div>
            <div>
              <div className="metric-label">UPTIME</div>
              <div className="metric-value">99.98%</div>
            </div>
          </div>
        </section>

        {/* ============ RIGHT: LOGIN FORM PANEL ============ */}
        <section className={`panel relative ${shake ? 'animate-shake' : ''}`}>
          
          {/* Internal Scanner Overlay (Auth Flow) */}
          <AnimatePresence>
            {(authState === 'scanning' || authState === 'verifying' || authState === 'success') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/98 z-30 flex flex-col items-center justify-center p-6 text-center"
              >
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-full border border-[#2dd4a7]/30 flex items-center justify-center">
                    {authState === 'success' ? (
                      <ShieldCheck className="w-7 h-7 text-[#2dd4a7]" />
                    ) : (
                      <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                    )}
                  </div>
                  {authState !== 'success' && (
                    <div className="absolute inset-0 border border-indigo-500/20 rounded-full scale-125 animate-ping" />
                  )}
                </div>

                <span className="font-mono text-xs font-bold tracking-widest text-[#dbe6ef] block">
                  {authState === 'scanning' && 'SCANNING VERIFICATION INDEX...'}
                  {authState === 'verifying' && 'ESTABLISHING HANDSHAKE...'}
                  {authState === 'success' && 'ACCESS AUTORIZED'}
                </span>

                <div className="w-40 h-1 bg-[#10161f] rounded-full mt-4 overflow-hidden relative border border-slate-800">
                  <motion.div
                    className="h-full bg-[#2dd4a7] shadow-[0_0_6px_#2dd4a7]"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progressVal}%` }}
                    transition={{ ease: 'easeInOut' }}
                  />
                </div>

                <span className="font-mono text-[8px] text-[#7d90a3] mt-2 block">
                  {authState === 'scanning' && `Parsing security parameters: ${progressVal}%`}
                  {authState === 'verifying' && 'Mapping telemetry context graphs...'}
                  {authState === 'success' && 'Redirecting to executive workspace...'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="panel-eyebrow">Secure sign-in</div>
          <h1 className="panel-title">Welcome back, operator</h1>
          <p className="panel-sub">
            Sign in with your verified credentials. Sessions are audited, never sold, and can be revoked by you at any time.
          </p>

          <form onSubmit={handleLoginSubmit} autoComplete="off">
            
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

            {/* Email Field */}
            <div className="field">
              <label htmlFor="handle">Operator ID / Email</label>
              <div className="input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round">
                  <path d="M4 4h16v16H4z" opacity="0" />
                  <path d="M22 6 12 13 2 6" />
                  <path d="M2 6h20v12H2z" />
                </svg>
                <input
                  id="handle"
                  type="email"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="field">
              <label htmlFor="pass">Passphrase</label>
              <div className="input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle passphrase visibility"
                >
                  {showPassword ? (
                    <EyeOff width="16" height="16" />
                  ) : (
                    <Eye width="16" height="16" />
                  )}
                </button>
              </div>
            </div>

            {/* Credentials Hint Box (Workspace login rules) */}
            <div className="p-3 rounded-lg bg-[#10161f] border border-cyan-950 text-[#7d90a3] text-[10px] leading-relaxed font-mono">
              <span className="font-bold text-[#2dd4a7] block mb-1">🔑 Access Keys</span>
              Any email address (e.g. <span className="text-white">admin@intel.ai</span>) & password &ge; 4 chars are valid.
            </div>

            <div className="row-between">
              <label className="checkline">
                <input type="checkbox" /> Keep this device trusted
              </label>
              <a href="#" className="link">Forgot passphrase?</a>
            </div>

            <button type="submit" className="btn-primary">
              <span className="shine" />
              Authenticate
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </button>
          </form>

          <div className="divider">OR CONTINUE WITH</div>

          <div className="alt-methods">
            <button className="alt-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.9-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
              Passkey
            </button>
            <button className="alt-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <path d="M12 18h.01" />
              </svg>
              Authenticator
            </button>
          </div>

          <div className="trust-strip">
            <div className="trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z" />
              </svg>
              AUDITED
            </div>
            <div className="trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              ENCRYPTED
            </div>
            <div className="trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              NO DATA SOLD
            </div>
          </div>

          <p className="panel-footer">
            New operator? <a href="#" className="link">Request an invitation</a>
          </p>
        </section>

      </div>

      {/* ── EMBEDDED IDENTICAL SENTRY STYLESHEET ── */}
      <style>{`
        :root {
          --bg:            #080b10;
          --bg-2:          #0d1219;
          --panel:         #10161f;
          --panel-2:       #131b26;
          --line:          #202b38;
          --line-soft:     #1a2330;
          --text:          #dbe6ef;
          --text-dim:      #7d90a3;
          --text-faint:    #4c5c6e;
          --teal:          #2dd4a7;
          --teal-dim:      #1c8f72;
          --blue:          #4c8dff;
          --mono:          'JetBrains Mono', monospace;
          --sans:          'Inter', sans-serif;
        }

        .grid-fade {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(to right, var(--line-soft) 1px, transparent 1px),
            linear-gradient(to bottom, var(--line-soft) 1px, transparent 1px);
          background-size: 42px 42px;
          -webkit-mask-image: radial-gradient(ellipse 90% 70% at 50% 40%, black 20%, transparent 75%);
          mask-image: radial-gradient(ellipse 90% 70% at 50% 40%, black 20%, transparent 75%);
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }

        .shell {
          position: relative;
          z-index: 10;
          width: min(1180px, 94vw);
          height: min(720px, 92vh);
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 40px 100px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(45,212,167,0.04);
          animation: shellIn 0.7s cubic-bezier(.16,.8,.24,1) both;
        }

        @keyframes shellIn {
          from { opacity: 0; transform: translateY(18px) scale(0.985); }
          to { opacity: 1; transform: none; }
        }

        @media (max-width: 880px) {
          .shell { grid-template-columns: 1fr; height: auto; width: 96vw; }
          .stage { min-height: 280px; }
        }

        .stage {
          position: relative;
          background:
            radial-gradient(circle at 20% 15%, rgba(45,212,167,0.08), transparent 55%),
            radial-gradient(circle at 85% 85%, rgba(76,141,255,0.08), transparent 55%),
            var(--bg-2);
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          padding: 34px 34px 28px;
          overflow: hidden;
        }

        canvas#net {
          position: absolute; inset: 0; width: 100%; height: 100%;
          opacity: 0.75;
        }

        .scan-line {
          position: absolute; left: 0; right: 0; height: 120px;
          background: linear-gradient(to bottom, transparent, rgba(45,212,167,0.06), transparent);
          animation: scan 6s linear infinite;
          pointer-events: none;
        }

        @keyframes scan {
          0% { transform: translateY(-140px); }
          100% { transform: translateY(720px); }
        }

        .stage-top { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-mark {
          width: 30px; height: 30px; border-radius: 8px;
          background: linear-gradient(135deg, var(--teal), var(--blue));
          display: flex; align-items: center; justify-content: center;
          font-family: var(--mono); font-weight: 800; font-size: 14px; color: #04120d;
          box-shadow: 0 0 22px rgba(45,212,167,0.35);
        }
        .brand-name { font-family: var(--mono); font-weight: 700; letter-spacing: 0.14em; font-size: 13px; color: var(--text); }
        .brand-tag { font-family: var(--mono); font-size: 10px; color: var(--text-faint); letter-spacing: 0.08em; margin-top: 1px; }

        .status-pill {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em;
          color: var(--teal); border: 1px solid rgba(45,212,167,0.3);
          background: rgba(45,212,167,0.06);
          padding: 6px 11px; border-radius: 100px;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--teal);
          box-shadow: 0 0 8px var(--teal);
          animation: pulse-sentry 1.8s ease-in-out infinite;
        }
        @keyframes pulse-sentry { 0%,100%{ opacity: 1; } 50%{ opacity: 0.35; } }

        .stage-mid {
          position: relative; z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 22px;
          padding-bottom: 6px;
        }

        .headline {
          font-family: var(--mono);
          font-size: clamp(24px, 2.5vw, 32px);
          font-weight: 700;
          line-height: 1.28;
          letter-spacing: -0.01em;
          max-width: 420px;
        }
        .headline .accent { color: var(--teal); }
        .headline .accent2 { color: var(--blue); }

        .sub {
          font-size: 13.5px; color: var(--text-dim); max-width: 400px; line-height: 1.6;
        }

        .term {
          position: relative; z-index: 2;
          margin-top: 6px;
          background: rgba(8,11,16,0.65);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 14px 16px;
          font-family: var(--mono);
          font-size: 11.5px;
          color: var(--text-dim);
          backdrop-filter: blur(6px);
          min-height: 118px;
        }
        .term-row { display: flex; gap: 8px; opacity: 0; animation: rowIn 0.4s forwards; line-height: 1.9; }
        .term-row .ok { color: var(--teal); }
        .term-row .tag { color: var(--text-faint); }
        @keyframes rowIn { to { opacity: 1; } }

        .caret {
          display: inline-block; width: 6px; height: 12px; background: var(--teal);
          margin-left: 2px; animation: blink-sentry 1s step-end infinite; vertical-align: middle;
        }
        @keyframes blink-sentry { 50% { opacity: 0; } }

        .stage-foot {
          position: relative; z-index: 2;
          display: flex; gap: 22px; padding-top: 18px; margin-top: 16px;
          border-top: 1px solid var(--line-soft);
        }
        .metric-label { font-family: var(--mono); font-size: 9.5px; color: var(--text-faint); letter-spacing: 0.1em; }
        .metric-value { font-family: var(--mono); font-size: 15px; color: var(--text); font-weight: 700; margin-top: 3px; }
        .metric-value.teal { color: var(--teal); }

        .panel {
          position: relative;
          padding: 46px 46px 38px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: var(--panel-2);
        }

        .panel-eyebrow {
          font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.16em;
          color: var(--text-faint); text-transform: uppercase; margin-bottom: 10px;
        }
        .panel-title {
          font-family: var(--sans); font-weight: 700; font-size: 26px; color: var(--text);
          letter-spacing: -0.01em;
        }
        .panel-sub { font-size: 13.5px; color: var(--text-dim); margin-top: 8px; margin-bottom: 30px; line-height: 1.55; }

        form { display: flex; flex-direction: column; gap: 16px; }

        .field { display: flex; flex-direction: column; gap: 7px; }
        .field label {
          font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.09em;
          color: var(--text-dim); text-transform: uppercase;
        }
        .input-wrap {
          position: relative;
          display: flex; align-items: center;
          border: 1px solid var(--line);
          background: var(--bg-2);
          border-radius: 10px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .input-wrap svg { margin-left: 13px; flex-shrink: 0; color: var(--text-faint); transition: color 0.18s ease; }
        .input-wrap input {
          width: 100%; background: transparent; border: none; outline: none;
          color: var(--text); font-family: var(--mono); font-size: 13.5px;
          padding: 12.5px 14px 12.5px 10px;
        }
        .input-wrap input::placeholder { color: var(--text-faint); }
        .input-wrap:focus-within {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(45,212,167,0.12);
        }
        .input-wrap:focus-within svg { color: var(--teal); }

        .toggle-visibility {
          background: none; border: none; color: var(--text-faint); cursor: pointer;
          padding: 0 13px; display: flex; align-items: center;
        }
        .toggle-visibility:hover { color: var(--text-dim); }

        .row-between { display: flex; align-items: center; justify-content: space-between; margin-top: 2px; }
        .checkline { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-dim); cursor: pointer; }
        .checkline input {
          appearance: none; width: 15px; height: 15px; border-radius: 4px;
          border: 1px solid var(--line); background: var(--bg-2); cursor: pointer;
          display: grid; place-content: center;
        }
        .checkline input:checked { background: var(--teal); border-color: var(--teal); }
        .checkline input:checked::after {
          content: ''; width: 4px; height: 8px; border: solid #04120d; border-width: 0 2px 2px 0;
          transform: rotate(45deg) translate(-1px,-1px);
        }

        .link {
          font-size: 12.5px; color: var(--teal); text-decoration: none; font-weight: 500;
        }
        .link:hover { text-decoration: underline; }

        .btn-primary {
          margin-top: 10px;
          position: relative;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          background: linear-gradient(135deg, var(--teal), var(--blue));
          color: #051510;
          border: none; border-radius: 10px;
          font-family: var(--sans); font-weight: 700; font-size: 14px;
          padding: 13.5px 18px;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 26px -8px rgba(45,212,167,0.45); }
        .btn-primary:active { transform: translateY(0); }
        
        .btn-primary .shine {
          position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          animation: shine-sentry 3.2s ease-in-out infinite;
        }
        @keyframes shine-sentry {
          0% { left: -60%; } 40% { left: 130%; } 100% { left: 130%; }
        }

        .divider {
          display: flex; align-items: center; gap: 12px; margin: 22px 0 16px;
          color: var(--text-faint); font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em;
        }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--line); }

        .alt-methods { display: flex; gap: 10px; }
        .alt-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px; border-radius: 10px; border: 1px solid var(--line);
          background: var(--bg-2); color: var(--text-dim); font-size: 12.5px; font-weight: 600;
          cursor: pointer; transition: border-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
        }
        .alt-btn:hover { border-color: var(--text-faint); color: var(--text); transform: translateY(-1px); }

        .panel-footer {
          margin-top: 26px; text-align: center; font-size: 12.5px; color: var(--text-dim);
        }

        .trust-strip {
          display: flex; align-items: center; justify-content: center; gap: 16px;
          margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line-soft);
        }
        .trust-item {
          display: flex; align-items: center; gap: 6px; font-size: 10.5px; color: var(--text-faint);
          font-family: var(--mono);
        }
        .trust-item svg { color: var(--teal-dim); }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }
      `}</style>

    </div>
  );
}
