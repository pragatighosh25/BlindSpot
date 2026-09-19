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
    userId?: string;
  };
}

export const SyncProfileModal: React.FC<SyncProfileModalProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
  currentProfile,
}) => {
  const [leetcodeUsername, setLeetcodeUsername] = useState(currentProfile?.leetcodeUsername || "");
  const [codeforcesHandle, setCodeforcesHandle] = useState(currentProfile?.codeforcesHandle || "");
  const [loading, setLoading] = useState(false);
  const [stepText, setStepText] = useState("");
  const [resultMsg, setResultMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Verification states
  const [lcVerified, setLcVerified] = useState(false);
  const [cfVerified, setCfVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState<"leetcode" | "codeforces" | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (platform: "leetcode" | "codeforces") => {
    const handle = platform === "leetcode" ? leetcodeUsername : codeforcesHandle;
    if (!handle.trim()) return;

    setIsVerifying(platform);
    setResultMsg(null);
    try {
      const res = await fetch("/api/verify-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle: handle.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (platform === "leetcode") setLcVerified(true);
        if (platform === "codeforces") setCfVerified(true);
      } else {
        setResultMsg({
          text: data.result?.error || data.error || `${platform} handle not found.`,
          isError: true,
        });
      }
    } catch (e) {
      setResultMsg({ text: (e as Error).message, isError: true });
    } finally {
      setIsVerifying(null);
    }
  };

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUsername.trim() || !codeforcesHandle.trim()) {
      setResultMsg({
        text: "Please enter both your LeetCode username and Codeforces handle.",
        isError: true,
      });
      return;
    }

    setLoading(true);
    setResultMsg(null);
    setStepText("Verifying profiles and connecting to platform APIs...");

    try {
      const cleanLc = leetcodeUsername.trim();
      const cleanCf = codeforcesHandle.trim();
      const userId = currentProfile?.userId || cleanLc;

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeUsername: cleanLc,
          codeforcesHandle: cleanCf,
          userId,
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
        text: "Restored 37 canonical demo submissions across 7 algorithmic topics.",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="card-candle-glow bg-[#121212] w-full max-w-lg flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#E4007C]/15 border border-[#E4007C]/30 text-[#E4007C]">
              <Globe size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white">
                Connect & Verify Profiles
              </h2>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
                Validate and fetch real LeetCode & Codeforces submissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Cross size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSync} className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono font-semibold text-white/70 uppercase tracking-wider">
                LeetCode Username
              </label>
              {lcVerified && (
                <span className="text-[10px] font-mono text-[#00FF9C] flex items-center gap-1">
                  <Check size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. pragatighosh25, neetcode"
                value={leetcodeUsername}
                onChange={(e) => {
                  setLeetcodeUsername(e.target.value);
                  setLcVerified(false);
                }}
                disabled={loading}
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-[#0A0A0A] border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-[#E4007C] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleVerify("leetcode")}
                disabled={isVerifying === "leetcode" || !leetcodeUsername.trim()}
                className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-full bg-white/10 text-white hover:bg-[#E4007C] hover:text-white border border-white/15 transition-colors"
              >
                {isVerifying === "leetcode" ? "Checking..." : "Verify"}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-mono font-semibold text-white/70 uppercase tracking-wider">
                Codeforces Handle
              </label>
              {cfVerified && (
                <span className="text-[10px] font-mono text-[#00FF9C] flex items-center gap-1">
                  <Check size={10} /> Verified
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. pragatighosh, tourist, Benq"
                value={codeforcesHandle}
                onChange={(e) => {
                  setCodeforcesHandle(e.target.value);
                  setCfVerified(false);
                }}
                disabled={loading}
                className="flex-1 px-3.5 py-2 text-xs font-mono bg-[#0A0A0A] border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-[#E4007C] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleVerify("codeforces")}
                disabled={isVerifying === "codeforces" || !codeforcesHandle.trim()}
                className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-full bg-white/10 text-white hover:bg-[#E4007C] hover:text-white border border-white/15 transition-colors"
              >
                {isVerifying === "codeforces" ? "Checking..." : "Verify"}
              </button>
            </div>
          </div>

          {stepText && (
            <div className="p-3 bg-[#E4007C]/10 border border-[#E4007C]/30 rounded-xl text-xs font-mono text-white flex items-center gap-2 animate-pulse">
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

          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <button
              type="button"
              onClick={handleResetMock}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowCycle size={12} />
              <span>Reset to Demo</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3.5 py-2 text-xs font-mono rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn-weevolve-primary py-2 px-4 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                
                <span>{loading ? "Verifying & Syncing..." : "Verify & Sync Real Data"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
