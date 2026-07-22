'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  ListTodo,
  Activity,
  Bug,
  Award,
  Zap,
  ChevronRight,
  X,
  Code,
  Sparkles,
  TrendingUp,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/* ── Theme Tokens ───────────────────────────────────────── */
const TK = {
  dark: {
    bg: 'transparent',
    card: 'rgba(255, 255, 255, 0.03)',
    cardHover: 'rgba(255, 255, 255, 0.06)',
    cardActive: 'rgba(99, 102, 241, 0.12)',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    textFaint: '#475569',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: 'rgba(99, 102, 241, 0.5)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  light: {
    bg: 'transparent',
    card: '#ffffff',
    cardHover: '#f8fafc',
    cardActive: 'rgba(99, 102, 241, 0.08)',
    text: '#0f172a',
    textMuted: '#64748b',
    textFaint: '#94a3b8',
    border: 'rgba(203, 213, 225, 0.8)',
    borderActive: 'rgba(99, 102, 241, 0.4)',
    shadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
  }
};

const AVATAR_PALETTE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];

/* ── Fallback Avatar Component ── */
function DevAvatar({ src, name, size = 48, className = '' }: { src?: string; name: string; size?: number; className?: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : '?';
  const colorIndex = (name || '').length % AVATAR_PALETTE.length;
  const bgColor = AVATAR_PALETTE[colorIndex];

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setHasError(true)}
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`rounded-2xl object-cover border border-white/10 shadow-sm flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `linear-gradient(135deg, ${bgColor}40, ${bgColor}15)`,
        border: `1.5px solid ${bgColor}60`,
        color: bgColor,
        fontSize: `${Math.round(size * 0.38)}px`,
      }}
      className={`rounded-2xl font-black flex items-center justify-center flex-shrink-0 shadow-sm ${className}`}
    >
      {initials}
    </div>
  );
}

/* ── Interactive Floating Detail Drawer (Dismisses on outside click) ── */
function DevDetailDrawer({ dev, issues, epics, isDark, T, onClose }: {
  dev: any; issues: any[]; epics: any[]; isDark: boolean; T: typeof TK.dark; onClose: () => void;
}) {
  const isOverloaded = dev.assignedPoints > dev.capacityPoints;
  const colorIndex = (dev.name || '').length % AVATAR_PALETTE.length;
  const mainColor = AVATAR_PALETTE[colorIndex];
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      {/* Click Anywhere Outside Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          cursor: 'pointer',
        }}
      />

      {/* Floating Side Panel starting cleanly from top with full internal scrolling */}
      <motion.div
        ref={drawerRef}
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          bottom: '20px',
          width: 'calc(100% - 40px)',
          maxWidth: '460px',
          maxHeight: 'calc(100vh - 40px)',
          zIndex: 1001,
          background: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${T.border}`,
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Fixed Top Header (Never Hidden) */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${T.border}`,
          background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <DevAvatar src={dev.avatar} name={dev.name} size={48} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: T.text, margin: 0 }}>{dev.name}</h3>
                {isOverloaded && (
                  <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontFamily: 'monospace' }}>
                    OVERLOADED
                  </span>
                )}
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: mainColor, fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>
                {dev.role}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close (Esc)"
            style={{ width: '32px', height: '32px', borderRadius: '10px', border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Dedicated Scrollable Panel Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '20px', WebkitOverflowScrolling: 'touch' }}>
          
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ padding: '12px 8px', borderRadius: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase' }}>Workload</span>
              <div style={{ fontSize: '14px', fontWeight: 900, color: isOverloaded ? '#ef4444' : '#10b981', marginTop: '2px' }}>
                {dev.assignedPoints}/{dev.capacityPoints} SP
              </div>
            </div>
            <div style={{ padding: '12px 8px', borderRadius: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase' }}>Completed</span>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#6366f1', marginTop: '2px' }}>
                {dev.completedIssuesCount} Tasks
              </div>
            </div>
            <div style={{ padding: '12px 8px', borderRadius: '14px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9', border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase' }}>Defect Density</span>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#f59e0b', marginTop: '2px' }}>
                {dev.defectDensity}
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', marginBottom: '6px' }}>
              <span style={{ color: T.textFaint, fontWeight: 700 }}>CAPACITY UTILIZATION</span>
              <span style={{ fontWeight: 800, color: isOverloaded ? '#ef4444' : dev.utilization >= 75 ? '#2dd4bf' : '#10b981' }}>
                {dev.utilization}%
              </span>
            </div>
            <div style={{ height: '6px', borderRadius: '99px', background: T.border, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(dev.utilization, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: '99px',
                  background: isOverloaded ? '#ef4444' : dev.utilization >= 75 ? '#2dd4bf' : '#10b981',
                }}
              />
            </div>
          </div>

          {/* Skill Matrix */}
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: T.textMuted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
              Skill Matrix
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {dev.skills.map((skill: string) => (
                <span key={skill} style={{ padding: '4px 10px', borderRadius: '8px', background: `${mainColor}15`, border: `1px solid ${mainColor}35`, color: mainColor, fontSize: '10px', fontWeight: 700, fontFamily: 'monospace' }}>
                  ⚡ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Active Assigned Tickets */}
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, color: T.textMuted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
              Active Assigned Tickets ({issues.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {issues.length === 0 ? (
                <div style={{ padding: '16px', borderRadius: '12px', border: `1px dashed ${T.border}`, textAlign: 'center', color: T.textFaint, fontSize: '12px', fontFamily: 'monospace' }}>
                  No active issues assigned in this sprint.
                </div>
              ) : (
                issues.map((issue: any) => {
                  const epic = epics.find((e: any) => e.id === issue.epicId);
                  return (
                    <div key={issue.id} style={{ padding: '12px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, color: '#6366f1' }}>{issue.id}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{issue.priority}</span>
                      </div>
                      <h5 style={{ fontSize: '12px', fontWeight: 600, color: T.text, margin: 0, lineHeight: 1.4 }}>{issue.title}</h5>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
                        <span style={{ color: T.textMuted }}>{epic?.name || '—'}</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 800, color: T.text }}>{issue.storyPoints} SP</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </>
  );
}

/* ════════════════════════ MAIN COMPONENT ════════════════════════ */
export default function DeveloperInsights() {
  const { activeSprintId, theme } = useAppStore();
  const isDark = theme === 'dark';
  const T = isDark ? TK.dark : TK.light;

  const [activeModalDev, setActiveModalDev] = useState<any | null>(null);

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
        <div style={{ height: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#2dd4bf' }}
            />
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: T.textMuted }}>Compiling team workload graphs...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { developers, issues, epics } = data;
  const devsAndQa = developers.filter((d: any) => d.role === 'Developer' || d.role === 'QA');

  const totalCap = devsAndQa.reduce((acc: number, d: any) => acc + d.capacityPoints, 0);
  const totalAssigned = devsAndQa.reduce((acc: number, d: any) => acc + d.assignedPoints, 0);
  const avgUtil = totalCap > 0 ? Math.round((totalAssigned / totalCap) * 100) : 0;
  const overloadedCount = devsAndQa.filter((d: any) => d.assignedPoints > d.capacityPoints).length;
  const completedSP = issues.filter((i: any) => i.status === 'Done').reduce((acc: number, i: any) => acc + i.storyPoints, 0);

  const comparisonChartData = devsAndQa.map((d: any) => ({
    name: d.name.split(' ')[0],
    Commitment: d.assignedPoints,
    Capacity: d.capacityPoints,
  }));

  return (
    <DashboardLayout>
      {/* Floating Detail Drawer - Closes on Outside Click */}
      <AnimatePresence>
        {activeModalDev && (
          <DevDetailDrawer
            dev={activeModalDev}
            issues={issues.filter((i: any) => i.assigneeId === activeModalDev.id && i.sprintId === activeSprintId)}
            epics={epics}
            isDark={isDark}
            T={T}
            onClose={() => setActiveModalDev(null)}
          />
        )}
      </AnimatePresence>

      <div style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: T.text, letterSpacing: '-0.02em', margin: 0 }}>Team Insights</h1>
              <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '99px', background: 'rgba(99,102,241,0.15)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)', fontFamily: 'monospace' }}>
                Sprint {activeSprintId}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: T.textMuted, marginTop: '4px', margin: '4px 0 0' }}>
              Workload distribution, individual capacities, defect densities, and skill matrices.
            </p>
          </div>
        </div>

        {/* ── STATS CARDS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Team Size', value: devsAndQa.length, sub: 'Engineers & QA', icon: Users, color: '#6366f1' },
            { label: 'Avg Utilization', value: `${avgUtil}%`, sub: `${totalAssigned} / ${totalCap} SP`, icon: Activity, color: avgUtil > 90 ? '#ef4444' : '#2dd4bf' },
            { label: 'Points Delivered', value: `${completedSP} SP`, sub: 'Current Sprint', icon: CheckCircle2, color: '#10b981' },
            { label: 'Overloaded Members', value: overloadedCount, sub: overloadedCount > 0 ? 'Requires rebalancing' : 'Healthy load', icon: ShieldAlert, color: overloadedCount > 0 ? '#ef4444' : '#6366f1' },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              style={{
                padding: '16px 20px',
                borderRadius: '16px',
                background: T.card,
                border: `1px solid ${T.border}`,
                boxShadow: T.shadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
                <div style={{ fontSize: '20px', fontWeight: 900, color: T.text, marginTop: '2px' }}>{card.value}</div>
                <span style={{ fontSize: '10px', color: T.textMuted, display: 'block', marginTop: '2px' }}>{card.sub}</span>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${card.color}15`, border: `1px solid ${card.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                <card.icon size={20} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── FULL WIDTH TEAM ROSTER GRID ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: T.text, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} style={{ color: '#6366f1' }} />
              Team Roster & Workloads
            </span>
            <span style={{ fontSize: '11px', color: T.textMuted }}>Click member to view details</span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}>
            {devsAndQa.map((dev: any) => {
              const isOverloaded = dev.assignedPoints > dev.capacityPoints;
              const colorIdx = (dev.name || '').length % AVATAR_PALETTE.length;
              const accentColor = AVATAR_PALETTE[colorIdx];

              return (
                <motion.div
                  key={dev.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -3, boxShadow: `0 12px 30px rgba(0,0,0,0.25)` }}
                  onClick={() => setActiveModalDev(dev)}
                  style={{
                    padding: '18px',
                    borderRadius: '16px',
                    background: T.card,
                    border: `1.5px solid ${isOverloaded ? 'rgba(239,68,68,0.35)' : T.border}`,
                    cursor: 'pointer',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: T.shadow,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isOverloaded && (
                    <span style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '8px', fontWeight: 800, padding: '2px 7px', borderRadius: '99px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldAlert size={10} /> OVERLOADED
                    </span>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <DevAvatar src={dev.avatar} name={dev.name} size={48} />
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: T.text, margin: 0 }}>{dev.name}</h4>
                      <span style={{ fontSize: '11px', color: accentColor, fontWeight: 700, fontFamily: 'monospace', display: 'block', marginTop: '2px' }}>
                        {dev.role}
                      </span>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'monospace', marginBottom: '4px' }}>
                      <span style={{ color: T.textFaint, fontWeight: 700 }}>UTILIZATION</span>
                      <span style={{ fontWeight: 800, color: isOverloaded ? '#ef4444' : dev.utilization >= 75 ? '#2dd4bf' : '#10b981' }}>
                        {dev.assignedPoints} / {dev.capacityPoints} SP ({dev.utilization}%)
                      </span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '99px', background: T.border, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(dev.utilization, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          borderRadius: '99px',
                          background: isOverloaded ? '#ef4444' : dev.utilization >= 75 ? '#2dd4bf' : '#10b981',
                        }}
                      />
                    </div>
                  </div>

                  {/* Skills & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {dev.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'monospace', padding: '2px 6px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', color: T.textMuted, border: `1px solid ${T.border}` }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#6366f1', display: 'flex', alignItems: 'center', gap: '2px', fontFamily: 'monospace' }}>
                      Details <ArrowRight size={11} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── COMPARATIVE CHART ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '24px', borderRadius: '20px', background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow, display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: T.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} style={{ color: '#2dd4bf' }} />
                Team Workload vs Capacity Audit
              </span>
              <p style={{ fontSize: '11px', color: T.textMuted, margin: '2px 0 0' }}>Story point commitment vs max allocated capacity</p>
            </div>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} vertical={false} />
                <XAxis dataKey="name" stroke={T.textFaint} fontSize={10} tickLine={false} />
                <YAxis stroke={T.textFaint} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff',
                    border: `1px solid ${T.border}`,
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: T.text,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                  }}
                />
                <Bar dataKey="Capacity" name="Capacity SP" fill={isDark ? '#334155' : '#cbd5e1'} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1400} />
                <Bar dataKey="Commitment" name="Commitment SP" fill="#8b5cf6" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1600} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
