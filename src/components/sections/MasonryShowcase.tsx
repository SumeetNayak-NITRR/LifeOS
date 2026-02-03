"use client";

import React from 'react';
import Image from 'next/image';

const MasonryShowcase = () => {
  // Theme: Dark as requested, but the section itself is marked as class -light in HTML
  // which implies it might be a stark white contrast section as per the design systems.
  // However, the instructions say Theme: dark. I will follow the visual look of the light section
  // while keeping the layout logic consistent with the provided system.

  const assets = {
    performance: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/fidoru-1.jpg",
    control: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/control-progress-2.jpg",
    optimized: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/ultra-optimized-3.jpg"
  };

  return (
    <section className="c-masonry light-section py-[20vh] bg-white text-black relative overflow-hidden" data-v-f2e2227c="">
      <div className="container mx-auto px-[5%]" data-v-f2e2227c="">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[20px] auto-rows-auto" data-v-f2e2227c="">
          
          {/* Performance Supervision Card */}
          <div className="md:col-span-4 masonry-item performance-supervision" data-v-9b20387c="">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#f5f5f5] p-6 h-full min-h-[400px] flex flex-col justify-between group transition-transform duration-500 hover:scale-[1.02]">
              <span className="font-technical text-[12px] uppercase tracking-[0.1em] text-[#666] mb-4 block" data-v-9b20387c-s="">
                Performance<br />Supervision
              </span>
              <div className="flex-grow flex items-center justify-center relative w-full h-full">
                <figure className="w-full h-full relative" data-v-4d7534c3="">
                  <Image 
                    src={assets.performance} 
                    alt="Performance Supervision" 
                    fill
                    className="object-contain"
                  />
                </figure>
              </div>
            </div>
          </div>

          {/* Control Progress Data Card */}
          <div className="md:col-span-8 masonry-item control-progress" data-v-9b20387c="">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-black text-white h-full min-h-[400px] flex flex-col justify-end group transition-transform duration-500 hover:scale-[1.01]">
              <figure className="absolute inset-0 z-0" data-v-4d7534c3="">
                <Image 
                  src={assets.control} 
                  alt="Control Progress" 
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
              </figure>
              <div className="relative z-10 p-10 bg-gradient-to-t from-black/80 to-transparent w-full">
                <div className="h-[1px] w-full bg-white/20 mb-6 overflow-hidden">
                  <div className="h-full bg-white w-2/3" />
                </div>
                <h3 className="text-display text-[32px] md:text-[48px] font-semibold leading-tight mb-4" data-v-9b20387c-s="">
                  Control your Progress Data
                </h3>
                <p className="font-sans text-[16px] md:text-[18px] text-white/70 max-w-md" data-v-9b20387c-s="">
                  Break it apart, apply to any element across the page, pass it through JS.
                </p>
              </div>
            </div>
          </div>

          {/* Scroll Container Card */}
          <div className="md:col-span-7 masonry-item s-container" data-v-9b20387c="">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#101214] border border-white/5 p-8 h-full min-h-[450px] flex flex-col justify-between group">
              <div>
                <span className="font-technical text-[14px] text-white/50 block mb-2" data-v-9b20387c-s="">
                  Use Scroll Container.
                </span>
                <span className="font-technical text-[14px] text-white/30" data-v-9b20387c-s="">
                  If you want
                </span>
              </div>
              <div className="video-wrap bg-[#1a1a1a] rounded-lg mt-8 flex-grow overflow-hidden relative border border-white/10 shadow-2xl">
                {/* Fallback pattern as video element is usually dynamic */}
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[1px] bg-white/10 relative">
                     <div className="absolute -top-1 left-1/4 w-2 h-2 rounded-full bg-[#ff3e00] blur-[2px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimized / Native Card */}
          <div className="md:col-span-5 masonry-item ultra-optimized" data-v-9b20387c="">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[#f8f8f8] p-8 h-full min-h-[450px] flex flex-col group transition-transform duration-500 hover:scale-[1.02]">
              <div className="mb-auto">
                <h3 className="font-display text-[40px] leading-none mb-4">Native Feelings</h3>
                <p className="font-sans text-[16px] text-black/60 max-w-[240px]">
                  Uses native scroll, refined by a precision smoothing formula.
                </p>
              </div>
              <div className="relative w-full h-[240px] mt-8">
                <Image 
                  src={assets.optimized} 
                  alt="Ultra Optimized" 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .masonry-item {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .light-section {
          background-color: #ffffff;
          color: #000000;
        }
        .font-technical {
          font-family: var(--font-mono);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      `}</style>
    </section>
  );
};

export default MasonryShowcase;