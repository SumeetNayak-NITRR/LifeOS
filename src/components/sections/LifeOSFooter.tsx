"use client";

import React from 'react';

export default function LifeOSFooter() {
  return (
    <footer className="relative py-16 overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      <div className="container relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <span className="font-display text-xl text-white tracking-tight">LifeOS</span>
            </div>

            <div className="flex items-center gap-8">
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                Personal Operating System
              </span>
              <div className="h-4 w-[1px] bg-white/10" />
              <span className="font-mono text-[10px] text-white/20 uppercase tracking-wider">
                v1.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse" />
              <span className="font-mono text-[10px] text-white/30 uppercase tracking-wider">
                System Active
              </span>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-white/20 text-xs">
              Clarity over decoration. Fewer metrics, better signals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
