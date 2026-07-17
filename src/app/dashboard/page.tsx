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
} from 'recharts';
import {
  Activity, Flame, Target, ShieldAlert, AlertOctagon,
  TrendingUp, Users, Layers, ArrowUpRight, ArrowDownRight, Bot,
} from 'lucide-react';

/* ── Animation config (Skill: 600ms expo.inOut stagger) ── */
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

/* ── Custom Tooltip ── */
const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(51,65,85,0.60)',
      borderRadius: '10px', padding: '10px 14px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    }}>
      <p style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#475569', fontWeight: 700, marginBottom: '6px' }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '3px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#64748B' }}>{p.name}:</span>
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
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
          <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', color: '#334155' }}>Compiling sprint telemetry…</span>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, developers, epics, issues, burndown, velocityHistory, analyticsSummary } = data;
  const S = sprints.find((s: any) => s.id === activeSprintId) || sprints[9];
  const blocked = issues.filter((i: any) => i.isBlocked);
  const highRisk = issues.filter((i: any) => i.status !== 'Done' && i.riskScore > 40)
    .sort((a: any, b: any) => b.riskScore - a.riskScore).slice(0, 5);

  const healthColor = S.healthScore >= 85 ? '#22C55E' : S.healthScore >= 65 ? '#F59E0B' : '#EF4444';

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="page-in"
        style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >

        {/* ═══ PAGE HEADER ════════════════════════════════════════ */}
        <motion.div variants={item} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            {/* Skill: section eyebrow */}
            <div className="section-eyebrow" style={{ marginBottom: '8px' }}>
              Executive Overview · Sprint {activeSprintId}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-ui)', fontSize: '24px', fontWeight: 800,
              color: '#F8FAFC', letterSpacing: '-0.03em', lineHeight: 1.1,
            }}>
              Sprint Intelligence Dashboard
            </h1>
            <p style={{ fontFamily: 'var(--font-data)', fontSize: '11px', color: '#334155', marginTop: '6px' }}>
              {S.startDate} → {S.endDate} · {S.targetPoints} SP committed · {developers.length} engineers active
            </p>
          </div>
          <motion.button
            onClick={() => toggleCopilot(true)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
              borderRadius: '11px', cursor: 'pointer', border: '1px solid rgba(34,197,94,0.25)',
              background: 'rgba(34,197,94,0.08)', color: '#4ADE80',
              fontFamily: 'var(--font-ui)', fontSize: '13px', fontWeight: 700,
              transition: 'all 250ms ease',
            }}
          >
            <Bot style={{ width: '15px', height: '15px' }} />
            Consult AI Analyst
          </motion.button>
        </motion.div>

        <hr className="g-line" />

        {/* ═══ ROW 1: KPI BENTO GRID ══════════════════════════════ */}
        {/* Skill: Bento Grid, Bullet Chart for KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>

          {/* Sprint Health — SVG Gauge (Skill: Gauge chart) */}
          <motion.div variants={item} className={`bento bento-${S.healthScore >= 85 ? 'green' : S.healthScore >= 65 ? 'amber' : 'rose'}`}>
            <div className="kpi-wrap">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="kpi-eyebrow">Sprint Health</span>
                <div className={`icon-box ${S.healthScore >= 85 ? 'icon-green' : S.healthScore >= 65 ? 'icon-amber' : 'icon-rose'}`}>
                  <Activity style={{ width: '15px', height: '15px' }} />
                </div>
              </div>
              {/* Donut gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <svg width="68" height="68" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(51,65,85,0.40)" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke={healthColor} strokeWidth="3.5" strokeLinecap="round"
                    strokeDasharray="94.25"
                    initial={{ strokeDashoffset: 94.25 }}
                    animate={{ strokeDashoffset: 94.25 - (94.25 * S.healthScore / 100) }}
                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div>
                  <div className="kpi-number" style={{ color: healthColor }}>{S.healthScore}</div>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#475569', marginTop: '3px' }}>
                    {S.healthScore >= 85 ? '✦ Excellent' : S.healthScore >= 65 ? '▲ At Risk' : '⚠ Critical'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Velocity — Bullet Track */}
          <motion.div variants={item} className="bento bento-indigo">
            <div className="kpi-wrap">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="kpi-eyebrow">Velocity</span>
                <div className="icon-box icon-indigo"><Flame style={{ width: '15px', height: '15px' }} /></div>
              </div>
              <div>
                <div className="kpi-number">{S.completedPoints}
                  <span style={{ fontSize: '14px', color: '#334155', fontWeight: 400 }}> / {S.targetPoints}</span>
                </div>
                <div className="kpi-delta kpi-delta-up" style={{ marginTop: '4px' }}>
                  <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  Story points
                </div>
              </div>
              {/* Skill: bullet chart — progress track with target marker */}
              <div className="bullet-track">
                <motion.div className="bullet-fill"
                  style={{ background: 'linear-gradient(90deg, #6366f1, #A5B4FC)', width: `${S.completionRate}%` }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${S.completionRate}%` }}
                  transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Target marker at 80% */}
                <div className="bullet-target-marker" style={{ left: '80%' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: '#A5B4FC' }}>
                {S.completionRate}% complete
              </span>
            </div>
          </motion.div>

          {/* Completion Rate */}
          <motion.div variants={item} className="bento bento-green">
            <div className="kpi-wrap">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="kpi-eyebrow">Completion Rate</span>
                <div className="icon-box icon-green"><Target style={{ width: '15px', height: '15px' }} /></div>
              </div>
              <div>
                <div className="kpi-number" style={{ color: '#22C55E' }}>{S.completionRate}<span style={{ fontSize: '18px' }}>%</span></div>
                <div className="kpi-delta kpi-delta-up" style={{ marginTop: '4px' }}>
                  <ArrowUpRight style={{ width: '12px', height: '12px' }} />
                  +8% vs Sprint {activeSprintId - 1 || 1}
                </div>
              </div>
              {/* Spark line */}
              <div style={{ height: '40px', marginTop: '-4px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={burndown.slice(-6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity={0.30} />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="actualRemaining" stroke="#22C55E" strokeWidth={2} fill="url(#sparkGreen)" dot={false} isAnimationActive animationDuration={1400} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Blockers */}
          <motion.div variants={item} className={`bento ${blocked.length > 0 ? 'bento-rose' : 'bento-green'}`}>
            <div className="kpi-wrap">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="kpi-eyebrow">Active Blockers</span>
                <div className={`icon-box ${blocked.length > 0 ? 'icon-rose' : 'icon-green'}`}>
                  <ShieldAlert style={{ width: '15px', height: '15px' }} />
                </div>
              </div>
              <div>
                <div className="kpi-number" style={{ color: blocked.length > 0 ? '#EF4444' : '#22C55E' }}>
                  {blocked.length}
                </div>
                <div className={`kpi-delta ${blocked.length > 0 ? 'kpi-delta-down' : 'kpi-delta-up'}`} style={{ marginTop: '4px' }}>
                  {blocked.length === 0
                    ? <><ArrowUpRight style={{ width: '12px', height: '12px' }} /> No impediments</>
                    : <><ArrowDownRight style={{ width: '12px', height: '12px' }} /> {blocked.length} ticket{blocked.length > 1 ? 's' : ''} blocked</>
                  }
                </div>
              </div>
              {blocked.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
                  {blocked.slice(0, 2).map((b: any) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#A5B4FC', fontWeight: 700 }}>{b.id}</span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ═══ ROW 2: BURNDOWN + RISK ══════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>

          {/* Burndown Chart */}
          <motion.div variants={item} className="bento" style={{ padding: '24px' }}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">Burndown Analysis</div>
                <div className="section-title">
                  <div className="icon-box icon-indigo" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <Flame style={{ width: '13px', height: '13px' }} />
                  </div>
                  Sprint Burndown
                </div>
                <div className="section-desc">Ideal schedule vs actual remaining points</div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[{ color: 'rgba(255,255,255,0.18)', label: 'Ideal', dash: true }, { color: '#6366f1', label: 'Actual', dash: false }].map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="18" height="2"><line x1="0" y1="1" x2="18" y2="1" stroke={l.color} strokeWidth="2" strokeDasharray={l.dash ? '4 3' : undefined} /></svg>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#334155' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-wrap" style={{ height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burndown} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="idealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="rgba(255,255,255,0.08)" />
                      <stop offset="95%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.30} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.25)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(51,65,85,0.50)" fontSize={9} tickLine={false} fontFamily="var(--font-data)" />
                  <YAxis stroke="rgba(51,65,85,0.50)" fontSize={9} tickLine={false} axisLine={false} fontFamily="var(--font-data)" />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="idealRemaining" name="Ideal" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} strokeDasharray="5 4" fill="url(#idealGrad)" isAnimationActive animationDuration={1600} animationEasing="ease-out" />
                  <Area type="monotone" dataKey="actualRemaining" name="Actual" stroke="#6366f1" strokeWidth={2.5} fill="url(#actualGrad)" activeDot={{ r: 5, fill: '#6366f1', stroke: '#020617', strokeWidth: 2 }} isAnimationActive animationDuration={1600} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk Gauge */}
          <motion.div variants={item} className="bento" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div className="section-eyebrow">Risk Intelligence</div>
              <div className="section-title">
                <div className="icon-box icon-rose" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                  <ShieldAlert style={{ width: '13px', height: '13px' }} />
                </div>
                AI Risk Index
              </div>
              <div className="section-desc">Composite sprint risk score</div>
            </div>

            {/* Skill: Gauge / Dial SVG */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <svg width="190" height="105" viewBox="0 0 190 105" style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#22C55E" />
                    <stop offset="50%"  stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <path d="M 25 95 A 70 70 0 0 1 165 95" fill="none" stroke="rgba(51,65,85,0.40)" strokeWidth="12" strokeLinecap="round" />
                <motion.path d="M 25 95 A 70 70 0 0 1 165 95"
                  fill="none" stroke="url(#gaugeGrad)" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray="220"
                  initial={{ strokeDashoffset: 220 }}
                  animate={{ strokeDashoffset: 220 - (220 * analyticsSummary.riskScore / 100) }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                />
                <text x="95" y="84" textAnchor="middle" fontFamily="var(--font-data)" fontSize="28" fontWeight="700" fill="#F8FAFC">
                  {analyticsSummary.riskScore}%
                </text>
                <text x="95" y="100" textAnchor="middle" fontFamily="var(--font-data)" fontSize="9" fontWeight="700" fill="#334155" letterSpacing="0.10em">
                  COMPOSITE RISK
                </text>
              </svg>
            </div>

            {/* Risk breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Completion Probability', val: `${analyticsSummary.completionProbability}%`, color: analyticsSummary.completionProbability > 70 ? '#22C55E' : '#EF4444' },
                { label: 'Scope Allocation', val: 'Extreme', color: '#F59E0B' },
                { label: 'Capacity Load', val: 'Overcapacity', color: '#EF4444' },
              ].map((r) => (
                <div key={r.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 14px', borderRadius: '9px',
                  background: 'rgba(15,23,42,0.60)', border: '1px solid rgba(51,65,85,0.30)',
                }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: r.color }}>{r.val}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ═══ ROW 3: VELOCITY + RADAR ══════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '14px' }}>

          {/* Velocity History */}
          <motion.div variants={item} className="bento" style={{ padding: '24px' }}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">Historical Performance</div>
                <div className="section-title">
                  <div className="icon-box icon-sky" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <TrendingUp style={{ width: '13px', height: '13px' }} />
                  </div>
                  Velocity History
                </div>
                <div className="section-desc">Committed target vs delivered per sprint</div>
              </div>
            </div>
            <div className="chart-wrap" style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityHistory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.25)" vertical={false} />
                  <XAxis dataKey="sprintName" stroke="rgba(51,65,85,0.50)" fontSize={9} tickLine={false} fontFamily="var(--font-data)" />
                  <YAxis stroke="rgba(51,65,85,0.50)" fontSize={9} tickLine={false} axisLine={false} fontFamily="var(--font-data)" />
                  <Tooltip content={<Tip />} />
                  <Bar dataKey="targetPoints" name="Target" fill="rgba(99,102,241,0.20)" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={1400} animationEasing="ease-out" />
                  <Bar dataKey="completedPoints" name="Completed" fill="#6366f1" radius={[5, 5, 0, 0]} isAnimationActive animationDuration={1400} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Capacity Radar */}
          <motion.div variants={item} className="bento" style={{ padding: '24px' }}>
            <div className="section-head" style={{ marginBottom: '14px' }}>
              <div>
                <div className="section-eyebrow">Team Capacity</div>
                <div className="section-title">
                  <div className="icon-box icon-green" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <Users style={{ width: '13px', height: '13px' }} />
                  </div>
                  Utilization Radar
                </div>
                <div className="section-desc">Developer load vs capacity</div>
              </div>
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="72%" data={developers.filter((d: any) => d.role === 'Developer').slice(0, 6)}>
                  <PolarGrid stroke="rgba(51,65,85,0.30)" />
                  <PolarAngleAxis dataKey="name" stroke="rgba(71,85,105,0.60)" fontSize={9} fontFamily="var(--font-data)" />
                  <PolarRadiusAxis stroke="rgba(51,65,85,0.20)" fontSize={8} domain={[0, 180]} />
                  <Radar name="Utilization" dataKey="utilization" stroke="#22C55E" fill="#22C55E" fillOpacity={0.12} isAnimationActive animationDuration={1500} animationEasing="ease-out" />
                  <Tooltip content={<Tip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ═══ ROW 4: EPICS + BLOCKERS + HIGH RISK ══════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

          {/* Epic Progress — Skill: Bullet chart grid */}
          <motion.div variants={item} className="bento" style={{ padding: '24px' }}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">Epic Delivery</div>
                <div className="section-title">
                  <div className="icon-box icon-indigo" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <Layers style={{ width: '13px', height: '13px' }} />
                  </div>
                  Epic Progress
                </div>
                <div className="section-desc">Story points delivered by epic area</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {epics.map((epic: any) => (
                <div key={epic.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                      <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: epic.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {epic.name}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: '#F8FAFC', flexShrink: 0, marginLeft: '8px' }}>
                      {epic.progress}%
                    </span>
                  </div>
                  {/* Skill: Bullet track */}
                  <div className="bullet-track">
                    <motion.div className="bullet-fill"
                      style={{ background: epic.color, width: `${epic.progress}%` }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${epic.progress}%` }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#334155' }}>
                    {epic.completedPoints} / {epic.totalPoints} SP
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Blockers */}
          <motion.div variants={item} className="bento" style={{ padding: '24px' }}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">Impediment Radar</div>
                <div className="section-title">
                  <div className="icon-box icon-rose" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <ShieldAlert style={{ width: '13px', height: '13px' }} />
                  </div>
                  Active Blockers
                </div>
                <div className="section-desc">{blocked.length} impediment{blocked.length !== 1 ? 's' : ''} detected</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {blocked.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#334155', fontSize: '12px', fontFamily: 'var(--font-data)' }}>
                  ✦ No impediments detected
                </div>
              ) : blocked.map((issue: any) => {
                const dev = developers.find((d: any) => d.id === issue.assigneeId);
                return (
                  <div key={issue.id} style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)',
                    borderLeft: '3px solid #EF4444', display: 'flex', flexDirection: 'column', gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: '#A5B4FC' }}>{issue.id}</span>
                      <span className="pill pill-rose">{issue.type}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: '#94A3B8', lineHeight: 1.4 }}>
                      {issue.title}
                    </p>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: '#FCA5A5', fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{issue.blockedReason}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={dev?.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '5px', border: '1px solid rgba(51,65,85,0.40)' }} />
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#475569', fontWeight: 600 }}>{dev?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* High Risk Tickets */}
          <motion.div variants={item} className="bento" style={{ padding: '24px' }}>
            <div className="section-head">
              <div>
                <div className="section-eyebrow">AI Risk Analysis</div>
                <div className="section-title">
                  <div className="icon-box icon-amber" style={{ width: '28px', height: '28px', borderRadius: '7px' }}>
                    <AlertOctagon style={{ width: '13px', height: '13px' }} />
                  </div>
                  High-Risk Tickets
                </div>
                <div className="section-desc">Sorted by composite AI risk score</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {highRisk.map((issue: any) => {
                const dev = developers.find((d: any) => d.id === issue.assigneeId);
                const riskColor = issue.riskScore > 70 ? '#EF4444' : issue.riskScore > 45 ? '#F59E0B' : '#22C55E';
                return (
                  <div key={issue.id} style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.18)',
                    borderLeft: '3px solid #F59E0B', display: 'flex', flexDirection: 'column', gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '11px', fontWeight: 700, color: '#A5B4FC' }}>{issue.id}</span>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: '12px', fontWeight: 800, color: riskColor }}>
                        {issue.riskScore}%
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600, color: '#94A3B8', lineHeight: 1.4 }}>
                      {issue.title}
                    </p>
                    {/* Skill: Bullet chart — risk score bar */}
                    <div className="bullet-track" style={{ height: '4px' }}>
                      <motion.div className="bullet-fill"
                        style={{ background: `linear-gradient(90deg, #22C55E, ${riskColor})`, width: `${issue.riskScore}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${issue.riskScore}%` }}
                        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <img src={dev?.avatar} alt="" style={{ width: '18px', height: '18px', borderRadius: '5px', border: '1px solid rgba(51,65,85,0.40)' }} />
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#475569', fontWeight: 600 }}>{dev?.name}</span>
                      </div>
                      <span className="pill pill-amber">{issue.storyPoints} SP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

      </motion.div>
    </DashboardLayout>
  );
}
