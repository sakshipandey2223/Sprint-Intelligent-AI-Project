'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion';
import DashboardLayout from '@/components/dashboard-layout';
import { useAppStore } from '@/lib/store';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  Zap,
  Clock,
  Bug,
  LineChart as LineIcon,
} from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 230, damping: 22 } },
};

export default function AnalyticsDeepDive() {
  const { activeSprintId } = useAppStore();

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
            <span className="text-xs font-mono text-slate-400">Rendering analytical telemetry models...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { sprints, analyticsSummary } = data;

  const historicalSprintsData = sprints
    .filter((s: any) => s.status === 'completed')
    .map((s: any) => {
      const score = s.healthScore;
      const leadTime = Math.round((8.5 + (100 - score) * 0.1) * 10) / 10;
      const cycleTime = Math.round((4.2 + (100 - score) * 0.06) * 10) / 10;
      const bugs = s.id % 3 === 0 ? 3 : s.id % 2 === 0 ? 1 : 2;
      const density = Math.round((bugs / s.completedPoints) * 100) / 100;

      return {
        name: s.name,
        'Lead Time (Days)': leadTime,
        'Cycle Time (Days)': cycleTime,
        'Defect Density': density,
        Committed: s.targetPoints,
        Completed: s.completedPoints,
      };
    });

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
          <h1 className="text-2xl font-black text-white tracking-tight">Analytics Deep Dive</h1>
          <p className="text-xs text-slate-400 mt-1">
            Performance telemetry, defect ratios, and deployment frequency logs.
          </p>
        </div>

        {/* Row 1: KPI Stats Grid (Spaced out, p-6, gap-6) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Average Lead Time */}
          <motion.div variants={cardVariants} className="bg-glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Average Lead Time</span>
              <span className="text-lg font-black text-white font-mono leading-none">
                {analyticsSummary.leadTimeAvg} <span className="text-xs text-slate-500 font-bold">Days</span>
              </span>
            </div>
          </motion.div>

          {/* Average Cycle Time */}
          <motion.div variants={cardVariants} className="bg-glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Average Cycle Time</span>
              <span className="text-lg font-black text-white font-mono leading-none">
                {analyticsSummary.cycleTimeAvg} <span className="text-xs text-slate-500 font-bold">Days</span>
              </span>
            </div>
          </motion.div>

          {/* Deployment Frequency */}
          <motion.div variants={cardVariants} className="bg-glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Deployment Freq</span>
              <span className="text-lg font-black text-white font-mono leading-none">
                {analyticsSummary.deploymentFrequency} <span className="text-xs text-slate-500 font-bold">Deploys/wk</span>
              </span>
            </div>
          </motion.div>

          {/* Defect Density */}
          <motion.div variants={cardVariants} className="bg-glass rounded-2xl p-6 flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Defect Density</span>
              <span className="text-lg font-black text-white font-mono leading-none">
                {analyticsSummary.defectDensity} <span className="text-xs text-slate-500 font-bold">Bugs/SP</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Charts (Spaced out padding, gap-8) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Lead vs Cycle Area Chart */}
          <motion.div variants={cardVariants} className="bg-glass rounded-2xl p-7 flex flex-col gap-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              Lead Time vs Cycle Time Trends (Sprints 1–9)
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalSprintsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="leadGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cycleGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} />
                  <Area
                    type="monotone"
                    dataKey="Lead Time (Days)"
                    fill="url(#leadGlow)"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    activeDot={{ r: 5, stroke: '#030712', strokeWidth: 1.5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cycle Time (Days)"
                    fill="url(#cycleGlow)"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                    activeDot={{ r: 5, stroke: '#030712', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Defect Density Line Chart */}
          <motion.div variants={cardVariants} className="bg-glass rounded-2xl p-7 flex flex-col gap-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bug className="w-5 h-5 text-rose-500" />
              Defect Density Historical Log
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalSprintsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} />
                  <Line
                    type="monotone"
                    dataKey="Defect Density"
                    name="Bugs per Story Point"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    activeDot={{ r: 6, stroke: '#030712', strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Row 3: Sprint Commitment comparison Area Chart */}
        <div className="bg-glass rounded-2xl p-7 flex flex-col gap-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-cyan-400" />
            Historical Sprint Target Commitment vs Delivery
          </h3>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalSprintsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="targetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="completGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '600' }} />
                <Area
                  type="monotone"
                  dataKey="Committed"
                  fill="url(#targetGrad)"
                  stroke="#475569"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="Completed"
                  fill="url(#completGrad)"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  activeDot={{ r: 6, stroke: '#030712', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
