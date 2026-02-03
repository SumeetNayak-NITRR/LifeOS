"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Dumbbell, Heart, Footprints, Circle, Bed, Flame, 
  ChevronRight, ChevronDown, History, Timer, Play, Pause, RotateCcw, CheckCircle2,
  Plus, Trash2, X, Lock, Calendar, Droplets, AlertTriangle, ListChecks, Check, Info, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fitnessStore, 
  FitnessData, 
  calculateFitnessStreak,
  WorkoutType,
  WeeklyWorkoutPlan,
  DayWorkoutPlan,
  DaySession,
  SessionStatus,
  HydrationEntry,
  getWeekStartDate,
  isWeeklyPlanLocked,
  getDefaultWeeklyPlan,
  Exercise
} from '@/lib/store';
import { useFocusMode } from '@/hooks/useFocusMode';

const WORKOUT_TYPES: { id: WorkoutType; label: string; icon: React.ReactNode }[] = [
  { id: 'Strength', label: 'Strength', icon: <Dumbbell size={16} /> },
  { id: 'Cardio', label: 'Cardio', icon: <Heart size={16} /> },
  { id: 'Mobility', label: 'Mobility', icon: <Footprints size={16} /> },
  { id: 'Football', label: 'Football', icon: <Circle size={16} /> },
  { id: 'Rest', label: 'Rest', icon: <Bed size={16} /> },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function WorkoutTimer({ initialTime = 60 }: { initialTime?: number }) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-2 border border-white/5 backdrop-blur-sm">
      <Timer size={14} className="text-white/40" />
      <span className="font-mono text-xs tabular-nums text-white/80 w-12 tracking-wider">{formatTime(timeLeft)}</span>
      <div className="flex items-center gap-2 border-l border-white/10 pl-4">
        <button onClick={toggleTimer} className="text-white/40 hover:text-white transition-colors">
          {isActive ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button onClick={resetTimer} className="text-white/40 hover:text-white transition-colors">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  );
}

