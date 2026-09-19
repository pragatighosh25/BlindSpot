import React from "react";

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
    <div className="relative border-y border-white/10 bg-[#0D0D0D]">
      <div className="crosshair-corner -top-[4px] -left-[4px]" />
      <div className="crosshair-corner -top-[4px] -right-[4px]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
        {/* Metric 1: Total Processed */}
        <div className="p-6 space-y-2 group hover:bg-[#121212] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              01 / Submissions Ingested
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
            {totalSubmissions}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/50 pt-1">
            
            <span>LeetCode + Codeforces Live</span>
          </div>
        </div>

        {/* Metric 2: Accuracy & Failures */}
        <div className="p-6 space-y-2 group hover:bg-[#121212] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              02 / Accuracy &amp; Failures
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#00FF9C] tracking-tight">
            {accuracyRate}%
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/50 pt-1">
            <span className="text-white/80 font-bold">{failedSubmissions}</span> failed attempts mined
          </div>
        </div>

        {/* Metric 3: Active Blind Spots */}
        <div className="p-6 space-y-2 group hover:bg-[#121212] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              03 / Active Blind Spots
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-[#E4007C] tracking-tight">
            {weaknessCount}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-white/50 pt-1">
            <span>Recurring invariant patterns</span>
          </div>
        </div>

        {/* Metric 4: Spaced Repetition Due */}
        <div className="p-6 space-y-2 group hover:bg-[#121212] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              04 / SM-2 Queue Due
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
            {dueTodayCount} <span className="text-xs font-mono font-normal text-white/40">problems</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#00FF9C] pt-1">
            <span>Scheduled for today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
