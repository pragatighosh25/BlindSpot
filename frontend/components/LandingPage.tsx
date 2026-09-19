"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Search,
  Calendar,
  EyeOpen,
  Check,
  LinkOut,
  Fire,
  Command,
  Cross,
  LaptopDevice,
  Globe,
  Trophy,
} from "akar-icons";

interface LandingPageProps {
  onOpenAuth: (mode: "demo" | "login" | "signup") => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onLaunchDemo,
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(2);
  const [activeTabBug, setActiveTabBug] = useState<"binary-search" | "dp" | "bfs">("binary-search");

  const marqueeItems = [
    "✦ BINARY SEARCH: WHILE (LEFT < RIGHT) PREMATURE TERMINATION",
    "✦ DYNAMIC PROGRAMMING: ADJACENT STATE INDEX OVERLAP",
    "✦ GRAPH BFS: POST-DEQUEUE VISITED ARRAY INFLATION",
    "✦ SM-2 SPACED REPETITION (DAY 0 → DAY 1 → DAY 3 → DAY 7 → DAY 14)",
    "✦ OPENSEARCH CODE SEARCH & CANONICAL PERSISTENCE",
    "✦ LIVE VERIFIED HANDLES: LEETCODE + CODEFORCES",
  ];

  const stamps = [
    {
      title: "Real API Sync",
      sub: "LeetCode & CF Live",
      rotate: "-3deg",
      icon: <Globe size={20} />,
      desc: "Zero manual copy-pasting. Direct REST & GraphQL synchronization.",
      isPink: false,
    },
    {
      title: "Strands AI Agent",
      sub: "94% Confidence",
      rotate: "3deg",
      icon: <Sparkles size={20} />,
      desc: "Mines root causes, invariant bugs, and failure mechanisms.",
      isPink: true,
    },
    {
      title: "OpenSearch Index",
      sub: "Sub-ms Search",
      rotate: "-2deg",
      icon: <Search size={20} />,
      desc: "Full-text & semantic search across raw code & error traces.",
      isPink: false,
    },
    {
      title: "SM-2 Scheduler",
      sub: "Day 0 → 1 → 3 → 7 → 14",
      rotate: "4deg",
      icon: <Calendar size={20} />,
      desc: "Adaptive spaced repetition ensures long-term algorithmic memory.",
      isPink: true,
    },
    {
      title: "Pre-Verified Demo",
      sub: "@pragatighosh25",
      rotate: "-4deg",
      icon: <Check size={20} />,
      desc: "1-Click instant workspace with 37 canonical submissions.",
      isPink: false,
    },
    {
      title: "Rating Breakout",
      sub: "+185 Elo Growth",
      rotate: "2deg",
      icon: <Trophy size={20} />,
      desc: "Eliminates repetitive contest penalties permanently.",
      isPink: true,
    },
  ];

