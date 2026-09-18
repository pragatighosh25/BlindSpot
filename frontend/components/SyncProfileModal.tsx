"use client";

import React, { useState } from "react";
import { Cross, Sparkles, ArrowCycle, Check, CircleAlert, Globe } from "akar-icons";

interface SyncProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
  currentProfile?: {
    leetcodeUsername?: string;
    codeforcesHandle?: string;
    isLive?: boolean;
  };
}

export const SyncProfileModal: React.FC<SyncProfileModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
  currentProfile,
}) => {
  const [leetcodeUsername, setLeetcodeUsername] = useState(currentProfile?.leetcodeUsername || "pragatighosh25");
  const [codeforcesHandle, setCodeforcesHandle] = useState(currentProfile?.codeforcesHandle || "pragatighosh");
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState("");
  const [resultMsg, setResultMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUsername.trim() && !codeforcesHandle.trim()) {
      setResultMsg({
        text: "Please enter at least a LeetCode username or Codeforces handle.",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setResultMsg(null);
    setStepText("Connecting to LeetCode GraphQL & Codeforces API...");

    try {
      setTimeout(() => {
        if (loading) setStepText("Fetching recent submissions & problem tags...");
      }, 1200);

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeUsername: leetcodeUsername.trim(),
          codeforcesHandle: codeforcesHandle.trim(),
          userId: leetcodeUsername.trim() || codeforcesHandle.trim() || "pragatighosh25",
          clearMock: true,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch profile submissions.");
      }

      setResultMsg({
        text: `Successfully synced ${data.totalCount} live submissions (${data.leetcodeCount} LeetCode, ${data.codeforcesCount} Codeforces). AI Coach weakness detection updated!`,
        isError: false,
      });

      onSyncComplete();
    } catch (err) {
      setResultMsg({ text: (err as Error).message, isError: true });
    } finally {
      setLoading(false);
      setStepText("");
    }
  };

  const handleResetMock = async () => {
    setLoading(true);
    setResultMsg(null);
    try {
      const res = await fetch("/api/reset-mock", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to reset mock data");

      setLeetcodeUsername("pragatighosh25");
      setCodeforcesHandle("pragatighosh");
      setResultMsg({
        text: "Restored 37 canonical mock submissions across 7 algorithmic topics.",
        isError: false,
      });
      onSyncComplete();
    } catch (err) {
      setResultMsg({ text: (err as Error).message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden text-[#FAFAF8]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2C2C2C] flex items-center justify-between bg-[#0D0D0D]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1B1BFF]/10 border border-[#1B1BFF]/30 text-[#1B1BFF]">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold font-headline text-[#FAFAF8]">
                Connect Real Accounts
              </h2>
              <p className="text-xs font-mono text-[#FAFAF8]/50">
                Fetch live LeetCode & Codeforces submissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#2C2C2C] transition-colors"
          >
            <Cross size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSync} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-[#FAFAF8]/70 uppercase tracking-wider mb-1.5">
              LeetCode Username
            </label>
            <input
              type="text"
              placeholder="e.g. pragatighosh25, neetcode, tourist"
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl text-[#FAFAF8] placeholder-[#FAFAF8]/40 focus:outline-none focus:border-[#1B1BFF] transition-colors"
            />
            <p className="text-[11px] font-mono text-[#FAFAF8]/40 mt-1">
              Fetches submissions via LeetCode GraphQL & alfa-leetcode-api.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#FAFAF8]/70 uppercase tracking-wider mb-1.5">
              Codeforces Handle
            </label>
            <input
              type="text"
              placeholder="e.g. pragatighosh, tourist, Benq"
              value={codeforcesHandle}
              onChange={(e) => setCodeforcesHandle(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl text-[#FAFAF8] placeholder-[#FAFAF8]/40 focus:outline-none focus:border-[#1B1BFF] transition-colors"
            />
            <p className="text-[11px] font-mono text-[#FAFAF8]/40 mt-1">
              Fetches submission history via Codeforces official user.status API.
            </p>
          </div>

          {stepText && (
            <div className="p-3 bg-[#1B1BFF]/10 border border-[#1B1BFF]/30 rounded-xl text-xs font-mono text-[#FAFAF8] flex items-center gap-2 animate-pulse">
              <ArrowCycle size={14} className="animate-spin text-[#00FF9C]" />
              <span>{stepText}</span>
            </div>
          )}

          {resultMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                resultMsg.isError
                  ? "bg-rose-950/50 text-rose-300 border border-rose-800/50"
                  : "bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30"
              }`}
            >
              {resultMsg.isError ? (
                <CircleAlert size={14} className="text-rose-400 shrink-0" />
              ) : (
                <Check size={14} className="text-[#00FF9C] shrink-0" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-[#2C2C2C]">
            <button
              type="button"
              onClick={handleResetMock}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#2C2C2C] rounded-xl transition-colors"
            >
              <ArrowCycle size={12} />
              <span>Reset to Mock</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-mono rounded-xl text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#2C2C2C] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-headline font-bold rounded-xl bg-[#00FF9C] text-[#0D0D0D] hover:bg-[#26ffaa] shadow-md shadow-[#00FF9C]/20 transition-all disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>{loading ? "Fetching & Analyzing..." : "Fetch Live & Analyze"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
