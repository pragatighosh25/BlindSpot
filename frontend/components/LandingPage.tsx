"use client";

import React from "react";
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
} from "akar-icons";

interface LandingPageProps {
  onOpenAuth: (mode: "demo" | "login" | "signup") => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onLaunchDemo,
}) => {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FAFAF8] selection:bg-[#1B1BFF] selection:text-[#FAFAF8] overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[#1B1BFF]/10 blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#00FF9C]/5 blur-[160px] pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-[#2C2C2C] bg-[#0D0D0D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1B1BFF] flex items-center justify-center font-headline font-black text-sm text-[#FAFAF8] shadow-lg shadow-[#1B1BFF]/40 border border-[#1B1BFF]/50">
              BS
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline font-extrabold text-lg tracking-tight text-[#FAFAF8]">
                BlindSpot
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 uppercase font-semibold">
                AI Coach
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAuth("login")}
              className="px-4 py-2 text-xs font-mono text-[#FAFAF8]/70 hover:text-[#FAFAF8] transition-colors rounded-lg hover:bg-[#1A1A1A]"
            >
              Sign In
            </button>
            <button
              onClick={onLaunchDemo}
              className="px-4 py-2 rounded-xl bg-[#00FF9C] text-[#0D0D0D] font-headline font-bold text-xs tracking-wide hover:bg-[#26ffaa] transition-all flex items-center gap-1.5 shadow-md shadow-[#00FF9C]/20"
            >
              <Sparkles size={14} />
              <span>Launch Demo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1A1A] border border-[#2C2C2C] mb-8 text-xs font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#00FF9C] animate-pulse" />
            <span className="text-[#FAFAF8]/80">Dual Engine: LeetCode + Codeforces Submission Diagnostics</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold font-headline tracking-tight leading-[1.1] mb-6 text-[#FAFAF8]">
            Stop making the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B1BFF] via-[#00FF9C] to-[#00FF9C]">
              same algorithmic mistakes.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#FAFAF8]/70 mb-10 leading-relaxed font-sans">
            BlindSpot analyzes your entire LeetCode and Codeforces history, uncovers your recurring failure patterns (boundary conditions, unmemoized recursions, visited state bugs), and schedules targeted spaced repetition practice.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#00FF9C] text-[#0D0D0D] font-headline font-bold text-sm tracking-wide hover:bg-[#26ffaa] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-[#00FF9C]/25"
            >
              <Sparkles size={18} />
              <span>Explore Demo Workspace (@pragatighosh25)</span>
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onOpenAuth("signup")}
              className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#1A1A1A] text-[#FAFAF8] border border-[#2C2C2C] font-headline font-semibold text-sm hover:bg-[#222222] hover:border-[#3D3D3D] transition-all flex items-center justify-center gap-2"
            >
              <Command size={18} />
              <span>Connect Your Handles</span>
            </button>
          </div>

          {/* Preset Profile Badges */}
          <div className="mt-8 flex items-center justify-center gap-3 text-xs font-mono text-[#FAFAF8]/50">
            <span>Demo Profile Ready:</span>
            <span className="px-2.5 py-1 rounded-md bg-[#1A1A1A] border border-[#2C2C2C] text-[#FAFAF8]/90">
              LeetCode: <strong className="text-[#00FF9C]">@pragatighosh25</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#1A1A1A] border border-[#2C2C2C] text-[#FAFAF8]/90">
              Codeforces: <strong className="text-[#00FF9C]">@pragatighosh</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Mock Diagnosis Card */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="relative bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B1BFF] via-[#00FF9C] to-[#1B1BFF]" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#2C2C2C]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#00FF9C] font-semibold">
                Live AI Diagnostic Snapshot
              </span>
              <h3 className="text-xl font-bold font-headline text-[#FAFAF8] mt-1">
                Binary Search — Boundary Condition Errors (5 Submissions)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30 font-mono text-xs font-semibold">
                High Priority
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 font-mono text-xs font-semibold">
                SM-2 Day 1 Due
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3 font-mono text-xs">
              <div className="text-[#FAFAF8]/50 uppercase text-[10px]">Identified Root Cause</div>
              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#2C2C2C] text-[#FAFAF8]/90 leading-relaxed">
                Using <code className="text-[#00FF9C] bg-[#1A1A1A] px-1.5 py-0.5 rounded">while (left &lt; right)</code> with <code className="text-[#00FF9C] bg-[#1A1A1A] px-1.5 py-0.5 rounded">right = mid - 1</code> causes premature termination when target is located at the final single-element boundary index.
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="text-[#FAFAF8]/50 uppercase text-[10px]">Targeted Recommended Problem</div>
              <div className="p-4 rounded-xl bg-[#0D0D0D] border border-[#2C2C2C] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#FAFAF8]">LC 34. Find First and Last Position</div>
                  <div className="text-[11px] text-[#FAFAF8]/50 mt-1">Difficulty: Medium • Tag: Binary Search</div>
                </div>
                <button
                  onClick={onLaunchDemo}
                  className="px-3 py-1.5 rounded-lg bg-[#1B1BFF] text-[#FAFAF8] text-xs font-semibold hover:bg-[#3434ff] transition-colors"
                >
                  Solve Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Pillars Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold font-headline text-[#FAFAF8]">
            The 4-Pillar Pipeline
          </h2>
          <p className="text-sm font-sans text-[#FAFAF8]/60 mt-2">
            Engineered with OpenSearch indexing, DynamoDB persistence, and SM-2 spaced repetition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#1B1BFF]/50 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30 flex items-center justify-center mb-4 group-hover:bg-[#1B1BFF] group-hover:text-[#FAFAF8] transition-colors">
                <Command size={20} />
              </div>
              <h3 className="font-headline font-bold text-base text-[#FAFAF8] mb-2">
                Live Ingestion & Normalization
              </h3>
              <p className="text-xs text-[#FAFAF8]/60 leading-relaxed">
                Connects directly to LeetCode and Codeforces public endpoints, standardizing raw submission payloads into a canonical schema.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2C2C2C] font-mono text-[11px] text-[#00FF9C]">
              Zero-friction handle sync &rarr;
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#00FF9C]/50 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 flex items-center justify-center mb-4 group-hover:bg-[#00FF9C] group-hover:text-[#0D0D0D] transition-colors">
                <Search size={20} />
              </div>
              <h3 className="font-headline font-bold text-base text-[#FAFAF8] mb-2">
                OpenSearch Code Mining
              </h3>
              <p className="text-xs text-[#FAFAF8]/60 leading-relaxed">
                Full-text and semantic search across code snippets, error traces, and problem metadata to cluster similar mistake patterns.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2C2C2C] font-mono text-[11px] text-[#00FF9C]">
              Sub-millisecond queries &rarr;
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#1B1BFF]/50 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30 flex items-center justify-center mb-4 group-hover:bg-[#1B1BFF] group-hover:text-[#FAFAF8] transition-colors">
                <EyeOpen size={20} />
              </div>
              <h3 className="font-headline font-bold text-base text-[#FAFAF8] mb-2">
                Root-Cause Diagnostic Engine
              </h3>
              <p className="text-xs text-[#FAFAF8]/60 leading-relaxed">
                Pinpoints exact logical flaws: visited array omissions, adjacent array overlap in DP, or premature loop breakouts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2C2C2C] font-mono text-[11px] text-[#00FF9C]">
              Granular failure modes &rarr;
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#00FF9C]/50 transition-all group">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 flex items-center justify-center mb-4 group-hover:bg-[#00FF9C] group-hover:text-[#0D0D0D] transition-colors">
                <Calendar size={20} />
              </div>
              <h3 className="font-headline font-bold text-base text-[#FAFAF8] mb-2">
                SM-2 Spaced Repetition
              </h3>
              <p className="text-xs text-[#FAFAF8]/60 leading-relaxed">
                Adaptive practice schedules on intervals (Day 0 &rarr; 1 &rarr; 3 &rarr; 7 &rarr; 14) ensuring you lock in algorithmic mastery.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#2C2C2C] font-mono text-[11px] text-[#00FF9C]">
              Long-term retention &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2C2C2C] bg-[#0D0D0D] py-8 text-center text-xs font-mono text-[#FAFAF8]/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF9C]" />
            <span>BlindSpot AI Competitive-Programming Coach</span>
          </div>
          <div>
            Built with Next.js 15, TypeScript, DynamoDB, OpenSearch & Akar Icons
          </div>
        </div>
      </footer>
    </div>
  );
};
