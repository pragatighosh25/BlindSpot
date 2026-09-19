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
import { TextLoop } from "./TextLoop";
import { DiagnosticScrollSection } from "./DiagnosticScrollSection";
import { PatternNetworkIllustration } from "./PatternNetworkIllustration";

interface LandingPageProps {
  onOpenAuth: (mode: "demo" | "login" | "signup") => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onLaunchDemo,
}) => {

  



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
            {/* BlindSpot Brand Mark */}
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-10 shrink-0">
                <svg
                  viewBox="0 0 46 46"
                  className="relative w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-label="BlindSpot"
                >
                  <defs>
                    {/* Glass body */}
                    <linearGradient
                      id="bsGlass"
                      x1="8"
                      y1="5"
                      x2="38"
                      y2="42"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.22" />
                      <stop offset="0.22" stopColor="#E4007C" stopOpacity="0.14" />
                      <stop offset="0.65" stopColor="#E4007C" stopOpacity="0.04" />
                      <stop offset="1" stopColor="#000000" stopOpacity="0.45" />
                    </linearGradient>

                    {/* Premium pink edge */}
                    <linearGradient
                      id="bsEdge"
                      x1="5"
                      y1="5"
                      x2="39"
                      y2="40"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
                      <stop offset="0.25" stopColor="#FF4BA8" />
                      <stop offset="0.65" stopColor="#E4007C" />
                      <stop offset="1" stopColor="#8A004D" />
                    </linearGradient>

                    {/* Inner light */}
                    <linearGradient
                      id="bsReflection"
                      x1="10"
                      y1="8"
                      x2="28"
                      y2="28"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#FFFFFF" stopOpacity="0.7" />
                      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>

                    {/* Glow */}
                    <filter
                      id="bsGlow"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feGaussianBlur
                        stdDeviation="2"
                        result="blur"
                      />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Shadow */}
                    <filter
                      id="bsShadow"
                      x="-100%"
                      y="-100%"
                      width="300%"
                      height="300%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="2"
                        floodColor="#E4007C"
                        floodOpacity="0.35"
                      />
                    </filter>
                  </defs>

                  {/* Ambient glow behind the lens */}
                  <circle
                    cx="19"
                    cy="19"
                    r="15"
                    fill="#E4007C"
                    opacity="0.08"
                    filter="url(#bsGlow)"
                  />

                  {/* Outer glass ring */}
                  <circle
                    cx="19"
                    cy="19"
                    r="14"
                    fill="url(#bsGlass)"
                    stroke="url(#bsEdge)"
                    strokeWidth="1.8"
                    filter="url(#bsShadow)"
                  />

                  {/* Inner glass ring */}
                  <circle
                    cx="19"
                    cy="19"
                    r="10.5"
                    stroke="#FFFFFF"
                    strokeOpacity="0.12"
                    strokeWidth="0.8"
                  />

                  {/* Glass reflection */}
                  <path
                    d="M10.5 15.5C12.2 10.8 15.2 8.2 19.7 7.7"
                    stroke="url(#bsReflection)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />

                  {/* THE BLIND SPOT */}
                  <circle
                    cx="23"
                    cy="15"
                    r="2.7"
                    fill="#FFFFFF"
                    fillOpacity="0.92"
                  />

                  <circle
                    cx="23"
                    cy="15"
                    r="4.5"
                    stroke="#FFFFFF"
                    strokeOpacity="0.12"
                    strokeWidth="0.7"
                  />

                  {/* Lens depth accent */}
                  <path
                    d="M11.5 24.5C14.2 27.2 18.1 28.5 22 27.7"
                    stroke="#E4007C"
                    strokeOpacity="0.35"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />

                  {/* Handle — integrated into the mark */}
                  <path
                    d="M29.5 29.5L38 38"
                    stroke="url(#bsEdge)"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    filter="url(#bsShadow)"
                  />

                  {/* Handle glass highlight */}
                  <path
                    d="M30.7 30.7L36.7 36.7"
                    stroke="#FFFFFF"
                    strokeOpacity="0.28"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  {/* Tiny endpoint */}
                  <circle
                    cx="38"
                    cy="38"
                    r="1"
                    fill="#FFFFFF"
                    fillOpacity="0.35"
                  />
                </svg>
              </div>

              <span className="font-mono font-extrabold text-lg tracking-tight text-white">
                BlindSpot
              </span>
            </div>
            {/* Navigation Links with Expanding Underlines */}
            <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-white/70">
              <a href="#simulator" className="nav-link-underline hover:text-white">01. Simulator</a>
              <a href="#comparison" className="nav-link-underline hover:text-white">02. Comparison</a>             
              <a href="#pipeline" className="nav-link-underline hover:text-white">03. Capabilities</a>
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
              

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-mono tracking-tight leading-[1.05] text-white">
                Stop Grinding Blindly. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4007C] via-[#FF45A8] to-[#FFFFFF]">
                  Master Every Blind Spot.
                </span>
              </h1>

              

              {/* Description */}
              <p className="text-sm sm:text-base text-white/70 leading-relaxed font-sans font-normal">
                BlindSpot analyzes your coding mistakes, finds your weak areas, and gives you targeted practice to improve them.
              </p>

              {/* 2-Column KPI Ledger Box (WeMakeDevs style) */}
              <div className="grid grid-cols-2 divide-x divide-white/10 border-y border-white/10 py-4 font-mono">
                <div className="pr-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E4007C]" />
                    <span>Cross-Platform Sync</span>
                  </div>
                  <div className="text-2xl font-bold text-[#E4007C]">LeetCode &amp; CF</div>
                 
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/50 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]" />
                    <span>SM-2 Memory Lock</span>
                  </div>
                  <div className="text-2xl font-bold text-[#00FF9C]">5 Interval Steps</div>
                  
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

            {/* Right Editorial Isometric Pattern Network Illustration */}
            <div id="simulator" className="lg:col-span-6 relative flex items-center justify-center">
              <PatternNetworkIllustration />
            </div>
          </div>
        </section>

        {/* React Bits TextLoop Animated Ribbon */}
        <div className="bg-[#080808] py-2 overflow-hidden select-none relative">
          <TextLoop
            text="Blindspot shows you where u are wrong, why it happens, and what to practise next"
            shape="wave"
            speed={80}
            direction="reverse"
            separator="✦"
            curviness={40}
            fontSize={22}
            fontWeight={800}
            letterSpacing={2}
            uppercase={false}
            color="#FFFFFF"
            ribbon
            ribbonColor="#E4007C"
            ribbonWidth={48}
            pauseOnHover
            className="w-full max-h-[140px] flex items-center justify-center"
          />
        </div>

        {/* 01 / Method Comparison (Notebook Split Screen) */}
        <section id="comparison" className="border-b border-white/10 px-6 py-14 md:py-20 relative">
          <div className="crosshair-corner -top-[4px] -left-[4px]" />
          <div className="crosshair-corner -top-[4px] -right-[4px]" />

          <div className="max-w-2xl mx-auto text-center mb-12">
            <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
              01 / THE GROWTH METHOD
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              Targeted Intervals vs Random Grinding.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {/* Traditional Column */}
            <div className="bg-[#0D0D0D] rounded-2xl p-6 sm:p-7 border border-white/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  <span className="font-semibold text-white/70 uppercase tracking-wider text-[11px]">
                    Traditional Method
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/10">
                  Uncalibrated
                </span>
              </div>

              <div className="space-y-4 text-white/60 font-sans text-xs sm:text-[13px] leading-relaxed">
                <div className="pl-4 border-l border-white/10 space-y-1">
                  <div className="font-mono text-[11px] text-white/40 uppercase font-semibold">
                    01 &bull; Volume Over Insight
                  </div>
                  <p>
                    Solving random problem lists without diagnosing why specific test cases failed.
                  </p>
                </div>

                <div className="pl-4 border-l border-white/10 space-y-1">
                  <div className="font-mono text-[11px] text-white/40 uppercase font-semibold">
                    02 &bull; Recurrent Contest Penalties
                  </div>
                  <p>
                    Re-encountering the same boundary condition or unmemoized branch in high-pressure rounds.
                  </p>
                </div>

                <div className="pl-4 border-l border-white/10 space-y-1">
                  <div className="font-mono text-[11px] text-white/40 uppercase font-semibold">
                    03 &bull; Rating Plateau
                  </div>
                  <p>
                    Progress stalls as identical conceptual blind spots remain unresolved in memory.
                  </p>
                </div>
              </div>
            </div>

            {/* BlindSpot Column (Highlighted) */}
            <div className="bg-gradient-to-b from-[#131313] to-[#0C0C0C] rounded-2xl p-6 sm:p-7 border border-[#E4007C]/40 shadow-[0_0_35px_rgba(228,0,124,0.08)] space-y-6 relative overflow-hidden">
              {/* Subtle top corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E4007C]/5 blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#E4007C] shadow-[0_0_8px_#E4007C]" />
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Blindspot Method
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 font-semibold tracking-wide shadow-sm">
                  10x Retention
                </span>
              </div>

              <div className="space-y-4 text-white/85 font-sans text-xs sm:text-[13px] leading-relaxed relative z-10">
                <div className="pl-4 border-l-2 border-[#E4007C] space-y-1">
                  <div className="font-mono text-[11px] text-[#E4007C] uppercase font-bold tracking-wide">
                    01 &bull; Root Cause Extraction
                  </div>
                  <p className="text-white/80">
                    Connect handles once to isolate the exact logical invariants causing recurring failure vectors.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-[#E4007C] space-y-1">
                  <div className="font-mono text-[11px] text-[#E4007C] uppercase font-bold tracking-wide">
                    02 &bull; Adaptive SM-2 Intervals
                  </div>
                  <p className="text-white/80">
                    Targeted problems queued on <span className="font-mono text-[#00FF9C] font-semibold">Day 0 &rarr; 1 &rarr; 3 &rarr; 7 &rarr; 14</span> to convert weak points into second nature.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-[#E4007C] space-y-1">
                  <div className="font-mono text-[11px] text-[#E4007C] uppercase font-bold tracking-wide">
                    03 &bull; Long-Term Invariant Lock
                  </div>
                  <p className="text-white/80">
                    Eliminates recurring contest mistakes permanently through systematic spaced consolidation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 01 / Scroll-Driven Editorial Diagnostic Process */}
        <DiagnosticScrollSection onLaunchDemo={onLaunchDemo} />

        

        

        {/* 04 / Final Launch CTA */}
        <section className="px-6 py-16 md:py-24 text-center relative">
          <div className="crosshair-corner -top-[4px] -left-[4px]" />
          <div className="crosshair-corner -top-[4px] -right-[4px]" />

          <div className="max-w-3xl mx-auto space-y-6">
            
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
