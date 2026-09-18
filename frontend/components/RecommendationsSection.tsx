"use client";

import React, { useState } from "react";
import { RecommendedProblem } from "@/schemas/analysis.schema";
import { Sparkles, Calendar, Check, LinkOut } from "akar-icons";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-headline text-[#FAFAF8] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1B1BFF]" />
            <span>Targeted Practice Recommendations</span>
          </h2>
          <p className="text-xs font-sans text-[#FAFAF8]/60 mt-0.5">
            Curated problem sets specifically addressing your recurring algorithmic failure modes
          </p>
        </div>
        <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30 rounded-full">
          {recommendations.length} Recommended
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, i) => {
          const isScheduled = scheduledIds.has(rec.problem_id);
          const isLoading = loadingId === rec.problem_id;

          return (
            <div
              key={i}
              className="surface-panel-hover rounded-2xl p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 bg-[#1B1BFF]/20 text-[#1B1BFF] border border-[#1B1BFF]/30 rounded-md">
                      {rec.platform}
                    </span>
                    {rec.topic && (
                      <span className="text-[11px] font-mono px-2 py-0.5 bg-[#0D0D0D] text-[#FAFAF8]/80 border border-[#2C2C2C] rounded-md font-medium">
                        {rec.topic}
                      </span>
                    )}
                  </div>
                  {rec.difficulty && (
                    <span className="text-xs font-mono text-[#FAFAF8]/60 font-medium">
                      {rec.difficulty}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold font-headline text-[#FAFAF8] mt-3 flex items-center justify-between">
                  <span>{rec.title || `Problem ${rec.problem_id}`}</span>
                  {rec.url && (
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FAFAF8]/40 hover:text-[#00FF9C] transition-colors"
                      title="Open Problem"
                    >
                      <LinkOut size={14} />
                    </a>
                  )}
                </h3>

                <div className="mt-3 p-3 rounded-xl bg-[#0D0D0D] border border-[#2C2C2C] text-xs">
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-[#00FF9C] mb-1">
                    <Sparkles size={12} />
                    <span>Pedagogical Objective</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-[#FAFAF8]/80 font-sans">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2C2C2C] flex items-center justify-end">
                <button
                  onClick={() => handleSchedule(rec)}
                  disabled={isScheduled || isLoading}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl transition-all shadow-sm ${
                    isScheduled
                      ? "bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30"
                      : "bg-[#1B1BFF] hover:bg-[#3434ff] text-[#FAFAF8]"
                  }`}
                >
                  {isScheduled ? (
                    <>
                      <Check size={14} />
                      <span>Scheduled</span>
                    </>
                  ) : (
                    <>
                      <Calendar size={14} />
                      <span>{isLoading ? "Scheduling..." : "Add to Review Schedule"}</span>
                    </>
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
