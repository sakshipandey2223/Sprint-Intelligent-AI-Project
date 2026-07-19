'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import { SearchCode, ChevronLeft, ChevronRight, X, AlertOctagon, Tag } from 'lucide-react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 26 } },
};
const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };

const priorityMap: Record<string, { bg: string; color: string; border: string }> = {
  Critical: { bg: 'rgba(244,63,94,0.10)', color: '#fda4af', border: 'rgba(244,63,94,0.25)' },
  High:     { bg: 'rgba(245,158,11,0.10)', color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
  Medium:   { bg: 'rgba(99,102,241,0.10)', color: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
  Low:      { bg: 'rgba(71,85,105,0.10)', color: '#94a3b8', border: 'rgba(71,85,105,0.25)' },
};

const statusMap: Record<string, { bg: string; color: string; border: string }> = {
  'Done':        { bg: 'rgba(16,185,129,0.10)', color: '#6ee7b7', border: 'rgba(16,185,129,0.25)' },
  'In Progress': { bg: 'rgba(99,102,241,0.10)', color: '#a5b4fc', border: 'rgba(99,102,241,0.25)' },
  'In Review':   { bg: 'rgba(245,158,11,0.10)', color: '#fcd34d', border: 'rgba(245,158,11,0.25)' },
  'To Do':       { bg: 'rgba(71,85,105,0.10)', color: '#94a3b8', border: 'rgba(71,85,105,0.25)' },
};

const Pill = ({ text, map }: { text: string; map: Record<string, any> }) => {
  const s = map[text] || map.Low || map['To Do'];
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
      fontFamily: 'var(--font-mono)', background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>
      {text}
    </span>
  );
};

export default function IssueExplorer() {
  const { filters, setFilter, resetFilters, theme } = useAppStore();
  const isLight = theme === 'light';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sprintScope, setSprintScope] = useState('10');
  const PER_PAGE = 14;

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-data', sprintScope],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${sprintScope}`);
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
          <div className="spinner" />
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Loading issue registry…</span>
        </div>
      </DashboardLayout>
    );
  }

  const { developers, epics, issues } = data;

  const filtered = issues.filter((i: any) => {
    if (filters.search && !i.title.toLowerCase().includes(filters.search.toLowerCase()) && !i.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.epic && i.epicId !== filters.epic) return false;
    if (filters.assigneeId && i.assigneeId !== filters.assigneeId) return false;
    if (filters.priority && i.priority.toLowerCase() !== filters.priority.toLowerCase()) return false;
    if (filters.type && i.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    if (filters.status && i.status.toLowerCase() !== filters.status.toLowerCase()) return false;
    return true;
  });

  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const selected = selectedId ? issues.find((i: any) => i.id === selectedId) : null;
  const selDev = selected ? developers.find((d: any) => d.id === selected.assigneeId) : null;
  const selEpic = selected ? epics.find((e: any) => e.id === selected.epicId) : null;

  const cols: { label: string; width: string }[] = [
    { label: 'Key', width: '90px' },
    { label: 'Title', width: '1fr' },
    { label: 'Type', width: '80px' },
    { label: 'Status', width: '120px' },
    { label: 'Priority', width: '100px' },
    { label: 'Points', width: '70px' },
    { label: 'Assignee', width: '160px' },
    { label: 'Epic', width: '160px' },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="hidden" animate="show"
        style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 56px)', overflow: 'hidden' }}
        className="page-enter"
      >
        {/* Header */}
        <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: isLight ? '#0f172a' : '#f1f5f9', letterSpacing: '-0.02em' }}>Issue Explorer</h1>
              <span className="stat-badge stat-badge-indigo">{total} tickets</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Browse, filter, and inspect all project issues with full AI risk context
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sprint</span>
            <select value={sprintScope} onChange={(e) => { setSprintScope(e.target.value); setPage(1); }} className="ctrl" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => <option key={n} value={n} style={{ background: '#0d1220' }}>Sprint {n}{n===10?' (Active)':''}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div variants={fadeUp}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '10px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}
        >
          {[
            { key: 'status', opts: ['To Do','In Progress','In Review','Done'], label: 'Status' },
            { key: 'priority', opts: ['Critical','High','Medium','Low'], label: 'Priority' },
            { key: 'type', opts: ['Story','Bug','Task','Blocker'], label: 'Type' },
          ].map(({ key, opts, label }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>{label}</label>
              <select value={(filters as any)[key]} onChange={(e) => { setFilter(key as any, e.target.value); setPage(1); }} className="ctrl" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                <option value="">All</option>
                {opts.map(o => <option key={o} value={o} style={{ background: '#0d1220' }}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Assignee</label>
            <select value={filters.assigneeId} onChange={(e) => { setFilter('assigneeId', e.target.value); setPage(1); }} className="ctrl" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <option value="">All</option>
              {developers.map((d: any) => <option key={d.id} value={d.id} style={{ background: '#0d1220' }}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Epic</label>
            <select value={filters.epic} onChange={(e) => { setFilter('epic', e.target.value); setPage(1); }} className="ctrl" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <option value="">All</option>
              {epics.map((e: any) => <option key={e.id} value={e.id} style={{ background: '#0d1220' }}>{e.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', justifyContent: 'flex-end' }}>
            <label style={{ visibility: 'hidden', fontSize: '9px' }}>x</label>
            <button onClick={() => { resetFilters(); setPage(1); }}
              style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.20)', color: '#fda4af', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Reset All
            </button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div variants={fadeUp}
          className="panel-static"
          style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 120px 100px 70px 160px 160px', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }}>
            {cols.map((c) => (
              <div key={c.label} style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', fontFamily: 'var(--font-mono)' }}>
                {c.label}
              </div>
            ))}
          </div>

          {/* Table Body */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {paged.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)', fontSize: '13px', gap: '8px' }}>
                <SearchCode style={{ width: '32px', height: '32px', opacity: 0.3 }} />
                No issues match your filters.
              </div>
            ) : (
              paged.map((issue: any, idx: number) => {
                const dev = developers.find((d: any) => d.id === issue.assigneeId);
                const epic = epics.find((e: any) => e.id === issue.epicId);
                return (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.025, type: 'spring', stiffness: 300, damping: 28 }}
                    onClick={() => setSelectedId(issue.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '90px 1fr 80px 120px 100px 70px 160px 160px',
                      padding: '15px 24px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                      alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s ease',
                    }}
                    whileHover={{ backgroundColor: 'rgba(99,102,241,0.04)' }}
                  >
                    {/* Key */}
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isLight ? '#3730a3' : '#a5b4fc' }}>{issue.id}</div>
                    {/* Title */}
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', paddingRight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {issue.title}
                      {issue.isBlocked && <span className="stat-badge stat-badge-rose" style={{ flexShrink: 0 }}>Blocked</span>}
                    </div>
                    {/* Type */}
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{issue.type}</div>
                    {/* Status */}
                    <div><Pill text={issue.status} map={statusMap} /></div>
                    {/* Priority */}
                    <div><Pill text={issue.priority} map={priorityMap} /></div>
                    {/* Points */}
                    <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isLight ? '#3730a3' : '#a5b4fc' }}>{issue.storyPoints}</div>
                    {/* Assignee */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', overflow: 'hidden' }}>
                      <img src={dev?.avatar} alt="" style={{ width: '22px', height: '22px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.10)', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dev?.name}</span>
                    </div>
                    {/* Epic */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: epic?.color || '#475569', flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{epic?.name}</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '6px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: page === 1 ? 0.3 : 1 }}>
                  <ChevronLeft style={{ width: '14px', height: '14px' }} />
                </button>
                {Array.from({ length: pages }, (_, i) => i + 1).filter(p => Math.abs(p - page) < 3 || p === 1 || p === pages).map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i-1] !== p - 1 && <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>…</span>}
                    <button onClick={() => setPage(p)}
                      style={{ padding: '6px 12px', borderRadius: '7px', fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, cursor: 'pointer', background: page === p ? '#6366f1' : 'rgba(255,255,255,0.04)', border: `1px solid ${page === p ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, color: page === p ? '#fff' : 'var(--text-muted)' }}>
                      {p}
                    </button>
                  </React.Fragment>
                ))}
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                  style={{ padding: '6px', borderRadius: '7px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', opacity: page === pages ? 0.3 : 1 }}>
                  <ChevronRight style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Issue Detail Drawer */}
        <AnimatePresence>
          {selected && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedId(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 40 }}
              />
              <motion.aside
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                style={{
                  position: 'fixed', top: 0, right: 0, width: '520px', height: '100vh',
                  background: 'rgba(8,12,20,0.97)', borderLeft: '1px solid rgba(99,102,241,0.20)',
                  backdropFilter: 'blur(28px)', zIndex: 50,
                  display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden',
                }}
              >
                {/* Drawer Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'rgba(99,102,241,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#a5b4fc' }}>{selected.id}</span>
                    <Pill text={selected.status} map={statusMap} />
                    <Pill text={selected.priority} map={priorityMap} />
                  </div>
                  <button onClick={() => setSelectedId(null)}
                    style={{ padding: '6px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Title */}
                  <div>
                    <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '8px', fontWeight: 700 }}>Issue Title</div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: isLight ? '#0f172a' : '#f1f5f9', lineHeight: 1.3, letterSpacing: '-0.01em' }}>{selected.title}</h2>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)' }} />

                  {/* Meta Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    {/* Assignee */}
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '10px', fontWeight: 700 }}>Assignee</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={selDev?.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }} />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isLight ? '#0f172a' : '#f1f5f9' }}>{selDev?.name}</div>
                          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{selDev?.role}</div>
                        </div>
                      </div>
                    </div>
                    {/* Points */}
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Story Points</div>
                      <div style={{ fontSize: '28px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: isLight ? '#3730a3' : '#a5b4fc', lineHeight: 1 }}>{selected.storyPoints}</div>
                      <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Complexity estimate</div>
                    </div>
                    {/* Epic */}
                    <div style={{ gridColumn: '1/-1', padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '8px', fontWeight: 700 }}>Epic</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: selEpic?.color }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{selEpic?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Blocker */}
                  {selected.isBlocked && (
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.20)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#fda4af', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <AlertOctagon style={{ width: '13px', height: '13px' }} /> Active Blocker
                      </div>
                      <p style={{ fontSize: '13px', color: '#fda4af', fontStyle: 'italic', lineHeight: 1.5 }}>"{selected.blockedReason}"</p>
                    </div>
                  )}

                  {/* AI Risk */}
                  {selected.status !== 'Done' && (
                    <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '12px', fontWeight: 700 }}>AI Risk Assessment</div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'var(--font-mono)', color: selected.riskScore > 60 ? '#f43f5e' : selected.riskScore > 35 ? '#f59e0b' : '#10b981', lineHeight: 1 }}>
                            {selected.riskScore}%
                          </div>
                          <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Risk Score</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Identified factors:</div>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {(selected.riskFactors?.length ? selected.riskFactors : ['High complexity estimate', 'Near sprint deadline']).map((f: string, i: number) => (
                              <li key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <span style={{ color: '#f59e0b', marginTop: '1px', flexShrink: 0 }}>›</span> {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[{ label: 'Created', val: selected.createdDate }, { label: 'Resolved', val: selected.resolvedDate || 'Open' }].map(({ label, val }) => (
                      <div key={label} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '6px', fontWeight: 700 }}>{label}</div>
                        <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-secondary)' }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Thread */}
                  <div>
                    <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: '12px', fontWeight: 700 }}>Discussion Thread</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {[
                        { initials: 'JS', name: 'Jack Scrum', role: 'Scrum Master', time: '2 days ago', text: `Investigating the blocker on ${selected.id}. Synchronization scheduled with platform team.` },
                        { avatar: selDev?.avatar, name: selDev?.name, role: selDev?.role, time: '1 day ago', text: `Draft implementation ready in feature branch. Will push PR within 24h of blocker resolution.` },
                      ].map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {c.avatar
                            ? <img src={c.avatar} alt="" style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.10)', flexShrink: 0 }} />
                            : <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#1a2235', border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#a5b4fc', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{c.initials}</div>
                          }
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: isLight ? '#0f172a' : '#f1f5f9' }}>{c.name}</span>
                              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{c.time}</span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
