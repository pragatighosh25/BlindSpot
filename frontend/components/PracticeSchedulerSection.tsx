"use client";

import React from "react";
import { ScheduledReviewItem } from "@/types/schedule";
import { Calendar, CheckCircle2, Clock, Check, ExternalLink, Trophy } from "lucide-react";

interface PracticeSchedulerSectionProps {
  scheduleData: {
    today: ScheduledReviewItem[];
    tomorrow: ScheduledReviewItem[];
    in3Days: ScheduledReviewItem[];
    in7Days: ScheduledReviewItem[];
    later: ScheduledReviewItem[];
    all: ScheduledReviewItem[];
  };
  onMarkCompleted: (scheduleId: string) => Promise<void>;
}

export const PracticeSchedulerSection: React.FC<PracticeSchedulerSectionProps> = ({
  scheduleData,
  onMarkCompleted,
}) => {
  const columns = [
    {
      title: "Today (Day 0)",
      items: scheduleData.today,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      accent: "border-rose-500/30",
      isDue: true,
    },
    {
      title: "Tomorrow (Day 1)",
      items: scheduleData.tomorrow,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      accent: "border-slate-800",
      isDue: false,
    },
    {
      title: "In 3 Days (Day 3)",
      items: scheduleData.in3Days,
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      accent: "border-slate-800",
      isDue: false,
    },
    {
      title: "In 7 Days (Day 7)",
      items: scheduleData.in7Days,
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      accent: "border-slate-800",
      isDue: false,
    },
    {
      title: "In 14 Days (Day 14)",
      items: scheduleData.later,
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      accent: "border-slate-800",
      isDue: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Spaced Repetition Review Schedule</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured intervals (Day 0 &rarr; 1 &rarr; 3 &rarr; 7 &rarr; 14) to permanently eliminate algorithmic blind spots
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 text-slate-300">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>{scheduleData.all.length} Tracked Problems</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`glass-panel rounded-xl p-3.5 border ${col.accent} flex flex-col min-h-[220px]`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">{col.title}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${col.badgeColor}`}>
                {col.items.length}
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {col.items.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[11px] text-slate-600 italic py-6 text-center">
                  No practice due
                </div>
              ) : (
                col.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-blue-400">
                          {item.platform} #{item.problem_id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Step {item.step_index + 1}/5
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                        {item.title}
                      </div>

                      {item.reason && (
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                          {item.reason}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-400 hover:text-blue-400 flex items-center space-x-1"
                        >
                          <span>Solve</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => onMarkCompleted(item.id)}
                        className="flex items-center space-x-1 px-2 py-1 text-[10px] font-semibold rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition"
                      >
                        <Check className="w-3 h-3" />
                        <span>Completed</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
