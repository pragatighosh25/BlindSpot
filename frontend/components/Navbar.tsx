"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CloudDownload,
  SignOut,
  Person,
  Gear,
  ChevronDown,
  LockOn,
  Check,
} from "akar-icons";
import { Logo } from "./Logo";

export type WorkspaceTab = "diagnostics" | "practice" | "submissions";

interface NavbarProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  onSync: () => void;
  onAnalyze: () => void;
  onOpenSyncModal: () => void;
  onOpenProfileModal?: () => void;
  onSignOut?: () => void;
  isSyncing: boolean;
  isAnalyzing: boolean;
  activeProfile?: {
    leetcode: string;
    codeforces: string;
    userId?: string;
    email?: string;
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
  onOpenProfileModal,
  onSignOut,
  isSyncing,
  isAnalyzing,
  activeProfile = {
    leetcode: "pragatighosh25",
    codeforces: "pragatighosh",
    userId: "pragatighosh25",
    email: "demo@blindspot.ai",
    isDemo: true,
  },
  stats = {
    weaknessCount: 0,
    dueCount: 0,
    submissionCount: 0,
  },
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 250);
  };

  const displayHandle = activeProfile?.leetcode || activeProfile?.codeforces || activeProfile?.userId || "User";
  const userInitial = displayHandle.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
      <div className="px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Handle Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo className="w-7 h-7" />
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-extrabold text-sm tracking-tight text-white">
              BlindSpot
            </span>
            
          </div>
        </div>

        {/* Dedicated Workspace Navigation Tabs */}
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

        {/* Action Buttons & LeetCode-Style Profile Avatar Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Sync button */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-full bg-[#141414] text-white border border-white/10 text-xs font-mono hover:bg-[#1C1C1C] hover:border-[#E4007C]/40 transition-all disabled:opacity-50 flex items-center gap-1.5"
            title="Fetch live submissions from LeetCode & Codeforces"
          >
            <CloudDownload size={13} className={isSyncing ? "animate-bounce text-[#00FF9C]" : "text-white/60"} />
            <span className="hidden sm:inline text-[11px]">{isSyncing ? "Syncing..." : "Sync"}</span>
          </button>

          {/* LeetCode-style User Profile Menu */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Avatar Trigger Button */}
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 p-1 rounded-full border transition-all duration-200 outline-none ${
                isDropdownOpen
                  ? "border-[#E4007C] ring-2 ring-[#E4007C]/30 bg-[#1A1A1A]"
                  : "border-white/15 bg-[#141414] hover:border-white/30 hover:bg-[#1C1C1C]"
              }`}
              aria-label="User profile menu"
              aria-expanded={isDropdownOpen}
            >
              {/* LeetCode Style Circular Profile Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#282828] to-[#121212] border border-white/15 flex items-center justify-center text-white font-mono font-bold text-xs shadow-md relative overflow-hidden group">
                <span className="relative z-10 text-white/90 group-hover:text-white transition-colors">
                  {userInitial}
                </span>
                
              </div>
              <ChevronDown
                size={12}
                className={`text-white/50 transition-transform duration-200 pr-1 ${
                  isDropdownOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* LeetCode Style Floating Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#121212] border border-white/15 shadow-2xl shadow-black/80 backdrop-blur-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Glow bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E4007C] to-transparent rounded-t-2xl" />

                {/* User Header Section */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E4007C]/20 to-black border border-[#E4007C]/40 flex items-center justify-center text-[#E4007C] font-mono font-extrabold text-sm shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-bold text-white truncate">
                      @{displayHandle}
                    </p>
                    <p className="text-[11px] font-sans text-white/40 truncate">
                      {activeProfile?.email || "demo@blindspot.ai"}
                    </p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {/* Settings Item */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenProfileModal?.();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-mono text-white/80 hover:text-white hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="w-7 h-5 rounded-lg bg-white/5 flex items-center justify-center text-white/60 group-hover:text-[#E4007C] group-hover:border-[#E4007C]/30 transition-colors">
                      <Gear size={14} />
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-white">Settings</div>
                      
                    </div>
                  </button>
                </div>


                {/* Sign Out Item */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut?.();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left group"
                  >
                    <div className="w-7 h-5 rounded-lg bg-rose-950/30 flex items-center justify-center text-rose-400 group-hover:text-rose-300 transition-colors">
                      <SignOut size={14} />
                    </div>
                    <div>
                      <div className="font-semibold">Sign Out</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
