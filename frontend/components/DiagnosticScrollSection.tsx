"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";

interface DiagnosticScrollSectionProps {
  onLaunchDemo?: () => void;
}

const STAGES = [
  {
    step: "01",
    headline: "Discover.",
    subheading: "WHERE ARE THE REPEATING BLINDSPOTS?",
    description:
      "We ingest your raw coding histories across LeetCode & Codeforces to automatically isolate algorithmic blind spots. No guesswork or superficial practice logs.",
    deliverable: "An automated inventory of persistent failure patterns.",
    accent: "#E4007C",
  },
  {
    step: "02",
    headline: "Diagnose.",
    subheading: "WHERE DOES IT HURT, AND WHY?",
    description:
      "We isolate the root cause behind the symptom — unmemoized recurrence branches, boundary off-by-ones, or stale visited sets. A doctor doesn't prescribe before the diagnosis, and neither do we.",
    deliverable: "A prioritized diagnosis with the real cost of each issue.",
    accent: "#E4007C",
  },
  {
    step: "03",
    headline: "Design.",
    subheading: "WHAT'S THE RIGHT FIT FOR YOU?",
    description:
      "We tailor the practice strategy around your exact cognitive gaps — pragmatic, measurable, and built to retain. No grinding random problems and burning contest rating points.",
    deliverable: "A targeted study blueprint scoped to your weak invariants.",
    accent: "#E4007C",
  },
  {
    step: "04",
    headline: "Deliver.",
    subheading: "CAN YOU ACTUALLY RETAIN IT?",
    description:
      "Lock in algorithmic invariants permanently through automated SM-2 spaced repetition schedules (Day 0 → 1 → 3 → 7 → 14) dynamically calibrated to your solve times.",
    deliverable: "Permanent algorithmic intuition under contest pressure.",
    accent: "#E4007C",
  },
];

export const DiagnosticScrollSection: React.FC<DiagnosticScrollSectionProps> = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    restDelta: 0.001,
  });

  // Track translates from first card to last card
  const trackX = useTransform(smoothProgress, [0, 1], ["0vw", "-300vw"]);

  return (
    <section
      ref={containerRef}
      id="pipeline"
      className="relative w-full bg-[#0d0d0d] text-white selection:bg-[#E4007C]/30 selection:text-white"
    >
      {/* Background Dot Matrix Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* DESKTOP PINNED VIEW (md+) */}
      <div className="hidden md:block h-[400vh] relative">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-12 lg:p-16 z-10">
          
          {/* Subtle horizontal alignment guide line */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/[0.04] pointer-events-none z-0" />

          {/* Horizontal Slider Track */}
          <motion.div
            style={{ x: shouldReduceMotion ? "0%" : trackX }}
            className="flex h-full items-center will-change-transform z-10"
          >
            {STAGES.map((stage) => (
              <div
                key={stage.step}
                className="w-screen h-full shrink-0 flex items-center px-8 lg:px-20 relative"
              >
                {/* Content Box */}
                <div className="relative z-10 max-w-2xl space-y-7">
                  {/* Main Bold Title */}
                  <h2 className="text-7xl lg:text-[7.5rem] font-bold tracking-tight text-white leading-none font-sans">
                    {stage.headline}
                  </h2>

                  {/* Pink Technical Eyebrow */}
                  <div className="font-mono text-xs tracking-widest uppercase font-semibold text-[#E4007C]">
                    {stage.subheading}
                  </div>

                  {/* Monospace Body Copy */}
                  <p className="font-mono text-[13px] lg:text-sm leading-relaxed text-neutral-300 max-w-xl">
                    {stage.description}
                  </p>

                  {/* "YOU GET" Key-Value Footnote */}
                  <div className="pt-4 font-mono text-xs flex items-start gap-4">
                    <span className="text-neutral-500 uppercase tracking-widest shrink-0 font-medium">
                      YOU GET
                    </span>
                    <span className="text-neutral-200">
                      {stage.deliverable}
                    </span>
                  </div>
                </div>

                {/* Oversized Background/Adjacent Numeral */}
                <div className="absolute left-[54vw] lg:left-[50vw] top-1/2 -translate-y-1/2 select-none pointer-events-none z-0">
                  <span className="font-sans font-black text-[28vw] lg:text-[25vw] leading-none text-[#181818] tracking-tighter block select-none">
                    {stage.step}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Bottom Indicators */}
          <div className="flex justify-between items-center z-20 font-mono text-xs text-neutral-500 border-t border-white/[0.08] pt-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4007C]" />
              <span className="tracking-widest uppercase">THE DIAGNOSTIC PIPELINE</span>
            </div>
            <div className="tracking-widest uppercase">
              SCROLL DOWN TO PROGRESS
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VERTICAL VIEW (< md) */}
      <div className="block md:hidden px-6 py-20 space-y-20 relative z-10">
        {STAGES.map((stage) => (
          <div key={stage.step} className="relative space-y-5 pt-8 border-t border-white/10">
            {/* Background Step Number */}
            <div className="absolute right-0 top-0 font-sans font-black text-8xl text-neutral-900 pointer-events-none select-none">
              {stage.step}
            </div>

            <h2 className="text-5xl font-bold tracking-tight text-white font-sans">
              {stage.headline}
            </h2>

            <div className="font-mono text-[11px] tracking-wider uppercase font-semibold text-[#E4007C]">
              {stage.subheading}
            </div>

            <p className="font-mono text-xs leading-relaxed text-neutral-300">
              {stage.description}
            </p>

            <div className="font-mono text-xs pt-2 flex flex-col gap-1">
              <span className="text-neutral-500 uppercase tracking-widest text-[10px]">
                YOU GET
              </span>
              <span className="text-neutral-200 text-xs">
                {stage.deliverable}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiagnosticScrollSection;