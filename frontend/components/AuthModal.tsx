"use client";

import React, { useState } from "react";
import { Cross, Person, LockOn, ArrowRight, Sparkles, Check, LinkChain, Gear } from "akar-icons";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (handles: { leetcode: string; codeforces: string; userId: string; isDemo: boolean }) => void;
  initialMode?: "demo" | "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "demo",
}) => {
  const [tab, setTab] = useState<"demo" | "login" | "signup">(initialMode);
  const [leetcodeHandle, setLeetcodeHandle] = useState("pragatighosh25");
  const [codeforcesHandle, setCodeforcesHandle] = useState("pragatighosh");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLaunchDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        leetcode: "pragatighosh25",
        codeforces: "pragatighosh",
        userId: "pragatighosh25",
        isDemo: true,
      });
      onClose();
    }, 400);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        leetcode: leetcodeHandle.trim() || "pragatighosh25",
        codeforces: codeforcesHandle.trim() || "pragatighosh",
        userId: leetcodeHandle.trim() || "user_custom",
        isDemo: false,
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl p-6 md:p-8 shadow-2xl text-[#FAFAF8] overflow-hidden">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B1BFF] via-[#00FF9C] to-[#1B1BFF]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#2C2C2C] rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <Cross size={18} />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9C] animate-pulse" />
            <span className="text-xs font-mono font-semibold tracking-wider text-[#00FF9C] uppercase">
              BlindSpot Authentication
            </span>
          </div>
          <h2 className="text-2xl font-bold font-headline text-[#FAFAF8] tracking-tight">
            {tab === "demo" ? "Instant Demo Workspace" : tab === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-[#FAFAF8]/60 mt-1">
            {tab === "demo"
              ? "Access full real-time analysis pre-configured with active handles."
              : "Connect your competitive programming profiles to track your blind spots."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-[#0D0D0D] p-1 rounded-xl border border-[#2C2C2C] mb-6">
          <button
            type="button"
            onClick={() => setTab("demo")}
            className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
              tab === "demo"
                ? "bg-[#1A1A1A] text-[#00FF9C] border border-[#2C2C2C] shadow-sm"
                : "text-[#FAFAF8]/60 hover:text-[#FAFAF8]"
            }`}
          >
            ⚡ Demo Acc
          </button>
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
              tab === "login"
                ? "bg-[#1A1A1A] text-[#FAFAF8] border border-[#2C2C2C] shadow-sm"
                : "text-[#FAFAF8]/60 hover:text-[#FAFAF8]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`py-2 text-xs font-mono font-semibold rounded-lg transition-all ${
              tab === "signup"
                ? "bg-[#1A1A1A] text-[#FAFAF8] border border-[#2C2C2C] shadow-sm"
                : "text-[#FAFAF8]/60 hover:text-[#FAFAF8]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Tab 1: 1-Click Demo Account */}
        {tab === "demo" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#FAFAF8]/50 uppercase">Pre-Configured Handles</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20">
                  <Check size={10} /> Ready to Load
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] rounded-lg border border-[#2C2C2C]">
                  <span className="text-[#FAFAF8]/60">LeetCode Profile</span>
                  <span className="font-bold text-[#FAFAF8] text-right">@pragatighosh25</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#1A1A1A] rounded-lg border border-[#2C2C2C]">
                  <span className="text-[#FAFAF8]/60">Codeforces Profile</span>
                  <span className="font-bold text-[#FAFAF8] text-right">@pragatighosh</span>
                </div>
              </div>

              <div className="text-[11px] text-[#FAFAF8]/60 leading-relaxed pt-1">
                Includes real submission history, automated failure mode extraction, OpenSearch semantic matching, and SM-2 spaced repetition schedules.
              </div>
            </div>

            <button
              onClick={handleLaunchDemo}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00FF9C] text-[#0D0D0D] font-headline font-bold text-sm tracking-wide hover:bg-[#26ffaa] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9C]/20 disabled:opacity-50"
            >
              <Sparkles size={16} />
              {isLoading ? "Launching Demo Workspace..." : "Launch Demo Account Now"}
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Tab 2: Custom Login */}
        {tab === "login" && (
          <form onSubmit={handleCustomSubmit} className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-mono text-[#FAFAF8]/70 mb-1.5">Email or Handle</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="pragatighosh25"
                  value={email || leetcodeHandle}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLeetcodeHandle(e.target.value);
                  }}
                  className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl py-2.5 px-3.5 text-xs text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#FAFAF8]/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl py-2.5 px-3.5 text-xs text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1B1BFF] text-[#FAFAF8] font-headline font-semibold text-sm hover:bg-[#3434ff] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1B1BFF]/30 disabled:opacity-50"
            >
              {isLoading ? "Signing In..." : "Sign In to Dashboard"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* Tab 3: Custom Sign Up with Profile Connect */}
        {tab === "signup" && (
          <form onSubmit={handleCustomSubmit} className="space-y-3.5 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-mono text-[#FAFAF8]/70 mb-1.5">LeetCode Handle</label>
              <input
                type="text"
                required
                placeholder="e.g. pragatighosh25"
                value={leetcodeHandle}
                onChange={(e) => setLeetcodeHandle(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl py-2.5 px-3.5 text-xs text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#FAFAF8]/70 mb-1.5">Codeforces Handle</label>
              <input
                type="text"
                required
                placeholder="e.g. pragatighosh"
                value={codeforcesHandle}
                onChange={(e) => setCodeforcesHandle(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl py-2.5 px-3.5 text-xs text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#FAFAF8]/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl py-2.5 px-3.5 text-xs text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#00FF9C] text-[#0D0D0D] font-headline font-bold text-sm hover:bg-[#26ffaa] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00FF9C]/20 disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account & Sync Profiles"}
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
