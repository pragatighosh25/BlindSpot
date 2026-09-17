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
import { WeakTopic, RecommendedProblem, AnalysisOutput } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { ScheduledReviewItem } from "@/types/schedule";

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisOutput | null>(null);
  const [submissions, setSubmissions] = useState<CanonicalSubmission[]>([]);
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
  const [inspectionSubmission, setInspectionSubmission] = useState<CanonicalSubmission | null>(null);
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    }
  }, [searchQuery, platformFilter, verdictFilter]);

  // Load AI Analysis (Person B output)
  const loadAnalysis = useCallback(async () => {
    try {
      const res = await fetch("/api/analysis");
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
      const data = await res.json();
      if (data.practice) {
        setScheduleData(data.practice);
      }
    } catch (e) {
      console.error("Failed to load schedule:", e);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
    loadAnalysis();
    loadSchedule();
  }, [loadSubmissions, loadAnalysis, loadSchedule]);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await Promise.all([loadSubmissions(), loadAnalysis(), loadSchedule()]);
    setTimeout(() => setIsSyncing(false), 600);
  };

  const handleScheduleProblem = async (problem: RecommendedProblem) => {
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "schedule",
        problem: {
          problem_id: problem.problem_id,
          title: problem.title || `Problem ${problem.problem_id}`,
          topic: problem.topic || "Algorithms",
          platform: problem.platform,
          reason: problem.reason,
          url: problem.url,
        },
      }),
    });
    await loadSchedule();
  };

  const handleMarkCompleted = async (scheduleId: string) => {
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "complete",
        scheduleId,
      }),
    });
    await loadSchedule();
  };

  // Compute metrics
  const totalSubmissions = submissions.length;
  const solvedCount = submissions.filter((s) => s.submission.verdict === "AC").length;
  const failureCount = submissions.filter((s) => s.submission.verdict !== "AC").length;
  const weaknessCount = analysis?.weak_topics.length || 0;

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col">
      <Navbar
        onSync={handleSyncAll}
        isSyncing={isSyncing}
        onOpenIngest={() => setIsIngestOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Overview */}
        <StatsOverview
          totalCount={totalSubmissions}
          solvedCount={solvedCount}
          failureCount={failureCount}
          weaknessCount={weaknessCount}
        />

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
            // Find if there is an associated weakness or construct one
            const topic = sub.problem.topic_tags[0] || "General";
            setSelectedWeakness({
              topic,
              failure_mode: `Submission Inspection: ${sub.problem.title}`,
              confidence: 1.0,
              evidence_count: 1,
              example_submissions: [sub.submission_id],
              description: sub.submission.error_message || "Inspecting historical code submission.",
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
          loadSubmissions();
        }}
      />
    </div>
  );
}
