'use client';

import React from 'react';
import Navigation from './navigation';
import CopilotDrawer from './copilot-drawer';
import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { Search, Bell, ChevronDown, Database, Cpu, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { activeSprintId, setActiveSprintId, filters, setFilter } = useAppStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-data', activeSprintId],
    queryFn: async () => {
      const res = await fetch(`/api/data?sprintId=${activeSprintId}`);
      if (!res.ok) throw new Error('API failure');
      return res.json();
    },
  });

  return (
    <div style={{
      display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden',
      background: 'var(--color-background)',
      color: 'var(--color-foreground)',
      fontFamily: 'var(--font-ui)',
      position: 'relative',
    }}>
      {/* Ambient green orb */}
      <div className="orb-green" />

      <Navigation />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 10 }}>

        {/* ── TOP HEADER BAR ────────────────────────── */}
        <header style={{
          height: '54px', flexShrink: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 24px',
          background: 'rgba(2, 6, 23, 0.90)',
          borderBottom: '1px solid rgba(51,65,85,0.50)',
          backdropFilter: 'blur(20px)', position: 'relative', zIndex: 15,
        }}>

          {/* Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search style={{
              position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)',
              width: '13px', height: '13px', color: '#334155', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search issues, sprints, developers…"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.50)'; e.target.style.background = 'rgba(99,102,241,0.05)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'rgba(51,65,85,0.50)';  e.target.style.background = 'rgba(30,41,59,0.40)'; }}
              style={{
                width: '100%', fontFamily: 'var(--font-ui)', fontSize: '12px',
                background: 'rgba(30,41,59,0.40)', border: '1px solid rgba(51,65,85,0.50)',
                borderRadius: '9px', paddingLeft: '34px', paddingRight: '12px',
                paddingTop: '7px', paddingBottom: '7px',
                color: '#94A3B8', outline: 'none', transition: 'all 200ms ease',
              }}
            />
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Sprint selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: '#334155', letterSpacing: '0.10em', textTransform: 'uppercase', fontWeight: 700 }}>
                Sprint
              </span>
              <div style={{ position: 'relative' }}>
                <select
                  value={activeSprintId}
                  onChange={(e) => setActiveSprintId(Number(e.target.value))}
                  className="ctrl"
                  style={{ paddingRight: '28px', appearance: 'none' }}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n} style={{ background: '#0F172A', color: '#F8FAFC' }}>
                      Sprint {n}{n === 10 ? ' ★' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown style={{
                  position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                  width: '11px', height: '11px', color: '#475569', pointerEvents: 'none',
                }} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '22px', background: 'rgba(51,65,85,0.50)' }} />

            {/* Status pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '7px',
                background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)',
              }}>
                <Database style={{ width: '11px', height: '11px', color: '#4ADE80' }} />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', fontWeight: 700, color: '#4ADE80' }}>DB Live</span>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.80)' }} />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '7px',
                background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)',
              }}>
                <Cpu style={{ width: '11px', height: '11px', color: '#A5B4FC' }} />
                <span style={{ fontFamily: 'var(--font-data)', fontSize: '10px', fontWeight: 700, color: '#A5B4FC' }}>AI Ready</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '22px', background: 'rgba(51,65,85,0.50)' }} />

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              style={{
                width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
                background: 'rgba(30,41,59,0.50)', border: '1px solid rgba(51,65,85,0.50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#475569', transition: 'all 200ms ease',
              }}
              data-tip="Refresh data"
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
            </button>

            {/* Bell */}
            <button style={{
              width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer',
              background: 'rgba(30,41,59,0.50)', border: '1px solid rgba(51,65,85,0.50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#475569', transition: 'all 200ms ease',
              position: 'relative',
            }}>
              <Bell style={{ width: '13px', height: '13px' }} />
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#22C55E',
                border: '1.5px solid var(--color-background)',
                boxShadow: '0 0 6px rgba(34,197,94,0.80)',
              }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      <CopilotDrawer />
    </div>
  );
}
