"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { StatsOverview } from "@/components/StatsOverview";
import { WeaknessSection } from "@/components/WeaknessSection";
import { EvidenceModal } from "@/components/EvidenceModal";
import { RecommendationsSection } from "@/components/RecommendationsSection";
import { PracticeSchedulerSection } from "@/components/PracticeSchedulerSection";
import { SubmissionsExplorer } from "@/components/SubmissionsExplorer";
import { IngestModal } from "@/components/IngestModal";
import { SyncProfileModal } from "@/components/SyncProfileModal";
import { LandingPage } from "@/components/LandingPage";
import { AuthModal } from "@/components/AuthModal";
import { WeakTopic, RecommendedProblem, AnalysisOutput } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { ScheduledReviewItem } from "@/types/schedule";
import { Sparkles, CircleAlert } from "akar-icons";

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">("landing");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<"demo" | "login" | "signup">("demo");

  // Active User Profile
  const [activeProfile, setActiveProfile] = useState({
    leetcode: "pragatighosh25",
    codeforces: "pragatighosh",
    userId: "pragatighosh25",
    isDemo: true,
  });

  // App Data State
  const [analysis, setAnalysis] = useState<AnalysisOutput | null>(null);
  const [submissions, setSubmissions] = useState<CanonicalSubmission[]>([]);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [scheduleData, setScheduleData] = useState<{
    today: ScheduledReviewItem[];
    tomorrow: ScheduledReviewItem[];
    in3Days: ScheduledReviewItem[];
    in7Days: ScheduledReviewItem[];
    later: ScheduledReviewItem[];
    all: ScheduledReviewItem[];
  }>({
    today: [],
    tomorrow: [],
    in3Days: [],
    in7Days: [],
    later: [],
    all: [],
  });

  const [selectedWeakness, setSelectedWeakness] = useState<WeakTopic | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");

  // Load Submissions from OpenSearch
  const loadSubmissions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (platformFilter) params.set("platform", platformFilter);
      if (verdictFilter) params.set("verdict", verdictFilter);

      const res = await fetch(`/api/submissions?${params.toString()}`);
      if (!res.ok) {
        console.error(`Submissions API returned HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
        setIsLiveMode(Boolean(data.isLive));
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    }
  }, [searchQuery, platformFilter, verdictFilter]);

  // Load AI Analysis (Strands Agent output)
  const loadAnalysis = useCallback(async (forceTrigger = false) => {
    try {
      let res;
      if (forceTrigger) {
        setIsAnalyzing(true);
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } else {
        res = await fetch("/api/analysis");
      }
      if (!res.ok) {
        console.error(`Analysis API returned HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error("Failed to load analysis:", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Load Spaced Repetition Schedule
  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule");
      if (!res.ok) {
        console.error(`Schedule API returned HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data.practice) {
        setScheduleData(data.practice);
      }
    } catch (e) {
      console.error("Failed to load schedule:", e);
    }
  }, []);

  // Initial load on page mount
  useEffect(() => {
    const init = async () => {
      setIsSyncing(true);
      setApiError(null);
      try {
        await Promise.all([loadSubmissions(), loadAnalysis(false), loadSchedule()]);
      } catch (err) {
        setApiError((err as Error).message);
      } finally {
        setIsSyncing(false);
      }
    };
    init();
  }, [loadSubmissions, loadAnalysis, loadSchedule]);

  // Explicit User Action: Run Fresh Strands Analysis
  const handleRunAnalysis = useCallback(async () => {
    if (isAnalyzing || isSyncing) return;
    setIsAnalyzing(true);
    setApiError(null);
    try {
      await loadAnalysis(true);
      await loadSchedule();
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, isSyncing, loadAnalysis, loadSchedule]);

  // Live Sync submissions trigger
  const handleLiveSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setApiError(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leetcodeUsername: activeProfile.leetcode,
          codeforcesHandle: activeProfile.codeforces,
          userId: activeProfile.userId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Sync failed");
      }
      await Promise.all([loadSubmissions(), loadAnalysis(false), loadSchedule()]);
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, activeProfile, loadSubmissions, loadAnalysis, loadSchedule]);

  // Modal Sync Complete
  const handleModalSyncComplete = useCallback(async () => {
    setIsSyncing(true);
    try {
      await Promise.all([loadSubmissions(), loadAnalysis(false), loadSchedule()]);
    } finally {
      setIsSyncing(false);
    }
  }, [loadSubmissions, loadAnalysis, loadSchedule]);

  const handleScheduleProblem = async (problem: RecommendedProblem) => {
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "schedule",
          problem: {
            problem_id: problem.problem_id,
            title: problem.title || `Problem ${problem.problem_id}`,
            topic: problem.topic || "Targeted Practice",
            platform: problem.platform,
            reason: problem.reason,
            url: problem.url,
          },
        }),
      });
      if (res.ok) {
        await loadSchedule();
      }
    } catch (e) {
      console.error("Failed to schedule problem:", e);
    }
  };

  const handleMarkCompleted = async (scheduleId: string) => {
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          scheduleId,
        }),
      });
      if (res.ok) {
        await loadSchedule();
      }
    } catch (e) {
      console.error("Failed to complete problem:", e);
    }
  };

  // Launch Demo Account
  const handleLaunchDemo = () => {
    setActiveProfile({
      leetcode: "pragatighosh25",
      codeforces: "pragatighosh",
      userId: "pragatighosh25",
      isDemo: true,
    });
    setCurrentView("dashboard");
  };

  // Auth Success Handler
  const handleAuthSuccess = (handles: {
    leetcode: string;
    codeforces: string;
    userId: string;
    isDemo: boolean;
  }) => {
    setActiveProfile(handles);
    setCurrentView("dashboard");
  };

  // Open Auth Modal helper
  const handleOpenAuth = (mode: "demo" | "login" | "signup") => {
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  // Compute metrics
  const totalSubmissions = submissions.length;
  const solvedCount = submissions.filter((s) => s.submission.verdict === "AC").length;
  const failureCount = submissions.filter((s) => s.submission.verdict !== "AC").length;
  const accuracyRate = totalSubmissions > 0 ? Math.round((solvedCount / totalSubmissions) * 100) : 0;
  const weaknessCount = analysis?.weak_topics.length || 0;
  const dueTodayCount = scheduleData.today.length;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FAFAF8] flex flex-col selection:bg-[#1B1BFF] selection:text-[#FAFAF8]">
      {currentView === "landing" ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onLaunchDemo={handleLaunchDemo}
        />
      ) : (
        <>
          <Navbar
            onSync={handleLiveSync}
            onAnalyze={handleRunAnalysis}
            onOpenIngestModal={() => setIsIngestOpen(true)}
            onOpenSyncModal={() => setIsConnectModalOpen(true)}
            onSignOut={() => setCurrentView("landing")}
            isSyncing={isSyncing}
            isAnalyzing={isAnalyzing}
            activeProfile={activeProfile}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
            {/* KPI Overview */}
            <StatsOverview
              totalSubmissions={totalSubmissions}
              failedSubmissions={failureCount}
              weaknessCount={weaknessCount}
              dueTodayCount={dueTodayCount}
              accuracyRate={accuracyRate}
              isLive={isLiveMode}
            />

            {/* API Error Notification */}
            {apiError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleAlert size={16} className="text-rose-400" />
                  <span>{apiError}</span>
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="text-[#FAFAF8]/60 hover:text-[#FAFAF8] px-2 py-1 rounded"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Strands AI Agent Reasoning Banner */}
            {analysis?.summary && (
              <div className="surface-panel rounded-2xl p-5 border border-[#1B1BFF]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1B1BFF]/10 border border-[#1B1BFF]/30 text-[#1B1BFF] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-mono font-bold text-[#FAFAF8] uppercase tracking-wider">
                        Strands AI Agent Reasoning Summary
                      </h4>
                      {analysis.analyzed_at && (
                        <span className="text-[10px] font-mono text-[#FAFAF8]/40">
                          • Updated {new Date(analysis.analyzed_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-sans text-[#FAFAF8]/80 mt-1 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="shrink-0 px-4 py-2 text-xs font-headline font-semibold rounded-xl bg-[#1A1A1A] hover:bg-[#222222] text-[#FAFAF8] border border-[#2C2C2C] transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? "Running Strands..." : "Run Fresh Analysis"}
                </button>
              </div>
            )}

            {/* Section: Weaknesses & Recommendations */}
            <div className="space-y-8">
              {analysis && (
                <WeaknessSection
                  weaknesses={analysis.weak_topics}
                  onSelectEvidence={(w) => setSelectedWeakness(w)}
                />
              )}

              {analysis && (
                <RecommendationsSection
                  recommendations={analysis.recommended_problems}
                  onScheduleProblem={handleScheduleProblem}
                />
              )}
            </div>

            {/* Section: Spaced Repetition Practice Schedule */}
            <PracticeSchedulerSection
              scheduleData={scheduleData}
              onMarkCompleted={handleMarkCompleted}
            />

            {/* Section: OpenSearch Explorer */}
            <SubmissionsExplorer
              submissions={submissions}
              onSelectSubmission={(sub) => {
                const topic = sub.problem.topic_tags[0] || "General";
                setSelectedWeakness({
                  topic,
                  failure_mode: `Submission Inspection: ${sub.problem.title}`,
                  confidence: 1.0,
                  evidence_count: 1,
                  example_submissions: [sub.submission_id],
                  description: sub.submission.error_message || "Inspecting submission record from OpenSearch.",
                });
              }}
              onSearchChange={(q) => setSearchQuery(q)}
              selectedPlatform={platformFilter}
              onSelectPlatform={(p) => setPlatformFilter(p)}
              selectedVerdict={verdictFilter}
              onSelectVerdict={(v) => setVerdictFilter(v)}
            />
          </main>

          {/* Dashboard Footer */}
          <footer className="border-t border-[#2C2C2C] bg-[#0D0D0D] py-6 text-center text-xs font-mono text-[#FAFAF8]/40">
            BlindSpot &bull; AI Competitive-Programming Coach &bull; LeetCode (@pragatighosh25) & Codeforces (@pragatighosh)
          </footer>
        </>
      )}

      {/* Auth & Demo Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        initialMode={authInitialMode}
      />

      {/* Evidence Code Inspection Modal */}
      <EvidenceModal
        weakness={selectedWeakness}
        onClose={() => setSelectedWeakness(null)}
      />

      {/* Live Ingestion Test Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngestSuccess={handleModalSyncComplete}
      />

      {/* Connect Real Accounts (LeetCode & Codeforces) Modal */}
      <SyncProfileModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSyncComplete={handleModalSyncComplete}
        currentProfile={{
          leetcodeUsername: activeProfile.leetcode,
          codeforcesHandle: activeProfile.codeforces,
          isLive: isLiveMode,
        }}
      />
    </div>
  );
}
