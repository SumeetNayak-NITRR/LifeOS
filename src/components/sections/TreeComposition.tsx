"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const TreeComposition = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringString, setIsHoveringString] = useState(false);

  // Constants for leaf animation
  const LEAF_COUNT = 30;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Simple particle system for falling leaves
  useEffect(() => {
    const setupCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);
      resize();

      const particles = Array.from({ length: LEAF_COUNT }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 2,
        speed: Math.random() * 1 + 0.5,
        angle: Math.random() * Math.PI * 2,
        spin: Math.random() * 0.02,
        opacity: Math.random() * 0.5 + 0.2,
      }));

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p) => {
          p.y += p.speed;
          p.x += Math.sin(p.angle) * 0.5;
          p.angle += p.spin;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = '#000000';
          // Drawing a simple leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        requestAnimationFrame(animate);
      };
      
      const animationId = requestAnimationFrame(animate);
      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationId);
      };
    };

    setupCanvas(backCanvasRef.current);
    setupCanvas(frontCanvasRef.current);
  }, []);

  // String Physics simulation (Simplified)
  const getStringPath = () => {
    const width = 1200; // Expected width from styles
    const height = 100;
    const midX = width / 2;
    const midY = 0;

    let offset = 0;
    if (isHoveringString) {
      // Pull toward mouse slightly
      const relativeX = mousePos.x % width;
      offset = 25;
    }

    return `M 0,0 Q ${midX},${midY + offset} ${width},0`;
  };

  return (
    <section 
      id="c-tree" 
      ref={containerRef}
      className="light-section relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center py-20"
      style={{ 
        backgroundColor: '#ffffff',
        backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/cloud-6.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Background Leaves */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-40">
        <canvas ref={backCanvasRef} className="w-full h-full" />
      </div>

      {/* Main Narrative Text */}
      <div className="relative z-30 container mx-auto text-center mb-40">
        <div className="flex flex-col gap-8">
          <span className="text-section font-display text-black inline-block transform transition-transform duration-700 hover:scale-105">
            Take it…
          </span>
          <span className="text-section font-display text-black inline-block transform transition-transform duration-700 hover:scale-105">
            And listen…
          </span>
        </div>
      </div>

      {/* Tree Composition */}
      <div className="relative w-full max-w-[1400px] mx-auto h-[600px] flex items-center justify-center">
        {/* The Tree Image */}
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Image 
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/tree-7.png"
            alt="Zen Tree"
            width={1200}
            height={800}
            className="object-contain opacity-90"
            priority
          />
        </div>

        {/* Interactive String Element */}
        <div 
          className="absolute z-40 w-full max-w-[1200px] h-[100px] flex flex-col items-center justify-center"
          onMouseEnter={() => setIsHoveringString(true)}
          onMouseLeave={() => setIsHoveringString(false)}
        >
          <svg className="w-full h-full overflow-visible">
            <path 
              d={getStringPath()} 
              fill="transparent" 
              stroke="black" 
              strokeWidth="0.5" 
              className="transition-all duration-300 ease-out"
            />
          </svg>
          <div className="mt-4 text-center">
            <span className="font-technical text-black block leading-tight">
              Animate with Elegance,<br />Not Overhead.
            </span>
          </div>
        </div>

        {/* Bamboo Sticks Decor */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Stick 1 */}
          <div className="absolute left-[15%] top-[20%] w-[120px] h-[400px]">
            <Image 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/bamboo-1-8.png"
              alt="Bamboo" width={120} height={400} className="object-contain rotate-[-5deg]"
            />
          </div>
          {/* Stick 2 */}
          <div className="absolute left-[25%] bottom-[10%] w-[100px] h-[350px]">
            <Image 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/bamboo-2-9.png"
              alt="Bamboo" width={100} height={350} className="object-contain rotate-[3deg]"
            />
          </div>
          {/* Stick 3 */}
          <div className="absolute right-[20%] top-[15%] w-[110px] h-[380px]">
            <Image 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/bamboo-3-10.png"
              alt="Bamboo" width={110} height={380} className="object-contain rotate-[8deg]"
            />
          </div>
          {/* Stick 4 */}
          <div className="absolute right-[10%] bottom-[15%] w-[90px] h-[320px]">
            <Image 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/bfb67387-b563-4d2a-8f3a-609c7411a4af-string-tune-fiddle-digital/assets/images/bamboo-4-11.png"
              alt="Bamboo" width={90} height={320} className="object-contain rotate-[-12deg]"
            />
          </div>
        </div>
      </div>

      {/* Front Leaves */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <canvas ref={frontCanvasRef} className="w-full h-full" />
      </div>

      <style jsx global>{`
        .light-section {
          transition: background-color 0.8s cubic-bezier(0.77, 0, 0.175, 1);
        }
      `}</style>
    </section>
  );
};

export default TreeComposition;