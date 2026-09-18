"use client";

import React from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { Sparkles, EyeOpen, Fire, Check, Command } from "akar-icons";

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
          <h2 className="text-lg font-bold font-headline text-[#FAFAF8] flex items-center gap-2">
            <Fire className="w-5 h-5 text-[#00FF9C]" />
            <span>Recurring Weaknesses & Failure Patterns</span>
          </h2>
          <p className="text-xs font-sans text-[#FAFAF8]/60 mt-0.5">
            Identified by Strands AI Agent reasoning across LeetCode & Codeforces submissions
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30 rounded-full">
          {weaknesses.length} Patterns Detected
        </span>
      </div>

      {weaknesses.length === 0 ? (
        <div className="surface-panel rounded-2xl p-8 border border-[#2C2C2C] text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-[#00FF9C]/10 text-[#00FF9C] flex items-center justify-center">
            <Check size={20} />
          </div>
          <h3 className="text-sm font-semibold font-headline text-[#FAFAF8]">No Weakness Patterns Detected</h3>
          <p className="text-xs text-[#FAFAF8]/60 max-w-md mx-auto">
            Your analyzed submissions do not show recurring algorithmic failure patterns, or all tested submissions passed cleanly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weaknesses.map((w, idx) => {
            const confidencePercent = Math.round(w.confidence * 100);
            return (
              <div
                key={idx}
                className="surface-panel-hover rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30">
                        {w.topic}
                      </span>
                      <span className="px-2 py-0.5 text-[11px] font-mono rounded-full bg-[#0D0D0D] text-[#FAFAF8]/70 border border-[#2C2C2C]">
                        {w.evidence_count} occurrences
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono font-semibold text-[#00FF9C] bg-[#00FF9C]/10 px-2 py-1 rounded-md border border-[#00FF9C]/20">
                      <Sparkles size={12} />
                      <span>{confidencePercent}% confidence</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold font-headline text-[#FAFAF8] mt-3">
                    {w.failure_mode}
                  </h3>

                  {w.description && (
                    <p className="text-xs text-[#FAFAF8]/70 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                      {w.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#2C2C2C] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#FAFAF8]/50">
                    <Command size={12} />
                    <span>{w.example_submissions.length} evidence samples in OpenSearch</span>
                  </div>

                  <button
                    onClick={() => onSelectEvidence(w)}
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#00FF9C] hover:text-[#0D0D0D] bg-[#00FF9C]/10 hover:bg-[#00FF9C] px-3 py-1.5 rounded-xl border border-[#00FF9C]/30 transition-all shadow-sm"
                  >
                    <EyeOpen size={14} />
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
