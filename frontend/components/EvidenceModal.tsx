"use client";

import React, { useEffect, useState } from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { X, Code2, AlertOctagon, CheckCircle2, Clock, ExternalLink, Cpu } from "lucide-react";

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
    // Fetch evidence submissions by topic and IDs
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertOctagon className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                  {weakness.topic}
                </span>
                <span className="text-xs text-slate-400">
                  Evidence for: {weakness.failure_mode}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {weakness.failure_mode}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Submission List Sidebar */}
          <div className="p-4 overflow-y-auto space-y-2 max-h-[30vh] md:max-h-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Contributed Submissions ({submissions.length})
            </span>

            {loading && (
              <div className="text-xs text-slate-500 p-4 text-center">
                Loading evidence from OpenSearch...
              </div>
            )}

            {!loading && submissions.length === 0 && (
              <div className="text-xs text-slate-500 p-4 text-center">
                No matching submission records found.
              </div>
            )}

            {submissions.map((sub) => {
              const isSelected = selectedSub?.submission_id === sub.submission_id;
              return (
                <button
                  key={sub.submission_id}
                  onClick={() => setSelectedSub(sub)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500/40 text-white"
                      : "bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {sub.platform} #{sub.problem.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        sub.submission.verdict === "AC"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {sub.submission.verdict}
                    </span>
                  </div>
                  <div className="text-xs font-medium truncate mt-1">
                    {sub.problem.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Lang: {sub.submission.language}</span>
                    <span>ID: {sub.submission_id}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code Viewer & Error Details */}
          <div className="md:col-span-2 flex flex-col overflow-y-auto p-5 space-y-4">
            {selectedSub ? (
              <>
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{selectedSub.problem.title}</span>
                      {selectedSub.problem.difficulty && (
                        <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-normal">
                          {selectedSub.problem.difficulty}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>Platform: {selectedSub.platform.toUpperCase()}</span>
                      {selectedSub.submission.runtime_ms !== undefined && (
                        <span>Runtime: {selectedSub.submission.runtime_ms}ms</span>
                      )}
                      {selectedSub.submission.memory_mb !== undefined && (
                        <span>Memory: {selectedSub.submission.memory_mb}MB</span>
                      )}
                    </div>
                  </div>

                  {selectedSub.problem.url && (
                    <a
                      href={selectedSub.problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      <span>Problem Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Error diagnostics banner */}
                {selectedSub.submission.error_message && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Execution Diagnostic: </span>
                      <span>{selectedSub.submission.error_message}</span>
                    </div>
                  </div>
                )}

                {/* Code Window */}
                <div className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-[#060a12]">
                  <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <Code2 className="w-4 h-4 text-blue-400" />
                      <span>Submitted Code ({selectedSub.submission.language})</span>
                    </div>
                    <span>{selectedSub.submission_id}</span>
                  </div>

                  <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-96">
                    <code>{selectedSub.submission.code}</code>
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                Select a submission on the left to view code & error diagnostics
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
