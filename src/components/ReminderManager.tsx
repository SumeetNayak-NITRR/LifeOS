"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCircle2, Trophy, Flame, Calendar } from "lucide-react";
import { 
  workStore, 
  fitnessStore, 
  routineStore, 
  planningStore, 
  reminderStore,
  subscribeToStore 
} from "@/lib/store";

interface Reminder {
  id: string;
  text: string;
  icon: React.ReactNode;
  section?: string;
}

export default function ReminderManager({ activeSection }: { activeSection: string }) {
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    return subscribeToStore(() => {
      // Re-evaluate if data changes? Maybe too frequent.
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for reminders whenever activeSection changes
    const checkReminders = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0-6 (Sun-Sat)
      const reminders = reminderStore.get();

      if (reminders.shownToday.length >= 2) return;

      const work = workStore.get();
      const fitness = fitnessStore.get();
      const routine = routineStore.get();
      const planning = planningStore.get();

      let potentialReminders: Reminder[] = [];

      // 1. Task Reminder (Evening awareness)
      if (hour >= 15 && hour < 21 && !reminders.shownToday.includes('task')) {
        const pendingTasks = work.tasks.filter(t => t.status === 'pending');
        if (pendingTasks.length > 0) {
          potentialReminders.push({
            id: 'task',
            text: "One task is still open for today.",
            icon: <CheckCircle2 className="text-white/40" size={18} />,
            section: 'work'
          });
        }
      }

      // 2. Fitness Reminder (Evening awareness)
      if (hour >= 18 && hour < 21 && !reminders.shownToday.includes('fitness')) {
        const todayStr = now.toISOString().split('T')[0];
        const loggedToday = fitness.recentActivity.some(a => 
          new Date(a.timestamp).toISOString().split('T')[0] === todayStr
        );
        if (!loggedToday) {
          potentialReminders.push({
            id: 'fitness',
            text: "Movement hasn’t been logged today.",
            icon: <Flame className="text-white/40" size={18} />,
            section: 'fitness'
          });
        }
      }

      // 3. Routine Reminder (Night awareness)
      if (hour >= 20 && !reminders.shownToday.includes('routine')) {
        const eveningRoutine = routine.routines.find(r => r.id === 'evening');
        const incomplete = eveningRoutine?.items.some(i => !i.done);
        if (incomplete) {
          potentialReminders.push({
            id: 'routine',
            text: "Evening routine is still open.",
            icon: <Bell className="text-white/40" size={18} />,
            section: 'routine'
          });
        }
      }

      // 4. Planning Reminder (Midweek awareness)
      if (day >= 3 && day <= 4 && hour >= 10 && hour < 20 && !reminders.shownToday.includes('planning')) {
        if (planning.weeklyGoals.length === 0 || planning.weeklyGoals.every(g => g.text === '')) {
          potentialReminders.push({
            id: 'planning',
            text: "This week doesn’t have a clear focus yet.",
            icon: <Calendar className="text-white/40" size={18} />,
            section: 'planning'
          });
        }
      }

      // Prioritize reminder relevant to current section if any
      const relevantReminder = potentialReminders.find(r => r.section === activeSection || activeSection === 'dashboard');
      
      if (relevantReminder && !currentReminder) {
        showReminder(relevantReminder);
      }
    };

    // Small delay to ensure we are not mid-scroll or mid-animation
    const timeout = setTimeout(checkReminders, 2000);
    return () => clearTimeout(timeout);
  }, [activeSection, mounted, currentReminder]);

  const showReminder = (reminder: Reminder) => {
    setCurrentReminder(reminder);
    
    // Save that we've shown it
    const store = reminderStore.get();
    reminderStore.save({
      ...store,
      shownToday: [...store.shownToday, reminder.id]
    });

    // Auto-dismiss after 8 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentReminder(null);
    }, 8000);
  };

  const dismiss = () => {
    setCurrentReminder(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {currentReminder && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className="fixed bottom-24 right-8 z-[60] w-[320px]"
        >
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-xl flex items-start gap-4 group">
            <div className="mt-0.5">
              {currentReminder.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-white/80 leading-snug">
                {currentReminder.text}
              </p>
            </div>
            <button 
              onClick={dismiss}
              className="text-white/20 hover:text-white transition-colors p-1 -mr-1"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
