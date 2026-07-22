'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
  Activity, Flame, Target, ShieldAlert, TrendingUp, Users,
  ArrowUpRight, ArrowDownRight, Bot, CheckSquare, Zap, AlertTriangle,
  Clock, Star, ChevronRight, BarChart3, Layers,
} from 'lucide-react';

/* ── Animation variants ─────────────────────────── */
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};
const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

/* ── Count-Up hook ─────────────────────────────── */
function useCountUp(target: number, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(Math.round(start));
      if (start >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

/* ── Animated Stat Card ────────────────────────── */
function StatCard({ value, label, sub, icon, color, trend, isDark }: {
  value: number; label: string; sub: string; icon: React.ReactNode; color: string;
  trend: 'up' | 'down'; isDark: boolean;
}) {
  const display = useCountUp(value);
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, boxShadow: `0 12px 36px ${color}20` }}
      style={{
        padding: '22px 20px',
        borderRadius: '20px',
        background: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)'}`,
        boxShadow: isDark ? `0 4px 24px rgba(0,0,0,0.2)` : '0 2px 12px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: '12px',
        position: 'relative', overflow: 'hidden',
        cursor: 'default', transition: 'box-shadow 0.3s',
      }}
    >
      {/* Accent glow top-right */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: '100px', height: '100px', borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon + trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '13px', flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          {icon}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 8px', borderRadius: '8px',
          background: trend === 'up' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          color: trend === 'up' ? '#22c55e' : '#ef4444',
          fontSize: '10px', fontFamily: 'monospace', fontWeight: 700,
        }}>
          {trend === 'up'
            ? <ArrowUpRight style={{ width: '12px', height: '12px' }} />
            : <ArrowDownRight style={{ width: '12px', height: '12px' }} />
          }
        </div>
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontSize: '32px', fontWeight: 900, lineHeight: 1,
          color: isDark ? '#ffffff' : '#0f172a',
          fontFamily: 'var(--font-ui)', letterSpacing: '-0.03em',
        }}>{display}</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: isDark ? '#94a3b8' : '#475569', marginTop: '6px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: isDark ? '#475569' : '#94a3b8', marginTop: '3px' }}>{sub}</div>
      </div>

      {/* Bottom colored bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: '2px', borderRadius: '2px', background: `linear-gradient(90deg, ${color}, ${color}40)`, marginTop: 'auto' }}
      />
    </motion.div>
  );
}

/* ── Developer Avatar with Image Fallback ────────── */
function DevAvatarImg({ src, name, fallbackBg, initials }: { src?: string; name: string; fallbackBg: string; initials: string }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          objectFit: 'cover',
          flexShrink: 0,
          border: `1.5px solid ${fallbackBg}50`,
          boxShadow: `0 2px 8px ${fallbackBg}25`
        }}
      />
    );
  }

  return (
    <div style={{
      width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
      background: `${fallbackBg}20`, border: `2px solid ${fallbackBg}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '11px', fontWeight: 800, color: fallbackBg, fontFamily: 'var(--font-ui)',
    }}>
      {initials}
    </div>
  );
}


/* ── SVG Ring Progress ─────────────────────────── */
function RingProgress({ value, max, color, size = 100, strokeWidth = 8, label, subLabel, isDark }: {
  value: number; max: number; color: string; size?: number; strokeWidth?: number;
  label?: string; subLabel?: string; isDark: boolean;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProg(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - prog)}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: isDark ? '#fff' : '#0f172a', fontFamily: 'var(--font-ui)', lineHeight: 1 }}>{value}</span>
          {subLabel && <span style={{ fontSize: '9px', color: isDark ? '#475569' : '#94a3b8', fontFamily: 'monospace', marginTop: '2px' }}>{subLabel}</span>}
        </div>
      </div>
      {label && <span style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#64748b' : '#94a3b8', textAlign: 'center' }}>{label}</span>}
    </div>
  );
}

/* ── Custom Tooltip ─────────────────────────────── */
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(7,11,22,0.97)', border: '1px solid rgba(99,102,241,0.2)',
      borderRadius: '12px', padding: '10px 14px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontSize: '10px', color: '#6366f1', fontFamily: 'monospace', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color || p.fill, flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>{p.name}:</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: p.color || p.fill, fontFamily: 'monospace' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Severity badge ─────────────────────────────── */
const SEV: Record<string, { bg: string; text: string; label: string }> = {
  critical: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', label: 'CRITICAL' },
  high:     { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', label: 'HIGH' },
  medium:   { bg: 'rgba(99,102,241,0.12)', text: '#6366f1', label: 'MEDIUM' },
  low:      { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', label: 'LOW' },
};

/* ══════════════════════ MAIN COMPONENT ══════════════════════ */
export default function Dashboard() {
  const { activeSprintId, toggleCopilot, theme } = useAppStore();
  const isDark = theme === 'dark';

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data', activeSprintId],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${activeSprintId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#2dd4bf' }}
          />
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: isDark ? '#475569' : '#94a3b8', letterSpacing: '0.05em' }}>Compiling sprint telemetry…</span>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, developers, epics, issues, burndown, velocityHistory, analyticsSummary } = data;
  const S = sprints.find((s: any) => s.id === activeSprintId) || sprints[sprints.length - 1];
  const blocked = issues.filter((i: any) => i.isBlocked);
  const highRisk = issues.filter((i: any) => i.status !== 'Done' && i.riskScore > 40)
    .sort((a: any, b: any) => b.riskScore - a.riskScore).slice(0, 4);
  const healthColor = S.healthScore >= 85 ? '#22c55e' : S.healthScore >= 65 ? '#f59e0b' : '#ef4444';
  const donePct = Math.round((S.completedPoints / S.targetPoints) * 100);

  const issuesByStatus = ['To Do', 'In Progress', 'Review', 'Done', 'Blocked'].map(st => ({
    name: st, value: issues.filter((i: any) => i.status === st).length,
  }));
  const PIE_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#22c55e', '#ef4444'];

  const sprintDevRows = developers.slice(0, 6).map((dev: any) => {
    const devIssues = issues.filter((i: any) => i.assigneeId === dev.id);
    const done = devIssues.filter((i: any) => i.status === 'Done').length;
    const pct = devIssues.length > 0 ? Math.round((done / devIssues.length) * 100) : 0;
    return { ...dev, done, total: devIssues.length, pct };
  });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '🌅 Good Morning' : hour < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';

  const T = {
    bg: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',
    text: isDark ? '#ffffff' : '#0f172a',
    muted: isDark ? '#94a3b8' : '#64748b',
    faint: isDark ? '#475569' : '#94a3b8',
    thead: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    rowHover: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
    divider: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
    progressBg: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    shadow: isDark ? '0 4px 24px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.06)',
  };

  return (
    <DashboardLayout>
      <motion.div
        variants={stagger} initial="hidden" animate="show"
        style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px', minHeight: '100%' }}
      >
        {/* ─── PAGE HEADER ─── */}
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: T.faint, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
              Dashboard · Sprint {activeSprintId}
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: T.text, letterSpacing: '-0.03em', fontFamily: 'var(--font-ui)', lineHeight: 1.1 }}>
              Sprint Command Center
            </h1>
            <p style={{ fontSize: '13px', color: T.muted, marginTop: '4px' }}>
              {greeting} — Real-time intelligence across {sprints.length} sprints
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Health Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px', borderRadius: '14px',
              background: `${healthColor}12`, border: `1px solid ${healthColor}30`,
              boxShadow: `0 0 16px ${healthColor}18`,
            }}>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '8px', height: '8px', borderRadius: '50%', background: healthColor }}
              />
              <span style={{ fontSize: '12px', fontWeight: 700, color: healthColor, fontFamily: 'monospace' }}>
                HEALTH {S.healthScore}/100
              </span>
            </div>

            {/* AI Copilot button */}
            <motion.button
              onClick={() => toggleCopilot(true)}
              whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(99,102,241,0.35)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                borderRadius: '14px', cursor: 'pointer',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                border: '1px solid rgba(99,102,241,0.5)',
                color: '#ffffff',
                fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700,
                boxShadow: '0 4px 16px rgba(99,102,241,0.25)',
              }}
            >
              <Bot style={{ width: '15px', height: '15px' }} />
              Ask AI Copilot
            </motion.button>
          </div>
        </motion.div>

        {/* ─── ROW 1: 4 STAT CARDS ─── */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { value: S.healthScore, label: 'Sprint Health', sub: 'Score out of 100', icon: <Activity style={{ width: '18px' }} />, color: healthColor, trend: S.healthScore >= 65 ? 'up' : 'down' as 'up' | 'down' },
            { value: developers.length, label: 'Engineers', sub: 'Active team members', icon: <Users style={{ width: '18px' }} />, color: '#6366f1', trend: 'up' as 'up' | 'down' },
            { value: issues.length, label: 'Total Issues', sub: `${S.completionRate}% completion rate`, icon: <CheckSquare style={{ width: '18px' }} />, color: '#0ea5e9', trend: 'up' as 'up' | 'down' },
            { value: S.targetPoints, label: 'Story Points', sub: `${S.completedPoints} completed so far`, icon: <Target style={{ width: '18px' }} />, color: '#f59e0b', trend: S.completionRate > 50 ? 'up' : 'down' as 'up' | 'down' },
          ].map(stat => (
            <StatCard key={stat.label} {...stat} isDark={isDark} />
          ))}
        </motion.div>

        {/* ─── ROW 2: SPRINT PROGRESS + RING METRICS + VELOCITY CHART ─── */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.8fr', gap: '14px' }}>

          {/* Sprint Progress Panel */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>Sprint Progress</span>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: T.faint, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', padding: '3px 8px', borderRadius: '6px', border: `1px solid ${T.border}` }}>
                LIVE
              </span>
            </div>

            {/* Large ring */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <RingProgress value={donePct} max={100} color="#6366f1" size={120} strokeWidth={10}
                label="Completion %" subLabel="of target SP" isDark={isDark} />
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Completed', val: S.completedPoints, color: '#22c55e', unit: 'SP' },
                { label: 'Remaining', val: S.targetPoints - S.completedPoints, color: '#f59e0b', unit: 'SP' },
                { label: 'Velocity', val: S.velocity, color: '#6366f1', unit: 'SP/sprint' },
                { label: 'Blockers', val: blocked.length, color: '#ef4444', unit: 'active' },
              ].map(m => (
                <div key={m.label} style={{
                  padding: '10px 12px', borderRadius: '12px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${T.border}`,
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: m.color, fontFamily: 'var(--font-ui)' }}>{m.val}</div>
                  <div style={{ fontSize: '10px', color: T.muted, marginTop: '2px' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ring KPIs */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>KPI Rings</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <RingProgress value={analyticsSummary?.completionProbability || 0} max={100} color="#0ea5e9" size={88} strokeWidth={8}
                  label="Delivery Confidence" subLabel="%" isDark={isDark} />
                <RingProgress value={Math.round(developers.reduce((a: number, d: any) => a + d.utilization, 0) / developers.length)} max={100}
                  color="#f59e0b" size={88} strokeWidth={8} label="Avg Utilization" subLabel="%" isDark={isDark} />
              </div>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <RingProgress value={issues.filter((i: any) => i.status === 'Done').length} max={issues.length}
                  color="#22c55e" size={88} strokeWidth={8} label="Issues Resolved" subLabel={`/${issues.length}`} isDark={isDark} />
                <RingProgress value={S.healthScore} max={100} color={healthColor} size={88} strokeWidth={8}
                  label="Sprint Health" subLabel="/100" isDark={isDark} />
              </div>
            </div>
          </div>

          {/* Velocity Area Chart */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            {/* Header stats row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>Velocity Trend</span>
                <p style={{ fontSize: '10px', color: T.muted, marginTop: '2px' }}>Story points completed across sprints</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[
                  { label: 'Current', val: S.velocity, color: '#6366f1', unit: 'SP' },
                  {
                    label: 'Avg Velocity',
                    val: velocityHistory.length > 0
                      ? Math.round(velocityHistory.reduce((a: number, v: any) => a + (v.completedPoints || 0), 0) / velocityHistory.length)
                      : 0,
                    color: '#2dd4bf', unit: 'SP'
                  },
                  { label: 'Sprints', val: velocityHistory.length, color: '#f59e0b', unit: 'tracked' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: m.color, lineHeight: 1, fontFamily: 'var(--font-ui)' }}>{m.val}</div>
                    <div style={{ fontSize: '9px', color: T.faint, fontFamily: 'monospace', marginTop: '2px' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={165}>
                <AreaChart data={velocityHistory} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                  <defs>
                    <linearGradient id="velGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="velGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} vertical={false} />
                  <XAxis dataKey="sprintName" stroke={T.faint} fontSize={8} tickLine={false} fontFamily="monospace"
                    tickFormatter={(v: string) => v?.replace('Sprint ', 'S') || v} />
                  <YAxis stroke={T.faint} fontSize={8} tickLine={false} axisLine={false} fontFamily="monospace" />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="completedPoints" name="Completed SP" stroke="#6366f1" strokeWidth={2.5}
                    fill="url(#velGrad1)" isAnimationActive animationDuration={1600}
                    dot={{ fill: '#6366f1', r: 3.5, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6366f1' }} />
                  <Area type="monotone" dataKey="targetPoints" name="Target SP" stroke="#2dd4bf" strokeWidth={2}
                    fill="url(#velGrad2)" strokeDasharray="5 3" isAnimationActive animationDuration={1900} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend + trend indicator */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[{ c: '#6366f1', l: 'Completed SP' }, { c: '#2dd4bf', l: 'Target SP' }].map(lg => (
                  <div key={lg.l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '12px', height: '3px', borderRadius: '3px', background: lg.c, display: 'inline-block' }} />
                    <span style={{ fontSize: '10px', color: T.muted, fontFamily: 'monospace' }}>{lg.l}</span>
                  </div>
                ))}
              </div>
              {velocityHistory.length >= 2 && (() => {
                const last = velocityHistory[velocityHistory.length - 1]?.completedPoints || 0;
                const prev = velocityHistory[velocityHistory.length - 2]?.completedPoints || 0;
                const diff = last - prev;
                const isUp = diff >= 0;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '8px', background: isUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    {isUp
                      ? <TrendingUp style={{ width: '11px', height: '11px', color: '#22c55e' }} />
                      : <ArrowDownRight style={{ width: '11px', height: '11px', color: '#ef4444' }} />
                    }
                    <span style={{ fontSize: '10px', fontWeight: 700, color: isUp ? '#22c55e' : '#ef4444', fontFamily: 'monospace' }}>
                      {isUp ? '+' : ''}{diff} SP vs last
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

        </motion.div>

        {/* ─── ROW 3: ISSUE DISTRIBUTION + BURNDOWN + BLOCKERS ─── */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.2fr', gap: '14px' }}>

          {/* Issue Status Donut */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: T.text, display: 'block', marginBottom: '14px' }}>Issue Status</span>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={issuesByStatus} cx="50%" cy="50%" innerRadius={46} outerRadius={72}
                  dataKey="value" paddingAngle={3} isAnimationActive animationDuration={1200}>
                  {issuesByStatus.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginTop: '12px' }}>
              {issuesByStatus.map((d: any, i: number) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ fontSize: '10px', color: T.muted, fontFamily: 'monospace' }}>{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Burndown Chart */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: T.text, display: 'block' }}>Sprint Burndown</span>
                <span style={{ fontSize: '10px', color: T.muted }}>Remaining work vs ideal line</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[{ v: S.completedPoints, l: 'Done', c: '#22c55e' }, { v: blocked.length, l: 'Blocked', c: '#ef4444' }].map(s => (
                  <div key={s.l} style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: s.c, lineHeight: 1, fontFamily: 'var(--font-ui)' }}>{s.v}</div>
                    <div style={{ fontSize: '9px', color: T.faint, fontFamily: 'monospace' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={burndown.slice(0, 16)} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barGap={2}>
                <defs>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} vertical={false} />
                <XAxis dataKey="date" stroke={T.faint} fontSize={8} tickLine={false} fontFamily="monospace" />
                <YAxis stroke={T.faint} fontSize={8} tickLine={false} axisLine={false} fontFamily="monospace" />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="idealRemaining" name="Ideal" fill="url(#idealGrad)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1200} />
                <Bar dataKey="actualRemaining" name="Actual" fill="url(#burnGrad)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Blockers Panel */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>Active Blockers</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-ui)' }}>{blocked.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '220px' }}>
              {(blocked.length > 0 ? blocked : highRisk).slice(0, 4).map((issue: any, i: number) => {
                const sev = issue.riskScore > 70 ? SEV.critical : issue.riskScore > 50 ? SEV.high : SEV.medium;
                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: '10px 12px', borderRadius: '12px',
                      background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: T.text, lineHeight: 1.4, flex: 1 }}>{issue.title?.slice(0, 40)}{issue.title?.length > 40 ? '...' : ''}</span>
                      <span style={{ fontSize: '8px', fontFamily: 'monospace', fontWeight: 800, padding: '2px 7px', borderRadius: '6px', background: sev.bg, color: sev.text, flexShrink: 0 }}>
                        {sev.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: T.faint, marginTop: '5px', fontFamily: 'monospace' }}>
                      {issue.id} · Risk {issue.riskScore}
                    </div>
                  </motion.div>
                );
              })}
              {blocked.length === 0 && highRisk.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', color: T.faint }}>
                  <CheckSquare style={{ width: '24px', height: '24px', color: '#22c55e' }} />
                  <span style={{ fontSize: '12px', color: T.muted }}>No active blockers 🎉</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── ROW 4: EPIC PROGRESS + DEVELOPER TABLE ─── */}
        <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '14px' }}>

          {/* Epic Progress */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers style={{ width: '14px', height: '14px', color: '#6366f1' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>Epic Progress</span>
              </div>
              <span style={{ fontSize: '10px', color: T.faint, fontFamily: 'monospace' }}>Sprint {activeSprintId}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
              {epics.map((epic: any) => (
                <div key={epic.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: epic.color, flexShrink: 0, boxShadow: `0 0 6px ${epic.color}60` }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: T.text }}>{epic.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: epic.color, fontFamily: 'monospace' }}>{epic.progress}%</span>
                  </div>
                  {/* Animated bar */}
                  <div style={{ height: '6px', borderRadius: '99px', background: T.progressBg, overflow: 'hidden', position: 'relative' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${epic.color}, ${epic.color}90)` }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${epic.progress}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                    {/* Shimmer */}
                    <motion.div
                      style={{
                        position: 'absolute', top: 0, left: '-100%', height: '100%', width: '40%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                        borderRadius: '99px',
                      }}
                      animate={{ left: ['−100%', '150%'] }}
                      transition={{ duration: 2, delay: 1.2, ease: 'easeInOut' }}
                    />
                  </div>
                  <div style={{ fontSize: '10px', color: T.faint, marginTop: '5px', fontFamily: 'monospace' }}>
                    {epic.completedPoints} / {epic.totalPoints} SP
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Performance Table */}
          <div style={{
            padding: '22px', borderRadius: '20px',
            background: T.bg, border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>Developer Performance</span>
              </div>
              <span style={{ fontSize: '10px', color: T.faint, fontFamily: 'monospace' }}>Sprint {activeSprintId}</span>
            </div>

            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 0.7fr 1.8fr 1fr',
              padding: '8px 14px', borderRadius: '10px',
              background: T.thead, marginBottom: '6px',
            }}>
              {['DEVELOPER', 'ROLE', 'DONE', 'TOTAL', 'COMPLETION', 'STATUS'].map(h => (
                <span key={h} style={{ fontSize: '9px', fontWeight: 800, color: T.faint, letterSpacing: '0.1em', fontFamily: 'monospace' }}>{h}</span>
              ))}
            </div>

            {/* Table Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {sprintDevRows.map((dev: any, idx: number) => {
                const overloaded = dev.utilization > 95;
                const statusColor = dev.pct >= 70 ? '#22c55e' : dev.pct >= 40 ? '#f59e0b' : '#ef4444';
                const statusLabel = dev.pct >= 70 ? 'On Track' : dev.pct >= 40 ? 'In Progress' : 'At Risk';
                const initials = dev.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const avatarColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
                const avatarBg = avatarColors[idx % avatarColors.length];
                return (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    whileHover={{ background: T.rowHover }}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr 0.7fr 1.8fr 1fr',
                      padding: '11px 14px', borderRadius: '12px',
                      border: `1px solid ${T.divider}`,
                      alignItems: 'center', transition: 'background 0.15s', cursor: 'pointer',
                    }}
                  >
                    {/* Dev name + avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DevAvatarImg src={dev.avatar} name={dev.name} fallbackBg={avatarBg} initials={initials} />
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: T.text }}>{dev.name}</div>
                        <div style={{ fontSize: '9px', color: T.faint, fontFamily: 'monospace' }}>
                          {overloaded ? '⚠ Overloaded' : `${dev.utilization}% util`}
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: '11px', color: T.muted }}>{dev.role}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: T.text, fontFamily: 'monospace' }}>{dev.done}</span>
                    <span style={{ fontSize: '12px', color: T.muted, fontFamily: 'monospace' }}>{dev.total}</span>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: T.progressBg, overflow: 'hidden' }}>
                        <motion.div
                          style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${statusColor}, ${statusColor}90)` }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${dev.pct}%` }}
                          transition={{ duration: 1, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: statusColor, fontFamily: 'monospace', minWidth: '30px' }}>{dev.pct}%</span>
                    </div>

                    {/* Status pill */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', borderRadius: '99px', width: 'fit-content',
                      background: `${statusColor}12`, border: `1px solid ${statusColor}30`,
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusColor, flexShrink: 0 }} />
                      <span style={{ fontSize: '9px', fontWeight: 700, color: statusColor, fontFamily: 'monospace' }}>{statusLabel}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
