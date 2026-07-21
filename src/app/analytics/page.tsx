'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, Zap, Clock, Bug, TrendingUp, Sliders, Sparkles,
  PieChart as PieIcon, BarChart2, ShieldAlert, CheckCircle2,
  AlertCircle, RefreshCw, BarChart3, HelpCircle, Layers, ArrowRight
} from 'lucide-react';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
} as const;

export default function AnalyticsDeepDive() {
  const { activeSprintId } = useAppStore();
  const [showConfig, setShowConfig] = useState(false);

  // ── Custom Simulation Settings ──
  const [simVelocity, setSimVelocity] = useState(48);
  const [simCapacity, setSimCapacity] = useState(60);
  const [simBlockers, setSimBlockers] = useState(15);

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data', activeSprintId],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${activeSprintId}`);
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)' }} />
              <div style={{ position: 'absolute', inset: 0, width: '64px', height: '64px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#a855f7', animation: 'spin 1s linear infinite' }} />
              <div style={{ position: 'absolute', inset: '10px', width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-stat-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity style={{ width: '18px', color: '#a5b4fc' }} />
              </div>
            </div>
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>Compiling Sprint Analytics Telemetry...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, analyticsSummary, issues } = data;

  const historicalSprintsData = sprints
    .filter((s: any) => s.status === 'completed')
    .map((s: any) => {
      const score = s.healthScore;
      const leadTime = Math.round((8.5 + (100 - score) * 0.1) * 10) / 10;
      const cycleTime = Math.round((4.2 + (100 - score) * 0.06) * 10) / 10;
      const bugs = s.id % 3 === 0 ? 3 : s.id % 2 === 0 ? 1 : 2;
      const density = Math.round((bugs / s.completedPoints) * 100) / 100;

      return {
        name: s.name,
        'Lead Time (Days)': leadTime,
        'Cycle Time (Days)': cycleTime,
        'Defect Density': density,
        Committed: s.targetPoints,
        Completed: s.completedPoints,
        Velocity: s.completedPoints,
      };
    });

  const stageData = [
    { name: 'Backlog', duration: 4.2 },
    { name: 'Design', duration: 2.8 },
    { name: 'In Progress', duration: 6.5 },
    { name: 'Code Review', duration: 1.9 },
    { name: 'Testing/QA', duration: 3.1 },
    { name: 'Done', duration: 0.5 },
  ];

  const typeCounts = issues.reduce((acc: any, i: any) => {
    acc[i.type] = (acc[i.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.keys(typeCounts).map(key => ({
    name: key,
    value: typeCounts[key]
  }));

  const loadFactor = Math.min(Math.round((simVelocity / simCapacity) * 100), 200);
  const completionProbability = Math.max(Math.min(Math.round((100 - (simBlockers * 1.5) - (loadFactor > 100 ? (loadFactor - 100) * 0.8 : 0))), 100), 5);
  const expectedDefects = Math.max(Math.round((simVelocity * 0.04 + (simBlockers * 0.08)) * 10) / 10, 0.1);

  return (
    <DashboardLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Header Banner */}
        <div style={{
          position: 'relative', padding: '28px 32px 24px', flexShrink: 0,
          background: 'var(--color-panel-header-bg)',
          borderBottom: '1px solid var(--color-card-border)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '120px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 0 1px rgba(99,102,241,0.3)' }}>
                <TrendingUp style={{ width: '26px', color: '#fff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Analytics Dashboard</h1>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc', fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em' }}>
                    Agile Telemetry v3.0
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  DORA metrics · Historical velocity analytics · Flow efficiency stages · Predictive simulation
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {[
                { label: '4.2 Deploys/wk', sub: 'Frequency', icon: Zap, color: '#22c55e' },
                { label: '9.2 Days', sub: 'Lead Time', icon: Clock, color: '#0ea5e9' },
                { label: '4.8 Days', sub: 'Cycle Time', icon: Activity, color: '#6366f1' },
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
                onClick={() => setShowConfig(s => !s)}
                style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--color-card-border)', background: showConfig ? 'rgba(99,102,241,0.15)' : 'var(--color-stat-bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12px', fontWeight: 600, color: showConfig ? 'var(--color-accent)' : 'var(--color-text-muted)', transition: 'all 0.2s' }}
              >
                <Sliders style={{ width: '14px' }} />
                Predictive Simulator
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Workspace */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* Simulator Panel */}
            <AnimatePresence>
              {showConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '8px' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '18px', overflow: 'hidden' }}
                >
                  <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <Sliders style={{ width: '16px', color: 'var(--color-accent)' }} />
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Predictive Sprint Simulator</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Target Velocity</span>
                          <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>{simVelocity} SP</span>
                        </div>
                        <input type="range" min="10" max="100" value={simVelocity} onChange={e => setSimVelocity(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Total Capacity</span>
                          <span style={{ fontFamily: 'monospace', color: '#10b981' }}>{simCapacity} SP</span>
                        </div>
                        <input type="range" min="20" max="120" value={simCapacity} onChange={e => setSimCapacity(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Blocker Ratio</span>
                          <span style={{ fontFamily: 'monospace', color: '#ef4444' }}>{simBlockers}%</span>
                        </div>
                        <input type="range" min="0" max="50" value={simBlockers} onChange={e => setSimBlockers(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-card-border)' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '4px' }}>Load Factor</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: loadFactor > 100 ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>{loadFactor}%</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{loadFactor > 100 ? '⚠️ Overloaded Capacity' : '✓ Safe Load'}</div>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid var(--color-card-border)', borderRight: '1px solid var(--color-card-border)' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '4px' }}>Expected Defects</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{expectedDefects} Bugs</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Estimated Bug Density</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', color: 'var(--color-text-faint)', marginBottom: '4px' }}>Success Probability</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: completionProbability > 75 ? '#22c55e' : completionProbability > 45 ? '#f59e0b' : '#ef4444', fontFamily: 'monospace' }}>{completionProbability}%</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Confidence Score</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* KPI Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Average Lead Time', value: analyticsSummary.leadTimeAvg, unit: 'Days', icon: Clock, color: '#8b5cf6', desc: 'Telemetry: Commit to Deploy' },
                { title: 'Average Cycle Time', value: analyticsSummary.cycleTimeAvg, unit: 'Days', icon: Activity, color: '#0ea5e9', desc: 'Telemetry: Start to Review' },
                { title: 'Deployment Freq', value: analyticsSummary.deploymentFrequency, unit: 'Deploys/wk', icon: Zap, color: '#10b981', desc: 'Telemetry: Production push' },
                { title: 'Defect Density', value: analyticsSummary.defectDensity, unit: 'Bugs/SP', icon: Bug, color: '#f59e0b', desc: 'Telemetry: Defect ratio' },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={idx} variants={cardVariants} whileHover={{ y: -3 }}
                    style={{ padding: '22px 24px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', transition: 'all 0.2s' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${stat.color}18`, border: `1px solid ${stat.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, flexShrink: 0 }}>
                      <Icon style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>{stat.title}</span>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'monospace', display: 'block', lineHeight: 1.2 }}>
                        {stat.value} <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{stat.unit}</span>
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--color-text-faint)', display: 'block', marginTop: '2px' }}>{stat.desc}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Double Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
              <motion.div variants={cardVariants} style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '22px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock style={{ width: '18px', color: '#8b5cf6' }} />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Lead Time vs Cycle Time Trends (Sprints 1–9)</h3>
                </div>
                <div style={{ height: '260px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalSprintsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="leadGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.16} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="cycleGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.16} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--color-text-faint)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--color-text-faint)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--color-text-primary)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '700' }} />
                      <Area type="monotone" dataKey="Lead Time (Days)" fill="url(#leadGlow)" stroke="#8b5cf6" strokeWidth={2} isAnimationActive={true} animationDuration={1200} activeDot={{ r: 5, stroke: 'var(--color-card-ambient)', strokeWidth: 1.5 }} />
                      <Area type="monotone" dataKey="Cycle Time (Days)" fill="url(#cycleGlow)" stroke="#06b6d4" strokeWidth={2} isAnimationActive={true} animationDuration={1200} activeDot={{ r: 5, stroke: 'var(--color-card-ambient)', strokeWidth: 1.5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={cardVariants} style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '22px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 style={{ width: '18px', color: '#10b981' }} />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Historical Target Commitments vs Completed Velocity</h3>
                </div>
                <div style={{ height: '260px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalSprintsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--color-text-faint)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--color-text-faint)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--color-text-primary)' }} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '700' }} />
                      <Bar dataKey="Committed" name="Committed Story Points" fill="var(--color-text-faint)" radius={[4, 4, 0, 0]} opacity={0.65} isAnimationActive={true} animationDuration={1000} />
                      <Bar dataKey="Completed" name="Completed Velocity" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1200} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Three Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              <motion.div variants={cardVariants} style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '22px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers style={{ width: '18px', color: '#0ea5e9' }} />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Flow Efficiency: Average Stage Duration (Days)</h3>
                </div>
                <div style={{ height: '220px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={stageData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" horizontal={false} />
                      <XAxis type="number" stroke="var(--color-text-faint)" fontSize={10} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="var(--color-text-faint)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--color-text-primary)' }} />
                      <Bar dataKey="duration" name="Days in Stage" fill="#0ea5e9" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={1200} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={cardVariants} style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '22px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bug style={{ width: '18px', color: '#ef4444' }} />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Defect Density Historical Trend</h3>
                </div>
                <div style={{ height: '220px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalSprintsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border)" vertical={false} />
                      <XAxis dataKey="name" stroke="var(--color-text-faint)" fontSize={10} tickLine={false} />
                      <YAxis stroke="var(--color-text-faint)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--color-text-primary)' }} />
                      <Line type="monotone" dataKey="Defect Density" name="Bugs per Story Point" stroke="#f59e0b" strokeWidth={2.5} activeDot={{ r: 6, stroke: 'var(--color-card-ambient)', strokeWidth: 1.5 }} isAnimationActive={true} animationDuration={1200} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={cardVariants} style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '22px', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PieIcon style={{ width: '18px', color: '#10b981' }} />
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Sprint Issue Type Distribution</h3>
                </div>
                <div style={{ height: '220px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '50%', height: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value">
                          {typeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '12px', fontSize: '11px', color: 'var(--color-text-primary)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ width: '50%', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px' }}>
                    {typeData.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length], display: 'inline-block' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{item.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{item.value} issues</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
