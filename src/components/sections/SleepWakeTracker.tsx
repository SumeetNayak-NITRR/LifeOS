"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Moon, Sun, Clock, CheckCircle2, X, TrendingUp, Info } from 'lucide-react';
import { sleepStore, subscribeToStore, SleepDay, routineStore, fitnessStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

import HydrationTracker from './HydrationTracker';

function TrendLine({ data, color, height = 60, label }: { data: number[], color: string, height?: number, label?: string }) {
  if (!data || data.length < 2) return <div className="h-[60px] flex items-center text-[10px] text-white/20 font-mono">Insufficient data</div>;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 10;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = padding + ((max - val) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const avg = data.reduce((a, b) => a + b, 0) / data.length;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xs font-medium text-white/60">{avg.toFixed(1)}</span>
          <span className="text-[8px] font-mono text-white/20 uppercase">AVG</span>
        </div>
      </div>
      <div className="relative" style={{ height }}>
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
          <div className="border-t border-white w-full" />
          <div className="border-t border-white w-full" />
          <div className="border-t border-white w-full" />
        </div>
        
        <svg viewBox={`0 0 100 ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <path
            d={`M 0 ${height} ${data.map((val, i) => `L ${(i / (data.length - 1)) * 100} ${padding + ((max - val) / range) * (height - 2 * padding)}`).join(' ')} L 100 ${height} Z`}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
          
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          />
          {data.map((val, i) => (
            <circle
              key={i}
              cx={(i / (data.length - 1)) * 100}
              cy={padding + ((max - val) / range) * (height - 2 * padding)}
              r="2"
              fill={color}
              className="transition-all hover:r-3"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

export function WakeUpCard({ todaySleep, handleWakeUp, formatTime, isWakeLocked }: any) {
  const [showManual, setShowManual] = useState(false);
  const [manualTime, setManualTime] = useState('');

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 relative overflow-hidden h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-wider text-white/45 mb-1">Morning</h4>
          <p className="text-xl font-display text-white">Wake-Up</p>
        </div>
        <Sun size={20} className="text-amber-400/40" />
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display text-white">
            {formatTime(todaySleep.wakeAt)}
          </span>
          {todaySleep.isWakeEstimated && (
            <span className="text-[10px] font-mono text-white/35 uppercase">Estimated</span>
          )}
        </div>
        {todaySleep.wakeAt ? (
          <p className="text-white/45 text-xs mt-1">Rise and shine</p>
        ) : (
          <p className="text-white/45 text-xs mt-1">Waiting for log...</p>
        )}
      </div>

      <div className="flex gap-2">
        {!todaySleep.wakeAt ? (
          <>
            <button
              onClick={() => handleWakeUp()}
              className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              I'm Awake
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="px-3 bg-white/5 text-white/40 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <Clock size={16} />
            </button>
          </>
        ) : (
          <div className="flex-1 bg-white/5 border border-white/5 py-2 rounded-lg text-sm text-white/40 text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} className="text-amber-400" />
            <span>{isWakeLocked ? 'Session Locked' : 'Logged Today'}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-[#1a1a1a] p-6 flex flex-col justify-center z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/60">Manual Wake Time</span>
              <button onClick={() => setShowManual(false)}><X size={16} className="text-white/20" /></button>
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/20"
                onChange={(e) => setManualTime(e.target.value)}
              />
              <button
                onClick={() => {
                  handleWakeUp(true, manualTime);
                  setShowManual(false);
                }}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SleepCard({ nextSleep, todaySleep, formatTime, duration, handleGoToSleep }: any) {
  const [showManual, setShowManual] = useState(false);
  const [manualTime, setManualTime] = useState('');

  const isTonightLogged = !!nextSleep.sleepAt;

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 relative overflow-hidden h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-wider text-white/45 mb-1">Night</h4>
          <p className="text-xl font-display text-white">Sleep Start</p>
        </div>
        <Moon size={20} className="text-blue-400/40" />
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-display text-white">
            {isTonightLogged ? formatTime(nextSleep.sleepAt) : formatTime(todaySleep.sleepAt)}
          </span>
          {((isTonightLogged && nextSleep.isSleepEstimated) || (!isTonightLogged && todaySleep.isSleepEstimated)) && (
            <span className="text-[10px] font-mono text-white/35 uppercase">Estimated</span>
          )}
        </div>
        {isTonightLogged ? (
          <p className="text-blue-400/60 text-xs mt-1">Logging for tonight</p>
        ) : duration ? (
          <p className="text-white/45 text-sm mt-1">Last Night: {duration}</p>
        ) : (
          <p className="text-white/45 text-xs mt-1">Prepare for rest</p>
        )}
      </div>

      <div className="flex gap-2">
        {!isTonightLogged ? (
          <>
            <button
              onClick={() => handleGoToSleep()}
              className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Going to Sleep
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="px-3 bg-white/5 text-white/40 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
            >
              <Clock size={16} />
            </button>
          </>
        ) : (
          <div className="flex-1 bg-white/5 border border-white/5 py-2 rounded-lg text-sm text-white/40 text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} className="text-blue-400" />
            <span>Logged Tonight</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showManual && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-[#1a1a1a] p-6 flex flex-col justify-center z-20"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/60">Manual Sleep Time</span>
              <button onClick={() => setShowManual(false)}><X size={16} className="text-white/20" /></button>
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/20"
                onChange={(e) => setManualTime(e.target.value)}
              />
              <button
                onClick={() => {
                  handleGoToSleep(true, manualTime);
                  setShowManual(false);
                }}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SleepWindowGraph({ days }: { days: SleepDay[] }) {
  const vh = 80;
  const hours = Array.from({ length: 24 }, (_, i) => (i + 18) % 24); // 6 PM to 6 PM

  const getPosition = (iso: string | null) => {
    if (!iso) return null;
    const date = new Date(iso);
    let h = date.getHours() + date.getMinutes() / 60;
    // Map to 0-24 range starting at 18:00
    let pos = h - 18;
    if (pos < 0) pos += 24;
    return (pos / 24) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Circadian Window</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40" />
            <span className="text-[8px] font-mono text-white/30 uppercase">Sleep</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
            <span className="text-[8px] font-mono text-white/30 uppercase">Wake</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-[120px] bg-white/[0.02] border border-white/5 rounded-lg p-4 flex flex-col justify-between">
        {/* Time Labels */}
        <div className="absolute inset-0 flex justify-between px-4 pointer-events-none">
          {[18, 22, 2, 6, 10, 14].map(h => (
            <div key={h} className="h-full border-l border-white/[0.03] flex flex-col justify-end pb-1">
              <span className="text-[7px] font-mono text-white/10">{h}:00</span>
            </div>
          ))}
        </div>

        {/* Days Data */}
        <div className="relative flex-1 flex flex-col justify-around gap-1 z-10">
          {days.map((d, i) => {
            const start = getPosition(d.sleepAt);
            const end = getPosition(d.wakeAt);
            
            return (
              <div key={i} className="relative h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                {start !== null && end !== null && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute h-full bg-gradient-to-r from-blue-500/30 to-amber-500/30 rounded-full"
                    style={{ 
                      left: `${start}%`, 
                      width: `${end > start ? end - start : (100 - start) + end}%`,
                      transformOrigin: 'left'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function SleepWakeTracker() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'daily' | 'stats'>('daily');

  const getSnapshot = useCallback(() => JSON.stringify(sleepStore.get()), []);
  const getServerSnapshot = useCallback(() => JSON.stringify({ days: {} }), []);
  const sleepDataRaw = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  const sleepData = JSON.parse(sleepDataRaw);

  const getFitnessSnapshot = useCallback(() => JSON.stringify(fitnessStore.get().hydration || { entries: {} }), []);
  const hydrationRaw = useSyncExternalStore(subscribeToStore, getFitnessSnapshot, getServerSnapshot);
  const hydration = JSON.parse(hydrationRaw);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaySleep = sleepStore.getDay(today);

  const getSleepTargetDate = () => {
    const now = new Date();
    const hour = now.getHours();
    // If it's between 6 PM and midnight, target tomorrow's wake-up
    if (hour >= 18) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
    // If it's between midnight and 6 AM, it's technically still tonight's session for TODAY's wake-up
    return today;
  };

  const sleepTargetDate = getSleepTargetDate();
  const nextSleep = sleepStore.getDay(sleepTargetDate);

  const handleWakeUp = (isEstimated = false, time?: string) => {
    const now = new Date();
    let wakeAt: string;
    
    if (time) {
      wakeAt = new Date(`${today}T${time}`).toISOString();
    } else {
      wakeAt = now.toISOString();
    }

    const updatedDay: SleepDay = {
      ...todaySleep,
      wakeAt,
      isWakeEstimated: isEstimated
    };
    
    sleepStore.saveDay(updatedDay);
    autoCheckRoutine(wakeAt);
  };

  const handleGoToSleep = (isEstimated = false, time?: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Logic for determining which "Sleep Day" this belongs to:
    // If it's morning (before 6 PM) and we are logging manually, 
    // it's likely for the "today" wake-up record (last night's sleep).
    // If it's evening (after 6 PM), it's for the "tomorrow" wake-up record.
    let targetDate = today;
    if (currentHour >= 18) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      targetDate = tomorrow.toISOString().split('T')[0];
    }

    const dayData = sleepStore.getDay(targetDate);
    
    let sleepAt: string;
    if (time) {
      const datePart = new Date(targetDate);
      const manualHour = parseInt(time.split(':')[0]);
      
      // If target is today and manual hour is > 18, it means we went to bed yesterday
      if (targetDate === today && manualHour >= 18) {
        datePart.setDate(datePart.getDate() - 1);
      }
      
      sleepAt = new Date(`${datePart.toISOString().split('T')[0]}T${time}`).toISOString();
    } else {
      sleepAt = now.toISOString();
    }

    const updatedDay: SleepDay = {
      ...dayData,
      sleepAt,
      isSleepEstimated: isEstimated
    };

    sleepStore.saveDay(updatedDay);
  };

  const autoCheckRoutine = (wakeAtStr: string) => {
    const wakeAt = new Date(wakeAtStr);
    const routineData = routineStore.get();
    let changed = false;

    const updatedRoutines = routineData.routines.map(r => {
      if (r.id === 'morning') {
        return {
          ...r,
          items: r.items.map(item => {
            if (item.label.toLowerCase().includes('wake') && item.label.toLowerCase().includes('7am')) {
              const target = new Date(wakeAt);
              target.setHours(7, 0, 0, 0);
              const graceLimit = new Date(target);
              graceLimit.setMinutes(graceLimit.getMinutes() + 30);

              if (wakeAt <= graceLimit) {
                if (!item.done) {
                  changed = true;
                  return { ...item, done: true, label: `${item.label} (Auto)` };
                }
              }
            }
            return item;
          })
        };
      }
      return r;
    });

    if (changed) {
      routineStore.save({ ...routineData, routines: updatedRoutines });
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateDuration = (sleep: string | null, wake: string | null) => {
    if (!sleep || !wake) return null;
    const start = new Date(sleep).getTime();
    const end = new Date(wake).getTime();
    
    // Handle retrospective logging where sleepAt might be set after wakeAt in the object
    // but the actual timestamps should represent the interval.
    // If end < start, it's likely an error in logging (same day vs cross day).
    let durationMs = end - start;
    if (durationMs < 0) {
      // If duration is negative, assume sleep was actually the previous day
      const adjustedStart = start - (24 * 60 * 60 * 1000);
      durationMs = end - adjustedStart;
    }
    
    if (durationMs < 0) return null; // Still negative after adjustment

    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!mounted) return null;

  const isWakeLocked = todaySleep.wakeAt && 
    (new Date().getTime() - new Date(todaySleep.wakeAt).getTime() > 30 * 60 * 1000);

  const duration = calculateDuration(todaySleep.sleepAt, todaySleep.wakeAt);

  const getStats = () => {
    const days = Object.values(sleepData.days as Record<string, SleepDay>);
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = sleepStore.getDay(dateStr);
      last7Days.push(dayData);
    }

    const durations = days
      .map(d => {
        if (!d.sleepAt || !d.wakeAt) return null;
        return (new Date(d.wakeAt).getTime() - new Date(d.sleepAt).getTime()) / (1000 * 60 * 60);
      })
      .filter((d): d is number => d !== null && d > 0);

    const avgDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;

    return {
      avgHours: Math.floor(avgDuration),
      avgMinutes: Math.round((avgDuration % 1) * 60),
      count: durations.length,
      durationTrends: last7Days.map(d => {
        if (!d.sleepAt || !d.wakeAt) return 0;
        const dur = (new Date(d.wakeAt).getTime() - new Date(d.sleepAt).getTime()) / (1000 * 60 * 60);
        return dur > 0 ? dur : 0;
      }),
      startTimeTrends: last7Days.map(d => {
        if (!d.sleepAt) return 0;
        const sleepDate = new Date(d.sleepAt);
        let hours = sleepDate.getHours();
        if (hours < 12) hours += 24; 
        return hours + sleepDate.getMinutes() / 60;
      })
    };
  };

  const stats = getStats();

  const hydrationStats = (() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const entries = hydration.entries[dateStr] || [];
      const total = entries.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
      list.push({ date: dateStr, amount: total });
    }
    return list.reverse();
  })();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => setView('daily')}
          className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full transition-all ${
            view === 'daily' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'
          }`}
        >
          Daily Log
        </button>
        <button 
          onClick={() => setView('stats')}
          className={`text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full transition-all ${
            view === 'stats' ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'
          }`}
        >
          Trends
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'daily' ? (
          <motion.div 
            key="daily"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <WakeUpCard 
              todaySleep={todaySleep} 
              handleWakeUp={handleWakeUp} 
              formatTime={formatTime} 
              isWakeLocked={isWakeLocked} 
            />
            
            <div className="h-full">
              <HydrationTracker />
            </div>

            <SleepCard 
              nextSleep={nextSleep} 
              todaySleep={todaySleep} 
              formatTime={formatTime} 
              duration={duration} 
              handleGoToSleep={handleGoToSleep} 
            />
          </motion.div>
        ) : (
          <motion.div 
            key="stats"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Moon size={18} className="text-blue-400/40" />
                    <h4 className="font-mono text-[10px] uppercase tracking-wider text-white/40">Sleep Analysis</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display text-white">{stats.avgHours}h {stats.avgMinutes}m</p>
                    <p className="text-[8px] font-mono text-white/20 uppercase">Average Duration</p>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <SleepWindowGraph days={Object.values(sleepData.days as Record<string, SleepDay>).slice(-7)} />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TrendLine data={stats.durationTrends} color="#60a5fa" label="Duration Stability" />
                    <TrendLine data={stats.startTimeTrends} color="#a78bfa" label="Start Time Drift" />
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sun size={18} className="text-amber-400/40" />
                  <h4 className="font-mono text-[10px] uppercase tracking-wider text-white/40">Hydration Volume</h4>
                </div>
                
                <div className="mb-6">
                  <TrendLine data={hydrationStats.map(d => d.amount)} color="#3b82f6" label="Daily Intake History" />
                </div>

                <div className="flex items-end gap-1.5 h-16">
                  {hydrationStats.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="flex-1 w-full bg-white/[0.02] rounded-t-sm relative flex flex-col justify-end overflow-hidden">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.min((d.amount / 3000) * 100, 100)}%` }}
                          className="w-full bg-blue-500/20"
                        />
                      </div>
                      <span className="text-[7px] font-mono text-white/20">{d.date.split('-')[2]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
