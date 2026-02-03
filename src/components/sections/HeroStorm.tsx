"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

/**
 * HeroStorm Component
 * 
 * Clones the dark intro storm section including:
 * - Animated monologue text "🌦️ Ah, you’ve finally awaked…"
 * - Background canvas element for cinematic atmospheric effects.
 * - Atmospheric corner graphics (TR and BL).
 * 
 * Technical Implementation:
 * - Uses Framer Motion for text reveal and atmospheric fade-ins.
 * - Custom Canvas particle/rain effect to mimic the "storm" feel.
 * - Absolute positioning for corner graphics consistent with original layout.
 */

const HeroStorm: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textVisible, setTextVisible] = useState(false);

  // Storm Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
      let w = canvas.width = window.innerWidth;
      let h = canvas.height = window.innerHeight;

      const isMobile = w < 768;
      const particles: { x: number; y: number; l: number; v: number }[] = [];
      const maxParticles = isMobile ? 30 : 60; // Reduced particles on mobile

      for (let i = 0; i < maxParticles; i++) {
          particles.push({
              x: Math.random() * w,
              y: Math.random() * h,
              l: Math.random() * 20 + 10,
              v: isMobile ? Math.random() * 10 + 3 : Math.random() * 15 + 5 // Slower on mobile
          });
      }

    const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';

        particles.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (p.v * 0.1), p.y + p.l);
            ctx.stroke();

            p.y += p.v;
            if (p.y > h) {
                p.y = -p.l;
                p.x = Math.random() * w;
            }
        });

        animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();
    
    // Delayed text entrance
    const timer = setTimeout(() => setTextVisible(true), 1200);

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0f0f0f] flex items-center justify-center">
      {/* Background Storm Canvas */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* Atmospheric Corner Graphics */}
      {/* Top Right Graphic */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] max-w-[600px] pointer-events-none z-10 opacity-60 mix-blend-screen">
        <Image 
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/polygon-bg-4.jpg"
          alt="Atmospheric storm graphics top right"
          fill
          className="object-cover object-top-right transform scale-x-[-1] opacity-40 grayscale"
          priority
        />
        {/* Gradients to blend the hard edge of the background image */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f0f]" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0f0f0f]" />
      </div>

      {/* Bottom Left Graphic */}
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-[800px] pointer-events-none z-10 opacity-30 mix-blend-screen">
        <Image 
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/polygon-bg-4.jpg"
          alt="Atmospheric storm graphics bottom left"
          fill
          className="object-cover object-bottom-left grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#0f0f0f]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0f0f0f]" />
      </div>

      {/* Main Monologue Container */}
      <div className="relative z-20 container mx-auto px-[5%] flex flex-col items-center">
        <div 
          className={`transition-all duration-1000 ease-out transform ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
            <div className="monologue text-center max-w-2xl">
              <p className="text-[24px] md:text-[28px] lg:text-[32px] font-display italic text-[#d1d1d1] leading-relaxed tracking-tight">
                <span className="inline-block mr-3 transform scale-125">⚡</span>
                <span className="opacity-90">Initializing LifeOS Architecture…</span>
                <span className="inline-block animate-pulse ml-1">…</span>
              </p>
              
              <div className="mt-8 flex justify-center items-center gap-4">
                <div className="h-[1px] w-12 bg-white/10" />
                <span className="font-technical text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  Optimizing Existence
                </span>
                <div className="h-[1px] w-12 bg-white/10" />
              </div>
            </div>
        </div>
      </div>

      {/* Intro Center Character (Japanese 'be' equivalent from screenshot) */}
      <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-opacity duration-1000 ${textVisible ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-[72px] text-white font-sans font-light select-none">
          心
        </span>
      </div>

      {/* Subtle Noise Overlay Gradient (Cinematic feel) handled by globals.css body::before */}
      
      {/* Scroll indicator - very subtle line at bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="font-technical text-[9px] text-white/20 uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      <style jsx global>{`
        .font-technical {
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
        }
      `}</style>
    </div>
  );
};

export default HeroStorm;