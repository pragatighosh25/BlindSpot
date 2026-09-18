"use client";

import React from "react";
import {
  CloudDownload,
  Sparkles,
  ArrowCycle,
  SignOut,
  Person,
  LinkOut,
  Check,
} from "akar-icons";

interface NavbarProps {
  onSync: () => void;
  onAnalyze: () => void;
  onOpenIngestModal: () => void;
  onOpenSyncModal: () => void;
  onSignOut?: () => void;
  isSyncing: boolean;
  isAnalyzing: boolean;
  activeProfile?: {
    leetcode: string;
    codeforces: string;
    isDemo: boolean;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  onSync,
  onAnalyze,
  onOpenIngestModal,
  onOpenSyncModal,
  onSignOut,
  isSyncing,
  isAnalyzing,
  activeProfile = {
    leetcode: "pragatighosh25",
    codeforces: "pragatighosh",
    isDemo: true,
  },
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2C2C2C] bg-[#1A1A1A]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1B1BFF] flex items-center justify-center font-headline font-black text-sm text-[#FAFAF8] shadow-lg shadow-[#1B1BFF]/30 border border-[#1B1BFF]/60">
            BS
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline font-black text-lg tracking-tight text-[#FAFAF8]">
                BlindSpot
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 uppercase font-semibold">
                AI Coach
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#FAFAF8]/50 hidden sm:inline">
              Competitive Programming Diagnostic Engine
            </span>
          </div>
        </div>

        {/* User Handle Pill */}
        <button
          onClick={onOpenSyncModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D0D0D] border border-[#2C2C2C] hover:border-[#3D3D3D] transition-colors"
          title="Click to manage profile connections"
        >
          <div className="w-2 h-2 rounded-full bg-[#00FF9C] animate-pulse" />
          <div className="text-xs font-mono">
            <span className="text-[#FAFAF8]/50">LC:</span>
            <span className="text-[#FAFAF8] font-bold mx-1">@{activeProfile.leetcode}</span>
            <span className="text-[#FAFAF8]/30">|</span>
            <span className="text-[#FAFAF8]/50 ml-1">CF:</span>
            <span className="text-[#FAFAF8] font-bold ml-1">@{activeProfile.codeforces}</span>
          </div>
          {activeProfile.isDemo && (
            <span className="text-[9px] font-mono uppercase bg-[#1B1BFF]/20 text-[#1B1BFF] border border-[#1B1BFF]/30 px-1.5 py-0.2 rounded font-semibold ml-1">
              Demo
            </span>
          )}
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Sync Button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1A1A] text-[#FAFAF8] border border-[#2C2C2C] text-xs font-mono font-semibold hover:bg-[#222222] hover:border-[#3D3D3D] transition-all disabled:opacity-50"
            title="Fetch live submissions from LeetCode & Codeforces"
          >
            <CloudDownload size={14} className={isSyncing ? "animate-bounce text-[#00FF9C]" : "text-[#FAFAF8]/70"} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing API..." : "Live Sync"}</span>
          </button>

          {/* AI Trigger Analysis Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00FF9C] text-[#0D0D0D] font-headline font-bold text-xs tracking-wide hover:bg-[#26ffaa] transition-all shadow-md shadow-[#00FF9C]/20 disabled:opacity-50"
            title="Trigger Strands AI Agent weakness diagnosis"
          >
            <Sparkles size={14} className={isAnalyzing ? "animate-spin" : ""} />
            <span>{isAnalyzing ? "Analyzing Code..." : "Run AI Analysis"}</span>
          </button>

          {/* Sign Out / Exit to Landing */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 rounded-xl bg-[#0D0D0D] border border-[#2C2C2C] text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#222222] transition-colors"
              title="Return to Landing Page"
              aria-label="Return to Landing"
            >
              <SignOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
