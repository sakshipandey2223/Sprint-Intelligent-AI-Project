'use client';

import React, { useEffect, useRef } from 'react';
import Navigation from './navigation';
import CopilotDrawer from './copilot-drawer';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, ChevronDown, Database, Cpu, RefreshCw, Palette, Sun, Moon } from 'lucide-react';

/* ── Theme color token maps ───────────────────────────────────────── */
const themeColors = {
  'cyber-pulse': {
    '--color-background': '#020617',
    '--color-primary':    'rgba(15,23,42,0.80)',
    '--color-secondary':  '#1e293b',
    '--color-accent':     '#22c55e',
    '--color-border':     '#334155',
    '--color-text-accent':'#4ade80',
    '--color-glow':       'rgba(34,197,94,0.25)',
  },
  'aurora-nebula': {
    '--color-background': '#060319',
    '--color-primary':    'rgba(23,14,48,0.70)',
    '--color-secondary':  'rgba(43,27,85,0.75)',
    '--color-accent':     '#ec4899',
    '--color-border':     'rgba(139,92,246,0.40)',
    '--color-text-accent':'#f472b6',
    '--color-glow':       'rgba(236,72,153,0.35)',
  },
  'emerald-matrix': {
    '--color-background': '#010502',
    '--color-primary':    'rgba(8,24,14,0.80)',
    '--color-secondary':  'rgba(16,44,28,0.85)',
    '--color-accent':     '#10b981',
    '--color-border':     'rgba(16,185,129,0.35)',
    '--color-text-accent':'#34d399',
    '--color-glow':       'rgba(16,185,129,0.25)',
  },
  'royal-sunset': {
    '--color-background': '#0c0602',
    '--color-primary':    'rgba(28,16,8,0.80)',
    '--color-secondary':  'rgba(48,28,15,0.85)',
    '--color-accent':     '#f97316',
    '--color-border':     'rgba(234,179,8,0.35)',
    '--color-text-accent':'#fb923c',
    '--color-glow':       'rgba(249,115,22,0.25)',
  },
};

/* ── Animated background renderer ─────────────────────────────────── */
function ThemeBackground({ visualTheme, isLight }: { visualTheme: string; isLight: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (visualTheme !== 'emerald-matrix') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width  = (canvas.width  = canvas.offsetWidth  || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);
    const columns = Math.floor(width / 24) + 1;
    const yPositions = Array(columns).fill(0).map(() => Math.random() * -500);

    const drawMatrix = () => {
      ctx.fillStyle = 'rgba(1,5,2,0.15)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(16,185,129,0.35)';
      ctx.font = '10px monospace';
      for (let i = 0; i < yPositions.length; i++) {
        ctx.fillText(Math.random() > 0.5 ? '1' : '0', i * 24, yPositions[i]);
        if (yPositions[i] > height || yPositions[i] > 100 + Math.random() * 20000) {
          yPositions[i] = 0;
        } else {
          yPositions[i] += 14;
        }
      }
    };

    const render = () => { drawMatrix(); animationFrameId = requestAnimationFrame(render); };
    const handleResize = () => {
      width  = canvas.width  = canvas.offsetWidth  || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    render();
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationFrameId); };
  }, [visualTheme]);

  if (isLight) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#f1f5f9]">
        <div className="absolute top-[-15%] right-[-5%] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(79,70,229,0.06)_0%,transparent_65%)] animate-float-slow" style={{ animationDuration: '22s' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(22,163,74,0.05)_0%,transparent_65%)] animate-float-slow" style={{ animationDuration: '18s', animationDelay: '-5s' }} />
      </div>
    );
  }

  if (visualTheme === 'aurora-nebula') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#060319]">
        <div className="absolute top-[-15%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(219,39,119,0.08)_0%,transparent_70%)] animate-float-slow" style={{ animationDuration: '16s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.10)_0%,transparent_70%)] animate-float-slow" style={{ animationDuration: '20s', animationDelay: '-4s' }} />
        <div className="absolute top-[30%] left-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,0.06)_0%,transparent_70%)] animate-float-slow" style={{ animationDuration: '24s', animationDelay: '-8s' }} />
      </div>
    );
  }

  if (visualTheme === 'emerald-matrix') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#010502]">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-[0.16]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#010502_100%)]" />
      </div>
    );
  }

  if (visualTheme === 'royal-sunset') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#0c0602]">
        <div className="absolute top-[-20%] left-[10%] w-[750px] h-[750px] bg-[radial-gradient(circle,rgba(249,115,22,0.07)_0%,transparent_65%)] animate-float-slow" style={{ animationDuration: '22s' }} />
        <div className="absolute bottom-[-15%] right-[-5%] w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(234,179,8,0.06)_0%,transparent_60%)] animate-float-slow" style={{ animationDuration: '18s', animationDelay: '-4s' }} />
      </div>
    );
  }

  /* default: cyber-pulse */
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020617]">
      <div className="absolute bottom-[-15%] right-[-5%] w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(34,197,94,0.04)_0%,transparent_65%)] animate-float-slow" style={{ animationDuration: '18s' }} />
      <div className="absolute top-[-20%] left-[-10%] w-[750px] h-[750px] bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)] animate-float-slow" style={{ animationDuration: '22s' }} />
    </div>
  );
}

