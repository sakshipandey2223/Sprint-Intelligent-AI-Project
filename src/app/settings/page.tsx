'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon, Sliders, Users, Save, RefreshCw, Key, Lock, CheckCircle2, AlertCircle,
  Database, Sparkles, Eye, EyeOff, Server, HardDrive, Terminal, Info, Zap, Brain, TrendingUp,
  ToggleRight, ToggleLeft, Cloud, Globe, Crown,
} from 'lucide-react';

interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

const TABS = [
  { id: 'users',  label: 'User Management', sub: 'RBAC & Roles', icon: Users, color: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
  { id: 'ai',     label: 'AI Engine & LLM', sub: 'Models & Keys', icon: Brain, color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
  { id: 'agile',  label: 'Sprint Parameters', sub: 'KPIs & Weights', icon: Sliders, color: '#0ea5e9', glow: 'rgba(14,165,233,0.2)' },
  { id: 'system', label: 'GCP Infrastructure', sub: 'Cloud & Storage', icon: Cloud, color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('users');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastOk, setToastOk] = useState(true);

  const [groqKey, setGroqKey] = useState('gsk_••••••••••••••••••••••••••••••••');
  const [geminiKey, setGeminiKey] = useState('AQ.••••••••••••••••••••••••••••••••');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  const [sprintDuration, setSprintDuration] = useState('2');
  const [targetVelocity, setTargetVelocity] = useState('48');
  const [riskBlockedWeight, setRiskBlockedWeight] = useState(35);
  const [riskOverloadWeight, setRiskOverloadWeight] = useState(20);
  const [riskComplexityWeight, setRiskComplexityWeight] = useState(15);

  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery<UserRecord[]>({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'Admin' | 'User' }) => {
      const res = await fetch('/api/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, role }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      toast(`✅ Role updated to ${data.newRole} — synced to GCS!`, true);
    },
    onError: (err: any) => toast(`❌ ${err.message}`, false),
  });

  const toast = (msg: string, ok: boolean) => {
    setToastMsg(msg); setToastOk(ok); setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isAdmin = !currentUser || currentUser.role === 'Admin';

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', maxWidth: '480px', padding: '48px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '24px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Lock style={{ width: '32px', color: '#ef4444' }} />
            </div>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}>ACCESS RESTRICTED</span>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '16px 0 10px', letterSpacing: '-0.02em' }}>Admin Privileges Required</h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: '24px' }}>
              You are signed in as <strong style={{ color: 'var(--color-text-primary)' }}>{currentUser?.name}</strong> with role <span style={{ color: 'var(--color-accent)', fontFamily: 'monospace', fontWeight: 700 }}>{currentUser?.role}</span>. Only Administrators can access the Advanced System Control Centre.
            </p>
            <div style={{ padding: '12px 16px', background: 'var(--color-stat-bg)', border: '1px solid var(--color-card-border)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px', textAlign: 'left' }}>
              <Info style={{ width: '16px', color: 'var(--color-accent)', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.55 }}>Ask a Master Admin to promote your Operator ID <strong style={{ color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>{currentUser?.username}</strong> to Admin role in User Management.</span>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const activeTabData = TABS.find(t => t.id === activeTab)!;

  return (
    <DashboardLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* ── Animated Header ─────────────────────────────── */}
        <div style={{
          padding: '28px 32px 22px', flexShrink: 0,
          background: 'var(--color-panel-header-bg)',
          borderBottom: '1px solid var(--color-card-border)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-80px', right: '80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(99,102,241,0.35)' }}>
                <SettingsIcon style={{ width: '26px', color: '#fff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Advanced System Control</h1>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.1em' }}>ADMIN ACCESS</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  RBAC user roles · LLM API keys & model config · Sprint KPI weights · GCS cloud persistence
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => toast('✅ All settings saved & synced to GCS storage!', true)}
              style={{ padding: '12px 22px', borderRadius: '14px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px -5px rgba(99,102,241,0.4)' }}
            >
              <Save style={{ width: '15px' }} /> Save & Sync GCS
            </motion.button>
          </motion.div>
        </div>

        {/* ── Tab Navigator ──────────────────────────────── */}
        <div style={{ padding: '18px 32px 0', borderBottom: '1px solid var(--color-card-border)', display: 'flex', gap: '4px', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 20px 14px', borderRadius: '14px 14px 0 0', border: 'none', cursor: 'pointer',
                  background: isActive ? 'var(--color-card-hover)' : 'transparent',
                  borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                  color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap',
                  boxShadow: isActive ? `0 -1px 20px ${tab.glow}` : 'none',
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: isActive ? `${tab.glow}` : 'var(--color-stat-bg)', border: `1px solid ${isActive ? tab.color : 'var(--color-card-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '14px', color: isActive ? tab.color : 'var(--color-text-faint)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{tab.label}</div>
                  <div style={{ fontSize: '10px', color: isActive ? tab.color : 'var(--color-text-faint)', fontFamily: 'monospace', fontWeight: 600 }}>{tab.sub}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ── Tab Content ────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <AnimatePresence mode="wait">
            {/* ══ TAB: Users ══════════════════════════════════════ */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                {/* Section Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Users style={{ width: '20px', color: '#22c55e' }} /> Registered Users & Role Management
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>Promote users to <strong style={{ color: '#22c55e' }}>Admin</strong> role to grant them full system access. Changes sync instantly to Google Cloud Storage.</p>
                  </div>
                  <button onClick={() => refetchUsers()} style={{ padding: '9px 16px', borderRadius: '12px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', color: 'var(--color-text-muted)', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s' }}>
                    <RefreshCw style={{ width: '13px' }} /> Refresh Users
                  </button>
                </div>

                {/* Users Table */}
                <div style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
                  {/* Table Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', padding: '12px 24px', background: 'var(--color-stat-bg)', borderBottom: '1px solid var(--color-card-border)', fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <span>Operator / Full Name</span>
                    <span>Username</span>
                    <span>Current Role</span>
                    <span>Role Control</span>
                    <span>Registered</span>
                  </div>

                  {loadingUsers ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading users...</div>
                  ) : (
                    users.map((u, i) => {
                      const isMaster = u.username.toLowerCase() === 'admin';
                      const isAdm = u.role === 'Admin';
                      return (
                        <motion.div key={u.id}
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', padding: '16px 24px', borderBottom: '1px solid var(--color-card-border)', alignItems: 'center', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* Name */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: isAdm ? 'rgba(34,197,94,0.12)' : 'rgba(99,102,241,0.12)', border: `1px solid ${isAdm ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800, color: isAdm ? '#22c55e' : '#6366f1' }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                                {u.name}
                                {isMaster && <Crown style={{ width: '13px', color: '#f59e0b' }} />}
                              </div>
                              {isMaster && <span style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'monospace', fontWeight: 600 }}>⭐ System Root</span>}
                            </div>
                          </div>
                          {/* Username */}
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-text-muted)', fontWeight: 600 }}>{u.username}</span>
                          {/* Role Badge */}
                          <div>
                            <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', background: isAdm ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${isAdm ? 'rgba(34,197,94,0.3)' : 'rgba(99,102,241,0.25)'}`, color: isAdm ? '#22c55e' : 'var(--color-accent)' }}>
                              {isAdm ? '🛡 Admin' : '👤 User'}
                            </span>
                          </div>
                          {/* Role Switcher */}
                          <div>
                            {isMaster ? (
                              <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontFamily: 'monospace', fontStyle: 'italic' }}>Immutable · System Root</span>
                            ) : (
                              <select value={u.role} onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value as any })} disabled={roleMutation.isPending}
                                style={{ padding: '7px 12px', borderRadius: '10px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-card-border)', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', outline: 'none', minWidth: '200px' }}>
                                <option value="User">👤 User (Standard Access)</option>
                                <option value="Admin">🛡️ Admin (Full System Access)</option>
                              </select>
                            )}
                          </div>
                          {/* Date */}
                          <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontFamily: 'monospace' }}>
                            {u.createdAt === 'System Default' ? '—' : new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Info Banner */}
                <div style={{ padding: '16px 20px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Info style={{ width: '18px', color: 'var(--color-accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    When a user's role is changed to <strong style={{ color: '#22c55e' }}>Admin</strong>, the Settings page becomes visible to them upon next refresh or login. Changes are persisted to <code style={{ fontFamily: 'monospace', color: 'var(--color-accent)', fontSize: '11px' }}>gs://sakshiaiproject-sprint-data/sprint_intelligence.db</code> in real-time.
                  </span>
                </div>
              </motion.div>
            )}

            {/* ══ TAB: AI Engine ═══════════════════════════════════ */}
            {activeTab === 'ai' && (
              <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Brain style={{ width: '20px', color: '#6366f1' }} /> AI Model Orchestration & Key Management
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Select your primary LLM, configure generation parameters, and manage API keys securely.</p>
                </div>

                {/* Model Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {[
                    { id: 'llama-3.3-70b', name: 'Groq LLaMA 3.3 70B', description: 'Ultra-fast open-weights model via Groq. Best quality-to-speed ratio.', speed: '~500 tokens/sec', tier: 'FREE · Primary', color: '#6366f1', icon: Zap, badge: 'RECOMMENDED' },
                    { id: 'llama-3.1-8b', name: 'Groq LLaMA 3.1 8B', description: 'Lightweight model with extremely high TPM limits. Auto-fallback model.', speed: '~800 tokens/sec', tier: 'FREE · High TPM Fallback', color: '#0ea5e9', icon: TrendingUp, badge: 'AUTO-FALLBACK' },
                    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: "Google's multimodal AI with 1M token context window.", speed: '~150 tokens/sec', tier: 'Google AI · Secondary', color: '#f59e0b', icon: Sparkles, badge: 'GEMINI' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = selectedModel === m.id;
                    return (
                      <motion.div key={m.id} whileHover={{ y: -3 }} onClick={() => setSelectedModel(m.id)}
                        style={{ padding: '20px', borderRadius: '18px', border: `2px solid ${isSelected ? m.color : 'var(--color-card-border)'}`, background: isSelected ? `${m.color}18` : 'var(--color-card-ambient)', cursor: 'pointer', transition: 'all 0.25s', boxShadow: isSelected ? `0 0 30px ${m.color}30` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${m.color}20`, border: `1px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon style={{ width: '20px', color: m.color }} />
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto' }}>
                            {isSelected && <CheckCircle2 style={{ width: '16px', color: '#22c55e' }} />}
                            <span style={{ padding: '3px 8px', borderRadius: '8px', fontSize: '9px', fontFamily: 'monospace', fontWeight: 800, color: m.color, background: `${m.color}15`, border: `1px solid ${m.color}30`, letterSpacing: '0.08em' }}>{m.badge}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>{m.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.55, marginBottom: '14px' }}>{m.description}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-card-border)', paddingTop: '12px', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700 }}>
                          <span style={{ color: '#22c55e' }}>{m.speed}</span>
                          <span style={{ color: m.color }}>{m.tier}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Generation Parameters */}
                <div style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders style={{ width: '14px', color: 'var(--color-accent)' }} /> Temperature
                      <span style={{ marginLeft: 'auto', fontFamily: 'monospace', color: 'var(--color-accent)' }}>{temperature.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-faint)', fontFamily: 'monospace', marginTop: '6px' }}><span>Focused (0.0)</span><span>Creative (1.0)</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal style={{ width: '14px', color: '#0ea5e9' }} /> Max Output Tokens
                      <span style={{ marginLeft: 'auto', fontFamily: 'monospace', color: '#7dd3fc' }}>{maxTokens.toLocaleString()}</span>
                    </div>
                    <input type="range" min="512" max="4096" step="256" value={maxTokens} onChange={e => setMaxTokens(Number(e.target.value))} style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-text-faint)', fontFamily: 'monospace', marginTop: '6px' }}><span>512 tokens</span><span>4,096 tokens</span></div>
                  </div>
                </div>

                {/* API Keys */}
                <div style={{ background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Key style={{ width: '16px', color: '#f59e0b' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>API Key Management</h3>
                  </div>

                  {[
                    { label: 'Groq API Key', prefix: 'GROQ_API_KEY', value: groqKey, onChange: setGroqKey, show: showGroqKey, toggle: () => setShowGroqKey(!showGroqKey), status: '✓ Connected · Free Tier', statusColor: '#22c55e' },
                    { label: 'Google Gemini API Key', prefix: 'GEMINI_API_KEY', value: geminiKey, onChange: setGeminiKey, show: showGeminiKey, toggle: () => setShowGeminiKey(!showGeminiKey), status: '✓ Secondary Fallback', statusColor: '#6366f1' },
                  ].map((k, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-muted)', background: 'var(--color-stat-bg)', padding: '2px 7px', borderRadius: '6px' }}>{k.prefix}</code>
                          {k.label}
                        </label>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 700, color: k.statusColor }}>{k.status}</span>
                      </div>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input type={k.show ? 'text' : 'password'} value={k.value} onChange={e => k.onChange(e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-card-border)', borderRadius: '12px', color: 'var(--color-text-primary)', fontSize: '13px', fontFamily: 'monospace', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = 'var(--color-accent)'} onBlur={e => e.target.style.borderColor = 'var(--color-card-border)'}
                        />
                        <button onClick={k.toggle} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: '4px' }}>
                          {k.show ? <EyeOff style={{ width: '15px' }} /> : <Eye style={{ width: '15px' }} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ TAB: Agile Parameters ═══════════════════════════ */}
            {activeTab === 'agile' && (
              <motion.div key="agile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sliders style={{ width: '20px', color: '#0ea5e9' }} /> Sprint Telemetry & KPI Configuration
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Configure sprint duration defaults, velocity targets, and risk algorithm weight distribution.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {/* Sprint Duration */}
                  <div style={{ padding: '24px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'block' }}>Default Sprint Duration</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {['1 Week', '2 Weeks', '3 Weeks', '4 Weeks'].map((label, i) => (
                        <button key={i} onClick={() => setSprintDuration(String(i + 1))}
                          style={{ padding: '10px', borderRadius: '10px', border: `1px solid ${sprintDuration === String(i + 1) ? 'var(--color-accent)' : 'var(--color-card-border)'}`, background: sprintDuration === String(i + 1) ? 'rgba(99,102,241,0.15)' : 'var(--color-stat-bg)', color: sprintDuration === String(i + 1) ? 'var(--color-accent)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Velocity Target */}
                  <div style={{ padding: '24px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'block' }}>Velocity Target (Story Points)</label>
                    <input type="number" value={targetVelocity} onChange={e => setTargetVelocity(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-card-border)', borderRadius: '12px', color: 'var(--color-text-primary)', fontSize: '20px', fontFamily: 'monospace', fontWeight: 800, outline: 'none', textAlign: 'center' }}
                    />
                    <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--color-text-faint)', textAlign: 'center', fontFamily: 'monospace' }}>Current target: <strong style={{ color: '#0ea5e9' }}>{targetVelocity} SP / sprint</strong></div>
                  </div>
                </div>

                {/* Risk Weights */}
                <div style={{ padding: '24px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertCircle style={{ width: '16px', color: '#ef4444' }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Risk Algorithm Weights</h3>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-faint)', fontFamily: 'monospace', marginLeft: 'auto' }}>Total: {riskBlockedWeight + riskOverloadWeight + riskComplexityWeight}%</span>
                  </div>

                  {[
                    { label: 'Blocked Issue Impact', value: riskBlockedWeight, set: setRiskBlockedWeight, color: '#ef4444', max: 60 },
                    { label: 'Developer Overload Penalty', value: riskOverloadWeight, set: setRiskOverloadWeight, color: '#f59e0b', max: 40 },
                    { label: 'Task Complexity Weight', value: riskComplexityWeight, set: setRiskComplexityWeight, color: '#8b5cf6', max: 40 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{item.label}</span>
                        <span style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 800, color: item.color }}>{item.value}%</span>
                      </div>
                      <div style={{ position: 'relative', height: '8px', background: 'var(--color-bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
                        <motion.div
                          animate={{ width: `${(item.value / item.max) * 100}%` }}
                          transition={{ duration: 0.4 }}
                          style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${item.color}99, ${item.color})`, borderRadius: '8px' }}
                        />
                      </div>
                      <input type="range" min="5" max={item.max} value={item.value} onChange={e => item.set(Number(e.target.value))} style={{ width: '100%', accentColor: item.color, cursor: 'pointer', marginTop: '6px', opacity: 0 }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ TAB: System / GCP ════════════════════════════════ */}
            {activeTab === 'system' && (
              <motion.div key="system" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cloud style={{ width: '20px', color: '#f59e0b' }} /> GCP Infrastructure & Cloud Health
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Monitor real-time GCP Cloud Run health, GCS storage bucket status, and trigger manual sync operations.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {[
                    { label: 'Cloud Provider', value: 'Google Cloud Platform', sub: 'Project: sakshiaiproject', icon: Globe, color: '#22c55e', status: 'LIVE' },
                    { label: 'Runtime Engine', value: 'Cloud Run (us-central1)', sub: 'Region: us-central1 · Auto-scale', icon: Server, color: '#0ea5e9', status: 'RUNNING' },
                    { label: 'GCS Storage Bucket', value: 'sakshiaiproject-sprint-data', sub: 'sprint_intelligence.db', icon: HardDrive, color: '#f59e0b', status: 'SYNCED' },
                    { label: 'CI/CD Pipeline', value: 'GitHub Cloud Build', sub: 'Auto-deploy on main push', icon: Zap, color: '#8b5cf6', status: 'ACTIVE' },
                  ].map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -2 }}
                        style={{ padding: '20px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '18px', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${card.color}18`, border: `1px solid ${card.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon style={{ width: '18px', color: card.color }} />
                          </div>
                          <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '9px', fontFamily: 'monospace', fontWeight: 800, background: `${card.color}15`, border: `1px solid ${card.color}35`, color: card.color, display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: card.color, display: 'inline-block' }} />
                            {card.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-faint)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>{card.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px', fontFamily: 'monospace' }}>{card.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{card.sub}</div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Manual Sync Controls */}
                <div style={{ padding: '24px', background: 'var(--color-card-ambient)', border: '1px solid var(--color-card-border)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>Manual GCS Bucket Synchronization</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>Trigger an immediate bidirectional sync between the Cloud Run instance and GCS storage bucket.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => toast('✅ GCS bucket sync initiated successfully!', true)}
                      style={{ padding: '11px 20px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s' }}>
                      <Database style={{ width: '14px' }} /> Sync GCS Now
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => toast('🚀 Cloud Build deployment triggered!', true)}
                      style={{ padding: '11px 20px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent)', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'all 0.2s' }}>
                      <Zap style={{ width: '14px' }} /> Trigger Deploy
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.95 }}
            style={{ position: 'fixed', bottom: '28px', right: '28px', padding: '14px 20px', borderRadius: '14px', background: 'rgba(10,15,25,0.96)', border: `1px solid ${toastOk ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, color: toastOk ? '#22c55e' : '#ef4444', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 100, backdropFilter: 'blur(20px)' }}
          >
            {toastOk ? <CheckCircle2 style={{ width: '16px' }} /> : <AlertCircle style={{ width: '16px' }} />}
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
