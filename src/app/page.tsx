'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, Key, UserPlus, LogIn, Sparkles, CheckCircle2, ArrowRight, Activity, Terminal } from 'lucide-react';
import './login.css';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Canvas & Terminal simulation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const [terminalRows, setTerminalRows] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalRows(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Ambient network canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let w: number, h: number;
    let nodes: Array<{x: number, y: number, vx: number, vy: number, r: number}> = [];
    let animationFrameId: number;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      w = canvas.width = stage.clientWidth * window.devicePixelRatio;
      h = canvas.height = stage.clientHeight * window.devicePixelRatio;
      canvas.style.width = stage.clientWidth + 'px';
      canvas.style.height = stage.clientHeight + 'px';
    };

    const initNodes = () => {
      const count = Math.max(24, Math.floor((stage.clientWidth * stage.clientHeight) / 20000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3 * window.devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.3 * window.devicePixelRatio,
        r: (Math.random() * 1.5 + 1.0) * window.devicePixelRatio,
      }));
    };

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      const maxDist = 150 * window.devicePixelRatio;

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.35;
            ctx.strokeStyle = `rgba(45,212,167,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(219,230,239,0.6)';
        ctx.fill();
      }

      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    resize();
    initNodes();
    step();

    const handleResize = () => {
      resize();
      initNodes();
      if (reduceMotion) step();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsAuthenticating(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          username,
          password,
          name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Please try again.');
        setIsAuthenticating(false);
        return;
      }

      if (mode === 'signup') {
        setSuccessMsg('Account created successfully! Redirecting to dashboard...');
      } else {
        setSuccessMsg('Authentication successful! Loading your dashboard...');
      }

      setTimeout(() => {
        router.push('/dashboard');
      }, 900);
    } catch {
      setErrorMsg('Network error connecting to authentication service.');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="sentry-login-wrapper">
      <div className="grid-fade"></div>

      <div className="shell">
        {/* ============ LEFT: live network & status stage ============ */}
        <section className="stage" aria-hidden="true" ref={stageRef}>
          <canvas id="net" className="net-canvas" ref={canvasRef}></canvas>
          <div className="scan-line"></div>

          <div className="stage-top">
            <div className="brand">
              <div className="brand-mark">
                <Activity style={{ width: '20px', height: '20px', color: '#fff' }} />
              </div>
              <div>
                <div className="brand-name">Sprint Intelligent KPI Tracking</div>
                <div className="brand-tag">GCP CLOUD ENGINE</div>
              </div>
            </div>
            <div className="status-pill">
              <span className="status-dot"></span>
              GCS PERSISTENT
            </div>
          </div>

          <div className="stage-mid">
            <div>
              <div className="headline">
                Data-driven <span className="accent">intelligence</span> for modern engineering.
              </div>
              <p className="sub">
                Real-time velocity tracking, automated risk radar, and Gemini 2.0 Flash / LLaMA 3.3 AI Copilot integration.
              </p>
            </div>

            <div className="term">
              {terminalRows >= 1 && <div className="term-row"><span className="tag">[gcp]</span> cloud storage mounted<span className="ok">... active</span></div>}
              {terminalRows >= 2 && <div className="term-row"><span className="tag">[db]</span> sqlite synced with GCS<span className="ok"> ✓ ready</span></div>}
              {terminalRows >= 3 && <div className="term-row"><span className="tag">[ai]</span> groq & gemini engines<span className="ok"> ✓ online</span></div>}
              {terminalRows >= 4 && <div className="term-row"><span className="tag">[auth]</span> awaiting user sign-in<span className="caret"></span></div>}
            </div>
          </div>

          <div className="stage-foot">
            <div>
              <div className="metric-label">CLOUD ENGINE</div>
              <div className="metric-value teal">GCP Cloud Run</div>
            </div>
            <div>
              <div className="metric-label">AI COPILOT</div>
              <div className="metric-value">Groq + Gemini</div>
            </div>
            <div>
              <div className="metric-label">DATA VAULT</div>
              <div className="metric-value">GCS Storage</div>
            </div>
          </div>
        </section>

        {/* ============ RIGHT: login / signup panel ============ */}
        <section className="panel">
          {/* Main Title Highlight */}
          <div className="welcome-banner">
            <div className="welcome-tag">
              <Sparkles style={{ width: '14px', height: '14px', color: '#2dd4a7' }} />
              AUTHENTICATION PORTAL
            </div>
            <h1 className="welcome-headline">
              Welcome to Sprint Dashboard
            </h1>
            <p className="welcome-sub">
              Access real-time Agile telemetry, developer capacity, and AI insights.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              <LogIn style={{ width: '15px', height: '15px' }} />
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              <UserPlus style={{ width: '15px', height: '15px' }} />
              Create Account
            </button>
          </div>

          <form autoComplete="off" onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrap">
                  <User style={{ width: '16px', height: '16px', color: '#7d90a3' }} />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="username">Operator ID / Username</label>
              <div className="input-wrap">
                <Shield style={{ width: '16px', height: '16px', color: '#7d90a3' }} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your Operator ID"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Passphrase</label>
              <div className="input-wrap">
                <Lock style={{ width: '16px', height: '16px', color: '#7d90a3' }} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your passphrase"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}
                >
                  <Key style={{ width: '14px', height: '14px', color: '#7d90a3' }} />
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="row-between">
                <label className="checkline">
                  <input type="checkbox" defaultChecked /> Remember this session
                </label>
              </div>
            )}

            {errorMsg && (
              <div className="error-banner">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="success-banner">
                <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                {successMsg}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isAuthenticating}>
              <span className="shine"></span>
              {isAuthenticating
                ? (mode === 'signup' ? 'Creating Account...' : 'Authenticating...')
                : (mode === 'signup' ? 'Create Account & Sign In' : 'Authenticate & Enter')}
              {!isAuthenticating && <ArrowRight style={{ width: '16px', height: '16px' }} />}
            </button>
          </form>

          {/* Footer Security Badges */}
          <div className="trust-strip">
            <div className="trust-item">
              <Shield style={{ width: '12px', height: '12px' }} />
              GCP CLOUD SECURE
            </div>
            <div className="trust-item">
              <Lock style={{ width: '12px', height: '12px' }} />
              GCS VAULT PERSISTENT
            </div>
            <div className="trust-item">
              <Sparkles style={{ width: '12px', height: '12px' }} />
              AI COPILOT READY
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
