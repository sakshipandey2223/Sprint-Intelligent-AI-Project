'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import './login.css'; // Import the isolated CSS for the login page

export default function Home() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [terminalRows, setTerminalRows] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Terminal boot log simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalRows(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 600);
    return () => clearInterval(timer);
  }, []);

  // Ambient network graph
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

      for (const n of nodes){
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++){
        for (let j = i + 1; j < nodes.length; j++){
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist){
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

      for (const n of nodes){
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(219,230,239,0.55)';
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

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (formData.get('handle') === 'admin' && formData.get('pass') === 'admin') {
      setErrorMsg('');
      setIsAuthenticating(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } else {
      setErrorMsg('Invalid credentials. Please use admin / admin.');
    }
  };

  return (
    <div className="sentry-login-wrapper">
      <div className="grid-fade"></div>
      
      <div className="shell">
        {/* ============ LEFT: live stage ============ */}
        <section className="stage" aria-hidden="true" ref={stageRef}>
          <canvas id="net" className="net-canvas" ref={canvasRef}></canvas>
          <div className="scan-line"></div>

          <div className="stage-top">
            <div className="brand">
              <div className="brand-mark">S</div>
              <div>
                <div className="brand-name">Sprint Intelligent KPI Tracking Agent</div>
                <div className="brand-tag">DASHBOARD</div>
              </div>
            </div>
            <div className="status-pill"><span className="status-dot"></span>LINK SECURE</div>
          </div>

          <div className="stage-mid">
            <div>
              <div className="headline">Data-driven<br/>insights by <span className="accent">design</span>, not <span className="accent2">assumption</span>.</div>
              <p className="sub">Every session on this Dashboard is encrypted end-to-end and verified against known-good signatures before it ever reaches the vault. Nothing sneaky. Just disciplined tracking.</p>
            </div>

            <div className="term">
              {terminalRows >= 1 && <div className="term-row"><span className="tag">[boot]</span> initializing secure channel<span className="ok">... done</span></div>}
              {terminalRows >= 2 && <div className="term-row"><span className="tag">[tls]</span> handshake verified <span className="ok">✓ 256-bit</span></div>}
              {terminalRows >= 3 && <div className="term-row"><span className="tag">[scan]</span> zero known vulnerabilities <span className="ok">✓ clear</span></div>}
              {terminalRows >= 4 && <div className="term-row"><span className="tag">[wait]</span> awaiting credentials<span className="caret"></span></div>}
            </div>
          </div>

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

        {/* ============ RIGHT: login panel ============ */}
        <section className="panel">
          <div className="panel-eyebrow">Secure sign-in</div>
          <h1 className="panel-title">Welcome to Sprint Dashboard</h1>
          <p className="panel-sub">Sign in with your verified credentials to access team performance and KPI tracking.</p>

          <form autoComplete="off" onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="handle">Operator ID</label>
              <div className="input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6 12 13 2 6"/><path d="M2 6h20v12H2z"/></svg>
                <input id="handle" name="handle" type="text" placeholder="admin" required defaultValue="admin" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="pass">Passphrase</label>
              <div className="input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input id="pass" name="pass" type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" required defaultValue="admin" />
                <button type="button" className="toggle-visibility" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide passphrase' : 'Show passphrase'}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div className="row-between">
              <label className="checkline"><input type="checkbox" defaultChecked /> Keep this device trusted</label>
              <a href="#" className="link">Forgot passphrase?</a>
            </div>

            {errorMsg && <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '4px' }}>{errorMsg}</div>}

            <button type="submit" className="btn-primary" disabled={isAuthenticating}>
              <span className="shine"></span>
              {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
              {!isAuthenticating && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>}
            </button>
          </form>

          <div className="divider">OR CONTINUE WITH</div>

          <div className="alt-methods">
            <button className="alt-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.9-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.41.1 2.66.64.7 1.03 1.59 1.03 2.68 0 3.84-2.35 4.68-4.58 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>
              Passkey
            </button>
            <button className="alt-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
              Authenticator
            </button>
          </div>

          <div className="trust-strip">
            <div className="trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 6v6c0 5 4 8.5 9 10 5-1.5 9-5 9-10V6l-9-4Z"/></svg>
              AUDITED
            </div>
            <div className="trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ENCRYPTED
            </div>
            <div className="trust-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              NO DATA SOLD
            </div>
          </div>

          <p className="panel-footer">New operator? <a href="#" className="link">Request an invitation</a></p>
        </section>
      </div>
    </div>
  );
}
