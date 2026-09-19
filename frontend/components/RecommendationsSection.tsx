"use client";

import React, { useState } from "react";
import { RecommendedProblem } from "@/schemas/analysis.schema";
import { Check, LinkOut } from "akar-icons";

interface RecommendationsSectionProps {
  recommendations: RecommendedProblem[];
  onScheduleProblem: (problem: RecommendedProblem) => Promise<void>;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  recommendations,
  onScheduleProblem,
}) => {
  const [scheduledIds, setScheduledIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSchedule = async (rec: RecommendedProblem) => {
    setLoadingId(rec.problem_id);
    try {
      await onScheduleProblem(rec);
      setScheduledIds((prev) => new Set(prev).add(rec.problem_id));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
            01 / TARGETED CURATION
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">
            Targeted Practice Recommendations
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => {
          const isScheduled = scheduledIds.has(rec.problem_id);
          const isLoading = loadingId === rec.problem_id;

          return (
            <div
              key={i}
              className="card-candle-glow p-5 flex flex-col justify-between border-t-2 border-t-[#00FF9C]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 rounded-full">
                      {rec.platform}
                    </span>
                    {rec.topic && (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-white/5 text-white/80 border border-white/10 rounded-full font-medium">
                        {rec.topic}
                      </span>
                    )}
                  </div>
                  {rec.difficulty && (
                    <span className="text-xs font-mono text-white/60 font-medium">
                      {rec.difficulty}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold font-mono text-white mt-3 flex items-center justify-between">
                  <span>{rec.title || `Problem ${rec.problem_id}`}</span>
                  {rec.url && (
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/40 hover:text-[#00FF9C] transition-colors"
                      title="Open Problem"
                    >
                      <LinkOut size={14} />
                    </a>
                  )}
                </h3>

                <div className="mt-3 p-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-xs">
                  <div className="font-mono text-[10px] font-bold text-[#00FF9C] uppercase tracking-wider mb-1">
                    Pedagogical Objective
                  </div>
                  <p className="leading-relaxed text-[11px] text-white/80 font-sans">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-end">
                <button
                  onClick={() => handleSchedule(rec)}
                  disabled={isScheduled || isLoading}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-full transition-all shadow-sm ${
                    isScheduled
                      ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30"
                      : "btn-weevolve-primary text-xs py-1.5 px-4"
                  }`}
                >
                  {isScheduled ? (
                    <>
                      <Check size={13} />
                      <span>Scheduled</span>
                    </>
                  ) : (
                    <span>{isLoading ? "Scheduling..." : "Add to Review Schedule"}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
