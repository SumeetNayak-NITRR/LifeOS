"use client";

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { LayoutDashboard, Dumbbell, Briefcase, Clock, Calendar, Wallet, LogOut, Cloud, CloudOff, RefreshCcw, AlertCircle, Layers, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { subscribeToSyncStatus, SyncStatus, pullFromCloud, settingsStore, subscribeToStore } from '@/lib/store';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'fitness', label: 'Performance', icon: <Dumbbell size={18} /> },
  { id: 'work', label: 'Objectives', icon: <Briefcase size={18} /> },
  { id: 'flow', label: 'FLOW', icon: <Zap size={18} /> },
  { id: 'finance', label: 'Capital', icon: <Wallet size={18} /> },
  { id: 'features', label: 'System', icon: <Layers size={18} /> },
];

const mobileNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
  { id: 'fitness', label: 'Performance', icon: <Dumbbell size={22} /> },
  { id: 'work', label: 'Objectives', icon: <Briefcase size={22} /> },
  { id: 'flow', label: 'FLOW', icon: <Zap size={22} /> },
  { id: 'finance', label: 'Capital', icon: <Wallet size={22} /> },
  { id: 'features', label: 'System', icon: <Layers size={22} /> },
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const { session, logout } = useAuth();

  const getSnapshot = useCallback(() => JSON.stringify(settingsStore.get().modules), []);
    const getServerSnapshot = useCallback(() => JSON.stringify({ fitness: true, finance: true, flow: true }), []);
    const modulesJson = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot);
    const modules = JSON.parse(modulesJson) || { fitness: true, finance: true, flow: true };
  
    const filteredNavItems = navItems.filter(item => {
      if (item.id === 'fitness') return modules.fitness;
      if (item.id === 'finance') return modules.finance;
      if (item.id === 'flow') return modules.flow;
      return true;
    });


  const filteredMobileNavItems = mobileNavItems.filter(item => {
    if (item.id === 'fitness') return modules.fitness;
    if (item.id === 'finance') return modules.finance;
    if (item.id === 'flow') return modules.flow;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    if (session && !session.isGuest) {
      pullFromCloud();
    }

    const unsubscribe = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, [session]);

  const getSyncIndicator = () => {
    if (session?.isGuest) return null;
    
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center gap-1.5 text-white/40 animate-pulse">
            <RefreshCcw size={12} className="animate-spin" />
            <span className="text-[10px] uppercase tracking-widest font-medium">Syncing</span>
          </div>
        );
      case 'offline':
        return (
          <div className="flex items-center gap-1.5 text-amber-500/60">
            <CloudOff size={12} />
            <span className="text-[10px] uppercase tracking-widest font-medium">Offline</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1.5 text-red-400/60">
            <AlertCircle size={12} />
            <span className="text-[10px] uppercase tracking-widest font-medium">Sync Error</span>
          </div>
        );
      case 'synced':
      default:
        return (
          <div className="flex items-center gap-1.5 text-white/20 hover:text-white/40 transition-colors">
            <Cloud size={12} />
            <span className="text-[10px] uppercase tracking-widest font-medium">Synced</span>
          </div>
        );
    }
  };

  const handleMobileNavClick = (id: string) => {
    onTabChange(id);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 hidden md:block ${
          isScrolled ? 'bg-[#0f0f0f] border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-[5%] py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <span className="font-display text-xl text-white tracking-tight">LifeOS</span>
            </button>

            <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative ${
                    activeTab === item.id
                      ? 'text-black'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white rounded-full"
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30,
                        mass: 1
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={syncStatus + (session?.userId || '')}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {getSyncIndicator()}
                </motion.div>
              </AnimatePresence>

              {session?.isGuest && (
                <span className="font-mono text-[10px] text-amber-400/60 uppercase tracking-wider">Guest</span>
              )}
              
              <button 
                onClick={logout}
                className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs"
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white text-xs font-bold">L</span>
            </div>
            <span className="font-display text-lg text-white tracking-tight">LifeOS</span>
          </button>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={syncStatus}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                {getSyncIndicator()}
              </motion.div>
            </AnimatePresence>

            {session?.isGuest && (
              <span className="font-mono text-[9px] text-amber-400/60 uppercase tracking-wider">Guest</span>
            )}
            <button 
              onClick={logout}
              className="p-2 text-white/30 active:text-white/60 transition-colors"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-[#0f0f0f]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {filteredMobileNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleMobileNavClick(item.id)}
                className={`flex flex-col items-center justify-center min-w-[64px] py-2 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'text-white'
                    : 'text-white/40 active:text-white'
                }`}
              >
                <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-1 font-medium transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="mobileActiveIndicator"
                    className="absolute bottom-1 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
