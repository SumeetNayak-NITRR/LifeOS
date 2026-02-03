"use client";

import React, { useState, useCallback, useSyncExternalStore } from 'react';
import { Droplets, Plus, Trash2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { fitnessStore, subscribeToStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

export default function HydrationTracker() {
  const getSnapshot = useCallback(() => JSON.stringify(fitnessStore.get().hydration || { entries: {} }), []);
  const getServerSnapshot = useCallback(() => JSON.stringify({ entries: {} }), []);
  const hydrationRaw = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
  const hydration = JSON.parse(hydrationRaw);

  const [showHistory, setShowHistory] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = (hydration.entries[today] || []).sort((a: any, b: any) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const totalWater = todayEntries.reduce((sum: number, entry: { amount: number }) => sum + entry.amount, 0);

  const visualMax = 3000; 
  const progress = Math.min(totalWater / visualMax, 1);

  const addWater = (amount: number = 250) => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 600);

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      amount
    };

    const fitness = fitnessStore.get();
    const currentHydration = fitness.hydration || { entries: {} };
    const currentEntries = currentHydration.entries[today] || [];
    
    fitnessStore.save({
      ...fitness,
      hydration: {
        ...currentHydration,
        entries: {
          ...currentHydration.entries,
          [today]: [...currentEntries, newEntry]
        }
      }
    });
  };

  const removeEntry = (id: string) => {
    fitnessStore.removeHydrationEntry(today, id);
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      animate={isPulsing ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 20px rgba(59, 130, 246, 0.3)", "0 0 0px rgba(59, 130, 246, 0)"] } : {}}
      transition={{ duration: 0.6 }}
      className="bg-white/[0.03] border border-white/10 rounded-xl p-6 relative overflow-hidden group h-full flex flex-col"
    >
      {/* Wave Background */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 bg-blue-500/10 pointer-events-none z-0"
        initial={{ height: 0 }}
        animate={{ height: `${progress * 100}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        <div className="absolute top-0 left-0 right-0 h-4 -translate-y-full overflow-hidden">
          <motion.div 
            className="w-[200%] h-full flex"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-1/2 h-full bg-gradient-to-t from-blue-500/10 to-transparent rounded-[40%_60%_0%_0%]" />
            <div className="w-1/2 h-full bg-gradient-to-t from-blue-500/10 to-transparent rounded-[60%_40%_0%_0%]" />
          </motion.div>
        </div>
      </motion.div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-1">Daytime</h4>
            <p className="text-xl font-display text-white">Hydration</p>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
          >
            <History size={18} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <AnimatePresence mode="wait">
              <motion.span 
                key={totalWater}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-display text-white"
              >
                {totalWater} ml
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-white/30 text-xs mt-1">Water today (Target 3L)</p>
        </div>

        <div className="flex-1 min-h-0 relative">
          <AnimatePresence mode="wait">
            {!showHistory ? (
              <motion.div 
                key="controls"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addWater(250)}
                    className="flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl text-sm font-medium transition-all group/btn active:scale-95 border border-white/5"
                  >
                    <Droplets size={20} className="text-blue-400 mb-1" />
                    <span className="text-lg font-display">250ml</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Glass</span>
                  </button>
                  <button
                    onClick={() => addWater(500)}
                    className="flex flex-col items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl text-sm font-medium transition-all group/btn active:scale-95 border border-white/5"
                  >
                    <div className="flex gap-0.5 mb-1">
                      <Droplets size={20} className="text-blue-400" />
                      <Droplets size={20} className="text-blue-400" />
                    </div>
                    <span className="text-lg font-display">500ml</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wider">Bottle</span>
                  </button>
                </div>
                
                <button
                  onClick={() => addWater(100)}
                  className="w-full flex items-center justify-center gap-2 bg-white/[0.02] hover:bg-white/[0.05] text-white/60 py-2.5 rounded-lg text-[10px] uppercase font-mono tracking-widest transition-all border border-white/5"
                >
                  <Plus size={14} />
                  <span>Custom 100ml Sip</span>
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 overflow-y-auto pr-2 custom-scrollbar"
              >
                <div className="space-y-2">
                  {todayEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-white/20 text-xs font-mono uppercase tracking-wider">No entries yet</p>
                    </div>
                  ) : (
                    todayEntries.map((entry: any) => (
                      <div 
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group/entry"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Droplets size={14} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{entry.amount}ml</p>
                            <p className="text-[10px] text-white/30 font-mono">{formatTime(entry.timestamp)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeEntry(entry.id)}
                          className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover/entry:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
