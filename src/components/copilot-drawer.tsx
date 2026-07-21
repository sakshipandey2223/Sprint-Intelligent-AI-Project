'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Bot, X, Send, Trash2, Sparkles, Terminal, ShieldAlert,
  Zap, Cpu, Sliders, Activity, ChevronLeft, ChevronRight, Maximize2, Copy, Check, CornerDownLeft
} from 'lucide-react';
import { useAppStore, Message } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';

/* ────────────────────────── Markdown Renderer ───────────────────────── */
function Markdown({ text, isDark }: { text: string; isDark: boolean }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let inCode = false;
  let codeLines: string[] = [];

  const fmt = (str: string): React.ReactNode => {
    const bold = str.split(/\*\*([^*]+)\*\*/g);
    return bold.map((part, i) => {
      if (i % 2 === 1) return <strong key={i} style={{ color: '#a78bfa', fontWeight: 700 }}>{part}</strong>;
      const code = part.split(/`([^`]+)`/g);
      return code.map((cp, ci) => {
        if (ci % 2 === 1) return (
          <code key={ci} style={{
            background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(99,102,241,0.08)',
            color: '#ec4899',
            padding: '1px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '11px',
            border: '1px solid rgba(236,72,153,0.2)'
          }}>{cp}</code>
        );
        const it = cp.split(/\*([^*]+)\*/g);
        return it.map((ip, ii) => ii % 2 === 1
          ? <em key={ii} style={{ color: isDark ? '#94a3b8' : '#64748b', fontStyle: 'italic' }}>{ip}</em>
          : ip
        );
      });
    });
  };

  lines.forEach((line, idx) => {
    const t = line.trim();
    if (t.startsWith('```')) {
      if (inCode) {
        elements.push(
          <div key={`code-${idx}`} style={{
            margin: '10px 0',
            padding: '12px 16px',
            borderRadius: '10px',
            background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(30,41,59,0.06)',
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#10b981',
            overflowX: 'auto',
          }}>
            <pre style={{ margin: 0, lineHeight: 1.65 }}>{codeLines.join('\n')}</pre>
          </div>
        );
        codeLines = []; inCode = false;
      } else { inCode = true; }
      return;
    }
    if (inCode) { codeLines.push(line); return; }

    if (t.startsWith('|')) {
      if (t.includes('---')) return;
      inTable = true;
      tableRows.push(line.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1));
      return;
    } else if (inTable) {
      elements.push(
        <div key={`tbl-${idx}`} style={{ overflowX: 'auto', margin: '10px 0', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}>
                {tableRows[0]?.map((c, ci) => <th key={ci} style={{ padding: '8px 12px', textAlign: 'left', color: isDark ? '#c4b5fd' : '#6366f1', fontWeight: 700, fontFamily: 'monospace', fontSize: '10px' }}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, ri) => (
                <tr key={ri} style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` }}>
                  {row.map((c, ci) => <td key={ci} style={{ padding: '7px 12px', color: isDark ? '#94a3b8' : '#475569', verticalAlign: 'top', fontSize: '11px' }}>{fmt(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = []; inTable = false;
    }

    if (t === '') { elements.push(<div key={`br-${idx}`} style={{ height: '6px' }} />); return; }

    if (t.startsWith('# '))
      elements.push(<h1 key={idx} style={{ fontSize: '15px', fontWeight: 800, margin: '14px 0 8px', color: isDark ? '#fff' : '#0f172a', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, paddingBottom: '6px' }}>{fmt(t.slice(2))}</h1>);
    else if (t.startsWith('## '))
      elements.push(<h2 key={idx} style={{ fontSize: '13px', fontWeight: 700, margin: '12px 0 6px', color: isDark ? '#e2e8f0' : '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ width: '3px', height: '16px', borderRadius: '3px', background: 'linear-gradient(180deg, #6366f1, #a78bfa)', display: 'inline-block', flexShrink: 0 }} />{fmt(t.slice(3))}
      </h2>);
    else if (t.startsWith('### '))
      elements.push(<h3 key={idx} style={{ fontSize: '11px', fontWeight: 700, margin: '10px 0 4px', color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
        <Sparkles style={{ width: '10px', height: '10px' }} />{fmt(t.slice(4))}
      </h3>);
    else if (t.startsWith('#### '))
      elements.push(<h4 key={idx} style={{ fontSize: '10px', fontWeight: 700, margin: '8px 0 3px', color: '#2dd4bf', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{fmt(t.slice(5))}</h4>);
    else if (t.startsWith('- ') || t.startsWith('* '))
      elements.push(
        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '5px' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #2dd4bf)', marginTop: '6px', flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6 }}>{fmt(t.slice(2))}</span>
        </div>
      );
    else if (t.match(/^\d+\.\s/)) {
      const m = t.match(/^(\d+)\.\s(.*)/);
      elements.push(
        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '5px', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'monospace', color: '#6366f1', fontWeight: 800, fontSize: '12px', minWidth: '18px', flexShrink: 0 }}>{m?.[1]}.</span>
          <span style={{ fontSize: '12px', color: isDark ? '#cbd5e1' : '#334155', lineHeight: 1.6 }}>{fmt(m?.[2] || '')}</span>
        </div>
      );
    } else {
      elements.push(<p key={idx} style={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#475569', lineHeight: 1.7, marginBottom: '5px' }}>{fmt(line)}</p>);
    }
  });
  if (inTable && tableRows.length > 0) {
    elements.push(
      <div key="tbl-end" style={{ overflowX: 'auto', margin: '10px 0', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead><tr style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)' }}>
            {tableRows[0]?.map((c, ci) => <th key={ci} style={{ padding: '8px 12px', textAlign: 'left', color: isDark ? '#c4b5fd' : '#6366f1', fontWeight: 700, fontFamily: 'monospace' }}>{c}</th>)}
          </tr></thead>
          <tbody>{tableRows.slice(1).map((row, ri) => (
            <tr key={ri} style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)'}` }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: '7px 12px', color: isDark ? '#94a3b8' : '#475569' }}>{fmt(c)}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
    );
  }
  return <div style={{ lineHeight: 1.65 }}>{elements}</div>;
}

