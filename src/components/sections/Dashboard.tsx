"use client";

import React, { useState, useEffect, useSyncExternalStore, useCallback, useRef } from 'react';
import { Activity, Target, CheckCircle2, TrendingUp, X, RefreshCw, Sparkles, ChevronRight, Plus, Timer, MessageSquare, Zap, Command, History, Clock, Flame } from 'lucide-react';
import { ZapIcon } from '@/components/ui/ZapIcon';
import { useFocusMode } from '@/hooks/useFocusMode';
import { 
  settingsStore, 
  fitnessStore, 
workStore, 
routineStore, 
planningStore,
sleepStore,
subscribeToStore,
performDailyReset,
FitnessData,
WorkData,
RoutineData,
PlanningData,
SleepData
} from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ChevronLeft, Calendar as CalendarIcon, Brain } from 'lucide-react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';

interface DashboardProps {
  onOpenNeuralTimeline: () => void;
  onOpenSkillHub: () => void;
}

interface StatusCardProps {
  title: string;
  metric: string;
  subtext?: string;
  icon: React.ReactNode;
  delay?: number;
  targetSection?: string;
  onNavigate?: (section: string) => void;
  isHighlighted?: boolean;
  colSpan?: string;
  progress?: number;
  progressColor?: string;
}

function StatusCard({ 
  title, 
  metric, 
  subtext, 
  icon, 
  delay = 0, 
  targetSection, 
  onNavigate, 
  isHighlighted = false,
  colSpan = "col-span-1",
  progress,
  progressColor = "#ffffff"
}: StatusCardProps) {

  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (targetSection && onNavigate) {
      onNavigate(targetSection);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`group relative bg-[#0a0a0a] border rounded-[1.5rem] p-7 cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isHovered ? 'bg-[#0f0f0f] -translate-y-1 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]' : 'border-white/5'
      } ${
        isHighlighted ? 'ring-1 ring-white/10' : ''
      } ${colSpan}`}
      style={{ borderColor: isHovered ? `${progressColor}33` : undefined }}
    >
      {/* Subtle Area Glow */}
      <div 
        className={`absolute -inset-1 rounded-[1.6rem] blur-lg transition-opacity duration-700 ${isHovered ? 'opacity-40' : 'opacity-0'}`} 
        style={{ background: `radial-gradient(circle at center, ${progressColor}22 0%, transparent 70%)` }}
      />
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-start justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5 transition-all duration-500 ${
            isHovered ? 'bg-white/10 scale-110 rotate-3' : ''
          }`}>
            {icon}
          </div>
          {progress !== undefined ? (
            <ProgressRing progress={progress} size={48} color={progressColor} />
          ) : (
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${
              isHovered ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/10'
            }`} />
          )}
        </div>
        
        <div className="mt-auto">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 mb-3">
              {title}
            </h3>
            
            <div className="flex items-baseline gap-2">
              <p className={`font-display text-2xl md:text-3xl text-white transition-all duration-500 ${
                isHovered ? 'translate-x-1' : ''
              }`}>
                {metric}
              </p>
            </div>

            {subtext && (
              <p className="text-white/35 text-[11px] mt-2 font-light tracking-wide">{subtext}</p>
            )}
        </div>
      </div>

      <div className={`absolute bottom-6 right-6 opacity-0 transition-all duration-500 ${isHovered ? 'opacity-40 translate-x-0' : 'translate-x-4'}`}>
        <ChevronRight size={16} className="text-white" />
      </div>
    </motion.div>
  );
}

function ThoughtStream({ tasks }: { tasks: any[] }) {
  const recentTasks = tasks.slice(0, 3);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={12} className="text-white/20" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20">Recent Captures</span>
      </div>
      {recentTasks.map((task, i) => (
        <motion.div 
          key={task.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-start gap-4 group/item"
        >
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400/20 group-hover/item:bg-blue-400 transition-colors" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-white/40 group-hover/item:text-white/70 transition-colors truncate">{task.text}</p>
            <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest mt-1 block">Acknowledged</span>
          </div>
        </motion.div>
      ))}
      {recentTasks.length === 0 && (
        <p className="text-[11px] text-white/10 italic">Neural buffers are empty.</p>
      )}
    </div>
  );
}

