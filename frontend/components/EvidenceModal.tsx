"use client";

import React, { useEffect, useState } from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  Cross,
  Command,
  Sparkles,
  LinkOut,
  Check,
  EyeOpen,
  LaptopDevice,
} from "akar-icons";

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
    fetch(`/api/submissions?topic=${encodeURIComponent(weakness.topic)}&verdict=WA`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="card-candle-glow bg-[#121212] w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-[#E4007C]/15 border border-[#E4007C]/30 text-[#E4007C]">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 rounded-full">
                  {weakness.topic}
                </span>
                <span className="text-xs font-mono text-white/60">
                  Failure Mode: <strong className="text-white">{weakness.failure_mode}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold font-mono text-white mt-0.5 flex items-center gap-2">
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
            <Cross size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Submission List Sidebar (4 cols) */}
          <div className="md:col-span-4 p-4 overflow-y-auto space-y-2.5 max-h-[25vh] md:max-h-full bg-[#0A0A0A]">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                Evidence Submissions ({submissions.length})
              </span>
              <span className="badge-pill-accent text-[9px]">OpenSearch</span>
            </div>

            {loading && (
              <div className="text-xs font-mono text-white/50 p-6 text-center">
                Querying OpenSearch index...
              </div>
            )}

            {!loading && submissions.length === 0 && (
              <div className="text-xs font-mono text-white/50 p-6 text-center">
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
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#1A1A1A] border-[#E4007C] shadow-lg ring-1 ring-[#E4007C]/40 text-white"
                      : "bg-[#141414] border-white/5 text-white/70 hover:bg-[#1A1A1A]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4007C]">
                      {sub.platform} #{sub.problem.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        sub.submission.verdict === "AC"
                          ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30"
                          : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {sub.submission.verdict}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-white truncate mt-1">
                    {sub.problem.title}
                  </div>
                  {subDiag?.failure_pattern && (
                    <div className="text-[10px] text-[#00FF9C] font-mono mt-1 truncate">
                      Pattern: {subDiag.failure_pattern}
                    </div>
                  )}
                  <div className="text-[10px] text-white/40 mt-1 flex items-center justify-between font-mono">
                    <span>{sub.submission.language}</span>
                    <span>{sub.submission_id}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Diagnosis & Evidence Main View (8 cols) */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-5 space-y-4 bg-[#121212]">
            {selectedSub ? (
              <>
                {/* Header Problem Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#181818] rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 text-xs font-mono text-white/80">
                    <span className="font-bold text-white">{selectedSub.problem.title}</span>
                    {selectedSub.problem.difficulty && (
                      <span className="px-2 py-0.5 bg-[#0A0A0A] border border-white/10 text-white/80 rounded-full text-[10px]">
                        {selectedSub.problem.difficulty}
                      </span>
                    )}
                    <span className="text-white/30">&bull;</span>
                    <span className="text-white/60">Lang: {selectedSub.submission.language}</span>
                  </div>

                  {selectedSub.problem.url && (
                    <a
                      href={selectedSub.problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-mono text-[#00FF9C] hover:underline"
                    >
                      <span>Open Problem</span>
                      <LinkOut size={12} />
                    </a>
                  )}
                </div>

                {/* 1. EXECUTION EVIDENCE CARD */}
                <div className="card-candle-glow p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00FF9C]">
                      <LaptopDevice size={14} />
                      <span>Execution Evidence (Judge Output)</span>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                      Verdict: {selectedSub.submission.verdict}
                    </span>
                  </div>

                  {/* Test Input / Actual / Expected Table */}
                  {evidence && (evidence.input || evidence.actual_output || evidence.expected_output) ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                      {evidence.input && (
                        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-white/10">
                          <span className="text-[10px] font-bold text-white/50 block uppercase">
                            Input
                          </span>
                          <span className="text-white break-all">{evidence.input}</span>
                        </div>
                      )}
                      {evidence.actual_output && (
                        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-rose-500/30 text-rose-300">
                          <span className="text-[10px] font-bold text-rose-400 block uppercase">
                            Actual Output
                          </span>
                          <span className="break-all">{evidence.actual_output}</span>
                        </div>
                      )}
                      {evidence.expected_output && (
                        <div className="bg-[#0A0A0A] p-2.5 rounded-xl border border-[#00FF9C]/30 text-[#00FF9C]">
                          <span className="text-[10px] font-bold text-[#00FF9C] block uppercase">
                            Expected Output
                          </span>
                          <span className="break-all">{evidence.expected_output}</span>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {selectedSub.submission.error_message && (
                    <div className="text-xs text-rose-300 font-mono bg-[#0A0A0A] p-2.5 rounded-xl border border-white/10">
                      {selectedSub.submission.error_message}
                    </div>
                  )}
                </div>

                {/* 2. AI ALGORITHMIC DIAGNOSIS CARD */}
                {analysis && (
                  <div className="card-candle-glow p-4 space-y-3.5 border-[#E4007C]/30">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#E4007C]" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          AI Algorithmic Diagnosis (Strands Agent)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 rounded-full">
                          Pattern: {analysis.failure_pattern || "logic_error"}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30 rounded-full">
                          {Math.round(analysis.confidence * 100)}% Confidence
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Root Cause */}
                      <div>
                        <span className="font-mono font-bold text-[#00FF9C] flex items-center gap-1.5 mb-1">
                          <span>1. Root Cause (What Went Wrong):</span>
                        </span>
                        <p className="text-white/90 font-sans leading-relaxed bg-[#0A0A0A] p-2.5 rounded-xl border border-white/10">
                          {analysis.root_cause}
                        </p>
                      </div>

                      {/* Why It Fails */}
                      <div>
                        <span className="font-mono font-bold text-white/70 flex items-center gap-1.5 mb-1">
                          <span>2. Why It Fails (Mechanism on Test Input):</span>
                        </span>
                        <p className="text-white/90 font-sans leading-relaxed bg-[#0A0A0A] p-2.5 rounded-xl border border-white/10">
                          {analysis.why_it_fails}
                        </p>
                      </div>

                      {/* Correct Concept & Invariant */}
                      <div>
                        <span className="font-mono font-bold text-[#E4007C] flex items-center gap-1.5 mb-1">
                          <span>3. Correct Concept & Invariant Violated:</span>
                        </span>
                        <p className="text-white/90 font-sans leading-relaxed bg-[#0A0A0A] p-2.5 rounded-xl border border-white/10">
                          {analysis.correct_concept}
                        </p>
                      </div>

                      {/* Suggested Fix */}
                      <div>
                        <span className="font-mono font-bold text-[#00FF9C] flex items-center gap-1.5 mb-1">
                          <span>4. Suggested Fix & Correct Recurrence / Logic:</span>
                        </span>
                        <p className="text-[#00FF9C] font-mono text-[11px] leading-relaxed bg-[#0A0A0A] p-2.5 rounded-xl border border-[#00FF9C]/30">
                          {analysis.suggested_fix}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SUBMITTED CODE VIEWER */}
                <div className="flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-[#0A0A0A]">
                  <div className="px-4 py-2.5 bg-[#141414] border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/60">
                    <div className="flex items-center gap-2">
                      <Command size={14} className="text-[#E4007C]" />
                      <span>Submitted Code ({selectedSub.submission.language})</span>
                    </div>
                    {analysis?.code_location && (
                      <span className="text-[10px] font-mono text-[#00FF9C] bg-[#00FF9C]/10 px-2 py-0.5 rounded-full border border-[#00FF9C]/20 truncate max-w-xs">
                        Bug in: {analysis.code_location}
                      </span>
                    )}
                  </div>

                  <pre className="p-4 text-xs font-mono text-white overflow-x-auto leading-relaxed max-h-72">
                    <code>{selectedSub.submission.code}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-mono text-white/40">
                Select a submission on the left to inspect evidence and AI diagnosis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