/* ─────────────────────────── Constants ──────────────────────────────── */
const PERSONAS = [
  { id: 'scrum', name: 'Scrum Master', icon: Bot, color: '#2dd4a7', suffix: '\nRespond as an expert Agile Scrum Master. Focus on sprint velocity, team flow, and removing blockers.' },
  { id: 'risk', name: 'Risk Analyst', icon: ShieldAlert, color: '#f43f5e', suffix: '\nRespond as a Senior Risk Analyst. Focus on blockers, delivery confidence, and capacity overflow risks.' },
  { id: 'devops', name: 'DevOps', icon: Terminal, color: '#6366f1', suffix: '\nRespond as a DevOps Engineer. Focus on infrastructure telemetry, CI/CD health, and deployments.' },
] as const;

const QUICK_CMDS = [
  { cmd: '/summary', label: 'Executive Summary', icon: Sparkles, q: 'Generate a comprehensive executive sprint summary report for stakeholders with key metrics and recommendations.' },
  { cmd: '/blockers', label: 'Blocker Analysis', icon: ShieldAlert, q: 'Analyze all current sprint blockers in detail and provide remediation paths for each one.' },
  { cmd: '/predict', label: 'Sprint Forecast', icon: Zap, q: 'Forecast sprint completion probability based on current velocity and remaining capacity.' },
  { cmd: '/workload', label: 'Capacity Audit', icon: Cpu, q: 'Audit developer workloads and identify overloaded team members with suggested rebalancing.' },
];

const MIN_WIDTH = 420;
const MAX_WIDTH = 820;
const DEFAULT_WIDTH = 520;

