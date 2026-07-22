'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, AlertTriangle, Play, CheckCircle, RotateCcw, ShieldAlert,
  User, Layout, PieChart as PieChartIcon, Activity, X, ArrowRight,
  Clock, Tag, Flame, ChevronRight, ChevronDown
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppStore } from '@/lib/store';
import DashboardLayout from '@/components/dashboard-layout';

/* ── Theme tokens ──────────────────────────────────────────────── */
const TK = {
  dark: {
    bg: 'transparent',
    card: 'rgba(255,255,255,0.04)',
    cardSolid: 'rgba(15,23,42,0.95)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textFaint: '#475569',
    border: 'rgba(51,65,85,0.6)',
    colBg: 'rgba(255,255,255,0.02)',
    inputBg: 'rgba(255,255,255,0.05)',
    dropTarget: 'rgba(99,102,241,0.12)',
    dropBorder: 'rgba(99,102,241,0.5)',
    headerBg: 'rgba(7,11,22,0.6)',
  },
  light: {
    bg: 'transparent',
    card: '#ffffff',
    cardSolid: '#ffffff',
    text: '#0f172a',
    textMuted: '#64748b',
    textFaint: '#94a3b8',
    border: 'rgba(203,213,225,0.8)',
    colBg: 'rgba(241,245,249,0.7)',
    inputBg: '#ffffff',
    dropTarget: 'rgba(99,102,241,0.05)',
    dropBorder: 'rgba(99,102,241,0.4)',
    headerBg: 'rgba(248,250,252,0.9)',
  },
};

/* ── Column config ─────────────────────────────────────────────── */
const COLUMNS = [
  { id: 'To Do',      label: 'To Do',       color: '#94a3b8', glow: 'rgba(148,163,184,0.3)' },
  { id: 'In Progress', label: 'In Progress', color: '#6366f1', glow: 'rgba(99,102,241,0.3)'  },
  { id: 'In Review',  label: 'In Review',   color: '#f59e0b', glow: 'rgba(245,158,11,0.3)'  },
  { id: 'Done',       label: 'Done',        color: '#10b981', glow: 'rgba(16,185,129,0.3)'  },
];

