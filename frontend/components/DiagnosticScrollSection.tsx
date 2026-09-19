"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { Sparkles, Search, Calendar, Check, ArrowRight } from "akar-icons";

interface DiagnosticScrollSectionProps {
  onLaunchDemo?: () => void;
}

const STAGES = [
  {
    step: "01",
    tag: "01 / PATTERN DISCOVERY",
    headline: "FIND THE PATTERN.",
    subtext: "Analyze your real coding history across LeetCode & Codeforces to automatically uncover and cluster mistakes that keep repeating.",
    
    accent: "#E4007C",

  },
  {
    step: "02",
    tag: "02 / ROOT CAUSE EXTRACTION",
    headline: "UNDERSTAND THE WHY.",
    subtext: "See exactly where your approach breaks: unmemoized branches, boundary off-by-ones, or stale visited states—with rigorous reasoning.",
    
    
    accent: "#E4007C",
    
  },
  {
    step: "03",
    tag: "03 / TARGETED MAPPING",
    headline: "TARGET THE GAP.",
    subtext: "Identify the exact conceptual gaps you need to master instead of grinding random problems and burning contest rating points.",
    
    
    accent: "#E4007C",
    
  },
  {
    step: "04",
    tag: "04 / ADAPTIVE RETENTION",
    headline: "IMPROVE & RETAIN.",
    subtext: "Lock in algorithmic mastery permanently through automated SM-2 spaced repetition (Day 0 → 1 → 3 → 7 → 14) tailored to your mistakes.",
  
    accent: "#E4007C",
    
  },
];

export const DiagnosticScrollSection: React.FC<DiagnosticScrollSectionProps> = ({
  onLaunchDemo,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth springs for buttery scroll scrub
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  // Desktop horizontal parallax transforms
  // Headlines track translates from 0% to -68%
  const headlineX = useTransform(
    smoothProgress,
    [0, 1],
    ["0%", "-68%"]
  );

  // Background oversized numerals move at a different (slower) speed for depth
  const backgroundNumbersX = useTransform(
    smoothProgress,
    [0, 1],
    ["0%", "-38%"]
  );

  // Progress percentage (0 - 100)
  const progressScaleY = useTransform(smoothProgress, [0, 1], [0.05, 1]);

  return (
    <section
      ref={containerRef}
      id="pipeline"
      className="relative w-full border-b border-white/10 bg-[#080808]"
    >
      {/* Top Crosshair Guides */}
      <div className="crosshair-corner -top-[4px] -left-[4px]" />
      <div className="crosshair-corner -top-[4px] -right-[4px]" />

      {/* DESKTOP VIEW: Scroll-Driven Pinned Editorial Stage (hidden on mobile, shown on md+) */}
      <div className="hidden md:block h-[340vh] relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-10 px-8 lg:px-14 select-none">
          
          {/* Top Sticky Status Bar */}
          <div className="flex items-center justify-between z-20 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#E4007C] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
                02 / THE DIAGNOSTIC PROCESS
              </span>
              <span className="text-white/20">|</span>
              <span className="font-mono text-xs text-white/40 uppercase tracking-wider">
                Scroll to explore stages
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 font-mono text-xs text-white/60">
                <span className="text-white font-bold">STAGE</span>
                <span className="text-[#E4007C]">01</span>
                <span>/</span>
                <span>04</span>
              </div>
              
            </div>
          </div>

          {/* Center Stage: Parallax Layers */}
          <div className="relative flex-1 flex items-center overflow-hidden my-4">
            
            {/* Parallax Layer 1: Giant Background Numerals */}
            <motion.div
              style={{ x: shouldReduceMotion ? "0%" : backgroundNumbersX }}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-[28vw] pointer-events-none z-0 whitespace-nowrap will-change-transform"
            >
              {STAGES.map((s, idx) => (
                <div
                  key={`bg-num-${idx}`}
                  className="font-mono font-black text-[22vw] leading-none text-white/[0.03] select-none tracking-tighter"
                  style={{
                    WebkitTextStroke: "1px rgba(255,255,255,0.05)",
                  }}
                >
                  {s.step}
                </div>
              ))}
            </motion.div>

            {/* Parallax Layer 2: Main Editorial Content Stations */}
            <motion.div
              style={{ x: shouldReduceMotion ? "0%" : headlineX }}
              className="relative z-10 flex gap-[12vw] lg:gap-[16vw] items-center pl-4 will-change-transform"
            >
              {STAGES.map((stage, idx) => (
                <div
                  key={idx}
                  className="w-[72vw] max-w-[850px] shrink-0 space-y-6"
                >
                  {/* Stage Micro Badge */}
                  <div className="flex items-center gap-3">
                    <div
                      className="px-3 py-1 rounded-full font-mono text-xs font-bold flex items-center gap-2 border"
                      style={{
                        backgroundColor: `${stage.accent}15`,
                        borderColor: `${stage.accent}40`,
                        color: stage.accent,
                      }}
                    >
                      
                      <span>{stage.tag}</span>
                    </div>
                    <span className="font-mono text-[11px] text-white/40 tracking-wider">
                      
                    </span>
                  </div>

                  {/* Giant Headline */}
                  <h2 className="text-4xl lg:text-6xl xl:text-7xl font-mono font-bold text-white tracking-tight leading-[1.05]">
                    {stage.headline}
                  </h2>

                  {/* Editorial Description & Highlight Pill */}
                  <div className="max-w-2xl space-y-4">
                    <p className="text-lg lg:text-xl text-white/70 font-sans font-normal leading-relaxed">
                      {stage.subtext}
                    </p>

                    
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW: Clean, Responsive Vertical Editorial Flow (< md screens) */}
      <div className="block md:hidden px-6 py-14 space-y-12">
        <div className="text-center space-y-2 mb-8">
          <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
            01 / THE DIAGNOSTIC PROCESS
          </div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
            How BlindSpot Works
          </h2>
          <p className="text-xs text-white/60 font-sans">
            Moving from raw submissions to locked algorithmic invariants.
          </p>
        </div>

        <div className="space-y-8">
          {STAGES.map((stage, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 relative overflow-hidden space-y-4"
            >
              {/* Giant Background Number for Mobile */}
              <div className="absolute -right-2 -bottom-4 font-mono font-black text-7xl text-white/[0.04] pointer-events-none select-none">
                {stage.step}
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold flex items-center gap-1.5 border"
                  style={{
                    backgroundColor: `${stage.accent}15`,
                    borderColor: `${stage.accent}40`,
                    color: stage.accent,
                  }}
                >
                  
                  <span>{stage.tag}</span>
                </div>
              </div>

              <h3 className="text-2xl font-mono font-bold text-white tracking-tight">
                {stage.headline}
              </h3>

              <p className="text-sm text-white/70 font-sans leading-relaxed">
                {stage.subtext}
              </p>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/50">
                
                <span className="text-[#E4007C] font-semibold">Step {stage.step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiagnosticScrollSection;
