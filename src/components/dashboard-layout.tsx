'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './navigation';
import CopilotDrawer from './copilot-drawer';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, ChevronDown, Cpu, RefreshCw, Palette, Sun, Moon, Bot, ShieldAlert, TrendingUp, Zap, Users } from 'lucide-react';

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
    toggleCopilot
  } = useAppStore();

  const isLight = theme === 'light';

  const [showNotif, setShowNotif] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const NOTIFS = [
    { id: 1, color: '#ef4444', title: 'New Blocker Detected', desc: '3 issues blocking Sprint 10', time: '2m ago', unread: true, icon: <ShieldAlert size={14}/> },
    { id: 2, color: '#22c55e', title: 'Velocity Milestone', desc: 'Team exceeded 120 SP this sprint!', time: '18m ago', unread: true, icon: <TrendingUp size={14}/> },
    { id: 3, color: '#6366f1', title: 'AI Risk Alert', desc: 'Sprint completion probability at 34%', time: '1h ago', unread: true, icon: <Zap size={14}/> },
    { id: 4, color: '#f59e0b', title: 'Deploy Success', desc: 'v2.4.1 shipped to production', time: '2h ago', unread: false, icon: <Cpu size={14}/> },
    { id: 5, color: '#2dd4bf', title: 'Team Update', desc: 'Alex Chen completed 5 tasks', time: '3h ago', unread: false, icon: <Users size={14}/> },
  ];
  const unreadCount = NOTIFS.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

  const handleRefresh = () => { refetch(); setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1500); };

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

            {/* AI Copilot button only */}
            <button
              onClick={() => toggleCopilot(true)}
              title="Open AI Copilot"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(45,212,167,0.1) 100%)',
                border: '1px solid rgba(99,102,241,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(99,102,241,0.15)',
                transition: 'all 0.25s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.07)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.35)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.15)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              }}
            >
              <Bot style={{ width: '16px', height: '16px', color: '#6366f1' }} className="animate-pulse" />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#2dd4a7',
                  border: '1.5px solid var(--color-background)',
                  boxShadow: '0 0 6px #2dd4a7'
                }}
              />
            </button>

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
            <button onClick={handleRefresh} title="Refresh Data" style={{ width:'32px', height:'32px', borderRadius:'8px', cursor:'pointer', background: isRefreshing ? 'rgba(34,197,94,0.12)' : 'rgba(30,41,59,0.50)', border:`1px solid ${isRefreshing ? 'rgba(34,197,94,0.3)' : 'var(--color-border)'}`, display:'flex', alignItems:'center', justifyContent:'center', color: isRefreshing ? '#22c55e' : '#475569', transition:'all 200ms ease' }}>
              <RefreshCw style={{ width:'13px', height:'13px', transition: 'transform 0.3s', transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)' }} />
            </button>

            {/* Bell & Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotif(v => !v)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                  background: showNotif ? 'rgba(79,70,229,0.15)' : 'rgba(30,41,59,0.50)',
                  border: `1px solid ${showNotif ? 'rgba(79,70,229,0.3)' : 'var(--color-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: showNotif ? '#6366f1' : '#475569', transition: 'all 200ms ease',
                  position: 'relative',
                }}
              >
                <Bell style={{ width: '13px', height: '13px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '6px', right: '6px',
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--color-accent)',
                    border: '1.5px solid var(--color-background)',
                    boxShadow: '0 0 6px var(--color-glow)',
                  }} />
                )}
              </button>

              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: 'absolute', top: '44px', right: 0, width: '300px', zIndex: 100,
                      background: isLight ? '#ffffff' : '#0f172a',
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-foreground)' }}>Notifications</span>
                        <span style={{ fontSize: '10px', background: 'var(--color-primary)', color: 'var(--color-text-accent)', padding: '2px 6px', borderRadius: '10px' }}>{unreadCount} New</span>
                      </div>
                      <button style={{ fontSize: '11px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>Mark all</button>
                    </div>
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {NOTIFS.map(n => (
                        <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: n.unread ? (isLight ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.05)') : 'transparent', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = n.unread ? (isLight ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.05)') : 'transparent'}>
                          {n.unread && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: n.color }} />}
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${n.color}15`, color: n.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {n.icon}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '12px', fontWeight: n.unread ? 600 : 500, color: 'var(--color-foreground)' }}>{n.title}</span>
                              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#64748b' }}>{n.time}</span>
                            </div>
                            <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>{n.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0, position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </main>

      </div>

      <CopilotDrawer />
    </div>
  );
}
