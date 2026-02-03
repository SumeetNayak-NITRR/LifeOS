"use client";

import React, { useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  Shield, 
  Cpu, 
  Database, 
  Globe, 
  Layers, 
  Eye, 
  Terminal, 
  ArrowUpRight, 
  CheckCircle2, 
  Target, 
  Flame, 
  TrendingUp,
  Clock,
  Layout,
  MousePointer2,
  Lock,
  Wifi,
  BarChart3
} from 'lucide-react';
import { 
  fitnessStore, 
  workStore, 
  routineStore, 
  planningStore, 
  subscribeToStore,
  FitnessData,
  WorkData,
  RoutineData,
  PlanningData
} from '@/lib/store';
import { ZapIcon } from '@/components/ui/ZapIcon';

const NeuralSyncOrb = ({ sync }: { sync: number }) => (
  <div className="relative w-48 h-48 flex items-center justify-center">
    <motion.div 
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"
    />
    <motion.div 
      animate={{ 
        rotate: 360,
        scale: [0.9, 1, 0.9]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="w-32 h-32 rounded-full border border-blue-400/30 flex items-center justify-center relative"
    >
      <div className="absolute inset-2 rounded-full border border-purple-500/20" />
      <div className="absolute inset-4 rounded-full border border-blue-500/10" />
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 blur-[2px] opacity-80 shadow-[0_0_30px_rgba(96,165,250,0.5)]" />
</motion.div>
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
<span className="block font-mono text-[10px] text-white/50 uppercase tracking-[0.2em]">Sync</span>
<span className="block font-display text-2xl text-white tracking-tighter">{sync}%</span>
</div>
</div>
);

const HUDLabel = ({ label, value }: { label: string, value: string }) => (
<div className="flex flex-col gap-1">
<span className="font-mono text-[9px] text-white/40 uppercase tracking-[0.3em]">{label}</span>
<span className="font-mono text-[11px] text-white/70 tracking-wider">{value}</span>
</div>
);

const WidgetWrapper = ({ title, icon, children, className = "" }: { title: string, icon: React.ReactNode, children: React.ReactNode, className?: string }) => (
<motion.div 
initial={{ opacity: 0, y: 20 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}
className={`bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.04] transition-all duration-500 group ${className}`}
>
<div className="flex items-center justify-between mb-8">
<div className="flex items-center gap-3">
<div className="text-white/40 group-hover:text-blue-400 transition-colors">{icon}</div>
<span className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">
{title}
</span>
</div>
<div className="w-1.5 h-1.5 rounded-full bg-blue-500/40 group-hover:bg-blue-500 transition-all" />
</div>
{children}
</motion.div>
);


function useStoreData() {
  const getSnapshot = useCallback(() => {
    return JSON.stringify({
      fitness: fitnessStore.get(),
      work: workStore.get(),
      routine: routineStore.get(),
      planning: planningStore.get(),
    });
  }, []);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify({
      fitness: { selectedSession: null, streak: 0, weekProgress: [false, false, false, false, false], recentActivity: [], history: [] },
      work: { tasks: [], focusTime: 0 },
      routine: { routines: [], habits: [], habitHistory: [] },
      planning: { weeklyGoals: [], monthlyFocus: '', brainDump: '' },
    });
  }, []);

  const data = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  return JSON.parse(data) as {
    fitness: FitnessData;
    work: WorkData;
    routine: RoutineData;
    planning: PlanningData;
  };
}

export default function MasonryGrid() {
  const [uptime, setUptime] = useState('00:00:00');
  const storeData = useStoreData();
  const { fitness, work, routine, planning } = storeData;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setUptime(`${hours}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const syncLevel = useMemo(() => {
    const totalGoals = planning.weeklyGoals.length;
    if (totalGoals === 0) return 98.4;
    const avgProgress = planning.weeklyGoals.reduce((acc, g) => acc + g.progress, 0) / totalGoals;
    return Math.round(avgProgress * 0.2 + 80); // Scaled for aesthetic
  }, [planning.weeklyGoals]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const navHeight = 80;
    window.scrollTo({
      top: element.offsetTop - navHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section id="features" className="relative w-full py-32 md:py-48 bg-[#050505] overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-24 gap-y-12 items-start">
            
            {/* Column 1: System Status & Core Metrics */}
            <div className="flex flex-col space-y-12">
              <div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 mb-6"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">System Control Center</span>
                  </motion.div>
                  <h2 className="font-display text-[clamp(48px,8vw,110px)] text-white tracking-tighter leading-[0.85] mb-12">
                    Unified <br />
                    <span className="text-white/35">Operations Hub.</span>
                  </h2>
                  
                  <div className="flex flex-wrap gap-12 border-l border-white/5 pl-8 py-4">
                    <HUDLabel label="Engine_Stability" value="98.4%" />
                    <HUDLabel label="Session_Uptime" value={uptime} />
                    <HUDLabel label="Neural_Sync" value="NOMINAL" />
                  </div>
              </div>

              {/* Neural Sync Core Widget */}
              <WidgetWrapper title="Neural Sync Core" icon={<Cpu size={18} />}>
                <div className="flex flex-col items-center justify-center py-8">
                  <NeuralSyncOrb sync={syncLevel} />
                    <div className="mt-12 w-full space-y-4">
                      <div className="flex justify-between items-center px-4">
                        <span className="font-mono text-[9px] text-white/35 uppercase tracking-widest">Active Objectives</span>
                        <span className="font-mono text-[11px] text-white/65">{work.tasks.filter(t => t.status === 'pending').length}</span>
                      </div>
                      <div className="h-[1px] w-full bg-white/5" />
                      <div className="flex justify-between items-center px-4">
                        <span className="font-mono text-[9px] text-white/35 uppercase tracking-widest">Biometric Streak</span>
                        <span className="font-mono text-[11px] text-emerald-400">{fitness.streak} Days</span>
                      </div>
                    </div>
                </div>
              </WidgetWrapper>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'dashboard', icon: <Layout size={18} />, label: 'Dashboard' },
                  { id: 'work', icon: <Target size={18} />, label: 'Objectives' },
                  { id: 'fitness', icon: <Activity size={18} />, label: 'Biometrics' },
                  { id: 'routine', icon: <Clock size={18} />, label: 'Routines' }
                ].map((action) => (
                  <button 
                    key={action.id}
                    onClick={() => scrollToSection(action.id)}
                    className="flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                  >
                    <div className="text-white/20 group-hover:text-white transition-colors mb-3">
                      {action.icon}
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/40 group-hover:text-white/60">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Data Visualizations & Detailed Status */}
            <div className="flex flex-col space-y-12 lg:mt-64">
              
              {/* Performance Analysis Widget */}
              <WidgetWrapper title="Performance Analysis" icon={<Activity size={18} />}>
                <p className="font-sans text-[16px] leading-relaxed text-white/40 mb-8">
                  Analyzing current trajectory based on weekly missions and habit consistency. System optimization is recommended for next rotation.
                </p>
                <div className="flex items-end gap-3 h-20 mb-8">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col gap-2">
                      <motion.div 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        className="w-full bg-gradient-to-t from-blue-500/20 to-blue-400/40 rounded-t-sm"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-mono text-[8px] text-white/10 uppercase tracking-widest">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </WidgetWrapper>

              {/* System Infrastructure Metrics */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <Wifi size={18} />
                    </div>
                    <div>
                      <span className="block font-mono text-[9px] text-white/20 uppercase tracking-widest">Neural_Sync</span>
                      <span className="text-sm text-white/60">Active_Connection</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 tracking-widest">CONNECTED</span>
                </div>
                
                <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Lock size={18} />
                    </div>
                    <div>
                      <span className="block font-mono text-[9px] text-white/20 uppercase tracking-widest">Data_Encryption</span>
                      <span className="text-sm text-white/60">End-to-End_Active</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 tracking-widest">SECURE</span>
                </div>
              </div>

              {/* Weekly Momentum Subsystem */}
              <WidgetWrapper title="Operational Momentum" icon={<TrendingUp size={18} />}>
                <div className="py-4 border-b border-white/5 mb-8">
                    <HUDLabel label="System_Velocity" value="Overall Progress" />
                    <div className="flex items-baseline space-x-2 mt-4">
                        <span className="font-display text-[clamp(48px,6vw,72px)] leading-none text-white tracking-tighter">
                          {syncLevel}%
                        </span>
                        <span className="font-mono text-[12px] text-emerald-400">+4.2%</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">Status: Optimal</span>
                  </div>
                  <ZapIcon active size={16} />
                </div>
              </WidgetWrapper>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Detail Asset */}
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02]">
        <Database size={600} strokeWidth={0.1} className="text-white rotate-12" />
      </div>
    </section>
  );
}
