"use client";

import React from "react";
import { Fire, Sparkles, Calendar, Command } from "akar-icons";

interface StatsOverviewProps {
  totalSubmissions: number;
  failedSubmissions: number;
  weaknessCount: number;
  dueTodayCount: number;
  accuracyRate: number;
  isLive?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalSubmissions,
  failedSubmissions,
  weaknessCount,
  dueTodayCount,
  accuracyRate,
  isLive = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Metric 1: Total Processed */}
      <div className="surface-panel-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-[#FAFAF8]/60 uppercase tracking-wider">
            Total Submissions
          </span>
          <div className="p-2 rounded-xl bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30">
            <Command size={16} />
          </div>
        </div>
        <div className="text-3xl font-extrabold font-headline text-[#FAFAF8] tracking-tight">
          {totalSubmissions}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-[#FAFAF8]/50">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9C]" />
          <span>LeetCode & Codeforces</span>
        </div>
      </div>

      {/* Metric 2: Accuracy & Failures */}
      <div className="surface-panel-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-[#FAFAF8]/60 uppercase tracking-wider">
            Accuracy Rate
          </span>
          <div className="p-2 rounded-xl bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30">
            <Fire size={16} />
          </div>
        </div>
        <div className="text-3xl font-extrabold font-headline text-[#00FF9C] tracking-tight">
          {accuracyRate}%
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-[#FAFAF8]/50">
          <span className="text-[#FAFAF8]/80 font-bold">{failedSubmissions}</span> failed attempts mined
        </div>
      </div>

      {/* Metric 3: Active Blind Spots */}
      <div className="surface-panel-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-[#FAFAF8]/60 uppercase tracking-wider">
            Active Blind Spots
          </span>
          <div className="p-2 rounded-xl bg-[#1B1BFF]/10 text-[#1B1BFF] border border-[#1B1BFF]/30">
            <Sparkles size={16} />
          </div>
        </div>
        <div className="text-3xl font-extrabold font-headline text-[#FAFAF8] tracking-tight">
          {weaknessCount}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-[#FAFAF8]/50">
          <span>Recurrent algorithmic patterns</span>
        </div>
      </div>

      {/* Metric 4: Spaced Repetition Due */}
      <div className="surface-panel-hover rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-[#FAFAF8]/60 uppercase tracking-wider">
            SM-2 Queue Due
          </span>
          <div className="p-2 rounded-xl bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30">
            <Calendar size={16} />
          </div>
        </div>
        <div className="text-3xl font-extrabold font-headline text-[#FAFAF8] tracking-tight">
          {dueTodayCount} <span className="text-sm font-normal text-[#FAFAF8]/50 font-sans">items</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs font-mono text-[#00FF9C]">
          <span>Scheduled for today</span>
        </div>
      </div>
    </div>
  );
};
