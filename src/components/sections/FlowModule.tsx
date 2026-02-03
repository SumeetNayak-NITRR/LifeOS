"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Sun, 
  Moon, 
  Check, 
  Plus, 
  Trash2, 
  MoreVertical,
  Sunrise,
  Sunset,
  ArrowRight,
  Circle,
  CheckCircle2,
  ChevronRight,
  Settings2,
  Edit2,
  X
} from 'lucide-react';
import { 
  routineStore, 
  planningStore, 
  subscribeToStore,
  RoutineData, 
  PlanningData, 
  PlanningTask, 
  TimeBlock,
  RoutineBlock,
  HabitItem
} from '@/lib/store';
import { useFocusMode } from '@/hooks/useFocusMode';
import SleepWakeTracker from './SleepWakeTracker';
import PlanningModule from './PlanningModule'; 
import RoutineTracker from './RoutineTracker';

type FlowView = 'daily' | 'planning' | 'trends';

export default function FlowModule() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<FlowView>('daily');
  const { isVisualsDisabled } = useFocusMode();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <section id="flow" className="min-h-screen bg-[#050505]" />;

  return (
    <section id="flow" className="relative py-20 md:py-32 overflow-hidden bg-[#050505]">
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-3"
              >
                <div className="w-1 h-1 rounded-full bg-amber-400/40" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Module 03 / Human Algorithm
                </span>
              </motion.div>
              <h2 className="font-display text-4xl md:text-5xl text-white tracking-tight">
                Flow <span className="text-white/20 italic">& Rhythm.</span>
              </h2>
            </div>

            {/* View Switcher */}
            <div className="flex bg-white/[0.03] border border-white/5 rounded-xl p-1 self-start">
              {(['daily', 'planning', 'trends'] as FlowView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all relative ${
                    activeView === v 
                      ? 'text-white' 
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {activeView === v && (
                    <motion.div 
                      layoutId="flow-view-pill"
                      className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" 
                    />
                  )}
                  <span className="relative z-10 capitalize">{v}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeView === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <SleepWakeTracker />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Systems Column */}
                  <div className="space-y-6">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <Clock size={14} /> Systems
                    </h3>
                    <RoutineTrackerCompact />
                  </div>

                  {/* Intentions Column */}
                  <div className="space-y-6">
                    <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <Zap size={14} /> Intentions
                    </h3>
                    <PlanningModuleCompact />
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'planning' && (
              <motion.div
                key="planning"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PlanningModule />
              </motion.div>
            )}

            {activeView === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <RoutineTracker />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// Compact version of RoutineTracker for the Daily Flow view
function RoutineTrackerCompact() {
  const [data, setData] = useState<RoutineData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [isEditingRoutines, setIsEditingRoutines] = useState(false);
  const [addingToRoutine, setAddingToRoutine] = useState<string | null>(null);
  const [editingRoutineItemId, setEditingRoutineItemId] = useState<string | null>(null);

  useEffect(() => {
    setData(routineStore.get());
    return subscribeToStore(() => {
      setData(routineStore.get());
    });
  }, []);

  if (!data) return null;

  const addHabit = () => {
    const newHabit = { id: Math.random().toString(36).substr(2, 9), label: 'New Habit', done: false };
    const updated = { ...data, habits: [...data.habits, newHabit] };
    routineStore.save(updated);
  };

  const deleteHabit = (id: string) => {
    const updated = { ...data, habits: data.habits.filter(h => h.id !== id) };
    routineStore.save(updated);
  };

  const updateHabitLabel = (id: string, label: string) => {
    const updated = {
      ...data,
      habits: data.habits.map(h => h.id === id ? { ...h, label } : h)
    };
    routineStore.save(updated);
    setEditingHabitId(null);
  };

  const addRoutineItem = (routineId: string, label: string) => {
    if (!label.trim()) return;
    const newItem = { id: Math.random().toString(36).substr(2, 9), label, done: false };
    const updated = {
      ...data,
      routines: data.routines.map(r => r.id === routineId ? { ...r, items: [...r.items, newItem] } : r)
    };
    routineStore.save(updated);
    setAddingToRoutine(null);
  };

  const deleteRoutineItem = (routineId: string, itemId: string) => {
    const updated = {
      ...data,
      routines: data.routines.map(r => r.id === routineId ? { ...r, items: r.items.filter(i => i.id !== itemId) } : r)
    };
    routineStore.save(updated);
  };

  const updateRoutineItemLabel = (routineId: string, itemId: string, label: string) => {
    const updated = {
      ...data,
      routines: data.routines.map(r => r.id === routineId ? {
        ...r,
        items: r.items.map(i => i.id === itemId ? { ...i, label } : i)
      } : r)
    };
    routineStore.save(updated);
    setEditingRoutineItemId(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.routines.map(routine => {
          const isComplete = routine.items.length > 0 && routine.items.every(i => i.done);
          return (
            <div key={routine.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden group/routine">
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500/5 pointer-events-none"
                />
              )}
              
              <div className="flex items-center gap-3 mb-4 relative z-10">
                {routine.id === 'morning' ? <Sunrise size={14} className="text-amber-400/60" /> : <Sunset size={14} className="text-blue-400/60" />}
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">{routine.title}</span>
                
                <div className="ml-auto flex items-center gap-3">
                  <span className={`font-mono text-[9px] transition-colors ${isComplete ? 'text-emerald-400' : 'text-white/20'}`}>
                    {routine.items.filter(i => i.done).length}/{routine.items.length}
                  </span>
                  <button 
                    onClick={() => setIsEditingRoutines(!isEditingRoutines)}
                    className={`p-1 rounded transition-colors ${isEditingRoutines ? 'text-white bg-white/10' : 'text-white/10 hover:text-white/30'}`}
                  >
                    <Settings2 size={10} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 relative z-10">
                {routine.items.map(item => (
                  <div key={item.id} className="group/item flex items-center gap-2">
                    {isEditingRoutines ? (
                      <div className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] border border-white/5">
                        {editingRoutineItemId === item.id ? (
                          <input
                            autoFocus
                            className="flex-1 bg-transparent border-none text-[11px] text-white focus:ring-0 p-0"
                            defaultValue={item.label}
                            onBlur={(e) => updateRoutineItemLabel(routine.id, item.id, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateRoutineItemLabel(routine.id, item.id, e.currentTarget.value)}
                          />
                        ) : (
                          <>
                            <span className="flex-1 text-[11px] text-white/40 truncate">{item.label}</span>
                            <button onClick={() => setEditingRoutineItemId(item.id)} className="p-1 hover:text-white text-white/20 transition-colors">
                              <Edit2 size={10} />
                            </button>
                            <button onClick={() => deleteRoutineItem(routine.id, item.id)} className="p-1 hover:text-red-400 text-white/20 transition-colors">
                              <Trash2 size={10} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          const updated = {
                            ...data,
                            routines: data.routines.map(r => r.id === routine.id ? {
                              ...r,
                              items: r.items.map(i => i.id === item.id ? { ...i, done: !i.done } : i)
                            } : r)
                          };
                          routineStore.save(updated);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-all ${
                          item.done ? 'bg-white/[0.01] text-white/15' : 'bg-white/[0.01] hover:bg-white/[0.03] text-white/50'
                        }`}
                      >
                        <motion.div 
                          animate={item.done ? { scale: [1, 1.2, 1] } : {}}
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                            item.done ? 'bg-white/10 border-white/10' : 'border-white/5'
                          }`}
                        >
                          {item.done && <Check size={8} />}
                        </motion.div>
                        <span className={`text-[11px] truncate ${item.done ? 'line-through' : ''}`}>{item.label}</span>
                        {isComplete && item.done && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <CheckCircle2 size={10} className="text-emerald-500/40" />
                          </motion.div>
                        )}
                      </button>
                    )}
                  </div>
                ))}
                
                {isEditingRoutines && (
                  <div className="pt-2">
                    {addingToRoutine === routine.id ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                        <input
                          autoFocus
                          placeholder="Task name..."
                          className="flex-1 bg-transparent border-none text-[11px] text-white focus:ring-0 p-0 placeholder:text-white/20"
                          onBlur={(e) => addRoutineItem(routine.id, e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addRoutineItem(routine.id, e.currentTarget.value)}
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setAddingToRoutine(routine.id)}
                        className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-white/5 hover:border-white/10 text-white/10 hover:text-white/30 transition-all"
                      >
                        <Plus size={10} />
                        <span className="text-[9px] font-mono uppercase">Add Task</span>
                      </button>
                    )}
                  </div>
                )}

                {routine.items.length === 0 && !isEditingRoutines && (
                  <div className="h-full flex items-center justify-center py-4 border border-dashed border-white/5 rounded-lg">
                    <span className="text-[9px] font-mono text-white/10 uppercase">Empty Protocol</span>
                  </div>
                )}
              </div>

              {isComplete && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="absolute bottom-0 left-0 h-[2px] bg-emerald-500/20"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={14} className="text-emerald-400/60" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-white/40">Core Habits</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {data.habits.map(h => (
                <div key={h.id} className={`w-1 h-1 rounded-full ${h.done ? 'bg-emerald-500/40' : 'bg-white/5'}`} />
              ))}
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg transition-colors ${isEditing ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
            >
              <Settings2 size={12} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.habits.map(habit => (
            <div key={habit.id} className="relative group">
              {isEditing ? (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/10">
                  {editingHabitId === habit.id ? (
                    <input
                      autoFocus
                      className="flex-1 bg-transparent border-none text-[10px] text-white focus:ring-0 p-1"
                      defaultValue={habit.label}
                      onBlur={(e) => updateHabitLabel(habit.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateHabitLabel(habit.id, e.currentTarget.value)}
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-[10px] font-medium text-white/40 truncate pl-1">{habit.label}</span>
                      <button onClick={() => setEditingHabitId(habit.id)} className="p-1 hover:text-white text-white/20 transition-colors">
                        <ArrowRight size={10} />
                      </button>
                      <button onClick={() => deleteHabit(habit.id)} className="p-1 hover:text-red-400 text-white/20 transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => {
                    const updated = {
                      ...data,
                      habits: data.habits.map(h => h.id === habit.id ? { ...h, done: !h.done } : h)
                    };
                    routineStore.save(updated);
                  }}
                  className={`w-full flex items-center gap-2 p-2.5 rounded-xl transition-all border ${
                    habit.done 
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/50' 
                      : 'bg-white/[0.01] border-transparent hover:bg-white/[0.03] text-white/40'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    habit.done ? 'bg-emerald-500/20 border-emerald-500/30' : 'border-white/10'
                  }`} />
                  <span className="text-[10px] font-medium truncate">{habit.label}</span>
                </button>
              )}
            </div>
          ))}
          {isEditing && (
            <button 
              onClick={addHabit}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-white/20 hover:text-white/40 transition-all"
            >
              <Plus size={12} />
              <span className="text-[10px] font-mono uppercase">Add Habit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple wrapper to show today's planning in Daily Flow
function PlanningModuleCompact() {
  const [tasks, setTasks] = useState<PlanningTask[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setTasks(planningStore.get().tasks.filter(t => t.date === today));
    return subscribeToStore(() => {
      setTasks(planningStore.get().tasks.filter(t => t.date === today));
    });
  }, []);

  const toggleTask = (id: string) => {
    const data = planningStore.get();
    const updatedTasks = data.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    planningStore.save({ ...data, tasks: updatedTasks });
  };

  const addTask = (text: string) => {
    if (!text.trim()) return;
    const data = planningStore.get();
    const newTask: PlanningTask = {
      id: Math.random().toString(36).substr(2, 9),
      text: text.trim(),
      completed: false,
      date: today
    };
    const updatedTasks = [newTask, ...data.tasks];
    planningStore.save({ ...data, tasks: updatedTasks });
  };

  const deleteTask = (id: string) => {
    const data = planningStore.get();
    const updatedTasks = data.tasks.filter(t => t.id !== id);
    planningStore.save({ ...data, tasks: updatedTasks });
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 flex flex-col h-full min-h-[400px]">
      <div className="flex-1 space-y-1.5 mb-6">
        {tasks.map(task => (
          <div key={task.id} className="group flex items-center gap-2">
            <button 
              onClick={() => toggleTask(task.id)}
              className={`flex-1 flex items-center gap-3 p-3 rounded-xl transition-all group ${
                task.completed ? 'bg-white/[0.01] text-white/10' : 'bg-white/[0.02] hover:bg-white/[0.04] text-white/70'
              }`}
            >
              {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} className="text-white/10 group-hover:text-white/30" />}
              <span className={`text-[13px] font-light text-left flex-1 ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
              {task.block && (
                <span className="text-[8px] font-mono uppercase tracking-widest text-white/20 bg-white/5 px-2 py-0.5 rounded">
                  {task.block}
                </span>
              )}
            </button>
            <button 
              onClick={() => deleteTask(task.id)}
              className="p-3 text-white/0 group-hover:text-white/10 hover:text-red-400/50 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/10">
            <Zap size={24} strokeWidth={1} className="mb-3 opacity-20" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">No Priorities Set</p>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('task') as HTMLInputElement;
            addTask(input.value);
            input.value = '';
          }}
          className="relative"
        >
          <Plus size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <input 
            name="task"
            type="text"
            placeholder="Add a priority..."
            className="w-full bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-white/20 transition-all text-xs text-white placeholder:text-white/10"
          />
        </form>
      </div>
    </div>
  );
}
