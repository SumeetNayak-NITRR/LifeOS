"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import Navigation from "@/components/Navigation";
import ReminderManager from "@/components/ReminderManager";
import { useAuth } from "@/components/AuthProvider";
import { settingsStore, subscribeToStore, performDailyReset } from "@/lib/store";

// Lazy load sections for better performance
const Dashboard = dynamic(() => import("@/components/sections/Dashboard"), { ssr: false });
const FitnessCenter = dynamic(() => import("@/components/sections/FitnessCenter"), { ssr: false });
const WorkModule = dynamic(() => import("@/components/sections/WorkModule"), { ssr: false });
const FlowModule = dynamic(() => import("@/components/sections/FlowModule"), { ssr: false });
const FinanceModule = dynamic(() => import("@/components/sections/FinanceModule"), { ssr: false });
const SystemControlCenter = dynamic(() => import("@/components/sections/SystemControlCenter"), { ssr: false });
const HeroStorm = dynamic(() => import("@/components/sections/HeroStorm"), { ssr: false });
const WelcomeKatana = dynamic(() => import("@/components/sections/WelcomeKatana"), { ssr: false });
const SkillHub = dynamic(() => import("@/components/sections/SkillHub"), { ssr: false });
const NeuralTimeline = dynamic(() => import("@/components/sections/NeuralTimeline"), { ssr: false });
const AIInsights = dynamic(() => import("@/components/sections/AIInsights"), { ssr: false });
const LifeOSFooter = dynamic(() => import("@/components/sections/LifeOSFooter"), { ssr: false });

const sections = [
  { id: "hero", component: HeroStorm },
  { id: "mastery", component: WelcomeKatana },
  { id: "dashboard", component: Dashboard },
  { id: "fitness", component: FitnessCenter },
  { id: "work", component: WorkModule },
  { id: "flow", component: FlowModule },
  { id: "finance", component: FinanceModule },
  { id: "features", component: SystemControlCenter },
];

function ScrollSection({ 
  id, 
  children, 
  index 
}: { 
  id: string; 
  children: React.ReactNode; 
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Simplified transforms for better performance on mobile
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0.6, 1, 1, 0.6] // Less aggressive opacity shift
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [20, 0, 0, -20] // Smaller displacement
  );

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, y }}
      className="min-h-screen relative overflow-hidden"
    >
      <Suspense fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
        </div>
      }>
        {children}
      </Suspense>
    </motion.section>
  );
}

