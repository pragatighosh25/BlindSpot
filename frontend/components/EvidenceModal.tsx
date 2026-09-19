"use client";

import React, { useEffect, useState } from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  Sparkles,
  Laptop,
  Check,
  Code2,
  Lightbulb,
  X,
  ExternalLink,
  Target,
  AlertTriangle,
  Info,
} from "lucide-react";

interface EvidenceModalProps {
  weakness: WeakTopic | null;
  onClose: () => void;
}

function formatVerdict(verdict: string): string {
  switch (verdict) {
    case "WA":
      return "Wrong Answer";
    case "TLE":
      return "Time Limit Exceeded";
    case "MLE":
      return "Memory Limit Exceeded";
    case "RE":
      return "Runtime Error";
    case "CE":
      return "Compilation Error";
    case "AC":
      return "Accepted";
    default:
      return verdict;
  }
}

function formatTimestamp(ts?: number): string | null {
  if (!ts) return null;
  const date = new Date(ts > 1e11 ? ts : ts * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ weakness, onClose }) => {
  const [submissions, setSubmissions] = useState<CanonicalSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<CanonicalSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!weakness) return;

    setLoading(true);
    setFetchError(null);

    const topicParam = weakness.topic ? `topic=${encodeURIComponent(weakness.topic)}` : "";
    fetch(`/api/submissions?${topicParam}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`OpenSearch submissions API error: HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.submissions && Array.isArray(data.submissions)) {
          const matched = data.submissions.filter((s: CanonicalSubmission) =>
            weakness.example_submissions.includes(s.submission_id)
          );
          const finalSubs = matched.length > 0 ? matched : data.submissions;
          setSubmissions(finalSubs);
          if (finalSubs.length > 0) {
            setSelectedSub(finalSubs[0]);
          } else {
            setSelectedSub(null);
          }
        } else {
          setSubmissions([]);
          setSelectedSub(null);
        }
      })
      .catch((err) => {
        setFetchError((err as Error).message);
        setSubmissions([]);
        setSelectedSub(null);
      })
      .finally(() => setLoading(false));
  }, [weakness]);

  if (!weakness) return null;

  const analysis = selectedSub?.analysis;
  const evidence = analysis?.evidence;

  // Real data only — no hardcoded mock fallbacks
  const whatWentWrong = analysis?.what_went_wrong || analysis?.root_cause || analysis?.failure_mode;
  const whyItFails = analysis?.why_it_fails;
  const correctConcept = analysis?.correct_concept;
  const suggestedFix = analysis?.suggested_fix;
  const keyTakeaway = analysis?.key_takeaway;

  const yourApproachBullets = analysis?.approach_comparison?.your_approach || [];
  const correctApproachBullets = analysis?.approach_comparison?.correct_approach || [];

  const runtimeDisplay = selectedSub?.submission?.runtime_ms !== undefined
    ? `${selectedSub.submission.runtime_ms} ms / ${selectedSub.submission.memory_mb !== undefined ? selectedSub.submission.memory_mb + " MB" : "N/A"}`
    : "N/A (Not provided by judge)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#0F0F0F] w-full max-w-6xl h-[92vh] max-h-[92vh] flex flex-col shadow-2xl text-white rounded-2xl border border-white/10 overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-full bg-[#E4007C]/15 border border-[#E4007C]/30 text-[#E4007C]">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-0.5 bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 rounded-full">
                  {weakness.topic}
                </span>
                <span className="text-xs font-mono text-white/60">
                  Failure Mode: <strong className="text-white font-bold">{weakness.failure_mode}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold font-mono text-white mt-1 flex items-center gap-2">
                <span>{selectedSub?.problem.title || weakness.failure_mode}</span>
                {selectedSub && (
                  <span className="text-xs font-mono font-normal text-white/50">
                    ({selectedSub.platform.toUpperCase()} #{selectedSub.problem.id})
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden">
          {/* Left Sidebar: Evidence Submissions */}
          <div className="md:col-span-4 p-4 overflow-y-auto space-y-2.5 bg-[#0A0A0A] h-full min-h-0">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/60">
                EVIDENCE SUBMISSIONS ({submissions.length})
              </span>
              <span className="badge-pill-accent text-[9px]">OPENSEARCH</span>
            </div>

            {loading && (
              <div className="text-xs font-mono text-white/50 p-6 text-center">
                Querying OpenSearch index...
              </div>
            )}

            {fetchError && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs font-mono text-rose-300 flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 text-rose-400 mt-0.5" />
                <span>{fetchError}</span>
              </div>
            )}

            {!loading && !fetchError && submissions.length === 0 && (
              <div className="text-xs font-mono text-white/50 p-6 text-center">
                No matching submission records found in OpenSearch for this topic.
              </div>
            )}

            {submissions.map((sub) => {
              const isSelected = selectedSub?.submission_id === sub.submission_id;
              const subDiag = sub.analysis;
              const isAC = sub.submission.verdict === "AC";
              return (
                <button
                  key={sub.submission_id}
                  onClick={() => setSelectedSub(sub)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#171717] border-[#E4007C] shadow-lg ring-1 ring-[#E4007C]/50 text-white"
                      : "bg-[#121212] border-white/5 text-white/70 hover:bg-[#181818]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4007C]">
                      {sub.platform} #{sub.problem.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isAC
                          ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30"
                          : "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {sub.submission.verdict}
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-white truncate mt-1">
                    {sub.problem.title}
                  </div>
                  {subDiag?.failure_pattern && (
                    <div className="text-xs text-[#00FF9C] font-mono mt-1 truncate">
                      Pattern: {subDiag.failure_pattern}
                    </div>
                  )}
                  <div className="text-[11px] text-white/40 mt-1.5 flex items-center justify-between font-mono">
                    <span>{sub.submission.language}</span>
                    <span>{formatTimestamp(sub.submission.timestamp) || "N/A"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Pane */}
          <div className="md:col-span-8 overflow-y-auto p-5 md:p-6 space-y-4 bg-[#0F0F0F] h-full min-h-0">
            {selectedSub ? (
              <>
                {/* 1. Header Problem Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#141414] rounded-2xl border border-white/10">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                    <span className="font-bold text-white text-base">
                      {selectedSub.problem.title}
                    </span>
                    {selectedSub.problem.difficulty && (
                      <span className="px-2.5 py-0.5 bg-[#202020] border border-white/10 text-white/80 rounded-full text-xs font-mono">
                        {selectedSub.problem.difficulty}
                      </span>
                    )}
                    <span className="text-white/30">•</span>
                    <span className="text-white/60">Language: {selectedSub.submission.language}</span>
                  </div>

                  {selectedSub.problem.url && (
                    <a
                      href={selectedSub.problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-mono text-[#00FF9C] hover:underline"
                    >
                      <span>Open Problem</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {/* 2. EXECUTION RESULT */}
                <div className="p-4 sm:p-5 bg-[#141414] rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00FF9C]">
                      <Laptop size={15} />
                      <span>EXECUTION RESULT</span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full ${
                      selectedSub.submission.verdict === "AC"
                        ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}>
                      {formatVerdict(selectedSub.submission.verdict).toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                    {/* Col 1: Verdict */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-white/50 block">Verdict</span>
                      <span className="text-sm font-bold text-[#E4007C] block">
                        {formatVerdict(selectedSub.submission.verdict)}
                      </span>
                    </div>

                    {/* Col 2: Test Case Details */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-1 md:col-span-2">
                      <span className="text-[11px] font-bold text-white/50 block">
                        Judge Error / Execution Trace
                      </span>
                      {evidence?.input || evidence?.expected_output || selectedSub.submission.error_message ? (
                        <div className="text-xs space-y-1 text-white/90">
                          {evidence?.input && (
                            <div>
                              <span className="text-white/60">Input: </span>
                              <span className="text-white font-bold">{evidence.input}</span>
                            </div>
                          )}
                          {evidence?.expected_output && (
                            <div>
                              <span className="text-white/60">Expected: </span>
                              <span className="text-[#00FF9C] font-bold">{evidence.expected_output}</span>
                              {evidence?.actual_output && (
                                <span className="ml-3 text-rose-400">
                                  Output: {evidence.actual_output}
                                </span>
                              )}
                            </div>
                          )}
                          {selectedSub.submission.error_message && !evidence?.input && (
                            <div className="text-rose-300 text-xs">
                              {selectedSub.submission.error_message}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-white/40 italic flex items-center gap-1.5 pt-1">
                          <Info size={13} />
                          <span>No detailed judge execution trace provided by platform judge.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Runtime & Memory */}
                  <div className="flex items-center gap-2 text-xs font-mono text-white/50 pt-1">
                    <span>Performance:</span>
                    <span className="text-white/80 font-bold">{runtimeDisplay}</span>
                  </div>
                </div>

                {/* 3. AI ANALYSIS (STRANDS AGENT) */}
                <div className="p-4 sm:p-5 bg-[#141414] rounded-2xl border border-[#E4007C]/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#E4007C]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        AI ANALYSIS (STRANDS AGENT)
                      </span>
                    </div>
                    {analysis?.confidence !== undefined && (
                      <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30 rounded-full">
                        {Math.round(analysis.confidence * 100)}% Confidence
                      </span>
                    )}
                  </div>

                  {/* Section: What went wrong? */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E4007C] mb-2">
                      <Target size={15} />
                      <span>Root Cause Diagnosis</span>
                    </div>
                    <p className="text-sm font-sans text-white/90 leading-relaxed bg-[#0A0A0A] p-3.5 rounded-xl border border-white/10">
                      {whatWentWrong || "No root cause diagnosis recorded for this submission yet."}
                    </p>
                  </div>

                  {/* Section: Why it fails & Correct Concept */}
                  {(whyItFails || correctConcept) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {whyItFails && (
                        <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-rose-500/20 space-y-1.5">
                          <div className="text-xs font-mono font-bold text-rose-400">
                            Why It Violates Constraints
                          </div>
                          <p className="text-xs text-white/80 font-sans leading-relaxed">
                            {whyItFails}
                          </p>
                        </div>
                      )}

                      {correctConcept && (
                        <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#00FF9C]/20 space-y-1.5">
                          <div className="text-xs font-mono font-bold text-[#00FF9C]">
                            Algorithmic Invariant / Fix Strategy
                          </div>
                          <p className="text-xs text-white/80 font-sans leading-relaxed">
                            {correctConcept}
                          </p>
                          {suggestedFix && (
                            <p className="text-xs text-white/60 font-mono pt-1">
                              Fix: {suggestedFix}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section: Approach Comparison (if provided by agent) */}
                  {(yourApproachBullets.length > 0 || correctApproachBullets.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                      {yourApproachBullets.length > 0 && (
                        <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-rose-500/20 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E4007C]">
                            <Code2 size={15} />
                            <span>Your approach (inferred)</span>
                          </div>
                          <ul className="space-y-1.5 text-xs font-sans text-white/85 leading-relaxed">
                            {yourApproachBullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-rose-400 shrink-0 mt-0.5">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {correctApproachBullets.length > 0 && (
                        <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#00FF9C]/20 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00FF9C]">
                            <Lightbulb size={15} />
                            <span>Correct approach</span>
                          </div>
                          <ul className="space-y-1.5 text-xs font-sans text-white/85 leading-relaxed">
                            {correctApproachBullets.map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-[#00FF9C] shrink-0 mt-0.5">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. KEY TAKEAWAY (if available) */}
                {keyTakeaway && (
                  <div className="p-4 bg-[#0E241B] border border-[#00FF9C]/40 rounded-2xl flex items-start gap-3 shadow-lg shadow-[#00FF9C]/5">
                    <div className="p-1.5 rounded-lg bg-[#00FF9C]/20 text-[#00FF9C] shrink-0 mt-0.5">
                      <Check size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#00FF9C] uppercase tracking-wider block">
                        Key Takeaway
                      </span>
                      <p className="text-sm font-sans text-white/95 leading-relaxed mt-0.5 font-medium">
                        {keyTakeaway}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-mono text-white/40 h-full p-12 text-center">
                Select a submission on the left to inspect evidence and Strands AI diagnosis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