function QuickCapture({ onNavigate, tasks }: { onNavigate: (section: string) => void, tasks: any[] }) {
  const [text, setText] = useState('');
  const [added, setAdded] = useState(false);
  
  const handleAdd = () => {
    if (!text.trim()) return;
    const current = workStore.get();
    const today = new Date().toISOString().split('T')[0];
    workStore.save({
      ...current,
      tasks: [
        {
          id: Date.now().toString(),
          text: text.trim(),
          status: 'pending' as const,
          date: today,
          carryOverCount: 0,
          isImportant: false,
          isOngoing: false
        },
        ...current.tasks
      ]
    });
    setText('');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-6">
        <div className="relative group/input">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
          <div className="relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex items-center gap-4 focus-within:border-white/20 transition-all duration-500">
            <Command size={20} className="text-white/20 group-focus-within/input:text-blue-400 transition-colors" />
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="System_capture: Input new objective or thought..."
              className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-white/10 font-light"
            />
            <div className="flex items-center gap-2">
               <span className="hidden sm:block font-mono text-[9px] text-white/10 px-2 py-1 border border-white/5 rounded">ENTER</span>
               <button 
                onClick={handleAdd}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all active:scale-90"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-amber-400" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Priority_Lock</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-400" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Neural_Buffer</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Auto_Sync</span>
          </div>
        </div>

        {added && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono uppercase tracking-widest"
          >
            <Zap size={12} />
            <span>Successfully Archived to Objectives</span>
          </motion.div>
        )}
      </div>

      <div className="lg:col-span-5 border-l border-white/5 pl-0 lg:pl-10">
        <ThoughtStream tasks={tasks} />
      </div>
    </div>
  );
}

