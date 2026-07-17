'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Layers, Flame, Calendar, AlertTriangle, ArrowRight, Check } from 'lucide-react';

const stagger: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};

const colConfig = [
  { title: 'To Do',      status: 'To Do',      accent: '#475569', glow: 'rgba(71,85,105,0.15)' },
  { title: 'In Progress', status: 'In Progress', accent: '#6366f1', glow: 'rgba(99,102,241,0.15)' },
  { title: 'In Review',  status: 'In Review',  accent: '#f59e0b', glow: 'rgba(245,158,11,0.15)' },
  { title: 'Done',       status: 'Done',       accent: '#10b981', glow: 'rgba(16,185,129,0.15)' },
];

const priorityMap: Record<string, { bg: string; color: string; border: string }> = {
  Critical: { bg: 'rgba(244,63,94,0.10)',  color: '#fda4af', border: 'rgba(244,63,94,0.25)' },
  High:     { bg: 'rgba(245,158,11,0.10)', color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
  Medium:   { bg: 'rgba(99,102,241,0.10)', color: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
  Low:      { bg: 'rgba(71,85,105,0.10)',  color: '#94a3b8', border: 'rgba(71,85,105,0.25)' },
};

const typeMap: Record<string, string> = {
  Bug: '#f43f5e', Blocker: '#f43f5e', Story: '#6366f1', Task: '#94a3b8',
};

export default function SprintBoard() {
  const { activeSprintId, filters, setFilter } = useAppStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data', activeSprintId],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${activeSprintId}`);
      if (!res.ok) throw new Error('API error');
      return res.json();
    },
  });

  const patchMutation = useMutation({
    mutationFn: async (upd: any) => {
      const res = await fetch('/api/issues', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(upd) });
      if (!res.ok) throw new Error('PATCH failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dashboard-data', activeSprintId] }),
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div className="spinner" />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Loading board…</span>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, developers, epics, issues } = data;
  const S = sprints.find((s: any) => s.id === activeSprintId) || sprints[9];

  const filtered = issues.filter((i: any) => {
    if (filters.search && !i.title.toLowerCase().includes(filters.search.toLowerCase()) && !i.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.epic && i.epicId !== filters.epic) return false;
    if (filters.assigneeId && i.assigneeId !== filters.assigneeId) return false;
    if (filters.priority && i.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;
    return true;
  });

  const epicPie = epics.map((e: any) => {
    const pts = filtered.filter((i: any) => i.epicId === e.id).reduce((s: number, i: any) => s + i.storyPoints, 0);
    return { name: e.name.split(' ').slice(0, 2).join(' '), value: pts, color: e.color };
  }).filter((e: any) => e.value > 0);

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        className="page-enter"
      >
        {/* ── HEADER ─────────────────────────────────── */}
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Sprint Board</h1>
              <span className="stat-badge stat-badge-indigo">{S.name}</span>
              {S.status === 'active' && <span className="stat-badge stat-badge-emerald">● Active</span>}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              <Calendar style={{ width: '11px', height: '11px', display: 'inline', marginRight: '5px' }} />
              {S.startDate} → {S.endDate} &nbsp;·&nbsp; {S.completedPoints} / {S.targetPoints} SP
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Filters */}
            {['epic', 'assigneeId', 'priority'].map((key) => (
              <select key={key} value={(filters as any)[key]} onChange={(e) => setFilter(key as any, e.target.value)}
                className="ctrl" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                <option value="">{key === 'assigneeId' ? 'All Assignees' : key === 'epic' ? 'All Epics' : 'All Priorities'}</option>
                {key === 'priority' && ['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p} value={p} style={{ background: '#0d1220' }}>{p}</option>)}
                {key === 'epic' && epics.map((e: any) => <option key={e.id} value={e.id} style={{ background: '#0d1220' }}>{e.name}</option>)}
                {key === 'assigneeId' && developers.map((d: any) => <option key={d.id} value={d.id} style={{ background: '#0d1220' }}>{d.name}</option>)}
              </select>
            ))}
            {(filters.epic || filters.assigneeId || filters.priority) && (
              <button onClick={() => { setFilter('epic',''); setFilter('assigneeId',''); setFilter('priority',''); }}
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.20)', borderRadius: '8px', color: '#fda4af', fontSize: '11px', fontFamily: 'var(--font-mono)', padding: '8px 14px', cursor: 'pointer', fontWeight: 700 }}>
                Clear
              </button>
            )}
          </div>
        </motion.div>

        <hr className="gradient-line" />

        {/* ── BOARD + CHART ────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 220px', gap: '14px', alignItems: 'start' }}>

          {/* Kanban Columns */}
          {colConfig.map((col) => {
            const colIssues = filtered.filter((i: any) => i.status === col.status);
            return (
              <motion.div key={col.status} variants={fadeUp}
                className="kanban-col"
                style={{ borderTop: `3px solid ${col.accent}` }}
              >
                {/* Column Header */}
                <div className="kanban-col-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.accent, boxShadow: `0 0 8px ${col.accent}88` }} />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                      {col.title}
                    </span>
                  </div>
                  <span style={{
                    padding: '3px 9px', borderRadius: '99px',
                    background: `${col.glow}`, border: `1px solid ${col.accent}44`,
                    fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 800,
                    color: col.accent,
                  }}>
                    {colIssues.length}
                  </span>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
                  {colIssues.length === 0 ? (
                    <div style={{
                      margin: '12px', height: '80px', borderRadius: '10px',
                      border: '1px dashed rgba(255,255,255,0.07)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.15)', fontSize: '11px', fontFamily: 'var(--font-mono)',
                    }}>
                      Empty
                    </div>
                  ) : (
                    colIssues.map((issue: any) => {
                      const dev = developers.find((d: any) => d.id === issue.assigneeId);
                      const epic = epics.find((e: any) => e.id === issue.epicId);
                      const pStyle = priorityMap[issue.priority] || priorityMap.Low;

                      return (
                        <div key={issue.id} className={`kanban-card ${issue.isBlocked ? 'kanban-card-blocked' : ''}`}>
                          {/* Epic accent bar */}
                          <div style={{ position: 'absolute', bottom: 0, left: '12px', right: '12px', height: '2px', borderRadius: '1px', background: epic?.color || '#475569', opacity: 0.6 }} />

                          {/* Row 1: ID + Priority */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'rgba(255,255,255,0.30)' }}>
                              {issue.id}
                            </span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
                              fontFamily: 'var(--font-mono)', background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}`,
                            }}>
                              {issue.priority}
                            </span>
                          </div>

                          {/* Title */}
                          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {issue.title}
                          </p>

                          {/* Blocker Banner */}
                          {issue.isBlocked && (
                            <div style={{
                              display: 'flex', alignItems: 'flex-start', gap: '6px',
                              padding: '8px 10px', borderRadius: '8px',
                              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.20)',
                              color: '#fda4af', fontSize: '10px', fontFamily: 'var(--font-mono)', lineHeight: 1.4,
                            }}>
                              <AlertTriangle style={{ width: '12px', height: '12px', flexShrink: 0, marginTop: '1px' }} />
                              <span>{issue.blockedReason}</span>
                            </div>
                          )}

                          {/* Row: type + SP + dev */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <img src={dev?.avatar} alt="" style={{ width: '20px', height: '20px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.10)' }} />
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.30)', fontWeight: 600 }}>{dev?.name?.split(' ')[0]}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: typeMap[issue.type] || '#94a3b8', textTransform: 'uppercase' }}>
                                {issue.type}
                              </span>
                              <span style={{
                                padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 800,
                                fontFamily: 'var(--font-mono)', background: 'rgba(99,102,241,0.10)',
                                border: '1px solid rgba(99,102,241,0.20)', color: '#a5b4fc',
                              }}>
                                {issue.storyPoints}
                              </span>
                            </div>
                          </div>

                          {/* Action Row (hover revealed via CSS group) */}
                          <div className="card-actions" style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px',
                          }}>
                            {issue.status === 'In Progress' && (
                              <button onClick={(e) => { e.stopPropagation(); const r = issue.isBlocked ? null : (prompt('Enter blocker reason:') || 'Waiting on dependency'); patchMutation.mutate({ id: issue.id, isBlocked: !issue.isBlocked, blockedReason: r }); }}
                                style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer', border: '1px solid', transition: 'all 0.15s ease', background: issue.isBlocked ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', color: issue.isBlocked ? '#6ee7b7' : '#fda4af', borderColor: issue.isBlocked ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)' }}>
                                {issue.isBlocked ? '✓ Resolve' : '⚠ Block'}
                              </button>
                            )}
                            <div style={{ marginLeft: 'auto' }}>
                              {issue.status === 'To Do' && (
                                <button onClick={(e) => { e.stopPropagation(); patchMutation.mutate({ id: issue.id, status: 'In Progress' }); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                                  Start <ArrowRight style={{ width: '10px', height: '10px' }} />
                                </button>
                              )}
                              {issue.status === 'In Progress' && (
                                <button onClick={(e) => { e.stopPropagation(); patchMutation.mutate({ id: issue.id, status: 'In Review' }); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}>
                                  Review <ArrowRight style={{ width: '10px', height: '10px' }} />
                                </button>
                              )}
                              {issue.status === 'In Review' && (
                                <button onClick={(e) => { e.stopPropagation(); patchMutation.mutate({ id: issue.id, status: 'Done' }); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
                                  Approve <Check style={{ width: '10px', height: '10px' }} />
                                </button>
                              )}
                              {issue.status === 'Done' && (
                                <button onClick={(e) => { e.stopPropagation(); patchMutation.mutate({ id: issue.id, status: 'To Do' }); }}
                                  style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, fontFamily: 'var(--font-mono)', cursor: 'pointer', background: 'rgba(71,85,105,0.12)', border: '1px solid rgba(71,85,105,0.25)', color: '#94a3b8' }}>
                                  Reopen
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Epic Pie Chart Column */}
          <motion.div variants={fadeUp} className="panel-static" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Layers style={{ width: '13px', height: '13px', color: '#a5b4fc' }} />
                Epic SP Split
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Story points by area</div>
            </div>

            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={epicPie} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value"
                    isAnimationActive animationDuration={1400} animationEasing="ease-out">
                    {epicPie.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(13,18,32,0.97)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {epicPie.map((e: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: e.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f1f5f9', flexShrink: 0, marginLeft: '6px' }}>{e.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
