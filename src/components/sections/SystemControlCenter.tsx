"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Cpu, 
  Settings2, 
  Bell, 
  Zap, 
  Eye, 
  Lock, 
  Wifi, 
  Cloud, 
  Dumbbell, 
  Wallet, 
  Clock, 
  Trophy, 
  Users,
  Info,
  ChevronDown,
  ArrowRight,
  RefreshCcw,
  Target,
  Brain,
  History,
  Terminal,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  settingsStore, 
  subscribeToStore, 
  SettingsData,
  subscribeToSyncStatus,
  SyncStatus,
  fitnessStore,
  routineStore,
  planningStore,
  financeStore,
  sleepStore
} from '@/lib/store';
import { useSettings } from '@/hooks/useSettings';

interface SystemControlCenterProps {
  onOpenNeuralTimeline: () => void;
}

const SnapshotItem = ({ label, value, icon: Icon, statusColor, onClick }: { label: string, value: string, icon: any, statusColor?: string, onClick?: () => void }) => (
  <div 
    className={`flex flex-col gap-1 min-w-[140px] ${onClick ? 'cursor-pointer group/item' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-1.5 opacity-40 group-hover/item:opacity-60 transition-opacity">
      <Icon size={10} />
      <span className="font-mono text-[9px] uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {statusColor && <div className={`w-1 h-1 rounded-full ${statusColor}`} />}
      <span className="text-white text-sm font-medium capitalize tracking-tight group-hover/item:text-blue-400 transition-colors">{value}</span>
    </div>
  </div>
);

const CollapsibleGroup = ({ title, icon: Icon, children, defaultOpen = true }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-white/5 last:border-0 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full group mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/5 rounded-lg text-white/40 group-hover:text-white/60 transition-colors">
            <Icon size={16} />
          </div>
          <h3 className="text-white font-medium tracking-tight">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-white/20 group-hover:text-white/40 transition-colors"
        >
          <ChevronDown size={16} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingCard = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = 'default'
}: { 
  icon: any, 
  title: string, 
  description: string, 
  action: React.ReactNode,
  variant?: 'default' | 'compact'
}) => (
  <div className={`bg-white/[0.02] border border-white/5 rounded-xl transition-all duration-300 hover:bg-white/[0.04] ${variant === 'compact' ? 'p-4' : 'p-5'}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex gap-4">
        <div className={`mt-0.5 p-2 bg-white/5 rounded-lg text-white/40 h-fit ${variant === 'compact' ? 'hidden' : 'block'}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <h4 className="text-white text-sm font-medium mb-1">{title}</h4>
          <p className="text-white/40 text-[11px] leading-relaxed line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  </div>
);

const Toggle = ({ active, onClick, disabled = false }: { active: boolean, onClick: () => void, disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-10 h-5 rounded-full transition-all duration-300 relative ${
      active ? 'bg-white' : 'bg-white/10'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <motion.div
      animate={{ x: active ? 22 : 4 }}
      className={`absolute top-0.5 w-4 h-4 rounded-full ${active ? 'bg-black' : 'bg-white/40'}`}
    />
  </button>
);

const SegmentedControl = <T extends string>({ 
  options, 
  active, 
  onChange 
}: { 
  options: { value: T, label: string }[], 
  active: T, 
  onChange: (value: T) => void 
}) => (
  <div className="flex bg-white/5 rounded-lg p-1 w-full max-w-[200px]">
    {options.map((option) => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`flex-1 py-1 px-3 text-[10px] font-medium rounded-md transition-all ${
          active === option.value 
            ? 'bg-white text-black shadow-lg' 
            : 'text-white/40 hover:text-white/60'
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>
);

const FlowStep = ({ 
  label, 
  icon: Icon, 
  active, 
  description, 
  onSelect 
}: { 
  label: string, 
  icon: any, 
  active: boolean, 
  description: string,
  onSelect: () => void
}) => (
  <button 
    onClick={onSelect}
    className="flex flex-col items-center gap-3 relative group focus:outline-none"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
      active 
        ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)] scale-110' 
        : 'bg-white/5 text-white/20 border-white/5 hover:border-white/20'
    }`}>
      <Icon size={20} />
    </div>
    <div className="flex flex-col items-center">
      <span className={`text-[9px] font-mono uppercase tracking-[0.2em] transition-colors mb-1 ${
        active ? 'text-white' : 'text-white/20 group-hover:text-white/40'
      }`}>{label}</span>
      {active && (
        <motion.div 
          layoutId="active-flow-dot"
          className="w-1 h-1 rounded-full bg-white" 
        />
      )}
    </div>
  </button>
);

const FLOW_STEPS = [
  { id: 'input', label: 'Input', icon: ArrowRight, desc: 'Capture raw information, thoughts, and tasks into the system without friction.' },
  { id: 'planning', label: 'Planning', icon: Clock, desc: 'Organize inputs into actionable blocks, routines, and high-priority intentions.' },
  { id: 'execution', label: 'Execution', icon: Zap, desc: 'Focus on deep work and daily rituals. The system suppresses noise during these periods.' },
  { id: 'review', label: 'Review', icon: RefreshCcw, desc: 'Close out the day, log biometric data, and verify completion of objectives.' },
  { id: 'insights', label: 'Insights', icon: Brain, desc: 'System analyzes patterns to provide tactical advice and performance optimizations.' },
];

export default function SystemControlCenter({ onOpenNeuralTimeline }: SystemControlCenterProps) {
  const settings = useSettings();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [showReview, setShowReview] = useState(false);
  const [activeStepId, setActiveStepId] = useState('planning');

  const getTimelineStats = useCallback(() => {
    const fitness = fitnessStore.get();
    const routine = routineStore.get();
    const planning = planningStore.get();
    const finance = financeStore.get();
    const sleep = sleepStore.get();

    const allDates = new Set<string>();
    
    // Add dates from all stores
    Object.keys(fitness.completedSessions || {}).forEach(d => allDates.add(d));
    (routine.habitHistory || []).forEach(h => allDates.add(h.date));
    (planning.tasks || []).forEach(t => t.date && allDates.add(t.date));
    Object.keys(sleep.days || {}).forEach(d => allDates.add(d));
    Object.keys(finance.months || {}).forEach(monthKey => {
      finance.months[monthKey].expenses.forEach(e => allDates.add(e.date));
    });

    const sortedDates = Array.from(allDates).sort();
    return {
      daysTracked: allDates.size,
      oldestDate: sortedDates[0] ? new Date(sortedDates[0]).toLocaleDateString() : 'N/A'
    };
  }, []);

  const stats = getTimelineStats();

  useEffect(() => {
    const unsubscribe = subscribeToSyncStatus(setSyncStatus);
    return unsubscribe;
  }, []);

  const updateSettings = (updates: Partial<SettingsData>) => {
    settingsStore.save({ ...settings, ...updates });
  };

  const updateModule = (module: keyof SettingsData['modules'], value: boolean) => {
    updateSettings({
      modules: { ...settings.modules, [module]: value }
    });
  };

  const handleReview = () => {
    const today = new Date().toISOString().split('T')[0];
    updateSettings({ systemReviewDate: today });
    setShowReview(true);
    setTimeout(() => setShowReview(false), 3000);
  };

  const activeStep = FLOW_STEPS.find(s => s.id === activeStepId)!;

  if (!settings.modules) return null;

  return (
    <section id="features" className="relative w-full py-24 md:py-32 bg-[#050505] overflow-hidden min-h-screen">
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">System Tab</span>
            </motion.div>
            <h2 className="font-display text-[clamp(32px,5vw,64px)] text-white tracking-tighter leading-none mb-12">
              System <span className="text-white/30">Control Center</span>
            </h2>

              {/* 1. System Snapshot */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-wrap gap-x-12 gap-y-8 items-center justify-between backdrop-blur-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/[0.01] rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                
                <SnapshotItem 
                  label="Signal Mode" 
                  value={settings.dailySignal || 'Standard'} 
                  icon={Zap} 
                />
                <SnapshotItem 
                  label="Sync Status" 
                  value={syncStatus} 
                  icon={Wifi}
                  statusColor={syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}
                />
                <SnapshotItem 
                  label="Neural Timeline" 
                  value={`${stats.daysTracked} Days`} 
                  icon={History}
                  onClick={onOpenNeuralTimeline}
                />
                <SnapshotItem 
                  label="Focus Mode" 
                  value={settings.focusBehavior === 'manual' ? 'Manual' : 'Auto'} 
                  icon={Target} 
                />
              </div>
          </div>

          {/* 4. System Flow Visualization */}
          <div className="mb-16">
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
              <div className="flex items-center justify-between min-w-[500px] relative mb-12 px-4">
                <div className="absolute top-6 left-12 right-12 h-[1px] bg-white/5 z-0" />
                {FLOW_STEPS.map((step) => (
                  <FlowStep 
                    key={step.id}
                    label={step.label}
                    icon={step.icon}
                    active={activeStepId === step.id}
                    description={step.desc}
                    onSelect={() => setActiveStepId(step.id)}
                  />
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStepId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6 items-center"
                >
                  <div className="p-4 bg-white/10 rounded-xl text-white">
                    <activeStep.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1 flex items-center gap-2">
                      {activeStep.label} Protocol
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">Phase {FLOW_STEPS.indexOf(activeStep) + 1}</span>
                    </h4>
                    <p className="text-white/40 text-xs leading-relaxed max-w-lg">
                      {activeStep.desc}
                    </p>
                  </div>
                  <ChevronRight size={20} className="ml-auto text-white/10" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* 2. Refactor Behavior Controls */}
          <div className="mb-16 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-6 md:p-8">
              <h2 className="text-white font-display text-2xl tracking-tight mb-2">Behavior Controls</h2>
              <p className="text-white/30 text-xs mb-8">Fundamental system interaction patterns</p>
              
              <CollapsibleGroup title="Attention" icon={Zap}>
                <SettingCard 
                  icon={Zap}
                  title="Daily Signal"
                  description="Calm suppresses noise; Standard for full system awareness."
                  action={
                    <SegmentedControl 
                      options={[{ value: 'calm', label: 'Calm' }, { value: 'standard', label: 'Std' }]}
                      active={settings.dailySignal || 'standard'}
                      onChange={(v) => updateSettings({ dailySignal: v as any })}
                    />
                  }
                />
                <SettingCard 
                  icon={Bell}
                  title="Notification Tone"
                  description="Choose alert intensity."
                  action={
                    <SegmentedControl 
                      options={[{ value: 'silent', label: 'Silent' }, { value: 'gentle', label: 'Gentle' }]}
                      active={settings.notificationTone || 'gentle'}
                      onChange={(v) => updateSettings({ notificationTone: v as any })}
                    />
                  }
                />
              </CollapsibleGroup>

              <CollapsibleGroup title="Focus" icon={Target}>
                <SettingCard 
                  icon={Eye}
                  title="Focus Behavior"
                  description="Manual or experimental auto-detection of work periods."
                  action={
                    <SegmentedControl 
                      options={[{ value: 'manual', label: 'Manual' }, { value: 'auto', label: 'Auto' }]}
                      active={settings.focusBehavior || 'manual'}
                      onChange={(v) => updateSettings({ focusBehavior: v as any })}
                    />
                  }
                />
              </CollapsibleGroup>

                <CollapsibleGroup title="Intelligence" icon={Brain}>
                  <SettingCard 
                    icon={Cpu}
                    title="AI Insights"
                    description="Frequency of pattern-based life suggestions."
                    action={
                      <SegmentedControl 
                        options={[{ value: 'limited', label: 'Limited' }, { value: 'occasional', label: 'Occasional' }]}
                        active={settings.aiFrequency || 'occasional'}
                        onChange={(v) => updateSettings({ aiFrequency: v as any })}
                      />
                    }
                  />
                  <SettingCard 
                    icon={Brain}
                    title="Skill Insights"
                    description="Allow AI to provide occasional nudges based on behavior."
                    action={
                      <Toggle 
                        active={settings.aiSkillInsights} 
                        onClick={() => updateSettings({ aiSkillInsights: !settings.aiSkillInsights })} 
                      />
                    }
                  />
                  <SettingCard 
                    icon={Target}
                    title="Practice Suggestions"
                    description="Manual trigger only (Off) or occasional suggestions (On)."
                    action={
                      <Toggle 
                        active={!settings.practiceSuggestionsManual} 
                        onClick={() => updateSettings({ practiceSuggestionsManual: !settings.practiceSuggestionsManual })} 
                      />
                    }
                  />
                  <SettingCard 
                    icon={Users}
                    title="Skill Visibility"
                    description="Personal growth or community-ready (future)."
                    action={
                      <SegmentedControl 
                        options={[{ value: 'Personal', label: 'Personal' }, { value: 'Community-ready', label: 'Community' }]}
                        active={settings.skillVisibility || 'Personal'}
                        onChange={(v) => updateSettings({ skillVisibility: v as any })}
                      />
                    }
                  />
                </CollapsibleGroup>
            </div>
          </div>

              {/* 3. Simplified Modules & Features */}
              <div className="mb-16">
                <h2 className="text-white font-display text-2xl tracking-tight mb-8">Operational Modules</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'fitness', title: 'Performance', icon: Dumbbell, desc: 'Workout tracking & biometrics' },
                    { id: 'finance', title: 'Capital', icon: Wallet, desc: 'Expense & budget management' },
                    { id: 'flow', title: 'FLOW', icon: Zap, desc: 'Habits & daily rituals' },
                    { id: 'neuralTimeline', title: 'Neural Timeline', icon: History, desc: 'Historical persistence & memory' },
                    { id: 'football', title: 'Football', icon: Trophy, desc: 'Technical skill drills' },
                    { id: 'community', title: 'Community', icon: Users, desc: 'Future social integration' }
                  ].map((mod) => (
                    <SettingCard 
                      key={mod.id}
                      variant="compact"
                      icon={mod.icon}
                      title={mod.title}
                      description={mod.desc}
                      action={
                        <Toggle 
                          active={settings.modules[mod.id as keyof SettingsData['modules']]} 
                          onClick={() => updateModule(mod.id as keyof SettingsData['modules'], !settings.modules[mod.id as keyof SettingsData['modules']])} 
                        />
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Data Governance / Delete History */}
              <div className="mb-16 bg-red-500/5 border border-red-500/10 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Data Governance</h3>
                    <p className="text-white/30 text-[11px]">Manage your historical persistence</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <SettingCard
                    icon={Clock}
                    title="Data Retention"
                    description="Automatically clear old data to keep the system lean."
                    action={
                      <select 
                        value={settings.retentionPolicy || 'all'}
                        onChange={(e) => updateSettings({ retentionPolicy: e.target.value as any })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white focus:outline-none"
                      >
                        <option value="all" className="bg-[#1a1a1a]">All Time</option>
                        <option value="1year" className="bg-[#1a1a1a]">1 Year</option>
                        <option value="90days" className="bg-[#1a1a1a]">90 Days</option>
                        <option value="30days" className="bg-[#1a1a1a]">30 Days</option>
                      </select>
                    }
                  />

                  <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div>
                      <h4 className="text-white text-sm font-medium mb-1">Delete All History</h4>
                      <p className="text-white/40 text-[11px]">Permanently remove all logs across all modules.</p>
                    </div>
                    <button 
                      onClick={() => {
                        if (confirm('Are you absolutely sure? This will delete all your local and cloud data permanently.')) {
                          // Implement delete logic
                          window.dispatchEvent(new CustomEvent('clear-all-data'));
                        }
                      }}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all"
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              </div>

          {/* 5. System Review Card */}
          <div className="mb-24">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                  <RefreshCcw size={28} />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">System Health Review</h3>
                  <p className="text-white/40 text-xs">
                    Last review: {settings.systemReviewDate ? new Date(settings.systemReviewDate).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleReview}
                className="w-full md:w-auto px-8 py-3 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {showReview ? (
                  <>
                    <RefreshCcw size={16} className="animate-spin" />
                    Reviewing...
                  </>
                ) : (
                  'Review System'
                )}
              </button>
            </div>
          </div>

          {/* 6. Developer / About section */}
          <div className="pt-16 border-t border-white/5 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 opacity-30 hover:opacity-100 transition-opacity duration-500">
              <div className="max-w-sm">
                <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                  <Terminal size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-widest">LifeOS Core v2.4.0</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  A human-centric operating system designed for clarity, intentionality, and sustainable growth. Built to serve, not to consume.
                </p>
              </div>
              <div className="flex gap-8 font-mono text-[9px] uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-white transition-colors">Philosophy</a>
                <a href="#" className="hover:text-white transition-colors">Changelog</a>
                <a href="#" className="hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
