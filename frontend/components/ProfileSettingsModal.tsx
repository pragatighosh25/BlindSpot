"use client";

import React, { useState, useEffect } from "react";
import {
  Cross,
  Check,
  Copy,
  CircleAlert,
  ArrowCycle,
  LockOn,
  EyeSlashed,
  EyeOpen,
  Person,
} from "akar-icons";
import { Logo } from "./Logo";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: {
    leetcode: string;
    codeforces: string;
    userId?: string;
    email?: string;
    isDemo: boolean;
  };
  onProfileUpdated: (updated: {
    leetcode: string;
    codeforces: string;
    userId: string;
    email?: string;
    isDemo: boolean;
  }) => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onProfileUpdated,
}) => {
  const [tab, setTab] = useState<"handles" | "password" | "account">("handles");

  // Handles state
  const [leetcodeUsername, setLeetcodeUsername] = useState(activeProfile.leetcode || "");
  const [codeforcesHandle, setCodeforcesHandle] = useState(activeProfile.codeforces || "");
  const [verificationToken, setVerificationToken] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Feedback & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLeetcodeUsername(activeProfile.leetcode || "");
      setCodeforcesHandle(activeProfile.codeforces || "");
      setErrorMsg(null);
      setSuccessMsg(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Fetch verification token
      fetch("/api/auth/token")
        .then((r) => r.json())
        .then((d) => {
          if (d.token) setVerificationToken(d.token);
        })
        .catch(() => {
          setVerificationToken(`blindspot-verify-${Math.random().toString(36).substring(2, 7)}`);
        });
    }
  }, [isOpen, activeProfile]);

  if (!isOpen) return null;

  const copyToken = () => {
    if (!verificationToken) return;
    navigator.clipboard.writeText(verificationToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Handle Updates
  const handleUpdateHandles = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!leetcodeUsername.trim() && !codeforcesHandle.trim()) {
      setErrorMsg("Please provide at least one LeetCode or Codeforces ID.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/update-handles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeProfile.userId,
          leetcodeUsername: leetcodeUsername.trim(),
          codeforcesHandle: codeforcesHandle.trim(),
          verificationToken,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to update platform handles.");
      }

      setSuccessMsg("Handles updated & verified successfully! Live sync scheduled.");
      onProfileUpdated({
        leetcode: data.user.leetcodeUsername || leetcodeUsername.trim(),
        codeforces: data.user.codeforcesHandle || codeforcesHandle.trim(),
        userId: data.user.userId || activeProfile.userId || "user",
        email: data.user.email || activeProfile.email,
        isDemo: false,
      });
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword.trim()) {
      setErrorMsg("Please enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeProfile.userId,
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to change password.");
      }

      setSuccessMsg("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="card-candle-glow relative w-full max-w-lg p-6 bg-[#0A0A0A] border border-white/15 rounded-2xl text-white shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E4007C] via-[#00FF9C] to-[#E4007C] rounded-t-2xl" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <div>
              <h2 className="text-base font-bold font-mono text-white">Profile Settings</h2>
              <p className="text-xs text-white/50 font-mono">Manage handles and credentials</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Cross size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#141414] p-1 rounded-full border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setTab("handles");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 font-semibold rounded-full transition-all ${
              tab === "handles"
                ? "bg-[#E4007C] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Connected Handles
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("password");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 font-semibold rounded-full transition-all ${
              tab === "password"
                ? "bg-[#E4007C] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Password
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("account");
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-1.5 font-semibold rounded-full transition-all ${
              tab === "account"
                ? "bg-[#E4007C] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Account Info
          </button>
        </div>

        {/* Feedback Banners */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-start gap-2">
            <CircleAlert size={15} className="shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] text-xs font-mono flex items-center gap-2">
            <Check size={15} className="shrink-0 text-[#00FF9C]" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: CONNECTED HANDLES */}
        {tab === "handles" && (
          <form onSubmit={handleUpdateHandles} className="space-y-4 font-mono text-xs">
            {/* Bio Proof Instruction Box */}
            <div className="p-3 bg-[#141414] border border-white/10 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-white/70">1. Verification Code for Bio:</span>
                <button
                  type="button"
                  onClick={copyToken}
                  title={copiedToken ? "Copied!" : "Copy code"}
                  className="p-1 rounded hover:bg-white/10 text-[#00FF9C] transition-colors flex items-center gap-1 text-[11px]"
                >
                  {copiedToken ? (
                    <Check size={14} strokeWidth={2.5} className="text-[#00FF9C]" />
                  ) : (
                    <Copy size={14} strokeWidth={2} className="text-[#00FF9C]" />
                  )}
                </button>
              </div>
              <div className="px-3 py-1.5 bg-black/60 rounded-lg border border-white/10 font-mono text-xs text-[#E4007C] select-all font-bold">
                {verificationToken}
              </div>
              <p className="text-[10px] text-white/50 leading-relaxed">
                2. Paste this code into your LeetCode bio or Codeforces profile, update the username below, and click <strong>Verify &amp; Save</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-white/70 mb-1">LeetCode Username</label>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  placeholder="e.g. pragatighosh25, tourist"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/70 mb-1">Codeforces Handle</label>
                <input
                  type="text"
                  value={codeforcesHandle}
                  onChange={(e) => setCodeforcesHandle(e.target.value)}
                  placeholder="e.g. pragatighosh, tourist"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 font-bold bg-[#E4007C] hover:bg-[#c20069] disabled:opacity-50 text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <ArrowCycle size={13} className="animate-spin" />
                    <span>Verifying &amp; Saving...</span>
                  </>
                ) : (
                  <span>Verify &amp; Save Handles</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {tab === "password" && (
          <form onSubmit={handleChangePassword} className="space-y-4 font-mono text-xs">
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-white/70 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#141414] border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                  >
                    {showPassword ? <EyeSlashed size={14} /> : <EyeOpen size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-white/70 mb-1">New Password (Min. 8 chars)</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/70 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#141414] border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={isLoading || !currentPassword || newPassword.length < 8}
                className="px-4 py-2 font-bold bg-[#E4007C] hover:bg-[#c20069] disabled:opacity-50 text-white rounded-xl shadow-lg transition-all flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <ArrowCycle size={13} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Change Password</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ACCOUNT INFO */}
        {tab === "account" && (
          <div className="space-y-4 font-mono text-xs">
            <div className="bg-[#141414] border border-white/10 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/60">Email</span>
                <span className="text-white font-semibold">{activeProfile.email || "demo@blindspot.ai"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/60">User ID</span>
                <span className="text-white/80">{activeProfile.userId || "pragatighosh25"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-white/60">LeetCode Profile</span>
                <span className="text-[#00FF9C] font-semibold">@{activeProfile.leetcode}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-white/60">Codeforces Handle</span>
                <span className="text-[#00FF9C] font-semibold">@{activeProfile.codeforces}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold bg-white/10 hover:bg-white/15 text-white rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
