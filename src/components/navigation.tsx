'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Layers, SearchCode, Users, BarChart3,
  FileText, Settings, Bot, Zap, Activity, GitBranch,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

const groups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, sub: 'Executive KPIs' },
    ],
  },
  {
    label: 'Sprint Workspace',
    items: [
      { name: 'Sprint Board',    href: '/sprints',    icon: Layers,        sub: 'Kanban & Velocity' },
      { name: 'Issue Explorer',  href: '/issues',     icon: SearchCode,    sub: '250 Tickets' },
      { name: 'Team Insights',   href: '/developers', icon: Users,         sub: 'Capacity & Load' },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'Analytics',  href: '/analytics', icon: BarChart3, sub: 'Lead & Cycle time' },
      { name: 'AI Reports', href: '/reports',   icon: FileText,  sub: 'Auto summaries', badge: 'AI' },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings, sub: 'Config & weights' },
    ],
  },
];

export default function Navigation() {
  const pathname = usePathname();
  const { toggleCopilot, isCopilotOpen, theme } = useAppStore();
  const isLight = theme === 'light';

  return (
    <aside className="mobile-sidebar" style={{
      width: '236px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(2, 6, 23, 0.95)',
      borderRight: isLight ? '1px solid rgba(203,213,225,0.80)' : '1px solid rgba(51,65,85,0.50)',
      backdropFilter: 'blur(20px)',
      zIndex: 20,
    }}>

      {/* ── Brand ── */}
      <div style={{
        padding: '18px 16px 14px',
        borderBottom: isLight ? '1px solid rgba(203,213,225,0.60)' : '1px solid rgba(51,65,85,0.40)',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {/* Logo mark */}
        <div style={{
          width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
          background: 'linear-gradient(135deg, #22C55E 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(34,197,94,0.30)',
        }}>
          <Activity style={{ width: '18px', height: '18px', color: '#fff' }} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: 'var(--font-ui)', fontSize: '14px', fontWeight: 800,
            color: isLight ? '#0f172a' : '#F8FAFC', letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            Sprint Intel
          </div>
          <div style={{
            fontFamily: 'var(--font-data)', fontSize: '10px', color: '#22C55E',
            letterSpacing: '0.08em', marginTop: '2px',
          }}>
            AG-UC-0010
          </div>
        </div>
        {/* Live dot */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 8px rgba(34,197,94,0.80)',
            animation: 'pulse-live 2s infinite',
          }} />
        </div>
      </div>

      {/* ── Nav Groups ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {groups.map((g) => (
          <div key={g.label}>
            {/* Group label */}
            <div style={{
              fontFamily: 'var(--font-data)', fontSize: '9px', fontWeight: 700,
              color: isLight ? 'rgba(71,85,105,0.90)' : 'rgba(71,85,105,0.70)', letterSpacing: '0.14em',
              textTransform: 'uppercase', padding: '0 4px 6px',
            }}>
              {g.label}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {g.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                    <div className={`nav-link ${active ? 'nav-link-active' : ''}`} style={{ cursor: 'pointer' }}>

                      {/* Framer active indicator */}
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          style={{
                            position: 'absolute', left: 0, top: '18%', bottom: '18%',
                            width: '3px', borderRadius: '0 3px 3px 0',
                            background: 'linear-gradient(180deg, #22C55E, #6366f1)',
                          }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Icon box */}
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: active ? 'rgba(99,102,241,0.15)' : isLight ? 'rgba(100,116,139,0.10)' : 'rgba(51,65,85,0.20)',
                        border: `1px solid ${active ? 'rgba(99,102,241,0.30)' : isLight ? 'rgba(203,213,225,0.60)' : 'rgba(51,65,85,0.30)'}`,
                        transition: 'all 200ms ease',
                      }}>
                        <item.icon style={{
                          width: '14px', height: '14px',
                          color: active ? '#A5B4FC' : '#475569',
                          transition: 'color 200ms ease',
                        }} />
                      </div>

                      {/* Label */}
                      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'var(--font-ui)', fontSize: '12.5px',
                          fontWeight: active ? 700 : 500, lineHeight: 1.25,
                          color: active ? (isLight ? '#1e293b' : '#F8FAFC') : '#64748b',
                          transition: 'color 200ms ease',
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-data)', fontSize: '9.5px',
                          color: active ? 'rgba(165,180,252,0.50)' : 'rgba(71,85,105,0.50)',
                          marginTop: '1px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.sub}
                        </div>
                      </div>

                      {/* Badge */}
                      {'badge' in item && item.badge && (
                        <span style={{
                          padding: '2px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 800,
                          background: 'linear-gradient(135deg, #22C55E, #6366f1)',
                          color: '#fff', fontFamily: 'var(--font-data)', letterSpacing: '0.06em',
                          flexShrink: 0,
                        }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── AI Copilot ── */}
      <div style={{ padding: '10px', borderTop: isLight ? '1px solid rgba(203,213,225,0.60)' : '1px solid rgba(51,65,85,0.40)' }}>
        <motion.button
          onClick={() => toggleCopilot(true)}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '11px 14px', borderRadius: '12px', cursor: 'pointer',
            background: isCopilotOpen
              ? 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(99,102,241,0.18))'
              : 'rgba(34,197,94,0.06)',
            border: `1px solid ${isCopilotOpen ? 'rgba(34,197,94,0.40)' : 'rgba(34,197,94,0.18)'}`,
            boxShadow: isCopilotOpen ? '0 0 20px rgba(34,197,94,0.15)' : 'none',
            transition: 'all 250ms ease',
          }}
        >
          <div style={{
            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(99,102,241,0.20))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot style={{ width: '15px', height: '15px', color: '#4ADE80' }} />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, color: '#4ADE80' }}>
              AI Copilot
            </div>
            <div style={{ fontFamily: 'var(--font-data)', fontSize: '9px', color: 'rgba(74,222,128,0.50)' }}>
              Analysis Engine · Live
            </div>
          </div>
          <Zap style={{ width: '12px', height: '12px', color: 'rgba(74,222,128,0.40)', flexShrink: 0 }} />
        </motion.button>
      </div>

      {/* ── User Profile ── */}
      <div style={{
        padding: '10px 10px 14px',
        display: 'flex', alignItems: 'center', gap: '10px',
        borderTop: isLight ? '1px solid rgba(203,213,225,0.40)' : '1px solid rgba(51,65,85,0.20)',
      }}>
        <img
          src="https://api.dicebear.com/8.x/avataaars/svg?seed=sakshi&backgroundColor=22C55E&backgroundType=gradientLinear"
          alt="Sakshi Pandey"
          style={{
            width: '34px', height: '34px', borderRadius: '9px',
            border: '1px solid rgba(34,197,94,0.20)',
            background: '#0F172A', flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 700, color: isLight ? '#0f172a' : '#F8FAFC', lineHeight: 1.25 }}>
            Sakshi Pandey
          </div>
          <div style={{ fontFamily: 'var(--font-data)', fontSize: '10px', color: '#475569' }}>
            Engineering Manager
          </div>
        </div>
        <GitBranch style={{ width: '13px', height: '13px', color: '#475569', flexShrink: 0 }} />
      </div>

      {/* ── Log Off ── */}
      <div style={{ padding: '0 10px 14px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
            background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444', fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 200ms ease',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log Off
          </button>
        </Link>
      </div>

      <style>{`
        @keyframes pulse-live {
          0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.80); opacity: 1; }
          50% { box-shadow: none; opacity: 0.4; }
        }
      `}</style>
    </aside>
  );
}
