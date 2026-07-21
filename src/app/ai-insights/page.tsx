'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import {
  Brain, Sparkles, AlertTriangle, Lightbulb, TrendingUp,
  FileText, RefreshCw, Users, Activity, Zap, Send,
  Shield, Settings2, ToggleLeft, ToggleRight, Copy, Check,
  ChevronRight, ArrowRight, Cpu, Star, BarChart3,
} from 'lucide-react';

// ── Markdown renderer (theme-safe style) ─────────────────────────────
function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let isInTable = false;

  const renderText = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) return <strong key={index} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{part}</strong>;
      const italicParts = part.split(/\*([^*]+)\*/g);
      return italicParts.map((ip, i) => {
        if (i % 2 === 1) return <em key={i} style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{ip}</em>;
        return ip;
      });
    });
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|')) {
      if (trimmed.includes('---')) return;
      isInTable = true;
      const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      tableRows.push(cells);
      return;
    } else if (isInTable) {
      renderedElements.push(
        <div key={`table-${idx}`} style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--color-card-border)', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'var(--color-markdown-table-thead-bg)', borderBottom: '1px solid var(--color-card-border)' }}>
                {tableRows[0]?.map((cell, cIdx) => (
                  <th key={cIdx} style={{ padding: '10px 14px', textAlign: 'left', color: 'var(--color-text-primary)', fontWeight: 700, fontFamily: 'monospace' }}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(1).map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid var(--color-card-border)', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-card-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '10px 14px', color: 'var(--color-text-muted)', verticalAlign: 'top' }}>{renderText(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = []; isInTable = false;
    }

    if (trimmed === '') { renderedElements.push(<div key={`br-${idx}`} style={{ height: '10px' }} />); return; }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={idx} style={{ fontSize: '20px', fontWeight: 800, margin: '18px 0 10px', paddingBottom: '8px', borderBottom: '1px solid var(--color-card-border)', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {renderText(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={idx} style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '16px 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '3px', height: '16px', borderRadius: '3px', background: 'var(--color-accent)', display: 'inline-block', flexShrink: 0 }} />
          {renderText(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', margin: '12px 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
          <Sparkles style={{ width: '11px', height: '11px', flexShrink: 0 }} />
          {renderText(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '7px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', marginTop: '6px', flexShrink: 0, display: 'inline-block' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>{renderText(trimmed.substring(2))}</p>
        </div>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      renderedElements.push(
        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '7px' }}>
          <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)', fontWeight: 800, fontSize: '13px', flexShrink: 0, minWidth: '20px' }}>{match?.[1]}.</span>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>{renderText(match?.[2] || '')}</p>
        </div>
      );
    } else {
      renderedElements.push(
        <p key={idx} style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '8px' }}>{renderText(line)}</p>
      );
    }
  });

  return <div style={{ lineHeight: 1.7 }}>{renderedElements}</div>;
}

// ── Widget definitions ───────────────────────────────────────────────
interface WidgetDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  border: string;
  badge: string;
  enabled: boolean;
  prompt: string;
}

const DEFAULT_WIDGETS: WidgetDef[] = [
  {
    id: 'health', title: 'Sprint Health Assessment', description: 'Completion probability, morale indicators, burndown progress and overall health score.',
    icon: Shield, gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', glow: 'rgba(34,197,94,0.3)', border: 'rgba(34,197,94,0.3)', badge: 'Health', enabled: true,
    prompt: 'Perform a comprehensive sprint health assessment. Cover: current sprint status, completion probability, team morale indicators, burndown progress, and overall health score with specific reasoning. Format with clear sections and bullet points.',
  },
  {
    id: 'risks', title: 'Risk Radar', description: 'Top risks by severity, likelihood, business impact, and mitigation actions.',
    icon: AlertTriangle, gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', glow: 'rgba(239,68,68,0.3)', border: 'rgba(239,68,68,0.3)', badge: 'Risk', enabled: true,
    prompt: 'Identify and analyze the top risks threatening this sprint. For each risk: severity (High/Medium/Low), likelihood, business impact, and mitigation action. Include risks from blockers, overloaded developers, scope, and velocity trends.',
  },
  {
    id: 'recommendations', title: 'AI Recommendations', description: 'Specific, actionable recommendations to improve this sprint outcome.',
    icon: Lightbulb, gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', glow: 'rgba(245,158,11,0.3)', border: 'rgba(245,158,11,0.3)', badge: 'Actions', enabled: true,
    prompt: 'Generate 5-7 specific, actionable recommendations for the scrum master and team lead to improve this sprint outcome. Each recommendation should include: the problem, the action, who should do it, and expected impact. Be very specific using the actual data.',
  },
  {
    id: 'team', title: 'Team Performance Analysis', description: 'Per-developer metrics, workload distribution, and burnout risk analysis.',
    icon: Users, gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', glow: 'rgba(99,102,241,0.3)', border: 'rgba(99,102,241,0.3)', badge: 'Team', enabled: true,
    prompt: "Analyze each developer's performance, workload, and wellbeing. Identify who is overloaded, underutilized, performing exceptionally well, or at risk of burnout. Include specific story point data and utilization percentages. Suggest load rebalancing actions.",
  },
  {
    id: 'velocity', title: 'Velocity & Trend Analysis', description: 'Sprint velocity trends, predictions, and commitment vs completion analysis.',
    icon: TrendingUp, gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', glow: 'rgba(14,165,233,0.3)', border: 'rgba(14,165,233,0.3)', badge: 'Trends', enabled: true,
    prompt: 'Analyze sprint velocity trends across all historical sprints. Calculate average velocity, trend direction (improving/declining), predict next sprint capacity, and identify root causes of velocity changes. Include a commitment vs completion analysis.',
  },
  {
    id: 'executive', title: 'Executive Summary', description: 'C-level sprint overview with key metrics, delivery confidence, and decisions.',
    icon: FileText, gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', glow: 'rgba(139,92,246,0.3)', border: 'rgba(139,92,246,0.3)', badge: 'C-Level', enabled: true,
    prompt: 'Write a professional executive summary report for senior stakeholders. Include: sprint overview, key metrics, delivery confidence, major risks, team status, and recommended decisions. Use a formal, concise tone suitable for C-level presentation. Make it data-rich and specific.',
  },
];

// ── Single Analysis Widget Card ──────────────────────────────────────
function InsightCard({ widget, index }: { widget: WidgetDef; index: number }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: widget.prompt, type: widget.id }),
      });
      const data = await res.json();
      setContent(data.result || data.error || 'No response from AI.');
      setGenerated(true);
    } catch {
      setContent('❌ Failed to connect to AI. Please check your API key.');
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  }, [widget]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = widget.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={!loading ? { y: -3, transition: { duration: 0.2 } } : {}}
      style={{
        background: 'var(--color-card-ambient)',
        border: `1px solid ${generated ? widget.border : 'var(--color-card-border)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: generated ? `0 0 30px ${widget.glow.replace('0.3', '0.12')}` : 'none',
        transition: 'border-color 0.4s, box-shadow 0.4s',
      }}
    >
      {/* ── Card Header ── */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--color-card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${widget.glow.replace('0.3', '0.07')} 0%, transparent 100%)`,
        transition: 'background 0.4s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: generated ? widget.gradient : 'var(--color-stat-bg)',
            border: `1px solid ${widget.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: generated ? `0 0 20px ${widget.glow}` : 'none',
            transition: 'all 0.4s',
            flexShrink: 0,
          }}>
            <Icon style={{ width: '18px', height: '18px', color: generated ? '#fff' : 'var(--color-text-faint)', transition: 'color 0.3s' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
              {widget.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: generated ? '#22c55e' : '#6366f1', display: 'inline-block' }}
                className={generated ? '' : 'animate-pulse'} />
              <span style={{ fontSize: '10px', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>
                {generated ? 'Analysis Ready' : 'Groq LLaMA 3.3 70B'}
              </span>
              <span style={{ padding: '1px 6px', borderRadius: '8px', fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, background: `${widget.glow.replace('0.3','0.12')}`, border: `1px solid ${widget.border}`, color: 'var(--color-text-secondary)' }}>
                {widget.badge}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {generated && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              onClick={handleCopy}
              style={{ padding: '7px 12px', borderRadius: '10px', border: '1px solid var(--color-card-border)', background: 'var(--color-card-ambient)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text-secondary)', fontSize: '11px', fontWeight: 600 }}
            >
              {copied ? <Check style={{ width: '12px', color: '#22c55e' }} /> : <Copy style={{ width: '12px' }} />}
              {copied ? 'Copied!' : 'Copy'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={generate}
            disabled={loading}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              cursor: loading ? 'wait' : 'pointer',
              background: loading ? 'rgba(99,102,241,0.4)' : widget.gradient,
              color: '#fff', fontSize: '12px', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: loading ? 'none' : `0 6px 20px -4px ${widget.glow}`,
              transition: 'all 0.3s ease',
              opacity: loading ? 0.75 : 1,
            }}
          >
            {loading
              ? <><Cpu style={{ width: '13px', animation: 'spin 1s linear infinite' }} /> Analyzing...</>
              : generated
              ? <><RefreshCw style={{ width: '13px' }} /> Refresh</>
              : <><Sparkles style={{ width: '13px' }} /> Generate</>
            }
          </motion.button>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div style={{ flex: 1, position: 'relative', minHeight: '140px' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            // ── Loading state ──
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '32px' }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid rgba(99,102,241,0.15)' }} />
                <div style={{
                  position: 'absolute', inset: 0, width: '60px', height: '60px', borderRadius: '50%',
                  border: '2px solid transparent',
                  borderTopColor: widget.gradient.includes('#22c55e') ? '#22c55e' : widget.gradient.includes('#ef4444') ? '#ef4444' : widget.gradient.includes('#f59e0b') ? '#f59e0b' : widget.gradient.includes('#0ea5e9') ? '#0ea5e9' : widget.gradient.includes('#8b5cf6') ? '#8b5cf6' : '#6366f1',
                  borderRightColor: 'rgba(99,102,241,0.3)',
                  animation: 'spin 1s linear infinite',
                }} />
                <div style={{ position: 'absolute', inset: '10px', width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-stat-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles style={{ width: '16px', color: '#a5b4fc' }} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Synthesizing Analysis</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>AI is processing sprint telemetry...</div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', animation: 'bounce 1.2s ease infinite', animationDelay: `${i * 0.15}s`, opacity: 0.6 }} />
                ))}
              </div>
            </motion.div>
          ) : generated ? (
            // ── Generated content ──
            <motion.div key="content"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              style={{ padding: '20px', overflowY: 'auto', maxHeight: '340px' }}
            >
              <Markdown text={content} />
            </motion.div>
          ) : (
            // ── Empty / idle state ──
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '28px' }}
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
                style={{
                  width: '56px', height: '56px', borderRadius: '16px',
                  background: widget.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 12px 30px -6px ${widget.glow}`,
                  opacity: 0.75,
                }}
              >
                <Icon style={{ width: '26px', color: '#fff' }} />
              </motion.div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>{widget.description}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-faint)' }}>Click <strong style={{ color: 'var(--color-accent)' }}>Generate</strong> to run AI analysis</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── AI Copilot Chat ──────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'ai'; text: string; }

