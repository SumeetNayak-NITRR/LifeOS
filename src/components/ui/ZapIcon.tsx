"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface ZapIconProps {
  active?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function ZapIcon({ active, size = 16, className = "", onClick }: ZapIconProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} onClick={onClick}>
      <AnimatePresence>
        {active && (
          <>
            {/* Electric Arcs */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: i * 60 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0.5, 1.5, 0.8],
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, (Math.random() - 0.5) * 40]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: "easeOut",
                  repeat: 1,
                  repeatType: "reverse"
                }}
                className="absolute w-0.5 h-4 bg-blue-400 blur-[1px] rounded-full"
                style={{ originY: "center" }}
              />
            ))}
            
            {/* Flash Effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"
            />
          </>
        )}
      </AnimatePresence>

      <motion.div
        animate={active ? {
          scale: [1, 1.3, 1],
          color: ["#ffffff", "#60a5fa", "#ffffff"],
          filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
        } : {}}
        transition={{ duration: 0.4 }}
        className="relative z-10"
      >
        <Zap 
          size={size} 
          className={active ? "text-blue-400" : "text-white/20"} 
          fill={active ? "currentColor" : "none"}
        />
      </motion.div>
    </div>
  );
}
