"use client";

import React, { useMemo } from 'react';
import { MousePointer2 } from 'lucide-react';

interface PrincipleCardProps {
  icon: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  className?: string;
}

const PrincipleCard: React.FC<PrincipleCardProps> = ({ icon, title, shortDesc, fullDesc, className }) => (
  <div className={`flex flex-col gap-4 py-8 border-t border-white/10 ${className}`}>
    <div className="w-12 h-12 flex items-center justify-center mb-4">
      <img 
        src={icon} 
        alt={title} 
        className="w-full h-full object-contain filter invert opacity-80" 
      />
    </div>
    <h3 className="font-display text-[32px] md:text-[40px] leading-tight font-semibold tracking-tight text-white">
      {title}
    </h3>
    <div className="space-y-4">
      <p className="font-sans text-[18px] text-white/90">
        {shortDesc}
      </p>
      <p className="font-sans text-[14px] text-[#a1a1a1] leading-relaxed">
        {fullDesc}
      </p>
    </div>
  </div>
);

const Principles: React.FC = () => {
  const principles = [
    {
      icon: "https://string-tune.fiddle.digital/images/icons/techniques/icon-48_modular-architecture.svg",
      title: "Modular Architecture",
      shortDesc: "Craft only what you need.",
      fullDesc: "Every piece stands alone — or flows as one. Designed with a lightweight, modular architecture that lets you import only what you need."
    },
    {
      icon: "https://string-tune.fiddle.digital/images/icons/techniques/icon-48_attribute-based.svg",
      title: "Attribute-Based Integration",
      shortDesc: "No learning curve. Just a signal.",
      fullDesc: "Use simple attributes to activate power directly in HTML. Configure behavior directly in your markup with attribute-based controls."
    },
    {
      icon: "https://string-tune.fiddle.digital/images/icons/techniques/icon-48_effortless-initialization.svg",
      title: "Effortless Initialization",
      shortDesc: "No ceremony. No bloat.",
      fullDesc: "Import, set the tune — done. Get started fast. Markup-first. No JS wizardry required until you really need it."
    },
    {
      icon: "https://string-tune.fiddle.digital/images/icons/techniques/icon-48_effects-range.svg",
      title: "Wide Range of Effects",
      shortDesc: "From calm ripples to sharp strikes.",
      fullDesc: "Control motion, depth, and presence across scroll, hover, visibility, and more. Captivating websites with ease."
    },
    {
      icon: "https://string-tune.fiddle.digital/images/icons/techniques/icon-48_performance-oriented.svg",
      title: "Performance Oriented",
      shortDesc: "Fast as a cut. Light as breath.",
      fullDesc: "Engineered for speed. Low memory, zero layout shifts, native-friendly. Uses native scroll, refined by a precision smoothing formula."
    }
  ];

  return (
    <section className="relative w-full bg-[#0F0F0F] text-white overflow-hidden pt-32 pb-20">
      <div className="container mx-auto px-[5%]">
        {/* Decorative Top Section with Sword Interaction Concept */}
        <div className="relative mb-40 text-center">
          <div className="inline-block mb-12">
            <span className="font-technical text-[#666666] tracking-[0.2em] block mb-4">
              TECHNIQUES & MASTERY
            </span>
            <div className="flex flex-col items-center justify-center">
              <span className="font-display text-[24px] md:text-[32px] text-white/80 opacity-60 italic mb-8">
                To master the sword is to master <span className="text-[#FF3E00]">the self...</span>
              </span>
              
              {/* 3D Sword Placeholder / Interactive Area */}
              <div className="relative w-full max-w-[800px] h-[120px] mx-auto flex items-center justify-center group cursor-crosshair">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent">
                  {/* Subtle Sword Graphic Mockup */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-8 border-x border-white/5 pointer-events-none flex items-center justify-center">
                    <div className="w-full h-[1px] bg-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-300 group-hover:h-[2px] group-hover:bg-white" />
                  </div>
                </div>
                
                {/* Compass HUD Elements */}
                <div className="absolute top-0 left-0 p-4 font-technical text-[10px] text-[#666666]">FLOW<br/>CONTROL</div>
                <div className="absolute top-0 right-0 p-4"><MousePointer2 size={16} className="text-[#666666]" /></div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-8 font-technical text-[10px] text-[#666666]">
                  <span>S</span>
                  <span>W</span>
                  <span>E</span>
                </div>
              </div>

              <div className="flex justify-between w-full max-w-[800px] mt-12 px-4 italic text-white/40 font-display text-lg">
                <span>To master the String...</span>
                <span>is to master the code.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Headline with Wavy Effect Concept */}
        <div className="relative z-10 mb-24 text-center">
          <h2 className="font-display text-[64px] md:text-[120px] leading-[0.85] font-bold tracking-tight">
            <span className="block relative">
              StringTune
              {/* SVG mask line simulation */}
              <div className="absolute -bottom-4 left-0 w-full h-1 bg-white/5 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#FF3E00] to-transparent animate-pulse" />
              </div>
            </span>
            <span className="block italic mt-2">Principles</span>
          </h2>
        </div>

        {/* 4-5 Column Technical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-0 relative border-b border-white/10">
          {principles.map((item, index) => (
            <PrincipleCard 
              key={index}
              icon={item.icon}
              title={item.title}
              shortDesc={item.shortDesc}
              fullDesc={item.fullDesc}
            />
          ))}
        </div>

        {/* Footer Technical Meta */}
        <div className="mt-16 text-center">
          <span className="font-technical text-[12px] text-[#666666] tracking-[0.2em] uppercase">
            It’s minimal, expressive, and performance-first.
          </span>
        </div>

        {/* Bottom Giant Sword Canvas Visual Section */}
        <div className="w-full h-[200px] md:h-[400px] mt-20 relative flex items-center justify-center opacity-40">
           {/* This simulates the three.js katana stage at the bottom */}
           <div className="absolute w-full h-px bg-white/10" />
           <div className="w-[80%] h-[2px] bg-gradient-to-r from-transparent via-white to-transparent blur-[1px]" />
           <div className="absolute top-1/2 left-[15%] w-8 h-8 rounded-full border border-white/20 animate-ping opacity-30" />
        </div>
      </div>

      {/* Cinematic Grain Overlay handled by global CSS, but adding local depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,62,0,0.02)_0%,transparent_50%)]" />
    </section>
  );
};

export default Principles;