export default function FitnessCenter() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<FitnessData | null>(null);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<DayWorkoutPlan[]>([]);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
    const [showQuestion, setShowQuestion] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState<'plan' | 'football' | null>('plan');
    const [isPulsing, setIsPulsing] = useState(false);
    const [isExpandedManual, setIsExpandedManual] = useState<boolean | null>(null);
    const { isVisualsDisabled } = useFocusMode();

  const today = new Date();
  const todayDate = today.toISOString().split('T')[0];
  const todayDayIndex = today.getDay();
  const currentWeekStart = getWeekStartDate(today);

  useEffect(() => {
    const fitnessData = fitnessStore.get();
    
    if (!fitnessData.weeklyPlan || fitnessData.weeklyPlan.weekStartDate !== currentWeekStart) {
      const newPlan = getDefaultWeeklyPlan();
      fitnessData.weeklyPlan = newPlan;
      fitnessStore.save(fitnessData);
    }
    
    setData(fitnessData);
    setMounted(true);
  }, [currentWeekStart]);

  const weeklyPlan = data?.weeklyPlan;
  const daySessions = data?.daySessions || {};

  const todayPlan = useMemo(() => {
    if (!weeklyPlan) return null;
    return weeklyPlan.days.find(d => d.dayIndex === todayDayIndex) || null;
  }, [weeklyPlan, todayDayIndex]);

  const todaySession = daySessions[todayDate];
  const isPlanLocked = isWeeklyPlanLocked(weeklyPlan);
  const streak = useMemo(() => {
    if (!data) return 0;
    return calculateFitnessStreak(data.completedSessions || {});
  }, [data]);

  const [previewDay, setPreviewDay] = useState<number | null>(null);

  const saveData = useCallback((updates: Partial<FitnessData>) => {
    const current = fitnessStore.get();
    const newData = { ...current, ...updates };
    fitnessStore.save(newData);
    setData(newData);
  }, []);

  const handleOpenPlanEditor = () => {
    if (weeklyPlan) {
      setEditingPlan([...weeklyPlan.days]);
    } else {
      setEditingPlan(getDefaultWeeklyPlan().days);
    }
    setShowPlanEditor(true);
  };

  const handleSavePlan = () => {
    const newPlan: WeeklyWorkoutPlan = {
      weekStartDate: currentWeekStart,
      days: editingPlan,
      lockedAt: new Date().toISOString(),
      planningDay: weeklyPlan?.planningDay ?? 0,
    };
    saveData({ weeklyPlan: newPlan });
    setShowPlanEditor(false);
    setShowQuestion(true);
  };

  const handleResetPlan = () => {
    if (!weeklyPlan) return;
    const unlockedPlan: WeeklyWorkoutPlan = {
      ...weeklyPlan,
      lockedAt: null,
    };
    saveData({ weeklyPlan: unlockedPlan });
    setShowResetConfirm(false);
  };

  const handleUpdateDayPlan = (dayIndex: number, updates: Partial<DayWorkoutPlan>) => {
    setEditingPlan(prev => prev.map(d => 
      d.dayIndex === dayIndex ? { ...d, ...updates } : d
    ));
  };

  const handleAddExercise = (dayIndex: number) => {
    const newExercise: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
    };
    setEditingPlan(prev => prev.map(d => 
      d.dayIndex === dayIndex 
        ? { ...d, exercises: [...(d.exercises || []), newExercise] } 
        : d
    ));
  };

  const handleUpdateExercise = (dayIndex: number, exerciseId: string, updates: Partial<Exercise>) => {
    setEditingPlan(prev => prev.map(d => 
      d.dayIndex === dayIndex 
        ? { 
            ...d, 
            exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, ...updates } : e) 
          } 
        : d
    ));
  };

  const handleRemoveExercise = (dayIndex: number, exerciseId: string) => {
    setEditingPlan(prev => prev.map(d => 
      d.dayIndex === dayIndex 
        ? { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) } 
        : d
    ));
  };

  const handleStartSession = () => {
    if (!todayPlan || todaySession?.status === 'completed') return;
    
    // If it's a rest day, clicking start (Log Recovery) immediately completes it
    if (todayPlan.type === 'Rest') {
      const session: DaySession = {
        date: todayDate,
        plannedType: todayPlan.type,
        status: 'completed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        completedExercises: [],
      };
      
      const updatedCompletedSessions = {
        ...(data?.completedSessions || {}),
        [todayDate]: todayPlan.type,
      };

      saveData({ 
        daySessions: { ...daySessions, [todayDate]: session },
        completedSessions: updatedCompletedSessions,
        streak: calculateFitnessStreak(updatedCompletedSessions),
      });
      return;
    }

    const session: DaySession = {
      date: todayDate,
      plannedType: todayPlan.type,
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      completedExercises: [],
    };
    saveData({ daySessions: { ...daySessions, [todayDate]: session } });
    setSessionInProgress(true);
  };

  const handleToggleExercise = (exerciseId: string) => {
    if (!todaySession || todaySession.status === 'completed') return;
    
    const completed = todaySession.completedExercises || [];
    const newCompleted = completed.includes(exerciseId)
      ? completed.filter(id => id !== exerciseId)
      : [...completed, exerciseId];
    
    const updatedSession: DaySession = {
      ...todaySession,
      completedExercises: newCompleted,
    };

    saveData({ daySessions: { ...daySessions, [todayDate]: updatedSession } });
  };

    const handleCompleteSession = () => {
      if (!todayPlan || !todaySession || todaySession.status === 'completed') return;
      
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 800);

      const completedSession: DaySession = {
      ...todaySession,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    const updatedCompletedSessions = {
      ...(data?.completedSessions || {}),
      [todayDate]: todayPlan.type,
    };

    const newStreak = calculateFitnessStreak(updatedCompletedSessions);

    saveData({ 
      daySessions: { ...daySessions, [todayDate]: completedSession },
      completedSessions: updatedCompletedSessions,
      streak: newStreak,
    });
    setSessionInProgress(false);
    setIsExpandedManual(false); // Auto-collapse on finalization
    setActiveAccordion(null); // Collapse side panel on finalization
  };

  const getSessionStatusLabel = (status: SessionStatus | undefined): string => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'Active';
      case 'skipped': return 'Skipped';
      default: return 'Not Started';
    }
  };

  if (!mounted || !data) {
    return <section id="fitness" className="relative py-32 overflow-hidden min-h-screen bg-[#050505]" />;
  }

  const warmups = todayPlan?.exercises.filter(e => e.isWarmup) || [];
  const mainExercises = todayPlan?.exercises.filter(e => !e.isWarmup) || [];
  const isExpanded = todaySession?.status === 'in_progress' || isExpandedManual === true;

  return (
    <section id="fitness" className="relative py-32 overflow-hidden bg-[#050505]">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6">
                  <Dumbbell size={10} className="text-white/60" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/60">
                    Module 01 / Physical Engine
                  </span>
                </div>
                <h2 className="font-display text-[clamp(40px,6vw,72px)] text-white tracking-tighter leading-[0.9] mb-4">
                  Fitness Center
                </h2>
                <p className="text-white/40 text-lg font-light tracking-wide max-w-xl">
                  The body is the vehicle for the mind. Performance requires precision.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-1">Elite Streak</p>
                  <div className="flex items-center gap-2 justify-end">
                    <Flame size={16} className="text-white/60" />
                    <span className="text-2xl font-display text-white">{streak}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all duration-500 hover:rotate-6"
                >
                  <History size={20} className="text-white/60" />
                </button>
              </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Session View */}
              <div className="lg:col-span-8">
                <motion.div
                  layout
                  animate={isPulsing ? { scale: [1, 1.02, 1], boxShadow: ["0 0 0px rgba(255, 255, 255, 0)", "0 0 30px rgba(255, 255, 255, 0.1)", "0 0 0px rgba(255, 255, 255, 0)"] } : {}}
                  transition={{ duration: 0.8 }}
                  className="relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 overflow-hidden group shadow-2xl"
                >
                  {/* Accent line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 transition-colors group-hover:border-white/20">
                        {WORKOUT_TYPES.find(t => t.id === todayPlan?.type)?.icon || <Activity size={24} />}
                      </div>
                      <div>
                        <h3 className="font-display text-2xl text-white tracking-tight">
                          {todayPlan?.type || 'Rest Day'}
                        </h3>
                        <p className="text-white/45 text-xs font-mono uppercase tracking-widest mt-1">
                          {FULL_DAY_NAMES[todayDayIndex]}
                        </p>
                      </div>
                    </div>
                    
                        {todaySession?.status !== 'completed' && (
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <button 
                                onClick={() => setIsExpandedManual(false)}
                                className="p-2 text-white/35 hover:text-white transition-colors"
                              >
                                <ChevronDown size={24} />
                              </button>
                            ) : (
                              <button 
                                onClick={handleStartSession}
                                className="px-6 py-3 bg-white text-black rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                              >
                                {todayPlan?.type === 'Rest' ? <Check size={14} /> : <Play size={14} fill="currentColor" />}
                                {todayPlan?.type === 'Rest' ? 'Log Recovery' : 'Initialize'}
                              </button>
                            )}
                          </div>
                        )}
                      
                      {todaySession?.status === 'completed' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <CheckCircle2 size={14} className="text-emerald-400" />
                          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Finalized</span>
                        </div>
                      )}

                  </div>

                  <AnimatePresence mode="wait">
                    {isExpanded ? (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-white/35 text-[10px] font-mono uppercase tracking-[0.2em]">Target Intensity</p>
                            <p className="text-white/65 text-sm font-light">{todayPlan?.name || 'Standard Protocol'}</p>
                          </div>
                          <WorkoutTimer />
                        </div>

                        <div className="space-y-4">
                          {mainExercises.map((ex, idx) => {
                            const isCompleted = todaySession?.completedExercises?.includes(ex.id);
                            return (
                              <div 
                                key={ex.id}
                                className={`group relative flex items-center justify-between p-6 rounded-2xl border transition-all duration-700 ${
                                  isCompleted 
                                    ? 'bg-white/[0.02] border-white/20' 
                                    : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                                }`}
                              >
                                <div className="flex items-center gap-6">
                                  <button
                                    onClick={() => handleToggleExercise(ex.id)}
                                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                                      isCompleted 
                                        ? 'bg-white border-white text-black rotate-[360deg]' 
                                        : 'border-white/20 hover:border-white/40 text-transparent'
                                    }`}
                                  >
                                    <Check size={20} strokeWidth={3} />
                                  </button>
                                  <div>
                                    <h4 className={`text-lg font-light tracking-tight transition-colors duration-500 ${isCompleted ? 'text-white/40 line-through' : 'text-white/90'}`}>
                                      {ex.name}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1.5 opacity-55">
                                      {ex.sets && <span className="text-[10px] font-mono tracking-widest uppercase">{ex.sets} Sets</span>}
                                      {(ex.reps || ex.time) && <span className="text-[10px] font-mono tracking-widest uppercase">{ex.reps || ex.time}</span>}
                                    </div>
                                  </div>
                                </div>
                                {ex.notes && (
                                  <p className="hidden md:block text-[10px] font-mono uppercase tracking-widest text-white/20 group-hover:text-white/45 transition-colors">
                                    {ex.notes}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${todaySession?.status === 'in_progress' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-white/45">
                              {getSessionStatusLabel(todaySession?.status)}
                            </span>
                          </div>
                          {todaySession?.status === 'in_progress' && (
                            <button
                              onClick={handleCompleteSession}
                              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all active:scale-95"
                            >
                              Finalize Session
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center"
                      >
                        <div className="w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10 mb-8 transition-colors group-hover:border-white/20">
                          {todayPlan?.type === 'Rest' ? <Bed size={32} className="text-white/20" /> : <Dumbbell size={32} className="text-white/20" />}
                        </div>
                          <h4 className="text-white/45 text-sm font-light tracking-widest uppercase">
                            {todayPlan?.type === 'Rest' 
                              ? 'Protocol: Optimal Recovery' 
                              : todaySession?.status === 'completed' 
                                ? 'Session Completed' 
                                : 'Awaiting Initialization'}
                          </h4>

                        {todayPlan?.type !== 'Rest' && (
                          <p className="text-white/20 text-xs mt-4 font-mono">Select Initialize to begin your session</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Right Panel - Weekly View & Accordion */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
                      System Support
                    </h3>
                  </div>

                  <div className="space-y-4 flex-1">
                    {/* Weekly Plan Accordion */}
                    <div className="border border-white/5 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setActiveAccordion(activeAccordion === 'plan' ? null : 'plan')}
                        className={`w-full flex items-center justify-between p-5 transition-colors ${activeAccordion === 'plan' ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-white/45" />
                          <span className="text-[11px] font-mono uppercase tracking-widest text-white/80">Weekly Plan Preview</span>
                        </div>
                        <ChevronDown size={14} className={`text-white/20 transition-transform ${activeAccordion === 'plan' ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeAccordion === 'plan' && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 pt-2 space-y-6 border-t border-white/5">
                              <div className="grid grid-cols-7 gap-1">
                                {DAY_NAMES.map((day, idx) => {
                                  const isToday = idx === todayDayIndex;
                                  const isSelected = previewDay === idx;
                                  return (
                                    <button 
                                      key={day}
                                      onClick={() => setPreviewDay(previewDay === idx ? null : idx)}
                                      className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                                        isSelected ? 'bg-white/10' : isToday ? 'bg-white/5' : 'hover:bg-white/[0.02]'
                                      }`}
                                    >
                                      <span className={`text-[8px] font-mono mb-1 ${isSelected || isToday ? 'text-white' : 'text-white/20'}`}>{day}</span>
                                      <div className={isSelected || isToday ? 'text-white' : 'text-white/35'}>
                                        {WORKOUT_TYPES.find(t => t.id === weeklyPlan?.days.find(d => d.dayIndex === idx)?.type)?.icon || <Bed size={10} />}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="min-h-[120px]">
                                {previewDay !== null ? (
                                  <div className="space-y-3">
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-white/35">{FULL_DAY_NAMES[previewDay]} Protocol</p>
                                    <div className="space-y-2">
                                      {weeklyPlan?.days.find(d => d.dayIndex === previewDay)?.exercises
                                        .filter(ex => !ex.isWarmup)
                                        .map(ex => (
                                          <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                                            <span className="text-[11px] text-white/55 font-light">{ex.name}</span>
                                            <span className="text-[9px] font-mono text-white/25">{ex.reps || ex.time}</span>
                                          </div>
                                        ))
                                      }
                                      {weeklyPlan?.days.find(d => d.dayIndex === previewDay)?.exercises.filter(ex => !ex.isWarmup).length === 0 && (
                                        <p className="text-[10px] text-white/20 italic">No exercises scheduled</p>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center py-8">
                                    <div className="w-1 h-1 rounded-full bg-white/20 mb-3" />
                                    <p className="text-[9px] font-mono uppercase tracking-widest text-white/20">Select day for preview</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Football Micro-Training Accordion */}
                    <div className="border border-white/5 rounded-2xl overflow-hidden">
                      <button 
                        onClick={() => setActiveAccordion(activeAccordion === 'football' ? null : 'football')}
                        className={`w-full flex items-center justify-between p-5 transition-colors ${activeAccordion === 'football' ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Circle size={16} className="text-white/45" />
                          <span className="text-[11px] font-mono uppercase tracking-widest text-white/80">Football Micro-Training</span>
                        </div>
                        <ChevronDown size={14} className={`text-white/20 transition-transform ${activeAccordion === 'football' ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {activeAccordion === 'football' && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 pt-2 space-y-4 border-t border-white/5">
                              <p className="text-[11px] text-white/45 leading-relaxed font-light">Optional technical drills for maintenance and skill refinement.</p>
                              <div className="space-y-3">
                                {[
                                  { name: 'Ball Feeling', detail: '10 mins - static touches' },
                                  { name: 'Wall Passing', detail: '50 reps each foot' },
                                  { name: 'Cone Weaving', detail: '5 sets - tight control' },
                                  { name: 'Juggling Protocol', detail: '3 min AMRAP' }
                                ].map((drill) => (
                                  <div key={drill.name} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                                    <span className="text-[11px] text-white/65 font-light">{drill.name}</span>
                                    <span className="text-[9px] font-mono text-white/25 uppercase">{drill.detail}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-white/5">
                    <button 
                      onClick={isPlanLocked ? () => setShowResetConfirm(true) : handleOpenPlanEditor}
                      className="w-full flex items-center justify-between px-6 py-3 bg-white/[0.03] border border-white/10 rounded-xl group hover:border-white/20 transition-all"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/45 group-hover:text-white/80 transition-colors">
                        {isPlanLocked ? 'Unlock Strategy' : 'Configure Routine'}
                      </span>
                      <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Plan Editor Modal */}
      <AnimatePresence>
        {showPlanEditor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[110] flex items-center justify-center p-4"
            onClick={() => setShowPlanEditor(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 md:p-12 w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-3xl font-display text-white tracking-tight">Configure Routine</h3>
                  <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest mt-2">Operational Protocol v2.0</p>
                </div>
                <button 
                  onClick={() => setShowPlanEditor(false)}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-6">
                {editingPlan.map((day) => (
                  <div key={day.dayIndex} className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                    <button 
                      onClick={() => setExpandedDay(expandedDay === day.dayIndex ? null : day.dayIndex)}
                      className="w-full flex items-center justify-between p-6 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-6">
                        <span className="text-white/80 font-display text-lg w-28 text-left">{FULL_DAY_NAMES[day.dayIndex]}</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                          {WORKOUT_TYPES.find(t => t.id === day.type)?.icon}
                          <span className="text-[9px] uppercase font-mono tracking-widest text-white/40">{day.type}</span>
                        </div>
                      </div>
                      <ChevronDown size={20} className={`text-white/20 transition-transform ${expandedDay === day.dayIndex ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {expandedDay === day.dayIndex && (
                      <div className="p-8 border-t border-white/5 space-y-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="grid grid-cols-5 gap-3">
                          {WORKOUT_TYPES.map(type => (
                            <button
                              key={type.id}
                              onClick={() => handleUpdateDayPlan(day.dayIndex, { type: type.id })}
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-500 ${
                                day.type === type.id 
                                  ? 'bg-white text-black shadow-lg shadow-white/10' 
                                  : 'bg-white/5 text-white/20 hover:bg-white/10'
                              }`}
                            >
                              {type.icon}
                              <span className="text-[9px] font-mono uppercase tracking-widest">{type.label}</span>
                            </button>
                          ))}
                        </div>

                        {day.type !== 'Rest' && (
                          <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] ml-1">Routine Label</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Foundation Strength"
                                  value={day.name || ''}
                                  onChange={(e) => handleUpdateDayPlan(day.dayIndex, { name: e.target.value })}
                                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em] ml-1">Focus Zone</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Posterior Chain"
                                  value={day.focusArea || ''}
                                  onChange={(e) => handleUpdateDayPlan(day.dayIndex, { focusArea: e.target.value })}
                                  className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all"
                                />
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between ml-1">
                                <label className="text-[9px] font-mono text-white/20 uppercase tracking-[0.3em]">Execution Steps</label>
                                <button 
                                  onClick={() => handleAddExercise(day.dayIndex)}
                                  className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                                >
                                  <Plus size={12} /> Add Objective
                                </button>
                              </div>
                              
                                <div className="space-y-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                                  {day.exercises.map((ex) => (
                                    <div key={ex.id} className="flex gap-3 group min-w-[400px]">
                                      <input
                                        type="text"
                                        placeholder="Objective name"
                                        value={ex.name}
                                        onChange={(e) => handleUpdateExercise(day.dayIndex, ex.id, { name: e.target.value })}
                                        className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Metrics"
                                        value={ex.reps || ex.time || ''}
                                        onChange={(e) => handleUpdateExercise(day.dayIndex, ex.id, { reps: e.target.value })}
                                        className="w-32 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white/20 transition-all shrink-0"
                                      />
                                      <button 
                                        onClick={() => handleRemoveExercise(day.dayIndex, ex.id)}
                                        className="p-3 text-white/10 hover:text-red-400/40 transition-colors shrink-0"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-end gap-6">
                <button 
                  onClick={() => setShowPlanEditor(false)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePlan}
                  className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all active:scale-[0.98] shadow-2xl"
                >
                  Commit Strategy
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </section>
  );
}
