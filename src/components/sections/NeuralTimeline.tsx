"use client";

import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Dumbbell, 
  Droplets, 
  Moon, 
  Target, 
  Wallet,
  LayoutGrid,
  Rows
} from 'lucide-react';
import { 
  fitnessStore, 
  routineStore, 
  planningStore, 
  financeStore, 
  sleepStore, 
  subscribeToStore,
  SleepDay
} from '@/lib/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, isToday } from 'date-fns';

interface DayData {
  date: Date;
  fitness: boolean;
  routine: boolean;
  hydration: boolean;
  sleep: boolean;
  sleepOpacity?: number;
  planning: boolean;
  finance: boolean;
}

export default function NeuralTimeline({ onClose }: NeuralTimelineProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const getSnapshot = useCallback(() => {
    return JSON.stringify({
      fitness: fitnessStore.get(),
      routine: routineStore.get(),
      planning: planningStore.get(),
      finance: financeStore.get(),
      sleep: sleepStore.get(),
    });
  }, []);

  const getServerSnapshot = useCallback(() => JSON.stringify({}), []);
  const storeDataJson = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  const storeData = useMemo(() => {
    try {
      return JSON.parse(storeDataJson);
    } catch (e) {
      return null;
    }
  }, [storeDataJson]);

  const days = useMemo(() => {
    if (!storeData) return [];

    let intervalStart, intervalEnd;
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      intervalStart = startOfWeek(monthStart);
      intervalEnd = endOfWeek(monthEnd);
    } else {
      intervalStart = startOfWeek(currentMonth);
      intervalEnd = endOfWeek(currentMonth);
    }

    const dayInterval = eachDayOfInterval({ start: intervalStart, end: intervalEnd });

      return dayInterval.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const monthKey = format(date, 'yyyy-MM');
        
        const fitness = !!storeData.fitness?.completedSessions?.[dateStr];
        const routine = storeData.routine?.habitHistory?.some((h: any) => h.date === dateStr && h.done) || false;
        
        // Hydration Logic: Only show if >= 2000ml
        const dayHydration = storeData.fitness?.hydration?.entries?.[dateStr] || [];
        const totalWater = dayHydration.reduce((sum: number, e: any) => sum + e.amount, 0);
        const hydration = totalWater >= 2000;

        // Sleep Logic: Variable opacity based on duration (8h = 100%, 4h = 50%, etc)
        const sleepEntry = storeData.sleep?.days?.[dateStr];
        const sleep = !!sleepEntry?.wakeAt;
        let sleepOpacity = 1;
        if (sleep && sleepEntry.sleepAt && sleepEntry.wakeAt) {
          const start = new Date(sleepEntry.sleepAt);
          const end = new Date(sleepEntry.wakeAt);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          sleepOpacity = Math.max(0.3, Math.min(1, hours / 8));
        }

        const planning = storeData.planning?.tasks?.some((t: any) => t.date === dateStr) || false;
        const finance = storeData.finance?.months?.[monthKey]?.expenses?.some((e: any) => e.date === dateStr) || 
                        storeData.finance?.months?.[monthKey]?.fixedExpenses?.some((e: any) => e.date === dateStr) || 
                        storeData.finance?.months?.[monthKey]?.sharedExpenses?.some((e: any) => e.date === dateStr) || false;

        return {
          date,
          fitness,
          routine,
          hydration,
          sleep,
          sleepOpacity,
          planning,
          finance
        };
      });
  }, [currentMonth, viewMode, storeData]);

  const handlePrev = () => {
    if (viewMode === 'month') setCurrentMonth(subMonths(currentMonth, 1));
    else setCurrentMonth(addDays(currentMonth, -7));
  };

  const handleNext = () => {
    if (viewMode === 'month') setCurrentMonth(addMonths(currentMonth, 1));
    else setCurrentMonth(addDays(currentMonth, 7));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(10px)' }}
      exit={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[200] bg-[#050505]/80 overflow-hidden flex flex-col"
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 md:px-12 py-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          <div>
            <h1 className="font-display text-2xl text-white tracking-tight">Neural Timeline</h1>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30 mt-1">Life Persistence Log_v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 rounded-full p-1 border border-white/5">
          <button 
            onClick={() => setViewMode('month')}
            className={`p-2 rounded-full transition-all ${viewMode === 'month' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('week')}
            className={`p-2 rounded-full transition-all ${viewMode === 'week' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            <Rows size={18} />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className="p-2 text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="font-display text-lg text-white min-w-[140px] text-center">
              {format(currentMonth, viewMode === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
            </span>
            <button onClick={handleNext} className="p-2 text-white/40 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 overflow-y-auto px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-4 mb-8">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
                {day}
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 gap-4 ${viewMode === 'week' ? 'auto-rows-fr' : ''}`}>
            {days.map((day, i) => {
              const isSelected = selectedDay && isSameDay(day.date, selectedDay.date);
              const isCurrentMonth = isSameMonth(day.date, currentMonth);
              const isTodayDate = isToday(day.date);

              return (
                <motion.div
                  key={day.date.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.01 }}
                  onClick={() => setSelectedDay(day)}
                  className={`relative aspect-square md:aspect-auto md:min-h-[140px] rounded-2xl border transition-all duration-300 cursor-pointer group flex flex-col p-4 ${
                    isSelected 
                      ? 'bg-white/10 border-white/20' 
                      : isCurrentMonth 
                        ? 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]' 
                        : 'bg-transparent border-transparent opacity-20'
                  } ${isTodayDate ? 'ring-1 ring-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`font-display text-lg ${isTodayDate ? 'text-white' : 'text-white/40'}`}>
                      {format(day.date, 'd')}
                    </span>
                    {isTodayDate && (
                      <span className="font-mono text-[8px] uppercase tracking-widest text-blue-400">Now</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {day.fitness && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Fitness" />}
                    {day.routine && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" title="Routine" />}
                      {day.hydration && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Hydration" />}
                      {day.sleep && (
                        <div 
                          className="w-1.5 h-1.5 rounded-full bg-purple-400" 
                          style={{ opacity: day.sleepOpacity ?? 1 }}
                          title="Sleep" 
                        />
                      )}
                      {day.planning && <div className="w-1.5 h-1.5 rounded-full bg-white/40" title="Planning" />}
                    {day.finance && <div className="w-1.5 h-1.5 rounded-full bg-orange-400" title="Finance" />}
                    
                    {/* Overflow handled implicitly by wrap + max indicators logic (max dots shown visually anyway) */}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Day Detail Drawer */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[210]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[220] flex flex-col shadow-2xl"
            >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl text-white">{format(selectedDay.date, 'EEEE')}</h2>
                    <p className="font-mono text-xs text-white/30 uppercase tracking-widest mt-1">
                      {format(selectedDay.date, 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const lastYear = subDays(selectedDay.date, 365);
                        setCurrentMonth(lastYear);
                        setSelectedDay(days.find(d => isSameDay(d.date, lastYear)) || { 
                          date: lastYear, 
                          fitness: false, routine: false, hydration: false, sleep: false, planning: false, finance: false 
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-mono text-white/40 hover:text-white uppercase tracking-widest transition-all"
                    >
                      Last Year
                    </button>
                    <button 
                      onClick={() => setSelectedDay(null)}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Summary Strip */}
                <div className="grid grid-cols-2 gap-4">
                  <SummaryCard 
                    label="Sleep" 
                    value={getSleepDuration(selectedDay.date, storeData)} 
                    icon={<Moon size={14} />} 
                    color="text-purple-400"
                  />
                  <SummaryCard 
                    label="Workout" 
                    value={getWorkoutType(selectedDay.date, storeData)} 
                    icon={<Dumbbell size={14} />} 
                    color="text-emerald-400"
                  />
                  <SummaryCard 
                    label="Hydration" 
                    value={getHydrationAmount(selectedDay.date, storeData)} 
                    icon={<Droplets size={14} />} 
                    color="text-cyan-400"
                  />
                  <SummaryCard 
                    label="Tasks" 
                    value={getCompletedTasks(selectedDay.date, storeData)} 
                    icon={<Target size={14} />} 
                    color="text-white/60"
                  />
                </div>

                <div className="space-y-6">
                  <SectionTitle title="Historical Activity" />
                  
                  <div className="space-y-4">
                    {getActivityLogs(selectedDay.date, storeData).map((log, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className={`mt-1 w-2 h-2 rounded-full ${log.color}`} />
                        <div>
                          <p className="text-sm text-white/70">{log.text}</p>
                          <span className="font-mono text-[9px] uppercase tracking-widest text-white/20 mt-1 block">
                            {log.category}
                          </span>
                        </div>
                      </div>
                    ))}
                    {getActivityLogs(selectedDay.date, storeData).length === 0 && (
                      <p className="text-xs text-white/20 italic text-center py-8">No significant records found for this day.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SummaryCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
      <div className={`flex items-center gap-2 mb-2 ${color}`}>
        {icon}
        <span className="font-mono text-[9px] uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <p className="text-lg font-display text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/5" />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">{title}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}

// Data Extractors
function getSleepDuration(date: Date, storeData: any): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const sleepDay = storeData?.sleep?.days?.[dateStr];
  if (!sleepDay || !sleepDay.wakeAt || !sleepDay.sleepAt) return 'No Data';
  
  const sleep = new Date(sleepDay.sleepAt);
  const wake = new Date(sleepDay.wakeAt);
  const diff = wake.getTime() - sleep.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

function getWorkoutType(date: Date, storeData: any): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  return storeData?.fitness?.completedSessions?.[dateStr] || 'Rest';
}

function getHydrationAmount(date: Date, storeData: any): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const entries = storeData?.fitness?.hydration?.entries?.[dateStr] || [];
  const total = entries.reduce((sum: number, e: any) => sum + e.amount, 0);
  return total > 0 ? `${(total / 1000).toFixed(1)}L` : '0L';
}

function getCompletedTasks(date: Date, storeData: any): string {
  const dateStr = format(date, 'yyyy-MM-dd');
  const tasks = storeData?.planning?.tasks?.filter((t: any) => t.date === dateStr) || [];
  const completed = tasks.filter((t: any) => t.completed).length;
  return tasks.length > 0 ? `${completed}/${tasks.length}` : '0/0';
}

function getActivityLogs(date: Date, storeData: any): { text: string, category: string, color: string }[] {
  if (!storeData) return [];
  const dateStr = format(date, 'yyyy-MM-dd');
  const monthKey = format(date, 'yyyy-MM');
  const logs: { text: string, category: string, color: string }[] = [];

  // Fitness
  if (storeData.fitness?.completedSessions?.[dateStr]) {
    logs.push({ 
      text: `Completed ${storeData.fitness.completedSessions[dateStr]} session`, 
      category: 'Fitness', 
      color: 'bg-emerald-400' 
    });
  }

  // Habits
  const doneHabits = storeData.routine?.habitHistory?.filter((h: any) => h.date === dateStr && h.done) || [];
  doneHabits.forEach((h: any) => {
    const habitLabel = storeData.routine.habits.find((habit: any) => habit.id === h.habitId)?.label || 'Habit';
    logs.push({ 
      text: `Mastered habit: ${habitLabel}`, 
      category: 'Routine', 
      color: 'bg-blue-400' 
    });
  });

  // Finance
  const monthFinance = storeData.finance?.months?.[monthKey];
  const expenses = monthFinance?.expenses?.filter((e: any) => e.date === dateStr) || [];
  expenses.forEach((e: any) => {
    logs.push({ 
      text: `Logged expense: ${e.category} (${e.amount})`, 
      category: 'Finance', 
      color: 'bg-orange-400' 
    });
  });

  // Planning
  const completedTasks = storeData.planning?.tasks?.filter((t: any) => t.date === dateStr && t.completed) || [];
  completedTasks.forEach((t: any) => {
    logs.push({ 
      text: `Achieved intention: ${t.text}`, 
      category: 'Planning', 
      color: 'bg-white/40' 
    });
  });

  return logs;
}
