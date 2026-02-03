"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Clock, Trash2, Plus, ChevronDown, ChevronUp, MoreHorizontal, Star, X, Play, Pause, RotateCcw, Coffee, Target, Zap, Layout, Flame } from 'lucide-react';
import { ZapIcon } from '@/components/ui/ZapIcon';
import { workStore, WorkData } from '@/lib/store';
import { useFocusMode } from '@/hooks/useFocusMode';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  text: string;
  status: 'pending' | 'done' | 'missed';
  timeEstimate?: string;
  isOngoing?: boolean;
  note?: string;
  date: string;
  carryOverCount: number;
  isImportant: boolean;
}

export default function WorkModule() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusTime, setFocusTime] = useState(0);
  const [focusSessions, setFocusSessions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);
    const { isVisualsDisabled } = useFocusMode();

    const saveData = useCallback((updates: Partial<WorkData>) => {
    const current = workStore.get();
    workStore.save({ ...current, ...updates });
  }, []);

  const updateTimerState = useCallback((updates: Partial<WorkData['timerState']>) => {
    const current = workStore.get();
    const newState = {
      ...current.timerState,
      ...updates,
      lastUpdated: Date.now()
    };
    saveData({ timerState: newState });
  }, [saveData]);

  const handleReset = useCallback(() => {
    setTimerActive(false);
    setTimerPaused(false);
    setIsBreak(false);
    const defaultTime = 25 * 60;
    setTimeLeft(defaultTime);
    updateTimerState({ isActive: false, isPaused: false, timeLeft: defaultTime });
  }, [updateTimerState]);

    const handleSessionComplete = useCallback(() => {
      if (isBreak) {
        handleReset();
        return;
      }
      const current = workStore.get();
      const completedMinutes = 25;
      const newFocusTime = current.focusTime + completedMinutes;
      const newFocusSessions = (current.focusSessions || 0) + 1;
      
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 800);

      setFocusTime(newFocusTime);
      setFocusSessions(newFocusSessions);
      setTimerActive(false);
    saveData({
      focusTime: newFocusTime,
      focusSessions: newFocusSessions,
      timerState: { isActive: false, isPaused: false, timeLeft: 5 * 60, lastUpdated: Date.now() }
    });
    setTimeLeft(5 * 60);
    setIsBreak(true);
  }, [isBreak, saveData, handleReset]);

  useEffect(() => {
    const data = workStore.get();
    setTasks(data.tasks);
    setFocusTime(data.focusTime);
    setFocusSessions(data.focusSessions || 0);
    if (data.timerState) {
      const { isActive, isPaused, lastUpdated, timeLeft: storedTime } = data.timerState;
      if (isActive && !isPaused) {
        const elapsed = Math.floor((Date.now() - lastUpdated) / 1000);
        const remaining = Math.max(0, storedTime - elapsed);
        setTimeLeft(remaining <= 0 ? storedTime : remaining);
        setTimerActive(remaining > 0);
      } else {
        setTimeLeft(storedTime);
        setTimerActive(isActive);
        setTimerPaused(isPaused);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !timerPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerPaused, timeLeft, handleSessionComplete]);

  const handleFocusTime = (minutes: number) => {
    if (timerActive) return;
    const seconds = minutes * 60;
    setTimeLeft(seconds);
    setIsBreak(false);
    updateTimerState({ timeLeft: seconds, isActive: false, isPaused: false });
  };

    const handleStart = () => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 800);
      setTimerActive(true);
      setTimerPaused(false);
      updateTimerState({ isActive: true, isPaused: false });
    };

  const handlePause = () => {
    setTimerPaused(true);
    updateTimerState({ isPaused: true });
  };

  const handleResume = () => {
    setTimerPaused(false);
    updateTimerState({ isPaused: false });
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, status: task.status === 'done' ? 'pending' : 'done' } : task
    );
    setTasks(updatedTasks);
    saveData({ tasks: updatedTasks });
  };

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text: newTaskText.trim(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      isOngoing: false,
      carryOverCount: 0,
      isImportant: false
    };
    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    saveData({ tasks: updatedTasks });
    setNewTaskText('');
  };

  const deleteTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    saveData({ tasks: updatedTasks });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task => task.id === id ? { ...task, ...updates } : task);
    setTasks(updatedTasks);
    saveData({ tasks: updatedTasks });
  };

  const toggleImportant = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (task) updateTask(id, { isImportant: !task.isImportant });
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const missedTasks = tasks.filter(t => t.status === 'missed');
  const activeTasks = tasks.filter(t => t.status !== 'missed');
  const totalTasks = activeTasks.length;
  const displayTasks = isExpanded ? activeTasks : activeTasks.slice(0, 5);

  const carryTask = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (activeTasks.filter(t => t.carryOverCount > 0 && t.date === today).length >= 2) return;
    const updatedTasks = tasks.map(task => 
      task.id === id ? { ...task, status: 'pending' as const, date: today, carryOverCount: task.carryOverCount + 1 } : task
    );
    setTasks(updatedTasks);
    saveData({ tasks: updatedTasks });
  };

  if (!mounted) return <section id="work" className="relative py-32 overflow-hidden min-h-screen bg-[#050505]" />;

  return (
    <section id="work" className="relative py-32 overflow-hidden bg-[#050505]">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />

      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
              <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 mb-6">
                <Target size={10} className="text-white/40" />
                <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40">
                  Module 02 / Cognitive Engine
                </span>
              </div>
              <h2 className="font-display text-[clamp(40px,6vw,72px)] text-white tracking-tighter leading-[0.9] mb-4">
                Work Planner
              </h2>
              <p className="text-white/20 text-lg font-light tracking-wide max-w-xl">
                Execution is the bridge between vision and reality. Plan with precision.
              </p>
            </div>
            
            <div className="flex items-center gap-12">
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-widest text-white/20 mb-1">Focus Yield</p>
                <div className="flex items-center gap-2 justify-end">
                  <Zap size={16} className="text-white/40" />
                  <span className="text-2xl font-display text-white">{focusTime}m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Task Pipeline */}
            <div className="lg:col-span-8">
              <motion.div
                animate={isPulsing ? { scale: [1, 1.01, 1], boxShadow: ["0 0 0px rgba(255, 255, 255, 0)", "0 0 20px rgba(255, 255, 255, 0.05)", "0 0 0px rgba(255, 255, 255, 0)"] } : {}}
                transition={{ duration: 0.8 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 transition-colors group-hover:border-white/20">
                      <Layout size={20} className="text-white/45" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-white tracking-tight">Pipeline</h3>
                      <p className="text-white/45 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">Operational Objectives</p>
                    </div>
                  </div>

                  <form onSubmit={addTask} className="relative w-full md:w-80 group">
                    <input
                      type="text"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      placeholder="Add objective..."
                      className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-3.5 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all pr-12"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                      <Plus size={16} className="text-white/40" />
                    </button>
                  </form>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {displayTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`group relative flex items-center gap-6 p-5 rounded-2xl border transition-all duration-500 cursor-pointer ${
                          task.status === 'done' 
                            ? 'bg-white/[0.01] border-white/5 opacity-40' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                        }`}
                        onClick={() => toggleTask(task.id)}
                      >
                          <div className="relative w-6 h-6 shrink-0">
                            <div className={`absolute inset-0 rounded-lg border transition-all duration-500 ${
                              task.status === 'done' ? 'bg-white/10 border-white/30' : 'border-white/10'
                            }`} />
                            <ZapIcon active={task.status === 'done'} size={14} className="relative z-10" />
                          </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-base font-light tracking-tight transition-all duration-500 ${
                            task.status === 'done' ? 'line-through text-white/40' : 'text-white/90'
                          }`}>
                            {task.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={(e) => toggleImportant(e, task.id)} className={`p-2 rounded-lg transition-colors ${task.isImportant ? 'text-amber-400' : 'text-white/20 hover:text-white'}`}>
                            <Star size={14} fill={task.isImportant ? "currentColor" : "none"} />
                          </button>
                          <button onClick={(e) => deleteTask(e, task.id)} className="p-2 rounded-lg text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {totalTasks > 5 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full mt-8 py-4 border-t border-white/5 font-mono text-[9px] uppercase tracking-[0.3em] text-white/20 hover:text-white/40 transition-colors"
                  >
                    {isExpanded ? 'Collapse' : `View All ${totalTasks} Objectives`}
                  </button>
                )}

                {totalTasks > 0 && (
                  <div className="mt-12 pt-12 border-t border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">Completion Velocity</span>
                      <span className="text-[10px] font-mono text-white/30">{Math.round((completedCount / totalTasks) * 100)}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / totalTasks) * 100}%` }}
                        className="h-full bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Timer Panel */}
            <div className="lg:col-span-4 space-y-6">
              <motion.div
                animate={isPulsing ? { scale: [1, 1.01, 1], boxShadow: ["0 0 0px rgba(255, 255, 255, 0)", "0 0 20px rgba(255, 255, 255, 0.05)", "0 0 0px rgba(255, 255, 255, 0)"] } : {}}
                transition={{ duration: 0.8 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.03] transition-all duration-1000" />
                
                <div className="flex items-center justify-between mb-12">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Cognitive Focus</h3>
                  <div className="w-2 h-2 rounded-full bg-white/10" />
                </div>

                <div className="text-center mb-12">
                  <div className="text-[clamp(48px,5vw,72px)] font-display text-white tracking-tighter leading-none mb-4">
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
                    {String(timeLeft % 60).padStart(2, '0')}
                  </div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-white/35">
                    {isBreak ? 'Cool Down' : timerActive ? 'Hyperfocus Active' : 'Engage Timer'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <button onClick={() => handleFocusTime(25)} className="py-3 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[10px] text-white/30 hover:bg-white/5 hover:text-white transition-all">25M</button>
                  <button onClick={() => handleFocusTime(50)} className="py-3 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-[10px] text-white/30 hover:bg-white/5 hover:text-white transition-all">50M</button>
                </div>

                <div className="flex items-center gap-3">
                  {!timerActive ? (
                    <button 
                      onClick={handleStart}
                      className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                    >
                      Initialize
                    </button>
                  ) : timerPaused ? (
                    <button 
                      onClick={handleResume}
                      className="flex-1 bg-white/5 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-all border border-white/5"
                    >
                      Resume
                    </button>
                  ) : (
                    <button 
                      onClick={handlePause}
                      className="flex-1 bg-white/5 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white/10 transition-all border border-white/5"
                    >
                      Suspend
                    </button>
                  )}
                  <button onClick={handleReset} className="w-14 h-14 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all group">
                    <RotateCcw size={18} className="text-white/20 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-[#0d0d0d] to-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/5">
                    <Zap size={18} className="text-white/40" />
                  </div>
                  <div>
                    <h4 className="text-white/80 font-display text-lg">Daily Yield</h4>
                    <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest mt-0.5">{focusSessions} Blocks Complete</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs font-light">Total Focus Time</span>
                    <span className="text-white text-sm font-mono">{focusTime}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/30 text-xs font-light">Completed Objectives</span>
                    <span className="text-white text-sm font-mono">{completedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
