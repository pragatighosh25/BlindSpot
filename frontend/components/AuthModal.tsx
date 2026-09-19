"use client";

import React, { useState, useEffect } from "react";
import {
  Cross,
  LockOn,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  CircleAlert,
  ArrowCycle,
  EyeSlashed,
  EyeOpen,
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

type SignupStepNumber = 1 | 2 | 3 | 4 | 5;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "signup",
}) => {
  const [tab, setTab] = useState<"signup" | "login" | "demo">(initialMode);

  // Step state for Sign Up (1: Account, 2: Email, 3: LeetCode, 4: Codeforces, 5: Done)
  const [signupStep, setSignupStep] = useState<SignupStepNumber>(1);

  // Credentials (Only Email and Password - no Name/Display name)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP verification state
  const [emailCode, setEmailCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Platform Handles & Verification states
  const [leetcodeHandle, setLeetcodeHandle] = useState("");
  const [codeforcesHandle, setCodeforcesHandle] = useState("");

  const [lcStatus, setLcStatus] = useState<{
    verifying: boolean;
    verified: boolean;
    failed: boolean;
    error?: string;
    profile?: any;
  }>({ verifying: false, verified: false, failed: false });

  const [cfStatus, setCfStatus] = useState<{
    verifying: boolean;
    verified: boolean;
    failed: boolean;
    error?: string;
    profile?: any;
  }>({ verifying: false, verified: false, failed: false });

  // Verification token for optional profile bio badge
  const [verificationToken, setVerificationToken] = useState("");

  // Loading & Global Error states
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Reset tab when modal opens with initialMode
  useEffect(() => {
    if (isOpen) {
      setTab(initialMode);
      setFormError(null);
    }
  }, [isOpen, initialMode]);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Fetch token for proof-of-ownership
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

  // Email format validator
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  const isPasswordValid = password.length >= 8;

  // 1-Click Instant Demo
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
    }, 350);
  };

  // Direct Sign In for Existing Users (Email + Password only)
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
        throw new Error(data.error || "Login failed. Please check your credentials.");
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

  // Step 1: Create Account -> Validate domain and send email OTP
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isValidEmail(email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to send verification email.");
      }

      setResendCooldown(45);
      setSignupStep(2);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend Verification Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setFormError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to resend verification code.");
      }
      setResendCooldown(45);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify Email OTP code
  const handleStep2VerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!emailCode.trim() || emailCode.trim().length !== 6) {
      setFormError("Please enter the 6-digit verification code sent to your email.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: emailCode.trim(),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Invalid or expired verification code.");
      }

      setIsEmailVerified(true);
      setSignupStep(3); // Proceed to LeetCode step
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Probe LeetCode account existence
  const handleVerifyLeetCode = async () => {
    if (!leetcodeHandle.trim()) {
      setLcStatus({
        verifying: false,
        verified: false,
        failed: true,
        error: "Please enter a LeetCode username.",
      });
      return;
    }

    setLcStatus({ verifying: true, verified: false, failed: false, error: undefined });
    setFormError(null);

    try {
      const res = await fetch("/api/verify-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "leetcode",
          handle: leetcodeHandle.trim(),
          token: verificationToken,
        }),
      });
      const data = await res.json();
      if (!data.exists) {
        setLcStatus({
          verifying: false,
          verified: false,
          failed: true,
          error: `LeetCode ID '${leetcodeHandle.trim()}' could not be found.`,
        });
      } else {
        setLcStatus({
          verifying: false,
          verified: true,
          failed: false,
          profile: data.profile || data.result?.profile,
        });
      }
    } catch (err) {
      setLcStatus({
        verifying: false,
        verified: false,
        failed: true,
        error: (err as Error).message || "Verification request failed.",
      });
    }
  };

  // Step 4: Probe Codeforces account existence
  const handleVerifyCodeforces = async () => {
    if (!codeforcesHandle.trim()) {
      setCfStatus({
        verifying: false,
        verified: false,
        failed: true,
        error: "Please enter a Codeforces handle.",
      });
      return;
    }

    setCfStatus({ verifying: true, verified: false, failed: false, error: undefined });
    setFormError(null);

    try {
      const res = await fetch("/api/verify-handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "codeforces",
          handle: codeforcesHandle.trim(),
          token: verificationToken,
        }),
      });
      const data = await res.json();
      if (!data.exists) {
        setCfStatus({
          verifying: false,
          verified: false,
          failed: true,
          error: `Codeforces ID '${codeforcesHandle.trim()}' could not be found.`,
        });
      } else {
        setCfStatus({
          verifying: false,
          verified: true,
          failed: false,
          profile: data.profile || data.result?.profile,
        });
      }
    } catch (err) {
      setCfStatus({
        verifying: false,
        verified: false,
        failed: true,
        error: (err as Error).message || "Verification request failed.",
      });
    }
  };

  // Transition from Step 4 to Step 5 (ID Validation Rule)
  const handleProceedToAccountCreation = () => {
    setFormError(null);

    // Rule: At least ONE of LeetCode or Codeforces must exist and be verified
    const hasVerifiedLeetCode = lcStatus.verified && Boolean(leetcodeHandle.trim());
    const hasVerifiedCodeforces = cfStatus.verified && Boolean(codeforcesHandle.trim());

    if (!hasVerifiedLeetCode && !hasVerifiedCodeforces) {
      setFormError(
        "We couldn't verify either account. Please check your LeetCode and Codeforces IDs."
      );
      return;
    }

    setSignupStep(5);
    executeAccountCreation(hasVerifiedLeetCode, hasVerifiedCodeforces);
  };

  // Step 5: Execute final account creation and live sync
  const executeAccountCreation = async (hasLc: boolean, hasCf: boolean) => {
    setIsLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          leetcodeUsername: hasLc ? leetcodeHandle.trim() : undefined,
          codeforcesHandle: hasCf ? codeforcesHandle.trim() : undefined,
          verificationToken,
          emailVerificationCode: emailCode.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(
          data.error || "Account creation failed. Please check your details."
        );
      }

      setCreationSuccess(true);
      setTimeout(() => {
        onLoginSuccess({
          leetcode: data.user.leetcodeUsername || leetcodeHandle || "pragatighosh25",
          codeforces: data.user.codeforcesHandle || codeforcesHandle || "pragatighosh",
          userId: data.user.userId,
          email: data.user.email,
          isDemo: false,
        });
        onClose();
      }, 1400);
    } catch (err) {
      setFormError((err as Error).message);
      // Return to step 4 if registration failed so user can fix handles
      setSignupStep(4);
    } finally {
      setIsLoading(false);
    }
  };

  // Stepper Header definitions
  const stepsMeta = [
    { num: 1, label: "Account" },
    { num: 2, label: "Email" },
    { num: 3, label: "LeetCode" },
    { num: 4, label: "Codeforces" },
    { num: 5, label: "Done" },
  ];

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

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E4007C] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-white/60">
              BlindSpot &bull; Access Studio
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono text-white tracking-tight">
            {tab === "demo"
              ? "Instant Demo Workspace"
              : tab === "login"
              ? "Welcome Back"
              : "Create Your Account"}
          </h2>
          <p className="text-xs text-white/50 font-mono mt-1">
            {tab === "demo"
              ? "Explore full AI diagnostic reports with pre-verified profiles."
              : tab === "login"
              ? "Enter your credentials to access your algorithmic practice graph."
              : "Connect your competitive coding handles for automated error clustering."}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#0A0A0A] p-1 rounded-full border border-white/10 mb-6 font-mono text-xs">
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
            Sign Up
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
            Demo Acc
          </button>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-mono flex items-start gap-2 animate-in fade-in duration-150">
            <CircleAlert size={16} className="shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{formError}</div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIGN UP FLOW: MULTI-STEP VERIFICATION WIZARD                              */}
        {/* ========================================================================= */}
        {tab === "signup" && (
          <div className="space-y-6">
            {/* Step Progress Indicator */}
            <div className="bg-[#0A0A0A] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                {stepsMeta.map((s, idx) => {
                  const isActive = signupStep === s.num;
                  const isCompleted = signupStep > s.num;
                  return (
                    <React.Fragment key={s.num}>
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                            isCompleted
                              ? "bg-[#00FF9C] text-black"
                              : isActive
                              ? "bg-[#E4007C] text-white ring-2 ring-[#E4007C]/40"
                              : "bg-[#1A1A1A] text-white/40 border border-white/10"
                          }`}
                        >
                          {isCompleted ? <Check size={12} strokeWidth={3} /> : s.num}
                        </div>
                        <span
                          className={`text-[9px] font-mono transition-colors ${
                            isActive
                              ? "text-white font-bold"
                              : isCompleted
                              ? "text-[#00FF9C]"
                              : "text-white/40"
                          }`}
                        >
                          {s.label}
                        </span>
                      </div>
                      {idx < stepsMeta.length - 1 && (
                        <div
                          className={`flex-1 h-[1px] mx-1 transition-colors ${
                            signupStep > idx + 1 ? "bg-[#00FF9C]" : "bg-white/10"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* STEP 1: CREATE ACCOUNT (Email + Password only) */}
            {signupStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@domain.com"
                      className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-1"
                      >
                        {showPassword ? <EyeSlashed size={15} /> : <EyeOpen size={15} />}
                      </button>
                    </div>

                    {/* Password requirements clearly displayed */}
                    <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/5 font-mono text-[11px]">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 text-[9px] ${
                          isPasswordValid
                            ? "bg-[#00FF9C]/20 text-[#00FF9C]"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {isPasswordValid ? <Check size={10} strokeWidth={3} /> : "•"}
                      </span>
                      <span className={isPasswordValid ? "text-[#00FF9C]" : "text-white/60"}>
                        Password must be at least 8 characters
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isValidEmail(email) || !isPasswordValid}
                  className="w-full py-3 px-4 bg-[#E4007C] hover:bg-[#c20069] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <ArrowCycle size={14} className="animate-spin" />
                      <span>Verifying Email &amp; Sending Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY EMAIL (6-digit OTP code) */}
            {signupStep === 2 && (
              <form onSubmit={handleStep2VerifyEmail} className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-white/90">
                    <span className="text-base">✉️</span>
                    <span className="font-semibold">We sent a verification code to your email.</span>
                  </div>
                  <p className="text-white/50 text-[11px]">
                    Sent to <span className="text-white font-semibold">{email}</span>. Please check your inbox and enter the 6-digit code below to proceed.
                  </p>

                  <div>
                    <label className="block text-xs font-mono text-white/70 mb-1">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={emailCode}
                      onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full text-center tracking-[0.5em] text-lg font-mono px-3.5 py-2.5 bg-[#141414] border border-white/15 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-[#E4007C] transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-[11px] text-[#E4007C] hover:underline disabled:text-white/40 disabled:no-underline flex items-center gap-1"
                    >
                      <ArrowCycle size={11} className={isLoading ? "animate-spin" : ""} />
                      {resendCooldown > 0
                        ? `Resend code (${resendCooldown}s)`
                        : "Resend code"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setSignupStep(1);
                    }}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || emailCode.trim().length !== 6}
                    className="flex-1 py-3 px-4 bg-[#E4007C] hover:bg-[#c20069] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <ArrowCycle size={14} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Email</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: CONNECT LEETCODE */}
            {signupStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className="text-[#FFA116] font-bold">LC</span> Connect LeetCode Account
                    </span>
                    {lcStatus.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-bold">
                        <Check size={10} strokeWidth={3} /> Verified
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-white/50">
                    Enter your public LeetCode username to verify account existence and ingest submission telemetry.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={leetcodeHandle}
                      onChange={(e) => {
                        setLeetcodeHandle(e.target.value);
                        setLcStatus({ verifying: false, verified: false, failed: false });
                      }}
                      placeholder="e.g. tourist, pragatighosh25"
                      className="flex-1 px-3.5 py-2 bg-[#141414] border border-white/15 rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#FFA116] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyLeetCode}
                      disabled={lcStatus.verifying || !leetcodeHandle.trim()}
                      className="px-3.5 py-2 bg-[#FFA116] hover:bg-[#e08d10] disabled:opacity-50 text-black font-bold font-mono text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      {lcStatus.verifying ? (
                        <ArrowCycle size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      <span>Verify ID</span>
                    </button>
                  </div>

                  {/* LeetCode Probe Result Feedback */}
                  {lcStatus.verified && (
                    <div className="p-3 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Check size={12} strokeWidth={3} /> LeetCode account found &amp; verified!
                      </div>
                      <div className="text-white/70 text-[10px]">
                        ID: @{leetcodeHandle.trim()} &bull; Submissions ready for sync
                      </div>
                    </div>
                  )}

                  {lcStatus.failed && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <CircleAlert size={12} /> {lcStatus.error || "LeetCode ID could not be found."}
                      </div>
                      <div className="text-white/60 text-[10px]">
                        You can check the ID, or continue to Codeforces (only 1 valid platform account is required).
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setSignupStep(2);
                    }}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setSignupStep(4);
                    }}
                    className="flex-1 py-3 px-4 bg-[#E4007C] hover:bg-[#c20069] font-mono text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Codeforces</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: CONNECT CODEFORCES */}
            {signupStep === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-2">
                      <span className="text-[#318CE7] font-bold">CF</span> Connect Codeforces Account
                    </span>
                    {cfStatus.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-bold">
                        <Check size={10} strokeWidth={3} /> Verified
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-white/50">
                    Enter your Codeforces handle to verify account existence and track rating &amp; contest telemetry.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codeforcesHandle}
                      onChange={(e) => {
                        setCodeforcesHandle(e.target.value);
                        setCfStatus({ verifying: false, verified: false, failed: false });
                      }}
                      placeholder="e.g. tourist, Petr, pragatighosh"
                      className="flex-1 px-3.5 py-2 bg-[#141414] border border-white/15 rounded-xl text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#318CE7] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCodeforces}
                      disabled={cfStatus.verifying || !codeforcesHandle.trim()}
                      className="px-3.5 py-2 bg-[#318CE7] hover:bg-[#2374c4] disabled:opacity-50 text-white font-bold font-mono text-xs rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      {cfStatus.verifying ? (
                        <ArrowCycle size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      <span>Verify ID</span>
                    </button>
                  </div>

                  {/* Codeforces Probe Result Feedback */}
                  {cfStatus.verified && (
                    <div className="p-3 rounded-xl bg-[#00FF9C]/10 border border-[#00FF9C]/30 text-[#00FF9C] text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <Check size={12} strokeWidth={3} /> Codeforces handle found &amp; verified!
                      </div>
                      <div className="text-white/70 text-[10px]">
                        Handle: @{codeforcesHandle.trim()} &bull; Rating: {cfStatus.profile?.rating || "Active"}
                      </div>
                    </div>
                  )}

                  {cfStatus.failed && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] space-y-1">
                      <div className="font-bold flex items-center gap-1 text-amber-400">
                        <CircleAlert size={12} /> {cfStatus.error || "Codeforces ID could not be found."}
                      </div>
                      <div className="text-white/60 text-[10px]">
                        If your LeetCode account is verified, you can still continue to create your account!
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Summary Banner */}
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 font-mono text-[11px] space-y-1">
                  <div className="text-white/70 font-semibold flex items-center justify-between">
                    <span>Connected Platforms:</span>
                    <span className="text-[10px] text-white/40">Min. 1 Required</span>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${
                        lcStatus.verified
                          ? "bg-[#00FF9C]/15 text-[#00FF9C]"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {lcStatus.verified ? "✓" : "×"} LeetCode: {leetcodeHandle ? `@${leetcodeHandle}` : "Not Set"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded ${
                        cfStatus.verified
                          ? "bg-[#00FF9C]/15 text-[#00FF9C]"
                          : "bg-white/5 text-white/40"
                      }`}
                    >
                      {cfStatus.verified ? "✓" : "×"} Codeforces: {codeforcesHandle ? `@${codeforcesHandle}` : "Not Set"}
                    </span>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setSignupStep(3);
                    }}
                    className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedToAccountCreation}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-[#E4007C] hover:bg-[#c20069] disabled:opacity-50 font-mono text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <ArrowCycle size={14} className="animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Sign Up</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: ACCOUNT CREATION & COMPLETION */}
            {signupStep === 5 && (
              <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl text-center space-y-4 font-mono animate-in zoom-in-95 duration-200">
                {creationSuccess ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#00FF9C]/20 border border-[#00FF9C]/40 text-[#00FF9C] flex items-center justify-center mx-auto">
                      <Check size={24} strokeWidth={3} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Account Created!</h3>
                      <p className="text-xs text-white/60">
                        Email verified and competitive coding telemetry connected.
                      </p>
                    </div>
                    <div className="text-[11px] text-[#00FF9C] animate-pulse">
                      Launching BlindSpot Studio...
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#E4007C]/20 border border-[#E4007C]/40 text-[#E4007C] flex items-center justify-center mx-auto">
                      <ArrowCycle size={24} className="animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">Creating Account...</h3>
                      <p className="text-xs text-white/60">
                        Hashing credentials, provisioning DynamoDB records, and bootstrapping AI clustering graph.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LOGIN FLOW: SIMPLE DIRECT EMAIL & PASSWORD AUTH                           */}
        {/* ========================================================================= */}
        {tab === "login" && (
          <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-white/70 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/15 rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#E4007C] transition-colors pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-1"
                  >
                    {showPassword ? <EyeSlashed size={15} /> : <EyeOpen size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-3 px-4 bg-[#E4007C] hover:bg-[#c20069] disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs font-bold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <ArrowCycle size={14} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LockOn size={14} />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setSignupStep(1);
                  setFormError(null);
                }}
                className="text-xs font-mono text-white/50 hover:text-[#E4007C] transition-colors"
              >
                Don&apos;t have an account? <span className="underline">Create Account</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* DEMO FLOW: 1-CLICK INSTANT WORKSPACE                                      */}
        {/* ========================================================================= */}
        {tab === "demo" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/50 uppercase tracking-wider">
                  Verified Demo Handles
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/20 font-semibold">
                  <Check size={10} strokeWidth={3} /> Pre-Verified
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
            </div>

            <button
              onClick={handleLaunchDemo}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#E4007C] via-[#FF2E93] to-[#E4007C] hover:opacity-95 font-mono text-xs font-bold text-white rounded-xl shadow-lg shadow-[#E4007C]/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <ArrowCycle size={14} className="animate-spin" />
                  <span>Loading Demo Workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Launch 1-Click Demo</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
