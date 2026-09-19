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
  const [activeTab, setActiveTab] = useState<"diagnostics" | "practice" | "submissions">("diagnostics");
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

  // Load SM-2 Practice Schedule
  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch("/api/schedule");
      if (!res.ok) return;
      const data = await res.json();
      const sched = data.schedule || data.practice;
      if (sched) {
        setScheduleData(sched);
      }
    } catch (e) {
      console.error("Failed to load schedule:", e);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadSubmissions();
    loadAnalysis(false);
    loadSchedule();
  }, [loadSubmissions, loadAnalysis, loadSchedule]);

  // Handle Live Sync trigger
  const handleLiveSync = async () => {
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
      if (data.success) {
        await Promise.all([loadSubmissions(), loadAnalysis(false), loadSchedule()]);
      } else {
        setApiError(data.error || "Failed to complete live synchronization.");
      }
    } catch (e) {
      setApiError((e as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Run AI Agent Analysis
  const handleRunAnalysis = async () => {
    setApiError(null);
    try {
      await loadAnalysis(true);
      await loadSchedule();
    } catch (e) {
      setApiError((e as Error).message);
    }
  };

  // Schedule problem callback
  const handleScheduleProblem = async (rec: RecommendedProblem) => {
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "schedule",
        problem_id: rec.problem_id,
        platform: rec.platform,
        title: rec.title,
        topic: rec.topic || "Targeted Practice",
        url: rec.url,
        reason: rec.reason,
        problem: {
          problem_id: rec.problem_id,
          platform: rec.platform,
          title: rec.title,
          topic: rec.topic || "Targeted Practice",
          url: rec.url,
          reason: rec.reason,
        },
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to add problem to practice schedule.");
    }
    await loadSchedule();
  };

  // Complete review item
  const handleMarkCompleted = async (scheduleId: string) => {
    const res = await fetch("/api/schedule/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: scheduleId, scheduleId, action: "complete" }),
    });
    if (res.ok) {
      await loadSchedule();
    }
  };

  // Handle modal updates
  const handleModalSyncComplete = () => {
    loadSubmissions();
    loadAnalysis(false);
    loadSchedule();
  };

  // Launch Demo Handler
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
  const handleAuthSuccess = async (handles: {
    leetcode: string;
    codeforces: string;
    userId: string;
    email?: string;
    isDemo: boolean;
  }) => {
    setActiveProfile(handles);
    setCurrentView("dashboard");
    setIsSyncing(true);
    try {
      await Promise.all([loadSubmissions(), loadAnalysis(false), loadSchedule()]);
    } finally {
      setIsSyncing(false);
    }
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
    <div className="min-h-screen bg-[#0A0A0A] bg-dot-grid text-[#FAFAF8] flex flex-col selection:bg-[#E4007C] selection:text-white">
      {currentView === "landing" ? (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onLaunchDemo={handleLaunchDemo}
        />
      ) : (
        <div className="notebook-container min-h-screen relative flex flex-col">
          <div className="crosshair-corner top-0 -left-[4px]" />
          <div className="crosshair-corner top-0 -right-[4px]" />

          <Navbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSync={handleLiveSync}
            onAnalyze={handleRunAnalysis}
            onOpenIngestModal={() => setIsIngestOpen(true)}
            onOpenSyncModal={() => setIsConnectModalOpen(true)}
            onSignOut={() => setCurrentView("landing")}
            isSyncing={isSyncing}
            isAnalyzing={isAnalyzing}
            activeProfile={activeProfile}
            stats={{
              weaknessCount,
              dueCount: dueTodayCount,
              submissionCount: totalSubmissions,
            }}
          />

          <main className="flex-1 w-full px-6 py-8 space-y-8 animate-in fade-in duration-300">
            {/* API Error Notification */}
            {apiError && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleAlert size={16} className="text-rose-400" />
                  <span>{apiError}</span>
                </div>
                <button
                  onClick={() => setApiError(null)}
                  className="text-white/60 hover:text-white px-2 py-1 rounded-full"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* TAB 1: DIAGNOSTICS */}
            {activeTab === "diagnostics" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* KPI Ledger Overview */}
                <StatsOverview
                  totalSubmissions={totalSubmissions}
                  failedSubmissions={failureCount}
                  weaknessCount={weaknessCount}
                  dueTodayCount={dueTodayCount}
                  accuracyRate={accuracyRate}
                  isLive={isLiveMode}
                />

                {/* Strands AI Agent Reasoning Banner */}
                {analysis?.summary && (
                  <div className="card-candle-glow p-5 border-[#E4007C]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#E4007C]/15 border border-[#E4007C]/30 text-[#E4007C] flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                            Strands AI Agent Reasoning Summary
                          </h4>
                          {analysis.analyzed_at && (
                            <span className="text-[10px] font-mono text-white/40">
                              &bull; Updated {new Date(analysis.analyzed_at).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-sans text-white/80 mt-1 leading-relaxed">
                          {analysis.summary}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRunAnalysis}
                      disabled={isAnalyzing}
                      className="shrink-0 btn-weevolve-secondary text-xs py-2 px-4 flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isAnalyzing ? "Running Strands..." : "Run Fresh Analysis"}
                    </button>
                  </div>
                )}

                {/* Mined Algorithmic Blind Spots */}
                {analysis && (
                  <WeaknessSection
                    weaknesses={analysis.weak_topics}
                    onSelectEvidence={(w) => setSelectedWeakness(w)}
                  />
                )}
              </div>
            )}

            {/* TAB 2: PRACTICE & SM-2 */}
            {activeTab === "practice" && (
              <div className="space-y-10 animate-in fade-in duration-200">
                {/* Targeted Recommendations */}
                {analysis && (
                  <RecommendationsSection
                    recommendations={analysis.recommended_problems}
                    onScheduleProblem={handleScheduleProblem}
                  />
                )}

                {/* Spaced Repetition Practice Schedule */}
                <PracticeSchedulerSection
                  scheduleData={scheduleData}
                  onMarkCompleted={handleMarkCompleted}
                />
              </div>
            )}

            {/* TAB 3: SUBMISSIONS */}
            {activeTab === "submissions" && (
              <div className="space-y-6 animate-in fade-in duration-200">
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
              </div>
            )}
          </main>

          {/* Dashboard Footer */}
          <footer className="border-t border-white/10 bg-[#0A0A0A] py-6 px-6 text-center text-xs font-mono text-white/40">
            BlindSpot &bull; AI Competitive-Programming Coach &bull; LeetCode (@pragatighosh25) & Codeforces (@pragatighosh)
          </footer>
        </div>
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
