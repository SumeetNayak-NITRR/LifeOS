"use client";

import React, { useEffect, useRef, useState } from 'react';

const ScrollTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Phrases to transition through
  const phrases = [
    { text: "Concentrate", id: 1 },
    { text: "Keep Scrolling", id: 2 },
    { text: "The Spirit Awakened", id: 3 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the section has been scrolled
      // The section is intentionally tall (800vh according to computed styles)
      const totalHeight = rect.height;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / (totalHeight - windowHeight)));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Map progress to specific word visibility
  const getPhraseOpacity = (index: number) => {
    const sectionSize = 1 / phrases.length;
    const start = index * sectionSize;
    const end = (index + 1) * sectionSize;
    
    // Create a bell-like curve for opacity based on progress
    if (scrollProgress >= start && scrollProgress <= end) {
      const mid = (start + end) / 2;
      const dist = Math.abs(scrollProgress - mid);
      const normalizedDist = dist / (sectionSize / 2);
      return Math.max(0, 1 - normalizedDist);
    }
    return 0;
  };

  const getPhraseTransform = (index: number) => {
    const sectionSize = 1 / phrases.length;
    const mid = (index * sectionSize + (index + 1) * sectionSize) / 2;
    const offset = (scrollProgress - mid) * 100; // Moves text slightly up/down
    return `translateY(${-offset}px)`;
  };

  return (
    <section 
      ref={containerRef}
      className="c-transition relative" 
      style={{ 
        height: '600vh', // Large height for scroll duration
        backgroundColor: '#0F0F0F',
        pointerEvents: 'none'
      }}
    >
      <div className="sticky top-0 left-0 w-full h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Progress Line */}
        <div 
          className="progress absolute right-[5%] h-[40%] w-[1px] bg-white/10 overflow-hidden"
          style={{ top: '30%' }}
        >
          <div 
            className="w-full bg-white transition-transform duration-100"
            style={{ 
              height: '100%', 
              transform: `translateY(${scrollProgress * 100}%)`,
              transformOrigin: 'top'
            }}
          />
        </div>

        {/* Centered Text Container */}
        <div className="-w flex flex-col items-center justify-center text-center w-full max-w-[90vw]">
          {phrases.map((phrase, idx) => (
            <div
              key={phrase.id}
              className="absolute transition-all duration-300 ease-out"
              style={{
                opacity: getPhraseOpacity(idx),
                transform: getPhraseTransform(idx),
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 6vw, 80px)',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              <div className="flex flex-wrap justify-center gap-[0.2em]">
                {phrase.text.split(' ').map((word, wIdx) => (
                  <span key={wIdx} className="inline-block whitespace-nowrap">
                    {word.split('').map((char, cIdx) => {
                      // Character split logic for pixel-perfect match to HTML structure
                      return (
                        <span 
                          key={cIdx} 
                          className="inline-block"
                          style={{
                            transition: 'transform 0.5s ease-out',
                            transitionDelay: `${cIdx * 20}ms`,
                            transform: `translateY(${(1 - getPhraseOpacity(idx)) * 20}px)`
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                    &nbsp;
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Meta tags / Decorative elements */}
        <div className="absolute bottom-[5%] left-[5%] flex flex-col gap-2">
           <span className="font-technical text-[#666666]">PHASE_TRANSITION</span>
           <div className="w-12 h-[1px] bg-white/20"></div>
        </div>
        
        <div className="absolute top-[5%] right-[5%] flex items-center gap-4">
           <span className="font-technical text-[#666666] text-[10px]">SCROLL_STRENGTH</span>
           <span className="font-technical text-white text-[12px] tabular-nums">
             {(scrollProgress * 100).toFixed(0)}%
           </span>
        </div>
      </div>
      
      {/* Visual background gradient to match cinematic feel */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#0F0F0F]/50 to-[#0F0F0F]" />
    </section>
  );
};

export default ScrollTransition;