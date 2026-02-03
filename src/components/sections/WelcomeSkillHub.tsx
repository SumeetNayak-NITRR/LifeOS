import React from 'react';

/**
 * WelcomeSkillHub Component
 * Clones the primary hero section of StringTune.
 * Features: 
 * - Version tag (v_ 1.1.46)
 * - Headline: "Master Your Skills With StringTune"
 * - Interactive Skill Hub video link
 * - Branding: Large "String Tune"
 * - Sub-descriptions with technical monospace styling
 */
const WelcomeSkillHub: React.FC = () => {
  return (
    <section 
      className="c-welcome relative min-h-screen flex items-center justify-center bg-[#0F0F0F] overflow-hidden select-none"
      style={{ 
        paddingLeft: '5%', 
        paddingRight: '5%',
        paddingTop: '5vh',
        paddingBottom: '5vh'
      }}
    >
      <div className="relative w-full max-w-[1920px] h-full flex flex-col items-center justify-between text-center z-10">
        
        {/* Version Tag */}
        <div 
          className="v font-mono text-[12px] uppercase tracking-[0.1em] text-[#666666] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000"
          style={{ letterSpacing: '0.1em' }}
        >
          v_ 1.1.46
        </div>

        {/* Main Headline */}
        <h2 
          className="font-display text-[clamp(48px,10vw,80px)] font-bold leading-[0.9] tracking-[-0.02em] text-white flex flex-col gap-2 mb-12"
        >
          <span className="block italic">Master</span>
          <span className="block">Your</span>
          <span className="block relative">
            Skills
            <span 
              className="inline-block align-top ml-4 text-[clamp(14px,2.5vw,22px)] font-technical leading-tight text-left"
              style={{ verticalAlign: 'middle', maxWidth: '120px' }}
            >
              With<br />StringTune
            </span>
          </span>
        </h2>

        {/* Interactive Video Link (Skill Hub) */}
        <a 
          href="/skill-hub" 
          className="skill-hub-link group relative block w-[min(320px,60vw)] aspect-video mb-12 overflow-hidden"
          style={{ 
            clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          aria-label="Skill Hub"
        >
          <div className="video-wrap w-full h-full bg-black">
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              src="https://string-tune.fiddle.digital/videos/skill-hub-link.mp4"
            />
          </div>
          {/* Label that appears on hover/interaction */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="font-mono text-[12px] uppercase tracking-widest text-white">Skill Hub</span>
          </div>
        </a>

        {/* Large Branding Headline */}
        <h1 
          className="the-name font-display text-[clamp(80px,25vw,400px)] font-bold leading-[0.8] tracking-[-0.05em] text-white/5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap"
        >
          <span>String</span>
          <span className="opacity-0 lg:opacity-100">Tune</span>
        </h1>

        {/* Detailed Branding Section (Bottom Layer) */}
        <div className="flex flex-col items-center gap-16 w-full">
           <h1 className="relative font-display text-[clamp(64px,12vw,180px)] font-bold leading-[0.8] tracking-[-0.05em] text-white transition-all duration-700">
             <span className="block lg:inline">String</span>
             <span className="block lg:inline">Tune</span>
           </h1>

           {/* Meta Descriptions */}
           <div className="flex flex-col md:flex-row gap-4 md:gap-24 text-[#D1D1D1] mt-8">
              <span 
                className="sub font-mono text-[11px] md:text-[13px] uppercase tracking-[0.2em] max-w-[200px]"
                style={{ lineHeight: '1.4' }}
              >
                For smooth scrolling and core web animations
              </span>
              <span 
                className="sub font-mono text-[11px] md:text-[13px] uppercase tracking-[0.2em] max-w-[200px]"
                style={{ lineHeight: '1.4' }}
              >
                CSS-First. JS-Light
              </span>
           </div>
        </div>
      </div>

      {/* Decorative Canvas / Three.js Placeholder - The Katana is usually rendered here globally */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className="w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,62,0,0.05)_0%,_transparent_70%)]" />
      </div>
    </section>
  );
};

export default WelcomeSkillHub;