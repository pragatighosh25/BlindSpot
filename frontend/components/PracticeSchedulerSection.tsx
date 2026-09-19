"use client";

import React, { useState } from "react";
import { ScheduledReviewItem } from "@/types/schedule";
import { Check, LinkOut } from "akar-icons";

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
  const [tickingId, setTickingId] = useState<string | null>(null);

  const handleTick = async (scheduleId: string) => {
    if (tickingId) return;
    setTickingId(scheduleId);
    try {
      // Allow visual green feedback animation for 500ms
      await new Promise((resolve) => setTimeout(resolve, 500));
      await onMarkCompleted(scheduleId);
    } catch (err) {
      console.error("Failed to advance spaced repetition item:", err);
    } finally {
      setTickingId(null);
    }
  };

  const columns = [
    {
      title: "Today",
      items: scheduleData.today,
      badgeColor: "bg-[#E4007C]/15 text-[#E4007C] border-[#E4007C]/30",
      accent: "border-[#E4007C]/40",
      
    },
    {
      title: "Tomorrow",
      items: scheduleData.tomorrow,
      badgeColor: "bg-[#00FF9C]/15 text-[#00FF9C] border-[#00FF9C]/30",
      accent: "border-white/10",
      
    },
    {
      title: "Day 3",
      items: scheduleData.in3Days,
      badgeColor: "bg-white/5 text-white/70 border-white/10",
      accent: "border-white/10",
      
    },
    {
      title: "Day 7",
      items: scheduleData.in7Days,
      badgeColor: "bg-white/5 text-white/70 border-white/10",
      accent: "border-white/10",
      
    },
    {
      title: "Day 14",
      items: scheduleData.later,
      badgeColor: "bg-[#00FF9C]/10 text-[#00FF9C] border-[#00FF9C]/20",
      accent: "border-white/10",
      
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
            02 / MEMORY RETENTION
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">
            Spaced Repetition Review Schedule
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`card-candle-glow p-3.5 border ${col.accent} flex flex-col min-h-[220px]`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-white">{col.title}</span>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {col.items.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[11px] font-mono text-white/40 italic py-6 text-center">
                  No practice due
                </div>
              ) : (
                col.items.map((item) => {
                  const isTicking = tickingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-[#0A0A0A] rounded-xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-2.5 group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-[#E4007C]">
                            {item.platform} #{item.problem_id}
                          </span>
                        </div>

                        <div className="text-xs font-mono font-semibold text-white mt-1 line-clamp-1" title={item.title}>
                          {item.title}
                        </div>
                      </div>

                      <div className="pt-2 border-white/10 flex items-center justify-between">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded-lg text-[11px] font-mono font-medium text-white/50 hover:text-[#00FF9C] hover:bg-white/5 transition-all flex items-center gap-1.5"
                            title="Open Problem"
                          >
                            <span>Solve</span>
                            <LinkOut size={12} />
                          </a>
                        ) : (
                          <span />
                        )}

                        <button
                          onClick={() => handleTick(item.id)}
                          disabled={isTicking}
                          className={`p-1.5 rounded-lg border transition-all duration-300 flex items-center justify-center ${
                            isTicking
                              ? "bg-[#00FF9C] text-[#0A0A0A] border-[#00FF9C] shadow-[0_0_14px_rgba(0,255,156,0.6)] scale-110"
                              : "text-white/40 hover:text-[#00FF9C] hover:border-[#00FF9C]/40 hover:bg-[#00FF9C]/10 border-white/10 bg-white/5"
                          }`}
                          
                        >
                          <Check size={13} className={isTicking ? "stroke-[3]" : ""} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