function DailySignal({ storeData }: { storeData: any }) {
  const [view, setView] = useState<'primary' | 'secondary'>('primary');
  const today = new Date().toISOString().split('T')[0];
  
  const { fitness, work, routine, sleep, planning } = storeData;
  
  // Hydration logic
  const todayHydrationEntries = fitness.hydration?.entries[today] || [];
  const totalWater = todayHydrationEntries.reduce((sum: number, e: any) => sum + e.amount, 0);
  const isHydrationLow = totalWater < 2000;

  // Sleep logic
  const isSleepLogged = !!sleep?.days[today]?.wakeAt;

  // Work logic
  const hasFocusSession = work.focusSessions > 0;

  // Routine logic
  const allRoutineItems = routine.routines.flatMap((r: any) => r.items);
  const routineDone = allRoutineItems.filter((i: any) => i.done).length + routine.habits.filter((h: any) => h.done).length;
  
  // Fitness logic
  const isFitnessComplete = !!fitness.completedSessions?.[today];

  // Planning logic
  const todayTasks = planning.tasks.filter((t: any) => t.date === today);
  const planningComplete = todayTasks.length > 0 && todayTasks.every((t: any) => t.completed);
  const hasTodayTasks = todayTasks.length > 0;

  // Determine Primary Signal
  let primarySignal = "All set for now";
  if (isHydrationLow) primarySignal = "Hydration is low today";
  else if (!isSleepLogged) primarySignal = "No sleep data logged";
  else if (hasTodayTasks && !planningComplete) primarySignal = "Today's intentions pending";
  else if (!hasFocusSession) primarySignal = "No focus session yet";
  else if (routineDone === 0 && !isFitnessComplete) primarySignal = "Routine not started";

  // Determine Secondary Signals
  const secondarySignals = [];
  if (!isHydrationLow) secondarySignals.push("Hydration target met");
  if (isSleepLogged) secondarySignals.push("Sleep logged");
  if (hasFocusSession) secondarySignals.push("Focus session completed");
  if (routineDone > 0) secondarySignals.push("Habits completed");
  if (isFitnessComplete) secondarySignals.push("Fitness session completed");
  if (planningComplete) secondarySignals.push("Today's intentions complete");

  return (
    <div className="relative bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-10 overflow-hidden min-h-[160px] flex flex-col justify-center group">
      <AnimatePresence mode="wait">
        {view === 'primary' ? (
          <motion.div
            key="primary"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50 && secondarySignals.length > 0) setView('secondary');
            }}
            className="flex items-center justify-between cursor-grab active:cursor-grabbing"
          >
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">Daily Signal</span>
              <p className="text-2xl md:text-3xl font-display text-white">{primarySignal}</p>
            </div>
            {secondarySignals.length > 0 && (
              <button 
                onClick={() => setView('secondary')}
                className="p-3 rounded-full bg-white/5 border border-white/10 text-white/35 hover:text-white/60 transition-all hover:translate-x-1"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="secondary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50) setView('primary');
            }}
            className="flex items-center gap-6 cursor-grab active:cursor-grabbing"
          >
            <button 
              onClick={() => setView('primary')}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white/35 hover:text-white/60 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex-1 flex gap-8 overflow-x-auto pb-2 scrollbar-none">
              {secondarySignals.map((signal, i) => (
                <div key={i} className="flex flex-col gap-1 shrink-0">
                  <span className="font-mono text-[8px] text-white/35 uppercase tracking-widest">Active</span>
                  <span className="text-sm text-white/65 font-light whitespace-nowrap">{signal}</span>
                </div>
              ))}
              {secondarySignals.length === 0 && (
                <span className="text-white/35 text-xs italic">No secondary signals yet</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative scanline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function useStoreData() {
  const getSnapshot = useCallback(() => {
    return JSON.stringify({
      fitness: fitnessStore.get(),
      work: workStore.get(),
      routine: routineStore.get(),
      planning: planningStore.get(),
      sleep: sleepStore.get(),
    });
  }, []);

  const getServerSnapshot = useCallback(() => {
    return JSON.stringify({
      fitness: { selectedSession: null, streak: 0, weekProgress: [false, false, false, false, false], recentActivity: [], history: [], hydration: { entries: {} } },
      work: { tasks: [], focusTime: 0, focusSessions: 0 },
      routine: { routines: [], habits: [], habitHistory: [] },
      planning: { weeklyGoals: [], monthlyFocus: '', brainDump: '' },
      sleep: { days: {} },
    });
  }, []);

  const data = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  return JSON.parse(data) as {
    fitness: FitnessData;
    work: WorkData;
    routine: RoutineData;
    planning: PlanningData;
    sleep: SleepData;
  };
}

type TimeSegment = 'morning' | 'midday' | 'evening' | 'night';

function NeuralTimelinePreview({ onOpen, storeData }: { onOpen: () => void, storeData: any }) {
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  return (
    <div 
      onClick={onOpen}
      className="grid grid-cols-7 gap-3 cursor-pointer group/timeline"
    >
      {last7Days.map((date, i) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const monthKey = format(date, 'yyyy-MM');
        const isTodayDate = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

        const dayHydration = storeData.fitness?.hydration?.entries?.[dateStr] || [];
        const totalWater = dayHydration.reduce((sum: number, e: any) => sum + e.amount, 0);

        const hasActivity = 
          !!storeData.fitness?.completedSessions?.[dateStr] ||
          storeData.routine?.habitHistory?.some((h: any) => h.date === dateStr && h.done) ||
          totalWater >= 2000 ||
          !!storeData.sleep?.days?.[dateStr]?.wakeAt ||
          storeData.planning?.tasks?.some((t: any) => t.date === dateStr) ||
          storeData.finance?.months?.[monthKey]?.expenses?.some((e: any) => e.date === dateStr);

        return (
          <div key={i} className="flex flex-col items-center gap-3">
            <span className="font-mono text-[8px] uppercase tracking-widest text-white/20">
              {format(date, 'EEE')}
            </span>
            <div className={`relative w-full aspect-square rounded-xl border flex items-center justify-center transition-all duration-500 ${
              isTodayDate 
                ? 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
                : 'bg-white/[0.02] border-white/5 group-hover/timeline:border-white/10'
            }`}>
              {hasActivity && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-1.5 h-1.5 rounded-full ${isTodayDate ? 'bg-blue-400' : 'bg-white/20'}`} 
                />
              )}
              {isTodayDate && (
                <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full blur-[2px]" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SkillNudges({ storeData, onOpen }: { storeData: any, onOpen: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const { planning, work } = storeData;
  
  const todayTasks = planning.tasks.filter((t: any) => t.date === today);
  const planningProgress = todayTasks.length > 0 
    ? (todayTasks.filter((t: any) => t.completed).length / todayTasks.length) * 100 
    : 100;

  const nudges = [];

  if (planningProgress < 50 && todayTasks.length > 0) {
    nudges.push({
      skill: "Discipline",
      text: "Focus on your primary intentions. Micro-training suggested for follow-through.",
      icon: <Target size={14} className="text-amber-400" />
    });
  }

  if (work.tasks.some((t: any) => t.status === 'missed')) {
    nudges.push({
      skill: "Thinking / Clarity",
      text: "Missed objectives detected. Reframe your approach with a clarity prompt.",
      icon: <Brain size={14} className="text-blue-400" />
    });
  }

  if (work.tasks.length > 5) {
    nudges.push({
      skill: "Communication",
      text: "Heavy coordination load. Practice clarity in your next interaction.",
      icon: <MessageSquare size={14} className="text-purple-400" />
    });
  }

  if (nudges.length === 0) return null;

  // Show only one nudge at a time, cycle or pick the most relevant
  const nudge = nudges[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-12 flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/5 rounded-xl">
          {nudge.icon}
        </div>
        <div>
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] block mb-1">Skill Integration • {nudge.skill}</span>
          <p className="text-white/60 text-sm italic">"{nudge.text}"</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-white/20 group-hover:text-white/40 transition-all">
        <span className="text-[10px] font-mono uppercase tracking-widest hidden sm:block">Open Hub</span>
        <ChevronRight size={16} />
      </div>
    </motion.div>
  );
}

export default function Dashboard({ onOpenNeuralTimeline, onOpenSkillHub }: DashboardProps) {
  const settings = useSettings();
  const [currentDate, setCurrentDate] = useState('');
  const [greeting, setGreeting] = useState('');
  const [subtext, setSubtext] = useState('');
  const [timeSegment, setTimeSegment] = useState<TimeSegment>('morning');
  const [showResetPrompt, setShowResetPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  const storeData = useStoreData();

  useEffect(() => {
    setMounted(true);
    performDailyReset();

    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));

      const hour = now.getHours();
      let segment: TimeSegment = 'night';
      if (hour >= 5 && hour < 11) segment = 'morning';
      else if (hour >= 11 && hour < 17) segment = 'midday';
      else if (hour >= 17 && hour < 22) segment = 'evening';
      
      setTimeSegment(segment);

      switch (segment) {
        case 'morning':
          setGreeting('Morning Routine');
          setSubtext('The first hour defines the day.');
          break;
        case 'midday':
          setGreeting('Peak Performance');
          setSubtext('Execution over everything.');
          break;
        case 'evening':
          setGreeting('Evening Reflection');
          setSubtext('Close the loops, clear the mind.');
          break;
        case 'night':
          setGreeting('Rest & Recovery');
          setSubtext('Tomorrow belongs to the well-rested.');
          break;
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    const settings = settingsStore.get();
    if (!settings.dailyResetEnabled && !settings.promptDismissed) {
      setShowResetPrompt(true);
    }

    return () => clearInterval(interval);
  }, []);

  const handleEnableReset = () => {
    const settings = settingsStore.get();
    settingsStore.save({ ...settings, dailyResetEnabled: true, promptDismissed: true });
    setShowResetPrompt(false);
  };

  const handleDismissPrompt = () => {
    const settings = settingsStore.get();
    settingsStore.save({ ...settings, promptDismissed: true });
    setShowResetPrompt(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    const navHeight = 80;
    const offsetPosition = element.offsetTop - navHeight;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const { fitness, work, routine, planning } = storeData;
  const { shouldFreezeMotion, isVisualsDisabled } = useFocusMode();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (shouldFreezeMotion || isVisualsDisabled) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [shouldFreezeMotion, isVisualsDisabled]);

  const todayDate = new Date().toISOString().split('T')[0];
  const completedSessions = fitness.completedSessions || {};
  const daySessions = fitness.daySessions || {};
  const todayCompletedType = completedSessions[todayDate];
  const todaySession = daySessions[todayDate];

  let fitnessStatus = 'Pending';
  let fitnessSubtext = '';
  
  if (todayCompletedType) {
    fitnessStatus = todayCompletedType === 'Rest' ? 'Rest Day' : 'Completed';
    fitnessSubtext = todayCompletedType;
  } else if (todaySession?.status === 'in_progress') {
    fitnessStatus = 'In Progress';
    fitnessSubtext = todaySession.plannedType;
  } else if (fitness.weeklyPlan) {
    const todayPlan = fitness.weeklyPlan.days.find(d => d.dayIndex === new Date().getDay());
    if (todayPlan?.type === 'Rest') {
      fitnessStatus = 'Rest Day';
    } else if (todayPlan) {
      fitnessSubtext = todayPlan.type;
    }
  }
  
  const weeklyFitnessCount = Object.keys(completedSessions).filter(date => {
    const d = new Date(date);
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return d >= weekStart && completedSessions[date] !== 'Rest';
  }).length;

  const pendingTasks = work.tasks.filter(t => t.status === 'pending');
  const carriedTasks = pendingTasks.filter(t => t.carryOverCount > 0);
  const topTask = pendingTasks[0];
  const workMetric = topTask ? topTask.text : 'Deck Clear';
  
  let workSubtext = topTask 
    ? `${work.tasks.filter(t => t.status === 'done').length}/${work.tasks.filter(t => t.status !== 'missed').length} Complete`
    : 'All objectives met';
  
  if (carriedTasks.length > 0) {
    workSubtext = `${carriedTasks.length} objectives carried over`;
  }

  const allRoutineItems = routine.routines.flatMap(r => r.items);
  const routineDone = allRoutineItems.filter(i => i.done).length + routine.habits.filter(h => h.done).length;
  const routineTotal = allRoutineItems.length + routine.habits.length;
  const routineMetric = routineTotal > 0 ? `${routineDone}/${routineTotal}` : 'No Habits';

  const todayPlanningTasks = planning.tasks.filter((t: any) => t.date === todayDate);
  const planningProgress = todayPlanningTasks.length > 0 
    ? (todayPlanningTasks.filter((t: any) => t.completed).length / todayPlanningTasks.length) * 100 
    : 100;

  const fitnessProgress = (weeklyFitnessCount / 5) * 100;
  const routineProgress = routineTotal > 0 ? (routineDone / routineTotal) * 100 : 0;
  const weeklyProgress = Math.round((fitnessProgress + routineProgress + planningProgress) / 3);

  const statusCards = [
    { 
      title: 'Active Body', 
      metric: fitnessStatus, 
      subtext: fitnessSubtext || `${weeklyFitnessCount}/5 this week`,
      icon: <Activity size={20} className="text-emerald-400/60" />,
      targetSection: 'fitness',
      progress: fitnessProgress,
      progressColor: '#34d399'
    },
    { 
      title: 'Main Objective', 
      metric: workMetric.length > 30 ? workMetric.slice(0, 30) + '...' : workMetric, 
      subtext: workSubtext,
      icon: <Target size={20} className="text-amber-400/60" />,
      targetSection: 'work',
      progressColor: '#f59e0b'
    },
    { 
      title: 'Routine Sync', 
      metric: routineMetric, 
      subtext: routineTotal > 0 ? 'Habits & workflows' : 'No active routines',
      icon: <CheckCircle2 size={20} className="text-blue-400/60" />,
      targetSection: 'routine',
      progress: routineProgress,
      progressColor: '#60a5fa'
    },
    { 
      title: 'Overall Velocity', 
      metric: `${weeklyProgress}%`, 
      subtext: 'Weekly aggregate',
      icon: <TrendingUp size={20} className="text-yellow-400/60" />,
      targetSection: 'planning',
      progress: weeklyProgress,
      progressColor: '#facc15'
    },
  ];

  return (
    <section id="dashboard" className="relative min-h-screen flex flex-col justify-center py-24 md:py-32 overflow-hidden bg-[#050505]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        {!isVisualsDisabled && (
          <video
            ref={videoRef}
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/SaveClip.App_AQP_NwbiN4IEUQPiu_MN02kTM5OndBoJY9Xcv-Q3FTGpWN6UcznLBSyg-nKAplCoRhk3ugd4PRggopDowFDBlKjV5ozgII7yE4lqx8o-1767255589645.mp4"
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ${
              shouldFreezeMotion ? 'opacity-20 grayscale' : 'opacity-40'
            } md:w-[100vh] md:h-[100vw] md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:-rotate-90`}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
      </div>

      {/* Atmospheric Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="container relative z-10 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-12">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-8 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/50">
                    {greeting}
                  </span>
                </div>
                
                <h1 className="font-display text-[clamp(48px,8vw,110px)] text-white mb-8 tracking-tighter leading-[0.85]">
                  {currentDate}
                </h1>
                
                <p className="text-white/40 text-xl md:text-2xl font-light tracking-wide max-w-2xl leading-relaxed">
                  {subtext}
                </p>
              </motion.div>

              <div className="lg:col-span-4 hidden lg:block">
                 <div className="relative w-full aspect-square rounded-[3rem] overflow-hidden border border-white/5 bg-[#0a0a0a] group p-10 flex flex-col justify-between">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-purple-500/[0.02]" />
                    
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                            <Flame size={14} className="text-orange-400" />
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">Physical_Consistency_Streak</span>
                        </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-6xl text-white">{fitness.streak || 0}</span>
                        <span className="font-mono text-xs text-white/30 uppercase tracking-widest">Days</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Weekly_Momentum</span>
                        <span className="font-mono text-[11px] text-white/70">{weeklyProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${weeklyProgress}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-white/30 text-[11px] leading-relaxed">
                        System is currently operating at <span className="text-white/70 font-medium">high velocity</span>. Next sync recommended in 4 hours.
                      </p>
                    </div>
                 </div>
              </div>
            </div>

              {/* Daily Signal System */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="mb-12"
              >
                <DailySignal storeData={storeData} />
              </motion.div>

              {/* Skill Nudges */}
              {settings.aiSkillInsights && (
                <SkillNudges storeData={storeData} onOpen={onOpenSkillHub} />
              )}


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">

            {statusCards.map((card, index) => (
              <StatusCard
                key={card.title}
                title={card.title}
                metric={card.metric}
                subtext={card.subtext}
                icon={card.icon}
                delay={400 + index * 100}
                targetSection={card.targetSection}
                onNavigate={scrollToSection}
                colSpan={card.colSpan}
                progress={card.progress}
                progressColor={card.progressColor}
              />
            ))}
          </div>
            
            {/* Neural Timeline Preview Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none">
                <CalendarIcon size={200} />
              </div>
              
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                      <History size={22} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-white tracking-tight">Neural Timeline</h3>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 mt-1">Life Persistence Log</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        // Open Timeline Modal directly to last year
                        onOpenNeuralTimeline();
                      }}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400/5 border border-blue-400/10 text-blue-400 hover:bg-blue-400/10 transition-all cursor-pointer group"
                    >
                      <History size={14} className="group-hover:rotate-[-45deg] transition-transform" />
                      <span className="font-mono text-[9px] uppercase tracking-widest">This Day Last Year</span>
                    </button>
                    <div 
                      onClick={onOpenNeuralTimeline}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <span className="font-mono text-[9px] uppercase tracking-widest text-nowrap">Full Timeline</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>

              <NeuralTimelinePreview onOpen={onOpenNeuralTimeline} storeData={storeData} />
            </motion.div>

          {mounted && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-20 flex justify-center"
            >
              <div className="flex items-center gap-6 group cursor-pointer" onClick={() => scrollToSection('fitness')}>
                <div className="h-px w-20 bg-white/5 group-hover:w-32 transition-all duration-700" />
                <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-white/20 group-hover:text-white/60 transition-colors">
                  INITIALIZE_CORE_SYNC
                </span>
                <div className="h-px w-20 bg-white/5 group-hover:w-32 transition-all duration-700" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showResetPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-[#0f0f0f] border border-white/10 rounded-[1.5rem] p-7 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/10">
                    <RefreshCw size={18} className="text-white/60" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white tracking-tight">System Automation</h4>
                    <p className="text-[10px] text-white/20 font-mono uppercase tracking-wider mt-0.5">Daily Reset Engine</p>
                  </div>
                </div>
                <button 
                  onClick={handleDismissPrompt}
                  className="text-white/20 hover:text-white transition-colors p-1"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-white/40 mb-8 leading-relaxed font-light">
                Synchronize your LifeOS. Automate midnight refreshes for logs, objectives, and habits while archiving performance history.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEnableReset}
                  className="flex-1 bg-white text-black text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-white/90 transition-all active:scale-95"
                >
                  Activate
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="flex-1 bg-white/5 text-white/60 text-[11px] font-bold uppercase tracking-widest py-3.5 rounded-xl hover:bg-white/10 transition-all"
                >
                  Defer
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