function ResetPrompt({ onComplete }: { onComplete: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const settings = settingsStore.get();
    if (!settings.promptDismissed && !settings.dailyResetEnabled) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = () => {
    const settings = settingsStore.get();
    settingsStore.save({ ...settings, dailyResetEnabled: true, promptDismissed: true });
    setShow(false);
    onComplete();
  };

  const handleDismiss = () => {
    const settings = settingsStore.get();
    settingsStore.save({ ...settings, promptDismissed: true });
    setShow(false);
  };

  if (!show) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[min(90vw,400px)]"
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        <h4 className="font-display text-lg text-white mb-2">Enable Daily Resets?</h4>
        <p className="text-white/40 text-sm mb-6 leading-relaxed">
          Keep your logs clean. Fitness, tasks, and habits will refresh daily while preserving your history.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={handleEnable}
            className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Enable Resets
          </button>
          <button 
            onClick={handleDismiss}
            className="flex-1 bg-white/5 text-white py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  const [showNeuralTimeline, setShowNeuralTimeline] = useState(false);
  const [showSkillHub, setShowSkillHub] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState(sections);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingRef = useRef(false);
  const lastSnapPos = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTime = useRef(Date.now());
  const lastScrollY = useRef(0);
  const velocity = useRef(0);
  const { session } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    performDailyReset();
    
    // Initial modules check
    const settings = settingsStore.get();
    updateVisibleSections(settings);

    // Subscribe to store changes for module toggles
    const unsubscribe = subscribeToStore(() => {
      updateVisibleSections(settingsStore.get());
    });

    if (typeof window !== "undefined") {
      lastScrollY.current = window.scrollY;
      lastSnapPos.current = window.scrollY;
    }

    const isWelcome = searchParams.get('welcome');
    const isGuest = searchParams.get('guest');
    
    if (isWelcome === 'true') {
      setWelcomeMessage("Welcome to LifeOS. Your personal dashboard is ready.");
      setTimeout(() => setWelcomeMessage(null), 4000);
    } else if (isGuest === 'true') {
      setWelcomeMessage("Guest mode active. Your data is temporary.");
      setTimeout(() => setWelcomeMessage(null), 4000);
    }

    // Force mount after 3 seconds to prevent infinite loading screen on mobile
    const mountTimer = setTimeout(() => setMounted(true), 3000);

    return () => {
      unsubscribe();
      clearTimeout(mountTimer);
    };
  }, [searchParams]);

  const updateVisibleSections = (settings: any) => {
    const modules = settings.modules || { fitness: true, finance: true, flow: true };
    const filtered = sections.filter(s => {
      if (s.id === 'fitness') return modules.fitness;
      if (s.id === 'finance') return modules.finance;
      if (s.id === 'flow') return modules.flow;
      return true; // hero, mastery, dashboard, work, objectives, flow, features (system) are always visible
    });
    setVisibleSections(filtered);
  };

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const now = Date.now();
      const currentY = window.scrollY;
      const dt = now - lastScrollTime.current;
      
      if (dt > 0) {
        velocity.current = Math.abs(currentY - lastScrollY.current) / dt;
      }

      lastScrollTime.current = now;
      lastScrollY.current = currentY;

      if (isScrollingRef.current) return;

      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(handleSnap, 150);
    };

    const handleSnap = () => {
      if (isScrollingRef.current) return;
      if (window.innerWidth < 768) return; // Disable snapping on mobile for better native feel

      const currentY = window.scrollY;
      const vh = window.innerHeight;
      const navHeight = 80;
      
      const direction = currentY > lastSnapPos.current ? "down" : "up";
      const sectionElements = sections.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      
      // Find the current section index
      let currentIndex = -1;
      for (let i = 0; i < sectionElements.length; i++) {
        const el = sectionElements[i];
        const top = el.offsetTop - navHeight;
        const nextTop = sectionElements[i + 1] ? sectionElements[i + 1].offsetTop - navHeight : Infinity;
        
        if (currentY >= top - 20 && currentY < nextTop - 20) {
          currentIndex = i;
          break;
        }
      }

      if (currentIndex === -1) {
        lastSnapPos.current = currentY;
        return;
      }

      const VELOCITY_THRESHOLD = 0.8;
      const SNAP_THRESHOLD = 0.5;

      if (direction === "down") {
        const nextSection = sectionElements[currentIndex + 1];
        if (nextSection) {
          const nextTop = nextSection.offsetTop - navHeight;
          const distToNext = nextTop - currentY;
          const progress = 1 - (distToNext / vh);

          if (progress > SNAP_THRESHOLD || velocity.current > VELOCITY_THRESHOLD) {
            scrollToSection(nextSection.id);
            return;
          }
        }
      } else {
        const currentSection = sectionElements[currentIndex];
        const currentTop = currentSection.offsetTop - navHeight;
        const distToPrev = currentY - currentTop;
        const progress = distToPrev / vh;

        if (progress < (1 - SNAP_THRESHOLD) || velocity.current > VELOCITY_THRESHOLD) {
          scrollToSection(currentSection.id);
          return;
        }
      }

      // If no snap conditions met, stay exactly where we are
      lastSnapPos.current = currentY;
    };

    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isScrollingRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        sectionRefs.current.set(id, element);
      }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [mounted]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    isScrollingRef.current = true;
    setActiveSection(id);

    const navHeight = 80;
    const offsetPosition = element.offsetTop - navHeight;
    const startPos = window.scrollY;
    const distance = offsetPosition - startPos;
    const duration = 800;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      window.scrollTo(0, startPos + distance * ease);

      if (progress < 1) requestAnimationFrame(animate);
      else {
        isScrollingRef.current = false;
        lastSnapPos.current = offsetPosition;
      }
    }
    requestAnimationFrame(animate);
  };

  const triggerReset = () => {
    performDailyReset();
    setResetKey(prev => prev + 1);
  };

  if (!mounted) return <div className="min-h-screen bg-[#0f0f0f]" />;

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white selection:bg-white/10">
      <Navigation activeTab={activeSection} onTabChange={scrollToSection} />
      
      <AnimatePresence>
        {showNeuralTimeline && (
          <NeuralTimeline onClose={() => setShowNeuralTimeline(false)} />
        )}
      </AnimatePresence>

      {welcomeMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-white/5 border border-white/10 rounded-lg px-6 py-3"
        >
          <p className="text-white/60 text-sm">{welcomeMessage}</p>
        </motion.div>
      )}
      
      <div className="relative z-10 pt-16 md:pt-20 pb-24 md:pb-0" key={resetKey}>
        {visibleSections.map(({ id, component: Component }, index) => (
          <ScrollSection key={id} id={id} index={index}>
            <Component 
              onOpenNeuralTimeline={() => setShowNeuralTimeline(true)} 
              onOpenSkillHub={() => setShowSkillHub(true)}
            />
          </ScrollSection>
        ))}
      </div>

      <AnimatePresence>
        {showSkillHub && (
          <div className="fixed inset-0 z-[100] bg-black">
            <button 
              onClick={() => setShowSkillHub(false)}
              className="absolute top-8 right-8 z-[110] p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/40 hover:text-white transition-all backdrop-blur-xl"
            >
              <X size={24} />
            </button>
            <div className="h-full overflow-y-auto custom-scrollbar">
              <SkillHub onClose={() => setShowSkillHub(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>

      <ResetPrompt onComplete={triggerReset} />
      <ReminderManager activeSection={activeSection} />
      <AIInsights />
      <LifeOSFooter />
    </main>
  );
}
