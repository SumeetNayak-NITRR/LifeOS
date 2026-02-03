"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { MoveRight } from "lucide-react";

/**
 * Footer component for StringTune.
 * Features an interactive polygon background, social links, and specific typography.
 */
export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const polygonRef = useRef<HTMLDivElement>(null);

  // Interactive parallax effect for the polygon background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!polygonRef.current) return;
      const { clientX, clientY } = e;
      const moveX = (clientX - window.innerWidth / 2) * 0.01;
      const moveY = (clientY - window.innerHeight / 2) * 0.01;
      polygonRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.05)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const socialLinks = [
    {
      name: "Discord",
      href: "https://discord.com",
      icon: (
        <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
          <path d="M17.07 1.15a14.77 14.77 0 0 0-3.64-.89.07.07 0 0 0-.08.03 10.2 10.2 0 0 0-.45.92.07.07 0 0 1-.12 0 13.56 13.56 0 0 0-4.64 0 .07.07 0 0 1-.12 0 10.22 10.22 0 0 0-.45-.92.07.07 0 0 0-.08-.03 14.71 14.71 0 0 0-3.64.89.07.07 0 0 0-.03.02C1.4 4.58.55 7.93.89 11.23a.07.07 0 0 0 .03.05 14.77 14.77 0 0 0 4.45 2.25.07.07 0 0 0 .08-.02c.35-.48.66-.98.92-1.51a.07.07 0 0 0-.04-.1 9.5 9.5 0 0 1-1.39-.66.07.07 0 0 1 0-.12c.1-.07.2-.15.3-.22a.07.07 0 0 1 .07 0 10.5 10.5 0 0 0 8.84 0 .07.07 0 0 1 .07 0c.1.07.2.14.3.22a.07.07 0 0 1 0 .12 9.4 9.4 0 0 1-1.39.66.07.07 0 0 0-.04.1c.26.54.57 1.04.92 1.51a.07.07 0 0 0 .08.02 14.73 14.73 0 0 0 4.45-2.25.07.07 0 0 0 .03-.05c.4-3.84-.66-7.14-2.87-10.06a.07.07 0 0 0-.03-.02ZM6.67 9.87c-.89 0-1.63-.82-1.63-1.82 0-1 .72-1.82 1.63-1.82.91 0 1.65.82 1.65 1.82 0 1-.72 1.82-1.65 1.82Zm6.66 0c-.89 0-1.63-.82-1.63-1.82 0-1 .72-1.82 1.63-1.82.91 0 1.65.82 1.65 1.82 0 1-.74 1.82-1.65 1.82Z" />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com",
      icon: (
        <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
          <path d="M10 0a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34a2.65 2.65 0 0 0-1.11-1.46c-.91-.62.07-.6.07-.6a2.1 2.1 0 0 1 1.53 1.03 2.13 2.13 0 0 0 2.91.83 2.14 2.14 0 0 1 .63-1.34c-2.22-.25-4.55-1.11-4.55-4.94a3.86 3.86 0 0 1 1.03-2.68 3.59 3.59 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.47 9.47 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02a3.59 3.59 0 0 1 .1 2.64 3.86 3.86 0 0 1 1.03 2.68c0 3.84-2.33 4.68-4.56 4.93a2.38 2.38 0 0 1 .68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 10 0Z" />
        </svg>
      ),
    },
    {
      name: "Ko-fi",
      href: "https://ko-fi.com",
      icon: (
        <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current">
          <path d="M17.62 5.09c-.44-.22-2.12-.22-2.12-.22H4V2.05s0-.6.6-.6h10.27c1.47 0 2.66 1.19 2.66 2.66a1.05 1.05 0 0 1-.91.98Zm-3.12 10.3c.04.11-.03.22-.15.22H3.77a.23.23 0 0 1-.22-.22V5.75c0-.12.1-.22.22-.22h10.5c.12 0 .22.1.22.22l.03 9.64Zm4.5-5.32c0 2.4-1.95 4.35-4.35 4.35h-.83V15.5c0 .91-.74 1.65-1.65 1.65H3.65C2.74 17.15 2 16.41 2 15.5V4.32C2 3.41 2.74 2.67 3.65 2.67h13.2c.47 0 .85.38.85.85v1.57h.3c1.47 0 2.66 1.19 2.66 2.66v2.32Z" />
        </svg>
      ),
    },
  ];

  return (
    <footer
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#0F0F0F] text-[#D1D1D1] pt-[120px] pb-10"
    >
      {/* Interactive Polygon Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          ref={polygonRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 transition-transform duration-700 ease-out"
        >
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/footer-polygon-bg-13.jpg"
            alt="Polygon Background"
            fill
            className="object-cover mask-polygon"
            priority
          />
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-[5%]">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12">
          {/* Left Side: System Specs & Brand */}
          <div className="flex flex-col items-start gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-technical text-[#666666]">v_ 1.1.46</span>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 relative opacity-80">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/icons/logo-sword-1.png"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="object-contain grayscale invert"
                  />
                </div>
                <h3 className="font-display text-[32px] font-bold tracking-tight text-white">
                  StringTune
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-1 max-w-[300px]">
              <p className="font-technical text-[10px] text-[#666666] leading-relaxed">
                Native scroll, refined by a precision smoothing formula.
                Low memory, zero layout shifts, native-friendly.
              </p>
            </div>
          </div>

          {/* Center/Call to Action */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <h2 className="font-display text-[48px] md:text-[64px] font-bold text-white leading-[0.9] tracking-tighter italic">
              Compose <br /> your way.
            </h2>
            <button className="group relative flex items-center gap-4 bg-transparent border border-white/10 px-8 py-4 rounded-full overflow-hidden transition-all hover:border-[#FF3E00]">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-[0.03] transition-opacity" />
              <span className="font-mono text-sm tracking-widest uppercase">Get Started</span>
              <MoveRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-[#FF3E00]" />
            </button>
          </div>

          {/* Right Side: Social Links */}
          <div className="flex flex-col items-end gap-12">
            <div className="flex gap-6">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-center w-12 h-12 border border-white/10 rounded-full transition-all hover:bg-white hover:text-black"
                  aria-label={link.name}
                >
                  <span className="relative z-10 transition-transform group-hover:scale-110">
                    {link.icon}
                  </span>
                </a>
              ))}
            </div>

            <div className="text-right">
              <span className="font-mono text-[11px] text-[#666666] uppercase tracking-[0.2em] block mb-2">
                Fiddle Digital © 2024
              </span>
              <div className="flex items-center justify-end gap-3 text-[#666666]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest uppercase">System Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Quote/Tagline at the very bottom */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-[#666666] tracking-widest uppercase">
            Crafted for core web animations
          </p>
          <div className="flex gap-8">
            <a href="#" className="font-mono text-[10px] text-[#666666] tracking-widest uppercase hover:text-white transition-colors">Documentation</a>
            <a href="#" className="font-mono text-[10px] text-[#666666] tracking-widest uppercase hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .mask-polygon {
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </footer>
  );
}