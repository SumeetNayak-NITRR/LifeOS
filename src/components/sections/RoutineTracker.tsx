"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Check, Plus, Trash2, X, TrendingUp, Calendar, Zap, Settings, Edit2 } from 'lucide-react';
import { ZapIcon } from '@/components/ui/ZapIcon';
import { routineStore, RoutineData } from '@/lib/store';
import { useFocusMode } from '@/hooks/useFocusMode';
import SleepWakeTracker from './SleepWakeTracker';

interface HabitItem {
  id: string;
  label: string;
  done: boolean;
}

interface RoutineBlock {
  id: string;
  title: string;
  items: HabitItem[];
}

function HabitTrends({ habits, history }: { habits: HabitItem[], history: any[] }) {
  const last7Days = useMemo(() => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    
    // Start from today or yesterday depending on if today is done
    let checkDate = new Date();
    if (habit?.done) {
      streak++;
    }
    checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const wasDone = history.some(h => h.date === dateStr && h.habitId === habitId && h.done);
      if (wasDone) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
      if (streak > 365) break; // Safety
    }
    return streak;
  };

  const calculateConsistency = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    let doneCount = habit?.done ? 1 : 0;
    const past6Days = last7Days.slice(0, 6);
    
    past6Days.forEach(date => {
      if (history.some(h => h.date === date && h.habitId === habitId && h.done)) {
        doneCount++;
      }
    });
    
    return Math.round((doneCount / 7) * 100);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-display text-xl text-white">System Consistency</h3>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">7-Day Neural Performance</p>
          </div>
        </div>
        <div className="flex gap-2">
          {last7Days.map(date => (
            <div key={date} className="flex flex-col items-center gap-2">
              <span className="text-[8px] font-mono text-white/20 uppercase">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
              </span>
              <div className="w-8 h-1 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {habits.map(habit => {
          const streak = calculateStreak(habit.id);
          const consistency = calculateConsistency(habit.id);
          
          return (
            <div key={habit.id} className="bg-white/[0.01] border border-white/5 rounded-xl p-5 hover:bg-white/[0.02] transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{habit.label}</span>
                    {streak >= 3 && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400/60 bg-amber-400/5 px-2 py-0.5 rounded-full border border-amber-400/10">
                        <Zap size={8} /> {streak} DAY STREAK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${consistency}%` }}
                        className="h-full bg-emerald-500/40" 
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/30">{consistency}%</span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  {last7Days.map(date => {
                    const isToday = date === new Date().toISOString().split('T')[0];
                    const wasDone = isToday 
                      ? habit.done 
                      : history.some(h => h.date === date && h.habitId === habit.id && h.done);
                    
                    return (
                      <div 
                        key={date}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-500 ${
                          wasDone 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-white/[0.02] border-white/5 text-white/10 group-hover:border-white/10'
                        }`}
                      >
                        {wasDone ? <Check size={14} /> : <div className="w-1 h-1 rounded-full bg-white/5" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl">
            <TrendingUp size={24} className="text-white/10 mb-3" />
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/20">No habits tracked in system</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HabitCheckmark({ done, color = "emerald" }: { done: boolean, color?: string }) {
  const colors = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
    amber: "text-amber-400 border-amber-500/20 bg-amber-400/10",
  };

  return (
    <div className={`relative w-6 h-6 rounded-lg border transition-all duration-500 flex items-center justify-center ${
      done ? colors[color as keyof typeof colors] : "border-white/10 bg-white/[0.03]"
    }`}>
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: -45 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check size={14} strokeWidth={3} />
            <motion.div 
              initial={{ opacity: 1, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              className="absolute inset-0 bg-white rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RoutineTracker() {
    const [mounted, setMounted] = useState(false);
    const [routines, setRoutines] = useState<RoutineBlock[]>([]);
    const [habits, setHabits] = useState<HabitItem[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [newStepTexts, setNewStepTexts] = useState<Record<string, string>>({});
    const [newHabitText, setNewHabitText] = useState('');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [isManageMode, setIsManageMode] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const { isVisualsDisabled } = useFocusMode();

    useEffect(() => {
      const data = routineStore.get();
      setRoutines(data.routines);
      setHabits(data.habits);
      setHistory(data.habitHistory || []);
      setMounted(true);
    }, []);

    const saveData = useCallback((updates: Partial<RoutineData>) => {
      const current = routineStore.get();
      routineStore.save({ ...current, ...updates });
    }, []);

    const toggleRoutineItem = (routineId: string, itemId: string) => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 600);
      const updatedRoutines = routines.map(routine => 
        routine.id === routineId 
          ? {
              ...routine,
              items: routine.items.map(item =>
                item.id === itemId ? { ...item, done: !item.done } : item
              )
            }
          : routine
      );
      setRoutines(updatedRoutines);
      saveData({ routines: updatedRoutines });
    };

  const addRoutineStep = (routineId: string, e?: React.FormEvent) => {
    e?.preventDefault();
    const text = newStepTexts[routineId];
    if (!text?.trim()) return;

    const newStep: HabitItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: text.trim(),
      done: false
    };

    const updatedRoutines = routines.map(r => 
      r.id === routineId ? { ...r, items: [...r.items, newStep] } : r
    );
    setRoutines(updatedRoutines);
    saveData({ routines: updatedRoutines });
    setNewStepTexts(prev => ({ ...prev, [routineId]: '' }));
  };

  const deleteRoutineStep = (routineId: string, itemId: string) => {
    const updatedRoutines = routines.map(r => 
      r.id === routineId ? { ...r, items: r.items.filter(i => i.id !== itemId) } : r
    );
    setRoutines(updatedRoutines);
    saveData({ routines: updatedRoutines });
  };

  const updateRoutineStep = (routineId: string, itemId: string, label: string) => {
    const updatedRoutines = routines.map(r => 
      r.id === routineId ? {
        ...r,
        items: r.items.map(i => i.id === itemId ? { ...i, label } : i)
      } : r
    );
    setRoutines(updatedRoutines);
    saveData({ routines: updatedRoutines });
  };

  const toggleHabit = (habitId: string) => {
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, done: !habit.done } : habit
    );
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits });
  };

  const addHabit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newHabitText.trim() || habits.length >= 4) return;

    const newHabit: HabitItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: newHabitText.trim(),
      done: false
    };

    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits });
    setNewHabitText('');
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter(h => h.id !== id);
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits });
  };

  const updateHabit = (id: string, label: string) => {
    const updatedHabits = habits.map(h => h.id === id ? { ...h, label } : h);
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits });
  };

  const getIcon = (routineId: string) => {
    if (routineId === 'morning') return <Sun size={16} className="text-amber-400/60" />;
    return <Moon size={16} className="text-blue-400/60" />;
  };

  const totalItems = routines.reduce((acc, r) => acc + r.items.length, 0) + habits.length;
  const completedItems = routines.reduce((acc, r) => acc + r.items.filter(i => i.done).length, 0) + habits.filter(h => h.done).length;

  if (!mounted) {
    return <section id="routine" className="relative py-32 overflow-hidden min-h-screen" />;
  }

    return (
      <section id="routine" className="relative py-20 md:py-32 overflow-hidden bg-[#050505]">
        {/* Section Header Background Image */}
        {!isVisualsDisabled && (
          <div className="absolute top-0 left-0 w-full h-64 md:h-80 z-0 overflow-hidden">
            <img 
              src="/images/RoutineTracker/Routine.jpg" 
              alt="Morning Background"
              className="w-full h-full object-cover opacity-[0.08] grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
          </div>
        )}

        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 md:mb-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45 block mb-2">
                Module 03 / System Calibration
              </span>
              <h2 className="font-display text-[clamp(28px,4vw,48px)] text-white tracking-tight">
                Routine & Habits
              </h2>
            </div>

            <div className="mb-12">
              <SleepWakeTracker />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {routines.map((routine) => (
                <div key={routine.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 md:p-8 flex flex-col group/card shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/card:border-white/20 transition-colors">
                        {getIcon(routine.id)}
                      </div>
                      <h3 className="font-mono text-[11px] uppercase tracking-wider text-white/45">
                        {routine.title}
                      </h3>
                    </div>
                    <form onSubmit={(e) => addRoutineStep(routine.id, e)} className="relative group/add">
                      <input
                        type="text"
                        value={newStepTexts[routine.id] || ''}
                        onChange={(e) => setNewStepTexts(prev => ({ ...prev, [routine.id]: e.target.value }))}
                        placeholder="+"
                        className="w-8 h-8 bg-white/[0.03] border border-white/10 rounded-lg text-center text-xs text-white placeholder:text-white/20 focus:w-28 md:focus:w-32 focus:outline-none focus:border-white/20 transition-all"
                      />
                    </form>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    {routine.items.map((item) => (
                      <div key={item.id} className="group relative">
                        <motion.div 
                          animate={isPulsing && item.done ? { scale: [1, 1.02, 1] } : {}}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-lg transition-all duration-300 ${
                            item.done 
                              ? 'bg-white/[0.02] opacity-60' 
                              : 'bg-white/[0.01] hover:bg-white/[0.03] border border-transparent hover:border-white/5'
                          }`}
                        >
                            <button
                              onClick={() => toggleRoutineItem(routine.id, item.id)}
                              className="shrink-0"
                            >
                              <HabitCheckmark 
                                done={item.done} 
                                color={routine.id === 'morning' ? 'amber' : 'blue'} 
                              />
                            </button>
                          
                          {editingItemId === item.id ? (
                            <input
                              autoFocus
                              value={item.label}
                              onChange={(e) => updateRoutineStep(routine.id, item.id, e.target.value)}
                              onBlur={() => setEditingItemId(null)}
                              onKeyDown={(e) => e.key === 'Enter' && setEditingItemId(null)}
                              className="bg-transparent text-sm text-white focus:outline-none flex-1 font-light"
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingItemId(item.id)}
                              className={`text-sm cursor-text flex-1 transition-all duration-300 font-light ${
                                item.done ? 'text-white/35 line-through' : 'text-white/80'
                              }`}
                            >
                              {item.label}
                            </span>
                          )}
                          
                          <button
                            onClick={() => deleteRoutineStep(routine.id, item.id)}
                            className="p-1 text-white/10 hover:text-red-400/60 transition-all shrink-0 md:opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </motion.div>
                      </div>
                    ))}
                    {routine.items.length === 0 && (
                      <p className="text-white/20 text-[10px] italic text-center py-4">No protocol steps defined</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-mono text-white/35 uppercase tracking-widest">
                      <span>Log: {routine.items.filter(i => i.done).length}/{routine.items.length}</span>
                      <span>
                        {routine.items.length > 0 ? Math.round((routine.items.filter(i => i.done).length / routine.items.length) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}

                <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 md:p-8 flex flex-col group/card shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/card:border-white/20 transition-colors">
                        <TrendingUp size={16} className="text-emerald-400/60" />
                      </div>
                      <h3 className="font-mono text-[11px] uppercase tracking-wider text-white/45">
                        Key Habits
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsManageMode(!isManageMode)}
                        className={`p-1.5 rounded-lg border transition-all ${isManageMode ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/20 hover:text-white/40'}`}
                      >
                        <Settings size={14} />
                      </button>
                      {habits.length < 4 && (
                        <form onSubmit={addHabit} className="relative group/add">
                          <input
                            type="text"
                            value={newHabitText}
                            onChange={(e) => setNewHabitText(e.target.value)}
                            placeholder="+"
                            className="w-8 h-8 bg-white/[0.03] border border-white/10 rounded-lg text-center text-xs text-white placeholder:text-white/20 focus:w-28 md:focus:w-32 focus:outline-none focus:border-white/20 transition-all"
                          />
                        </form>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 flex-1">
                    {habits.map((habit) => (
                      <div key={habit.id} className="group relative">
                        <motion.div 
                          animate={isPulsing && habit.done ? { scale: [1, 1.02, 1] } : {}}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-lg transition-all duration-300 ${
                            habit.done 
                              ? 'bg-white/[0.02] opacity-60' 
                              : 'bg-white/[0.01] hover:bg-white/[0.03] border border-transparent hover:border-white/5'
                          }`}
                        >
                              <button
                                onClick={() => toggleHabit(habit.id)}
                                className="shrink-0"
                              >
                                <HabitCheckmark 
                                  done={habit.done} 
                                  color="emerald" 
                                />
                              </button>
                          
                          {editingItemId === habit.id || isManageMode ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                autoFocus={editingItemId === habit.id}
                                value={habit.label}
                                onChange={(e) => updateHabit(habit.id, e.target.value)}
                                onBlur={() => !isManageMode && setEditingItemId(null)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingItemId(null)}
                                className="bg-transparent text-sm text-white focus:outline-none flex-1 font-light border-b border-white/10"
                              />
                              {isManageMode && (
                                <button
                                  onClick={() => deleteHabit(habit.id)}
                                  className="p-1 text-red-400/40 hover:text-red-400 transition-all"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-between group/label">
                              <span 
                                onClick={() => setEditingItemId(habit.id)}
                                className={`text-sm cursor-text transition-all duration-300 font-light ${
                                  habit.done ? 'text-white/35 line-through' : 'text-white/80'
                                }`}
                              >
                                {habit.label}
                              </span>
                              <Edit2 size={10} className="text-white/0 group-hover/label:text-white/20 transition-all" />
                            </div>
                          )}
                          
                          {!isManageMode && (
                            <button
                              onClick={() => deleteHabit(habit.id)}
                              className="p-1 text-white/10 hover:text-red-400/60 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </motion.div>
                      </div>
                    ))}
                    {habits.length === 0 && (
                      <p className="text-white/20 text-[10px] italic text-center py-4">Neural buffers empty</p>
                    )}
                  </div>
                
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[9px] font-mono text-white/25 uppercase text-center tracking-[0.2em]">
                    Active Habits: {habits.length}/4
                  </p>
                </div>
              </div>
            </div>

              <div className="mt-12">
                <HabitTrends habits={habits} history={history} />
              </div>

              <div className="mt-12 bg-[#0a0a0a] border border-white/10 rounded-xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/45">
                  Aggregate Velocity
                </h3>
                <span className="font-mono text-[11px] text-white/60">
                  {completedItems}/{totalItems}
                </span>
              </div>
              
              <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                  className="h-full bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-1000 ease-out"
                />
              </div>
              
              <p className="text-white/35 text-[11px] mt-4 font-light tracking-wide">
                {completedItems === totalItems && totalItems > 0
                  ? 'All systems fully synchronized.'
                  : totalItems === 0 
                    ? 'No operational data found.'
                    : `Analysis: ${totalItems - completedItems} remaining objectives detected.`}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
}