/* ── Main layout component ─────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const {
    activeSprintId, setActiveSprintId,
    filters, setFilter,
    visualTheme, setVisualTheme,
    theme, setTheme,
  } = useAppStore();

  const isLight = theme === 'light';

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [isLight]);

  const { refetch } = useQuery({
    queryKey: ['dashboard-data', activeSprintId],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${activeSprintId}`);
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
  });

  return (
    <div className="dashboard-wrapper" style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'var(--color-background)',
      color: 'var(--color-foreground)',
      fontFamily: 'var(--font-ui)',
      position: 'relative',
      transition: 'background 400ms ease, color 400ms ease',
      ...(isLight ? {} : (themeColors[visualTheme || 'cyber-pulse'] as React.CSSProperties)),
    }}>

      {/* Animated bg */}
      <ThemeBackground visualTheme={visualTheme || 'cyber-pulse'} isLight={isLight} />

      <Navigation />

      <div className="dashboard-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* ── TOP HEADER ────────────────────────────── */}
        <header style={{
          height: '54px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
          background: isLight ? 'rgba(255,255,255,0.90)' : 'rgba(2,6,23,0.85)',
          borderBottom: '1px solid var(--color-border)',
          backdropFilter: 'blur(20px)',
          position: 'relative', zIndex: 15,
        }}>

          {/* Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#475569', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search issues, sprints, developers…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              style={{
                width: '100%', fontFamily: 'var(--font-ui)', fontSize: '12px',
                background: 'rgba(30,41,59,0.40)', border: '1px solid var(--color-border)',
                borderRadius: '9px', paddingLeft: '34px', paddingRight: '12px',
                paddingTop: '7px', paddingBottom: '7px',
                color: 'var(--color-foreground)', outline: 'none', transition: 'all 200ms ease',
              }}
            />
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Theme selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Palette style={{ width: '13px', height: '13px', color: 'var(--color-accent)' }} />
              <div style={{ position: 'relative' }}>
                <select
                  value={visualTheme || 'cyber-pulse'}
                  onChange={(e) => setVisualTheme(e.target.value as any)}
                  className="ctrl"
                  style={{ paddingRight: '28px', appearance: 'none', border: '1px solid var(--color-border)', fontSize: '11px', fontFamily: 'var(--font-data)' }}
                >
                  <option value="cyber-pulse"    style={{ background: '#0F172A', color: '#F8FAFC' }}>Cyber Pulse</option>
                  <option value="aurora-nebula"  style={{ background: '#0F172A', color: '#F8FAFC' }}>Aurora Nebula</option>
                  <option value="emerald-matrix" style={{ background: '#0F172A', color: '#F8FAFC' }}>Emerald Matrix</option>
                  <option value="royal-sunset"   style={{ background: '#0F172A', color: '#F8FAFC' }}>Royal Sunset</option>
                </select>
                <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: '#475569', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ width: '1px', height: '22px', background: 'rgba(51,65,85,0.50)' }} />

            {/* Sprint selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#64748b', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700 }}>Sprint</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={activeSprintId}
                  onChange={(e) => setActiveSprintId(Number(e.target.value))}
                  className="ctrl"
                  style={{ paddingRight: '28px', appearance: 'none', border: '1px solid var(--color-border)', fontSize: '11px', fontFamily: 'var(--font-data)' }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n} style={{ background: '#0F172A', color: '#F8FAFC' }}>Sprint {n}{n === 10 ? ' ★' : ''}</option>
                  ))}
                </select>
                <ChevronDown style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '11px', height: '11px', color: '#475569', pointerEvents: 'none' }} />
              </div>
            </div>

            <div style={{ width: '1px', height: '22px', background: 'rgba(51,65,85,0.50)' }} />

            {/* Status pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
                <Database style={{ width: '11px', height: '11px', color: 'var(--color-accent)' }} />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', fontWeight: 700, color: 'var(--color-accent)' }}>DB Live</span>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-accent)', boxShadow: '0 0 6px var(--color-glow)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}>
                <Cpu style={{ width: '11px', height: '11px', color: '#A5B4FC' }} />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', fontWeight: 700, color: '#A5B4FC' }}>AI Ready</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '22px', background: 'rgba(51,65,85,0.50)' }} />

            {/* Light / Dark toggle */}
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              title={isLight ? 'Switch to Dark' : 'Switch to Light'}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                background: isLight ? 'rgba(79,70,229,0.10)' : 'rgba(30,41,59,0.50)',
                border: `1px solid ${isLight ? 'rgba(79,70,229,0.30)' : 'rgba(51,65,85,0.50)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isLight ? '#4f46e5' : '#94a3b8', transition: 'all 200ms ease',
              }}
            >
              {isLight ? <Sun style={{ width: '14px', height: '14px' }} /> : <Moon style={{ width: '13px', height: '13px' }} />}
            </button>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(30,41,59,0.50)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', transition: 'all 200ms ease',
              }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
            </button>

            {/* Bell */}
            <button style={{
              width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(30,41,59,0.50)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#475569', transition: 'all 200ms ease',
              position: 'relative',
            }}>
              <Bell style={{ width: '13px', height: '13px' }} />
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--color-accent)',
                border: '1.5px solid var(--color-background)',
                boxShadow: '0 0 6px var(--color-glow)',
              }} />
            </button>

          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 10 }}>
          {children}
        </main>

      </div>

      <CopilotDrawer />
    </div>
  );
}
