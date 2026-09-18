"use client";

import React, { useState } from "react";
import { X, Globe2, Sparkles, RefreshCw, CheckCircle2, AlertCircle, RotateCcw } from "lucide-react";

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
  const [leetcodeUsername, setLeetcodeUsername] = useState(currentProfile?.leetcodeUsername || "");
  const [codeforcesHandle, setCodeforcesHandle] = useState(currentProfile?.codeforcesHandle || "");
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

      setLeetcodeUsername("");
      setCodeforcesHandle("");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Connect Real Accounts
              </h2>
              <p className="text-xs text-slate-400">
                Fetch live LeetCode & Codeforces submissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSync} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              LeetCode Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. pragatighosh25, neetcode, tourist"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                disabled={loading}
                className="w-full pl-3 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Fetches recent submissions via LeetCode GraphQL.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Codeforces Handle
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. tourist, Benq, pragati25"
                value={codeforcesHandle}
                onChange={(e) => setCodeforcesHandle(e.target.value)}
                disabled={loading}
                className="w-full pl-3 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Fetches submission history via Codeforces official user.status API.
            </p>
          </div>

          {stepText && (
            <div className="p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-center space-x-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-400" />
              <span>{stepText}</span>
            </div>
          )}

          {resultMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                resultMsg.isError
                  ? "bg-rose-950/50 text-rose-300 border border-rose-800/50"
                  : "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50"
              }`}
            >
              {resultMsg.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleResetMock}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Mock</span>
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? "Fetching & Analyzing..." : "Fetch Live & Analyze"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
