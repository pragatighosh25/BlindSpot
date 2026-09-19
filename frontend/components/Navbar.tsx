"use client";

import React from "react";
import {
  CloudDownload,
  Sparkles,
  SignOut,
} from "akar-icons";

export type WorkspaceTab = "diagnostics" | "practice" | "submissions";

interface NavbarProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onSync: () => void;
  onAnalyze: () => void;
  onOpenSyncModal: () => void;
  onSignOut?: () => void;
  isSyncing: boolean;
  isAnalyzing: boolean;
  activeProfile?: {
    leetcode: string;
    codeforces: string;
    isDemo: boolean;
  };
  stats?: {
    weaknessCount: number;
    dueCount: number;
    submissionCount: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onSync,
  onAnalyze,
  onOpenSyncModal,
  onSignOut,
  isSyncing,
  isAnalyzing,
  activeProfile = {
    leetcode: "pragatighosh25",
    codeforces: "pragatighosh",
    isDemo: true,
  },
  stats = {
    weaknessCount: 0,
    dueCount: 0,
    submissionCount: 0,
  },
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
      <div className="px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Handle Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-7 h-7 rounded-full bg-[#E4007C] flex items-center justify-center font-mono font-black text-xs text-white shadow-lg shadow-[#E4007C]/50 border border-white/20 relative">
            <span className="relative z-10">BS</span>
            <span className="absolute inset-0 rounded-full pulse-dot-pink" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-extrabold text-sm tracking-tight text-white">
              BlindSpot
            </span>
              
            
          </div>
        </div>

        {/* Dedicated Workspace Navigation Tabs (Clean minimal lines) */}
        <nav className="flex items-center gap-1 bg-[#121212] p-1 rounded-full border border-white/10 font-mono text-xs">
          <button
            onClick={() => onTabChange("diagnostics")}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "diagnostics"
                ? "bg-[#E4007C] text-white font-bold shadow-[0_0_15px_rgba(228,0,124,0.35)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>01. Diagnostics</span>
            
          </button>

          <button
            onClick={() => onTabChange("practice")}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "practice"
                ? "bg-[#E4007C] text-white font-bold shadow-[0_0_15px_rgba(228,0,124,0.35)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>02. Practice</span>
          </button>

          <button
            onClick={() => onTabChange("submissions")}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === "submissions"
                ? "bg-[#E4007C] text-white font-bold shadow-[0_0_15px_rgba(228,0,124,0.35)]"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span>03. Submissions</span>

          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-full bg-[#141414] text-white border border-white/10 text-xs font-mono hover:bg-[#1C1C1C] hover:border-[#E4007C]/40 transition-all disabled:opacity-50 flex items-center gap-1.5"
            title="Fetch live submissions from LeetCode & Codeforces"
          >
            <CloudDownload size={13} className={isSyncing ? "animate-bounce text-[#00FF9C]" : "text-white/60"} />
            <span className="hidden sm:inline text-[11px]">{isSyncing ? "Syncing..." : "Sync"}</span>
          </button>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-full bg-[#141414] border border-white/10 text-white/60 hover:text-white hover:bg-[#1C1C1C] transition-colors"
              title="Return to Landing Page"
              aria-label="Return to Landing"
            >
              <SignOut size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
