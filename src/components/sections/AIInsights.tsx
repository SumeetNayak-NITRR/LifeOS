"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, RefreshCw, Trophy, Zap, Shield, Target } from 'lucide-react';
import { aiStore, fitnessStore, workStore, routineStore, planningStore, subscribeToStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';

const categoryIcons: Record<string, any> = {
  'Performance': Trophy,
  'Recovery': Zap,
  'Focus': Target,
  'Productivity': Sparkles,
  'Mindset': Shield,
  'System': Sparkles,
};

export default function AIInsights() {
  const [data, setData] = useState(aiStore.get());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    return subscribeToStore(() => {
      setData(aiStore.get());
    });
  }, []);

  const refreshInsights = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fitness: fitnessStore.get(),
          work: workStore.get(),
          routine: routineStore.get(),
          planning: planningStore.get(),
        }),
      });
      
      const result = await response.json();
      if (result.insights) {
        aiStore.save({
          insights: result.insights,
          lastUpdated: new Date().toISOString(),
        });
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to refresh insights:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const nextInsight = () => {
    if (data.insights.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % data.insights.length);
  };

  const prevInsight = () => {
    if (data.insights.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + data.insights.length) % data.insights.length);
  };

  const currentInsight = data.insights[currentIndex] || { text: 'No insights available.', category: 'System' };
  const CategoryIcon = categoryIcons[currentInsight.category] || Sparkles;

  return (
    <section className="relative py-32 overflow-hidden bg-[#0a0a0a]">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent)] pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-[2rem] blur-xl transition duration-1000 group-hover:duration-200 pointer-events-none" />
            
            <div className="relative bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden">
              {/* Top Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <Trophy size={24} className="text-white/60" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white/20 flex items-center justify-center border border-[#0d0d0d]">
                      <Sparkles size={8} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl text-white tracking-tight">Pro Coach</h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/40">v2.0 Gemini</span>
                    </div>
                    <p className="text-xs text-white/30 mt-1 font-mono uppercase tracking-wider">Elite Performance Analysis</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={refreshInsights}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50 group"
                  >
                    <RefreshCw size={14} className={`text-white/40 group-hover:text-white/60 transition-colors ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60">Analyze Stats</span>
                  </button>
                </div>
              </div>

              <div className="relative min-h-[200px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                        <CategoryIcon size={14} className="text-white/40" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
                        {currentInsight.category}
                      </span>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-tight tracking-tight">
                      {currentInsight.text}
                    </h2>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-16 pt-8 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  {data.insights.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-500 ${
                        idx === currentIndex ? 'bg-white/40 w-8' : 'bg-white/5 hover:bg-white/10 w-4'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={prevInsight}
                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all active:scale-95"
                  >
                    <ChevronLeft size={20} className="text-white/40" />
                  </button>
                  <button
                    onClick={nextInsight}
                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all active:scale-95"
                  >
                    <ChevronRight size={20} className="text-white/40" />
                  </button>
                </div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-white/5" />
            <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest">
              Last Analysis: {new Date(data.lastUpdated).toLocaleTimeString()}
            </p>
            <div className="h-px w-8 bg-white/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
