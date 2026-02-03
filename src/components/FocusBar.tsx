"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause } from 'lucide-react';
import { workStore, subscribeToStore } from '@/lib/store';

export function FocusBar() {
  const [timerState, setTimerState] = useState(workStore.get().timerState);
  const [displayTime, setDisplayTime] = useState(timerState.timeLeft);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      const state = workStore.get().timerState;
      setTimerState(state);
      
      if (state.isActive && !state.isPaused) {
        const elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);
        const remaining = Math.max(0, state.timeLeft - elapsed);
        setDisplayTime(remaining);
      } else {
        setDisplayTime(state.timeLeft);
      }
    });
    
    const initialState = workStore.get().timerState;
    if (initialState.isActive && !initialState.isPaused) {
      const elapsed = Math.floor((Date.now() - initialState.lastUpdated) / 1000);
      setDisplayTime(Math.max(0, initialState.timeLeft - elapsed));
    }
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      intervalRef.current = setInterval(() => {
        setDisplayTime(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isActive, timerState.isPaused]);

  if (!timerState.isActive) return null;

  const totalTime = 25 * 60;
  const progress = (displayTime / totalTime) * 100;
  
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const glowIntensity = Math.max(0.3, 1 - (progress / 100));

  const handleTogglePause = () => {
    const current = workStore.get();
    workStore.save({
      ...current,
      timerState: {
        ...current.timerState,
        isPaused: !current.timerState.isPaused,
        timeLeft: displayTime,
        lastUpdated: Date.now()
      }
    });
  };

  const handleStop = () => {
    const current = workStore.get();
    workStore.save({
      ...current,
      timerState: {
        ...current.timerState,
        isActive: false,
        isPaused: false,
        timeLeft: 25 * 60
      }
    });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[110] flex flex-col items-center"
      >
        {/* Progress Line with Glow */}
        <div className="w-full h-1 bg-white/5 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-white"
            style={{ 
              width: `${progress}%`,
              boxShadow: `0 0 ${10 + glowIntensity * 20}px rgba(255,255,255,${0.3 + glowIntensity * 0.5}), 0 0 ${30 + glowIntensity * 40}px rgba(255,255,255,${0.2 + glowIntensity * 0.3})`
            }}
          />
        </div>

        {/* Control Bar */}
        <motion.div 
          className="bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-2.5 mt-4 flex items-center gap-6 shadow-2xl"
          style={{
            boxShadow: `0 10px 40px -10px rgba(0,0,0,0.8), 0 0 ${20 + glowIntensity * 30}px rgba(255,255,255,${0.05 + glowIntensity * 0.1})`
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-2 h-2 rounded-full bg-white"
              animate={{ 
                scale: timerState.isPaused ? 1 : [1, 1.3, 1],
                opacity: timerState.isPaused ? 0.5 : 1
              }}
              transition={{ 
                duration: 1, 
                repeat: timerState.isPaused ? 0 : Infinity,
                ease: "easeInOut"
              }}
              style={{
                boxShadow: timerState.isPaused ? 'none' : `0 0 ${8 + glowIntensity * 12}px rgba(255,255,255,${0.6 + glowIntensity * 0.4})`
              }}
            />
            <span className="font-mono text-sm font-bold text-white tracking-widest tabular-nums">
              {timeString}
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          <div className="flex items-center gap-3">
            <button 
              onClick={handleTogglePause}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              {timerState.isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button 
              onClick={handleStop}
              className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
