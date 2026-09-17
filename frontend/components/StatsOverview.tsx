import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Target, Layers } from "lucide-react";

interface StatsOverviewProps {
  totalCount: number;
  solvedCount: number;
  failureCount: number;
  weaknessCount: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalCount,
  solvedCount,
  failureCount,
  weaknessCount,
}) => {
  const solveRate = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;

  const cards = [
    {
      label: "Total Submissions",
      value: totalCount,
      subtext: "LeetCode & Codeforces combined",
      icon: Layers,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Accepted (AC)",
      value: solvedCount,
      subtext: `${solveRate}% solution accuracy`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Mistakes (WA / TLE / MLE)",
      value: failureCount,
      subtext: "Clustered for pattern analysis",
      icon: XCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      label: "Detected Blind Spots",
      value: weaknessCount,
      subtext: "High confidence failure modes",
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`glass-panel rounded-xl p-5 border ${card.border} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
