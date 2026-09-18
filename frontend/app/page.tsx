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
import { WeakTopic, RecommendedProblem, AnalysisOutput } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { ScheduledReviewItem } from "@/types/schedule";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisOutput | null>(null);
  const [submissions, setSubmissions] = useState<CanonicalSubmission[]>([]);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [profile, setProfile] = useState<{ userId?: string; leetcodeUsername?: string; codeforcesHandle?: string }>({});
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
        if (data.profile) setProfile(data.profile);
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

  // Initial load on page mount (loads persisted analysis WITHOUT running Strands)
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
    if (isSyncing) return;
    setIsSyncing(true);
    setApiError(null);
    try {
      await loadAnalysis(true);
      await loadSchedule();
    } catch (err) {
      setApiError((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadAnalysis, loadSchedule]);

  // Sync complete handler for modals
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

  // Compute metrics
  const totalSubmissions = submissions.length;
  const solvedCount = submissions.filter((s) => s.submission.verdict === "AC").length;
  const failureCount = submissions.filter((s) => s.submission.verdict !== "AC").length;
  const weaknessCount = analysis?.weak_topics.length || 0;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col">
      <Navbar
        onSync={handleRunAnalysis}
        isSyncing={isSyncing}
        onOpenIngest={() => setIsIngestOpen(true)}
        onOpenConnectProfile={() => setIsConnectModalOpen(true)}
        isLiveMode={isLiveMode}
        totalSubmissions={totalSubmissions}
        profile={profile}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Overview */}
        <StatsOverview
          totalCount={totalSubmissions}
          solvedCount={solvedCount}
          failureCount={failureCount}
          weaknessCount={weaknessCount}
        />

        {/* API Error Notification */}
        {apiError && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>⚠️ {apiError}</span>
            <button
              onClick={() => setApiError(null)}
              className="text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Strands AI Agent Reasoning Banner */}
        {analysis?.summary && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-indigo-950/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm">🧠</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    Strands AI Agent Diagnosis
                  </h4>
                  {analysis.analyzed_at && (
                    <span className="text-[10px] text-slate-500">
                      • Updated {new Date(analysis.analyzed_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {analysis.summary}
                </p>
              </div>
            </div>
            <button
              onClick={handleRunAnalysis}
              disabled={isSyncing}
              className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 transition disabled:opacity-50"
            >
              {isSyncing ? "Running Strands..." : "Run Fresh Analysis"}
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

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        BlindSpot &bull; Hackathon Person A Data & Ingestion Pipeline &bull; OpenSearch & Spaced Repetition Active
      </footer>

      {/* Evidence Code Inspection Modal */}
      <EvidenceModal
        weakness={selectedWeakness}
        onClose={() => setSelectedWeakness(null)}
      />

      {/* Live Ingestion Test Modal */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngestSuccess={() => {
          handleModalSyncComplete();
        }}
      />

      {/* Connect Real Accounts (LeetCode & Codeforces) Modal */}
      <SyncProfileModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSyncComplete={() => {
          handleModalSyncComplete();
        }}
        currentProfile={profile}
      />
    </div>
  );
}
