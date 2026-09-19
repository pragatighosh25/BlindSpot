"use client";

import React from "react";
import { WeakTopic } from "@/schemas/analysis.schema";

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
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
            01 / DIAGNOSTIC REPORT
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">
            Mined Algorithmic Blind Spots
          </h2>
          
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 rounded-full w-fit">
          {weaknesses.length} Patterns Detected
        </span>
      </div>

      {weaknesses.length === 0 ? (
        <div className="card-candle-glow p-8 text-center space-y-2 border-white/10">
          <h3 className="text-sm font-semibold font-mono text-white">No Weakness Patterns Detected</h3>
          <p className="text-xs text-white/60 max-w-md mx-auto">
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
                className="card-candle-glow p-5 flex flex-col justify-between border-t-2 border-t-[#E4007C]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 uppercase">
                        {w.topic}
                      </span>
                      <span className="px-2.5 py-0.5 text-[10px] font-mono rounded-full bg-white/5 text-white/70 border border-white/10">
                        {w.evidence_count} occurrences
                      </span>
                    </div>

                    
                  </div>

                  <h3 className="text-base font-bold font-mono text-white mt-3">
                    {w.failure_mode}
                  </h3>

                  {w.description && (
                    <p className="text-xs text-white/70 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                      {w.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-white/50">
                    
                  </div>

                  <button
                    onClick={() => onSelectEvidence(w)}
                    className="text-xs font-mono font-semibold text-[#E4007C] hover:text-white bg-[#E4007C]/10 hover:bg-[#E4007C] px-3.5 py-1.5 rounded-full border border-[#E4007C]/30 transition-all shadow-sm"
                  >
                    <span>Inspect</span>
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