/* ─────────────────────────── Main Component ─────────────────────────── */
export default function CopilotDrawer() {
  const { isCopilotOpen, toggleCopilot, copilotMessages, addCopilotMessage, clearCopilotHistory, theme } = useAppStore();
  const isDark = theme === 'dark';

  const [inputValue, setInputValue] = useState('');
  const [persona, setPersona] = useState<'scrum' | 'risk' | 'devops'>('scrum');
  const [showConfig, setShowConfig] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeStartX = useRef(0);
  const resizeStartW = useRef(0);

  const activePersona = PERSONAS.find(p => p.id === persona)!;

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (isCopilotOpen) setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [isCopilotOpen, copilotMessages]);

  /* ── Canvas neural net background ── */
  useEffect(() => {
    if (!isCopilotOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width, H = canvas.height;
    const COUNT = 35;
    const pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const dotAlpha = isDark ? 0.22 : 0.12;
      const lineAlpha = isDark ? 0.06 : 0.04;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(99,102,241,${dotAlpha})` : `rgba(26,115,232,${dotAlpha})`;
        ctx.fill();
        pts.forEach(p2 => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark ? `rgba(45,212,167,${lineAlpha * (1 - d / 120)})` : `rgba(99,102,241,${lineAlpha * (1 - d / 120)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [isDark, isCopilotOpen, panelWidth]);

  /* ── Drag to resize ── */
  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    resizeStartX.current = e.clientX;
    resizeStartW.current = panelWidth;
    setIsResizing(true);
    const onMove = (ev: MouseEvent) => {
      const delta = resizeStartX.current - ev.clientX;
      setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStartW.current + delta)));
    };
    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [panelWidth]);

  /* ── Build history ── */
  const buildHistory = () =>
    copilotMessages.slice(1).map((m: Message) => ({
      role: m.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }],
    }));

  /* ── Mutation ── */
  const mutation = useMutation({
    mutationFn: async (q: string) => {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, history: buildHistory() }),
      });
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
    onSuccess: (data) => addCopilotMessage('bot', data.answer),
    onError: () => addCopilotMessage('bot', `🔴 **Connection Error**: Failed to reach AI engine. Please try again.`),
  });

  const sendMessage = (text: string) => {
    if (!text.trim() || mutation.isPending) return;
    addCopilotMessage('user', text.trim());
    setInputValue('');
    setShowSlash(false);
    mutation.mutate(text.trim() + activePersona.suffix);
    if (inputRef.current) inputRef.current.style.height = '44px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputValue); }
    if (e.key === 'Escape') { setShowSlash(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setShowSlash(val.startsWith('/'));
    // Auto grow
    const ta = e.target;
    ta.style.height = '44px';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  /* ──────────────────── Render ──────────────────── */
  return (
    <AnimatePresence>
      {isCopilotOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCopilot(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 45 }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0,
              width: `${panelWidth}px`,
              height: '100vh',
              display: 'flex', flexDirection: 'column',
              zIndex: 50,
              background: isDark
                ? 'linear-gradient(180deg, rgba(7,11,22,0.97) 0%, rgba(10,15,30,0.97) 100%)'
                : 'linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.98) 100%)',
              borderLeft: `1px solid ${isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.12)'}`,
              boxShadow: isDark ? '-20px 0 60px rgba(0,0,0,0.5)' : '-20px 0 60px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(24px)',
              cursor: isResizing ? 'col-resize' : 'default',
            }}
          >
            {/* Live Canvas Background */}
            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: isDark ? 0.6 : 0.35 }} />

            {/* Drag Resize Handle */}
            <div
              onMouseDown={onResizeStart}
              title="Drag to resize panel"
              style={{
                position: 'absolute', left: -3, top: 0, width: '6px', height: '100%',
                cursor: 'col-resize', zIndex: 60,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{
                width: '2px', height: '48px', borderRadius: '2px',
                background: isResizing ? '#6366f1' : (isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)'),
                transition: 'background 0.2s, width 0.2s',
              }} />
            </div>

            {/* ─── Header ─── */}
            <div style={{
              padding: '16px 20px 12px',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
              position: 'relative', zIndex: 10, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                {/* Left: brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <motion.div
                    animate={{ boxShadow: ['0 0 12px rgba(99,102,241,0.2)', '0 0 22px rgba(45,212,167,0.3)', '0 0 12px rgba(99,102,241,0.2)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                      background: `linear-gradient(135deg, ${activePersona.color}25, rgba(99,102,241,0.15))`,
                      border: `1px solid ${activePersona.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Bot style={{ width: '18px', height: '18px', color: activePersona.color }} />
                  </motion.div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', letterSpacing: '-0.01em' }}>Sprint Copilot</span>
                      <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: '#2dd4bf', background: 'rgba(45,212,167,0.1)', border: '1px solid rgba(45,212,167,0.25)', padding: '1px 7px', borderRadius: '99px', letterSpacing: '0.06em' }}>v2.1</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <motion.span
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}
                        />
                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isDark ? '#64748b' : '#94a3b8' }}>ONLINE</span>
                      </div>
                      <span style={{ fontSize: '9px', color: isDark ? '#334155' : '#cbd5e1' }}>•</span>
                      <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isDark ? '#64748b' : '#94a3b8' }}>Groq LLaMA-3.3-70B</span>
                    </div>
                  </div>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setShowConfig(v => !v)}
                    title="AI Parameters"
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
                      background: showConfig ? 'rgba(99,102,241,0.15)' : 'transparent',
                      border: `1px solid ${showConfig ? 'rgba(99,102,241,0.4)' : 'transparent'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: showConfig ? '#a78bfa' : (isDark ? '#475569' : '#94a3b8'),
                      transition: 'all 0.2s',
                    }}
                  ><Sliders style={{ width: '13px', height: '13px' }} /></button>
                  <button
                    onClick={clearCopilotHistory}
                    title="Clear chat"
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
                      background: 'transparent', border: '1px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isDark ? '#475569' : '#94a3b8', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = isDark ? '#475569' : '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                  ><Trash2 style={{ width: '13px', height: '13px' }} /></button>
                  <button
                    onClick={() => toggleCopilot(false)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer',
                      background: 'transparent', border: '1px solid transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isDark ? '#475569' : '#94a3b8', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = isDark ? '#fff' : '#0f172a'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = isDark ? '#475569' : '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                  ><X style={{ width: '14px', height: '14px' }} /></button>
                </div>
              </div>

              {/* Collapsible Config */}
              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden', marginBottom: '10px' }}
                  >
                    <div style={{
                      padding: '12px 14px', borderRadius: '12px',
                      background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(99,102,241,0.03)',
                      border: `1px solid ${isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        <Activity style={{ width: '12px', height: '12px', color: '#a78bfa' }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#c4b5fd' : '#6366f1', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Parameters</span>
                      </div>
                      {[
                        { label: 'Panel Width', unit: 'px', min: MIN_WIDTH, max: MAX_WIDTH, step: 10, val: panelWidth, color: '#6366f1', set: setPanelWidth },
                      ].map(cfg => (
                        <div key={cfg.label} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', color: isDark ? '#94a3b8' : '#64748b' }}>{cfg.label}</span>
                            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: cfg.color, fontWeight: 700 }}>{cfg.val}{cfg.unit}</span>
                          </div>
                          <input type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={cfg.val}
                            onChange={e => cfg.set(Number(e.target.value))}
                            style={{ width: '100%', accentColor: cfg.color }} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Persona Tabs */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px', padding: '4px',
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)',
                borderRadius: '12px',
              }}>
                {PERSONAS.map(p => {
                  const Icon = p.icon;
                  const active = persona === p.id;
                  return (
                    <button key={p.id}
                      onClick={() => setPersona(p.id as any)}
                      style={{
                        padding: '7px 6px', borderRadius: '9px', cursor: 'pointer',
                        background: active ? (isDark ? 'rgba(255,255,255,0.07)' : '#fff') : 'transparent',
                        border: `1px solid ${active ? p.color + '40' : 'transparent'}`,
                        boxShadow: active ? `0 2px 8px ${p.color}18` : 'none',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Icon style={{ width: '13px', height: '13px', color: active ? p.color : (isDark ? '#475569' : '#94a3b8') }} />
                      <span style={{ fontSize: '9px', fontWeight: 700, color: active ? (isDark ? '#e2e8f0' : '#1e293b') : (isDark ? '#475569' : '#94a3b8'), letterSpacing: '0.03em' }}>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ─── Messages ─── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 10 }}>
              <AnimatePresence initial={false}>
                {copilotMessages.map((msg: Message) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 14, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: isUser ? 'flex-end' : 'flex-start',
                        maxWidth: isUser ? '80%' : '95%',
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {/* Sender label */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px', paddingLeft: isUser ? 0 : '2px', paddingRight: isUser ? '2px' : 0 }}>
                        {!isUser && (
                          <div style={{ width: '18px', height: '18px', borderRadius: '6px', background: `${activePersona.color}18`, border: `1px solid ${activePersona.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot style={{ width: '10px', height: '10px', color: activePersona.color }} />
                          </div>
                        )}
                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isDark ? '#334155' : '#94a3b8' }}>
                          {isUser ? 'You' : 'Sprint AI'} · {msg.timestamp}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div style={{ position: 'relative' }} className="group">
                        <div style={{
                          padding: isUser ? '10px 16px' : '14px 18px',
                          borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                          background: isUser
                            ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #7c3aed 100%)'
                            : (isDark ? 'rgba(255,255,255,0.04)' : '#ffffff'),
                          border: isUser ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                          boxShadow: isUser
                            ? '0 4px 20px rgba(99,102,241,0.3)'
                            : isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
                          color: isUser ? '#fff' : (isDark ? '#cbd5e1' : '#334155'),
                        }}>
                          {isUser
                            ? <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0, fontWeight: 500, whiteSpace: 'pre-line' }}>{msg.text}</p>
                            : <Markdown text={msg.text} isDark={isDark} />
                          }
                        </div>

                        {/* Copy button on hover */}
                        {!isUser && (
                          <button
                            onClick={() => copyMessage(msg.id, msg.text)}
                            style={{
                              position: 'absolute', top: '8px', right: '-30px',
                              width: '24px', height: '24px', borderRadius: '6px',
                              background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s',
                              color: isDark ? '#64748b' : '#94a3b8',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                            title="Copy message"
                          >
                            {copied === msg.id
                              ? <Check style={{ width: '11px', height: '11px', color: '#22c55e' }} />
                              : <Copy style={{ width: '11px', height: '11px' }} />
                            }
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Thinking indicator */}
              {mutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'flex-start' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '6px', background: `${activePersona.color}18`, border: `1px solid ${activePersona.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot style={{ width: '10px', height: '10px', color: activePersona.color }} />
                    </div>
                    <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isDark ? '#334155' : '#94a3b8' }}>Sprint AI · Processing...</span>
                  </div>
                  <div style={{
                    padding: '14px 18px', borderRadius: '4px 18px 18px 18px',
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
                    boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.2)' : '0 2px 12px rgba(0,0,0,0.06)',
                    minWidth: '180px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#2dd4bf', flexShrink: 0 }}
                      />
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isDark ? '#475569' : '#94a3b8' }}>Analyzing telemetry...</span>
                    </div>
                    <div style={{ width: '100%', height: '3px', borderRadius: '3px', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                      <motion.div
                        style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #2dd4bf)', borderRadius: '3px' }}
                        animate={{ width: ['2%', '35%', '62%', '80%', '94%'] }}
                        transition={{ duration: 12, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* ─── Quick Suggestions (shown only on welcome state) ─── */}
            {copilotMessages.length === 1 && !mutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '0 20px 12px',
                  position: 'relative', zIndex: 10,
                }}
              >
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: '10px', height: '10px', color: '#a78bfa' }} />
                  <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#334155' : '#94a3b8' }}>Quick Directives</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {QUICK_CMDS.map((qc, i) => {
                    const Icon = qc.icon;
                    return (
                      <motion.button
                        key={qc.cmd}
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessage(qc.q)}
                        disabled={mutation.isPending}
                        style={{
                          padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                          background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
                          boxShadow: isDark ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Icon style={{ width: '11px', height: '11px', color: '#6366f1' }} />
                          <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 800, color: '#6366f1', letterSpacing: '0.05em' }}>{qc.cmd}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: isDark ? '#64748b' : '#64748b', lineHeight: 1.4, display: 'block' }}>{qc.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Slash command menu */}
            <AnimatePresence>
              {showSlash && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    margin: '0 12px 8px',
                    padding: '6px',
                    borderRadius: '14px',
                    background: isDark ? 'rgba(7,11,22,0.98)' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    zIndex: 20, position: 'relative',
                  }}
                >
                  <div style={{ padding: '4px 8px 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: isDark ? '#334155' : '#94a3b8' }}>Commands</span>
                  </div>
                  {QUICK_CMDS.map(qc => {
                    const Icon = qc.icon;
                    return (
                      <button key={qc.cmd}
                        onClick={() => sendMessage(qc.q)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: '9px', cursor: 'pointer',
                          background: 'transparent', border: 'none', textAlign: 'left', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon style={{ width: '13px', height: '13px', color: '#6366f1' }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>{qc.label}</span>
                        </div>
                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#a78bfa', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '2px 7px', borderRadius: '6px', fontWeight: 700 }}>{qc.cmd}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Input Area ─── */}
            <div style={{
              padding: '12px 16px 20px',
              borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
              background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(248,250,252,0.9)',
              position: 'relative', zIndex: 10, flexShrink: 0,
            }}>
              {/* Slash hint bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <button
                  onClick={() => { setInputValue('/'); setShowSlash(true); inputRef.current?.focus(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '3px 9px', borderRadius: '7px', cursor: 'pointer',
                    background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.15)'}`,
                    color: '#a78bfa', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)'; }}
                >
                  <Sparkles style={{ width: '10px', height: '10px' }} />/ Commands
                </button>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isDark ? '#1e293b' : '#cbd5e1' }}>
                  Shift+Enter for newline · Enter to send
                </span>
              </div>

              {/* Textarea + Send row */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <div style={{
                  flex: 1,
                  borderRadius: '16px',
                  border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.15)'}`,
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
                  boxShadow: isDark ? '0 0 0 rgba(99,102,241,0)' : '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'border-color 0.25s, box-shadow 0.25s',
                  overflow: 'hidden',
                }}
                  onFocusCapture={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = '#6366f1';
                    el.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                  }}
                  onBlurCapture={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.15)';
                    el.style.boxShadow = isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={mutation.isPending}
                    placeholder="Ask about sprints, blockers, velocity, or type '/' for commands..."
                    rows={1}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      lineHeight: 1.55,
                      color: isDark ? '#e2e8f0' : '#1e293b',
                      minHeight: '44px',
                      maxHeight: '120px',
                      display: 'block',
                    }}
                  />
                </div>

                {/* Send Button */}
                <motion.button
                  type="button"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || mutation.isPending}
                  whileHover={!inputValue.trim() || mutation.isPending ? {} : { scale: 1.05 }}
                  whileTap={!inputValue.trim() || mutation.isPending ? {} : { scale: 0.95 }}
                  style={{
                    width: '48px', height: '48px', borderRadius: '15px', cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                    background: inputValue.trim() && !mutation.isPending
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'),
                    border: `1px solid ${inputValue.trim() && !mutation.isPending ? 'rgba(99,102,241,0.6)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: inputValue.trim() && !mutation.isPending ? '0 4px 16px rgba(99,102,241,0.35)' : 'none',
                    transition: 'all 0.25s', flexShrink: 0,
                  }}
                >
                  <Send style={{
                    width: '17px', height: '17px',
                    color: inputValue.trim() && !mutation.isPending ? '#fff' : (isDark ? '#334155' : '#94a3b8'),
                    transform: 'rotate(-10deg)',
                  }} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
