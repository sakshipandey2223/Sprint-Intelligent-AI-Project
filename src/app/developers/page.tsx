'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  ListTodo,
  Activity,
  Bug,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 22 } },
};

export default function DeveloperInsights() {
  const { activeSprintId } = useAppStore();
  const [selectedDevId, setSelectedDevId] = useState<string>('dev-1');

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
        <div className="flex-1 h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950/20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-violet-500 animate-spin" />
            </div>
            <span className="text-xs font-mono text-slate-400">Compiling team workload graphs...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { developers, issues, epics } = data;

  const devsAndQa = developers.filter((d: any) => d.role === 'Developer' || d.role === 'QA');
  const selectedDev = developers.find((d: any) => d.id === selectedDevId) || developers[0];

  const devIssues = issues.filter(
    (i: any) => i.assigneeId === selectedDev.id && i.sprintId === activeSprintId
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  const comparisonChartData = devsAndQa.map((d: any) => ({
    name: d.name.split(' ')[0],
    Commitment: d.assignedPoints,
    Capacity: d.capacityPoints,
  }));

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="p-8 space-y-8 page-transition-wrap"
      >
        {/* Header */}
        <div className="pb-2 border-b border-white/5">
          <h1 className="text-2xl font-black text-white tracking-tight">Developer Insights</h1>
          <p className="text-xs text-slate-400 mt-1">
            Workload distribution, individual capacities, defect densities, and skill matrices.
          </p>
        </div>

        {/* Team Grid & Personal Details */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* Left: Team Roster Cards */}
          <div className="xl:col-span-2 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono uppercase tracking-wider">
              <Users className="w-5 h-5 text-violet-400" />
              Team Roster & Workloads
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {devsAndQa.map((dev: any) => {
                const isOverloaded = dev.assignedPoints > dev.capacityPoints;
                const isCurrentSelection = dev.id === selectedDevId;

                return (
                  <motion.div
                    key={dev.id}
                    variants={itemVariants}
                    onClick={() => setSelectedDevId(dev.id)}
                    className={`p-5 rounded-2xl bg-glass border transition duration-300 cursor-pointer flex flex-col justify-between gap-4 relative ${
                      isCurrentSelection
                        ? 'border-violet-500 glow-primary bg-violet-950/15'
                        : isOverloaded
                        ? 'border-rose-500/30 hover:border-rose-500/50 hover:bg-rose-500/5'
                        : 'border-white/5 hover:border-white/15'
                    }`}
                  >
                    {isOverloaded && (
                      <span className="absolute top-4 right-4 flex items-center gap-1 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[8px] font-bold font-mono px-2 py-0.5 rounded-full">
                        <ShieldAlert className="w-3 h-3" /> OVERLOADED
                      </span>
                    )}

                    <div className="flex items-center gap-4">
                      <img
                        src={dev.avatar}
                        alt={dev.name}
                        className="w-13 h-13 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <h4 className="text-sm font-extrabold text-white leading-snug">{dev.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{dev.role}</span>
                      </div>
                    </div>

                    {/* Utilization stats bar */}
                    <div className="space-y-2 mt-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-500 font-bold">Utilization</span>
                        <span className={`font-bold ${isOverloaded ? 'text-rose-400' : 'text-slate-300'}`}>
                          {dev.assignedPoints} / {dev.capacityPoints} SP ({dev.utilization}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(dev.utilization, 100)}%`,
                            backgroundColor: isOverloaded ? '#ef4444' : dev.utilization >= 75 ? '#06b6d4' : '#10b981',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(dev.utilization, 100)}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {dev.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[8px] font-bold font-mono text-slate-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Personal Workspace */}
          <div className="bg-glass rounded-2xl p-7 flex flex-col gap-6 sticky top-8">
            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
              <img
                src={selectedDev.avatar}
                alt={selectedDev.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
              />
              <div>
                <h3 className="text-base font-black text-white">{selectedDev.name}</h3>
                <span className="text-xs text-cyan-400 font-mono tracking-wider font-bold">{selectedDev.role}</span>
              </div>
            </div>

            {/* Individual Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5 font-bold">Completed Issues</span>
                <span className="text-xl font-black font-mono text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5" />
                  {selectedDev.completedIssuesCount}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
                <span className="text-[10px] text-slate-500 font-mono uppercase block mb-1.5 font-bold">Defect Density</span>
                <span className="text-xl font-black font-mono text-amber-400 flex items-center justify-center gap-1.5">
                  <Bug className="w-5 h-5" />
                  {selectedDev.defectDensity}
                </span>
              </div>
            </div>

            {/* Active Tickets list */}
            <div className="space-y-4 flex-1">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 uppercase font-mono tracking-wider">
                <ListTodo className="w-4 h-4 text-violet-400" />
                Active Tickets ({devIssues.length})
              </h4>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {devIssues.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-10">
                    No active tickets in Sprint {activeSprintId}.
                  </p>
                ) : (
                  devIssues.map((issue: any) => {
                    const epic = epics.find((e: any) => e.id === issue.epicId);
                    return (
                      <div
                        key={issue.id}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col gap-2 transition duration-300 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-cyan-400 font-bold">{issue.id}</span>
                          <span className={`px-2 py-0.5 rounded border text-[8px] font-bold font-mono ${getPriorityStyle(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-slate-200 group-hover:text-white transition line-clamp-2 leading-snug">
                          {issue.title}
                        </h5>
                        <div className="flex items-center justify-between text-[9px] mt-1 border-t border-white/5 pt-2">
                          <span className="text-slate-500 font-bold truncate max-w-[140px]">{epic?.name}</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-white/5 rounded font-mono font-bold text-slate-400">
                            {issue.storyPoints} SP
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Comparative Bar Chart */}
        <div className="bg-glass rounded-2xl p-7 flex flex-col gap-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Team Workload & Capacity Audit
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#f3f4f6',
                  }}
                />
                <Bar
                  dataKey="Capacity"
                  name="Capacity SP"
                  fill="#475569"
                  radius={[5, 5, 0, 0]}
                  opacity={0.6}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Bar
                  dataKey="Commitment"
                  name="Commitment SP"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
