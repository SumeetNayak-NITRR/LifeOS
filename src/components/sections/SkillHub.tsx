"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Target, 
  Brain, 
  Zap, 
  ChevronRight, 
  Loader2, 
  CheckCircle2,
  Lock,
  ArrowRight,
  Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { fitnessStore, workStore, routineStore, planningStore, settingsStore } from "@/lib/store";
import SkillSession from "./SkillSession";

interface Skill {
  id: string;
  name: string;
  phase: 'Foundational' | 'Building' | 'Refining';
  why_it_matters: string;
  is_active: boolean;
  weekly_focus?: string;
  daily_practice?: { title: string; description: string };
  ai_insight?: string;
  level: number;
}

const INITIAL_SKILLS = [
  { 
    name: "Communication", 
    why_it_matters: "The bridge between thought and action.", 
    phase: "Foundational" 
  },
  { 
    name: "Discipline", 
    why_it_matters: "Choosing what you want most over what you want now.", 
    phase: "Foundational" 
  },
  { 
    name: "Thinking / Clarity", 
    why_it_matters: "Seeing the signal through the noise.", 
    phase: "Foundational" 
  }
];

export default function SkillHub({ onClose }: { onClose?: () => void }) {
  const { session } = useAuth();
  const user = session;
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);
  const [sessionSkill, setSessionSkill] = useState<Skill | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSkills();
    }
  }, [user]);

  const fetchSkills = async () => {
    if (!user) return;
    try {
      let { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user.userId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed initial skills
        const seedData = INITIAL_SKILLS.map(s => ({ ...s, user_id: user.userId }));
        const { data: seeded, error: seedError } = await supabase
          .from("skills")
          .insert(seedData)
          .select();
        
        if (seedError) throw seedError;
        data = seeded;
      }

      setSkills(data || []);
      const active = data?.find(s => s.is_active);
      if (active) setActiveSkill(active);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagnose = async (skill: Skill) => {
    setDiagnosing(true);
    try {
      const userData = {
        fitness: fitnessStore.get(),
        work: workStore.get(),
        routine: routineStore.get(),
        planning: planningStore.get()
      };

      const res = await fetch("/api/ai/skill-hub", {
        method: "POST",
        body: JSON.stringify({ action: "diagnosis", skill, userData }),
      });
      const { insight } = await res.json();

      const { data, error } = await supabase
        .from("skills")
        .update({ ai_insight: insight })
        .eq("id", skill.id)
        .select()
        .single();

      if (error) throw error;
      setSkills(skills.map(s => s.id === skill.id ? data : s));
      if (activeSkill?.id === skill.id) setActiveSkill(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDiagnosing(false);
    }
  };

  const toggleActive = async (skill: Skill) => {
    const activeCount = skills.filter(s => s.is_active).length;
    if (!skill.is_active && activeCount >= 2) {
      alert("Maximum 2 active skills allowed for focus.");
      return;
    }

    const newActiveState = !skill.is_active;
    try {
      const { data, error } = await supabase
        .from("skills")
        .update({ is_active: newActiveState })
        .eq("id", skill.id)
        .select()
        .single();

      if (error) throw error;
      setSkills(skills.map(s => s.id === skill.id ? data : s));
      
      if (newActiveState) {
        setActiveSkill(data);
        // Generate path if missing
        if (!data.weekly_focus) generatePath(data);
      } else {
        if (activeSkill?.id === skill.id) setActiveSkill(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generatePath = async (skill: Skill) => {
    try {
      const res = await fetch("/api/ai/skill-hub", {
        method: "POST",
        body: JSON.stringify({ action: "generate_path", skill, currentPhase: skill.phase }),
      });
      const { weeklyFocus, dailyPractice } = await res.json();

      const { data, error } = await supabase
        .from("skills")
        .update({ weekly_focus: weeklyFocus, daily_practice: dailyPractice })
        .eq("id", skill.id)
        .select()
        .single();

      if (error) throw error;
      setSkills(skills.map(s => s.id === skill.id ? data : s));
      if (activeSkill?.id === skill.id) setActiveSkill(data);
    } catch (err) {
      console.error(err);
    }
  };

  const onSessionComplete = async (response: string, feedback: string) => {
    if (!sessionSkill || !user) return;
    try {
      await supabase.from("skill_practice_history").insert({
        user_id: user.userId,
        skill_id: sessionSkill.id,
        practice_type: "Practice",
        prompt: sessionSkill.daily_practice?.title || "Daily Practice",
        user_response: response,
        ai_feedback: feedback
      });
      setSessionSkill(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-white/20" size={32} />
    </div>
  );

  const activeSkillsList = skills.filter(s => s.is_active);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      {/* 1. Dashboard (Top Section) */}
      <section className="mb-20">
        <div className="flex items-center gap-2 text-accent mb-4">
          <Brain size={16} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Active Focus Protocols</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeSkillsList.length > 0 ? (
            activeSkillsList.map(skill => (
              <motion.div 
                key={skill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Target size={120} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-display text-white">{skill.name}</h3>
                    <span className="bg-accent/10 text-accent text-[10px] px-3 py-1 rounded-full font-mono uppercase tracking-widest border border-accent/20">
                      {skill.phase}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Zap size={14} className="text-white/20 shrink-0 mt-1" />
                      <p className="text-white/60 text-sm italic">
                        {skill.ai_insight || "Analyzing behavior for neural insights..."}
                        {!skill.ai_insight && (
                          <button 
                            onClick={() => handleDiagnose(skill)}
                            disabled={diagnosing}
                            className="ml-2 text-accent text-xs underline decoration-accent/30 hover:decoration-accent"
                          >
                            Diagnose Now
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest block mb-2">Weekly Focus</span>
                      <p className="text-white text-sm">{skill.weekly_focus || "Generating roadmap..."}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="md:col-span-2 border border-dashed border-white/10 rounded-3xl p-12 text-center">
              <p className="text-white/30 font-mono text-sm">No active focus protocols selected.</p>
              <p className="text-white/10 text-[10px] mt-2 uppercase tracking-widest">Select a skill below to begin training.</p>
            </div>
          )}
        </div>
      </section>

      {/* 2. Skill Cards (Main Grid) */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2 text-white/40">
            <Layers size={16} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Available Pathways</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skills.map(skill => (
            <div 
              key={skill.id}
              className={`bg-white/[0.02] border rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.04] ${skill.is_active ? 'border-accent/30 bg-accent/[0.02]' : 'border-white/5 hover:border-white/10'}`}
            >
              <div className="mb-6">
                <h4 className="text-xl font-medium text-white mb-2">{skill.name}</h4>
                <p className="text-white/40 text-xs leading-relaxed h-10 line-clamp-2">
                  {skill.why_it_matters}
                </p>
              </div>

              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Phase</span>
                  <span className="text-white/60 text-xs">{skill.phase}</span>
                </div>
                {skill.is_active && <CheckCircle2 size={16} className="text-accent" />}
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setSessionSkill(skill)}
                  className="w-full bg-white text-black py-4 rounded-2xl text-xs font-medium hover:bg-white/90 transition-all flex items-center justify-center gap-2"
                >
                  Train Now
                  <Zap size={14} />
                </button>
                <button 
                  onClick={() => toggleActive(skill)}
                  className={`w-full py-4 rounded-2xl text-xs font-medium transition-all flex items-center justify-center gap-2 border ${skill.is_active ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-transparent border-white/5 text-white/20 hover:border-white/20'}`}
                >
                  {skill.is_active ? 'Active Protocol' : 'Set as Active'}
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Session Info / Footer */}
      <footer className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40">
        <div className="flex items-center gap-4">
          <Info size={16} />
          <p className="text-[10px] font-mono uppercase tracking-widest leading-relaxed max-w-sm">
            Neural protocols adapt to your behavior. Engagement increases diagnosis accuracy.
          </p>
        </div>
        <div className="flex gap-10">
          <div className="text-center">
            <span className="block text-white text-lg font-medium">10m</span>
            <span className="text-[8px] font-mono uppercase tracking-widest">Est. Practice</span>
          </div>
          <div className="text-center">
            <span className="block text-white text-lg font-medium">Weekly</span>
            <span className="text-[8px] font-mono uppercase tracking-widest">Evolution Cycle</span>
          </div>
        </div>
      </footer>

      {/* Overlays */}
      <AnimatePresence>
        {sessionSkill && (
          <SkillSession 
            skill={sessionSkill} 
            onClose={() => setSessionSkill(null)}
            onComplete={onSessionComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { Layers } from "lucide-react";