const PRIORITY_COLOR: Record<string, { bg: string; text: string }> = {
  Critical: { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
  High:     { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b' },
  Medium:   { bg: 'rgba(99,102,241,0.12)', text: '#6366f1' },
  Low:      { bg: 'rgba(100,116,139,0.12)',text: '#64748b' },
};
const TYPE_COLOR: Record<string, string> = {
  Bug: '#f43f5e', Story: '#6366f1', Task: '#94a3b8', Blocker: '#f43f5e', Epic: '#8b5cf6',
};
const AVATAR_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316'];

/* ── Issue Detail Drawer ───────────────────────────────────────── */
function IssueDrawer({ issue, developers, epics, isDark, T, onClose, onPatch, isMutating }: {
  issue: any; developers: any[]; epics: any[]; isDark: boolean; T: typeof TK.dark;
  onClose: () => void; onPatch: (p: any) => void; isMutating: boolean;
}) {
  const dev = developers.find((d: any) => d.id === issue.assigneeId);
  const epic = epics.find((e: any) => e.id === issue.epicId);
  const pStyle = PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.Low;
  const devIdx = developers.findIndex((d: any) => d.id === issue.assigneeId);
  const avatarColor = AVATAR_COLORS[devIdx % AVATAR_COLORS.length] || '#6366f1';

  const NEXT_STATUS: Record<string, { label: string; status: string; color: string }> = {
    'To Do':      { label: 'Start Work',    status: 'In Progress', color: '#6366f1' },
    'In Progress':{ label: 'Send to Review', status: 'In Review',  color: '#f59e0b' },
    'In Review':  { label: 'Approve & Done', status: 'Done',       color: '#10b981' },
    'Done':       { label: 'Reopen',         status: 'To Do',      color: '#94a3b8' },
  };
  const next = NEXT_STATUS[issue.status];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)', zIndex: 200 }}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh',
          zIndex: 201, display: 'flex', flexDirection: 'column',
          background: isDark ? 'rgba(7,11,22,0.98)' : '#ffffff',
          borderLeft: `1px solid ${T.border}`,
          boxShadow: '-20px 0 60px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint }}>{issue.id}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: pStyle.bg, color: pStyle.text }}>{issue.priority}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', background: `${TYPE_COLOR[issue.type] || '#64748b'}15`, color: TYPE_COLOR[issue.type] || '#64748b' }}>{issue.type}</span>
              </div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: T.text, lineHeight: 1.45, margin: 0 }}>{issue.title}</h2>
            </div>
            <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '8px', border: `1px solid ${T.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textMuted, flexShrink: 0 }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

          {/* Blocked banner */}
          {issue.isBlocked && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: '16px' }}
            >
              <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: '#ef4444', lineHeight: 1.5 }}><strong>Blocked:</strong> {issue.blockedReason || 'Awaiting resolution'}</span>
            </motion.div>
          )}

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {[
              { label: 'Status', val: issue.status, color: COLUMNS.find(c => c.id === issue.status)?.color || '#94a3b8' },
              { label: 'Story Points', val: `${issue.storyPoints} SP`, color: '#6366f1' },
              { label: 'Risk Score', val: `${issue.riskScore}/100`, color: issue.riskScore > 70 ? '#ef4444' : issue.riskScore > 40 ? '#f59e0b' : '#22c55e' },
              { label: 'Epic', val: epic?.name || '—', color: epic?.color || T.textFaint },
            ].map(m => (
              <div key={m.label} style={{ padding: '10px 12px', borderRadius: '10px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>{m.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: m.color }}>{m.val}</div>
              </div>
            ))}
          </div>

          {/* Risk bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', color: T.textMuted }}>Risk Score</span>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: issue.riskScore > 70 ? '#ef4444' : issue.riskScore > 40 ? '#f59e0b' : '#22c55e' }}>{issue.riskScore}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '99px', background: T.border, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${issue.riskScore}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: '99px', background: issue.riskScore > 70 ? '#ef4444' : issue.riskScore > 40 ? '#f59e0b' : '#22c55e' }}
              />
            </div>
          </div>

          {/* Assignee */}
          {dev && (
            <div style={{ marginBottom: '20px', padding: '12px 14px', borderRadius: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Assignee</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${avatarColor}20`, border: `2px solid ${avatarColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: avatarColor }}>
                  {dev.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: T.text }}>{dev.name}</div>
                  <div style={{ fontSize: '10px', color: T.textMuted, fontFamily: 'monospace' }}>{dev.role} · {dev.utilization}% utilized</div>
                </div>
              </div>
            </div>
          )}

          {/* Move workflow */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: T.textFaint, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Workflow Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Primary move action */}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { onPatch({ id: issue.id, status: next.status }); onClose(); }}
                disabled={isMutating}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer', border: 'none',
                  background: `linear-gradient(135deg, ${next.color}ee, ${next.color}aa)`,
                  color: '#fff', fontSize: '13px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: `0 4px 16px ${next.color}40`,
                }}
              >
                <ArrowRight size={15} />
                {next.label}
              </motion.button>

              {/* All status options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {COLUMNS.filter(c => c.id !== issue.status).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onPatch({ id: issue.id, status: c.id }); onClose(); }}
                    disabled={isMutating}
                    style={{
                      padding: '8px 12px', borderRadius: '9px', cursor: 'pointer',
                      background: `${c.color}10`, border: `1px solid ${c.color}30`,
                      color: c.color, fontSize: '11px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    Move to {c.label}
                  </button>
                ))}
              </div>

              {/* Block / Unblock */}
              <button
                onClick={() => { onPatch({ id: issue.id, isBlocked: !issue.isBlocked, blockedReason: issue.isBlocked ? null : 'Waiting on dependency' }); onClose(); }}
                disabled={isMutating}
                style={{
                  width: '100%', padding: '9px 14px', borderRadius: '10px', cursor: 'pointer',
                  background: issue.isBlocked ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${issue.isBlocked ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  color: issue.isBlocked ? '#10b981' : '#ef4444',
                  fontSize: '12px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <ShieldAlert size={13} />
                {issue.isBlocked ? '✓ Mark as Unblocked' : '⚠ Mark as Blocked'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════ MAIN PAGE ══════════════════════════ */
export default function SprintBoardPage() {
  const { activeSprintId, theme } = useAppStore();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';
  const T = isDark ? TK.dark : TK.light;

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [epicFilter, setEpicFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data', activeSprintId],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${activeSprintId}`);
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
  });

  const patchMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch('/api/issues', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard-data', activeSprintId] }),
  });

  /* ── Drag handlers ── */
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedIssueId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) e.target.style.opacity = '0.45';
    }, 0);
  };
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIssueId(null);
    setDragOverCol(null);
    if (e.target instanceof HTMLElement) e.target.style.opacity = '1';
  };
  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) setDragOverCol(colId);
  };
  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedIssueId) {
      const issue = data?.issues.find((i: any) => i.id === draggedIssueId);
      if (issue && issue.status !== colId) {
        patchMutation.mutate({ id: draggedIssueId, status: colId });
      }
    }
    setDraggedIssueId(null);
  };

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid transparent', borderTopColor: '#6366f1', borderRightColor: '#2dd4bf' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: isDark ? '#475569' : '#94a3b8' }}>Loading sprint board…</span>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, issues, developers, epics } = data;
  const S = sprints.find((s: any) => s.id === activeSprintId) || sprints[sprints.length - 1];
  const completionPct = S.targetPoints > 0 ? Math.min(Math.round((S.completedPoints / S.targetPoints) * 100), 100) : 0;

  const filteredIssues = issues.filter((issue: any) => {
    if (search && !issue.title.toLowerCase().includes(search.toLowerCase()) && !issue.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (epicFilter && issue.epicId !== epicFilter) return false;
    if (assigneeFilter && issue.assigneeId !== assigneeFilter) return false;
    if (priorityFilter && issue.priority !== priorityFilter) return false;
    return true;
  });

  const blockerCount = issues.filter((i: any) => i.isBlocked).length;

  const epicPieData = epics.map((ep: any) => ({
    name: ep.name,
    value: issues.filter((i: any) => i.epicId === ep.id).reduce((a: number, i: any) => a + i.storyPoints, 0),
    color: ep.color,
  })).filter((e: any) => e.value > 0);

  const workloadData = developers.slice(0, 6).map((dev: any, idx: number) => {
    const devIssues = issues.filter((i: any) => i.assigneeId === dev.id);
    const done = devIssues.filter((i: any) => i.status === 'Done').length;
    const total = devIssues.length;
    return { name: dev.name.split(' ')[0], done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0, color: AVATAR_COLORS[idx % AVATAR_COLORS.length] };
  });

  return (
    <DashboardLayout>
      {/* Issue detail drawer */}
      <AnimatePresence>
        {selectedIssue && (
          <IssueDrawer
            issue={selectedIssue}
            developers={developers}
            epics={epics}
            isDark={isDark}
            T={T}
            onClose={() => setSelectedIssue(null)}
            onPatch={(p) => patchMutation.mutate(p)}
            isMutating={patchMutation.isPending}
          />
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

        {/* ─── PAGE HEADER ─── */}
        <div style={{
          padding: '18px 24px 14px',
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          background: isDark ? 'rgba(7,11,22,0.6)' : 'rgba(248,250,252,0.95)',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Title row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'monospace', color: T.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Sprint Board</div>
                <h1 style={{ fontSize: '20px', fontWeight: 800, color: T.text, letterSpacing: '-0.02em', margin: 0 }}>{S.name}</h1>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '99px',
                background: S.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.12)',
                color: S.status === 'active' ? '#22c55e' : T.textMuted,
                border: `1px solid ${S.status === 'active' ? 'rgba(34,197,94,0.3)' : T.border}`,
              }}>
                {S.status === 'active' ? '● Active' : S.status}
              </span>
            </div>

            {/* Stat chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'Issues', val: issues.length, color: '#6366f1' },
                { label: 'Done SP', val: `${S.completedPoints}/${S.targetPoints}`, color: '#10b981' },
                { label: 'Blockers', val: blockerCount, color: '#ef4444' },
                { label: 'Team', val: developers.length, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '6px 12px', borderRadius: '10px',
                  background: `${s.color}10`, border: `1px solid ${s.color}25`,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: s.color }}>{s.val}</span>
                  <span style={{ fontSize: '10px', color: T.textMuted }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SP Progress bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: T.textMuted, fontFamily: 'monospace', marginBottom: '5px' }}>
              <span>{S.completedPoints} / {S.targetPoints} SP Completed</span>
              <span style={{ fontWeight: 700, color: completionPct >= 70 ? '#22c55e' : completionPct >= 40 ? '#f59e0b' : '#ef4444' }}>{completionPct}%</span>
            </div>
            <div style={{ height: '5px', borderRadius: '99px', background: T.border, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #6366f1, #2dd4bf)' }}
              />
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search issues..."
                style={{
                  padding: '7px 10px 7px 30px', borderRadius: '9px',
                  background: T.inputBg, border: `1px solid ${T.border}`,
                  color: T.text, fontSize: '12px', outline: 'none', width: '200px',
                }}
              />
            </div>
            {[
              { val: epicFilter, set: setEpicFilter, opts: epics.map((e: any) => ({ v: e.id, l: e.name })), placeholder: 'All Epics' },
              { val: assigneeFilter, set: setAssigneeFilter, opts: developers.map((d: any) => ({ v: d.id, l: d.name.split(' ')[0] })), placeholder: 'All Assignees' },
              { val: priorityFilter, set: setPriorityFilter, opts: ['Critical','High','Medium','Low'].map(p => ({ v: p, l: p })), placeholder: 'All Priorities' },
            ].map((f, fi) => (
              <select key={fi} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ padding: '7px 10px', borderRadius: '9px', background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, fontSize: '12px', outline: 'none' }}>
                <option value="">{f.placeholder}</option>
                {f.opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ))}
            {(search || epicFilter || assigneeFilter || priorityFilter) && (
              <button onClick={() => { setSearch(''); setEpicFilter(''); setAssigneeFilter(''); setPriorityFilter(''); }}
                style={{ padding: '7px 12px', borderRadius: '9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Clear ×
              </button>
            )}
          </div>
        </div>

        {/* ─── BOARD + SIDEBAR ─── */}
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 220px',
          gap: '16px',
          padding: '16px 20px',
          overflowY: 'auto',
          overflowX: 'auto',
          alignItems: 'start',
          minHeight: 0,
        }}>

          {/* ── KANBAN COLUMNS ── */}
          {COLUMNS.map(col => {
            const colIssues = filteredIssues.filter((i: any) => i.status === col.id);
            const isOver = dragOverCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.id)}
                style={{
                  borderRadius: '16px',
                  background: isOver ? T.dropTarget : T.colBg,
                  border: `1.5px solid ${isOver ? col.color : T.border}`,
                  boxShadow: isOver ? `0 0 18px ${col.glow}` : 'none',
                  transition: 'all 0.18s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '200px',
                }}
              >
                {/* Column header */}
                <div style={{
                  padding: '12px 14px 10px',
                  borderBottom: `1px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: `3px solid ${col.color}`,
                  borderRadius: '14px 14px 0 0',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: COLUMNS.indexOf(col) * 0.4 }}
                      style={{ width: '7px', height: '7px', borderRadius: '50%', background: col.color, display: 'inline-block', boxShadow: `0 0 6px ${col.color}` }}
                    />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: T.text, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'monospace' }}>{col.label}</span>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, fontFamily: 'monospace',
                    padding: '2px 8px', borderRadius: '99px',
                    background: `${col.color}18`, color: col.color,
                    border: `1px solid ${col.color}30`,
                  }}>{colIssues.length}</span>
                </div>

                {/* Cards list */}
                <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {colIssues.length === 0 && (
                    <div style={{
                      margin: '8px 0', height: '72px', borderRadius: '10px',
                      border: `1.5px dashed ${T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      color: T.textFaint, fontSize: '11px', fontFamily: 'monospace',
                    }}>
                      <ChevronDown size={13} /> Drop here
                    </div>
                  )}

                  {colIssues.map((issue: any, cardIdx: number) => {
                    const epic = epics.find((e: any) => e.id === issue.epicId);
                    const devIdx = developers.findIndex((d: any) => d.id === issue.assigneeId);
                    const aColor = AVATAR_COLORS[devIdx % AVATAR_COLORS.length] || '#6366f1';
                    const dev = developers.find((d: any) => d.id === issue.assigneeId);
                    const pStyle = PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.Low;
                    const NEXT: Record<string, { label: string; status: string; color: string }> = {
                      'To Do':       { label: 'Start', status: 'In Progress', color: '#6366f1' },
                      'In Progress': { label: 'Review', status: 'In Review',  color: '#f59e0b' },
                      'In Review':   { label: 'Approve', status: 'Done',      color: '#10b981' },
                      'Done':        { label: 'Reopen', status: 'To Do',      color: '#94a3b8' },
                    };
                    const next = NEXT[issue.status];

                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={e => handleDragStart(e, issue.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedIssue(issue)}
                        style={{ cursor: 'pointer' }}
                      >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: cardIdx * 0.04 }}
                        whileHover={{ y: -2, boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? 0.35 : 0.1}), 0 0 0 1px ${epic?.color || col.color}30` }}
                        style={{
                          borderRadius: '12px',
                          background: T.card,
                          border: `1px solid ${issue.isBlocked ? 'rgba(239,68,68,0.4)' : T.border}`,
                          padding: '12px',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.25)' : '0 1px 6px rgba(0,0,0,0.06)',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        {/* Epic bottom bar */}
                        {epic && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: epic.color, opacity: 0.7 }} />
                        )}

                        {/* Blocked badge */}
                        {issue.isBlocked && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertTriangle size={10} style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '9px', fontWeight: 700, color: '#ef4444', fontFamily: 'monospace' }}>BLOCKED</span>
                          </div>
                        )}

                        {/* ID + badges */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '9px', fontFamily: 'monospace', color: T.textFaint, fontWeight: 700 }}>{issue.id}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: pStyle.bg, color: pStyle.text }}>{issue.priority}</span>
                            <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: `${TYPE_COLOR[issue.type] || '#64748b'}15`, color: TYPE_COLOR[issue.type] || '#64748b' }}>{issue.type}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <p style={{ fontSize: '12px', fontWeight: 600, color: T.text, lineHeight: 1.45, marginBottom: '10px', margin: '0 0 10px' }}>{issue.title}</p>

                        {/* Risk bar */}
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ height: '3px', borderRadius: '99px', background: T.border, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${issue.riskScore}%`, background: issue.riskScore > 70 ? '#ef4444' : issue.riskScore > 40 ? '#f59e0b' : '#22c55e', borderRadius: '99px' }} />
                          </div>
                        </div>

                        {/* Footer: avatar + SP + quick action */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.border}`, paddingTop: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '7px', background: `${aColor}20`, border: `1.5px solid ${aColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: aColor }}>
                              {dev?.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                            </div>
                            <span style={{ fontSize: '10px', color: T.textMuted }}>{dev?.name.split(' ')[0] || '—'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, padding: '2px 7px', borderRadius: '5px', background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{issue.storyPoints}</span>
                            {next && (
                              <button
                                onClick={e => { e.stopPropagation(); patchMutation.mutate({ id: issue.id, status: next.status }); }}
                                title={next.label}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '3px',
                                  padding: '3px 8px', borderRadius: '6px', cursor: 'pointer',
                                  background: `${next.color}15`, border: `1px solid ${next.color}30`,
                                  color: next.color, fontSize: '9px', fontWeight: 800,
                                }}
                              >
                                <ArrowRight size={10} />{next.label}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── STICKY SIDEBAR ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'sticky', top: 0 }}>

            {/* Epic Distribution */}
            <div style={{ borderRadius: '14px', background: T.card, border: `1px solid ${T.border}`, padding: '16px', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <PieChartIcon size={13} style={{ color: '#6366f1' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: T.text }}>Epic SP Split</span>
              </div>
              <div style={{ height: '130px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={epicPieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={3} dataKey="value" isAnimationActive animationDuration={1200}>
                      {epicPieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: isDark ? '#0f172a' : '#fff', border: `1px solid ${T.border}`, borderRadius: '8px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {epicPieData.slice(0, 4).map((e: any, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '2px', background: e.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', color: T.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>{e.name}</span>
                    </div>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: T.text }}>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Workload */}
            <div style={{ borderRadius: '14px', background: T.card, border: `1px solid ${T.border}`, padding: '16px', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Activity size={13} style={{ color: '#2dd4bf' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: T.text }}>Team Workload</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {workloadData.map((w: any) => (
                  <div key={w.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '10px', color: T.text, fontWeight: 600 }}>{w.name}</span>
                      <span style={{ fontSize: '9px', fontFamily: 'monospace', color: T.textMuted }}>{w.done}/{w.total}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '99px', background: T.border, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${w.pct}%` }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height: '100%', borderRadius: '99px', background: `linear-gradient(90deg, ${w.color}, ${w.color}90)` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sprint velocity */}
            <div style={{ borderRadius: '14px', background: T.card, border: `1px solid ${T.border}`, padding: '16px', boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Flame size={13} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: T.text }}>Sprint Velocity</span>
              </div>
              <div style={{ fontSize: '30px', fontWeight: 900, color: '#10b981', lineHeight: 1, marginBottom: '4px', fontFamily: 'var(--font-ui)' }}>{S.velocity}</div>
              <div style={{ fontSize: '10px', color: T.textMuted, fontFamily: 'monospace' }}>SP avg per sprint</div>
              <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { l: 'Health', v: `${S.healthScore}/100`, c: S.healthScore >= 70 ? '#22c55e' : '#f59e0b' },
                  { l: 'Completion', v: `${completionPct}%`, c: '#6366f1' },
                ].map(m => (
                  <div key={m.l} style={{ padding: '7px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: '9px', color: T.textMuted }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
