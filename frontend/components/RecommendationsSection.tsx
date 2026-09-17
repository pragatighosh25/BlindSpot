"use client";

import React, { useState } from "react";
import { RecommendedProblem } from "@/schemas/analysis.schema";
import { Compass, CalendarPlus, CheckCircle, ExternalLink, Lightbulb } from "lucide-react";

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
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <span>Targeted Practice Recommendations</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated problem sets specifically addressing your recurring algorithmic failure modes
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
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
              className="glass-panel glass-panel-hover rounded-xl p-5 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                      {rec.platform}
                    </span>
                    {rec.topic && (
                      <span className="text-[11px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
                        {rec.topic}
                      </span>
                    )}
                  </div>
                  {rec.difficulty && (
                    <span className="text-xs text-slate-400 font-medium">
                      {rec.difficulty}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-3 flex items-center justify-between">
                  <span>{rec.title || `Problem ${rec.problem_id}`}</span>
                  {rec.url && (
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </h3>

                <div className="mt-3 p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/30 text-xs text-indigo-200">
                  <div className="flex items-center space-x-1.5 font-semibold text-indigo-300 mb-1">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Pedagogical Objective</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-slate-300">
                    {rec.reason}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => handleSchedule(rec)}
                  disabled={isScheduled || isLoading}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                    isScheduled
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                  }`}
                >
                  {isScheduled ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Scheduled</span>
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="w-3.5 h-3.5" />
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
