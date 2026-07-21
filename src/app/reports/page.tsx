'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import {
  FileText, Bot, Copy, Download, Check, Cpu, Sparkles,
  Zap, Users, ChevronRight, ArrowRight, BookOpen, Target, Activity, Shield, TrendingUp
} from 'lucide-react';

// ── Markdown Renderer ────────────────────────────────────────────────
function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let isInTable = false;

  const renderText = (str: string) => {
    const parts = str.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{part}</strong>;
      }
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
      tableRows = [];
      isInTable = false;
    }

    if (trimmed === '') { renderedElements.push(<div key={`br-${idx}`} style={{ height: '10px' }} />); return; }

    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={idx} style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '20px 0 12px', paddingBottom: '8px', borderBottom: '1px solid var(--color-card-border)', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {renderText(trimmed.substring(2))}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={idx} style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: '18px 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '3px', height: '18px', borderRadius: '3px', background: 'var(--color-accent)', display: 'inline-block' }}></span>
          {renderText(trimmed.substring(3))}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={idx} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', margin: '14px 0 8px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'monospace' }}>
          <Sparkles style={{ width: '12px', height: '12px' }} />
          {renderText(trimmed.substring(4))}
        </h3>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      renderedElements.push(
        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', marginTop: '6px', flexShrink: 0, display: 'inline-block' }}></span>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>{renderText(trimmed.substring(2))}</p>
        </div>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      renderedElements.push(
        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)', fontWeight: 800, fontSize: '13px', flexShrink: 0, minWidth: '20px' }}>{match?.[1]}.</span>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.65, margin: 0 }}>{renderText(match?.[2] || '')}</p>
        </div>
      );
    } else {
      renderedElements.push(
        <p key={idx} style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '10px' }}>{renderText(line)}</p>
      );
    }
  });

  return <div style={{ lineHeight: 1.7 }}>{renderedElements}</div>;
}

// ── Report Template Cards Data ────────────────────────────────────────
const REPORT_TEMPLATES = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'C-suite level sprint overview with KPIs, risk exposure, and delivery confidence.',
    icon: Target,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    glow: 'rgba(99,102,241,0.2)',
    border: 'rgba(99,102,241,0.25)',
    badge: 'C-Level',
    prompt: 'Write a comprehensive executive summary report for senior stakeholders about the current sprint. Include sprint goals, completion rate, blocked issues, team utilization, key risks, delivery confidence score, and 3 strategic recommendations. Format as a professional board-level document.',
  },
  {
    id: 'standup',
    name: 'Daily Standup Notes',
    description: 'Automated standup notes with blockers, progress, and team focus for today.',
    icon: Activity,
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
    glow: 'rgba(14,165,233,0.2)',
    border: 'rgba(14,165,233,0.25)',
    badge: 'Daily',
    prompt: 'Generate today\'s team standup notes. For each developer, summarize: what they completed yesterday, what they plan today, and any blockers. Include sprint health status and top 3 priorities. Keep it concise and action-oriented.',
  },
  {
    id: 'retrospective',
    name: 'Sprint Retrospective',
    description: 'Deep retrospective analysis covering wins, challenges, and process improvements.',
    icon: BookOpen,
    gradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
    glow: 'rgba(16,185,129,0.2)',
    border: 'rgba(16,185,129,0.25)',
    badge: 'Sprint End',
    prompt: 'Generate a detailed sprint retrospective report. Cover: what went well (with specific examples and metrics), what could be improved (root cause analysis), action items for next sprint, team morale assessment, and process improvement recommendations. Include velocity analysis.',
  },
  {
    id: 'release',
    name: 'Release Readiness',
    description: 'Comprehensive pre-release assessment with quality gates and deployment checklist.',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    glow: 'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.25)',
    badge: 'Pre-Release',
    prompt: 'Generate a release readiness assessment report. Analyze: completion percentage of committed scope, defect density, blocked critical issues, security checklist status, performance benchmarks, release risk score (1-10), go/no-go recommendation, and deployment checklist.',
  },
  {
    id: 'team-performance',
    name: 'Team Performance',
    description: 'Individual developer metrics, load distribution, and burnout risk analysis.',
    icon: Users,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    glow: 'rgba(236,72,153,0.2)',
    border: 'rgba(236,72,153,0.25)',
    badge: 'Team',
    prompt: 'Generate a detailed team performance report. For each developer: story points completed vs assigned, defect density, utilization percentage, burnout risk level, velocity trend, and strengths/areas for growth. Include team-level recommendations for workload balancing.',
  },
  {
    id: 'velocity',
    name: 'Velocity & Forecasting',
    description: 'Sprint velocity trends, predictive analytics, and delivery timeline projections.',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    glow: 'rgba(6,182,212,0.2)',
    border: 'rgba(6,182,212,0.25)',
    badge: 'Analytics',
    prompt: 'Generate a velocity and forecasting report. Include: velocity trend across last 10 sprints, rolling average, commitment vs completion ratio, delivery predictability score, projected completion date for current backlog, sprint capacity recommendations, and confidence intervals for next 3 sprints.',
  },
];

