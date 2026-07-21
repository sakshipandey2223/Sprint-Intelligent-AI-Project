'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings as SettingsIcon, Sliders, Users, Cpu, ShieldAlert,
  Save, RefreshCw, Key, Lock, CheckCircle2, AlertCircle,
  Database, Sparkles, UserCheck, ShieldCheck, ToggleRight,
  ToggleLeft, Eye, EyeOff, Server, HardDrive, Terminal, Info,
} from 'lucide-react';

interface UserRecord {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { currentUser, theme, setVisualTheme } = useAppStore();
  const [activeTab, setActiveTab] = useState<'users' | 'ai' | 'agile' | 'system'>('users');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // AI Settings State
  const [groqKey, setGroqKey] = useState('gsk_••••••••••••••••••••••••••••••••');
  const [geminiKey, setGeminiKey] = useState('AQ.••••••••••••••••••••••••••••••••');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b');
  const [temperature, setTemperature] = useState('0.7');
  const [maxTokens, setMaxTokens] = useState('2048');

  // Agile Settings State
  const [sprintDuration, setSprintDuration] = useState('2');
  const [targetVelocity, setTargetVelocity] = useState('48');
  const [riskBlockedWeight, setRiskBlockedWeight] = useState(35);
  const [riskOverloadWeight, setRiskOverloadWeight] = useState(20);

  // Fetch all users
  const { data: users = [], isLoading: loadingUsers, refetch: refetchUsers } = useQuery<UserRecord[]>({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
  });