function AIChat() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    'Summarize the current sprint health in 3 bullet points.',
    'Who is most likely to burn out this sprint?',
    'What are the top 3 risks to delivery?',
    'Compare last 3 sprint velocities.',
    'Write a standup report for today.',
    'What should the team focus on tomorrow?',
  ];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    const history = messages.map(m => ({ role: m.role === 'user' ? 'user' as const : 'model' as const, parts: [{ text: m.text }] }));
    try {
      const res = await fetch('/api/copilot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: text, history }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.answer || data.error }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: '❌ Failed to connect to AI.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{
        background: 'var(--color-card-ambient)',
        border: '1px solid var(--color-card-border)',
        borderRadius: '20px',
        display: 'flex', flexDirection: 'column',
        height: '520px',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(99,102,241,0.08)',
      }}
    >
      {/* Chat Header */}
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--color-card-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--color-panel-header-bg)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 28px rgba(99,102,241,0.4)' }}>
            <Brain style={{ width: '22px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-text-primary)', marginBottom: '3px' }}>Sprint Intelligence AI</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="animate-pulse" />
              <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>Groq LLaMA 3.3 70B · Full sprint context loaded</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Live', color: '#22c55e' },
            { label: 'AI Ready', color: '#6366f1' },
          ].map((badge, i) => (
            <span key={i} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, background: `${badge.color}15`, border: `1px solid ${badge.color}35`, color: badge.color }}>
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', paddingBottom: '20px' }}
          >
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px -10px rgba(99,102,241,0.4)' }}
            >
              <Brain style={{ width: '30px', color: '#fff' }} />
            </motion.div>
            <div style={{ textAlign: 'center', maxWidth: '360px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Ask me anything</div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                I have full context of your sprints, issues, and team. Ask about risks, velocity, blockers, or request a standup report.
              </p>
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 10 : -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {msg.role === 'ai' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '10px', alignSelf: 'flex-end', marginBottom: '2px' }}>
                <Sparkles style={{ width: '13px', color: '#fff' }} />
              </div>
            )}
            <div style={{
              maxWidth: '82%', padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'var(--color-bg-secondary)',
              border: msg.role === 'ai' ? '1px solid var(--color-card-border)' : 'none',
              boxShadow: msg.role === 'user' ? '0 8px 20px -5px rgba(99,102,241,0.4)' : 'none',
            }}>
              {msg.role === 'user'
                ? <p style={{ color: '#fff', fontSize: '13px', margin: 0, lineHeight: 1.5 }}>{msg.text}</p>
                : <Markdown text={msg.text} />
              }
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles style={{ width: '13px', color: '#fff' }} />
            </div>
            <div style={{ display: 'flex', gap: '5px', padding: '12px 16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-card-border)', borderRadius: '18px 18px 18px 4px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', animation: 'bounce 1.2s infinite', animationDelay: `${i * 150}ms`, display: 'inline-block' }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: '10px 20px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--color-card-border)', flexShrink: 0 }}
          >
            {SUGGESTIONS.map((q, i) => (
              <motion.button key={i}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03, borderColor: 'var(--color-accent)' }} whileTap={{ scale: 0.97 }}
                onClick={() => send(q)} disabled={loading}
                style={{ padding: '5px 11px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', background: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-card-border)', transition: 'all 0.2s', fontWeight: 500 }}
              >
                {q}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send(input); }}
        style={{ padding: '14px 20px', borderTop: '1px solid var(--color-card-border)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask anything about your sprint, team, risks, or blockers..."
          disabled={loading}
          style={{ flex: 1, padding: '11px 18px', borderRadius: '14px', fontSize: '13px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-card-border)', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
          onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-card-border)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
          type="submit" disabled={!input.trim() || loading}
          style={{ width: '44px', height: '44px', borderRadius: '14px', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', background: input.trim() && !loading ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0, boxShadow: input.trim() && !loading ? '0 8px 20px -5px rgba(99,102,241,0.5)' : 'none' }}
        >
          <Send style={{ width: '17px', color: '#fff' }} />
        </motion.button>
      </form>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function AIInsightsPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [widgets, setWidgets] = useState<WidgetDef[]>(DEFAULT_WIDGETS);

  const toggleWidget = (id: string) => setWidgets(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  const enabledWidgets = widgets.filter(w => w.enabled);

  return (
    <DashboardLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── Animated Header Banner ── */}
        <div style={{
          position: 'relative', padding: '28px 32px 24px', flexShrink: 0,
          background: 'var(--color-panel-header-bg)',
          borderBottom: '1px solid var(--color-card-border)',
          overflow: 'hidden',
        }}>
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: '-60px', right: '80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '-30px', right: '300px', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.3)' }}>
                <Brain style={{ width: '26px', color: '#fff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}>AI Insights</h1>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em' }}>
                    GROQ LLaMA 3.3 70B
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  AI Copilot chat · 6 on-demand analysis widgets · Real-time sprint telemetry context
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {[
                { label: String(enabledWidgets.length), sub: 'Active Widgets', icon: BarChart3, color: '#6366f1' },
                { label: 'Live', sub: 'Data Feed', icon: Activity, color: '#22c55e' },
                { label: 'AI', sub: 'Copilot', icon: Brain, color: '#a855f7' },
              ].map((stat, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 + 0.2 }}
                  style={{ padding: '10px 14px', background: 'var(--color-stat-bg)', border: '1px solid var(--color-stat-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <stat.icon style={{ width: '14px', color: stat.color }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{stat.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.sub}</div>
                  </div>
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettings(s => !s)}
                style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--color-card-border)', background: showSettings ? 'rgba(99,102,241,0.15)' : 'var(--color-stat-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, color: showSettings ? 'var(--color-accent)' : 'var(--color-text-muted)', transition: 'all 0.2s' }}
              >
                <Settings2 style={{ width: '14px' }} />
                Customize Widgets
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ── Scrollable Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* ── Widget Settings Panel ── */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: '24px' }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '18px', overflow: 'hidden' }}
              >
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <Settings2 style={{ width: '16px', color: 'var(--color-accent)' }} />
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Visible Analysis Widgets</h3>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-faint)' }}>{enabledWidgets.length}/{widgets.length} active</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                    {widgets.map((w, i) => {
                      const Icon = w.icon;
                      return (
                        <motion.button key={w.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => toggleWidget(w.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', background: w.enabled ? `${w.glow.replace('0.3', '0.08')}` : 'var(--color-stat-bg)', border: `1px solid ${w.enabled ? w.border : 'var(--color-card-border)'}`, transition: 'all 0.2s', textAlign: 'left', boxShadow: w.enabled ? `0 0 16px ${w.glow.replace('0.3', '0.08')}` : 'none' }}
                        >
                          <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: w.enabled ? w.gradient : 'var(--color-stat-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.25s' }}>
                            <Icon style={{ width: '15px', color: w.enabled ? '#fff' : 'var(--color-text-faint)' }} />
                          </div>
                          <span style={{ fontSize: '13px', flex: 1, color: w.enabled ? 'var(--color-text-primary)' : 'var(--color-text-faint)', fontWeight: 600, transition: 'color 0.2s' }}>{w.title}</span>
                          {w.enabled
                            ? <ToggleRight style={{ width: '20px', color: '#22c55e', flexShrink: 0 }} />
                            : <ToggleLeft style={{ width: '20px', color: 'var(--color-text-faint)', flexShrink: 0 }} />}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── AI Copilot Chat ── */}
          <div style={{ marginBottom: '32px' }}>
            <AIChat />
          </div>

          {/* ── Analysis Widgets Grid ── */}
          {enabledWidgets.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '3px', height: '22px', borderRadius: '3px', background: 'linear-gradient(to bottom, #6366f1, #a855f7)' }} />
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                  On-Demand Analysis Widgets
                </h2>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)', fontFamily: 'monospace', fontWeight: 700 }}>
                  {enabledWidgets.length} active
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '18px' }}>
                {enabledWidgets.map((widget, i) => (
                  <InsightCard key={widget.id} widget={widget} index={i} />
                ))}
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '60px', background: 'var(--color-stat-bg)', border: '1px solid var(--color-card-border)', borderRadius: '20px' }}>
              <ToggleLeft style={{ width: '44px', margin: '0 auto 16px', display: 'block', color: 'var(--color-text-faint)' }} />
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '14px' }}>All widgets are disabled. Click <strong style={{ color: 'var(--color-accent)' }}>Customize Widgets</strong> above to re-enable them.</p>
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </DashboardLayout>
  );
}