// ── Main Page Component ───────────────────────────────────────────────
export default function Reports() {
  const [activeId, setActiveId] = useState('executive');
  const [reportContent, setReportContent] = useState('');
  const [copied, setCopied] = useState(false);

  const activeTemplate = REPORT_TEMPLATES.find(t => t.id === activeId)!;

  const generateMutation = useMutation({
    mutationFn: async (queryPrompt: string) => {
      const res = await fetch('/api/copilot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: queryPrompt }) });
      if (!res.ok) throw new Error('AI engine error');
      return res.json();
    },
    onSuccess: (data) => setReportContent(data.answer),
  });

  const handleCopy = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Sprint_Report_${activeId}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── Animated Header Banner ─────────────────────────── */}
        <div style={{
          position: 'relative', padding: '28px 32px 24px', flexShrink: 0,
          background: 'var(--color-panel-header-bg)',
          borderBottom: '1px solid var(--color-card-border)',
          overflow: 'hidden',
        }}>
          {/* Glow orb */}
          <div style={{ position: 'absolute', top: '-60px', right: '60px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.3)',
              }}>
                <FileText style={{ width: '26px', color: '#fff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}>AI Report Orchestration</h1>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em' }}>
                    GROQ LLaMA 3.3 70B
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  6 premium report templates · Auto-generated using real sprint telemetry · One-click markdown export
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: '6', sub: 'Templates', icon: BookOpen, color: '#6366f1' },
                { label: 'Live', sub: 'Data Feed', icon: Activity, color: '#22c55e' },
                { label: '.md', sub: 'Export Format', icon: Download, color: '#0ea5e9' },
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 + 0.2 }}
                  style={{ padding: '10px 16px', background: 'var(--color-stat-bg)', border: '1px solid var(--color-stat-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <stat.icon style={{ width: '14px', color: stat.color }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{stat.label}</div>
                    <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{stat.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Main Workspace ─────────────────────────────────── */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, overflow: 'hidden' }}>

          {/* ─ Left Panel: Template Cards ─────────────────── */}
          <div style={{ padding: '24px', borderRight: '1px solid var(--color-card-border)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text-faint)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Report Templates
            </div>

            {REPORT_TEMPLATES.map((template, i) => {
              const Icon = template.icon;
              const isActive = template.id === activeId;
              return (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => { setActiveId(template.id); setReportContent(''); }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: '14px', cursor: 'pointer',
                    background: isActive ? 'var(--color-accent)1f' : 'var(--color-card-ambient)',
                    border: isActive ? `1px solid var(--color-accent)` : '1px solid var(--color-card-border)',
                    boxShadow: isActive ? `0 0 20px ${template.glow}` : 'none',
                    transition: 'all 0.25s ease',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--color-card-hover)'; e.currentTarget.style.borderColor = 'var(--color-accent)40'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'var(--color-card-ambient)'; e.currentTarget.style.borderColor = 'var(--color-card-border)'; } }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: isActive ? template.gradient : 'var(--color-stat-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.25s',
                  }}>
                    <Icon style={{ width: '16px', color: isActive ? '#fff' : 'var(--color-text-faint)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', marginBottom: '3px' }}>{template.name}</div>
                      <span style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, background: isActive ? 'rgba(99,102,241,0.15)' : 'var(--color-stat-bg)', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-faint)', flexShrink: 0 }}>{template.badge}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{template.description}</div>
                  </div>
                  {isActive && <ChevronRight style={{ width: '14px', color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />}
                </motion.button>
              );
            })}

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => generateMutation.mutate(activeTemplate.prompt)}
              disabled={generateMutation.isPending}
              style={{
                marginTop: '8px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', cursor: generateMutation.isPending ? 'wait' : 'pointer',
                background: generateMutation.isPending
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: generateMutation.isPending ? 'none' : '0 10px 30px -5px rgba(99,102,241,0.45)',
                transition: 'all 0.3s ease',
                opacity: generateMutation.isPending ? 0.7 : 1,
              }}
            >
              <Cpu style={{ width: '16px', animation: generateMutation.isPending ? 'spin 1s linear infinite' : 'none' }} />
              {generateMutation.isPending ? 'Generating Report...' : 'Generate with AI'}
              {!generateMutation.isPending && <Zap style={{ width: '14px', color: '#fde68a' }} />}
            </motion.button>
          </div>

          {/* ─ Right Panel: Report Viewer ──────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Active Template Header */}
            <div style={{
              padding: '16px 28px', borderBottom: '1px solid var(--color-card-border)',
              background: `linear-gradient(135deg, ${activeTemplate.glow.replace('0.3', '0.06')} 0%, transparent 60%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
              transition: 'background 0.4s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '7px 14px', borderRadius: '10px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700,
                  background: `${activeTemplate.glow.replace('0.3', '0.15')}`,
                  border: `1px solid ${activeTemplate.border}`,
                  color: 'var(--color-text-primary)',
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: reportContent ? '#22c55e' : '#6366f1' }} className={reportContent ? '' : 'animate-pulse'} />
                  {reportContent ? 'Report Ready' : 'Ready to Generate'}
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{activeTemplate.name}</span>
              </div>

              {reportContent && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCopy} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--color-card-border)', background: 'var(--color-card-ambient)', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    {copied ? <Check style={{ width: '13px', color: '#22c55e' }} /> : <Copy style={{ width: '13px' }} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button onClick={handleDownload} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--color-card-border)', background: 'var(--color-card-ambient)', color: 'var(--color-text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    <Download style={{ width: '13px' }} />Download .md
                  </button>
                </motion.div>
              )}
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode="wait">
                {generateMutation.isPending ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '40px' }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)' }} />
                      <div style={{ position: 'absolute', inset: 0, width: '80px', height: '80px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#a855f7', animation: 'spin 1s linear infinite' }} />
                      <div style={{ position: 'absolute', inset: '12px', width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-stat-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles style={{ width: '22px', color: '#a5b4fc' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', maxWidth: '380px' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Synthesizing Report</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>AI is analyzing live sprint telemetry, developer metrics, velocity trends, and risk factors to compile your {activeTemplate.name}...</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', animation: `bounce 1.2s ease infinite`, animationDelay: `${i * 0.15}s`, opacity: 0.6 }} />
                      ))}
                    </div>
                  </motion.div>
                ) : reportContent ? (
                  <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '28px' }}
                  >
                    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
                      <Markdown text={reportContent} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', padding: '40px' }}
                  >
                    {/* Big animated preview card */}
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: '200px', height: '240px', borderRadius: '20px',
                        background: 'var(--color-empty-preview-bg)',
                        border: `1px solid var(--color-card-border)`,
                        boxShadow: `0 30px 80px -20px ${activeTemplate.glow}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
                        padding: '24px',
                      }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: activeTemplate.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 28px ${activeTemplate.glow}` }}>
                        <activeTemplate.icon style={{ width: '28px', color: '#fff' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{activeTemplate.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{activeTemplate.badge} Report</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        {[0.7, 0.5, 0.6, 0.4].map((w, i) => (
                          <div key={i} style={{ height: '6px', borderRadius: '3px', background: `var(--color-accent)`, opacity: w * 0.4, width: `${w * 100}%` }} />
                        ))}
                      </div>
                    </motion.div>

                    <div style={{ textAlign: 'center', maxWidth: '400px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Ready to Generate</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                        {activeTemplate.description} Click the button on the left to generate your premium AI report using real sprint data.
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => generateMutation.mutate(activeTemplate.prompt)}
                        style={{ padding: '12px 28px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: activeTemplate.gradient, color: '#fff', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: `0 12px 30px -5px ${activeTemplate.glow}` }}
                      >
                        Generate Report <ArrowRight style={{ width: '16px' }} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </DashboardLayout>
  );
}