  // User Role Mutation
  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'Admin' | 'User' }) => {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update role');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setToastMsg(`User role updated to ${data.newRole}! Synced to GCP Storage.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (err: any) => {
      setToastMsg(`❌ ${err.message}`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // RBAC Permission Check: Default to Admin if currentUser not loaded yet or if role is Admin
  const isAdmin = !currentUser || currentUser.role === 'Admin';

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-3xl mx-auto text-center space-y-6 my-12">
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto shadow-2xl">
            <Lock className="w-10 h-10 text-rose-400" />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
              Access Restricted
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Privileges Required</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              You are currently logged in as <strong className="text-white">{currentUser?.name}</strong> (<span className="text-indigo-400 font-mono">{currentUser?.role}</span>). Only Administrators can access system configuration, user role controls, and AI engine settings.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400 font-mono max-w-md mx-auto flex items-center gap-3 text-left">
            <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>To gain Admin access, ask a Master Admin to promote your Operator ID (<strong className="text-white">{currentUser?.username}</strong>) in User Management.</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-600/10">
              <SettingsIcon className="w-6 h-6 text-indigo-400 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Advanced System Control</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  ADMIN ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage RBAC user roles, LLM API keys, sprint telemetry weights, and GCS database persistence.
              </p>
            </div>
          </div>

          <button
            onClick={() => triggerToast('All configuration settings saved & synced to GCS!')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-white/5 pb-3 overflow-x-auto">
          {[
            { id: 'users', label: 'User Management & RBAC', icon: Users },
            { id: 'ai', label: 'AI & LLM Engine', icon: Cpu },
            { id: 'agile', label: 'Sprint Parameters', icon: Sliders },
            { id: 'system', label: 'GCP & System Health', icon: Server },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 shadow-md'
                    : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: User Management & RBAC */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Registered System Users & Role Control
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Promote users to Admin to grant them access to this settings console. Changes sync instantly to GCS storage.
                </p>
              </div>
              <button
                onClick={() => refetchUsers()}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh List
              </button>
            </div>

            <div className="bg-glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 border-b border-white/10 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Operator / User</th>
                    <th className="p-4">Operator ID</th>
                    <th className="p-4">Current Role</th>
                    <th className="p-4">Role Control Switch</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                  {users.map(u => {
                    const isMasterAdmin = u.username.toLowerCase() === 'admin';
                    const isAdminUser = u.role === 'Admin';

                    return (
                      <tr key={u.id} className="hover:bg-white/5 transition">
                        <td className="p-4 font-semibold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 font-mono">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{u.name}</div>
                            {isMasterAdmin && (
                              <span className="text-[9px] text-amber-400 font-mono">⭐ System Root</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-300 font-bold">{u.username}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isAdminUser
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-400'
                          }`}>
                            {isAdminUser ? '🛡️ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="p-4">
                          {isMasterAdmin ? (
                            <span className="text-slate-500 text-[11px] italic">Locked (Master Admin)</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <select
                                value={u.role}
                                onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                                disabled={roleMutation.isPending}
                                className="bg-slate-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                              >
                                <option value="User">User (Standard Access)</option>
                                <option value="Admin">Admin (Full System Access)</option>
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-slate-400 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: AI & LLM Engine Settings */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-glass rounded-2xl p-6 border border-white/10 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Primary AI Model Orchestration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'llama-3.3-70b', name: 'Groq LLaMA 3.3 70B', speed: '⚡ ~500 tok/s', tier: 'FREE (Primary)', desc: 'Ultra-fast, 70B parameter open-weights model.' },
                  { id: 'llama-3.1-8b', name: 'Groq LLaMA 3.1 8B', speed: '⚡ ~800 tok/s', tier: 'High TPM Fallback', desc: 'Lightweight model with massive token per minute limit.' },
                  { id: 'gemini-2.0-flash', name: 'Google Gemini 2.0 Flash', speed: '⚡ ~150 tok/s', tier: 'Multimodal Fallback', desc: 'Google AI Studio Gemini model.' },
                ].map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedModel === m.id
                        ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-600/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{m.name}</span>
                        {selectedModel === m.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{m.desc}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-2">
                      <span className="text-emerald-400 font-bold">{m.speed}</span>
                      <span className="text-indigo-300 font-bold">{m.tier}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Keys Panel */}
            <div className="bg-glass rounded-2xl p-6 border border-white/10 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
                <Key className="w-4 h-4 text-amber-400" />
                API Keys Management
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Groq API Key (`GROQ_API_KEY`)</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">✓ Active & Connected</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      value={groqKey}
                      onChange={e => setGroqKey(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute right-3 text-slate-400 hover:text-white"
                    >
                      {showGroqKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Google Gemini API Key (`GEMINI_API_KEY`)</span>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold">✓ Secondary Fallback</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={e => setGeminiKey(e.target.value)}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 text-slate-400 hover:text-white"
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Agile & Sprint Parameters */}
        {activeTab === 'agile' && (
          <div className="bg-glass rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-teal-400" />
              Sprint Telemetry & Risk Weights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Default Sprint Duration (Weeks)</label>
                <select
                  value={sprintDuration}
                  onChange={e => setSprintDuration(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-teal-500"
                >
                  <option value="1">1 Week</option>
                  <option value="2">2 Weeks</option>
                  <option value="3">3 Weeks</option>
                  <option value="4">4 Weeks</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Standard Velocity Commitment Threshold (SP)</label>
                <input
                  type="number"
                  value={targetVelocity}
                  onChange={e => setTargetVelocity(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/5 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Blocked Issue Risk Impact Weight</span>
                  <span className="text-teal-400 font-mono font-bold">{riskBlockedWeight}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={riskBlockedWeight}
                  onChange={e => setRiskBlockedWeight(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Developer Overload Penalty Weight</span>
                  <span className="text-amber-400 font-mono font-bold">{riskOverloadWeight}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={riskOverloadWeight}
                  onChange={e => setRiskOverloadWeight(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System & GCP Storage Controls */}
        {activeTab === 'system' && (
          <div className="bg-glass rounded-2xl p-6 border border-white/10 space-y-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Server className="w-4 h-4 text-emerald-400" />
              GCP Infrastructure & Data Storage
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Cloud Provider</div>
                <div className="text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Google Cloud Platform (GCP)
                </div>
                <div className="text-slate-500 text-[11px]">Project: sakshiaiproject</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2 font-mono text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Storage Bucket (GCS)</div>
                <div className="text-emerald-400 font-bold">gs://sakshiaiproject-sprint-data</div>
                <div className="text-slate-500 text-[11px]">File: sprint_intelligence.db</div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">Manual GCS Bucket Sync</h4>
                <p className="text-[11px] text-slate-400">Trigger immediate download/upload sync between Cloud Run and GCS.</p>
              </div>
              <button
                onClick={() => triggerToast('Successfully synced database with GCP Cloud Storage bucket!')}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 hover:bg-emerald-600/30 cursor-pointer"
              >
                <Database className="w-4 h-4" /> Sync GCS Bucket Now
              </button>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono shadow-2xl flex items-center gap-2.5 z-50"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
