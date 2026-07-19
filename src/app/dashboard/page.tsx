'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Activity, Flame, Target, ShieldAlert, AlertOctagon,
  TrendingUp, Users, Layers, ArrowUpRight, ArrowDownRight, Bot,
  FileText, Calendar, CheckSquare, FolderOpen, MoreHorizontal,
} from 'lucide-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.97)', border: '1px solid rgba(51,65,85,0.60)',
      borderRadius: '10px', padding: '10px 14px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#64748b', fontWeight: 700, marginBottom: '6px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '3px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8' }}>{p.name}:</span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  Done:        { bg: 'rgba(34,197,94,0.10)',  text: '#16a34a', dot: '#22c55e' },
  'In Progress':{ bg: 'rgba(59,130,246,0.10)', text: '#2563eb', dot: '#3b82f6' },
  'To Do':     { bg: 'rgba(100,116,139,0.12)',  text: '#64748b', dot: '#94a3b8' },
  Review:      { bg: 'rgba(245,158,11,0.10)',  text: '#b45309', dot: '#f59e0b' },
  Blocked:     { bg: 'rgba(239,68,68,0.10)',   text: '#dc2626', dot: '#ef4444' },
};

export default function Dashboard() {
  const { activeSprintId, toggleCopilot } = useAppStore();
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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <div className="spinner" />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: '#94a3b8' }}>Compiling sprint telemetry…</span>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, developers, epics, issues, burndown, velocityHistory, analyticsSummary } = data;
  const S = sprints.find((s: any) => s.id === activeSprintId) || sprints[9];
  const blocked = issues.filter((i: any) => i.isBlocked);
  const highRisk = issues.filter((i: any) => i.status !== 'Done' && i.riskScore > 40)
    .sort((a: any, b: any) => b.riskScore - a.riskScore).slice(0, 5);

  const healthColor = S.healthScore >= 85 ? '#16a34a' : S.healthScore >= 65 ? '#d97706' : '#dc2626';

  const issueTypeCounts = issues.reduce((acc: any, issue: any) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(issueTypeCounts).map(([name, value]: any) => ({ name, value }));
  const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ec4899', '#10b981'];

  const sprintAgentRows = developers.slice(0, 6).map((dev: any) => {
    const devIssues = issues.filter((i: any) => i.assigneeId === dev.id);
    const done = devIssues.filter((i: any) => i.status === 'Done').length;
    const total = devIssues.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const status = pct >= 70 ? 'Active' : pct >= 30 ? 'In Progress' : 'At Risk';
    return { ...dev, done, total, pct, status };
  });

  /* Expense-style summary data */
  const targetSP = S.targetPoints;
  const doneSP = S.completedPoints;
  const remainSP = targetSP - doneSP;
  const donePct = Math.round((doneSP / targetSP) * 100);
  const remainPct = 100 - donePct;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show"
        style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' }}
      >

        {/* ── PAGE HEADER ───────────────────────────────── */}
        <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Dashboard › Sprint {activeSprintId}
            </div>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 800, color: 'var(--color-foreground)', letterSpacing: '-0.02em' }}>
              Project
            </h1>
          </div>
          <motion.button
            onClick={() => toggleCopilot(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px',
              borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(99,102,241,0.25)',
              background: 'rgba(99,102,241,0.08)', color: '#6366f1',
              fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700,
            }}
          >
            <Bot style={{ width: '15px', height: '15px' }} />
            {greeting}, AI Analyst
          </motion.button>
        </motion.div>

        {/* ── ROW 1: 4-STAT HEADER CARDS ────────────────── */}
        <motion.div variants={item}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0',
            background: 'var(--color-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '16px', overflow: 'hidden',
          }}
        >
          {[
            {
              value: S.healthScore,
              label: 'Sprint Health',
              sub: 'Score out of 100',
              icon: <Activity style={{ width: '16px', height: '16px' }} />,
              color: healthColor,
              trend: S.healthScore >= 65 ? 'up' : 'down',
            },
            {
              value: developers.length,
              label: 'Members',
              sub: 'Engineers active',
              icon: <Users style={{ width: '16px', height: '16px' }} />,
              color: '#6366f1',
              trend: 'up',
            },
            {
              value: issues.length,
              label: 'Issues',
              sub: `${S.completionRate}% completion rate`,
              icon: <CheckSquare style={{ width: '16px', height: '16px' }} />,
              color: '#22d3ee',
              trend: 'up',
            },
            {
              value: S.targetPoints,
              label: 'Story Points',
              sub: `${S.completedPoints} completed`,
              icon: <Target style={{ width: '16px', height: '16px' }} />,
              color: '#f59e0b',
              trend: S.completionRate > 50 ? 'up' : 'down',
            },
          ].map((stat, idx, arr) => (
            <div key={stat.label} style={{
              padding: '22px 24px',
              borderRight: idx < arr.length - 1 ? '1px solid var(--color-border)' : 'none',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                background: `${stat.color}18`,
                border: `1px solid ${stat.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '26px', fontWeight: 800, color: 'var(--color-foreground)', lineHeight: 1.1 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{stat.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  {stat.trend === 'up'
                    ? <ArrowUpRight style={{ width: '11px', height: '11px', color: '#22c55e' }} />
                    : <ArrowDownRight style={{ width: '11px', height: '11px', color: '#ef4444' }} />}
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#64748b' }}>{stat.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── ROW 2: CHARTS (Velocity Radar | Issue Donut | Burndown) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>

          {/* Velocity Radar ─ Budget Distribution analog */}
          <motion.div variants={item} style={{
            background: 'var(--color-primary)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, color: 'var(--color-foreground)', marginBottom: '14px' }}>
              Velocity Distribution
            </div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%"
                  data={developers.filter((d: any) => d.role === 'Developer').slice(0, 6)}
                >
                  <PolarGrid stroke="rgba(99,102,241,0.15)" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={8} fontFamily="var(--font-data)" />
                  <PolarRadiusAxis stroke="transparent" fontSize={7} domain={[0, 180]} />
                  <Radar name="Utilization" dataKey="utilization" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} isAnimationActive animationDuration={1500} />
                  <Tooltip content={<Tip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
              {[{ color: '#6366f1', label: 'Utilization' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Issue Type Donut ─ Task Distribution analog */}
          <motion.div variants={item} style={{
            background: 'var(--color-primary)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, color: 'var(--color-foreground)', marginBottom: '14px' }}>
              Issue Distribution
            </div>
            <div style={{ height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={80}
                    dataKey="value" paddingAngle={3}
                    isAnimationActive animationDuration={1200}
                  >
                    {pieData.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 12px', marginTop: '10px' }}>
              {pieData.map((d: any, idx: number) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#94a3b8' }}>{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Burndown ─ Issues Summary analog */}
          <motion.div variants={item} style={{
            background: 'var(--color-primary)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, color: 'var(--color-foreground)' }}>
                Sprint Burndown
              </div>
              <div style={{ display: 'flex', gap: '18px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 800, color: '#6366f1' }}>{S.completedPoints}</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#94a3b8' }}>Points Done</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '22px', fontWeight: 800, color: '#22d3ee' }}>{issues.length}</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#94a3b8' }}>Total Issues</div>
                </div>
              </div>
            </div>
            <div style={{ height: '170px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={burndown.slice(0, 16)} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barGap={2}>
                  <defs>
                    <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.10)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickLine={false} fontFamily="var(--font-data)" />
                  <YAxis stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} fontFamily="var(--font-data)" />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="idealRemaining" name="Ideal" fill="rgba(99,102,241,0.15)" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={1200} />
                  <Bar dataKey="actualRemaining" name="Actual" fill="url(#burnGrad)" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={1400} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', gap: '22px', marginTop: '14px' }}>
              {[
                { label: 'Blockers', value: blocked.length, color: '#ef4444' },
                { label: 'High Risk', value: highRisk.length, color: '#f59e0b' },
                { label: 'Completed', value: issues.filter((i: any) => i.status === 'Done').length, color: '#22c55e' },
                { label: 'Remaining', value: issues.filter((i: any) => i.status !== 'Done').length, color: '#6366f1' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3: SPRINT SUMMARY CARDS ───────────────── */}
        <motion.div variants={item} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            {
              value: `${S.targetPoints} SP`,
              label: 'Total Committed',
              sub: `above projected ${donePct}%`,
              dir: 'up',
              color: '#6366f1',
            },
            {
              value: `${S.completedPoints} SP`,
              label: 'Points Completed',
              sub: `below projected ${remainPct}%`,
              dir: 'down',
              color: '#22d3ee',
            },
            {
              value: `${remainSP} SP`,
              label: 'Points Remaining',
              sub: `below projected ${remainPct}%`,
              dir: 'down',
              color: '#f59e0b',
            },
          ].map((card) => (
            <div key={card.label} style={{
              background: 'var(--color-primary)', border: '1px solid var(--color-border)',
              borderRadius: '16px', padding: '20px 22px',
            }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '24px', fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--color-foreground)', fontWeight: 600, marginTop: '5px' }}>{card.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                {card.dir === 'up'
                  ? <ArrowUpRight style={{ width: '11px', height: '11px', color: '#22c55e' }} />
                  : <ArrowDownRight style={{ width: '11px', height: '11px', color: '#ef4444' }} />}
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8' }}>{card.sub}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── ROW 4: SCHEDULE + DEVELOPER PERFORMANCE TABLE ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>

          {/* Schedule / Epic list */}
          <motion.div variants={item} style={{
            background: 'var(--color-primary)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.60)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, color: 'var(--color-foreground)' }}>Epic Progress</span>
              </div>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8' }}>This Sprint</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', flex: 1 }}>
              {epics.map((epic: any) => (
                <div key={epic.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '3px', background: epic.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: 'var(--color-foreground)' }}>{epic.name}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: epic.color }}>{epic.progress}%</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '99px', background: 'var(--color-border)', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: '99px', background: epic.color }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${epic.progress}%` }}
                      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                    {epic.completedPoints} / {epic.totalPoints} SP
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Developer Performance Table ─ Agent Performance analog */}
          <motion.div variants={item} style={{
            background: 'var(--color-primary)', border: '1px solid var(--color-border)',
            borderRadius: '16px', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.60)' }} />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700, color: 'var(--color-foreground)' }}>Developer Performance</span>
              </div>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8' }}>This Sprint</span>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'var(--color-secondary)',
              marginBottom: '8px',
            }}>
              {['DEVELOPER', 'ROLE', 'DONE', 'TOTAL', 'COMPLETION', 'STATUS'].map(h => (
                <span key={h} style={{ fontFamily: 'var(--font-data)', fontSize: '9px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>{h}</span>
              ))}
            </div>

            {/* Table rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sprintAgentRows.map((dev: any, idx: number) => {
                const sc = statusColor[dev.status === 'Active' ? 'Done' : dev.status === 'In Progress' ? 'In Progress' : 'Blocked'] || statusColor['To Do'];
                return (
                  <motion.div
                    key={dev.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr 1fr',
                      padding: '11px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background 150ms ease',
                    }}
                    whileHover={{ background: 'rgba(99,102,241,0.05)' } as any}
                  >
                    {/* Developer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={dev.avatar} alt={dev.name} style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        border: '2px solid var(--color-border)', objectFit: 'cover', flexShrink: 0,
                      }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, color: 'var(--color-foreground)' }}>{dev.name}</div>
                        <div style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#94a3b8' }}>{dev.location || 'Remote'}</div>
                      </div>
                    </div>

                    {/* Role */}
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#64748b' }}>{dev.role}</span>

                    {/* Done */}
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 700, color: 'var(--color-foreground)' }}>{dev.done}</span>

                    {/* Total */}
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: '#94a3b8' }}>{dev.total}</span>

                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '5px', borderRadius: '99px', background: 'var(--color-border)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${dev.pct}%`, borderRadius: '99px', background: '#6366f1', transition: 'width 0.8s ease' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#94a3b8', minWidth: '28px' }}>{dev.pct}%</span>
                    </div>

                    {/* Status pill */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 9px', borderRadius: '99px', background: sc.bg, width: 'fit-content' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sc.dot }} />
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', fontWeight: 700, color: sc.text }}>{dev.status}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
