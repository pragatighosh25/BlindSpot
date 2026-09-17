"use client";

import React, { useEffect, useState } from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  X,
  Code2,
  AlertOctagon,
  ExternalLink,
  BrainCircuit,
  Terminal,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

interface EvidenceModalProps {
  weakness: WeakTopic | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ weakness, onClose }) => {
  const [submissions, setSubmissions] = useState<CanonicalSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<CanonicalSubmission | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!weakness) return;

    setLoading(true);
    // Fetch evidence submissions by topic
    fetch(`/api/submissions?topic=${encodeURIComponent(weakness.topic)}&verdict=WA`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
          // Prioritize example submissions listed in weakness
          const matched = data.submissions.filter((s: CanonicalSubmission) =>
            weakness.example_submissions.includes(s.submission_id)
          );
          const finalSubs = matched.length > 0 ? matched : data.submissions;
          setSubmissions(finalSubs);
          if (finalSubs.length > 0) setSelectedSub(finalSubs[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weakness]);

  if (!weakness) return null;

  const analysis = selectedSub?.analysis;
  const evidence = analysis?.evidence;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#090d16] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
              <BrainCircuit className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                  {weakness.topic}
                </span>
                <span className="text-xs text-slate-400">
                  Recurring Failure Mode: <strong className="text-slate-200">{weakness.failure_mode}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5 flex items-center space-x-2">
                <span>{selectedSub?.problem.title || weakness.failure_mode}</span>
                {selectedSub && (
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({selectedSub.platform.toUpperCase()} #{selectedSub.problem.id})
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Submission List Sidebar (3 cols) */}
          <div className="md:col-span-4 p-4 overflow-y-auto space-y-2.5 max-h-[25vh] md:max-h-full bg-[#060911]">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evidence Submissions ({submissions.length})
              </span>
              <span className="text-[11px] text-slate-500">OpenSearch</span>
            </div>

            {loading && (
              <div className="text-xs text-slate-500 p-6 text-center">
                Loading evidence from OpenSearch...
              </div>
            )}

            {!loading && submissions.length === 0 && (
              <div className="text-xs text-slate-500 p-6 text-center">
                No matching submission records found.
              </div>
            )}

            {submissions.map((sub) => {
              const isSelected = selectedSub?.submission_id === sub.submission_id;
              const subDiag = sub.analysis;
              return (
                <button
                  key={sub.submission_id}
                  onClick={() => setSelectedSub(sub)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    isSelected
                      ? "bg-blue-950/40 border-blue-500/60 shadow-lg ring-1 ring-blue-500/20 text-white"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {sub.platform} #{sub.problem.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sub.submission.verdict === "AC"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {sub.submission.verdict}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 truncate mt-1">
                    {sub.problem.title}
                  </div>
                  {subDiag?.failure_pattern && (
                    <div className="text-[10px] text-amber-400/90 font-mono mt-1 truncate">
                      Pattern: {subDiag.failure_pattern}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                    <span>{sub.submission.language}</span>
                    <span>{sub.submission_id}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Diagnosis & Evidence Main View (8 cols) */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-5 space-y-4 bg-[#080c14]">
            {selectedSub ? (
              <>
                {/* Header Problem Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-3 text-xs text-slate-300">
                    <span className="font-semibold text-white">{selectedSub.problem.title}</span>
                    {selectedSub.problem.difficulty && (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[11px]">
                        {selectedSub.problem.difficulty}
                      </span>
                    )}
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-400">Lang: {selectedSub.submission.language}</span>
                    {selectedSub.submission.runtime_ms !== undefined && (
                      <span className="text-slate-400">{selectedSub.submission.runtime_ms}ms</span>
                    )}
                  </div>

                  {selectedSub.problem.url && (
                    <a
                      href={selectedSub.problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      <span>Open Problem</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* 1. EXECUTION EVIDENCE CARD */}
                <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                      <Terminal className="w-4 h-4" />
                      <span>Execution Evidence (Judge Output)</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                      Verdict: {selectedSub.submission.verdict}
                    </span>
                  </div>

                  {/* Test Input / Actual / Expected Table */}
                  {evidence && (evidence.input || evidence.actual_output || evidence.expected_output) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                      {evidence.input && (
                        <div className="bg-black/40 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Input
                          </span>
                          <span className="text-slate-200 break-all">{evidence.input}</span>
                        </div>
                      )}
                      {evidence.actual_output && (
                        <div className="bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
                          <span className="text-[10px] font-bold text-rose-400 block uppercase">
                            Actual Output
                          </span>
                          <span className="text-rose-200 break-all">{evidence.actual_output}</span>
                        </div>
                      )}
                      {evidence.expected_output && (
                        <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-900/40">
                          <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                            Expected Output
                          </span>
                          <span className="text-emerald-200 break-all">{evidence.expected_output}</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {selectedSub.submission.error_message && (
                    <div className="text-xs text-rose-300/90 font-mono bg-black/30 p-2.5 rounded-lg border border-rose-950">
                      {selectedSub.submission.error_message}
                    </div>
                  )}
                </div>

                {/* 2. AI ALGORITHMIC DIAGNOSIS CARD */}
                {analysis && (
                  <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/20 p-4 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-indigo-900/40 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <BrainCircuit className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                          AI Algorithmic Diagnosis (BlindSpot Agent)
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                          Pattern: {analysis.failure_pattern || "logic_error"}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                          {Math.round(analysis.confidence * 100)}% Confidence
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Root Cause */}
                      <div>
                        <span className="font-bold text-rose-300 flex items-center space-x-1.5 mb-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>1. Root Cause (What Went Wrong):</span>
                        </span>
                        <p className="text-slate-200 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-slate-800/80">
                          {analysis.root_cause}
                        </p>
                      </div>

                      {/* Why It Fails */}
                      <div>
                        <span className="font-bold text-amber-300 flex items-center space-x-1.5 mb-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>2. Why It Fails (Mechanism on Test Input):</span>
                        </span>
                        <p className="text-slate-200 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-slate-800/80">
                          {analysis.why_it_fails}
                        </p>
                      </div>

                      {/* Correct Concept & Invariant */}
                      <div>
                        <span className="font-bold text-sky-300 flex items-center space-x-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                          <span>3. Correct Concept & Invariant Violated:</span>
                        </span>
                        <p className="text-slate-200 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-slate-800/80">
                          {analysis.correct_concept}
                        </p>
                      </div>

                      {/* Suggested Fix / Recurrence */}
                      <div>
                        <span className="font-bold text-emerald-300 flex items-center space-x-1.5 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>4. Suggested Fix & Correct Recurrence / Pointer Logic:</span>
                        </span>
                        <p className="text-emerald-100 font-mono text-[11px] leading-relaxed bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/50">
                          {analysis.suggested_fix}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SUBMITTED CODE VIEWER */}
                <div className="flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-[#050811]">
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4 text-blue-400" />
                      <span>Submitted Code ({selectedSub.submission.language})</span>
                    </div>
                    {analysis?.code_location && (
                      <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 truncate max-w-xs">
                        Bug in: {analysis.code_location}
                      </span>
                    )}
                  </div>

                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-72">
                    <code>{selectedSub.submission.code}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a submission on the left to view algorithmic diagnosis and execution evidence.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
