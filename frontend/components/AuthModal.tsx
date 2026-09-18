"use client";

import React, { useState, useEffect } from "react";
import {
  Cross,
  LockOn,
  ArrowRight,
  Sparkles,
  Check,
  CircleAlert,
  ArrowCycle,
  LinkOut,
  Person,
} from "akar-icons";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (handles: {
    leetcode: string;
    codeforces: string;
    userId: string;
    email?: string;
    isDemo: boolean;
  }) => void;
  initialMode?: "demo" | "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "demo",
}) => {
  const [tab, setTab] = useState<"demo" | "login" | "signup">(initialMode);
  
  // Registration Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leetcodeHandle, setLeetcodeHandle] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [copiedToken, setCopiedToken] = useState(false);

  // Verification states
  const [lcStatus, setLcStatus] = useState<{
    verifying: boolean;
    verified: boolean;
    error?: string;
    profile?: any;
  }>({ verifying: false, verified: false });

  const [cfStatus, setCfStatus] = useState<{
    verifying: boolean;
    verified: boolean;
    error?: string;
    profile?: any;
  }>({ verifying: false, verified: false });

  // General Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch unique verification token on load
  useEffect(() => {
    if (isOpen) {
      fetch("/api/auth/token")
        .then((res) => res.json())
        .then((data) => {
          if (data.token) setVerificationToken(data.token);
        })
        .catch(() => {
          setVerificationToken(`blindspot-verify-${Math.random().toString(36).substring(2, 7)}`);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1-Click Demo
  const handleLaunchDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        leetcode: "pragatighosh25",
        codeforces: "pragatighosh",
        userId: "pragatighosh25",
        email: "demo@blindspot.ai",
        isDemo: true,
      });
      onClose();
    }, 300);
  };

  // Live Verify LeetCode Handle
  const handleVerifyLeetCode = async () => {
    if (!leetcodeHandle.trim()) {
      setLcStatus({ verifying: false, verified: false, error: "Enter LeetCode username first." });
      return;
    }

    setLcStatus({ verifying: true, verified: false, error: undefined });
    try {
      const res = await fetch(
        `/api/verify-handle?platform=leetcode&handle=${encodeURIComponent(leetcodeHandle.trim())}&token=${encodeURIComponent(verificationToken)}`
      );
      const data = await res.json();
      if (!data.exists) {
        setLcStatus({ verifying: false, verified: false, error: data.message || "User not found on LeetCode." });
      } else {
        setLcStatus({
          verifying: false,
          verified: true,
          profile: data.profile,
        });
      }
    } catch (err) {
      setLcStatus({ verifying: false, verified: false, error: (err as Error).message });
    }
  };

  // Live Verify Codeforces Handle
  const handleVerifyCodeforces = async () => {
    if (!codeforcesHandle.trim()) {
      setCfStatus({ verifying: false, verified: false, error: "Enter Codeforces handle first." });
      return;
    }

    setCfStatus({ verifying: true, verified: false, error: undefined });
    try {
      const res = await fetch(
        `/api/verify-handle?platform=codeforces&handle=${encodeURIComponent(codeforcesHandle.trim())}&token=${encodeURIComponent(verificationToken)}`
      );
      const data = await res.json();
      if (!data.exists) {
        setCfStatus({ verifying: false, verified: false, error: data.message || "User not found on Codeforces." });
      } else {
        setCfStatus({
          verifying: false,
          verified: true,
          profile: data.profile,
        });
      }
    } catch (err) {
      setCfStatus({ verifying: false, verified: false, error: (err as Error).message });
    }
  };

  // Handle Dynamic Registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Email and password are required.");
      return;
    }

    if (!leetcodeHandle.trim() && !codeforcesHandle.trim()) {
      setFormError("Please provide at least one LeetCode or Codeforces handle.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          leetcodeUsername: leetcodeHandle.trim() || undefined,
          codeforcesHandle: codeforcesHandle.trim() || undefined,
          verificationToken,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      onLoginSuccess({
        leetcode: data.user.leetcodeUsername || leetcodeHandle || "pragatighosh25",
        codeforces: data.user.codeforcesHandle || codeforcesHandle || "pragatighosh",
        userId: data.user.userId,
        email: data.user.email,
        isDemo: false,
      });
      onClose();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError("Please enter your account email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Login failed.");
      }

      onLoginSuccess({
        leetcode: data.user.leetcodeUsername || "pragatighosh25",
        codeforces: data.user.codeforcesHandle || "pragatighosh",
        userId: data.user.userId,
        email: data.user.email,
        isDemo: Boolean(data.user.isDemo),
      });
      onClose();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(verificationToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="card-candle-glow relative w-full max-w-lg p-6 md:p-8 text-white overflow-hidden max-h-[94vh] overflow-y-auto">
        {/* Glow Accent Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E4007C] via-[#00FF9C] to-[#E4007C]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <Cross size={16} />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9C] animate-pulse" />
            <span className="badge-pill-accent">
              BLINDSPOT DYNAMIC ACCESS
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
            {tab === "demo"
              ? "Instant Demo Workspace"
              : tab === "login"
              ? "Welcome Back"
              : "Verify & Connect Handles"}
          </h2>
          <p className="text-xs text-white/60 mt-1">
            {tab === "demo"
              ? "Explore verified diagnostics with pre-configured developer profiles."
              : tab === "login"
              ? "Access your personalized spaced repetition practice queue."
              : "Connect and verify your LeetCode and Codeforces accounts."}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 bg-[#0A0A0A] p-1 rounded-full border border-white/10 mb-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setTab("demo");
              setFormError(null);
            }}
            className={`py-1.5 font-semibold rounded-full transition-all ${
              tab === "demo"
                ? "bg-[#E4007C] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            ⚡ Demo Acc
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setFormError(null);
            }}
            className={`py-1.5 font-semibold rounded-full transition-all ${
              tab === "signup"
                ? "bg-[#E4007C] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setFormError(null);
            }}
            className={`py-1.5 font-semibold rounded-full transition-all ${
              tab === "login"
                ? "bg-[#E4007C] text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Global Form Error Message */}
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs font-mono flex items-center gap-2">
            <CircleAlert size={15} className="shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Tab 1: 1-Click Demo Account */}
        {tab === "demo" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/50 uppercase tracking-wider">
                  Verified Demo Handles
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-semibold">
                  <Check size={10} /> Pre-Verified
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-[#141414] rounded-xl border border-white/5">
                  <span className="text-white/60">LeetCode Profile</span>
                  <span className="font-bold text-white">@pragatighosh25</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-[#141414] rounded-xl border border-white/5">
                  <span className="text-white/60">Codeforces Profile</span>
                  <span className="font-bold text-white">@pragatighosh</span>
                </div>
              </div>

              <div className="text-[11px] text-white/60 leading-relaxed font-sans pt-1">
                Loads real submissions, OpenSearch indices, Strands AI reasoning diagnoses, and spaced repetition practice without manual handle setup.
              </div>
            </div>

            <button
              onClick={handleLaunchDemo}
              disabled={isLoading}
              className="w-full btn-weevolve-primary py-3 px-4 flex items-center justify-center gap-2 text-xs"
            >
              <Sparkles size={15} />
              {isLoading ? "Launching Demo Workspace..." : "Launch Demo Account Now"}
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Tab 2: Dynamic Sign Up with Live Handle Verification */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4 animate-in fade-in duration-150">
            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">Email / Username</label>
                <input
                  type="text"
                  required
                  placeholder="you@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>
            </div>

            {/* LeetCode Handle Input & Verification */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-white/80">
                  LeetCode Username
                </label>
                {lcStatus.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 font-semibold">
                    <Check size={10} /> Verified on LeetCode
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. pragatighosh25, neetcode"
                  value={leetcodeHandle}
                  onChange={(e) => {
                    setLeetcodeHandle(e.target.value);
                    setLcStatus({ verifying: false, verified: false });
                  }}
                  className="flex-1 bg-[#141414] border border-white/10 rounded-full py-1.5 px-3 text-xs font-mono text-white focus:outline-none focus:border-[#E4007C]"
                />
                <button
                  type="button"
                  onClick={handleVerifyLeetCode}
                  disabled={lcStatus.verifying}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 text-white hover:bg-[#E4007C] hover:text-white border border-white/15 text-xs font-mono font-semibold transition-all flex items-center gap-1"
                >
                  {lcStatus.verifying ? (
                    <ArrowCycle size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  <span>Verify</span>
                </button>
              </div>

              {lcStatus.error && (
                <div className="text-[11px] font-mono text-rose-400">
                  ⚠️ {lcStatus.error}
                </div>
              )}

              {lcStatus.verified && lcStatus.profile && (
                <div className="text-[11px] font-mono text-white/70 flex items-center gap-3 pt-1 border-t border-white/10">
                  <span>Rank: <strong className="text-[#00FF9C]">{lcStatus.profile.ranking || "N/A"}</strong></span>
                  <span>Solved: <strong className="text-[#00FF9C]">{lcStatus.profile.totalSolved ?? "N/A"}</strong></span>
                </div>
              )}
            </div>

            {/* Codeforces Handle Input & Verification */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-white/80">
                  Codeforces Handle
                </label>
                {cfStatus.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 font-semibold">
                    <Check size={10} /> Verified on Codeforces
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
                    setCfStatus({ verifying: false, verified: false });
                  }}
                  className="flex-1 bg-[#141414] border border-white/10 rounded-full py-1.5 px-3 text-xs font-mono text-white focus:outline-none focus:border-[#E4007C]"
                />
                <button
                  type="button"
                  onClick={handleVerifyCodeforces}
                  disabled={cfStatus.verifying}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 text-white hover:bg-[#E4007C] hover:text-white border border-white/15 text-xs font-mono font-semibold transition-all flex items-center gap-1"
                >
                  {cfStatus.verifying ? (
                    <ArrowCycle size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                  <span>Verify</span>
                </button>
              </div>

              {cfStatus.error && (
                <div className="text-[11px] font-mono text-rose-400">
                  ⚠️ {cfStatus.error}
                </div>
              )}

              {cfStatus.verified && cfStatus.profile && (
                <div className="text-[11px] font-mono text-white/70 flex items-center gap-3 pt-1 border-t border-white/10">
                  <span>Rating: <strong className="text-[#00FF9C]">{cfStatus.profile.rating || 0}</strong></span>
                  <span>Rank: <strong className="text-[#00FF9C]">{cfStatus.profile.rank || "unrated"}</strong></span>
                </div>
              )}
            </div>

            {/* Ownership Token Proof Assistant */}
            <div className="p-3 bg-[#141414] rounded-2xl border border-white/10 text-[11px] font-mono space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Profile Ownership Token:</span>
                <button
                  type="button"
                  onClick={copyToken}
                  className="text-[10px] text-[#00FF9C] hover:underline flex items-center gap-1"
                >
                  {copiedToken ? "Copied! ✓" : "Copy Token"}
                </button>
              </div>
              <div className="p-1.5 bg-[#0A0A0A] rounded-xl border border-white/10 text-[#00FF9C] select-all">
                {verificationToken}
              </div>
              <p className="text-[10px] text-white/50 leading-tight">
                To confirm account ownership, you can paste this code in your LeetCode or Codeforces bio.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-weevolve-primary py-3 px-4 flex items-center justify-center gap-2 text-xs"
            >
              {isLoading ? "Verifying & Syncing Accounts..." : "Create Account & Sync Live Profiles"}
              <ArrowRight size={15} />
            </button>
          </form>
        )}

        {/* Tab 3: Custom Login */}
        {tab === "login" && (
          <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">
                Account Email or Handle
              </label>
              <input
                type="text"
                required
                placeholder="you@domain.com or pragatighosh25"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E4007C] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/70 mb-1.5">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#E4007C] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-weevolve-primary py-3 px-4 flex items-center justify-center gap-2 text-xs"
            >
              {isLoading ? "Signing In..." : "Sign In to Dashboard"}
              <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
