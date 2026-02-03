import React from 'react';
import Image from 'next/image';

/**
 * Techniques Component
 * 
 * Clones the Principles section of StringTune.
 * Features:
 * - "Master the sword" cinematic intro with a 3D-style katana display
 * - "StringTune Principles" wavy headline
 * - Specialized grid for modular architecture, attribute-based integration, etc.
 * - Dark theme implementation as per the <theme> specification.
 */
export default function Techniques() {
  return (
    <section className="relative w-full bg-[#0d0d0d] text-white pt-24 pb-40 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="noise-overlay" />

      {/* Cinematic Sword Stage */}
      <div className="container relative z-10 mb-32">
        <div className="flex flex-col items-center justify-center text-center space-y-12">
          <p className="font-display text-[32px] md:text-[40px] leading-tight max-w-2xl">
            To master the sword is to master <span className="text-[#39ff14] italic">the self…</span>
          </p>

          <div className="relative w-full max-w-4xl aspect-[21/9] flex items-center justify-center">
            {/* SVG Background Patterns - Precision Lines */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none opacity-20" 
              viewBox="0 0 1000 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="0" y1="200" x2="1000" y2="200" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1="500" y1="0" x2="500" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
              <circle cx="500" cy="200" r="150" stroke="white" strokeWidth="0.5" strokeDasharray="8 8" />
            </svg>

            {/* 3D Sword Display Placeholder (represented by a high-quality centered element) */}
            <div className="relative z-10 w-full h-full flex items-center justify-center group">
              <div className="relative w-[80%] h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {/* Simulated Hilt/Guard */}
                <div className="absolute left-1/4 -top-4 w-1 h-8 bg-white/40 blur-[1px]" />
                <div className="absolute left-[calc(25%+4px)] -top-2 w-16 h-4 bg-[#1a1a1a] border border-white/20 rounded-sm" />
              </div>
              
              {/* Labels around the sword */}
              <span className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-[#808080]">
                Flow Control
              </span>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-8 font-mono text-[10px] uppercase tracking-widest text-[#808080]">
                <span>S</span>
                <span>W</span>
                <span>E</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl pt-8 border-t border-white/10">
            <span className="font-display text-xl md:text-2xl opacity-60">To master the String…</span>
            <div className="my-4 md:my-0">
               {/* Logo Symbol Placeholder */}
               <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
               </div>
            </div>
            <span className="font-display text-xl md:text-2xl opacity-60">is to master the code.</span>
          </div>
        </div>
      </div>

      {/* Main Principles Header */}
      <div className="container relative z-10 mb-24 text-center">
        <div className="inline-block relative">
          <h2 className="font-display text-[64px] md:text-[100px] leading-[0.9] tracking-tighter">
            StringTune
          </h2>
          {/* Wavy Bend Effect (Visual Representation) */}
          <div className="absolute -bottom-4 left-0 w-full h-8 overflow-hidden">
             <svg className="w-full h-full text-white/10" viewBox="0 0 1000 100" preserveAspectRatio="none">
               <path d="M0,50 C200,100 400,0 600,50 C800,100 1000,0 1000,50" fill="none" stroke="currentColor" strokeWidth="2" />
             </svg>
          </div>
        </div>
        <h2 className="font-display text-[64px] md:text-[100px] leading-[0.9] tracking-tighter mt-2">
          Principles
        </h2>
      </div>

      {/* Features Grid */}
      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-20 max-w-6xl mx-auto">
          
          {/* Item 1 */}
          <div className="flex flex-col space-y-6 pt-10 border-t border-white/10">
            <div className="w-12 h-12 relative opacity-80">
              <Image 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/flashing-circle-5.png"
                alt="Modular"
                width={48}
                height={48}
                className="brightness-0 invert p-1"
              />
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-3xl md:text-4xl">Modular Architecture</h3>
              <p className="text-lg text-[#e0e0e0] leading-relaxed">
                Craft only what you need.
              </p>
              <p className="text-sm text-[#808080] font-mono leading-snug">
                Every piece stands alone — or flows as one.
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col space-y-6 pt-10 border-t border-white/10">
            <div className="w-12 h-12 flex items-center justify-center border border-white/20 rounded">
               <span className="font-mono text-[10px]">FIX</span>
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-3xl md:text-4xl">Attribute-Based Integration</h3>
              <p className="text-lg text-[#e0e0e0] leading-relaxed">
                No learning curve. Just a signal.
              </p>
              <p className="text-sm text-[#808080] font-mono leading-snug">
                Use simple attributes to activate power directly in HTML.
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col space-y-6 pt-10 border-t border-white/10">
            <div className="w-12 h-12 flex items-center justify-center border border-white/20 rounded-full">
               <div className="w-4 h-4 bg-white/20 rounded-full" />
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-3xl md:text-4xl">Effortless Initialization</h3>
              <p className="text-lg text-[#e0e0e0] leading-relaxed">
                No ceremony. No bloat.
              </p>
              <p className="text-sm text-[#808080] font-mono leading-snug">
                Import, set the tune — done.
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex flex-col space-y-6 pt-10 border-t border-white/10">
            <div className="w-12 h-12 flex items-center justify-center">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 24h40M24 4v40" strokeLinecap="round" />
                <circle cx="24" cy="24" r="12" />
              </svg>
            </div>
            <div className="space-y-4">
              <h3 className="font-display text-3xl md:text-4xl">Wide Range of Effects</h3>
              <p className="text-lg text-[#e0e0e0] leading-relaxed">
                From calm ripples to sharp strikes.
              </p>
              <p className="text-sm text-[#808080] font-mono leading-snug">
                Control motion, depth, and presence across scroll, hover, visibility, and more.
              </p>
            </div>
          </div>

          {/* Item 5 - Performance */}
          <div className="flex flex-col space-y-6 pt-10 border-t border-white/10 md:col-span-2">
            <div className="flex gap-4">
               <div className="w-12 h-12 border border-[#39ff14]/30 rounded flex items-center justify-center">
                 <div className="w-6 h-[1px] bg-[#39ff14]" />
               </div>
               <div className="w-12 h-12 border border-white/10 rounded flex items-center justify-center">
                 <div className="w-1 h-6 bg-white/40" />
               </div>
            </div>
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-display text-3xl md:text-4xl">Performance Oriented</h3>
              <p className="text-lg text-[#e0e0e0] leading-relaxed">
                Fast as a cut. Light as breath.
              </p>
              <p className="text-sm text-[#808080] font-mono leading-snug">
                Engineered for speed. Low memory, zero layout shifts, native-friendly.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Full-Width Sword Mock (Bottom) */}
      <div className="mt-40 opacity-10 pointer-events-none select-none">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white to-transparent" />
        <div className="mt-2 text-center font-mono text-[10px] tracking-[2em] uppercase">
          Precision Engineering
        </div>
      </div>

      <style jsx>{`
        .font-pixel {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      `}</style>
    </section>
  );
}