  const pipelinePhases = [
    {
      step: "01",
      title: "Multi-Platform Ingest",
      subtitle: "LeetCode & Codeforces API",
      desc: "Synchronizes raw submission payloads directly from platform endpoints and verifies handle authenticity.",
      badge: "LIVE SYNC",
      output: `[INGEST] Connected: @pragatighosh25 (LeetCode) + @pragatighosh (Codeforces)\n[STATUS] Fetched 37 submissions • 29 failed attempts cataloged\n[STORE] Canonical submission schema mapped in DynamoDB`,
    },
    {
      step: "02",
      title: "OpenSearch Indexing",
      subtitle: "Code & Error Traces",
      desc: "Normalizes submission code, error messages, and verdict metadata into sub-millisecond searchable clusters.",
      badge: "OPENSEARCH",
      output: `[SEARCH] Query: "while (left < right) nums[mid]" -> 5 matches\n[CLUSTER] Similarity score 0.94 across Binary Search submissions\n[INDEX] Tagged: Boundary Condition Errors • Array Invariants`,
    },
    {
      step: "03",
      title: "Strands AI Diagnostics",
      subtitle: "Root Cause Reasoning",
      desc: "Pinpoints exact logical flaws: unmemoized branches, visited state delays, or premature loop breakouts.",
      badge: "AI REASONING",
      output: `[DIAGNOSE] Binary Search — Boundary Condition Errors\n[ROOT CAUSE] Using while (left < right) with right = mid - 1\n[WHY IT FAILS] Premature loop termination on single-element search range\n[FIX] Use while (left <= right) or preserve right = mid for lower-bound`,
    },
    {
      step: "04",
      title: "SM-2 Interval Scheduling",
      subtitle: "Spaced Memory Consolidation",
      desc: "Automatically schedules targeted practice problems on optimal retention intervals (Day 0 → 1 → 3 → 7 → 14).",
      badge: "RETENTION",
      output: `[SCHEDULE] LC 34: Find First and Last Position -> Scheduled (Day 0)\n[INTERVAL] Day 0 [Today] → Day 1 [Tomorrow] → Day 3 → Day 7 → Day 14\n[TARGET] Lock in boundary condition invariant permanently`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] bg-dot-grid text-[#FAFAF8] selection:bg-[#E4007C] selection:text-white">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[450px] bg-[#E4007C]/15 blur-[180px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#E4007C]/10 blur-[200px] pointer-events-none -z-10" />

      {/* Main Notebook Container with Vertical Guide Lines */}
      <div className="notebook-container min-h-screen relative">
        {/* Top Crosshairs */}
        <div className="crosshair-corner top-0 -left-[4px]" />
        <div className="crosshair-corner top-0 -right-[4px]" />

        {/* Top Header with Notebook Border */}
        <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 h-16 flex items-center justify-between">
            {/* Brand Logo & Micro Badges */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E4007C] flex items-center justify-center font-mono font-black text-xs text-white shadow-lg shadow-[#E4007C]/50 border border-white/20 relative">
                <span className="relative z-10">BS</span>
                <span className="absolute inset-0 rounded-full pulse-dot-pink" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono font-extrabold text-base tracking-tight text-white">
                  BlindSpot
                </span>
                <span className="text-white/30 font-mono text-xs">×</span>
                <span className="badge-pill-accent text-[9px]">
                  AI Coach
                </span>
              </div>
            </div>

            {/* Navigation Links with Expanding Underlines */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-white/70">
              <a href="#simulator" className="nav-link-underline hover:text-white">01. Simulator</a>
              <a href="#pipeline" className="nav-link-underline hover:text-white">02. The Ledger</a>
              <a href="#stamps" className="nav-link-underline hover:text-white">03. Capabilities</a>
              <a href="#comparison" className="nav-link-underline hover:text-white">04. Comparison</a>
            </nav>

            {/* Auth Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth("login")}
                className="px-3.5 py-1.5 text-xs font-mono text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                Sign In
              </button>
              <button
                onClick={onLaunchDemo}
                className="group btn-weevolve-primary py-2 px-4 text-xs"
              >
                
                <span>Launch Demo</span>
                
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section: Notebook Lines & Vertical Divide */}
        <section className="relative border-b border-white/10 px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141414] border border-[#E4007C]/40 text-[11px] font-mono shadow-[0_0_15px_rgba(228,0,124,0.2)]">
                <span className="w-2 h-2 rounded-full bg-[#E4007C] pulse-dot-pink" />
                <span className="text-white/90 uppercase tracking-wider font-semibold">
                  Continuous Algorithmic Diagnostics
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight leading-[1.05] text-white">
                Stop Grinding Blindly. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4007C] via-[#FF45A8] to-[#FFFFFF]">
                  Master Every Blind Spot.
                </span>
              </h1>

              {/* Sub-rule in collaboration with */}
              <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                <span className="shrink-0 uppercase tracking-widest text-[10px] text-[#E4007C]">
                  Live Ingestion &bull; LeetCode + Codeforces
                </span>
                <span className="h-px flex-1 bg-white/10" />
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans font-normal">
                BlindSpot mines your raw submission history, isolates recurring invariant flaws (boundary conditions, unmemoized recursions, visited state delays), and schedules targeted spaced repetition practice.
              </p>

              {/* 2-Column KPI Ledger Box (WeMakeDevs style) */}
              <div className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 py-4 font-mono">
                <div className="pr-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E4007C]" />
                    <span>Diagnostics Confidence</span>
                  </div>
                  <div className="text-2xl font-bold text-[#E4007C]">94% Accuracy</div>
                  <div className="text-[11px] text-white/50 font-sans">Strands AI reasoning engine</div>
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]" />
                    <span>SM-2 Memory Lock</span>
                  </div>
                  <div className="text-2xl font-bold text-[#00FF9C]">5 Interval Steps</div>
                  <div className="text-[11px] text-white/50 font-sans">Day 0 &bull; 1 &bull; 3 &bull; 7 &bull; 14</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 font-mono">
                <button
                  onClick={onLaunchDemo}
                  className="group btn-weevolve-primary text-xs py-3.5 px-6 shadow-[0_0_30px_rgba(228,0,124,0.4)]"
                >
                
                  <span>Launch Demo</span>
                  
                </button>
                <button
                  onClick={() => onOpenAuth("signup")}
                  className="btn-weevolve-secondary text-xs py-3.5 px-5 hover:border-[#E4007C]"
                >
                  <Command size={15} className="mr-2 text-[#E4007C]" />
                  <span>Connect Verified Handles</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Simulator Box */}
            <div id="simulator" className="lg:col-span-6 relative">
              <div className="card-candle-glow border-[#E4007C]/40 bg-[#121212] p-5 shadow-[0_20px_50px_rgba(228,0,124,0.15)] relative overflow-hidden">
                {/* Simulator Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-white/60 font-semibold ml-2">Live Strands Terminal</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#E4007C] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E4007C] pulse-dot-pink" />
                    <span>Real-Time Telemetry</span>
                  </div>
                </div>

                {/* Bug Tab Switcher */}
                <div className="grid grid-cols-3 gap-1 bg-[#0A0A0A] p-1 rounded-full border border-white/10 mb-4 font-mono text-[10px]">
                  <button
                    onClick={() => setActiveTabBug("binary-search")}
                    className={`py-1 rounded-full font-semibold transition-all ${
                      activeTabBug === "binary-search"
                        ? "bg-[#E4007C] text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Binary Search (WA)
                  </button>
                  <button
                    onClick={() => setActiveTabBug("dp")}
                    className={`py-1 rounded-full font-semibold transition-all ${
                      activeTabBug === "dp"
                        ? "bg-[#E4007C] text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    DP Overlap (WA)
                  </button>
                  <button
                    onClick={() => setActiveTabBug("bfs")}
                    className={`py-1 rounded-full font-semibold transition-all ${
                      activeTabBug === "bfs"
                        ? "bg-[#E4007C] text-white shadow-sm"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    Graph Visited (TLE)
                  </button>
                </div>

                {/* Code Body */}
                {activeTabBug === "binary-search" && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/10 text-white/90">
                      <div className="text-[10px] text-[#E4007C] uppercase font-bold mb-1">
                        LC 704 &bull; Binary Search (Boundary Loss)
                      </div>
                      <pre className="text-[11px] text-white/80 overflow-x-auto leading-relaxed">
                        <code>{`while (left < right) { // ⚠️ Terminates prematurely\n    int mid = left + (right - left) / 2;\n    if (nums[mid] == target) return mid;\n    else if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1; \n}`}</code>
                      </pre>
                    </div>

                    <div className="p-3 bg-[#E4007C]/10 rounded-xl border border-[#E4007C]/30 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#E4007C] uppercase">
                        <span>Strands AI Diagnosis:</span>
                        <span>94% Confidence</span>
                      </div>
                      <p className="text-[11px] text-white/90 font-sans leading-relaxed">
                        Strict inequality with <code className="text-[#E4007C] bg-black/40 px-1 py-0.5 rounded">right = mid - 1</code> causes early loop termination when target is on single-element boundary index.
                      </p>
                      <div className="text-[10px] text-[#00FF9C] pt-1 border-t border-white/10 font-mono">
                        &rarr; Queued in SM-2 Spaced Repetition (Day 0 &bull; LC 34)
                      </div>
                    </div>
                  </div>
                )}

                {activeTabBug === "dp" && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/10 text-white/90">
                      <div className="text-[10px] text-[#E4007C] uppercase font-bold mb-1">
                        LC 198 &bull; House Robber (Adjacent State Overlap)
                      </div>
                      <pre className="text-[11px] text-white/80 overflow-x-auto leading-relaxed">
                        <code>{`// Flawed Recurrence:\ndp[i] = dp[i - 1] + nums[i]; // ⚠️ Violates adjacency constraint!\n// Correct Recurrence:\ndp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);`}</code>
                      </pre>
                    </div>

                    <div className="p-3 bg-[#E4007C]/10 rounded-xl border border-[#E4007C]/30 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#E4007C] uppercase">
                        <span>Strands AI Diagnosis:</span>
                        <span>98% Confidence</span>
                      </div>
                      <p className="text-[11px] text-white/90 font-sans leading-relaxed">
                        Incorrectly accumulates contiguous values rather than evaluating the skip vs loot state transition.
                      </p>
                      <div className="text-[10px] text-[#00FF9C] pt-1 border-t border-white/10 font-mono">
                        &rarr; Queued in SM-2 Spaced Repetition (Day 0 &bull; LC 213)
                      </div>
                    </div>
                  </div>
                )}

                {activeTabBug === "bfs" && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/10 text-white/90">
                      <div className="text-[10px] text-[#E4007C] uppercase font-bold mb-1">
                        CF 500A &bull; Graph BFS Visited State Delay
                      </div>
                      <pre className="text-[11px] text-white/80 overflow-x-auto leading-relaxed">
                        <code>{`int curr = queue.pop();\nvisited[curr] = true; // ⚠️ Enqueues duplicate nodes -> TLE / Memory Limit!\n// Correct: Mark visited immediately upon push`}</code>
                      </pre>
                    </div>

                    <div className="p-3 bg-[#E4007C]/10 rounded-xl border border-[#E4007C]/30 text-white space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#E4007C] uppercase">
                        <span>Strands AI Diagnosis:</span>
                        <span>96% Confidence</span>
                      </div>
                      <p className="text-[11px] text-white/90 font-sans leading-relaxed">
                        Delayed visited array update results in redundant vertex insertion during high-degree BFS traversal.
                      </p>
                      <div className="text-[10px] text-[#00FF9C] pt-1 border-t border-white/10 font-mono">
                        &rarr; Queued in SM-2 Spaced Repetition (Day 0 &bull; LC 1091)
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Trigger */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/50 text-[11px]">37 Submissions Ingested</span>
                  <button
                    onClick={onLaunchDemo}
                    className="text-[#E4007C] hover:underline flex items-center gap-1 font-bold text-xs"
                  >
                    <span>Full Live Analysis</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Continuous Laser Marquee Ribbon */}
        <div className="border-b border-white/10 bg-[#0D0D0D]/90 py-3 overflow-hidden select-none">
          <div className="animate-marquee gap-8 items-center text-xs font-mono text-white/70">
            {[...marqueeItems, ...marqueeItems].map((item, idx) => (
              <span key={idx} className="whitespace-nowrap px-4 hover:text-[#E4007C] transition-colors cursor-default font-semibold">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 01 / The Diagnostic Ledger (Vertical Timeline with Connector Stems) */}
        <section id="pipeline" className="border-b border-white/10 px-6 py-14 md:py-20 relative">
          <div className="crosshair-corner -top-[4px] -left-[4px]" />
          <div className="crosshair-corner -top-[4px] -right-[4px]" />

          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
              01 / THE DIAGNOSTIC LEDGER
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              From Raw Submissions to Locked Invariants.
            </h2>
            <p className="mt-3 text-sm text-white/60 font-sans">
              Click any stage in the ledger to observe the architectural pipeline output.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Timeline Stepper (Left 5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              {pipelinePhases.map((phase, idx) => {
                const isSelected = selectedPhase === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhase(idx)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-[#161616] border-[#E4007C] shadow-[0_0_20px_rgba(228,0,124,0.2)]"
                        : "bg-[#101010] border-white/10 hover:border-white/20 hover:bg-[#141414]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                      isSelected ? "bg-[#E4007C] text-white" : "bg-white/10 text-white/60"
                    }`}>
                      {phase.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-mono font-bold text-sm text-white truncate">{phase.title}</h4>
                        <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-[#E4007C]/20 text-[#E4007C] font-bold" : "bg-white/5 text-white/40"
                        }`}>
                          {phase.badge}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 font-sans mt-1 line-clamp-2 leading-relaxed">
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Console Output Screen (Right 7 Cols) */}
            <div className="lg:col-span-7 bg-[#121212] rounded-2xl border border-white/10 p-6 font-mono text-xs space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-white/60 text-[11px]">
                <span className="text-[#E4007C] font-bold uppercase">
                  Phase {pipelinePhases[selectedPhase].step}: {pipelinePhases[selectedPhase].title}
                </span>
                <span className="text-[#00FF9C] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]" />
                  Active Telemetry
                </span>
              </div>
              <pre className="bg-[#0A0A0A] p-4 rounded-xl border border-white/10 text-white/85 text-[11px] leading-relaxed overflow-x-auto">
                <code>{pipelinePhases[selectedPhase].output}</code>
              </pre>
              <div className="flex items-center justify-between pt-2">
                <span className="text-white/50 text-[11px]">DynamoDB + OpenSearch Verified</span>
                <button
                  onClick={onLaunchDemo}
                  className="text-xs font-bold text-[#E4007C] hover:underline flex items-center gap-1"
                >
                  <span>Explore in Workspace</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 02 / Capabilities Stamp Board (WeMakeDevs Stamp Style with Hover Tilts) */}
        <section id="stamps" className="border-b border-white/10 px-6 py-14 md:py-20 relative">
          <div className="crosshair-corner -top-[4px] -left-[4px]" />
          <div className="crosshair-corner -top-[4px] -right-[4px]" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
                02 / CAPABILITY MATRIX
              </div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                Stamped for High-Performance Coding.
              </h2>
            </div>
            <p className="text-xs font-mono text-white/50 md:text-right max-w-xs">
              Every engine module validated across 37 real LeetCode & Codeforces submissions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stamps.map((stamp, i) => (
              <div
                key={i}
                className={`stamp-badge ${stamp.isPink ? "stamp-badge-pink" : "hover:border-[#E4007C]"}`}
                style={{ transform: `rotate(${stamp.rotate})` }}
              >
                <div className="mb-2 text-[#E4007C]">{stamp.icon}</div>
                <div className="font-mono text-xs font-bold text-white mb-0.5">{stamp.title}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-white/50 mb-2">{stamp.sub}</div>
                <p className="text-[10px] text-white/60 font-sans leading-tight">{stamp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 03 / Method Comparison (Notebook Split Screen) */}
        <section id="comparison" className="border-b border-white/10 px-6 py-14 md:py-20 relative">
          <div className="crosshair-corner -top-[4px] -left-[4px]" />
          <div className="crosshair-corner -top-[4px] -right-[4px]" />

          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
              03 / THE GROWTH METHOD
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              Targeted Intervals vs Random Grinding.
            </h2>
            <p className="mt-3 text-sm text-white/60 font-sans">
              Why random grinding wastes hundreds of hours while spaced diagnostic repetition locks in invariants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {/* Traditional Column */}
            <div className="bg-[#121212] rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-rose-400 uppercase tracking-wider">Traditional Random Grinding</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">300+ Hrs Wasted</span>
              </div>
              <div className="space-y-3 text-white/70 font-sans">
                <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/10">
                  <strong className="text-rose-300 block font-mono text-xs mb-1">Week 1–4</strong>
                  Solve 100 random problems without tracking underlying bug causes.
                </div>
                <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/10">
                  <strong className="text-rose-300 block font-mono text-xs mb-1">Week 8</strong>
                  Hit Wrong Answer in contest on the exact same BFS visited array mistake.
                </div>
                <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/10">
                  <strong className="text-rose-300 block font-mono text-xs mb-1">Week 16</strong>
                  Plateau at 1500–1800 rating due to recurrent blind spots.
                </div>
              </div>
            </div>

            {/* BlindSpot Column */}
            <div className="bg-[#121212] rounded-2xl p-6 border border-[#E4007C] space-y-4 shadow-[0_0_30px_rgba(228,0,124,0.15)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="font-bold text-[#E4007C] uppercase tracking-wider">BlindSpot AI Diagnostics</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E4007C]/20 text-[#E4007C] border border-[#E4007C]/40 font-semibold">10x Retention</span>
              </div>
              <div className="space-y-3 text-white/90 font-sans">
                <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/10">
                  <strong className="text-[#00FF9C] block font-mono text-xs mb-1">Day 1: Ingest & Mine</strong>
                  Connect handles & auto-detect exact root causes in sub-seconds.
                </div>
                <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/10">
                  <strong className="text-[#00FF9C] block font-mono text-xs mb-1">Day 3 & 7: SM-2 Spacing</strong>
                  Targeted review problems queued automatically to solidify invariants.
                </div>
                <div className="p-3.5 bg-[#0A0A0A] rounded-xl border border-white/10">
                  <strong className="text-[#00FF9C] block font-mono text-xs mb-1">Day 14: Mastery Locked</strong>
                  Zero repeated failure patterns in target topic category.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 / Final Launch CTA */}
        <section className="px-6 py-16 md:py-24 text-center relative">
          <div className="crosshair-corner -top-[4px] -left-[4px]" />
          <div className="crosshair-corner -top-[4px] -right-[4px]" />

          <div className="max-w-3xl mx-auto space-y-6">
            <span className="badge-pill-accent">
              READY TO ELIMINATE BLIND SPOTS?
            </span>
            <h2 className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight">
              Start Your Algorithmic Evolution.
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-sans">
              Launch the demo workspace with pre-verified profiles or connect your personal handles in seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 font-mono">
              <button
                onClick={onLaunchDemo}
                className="group btn-weevolve-primary text-xs py-4 px-8 shadow-[0_0_35px_rgba(228,0,124,0.5)]"
              >
                <span>Launch Demo Workspace</span>
              </button>
              <button
                onClick={() => onOpenAuth("signup")}
                className="btn-weevolve-secondary text-xs py-4 px-6 hover:border-[#E4007C]"
              >
                <Command size={16} className="mr-2 text-[#E4007C]" />
                <span>Connect Verified Handles</span>
              </button>
            </div>
          </div>
        </section>

        {/* Comprehensive Modern Footer */}
        <footer className="border-t border-white/10 bg-[#080808] text-xs font-sans text-white/60">
          <div className="max-w-6xl mx-auto px-6 py-14">
            

            {/* Bottom Bar */}
            <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
              <div>
                &copy; {new Date().getFullYear()} BlindSpot. All rights reserved. Built for competitive programmers.
              </div>
              <div className="flex items-center gap-6">
                <button onClick={onLaunchDemo} className="hover:text-[#E4007C] transition-colors">Demo</button>
                <button onClick={() => onOpenAuth("login")} className="hover:text-[#E4007C] transition-colors">Sign In</button>
                <button onClick={() => onOpenAuth("signup")} className="hover:text-[#E4007C] transition-colors">Register</button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
