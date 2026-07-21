'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, AlertTriangle, Play, CheckCircle, RotateCcw, ShieldAlert, User, MoreHorizontal, Layout, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAppStore } from '@/lib/store';

const THEME_TOKENS = {
  dark: {
    bg: '#0f172a',
    card: 'rgba(30,41,59,0.5)',
    cardHover: 'rgba(30,41,59,0.8)',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    border: 'rgba(51,65,85,0.5)',
    borderGlow: 'rgba(99,102,241,0.5)',
    colBg: 'rgba(15,23,42,0.4)',
    dropTarget: 'rgba(99,102,241,0.1)',
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    cardHover: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    borderGlow: 'rgba(99,102,241,0.5)',
    colBg: '#f1f5f9',
    dropTarget: 'rgba(99,102,241,0.05)',
  }
};

const COLUMNS = [
  { id: 'To Do', label: 'To Do', color: '#94a3b8' },
  { id: 'In Progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'In Review', label: 'In Review', color: '#f59e0b' },
  { id: 'Done', label: 'Done', color: '#10b981' }
];

export default function SprintBoardPage() {
  const { activeSprintId, theme } = useAppStore();
  const queryClient = useQueryClient();
  const isDark = theme === 'dark';
  const T = isDark ? THEME_TOKENS.dark : THEME_TOKENS.light;

  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

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
    mutationFn: async ({ id, status, isBlocked }: { id: string, status?: string, isBlocked?: boolean }) => {
      const body: any = { id };
      if (status) body.status = status;
      if (isBlocked !== undefined) body.isBlocked = isBlocked;
      const res = await fetch('/api/issues', {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', activeSprintId] });
    }
  });

  if (isLoading || !data) {
    return <div style={{ padding: '24px', color: T.text }}>Loading sprint board...</div>;
  }

  const { sprints, issues, developers, epics, velocityHistory } = data;
  const currentSprint = sprints.find((s: any) => s.id === activeSprintId) || sprints[0];
  
  const filteredIssues = issues.filter((issue: any) => {
    if (search && !issue.title.toLowerCase().includes(search.toLowerCase()) && !issue.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (epicFilter && issue.epicId !== epicFilter) return false;
    if (assigneeFilter && issue.assigneeId !== assigneeFilter) return false;
    if (priorityFilter && issue.priority !== priorityFilter) return false;
    return true;
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedIssueId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to allow the drag image to be captured before we might style it differently
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIssueId(null);
    setDragOverCol(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    if (dragOverCol === colId) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedIssueId) {
      const issue = issues.find((i: any) => i.id === draggedIssueId);
      if (issue && issue.status !== colId) {
        patchMutation.mutate({ id: draggedIssueId, status: colId });
      }
    }
    setDraggedIssueId(null);
  };

  // Stats
  const totalIssues = issues.length;
  const blockersCount = issues.filter((i: any) => i.isBlocked).length;
  
  // Epic Donut Data
  const epicData = epics.map((epic: any) => {
    const epicIssues = issues.filter((i: any) => i.epicId === epic.id);
    const sp = epicIssues.reduce((acc: number, i: any) => acc + (i.storyPoints || 0), 0);
    return { name: epic.id, value: sp, color: epic.color };
  }).filter((e: any) => e.value > 0);

  // Workload Data
  const workloadData = developers.map((dev: any) => {
    const devIssues = issues.filter((i: any) => i.assigneeId === dev.id);
    const sp = devIssues.reduce((acc: number, i: any) => acc + (i.storyPoints || 0), 0);
    return { name: dev.name, sp };
  }).filter((d: any) => d.sp > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* RICH HEADER */}
      <div style={{ padding: '24px 32px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, background: isDark ? 'transparent' : '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{currentSprint.name}</h1>
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', background: currentSprint.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)', color: currentSprint.status === 'Active' ? '#22c55e' : T.textMuted, fontWeight: 600 }}>
                {currentSprint.status}
              </span>
            </div>
            
            {/* SP Progress Bar */}
            <div style={{ width: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: T.textMuted, marginBottom: '6px' }}>
                <span>{currentSprint.completedPoints} / {currentSprint.targetPoints} SP Completed</span>
                <span>{Math.round(currentSprint.completionRate * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: T.border, borderRadius: '3px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(currentSprint.completionRate * 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '3px' }}
                />
              </div>
            </div>
          </div>

          {/* Stat Chips */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'Total Issues', value: totalIssues, icon: <Layout size={16}/>, color: '#3b82f6' },
              { label: 'Completed SP', value: currentSprint.completedPoints, icon: <CheckCircle size={16}/>, color: '#10b981' },
              { label: 'Blockers', value: blockersCount, icon: <ShieldAlert size={16}/>, color: '#ef4444' },
              { label: 'Team Size', value: developers.length, icon: <User size={16}/>, color: '#8b5cf6' },
            ].map((stat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: T.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.textMuted }} />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search issues..." 
              style={{ width: '100%', padding: '8px 12px 8px 34px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none' }}
            />
          </div>
          
          <select value={epicFilter} onChange={e => setEpicFilter(e.target.value)} style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none', appearance: 'none', minWidth: '140px' }}>
            <option value="">All Epics</option>
            {epics.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none', appearance: 'none', minWidth: '140px' }}>
            <option value="">All Assignees</option>
            {developers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ padding: '8px 12px', background: T.card, border: `1px solid ${T.border}`, borderRadius: '8px', color: T.text, fontSize: '13px', outline: 'none', appearance: 'none', minWidth: '140px' }}>
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(search || epicFilter || assigneeFilter || priorityFilter) && (
            <button 
              onClick={() => { setSearch(''); setEpicFilter(''); setAssigneeFilter(''); setPriorityFilter(''); }}
              style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: T.textMuted, fontSize: '13px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 240px', gap: '20px', padding: '24px 32px', flex: 1, overflow: 'hidden' }}>
        
        {/* KANBAN COLUMNS */}
        {COLUMNS.map(col => {
          const colIssues = filteredIssues.filter((i: any) => i.status === col.id);
          const isDragOver = dragOverCol === col.id;
          
          return (
            <div 
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{ 
                display: 'flex', flexDirection: 'column', 
                background: T.colBg, 
                borderRadius: '12px', 
                borderTop: `4px solid ${col.color}`,
                border: isDragOver ? `1px solid ${T.borderGlow}` : `1px solid ${T.border}`,
                borderTopWidth: '4px',
                borderTopColor: col.color,
                boxShadow: isDragOver ? `0 0 20px ${T.borderGlow}` : 'none',
                transition: 'all 0.2s ease',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{col.label}</span>
                <span style={{ fontSize: '12px', background: T.card, padding: '2px 8px', borderRadius: '12px', color: T.textMuted }}>{colIssues.length}</span>
              </div>
              
              <div style={{ padding: '12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {colIssues.map((issue: any) => {
                  const epic = epics.find((e: any) => e.id === issue.epicId);
                  const dev = developers.find((d: any) => d.id === issue.assigneeId);
                  
                  return (
                    <motion.div
                      layoutId={issue.id}
                      key={issue.id}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, issue.id)}
                      onDragEnd={handleDragEnd}
                      whileHover={{ y: -2, scale: 1.01 }}
                      style={{
                        background: T.card,
                        border: `1px solid ${issue.isBlocked ? '#ef4444' : T.border}`,
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: 'grab',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      {/* Epic Color Bar */}
                      {epic && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: epic.color }} />}
                      
                      {issue.isBlocked && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '10px', padding: '4px 8px', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <AlertTriangle size={12} /> BLOCKED: {issue.blockedReason}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: T.textMuted, fontFamily: 'monospace' }}>{issue.id}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: issue.priority === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)', color: issue.priority === 'High' ? '#ef4444' : T.textMuted }}>{issue.priority}</span>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{issue.type}</span>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', lineHeight: 1.4 }}>{issue.title}</div>
                      
                      {/* Risk Score */}
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: T.textMuted }}>Risk</span>
                        <div style={{ flex: 1, height: '4px', background: T.border, borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${issue.riskScore}%`, background: issue.riskScore > 70 ? '#ef4444' : issue.riskScore > 40 ? '#f59e0b' : '#22c55e' }} />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Assignee Avatar */}
                        {dev ? (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }} title={dev.name}>
                            {dev.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: T.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={12} color={T.textMuted} />
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Story Points */}
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: T.border, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: T.textMuted }} title="Story Points">
                            {issue.storyPoints}
                          </div>
                          
                          {/* Actions */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {issue.status === 'To Do' && <button onClick={() => patchMutation.mutate({ id: issue.id, status: 'In Progress' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted }} title="Start"><Play size={14} /></button>}
                            {issue.status === 'In Progress' && <button onClick={() => patchMutation.mutate({ id: issue.id, status: 'In Review' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted }} title="Review"><Layout size={14} /></button>}
                            {issue.status === 'In Review' && <button onClick={() => patchMutation.mutate({ id: issue.id, status: 'Done' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#10b981' }} title="Approve"><CheckCircle size={14} /></button>}
                            {issue.status === 'Done' && <button onClick={() => patchMutation.mutate({ id: issue.id, status: 'To Do' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.textMuted }} title="Reopen"><RotateCcw size={14} /></button>}
                            
                            <button onClick={() => patchMutation.mutate({ id: issue.id, isBlocked: !issue.isBlocked })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: issue.isBlocked ? '#ef4444' : T.textMuted }} title={issue.isBlocked ? "Unblock" : "Block"}>
                              <ShieldAlert size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* STICKY SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }}>
          
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={16} /> Epic Distribution (SP)
            </div>
            <div style={{ height: '140px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={epicData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                    {epicData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: T.text }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Team Workload
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {workloadData.map((w: any) => (
                <div key={w.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>{w.name}</span>
                    <span style={{ fontWeight: 600 }}>{w.sp} SP</span>
                  </div>
                  <div style={{ height: '6px', background: T.border, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(w.sp / 20 * 100, 100)}%`, background: w.sp > 15 ? '#ef4444' : '#6366f1' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> Sprint Velocity
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
              {currentSprint.velocity}
            </div>
            <div style={{ fontSize: '11px', color: T.textMuted }}>Avg SP / Sprint</div>
          </div>

        </div>
      </div>
    </div>
  );
}
