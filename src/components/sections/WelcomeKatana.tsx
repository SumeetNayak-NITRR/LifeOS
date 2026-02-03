import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const WelcomeKatana = ({ onOpenSkillHub }: { onOpenSkillHub?: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked by browser policies
      });
    }
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#0d0d0d] text-white">
      {/* 3D Katana Stage Background */}
      <div className="katana-stage relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Synthetic 3D Katana Model Placeholder */}
        {/* In the original site, this is a Three.js canvas. We simulate the visual with a high-fidelity container */}
        <div className="katana-stick absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <div className="sword relative w-full h-full flex items-center justify-center">
             {/* 
                Since we cannot run the full Three.js scene here without external heavy libs, 
                we visualize the 'Katana Stage' atmospheric background. 
             */}
            <div className="absolute w-[120%] h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-[-15deg] blur-sm opacity-50"></div>
          </div>
        </div>

        {/* Hero Content Section */}
        <section className="c-welcome relative z-10 w-full flex flex-col items-center justify-center px-10 py-20 text-center">
          <div className="container max-w-[1440px] w-full flex flex-col items-center">
            
            {/* Version Tag */}
            <span className="v font-mono text-[12px] font-bold uppercase tracking-widest text-[#808080] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              v_ 1.1.46
            </span>

            {/* Headline: Master Your Life */}
            <h2 className="font-display text-[clamp(40px,6vw,64px)] leading-[1.1] tracking-[-0.02em] mb-12 flex flex-col sm:block">
              <span className="inline-block px-2">Design</span>
              <span className="inline-block px-2">Your</span>
              <span className="inline-block px-2">Reality</span>
              <span className="block sm:inline font-sans text-[clamp(24px,4vw,32px)] opacity-80 mt-2 sm:mt-0 font-light">
                <span className="mx-2">With</span>
                <span className="block sm:inline">LifeOS</span>
              </span>
            </h2>

            {/* Performance Hub Video Link */}
            <button 
              onClick={onOpenSkillHub}
              className="skill-hub-link group relative block w-[280px] aspect-video overflow-hidden rounded-sm border border-white/10 transition-all duration-500 hover:border-accent hover:scale-105"
              aria-label="Skill Hub"
            >
              <div className="video-wrap w-full h-full bg-black">
                <video 
                  ref={videoRef}
                  src="https://string-tune.fiddle.digital/videos/skill-hub-link.mp4" 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/10 transition-colors">
                <span className="font-mono text-[10px] items-center flex gap-2 tracking-[0.2em] uppercase opacity-70 group-hover:opacity-100 group-hover:text-accent">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                    Skill Hub
                </span>
              </div>
            </button>

            {/* Brand Name Footer */}
            <h1 className="the-name font-display text-[clamp(80px,15vw,160px)] leading-[0.8] tracking-[-0.04em] mt-16 mb-8 select-none">
              <span className="flex flex-col sm:flex-row items-center justify-center gap-x-8">
                <span>Life</span>
                <span className="opacity-40">OS</span>
              </span>
            </h1>

            {/* Subtitles */}
            <div className="flex flex-col items-center gap-2">
              <span className="sub font-mono text-[12px] uppercase tracking-widest text-[#808080]">
                Integrated Intelligence & Performance Architecture
              </span>
              <span className="sub font-mono text-[12px] uppercase tracking-widest text-[#808080]">
                Advanced Routine Optimization
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Atmospheric Transition Section */}
      <section className="c-transition relative h-screen flex items-center justify-center pointer-events-none">
        <div className="container flex flex-col items-center text-center">
          <div className="font-display text-[clamp(40px,6vw,64px)] tracking-[-0.02em] space-y-32">
            <div className="flex justify-center gap-1 opacity-20">
              {"CONCENTRATE".split("").map((char, i) => (
                <span key={i} className="inline-block">{char}</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Progress Indicator - Visualized as a thin center line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-[1px] bg-gradient-to-b from-transparent to-white/30"></div>
      </section>

      {/* CSS For Specific Section Transitions */}
      <style jsx global>{`
        .katana-stage {
          background-image: radial-gradient(circle at center, #1a1a1a 0%, #0d0d0d 100%);
        }
        
        .skill-hub-link {
          box-shadow: 0 0 30px rgba(0,0,0,0.5);
        }

        .skill-hub-link::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(57, 255, 20, 0.1), transparent);
          transform: rotate(45deg);
          transition: 0.5s;
          pointer-events: none;
        }

        .skill-hub-link:hover::before {
          left: 100%;
          top: 100%;
        }
      `}</style>
    </div>
  );
};

export default WelcomeKatana;