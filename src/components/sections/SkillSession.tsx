"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Send, ArrowRight } from "lucide-react";

interface Practice {
  type: string;
  prompt: string;
  context: string;
}

interface SkillSessionProps {
  skill: { id: string; name: string };
  onClose: () => void;
  onComplete: (response: string, feedback: string) => void;
}

export default function SkillSession({ skill, onClose, onComplete }: SkillSessionProps) {
  const [loading, setLoading] = useState(true);
  const [practice, setPractice] = useState<Practice | null>(null);
  const [userResponse, setUserResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    generatePractice();
  }, []);

  const generatePractice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/skill-hub", {
        method: "POST",
        body: JSON.stringify({ action: "generate_practice", skill }),
      });
      const data = await res.json();
      setPractice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userResponse.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/skill-hub", {
        method: "POST",
        body: JSON.stringify({ 
          action: "submit_practice", 
          skill, 
          practiceData: practice, 
          userResponse 
        }),
      });
      const data = await res.json();
      setFeedback(data.feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-2 text-accent mb-8">
            <Sparkles size={16} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{skill.name} • Practice Session</span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-white/20" size={32} />
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Generating Practice Scenario...</p>
            </div>
          ) : practice ? (
            <AnimatePresence mode="wait">
              {!feedback ? (
                <motion.div 
                  key="practice"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display text-white mb-4 leading-tight">
                      {practice.prompt}
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {practice.context}
                    </p>
                  </div>

                  <div className="relative">
                    <textarea 
                      value={userResponse}
                      onChange={(e) => setUserResponse(e.target.value)}
                      placeholder="Your response..."
                      className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/10 focus:outline-none focus:border-white/20 transition-all resize-none"
                    />
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting || !userResponse.trim()}
                      className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-xl hover:bg-white/90 transition-all disabled:opacity-0 active:scale-95"
                    >
                      {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="feedback"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-4">AI Feedback</h3>
                    <p className="text-lg text-white leading-relaxed italic">
                      "{feedback}"
                    </p>
                  </div>

                  <button 
                    onClick={() => onComplete(userResponse, feedback)}
                    className="w-full bg-white text-black py-5 rounded-2xl font-medium flex items-center justify-center gap-3 hover:bg-white/90 transition-all active:scale-[0.98]"
                  >
                    Complete Session
                    <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
