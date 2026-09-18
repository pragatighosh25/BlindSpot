"use client";

import React from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { AlertCircle, Eye, Flame, TrendingUp } from "lucide-react";

interface WeaknessSectionProps {
  weaknesses: WeakTopic[];
  onSelectEvidence: (weakness: WeakTopic) => void;
}

export const WeaknessSection: React.FC<WeaknessSectionProps> = ({
  weaknesses,
  onSelectEvidence,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <span>Recurring Weaknesses & Failure Modes</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identified by AI reasoning across historical LeetCode & Codeforces submissions
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
          {weaknesses.length} Patterns Detected
        </span>
      </div>

      {weaknesses.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 border border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Flame className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Weakness Patterns Detected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your analyzed submissions do not show recurring algorithmic failure patterns, or no failed submissions were found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weaknesses.map((w, idx) => {
            const confidencePercent = Math.round(w.confidence * 100);
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {w.topic}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {w.evidence_count} occurrences
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{confidencePercent}% confidence</span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 mt-3">
                    {w.failure_mode}
                  </h3>

                  {w.description && (
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                    <span>{w.example_submissions.length} evidence samples in OpenSearch</span>
                  </div>

                  <button
                    onClick={() => onSelectEvidence(w)}
                    className="flex items-center space-x-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg border border-blue-500/30 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Evidence</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
