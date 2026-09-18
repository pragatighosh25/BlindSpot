"use client";

import React from "react";
import { ScheduledReviewItem } from "@/types/schedule";
import { Calendar, Check, LinkOut, Trophy } from "akar-icons";

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
      badgeColor: "bg-[#00FF9C]/20 text-[#00FF9C] border-[#00FF9C]/30",
      accent: "border-[#00FF9C]/40",
      isDue: true,
    },
    {
      title: "Tomorrow (Day 1)",
      items: scheduleData.tomorrow,
      badgeColor: "bg-[#1B1BFF]/20 text-[#1B1BFF] border-[#1B1BFF]/30",
      accent: "border-[#2C2C2C]",
      isDue: false,
    },
    {
      title: "In 3 Days (Day 3)",
      items: scheduleData.in3Days,
      badgeColor: "bg-[#1A1A1A] text-[#FAFAF8]/80 border-[#2C2C2C]",
      accent: "border-[#2C2C2C]",
      isDue: false,
    },
    {
      title: "In 7 Days (Day 7)",
      items: scheduleData.in7Days,
      badgeColor: "bg-[#1A1A1A] text-[#FAFAF8]/80 border-[#2C2C2C]",
      accent: "border-[#2C2C2C]",
      isDue: false,
    },
    {
      title: "In 14 Days (Day 14)",
      items: scheduleData.later,
      badgeColor: "bg-[#00FF9C]/10 text-[#00FF9C] border-[#00FF9C]/20",
      accent: "border-[#2C2C2C]",
      isDue: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-headline text-[#FAFAF8] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00FF9C]" />
            <span>Spaced Repetition Review Schedule</span>
          </h2>
          <p className="text-xs font-sans text-[#FAFAF8]/60 mt-0.5">
            Structured intervals (Day 0 &rarr; 1 &rarr; 3 &rarr; 7 &rarr; 14) to permanently eliminate algorithmic blind spots
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono font-semibold px-3 py-1 bg-[#1A1A1A] rounded-xl border border-[#2C2C2C] text-[#FAFAF8]">
          <Trophy size={14} className="text-[#00FF9C]" />
          <span>{scheduleData.all.length} Tracked Problems</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`surface-panel rounded-2xl p-3.5 border ${col.accent} flex flex-col min-h-[220px]`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2C2C2C]">
              <span className="text-xs font-headline font-bold text-[#FAFAF8]">{col.title}</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${col.badgeColor}`}>
                {col.items.length}
              </span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {col.items.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[11px] font-mono text-[#FAFAF8]/40 italic py-6 text-center">
                  No practice due
                </div>
              ) : (
                col.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#0D0D0D] rounded-xl border border-[#2C2C2C] hover:border-[#3D3D3D] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#1B1BFF]">
                          {item.platform} #{item.problem_id}
                        </span>
                        <span className="text-[10px] font-mono text-[#FAFAF8]/50">
                          Step {item.step_index + 1}/5
                        </span>
                      </div>

                      <div className="text-xs font-headline font-semibold text-[#FAFAF8] mt-1 line-clamp-1">
                        {item.title}
                      </div>

                      {item.reason && (
                        <p className="text-[10px] font-sans text-[#FAFAF8]/60 mt-1 line-clamp-2 leading-tight">
                          {item.reason}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#2C2C2C] flex items-center justify-between">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-[#FAFAF8]/50 hover:text-[#00FF9C] flex items-center gap-1 transition-colors"
                        >
                          <span>Solve</span>
                          <LinkOut size={10} />
                        </a>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => onMarkCompleted(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-semibold rounded-lg bg-[#00FF9C]/10 hover:bg-[#00FF9C] text-[#00FF9C] hover:text-[#0D0D0D] border border-[#00FF9C]/30 transition-all"
                      >
                        <Check size={10} />
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
