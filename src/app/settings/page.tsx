'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  Settings as SettingsIcon,
  Save,
  Trash2,
  Sliders,
  Sparkles,
  ToggleLeft,
  CheckCircle,
  Eye,
} from 'lucide-react';

export default function Settings() {
  const { theme, setTheme, clearCopilotHistory } = useAppStore();
  
  // Settings state variables
  const [sprintDuration, setSprintDuration] = useState('2');
  const [targetVelocity, setTargetVelocity] = useState('48');
  const [riskBlockedWeight, setRiskBlockedWeight] = useState(35);
  const [riskOverloadWeight, setRiskOverloadWeight] = useState(20);
  const [riskComplexityWeight, setRiskComplexityWeight] = useState(15);
  
  // Notification Toast state
  const [showToast, setShowToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage mock
    localStorage.setItem('sprintDuration', sprintDuration);
    localStorage.setItem('targetVelocity', targetVelocity);
    localStorage.setItem('riskBlockedWeight', riskBlockedWeight.toString());
    localStorage.setItem('riskOverloadWeight', riskOverloadWeight.toString());
    localStorage.setItem('riskComplexityWeight', riskComplexityWeight.toString());

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Configuration Settings</h1>
          <p className="text-xs text-slate-400">
            Tune sprint capacity levels, capacity limits, and AI risk prediction algorithms.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Agile Parameters */}
          <div className="bg-glass rounded-2xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-violet-400" />
              Sprint Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Default Sprint Duration (Weeks)</label>
                <select
                  value={sprintDuration}
                  onChange={(e) => setSprintDuration(e.target.value)}
                  className="bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-violet-500/50 transition cursor-pointer"
                >
                  <option value="1" className="bg-slate-900">1 Week</option>
                  <option value="2" className="bg-slate-900">2 Weeks</option>
                  <option value="3" className="bg-slate-900">3 Weeks</option>
                  <option value="4" className="bg-slate-900">4 Weeks</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300">Standard Velocity Commitment Threshold (SP)</label>
                <input
                  type="number"
                  value={targetVelocity}
                  onChange={(e) => setTargetVelocity(e.target.value)}
                  className="bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white outline-none focus:border-violet-500/50 transition font-mono"
                  min="10"
                  max="150"
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Risk Engine Weights */}
          <div className="bg-glass rounded-2xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              AI Risk Engine Sensitivity Weights
            </h3>

            <div className="space-y-4 text-xs">
              {/* Blocker Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-300">Blocker Risk Factor</span>
                  <span className="font-mono text-cyan-400">+{riskBlockedWeight}% Risk</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={riskBlockedWeight}
                  onChange={(e) => setRiskBlockedWeight(Number(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="text-[10px] text-slate-505 block text-slate-500">Weight applied when a ticket is flagged as Blocked.</span>
              </div>

              {/* Developer Overload Weight */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-300">Developer Overload Factor</span>
                  <span className="font-mono text-cyan-400">+{riskOverloadWeight}% Risk</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={riskOverloadWeight}
                  onChange={(e) => setRiskOverloadWeight(Number(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="text-[10px] text-slate-505 block text-slate-500">Weight applied if the ticket assignee exceeds their capacity points threshold.</span>
              </div>

              {/* Complexity Weight */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-300">Ticket Complexity Factor (Story Points &gt;= 8)</span>
                  <span className="font-mono text-cyan-400">+{riskComplexityWeight}% Risk</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={riskComplexityWeight}
                  onChange={(e) => setRiskComplexityWeight(Number(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="text-[10px] text-slate-500 block">Weight applied when ticket complexity is high (points &gt;= 8 SP).</span>
              </div>
            </div>
          </div>

          {/* Section 3: Interface & Copilot Actions */}
          <div className="bg-glass rounded-2xl p-5 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <ToggleLeft className="w-4 h-4 text-violet-400" />
              Interface Settings & Actions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Theme Settings */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-300">Interface Theme Override</span>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-violet-600/10 border-violet-500 text-white'
                        : 'border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    Dark Theme
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                      theme === 'light'
                        ? 'bg-violet-600/10 border-violet-500 text-white'
                        : 'border-white/5 hover:border-white/10 text-slate-400'
                    }`}
                  >
                    Light Theme
                  </button>
                </div>
              </div>

              {/* Reset AI History */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-300">Copilot AI Cache Logs</span>
                <button
                  type="button"
                  onClick={() => {
                    clearCopilotHistory();
                    alert('Copilot conversation history has been reset.');
                  }}
                  className="py-2 px-4 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-bold transition flex items-center gap-2 justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Purge Copilot Conversation Logs</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-600/15 flex items-center gap-2 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configurations</span>
            </button>
          </div>
        </form>

        {/* Success Toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 text-xs font-bold font-mono shadow-2xl z-50 glow-secondary"
            >
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              <span>Configurations saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
