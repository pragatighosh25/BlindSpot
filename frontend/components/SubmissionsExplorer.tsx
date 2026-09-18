"use client";

import React, { useState } from "react";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { Search, Command, EyeOpen } from "akar-icons";

interface SubmissionsExplorerProps {
  submissions: CanonicalSubmission[];
  onSelectSubmission: (sub: CanonicalSubmission) => void;
  onSearchChange: (query: string) => void;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  selectedVerdict: string;
  onSelectVerdict: (verdict: string) => void;
}

export const SubmissionsExplorer: React.FC<SubmissionsExplorerProps> = ({
  submissions,
  onSelectSubmission,
  onSearchChange,
  selectedPlatform,
  onSelectPlatform,
  selectedVerdict,
  onSelectVerdict,
}) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold font-headline text-[#FAFAF8] flex items-center gap-2">
            <Command className="w-5 h-5 text-[#1B1BFF]" />
            <span>OpenSearch Submissions Explorer</span>
          </h2>
          <p className="text-xs font-sans text-[#FAFAF8]/60 mt-0.5">
            Normalized submission store across LeetCode & Codeforces platforms
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search code, title, tags..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                onSearchChange(e.target.value);
              }}
              className="w-48 sm:w-64 pl-8 pr-3 py-2 text-xs font-mono bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl text-[#FAFAF8] placeholder-[#FAFAF8]/40 focus:outline-none focus:border-[#1B1BFF] transition-colors"
            />
            <Search size={14} className="text-[#FAFAF8]/40 absolute left-2.5 top-2.5" />
          </form>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => onSelectPlatform(e.target.value)}
            className="text-xs font-mono bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl px-3 py-2 text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
          >
            <option value="">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          {/* Verdict Filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => onSelectVerdict(e.target.value)}
            className="text-xs font-mono bg-[#1A1A1A] border border-[#2C2C2C] rounded-xl px-3 py-2 text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] transition-colors"
          >
            <option value="">All Verdicts</option>
            <option value="AC">AC (Accepted)</option>
            <option value="WA">WA (Wrong Answer)</option>
            <option value="TLE">TLE (Time Limit)</option>
            <option value="MLE">MLE (Memory Limit)</option>
          </select>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="surface-panel rounded-2xl border border-[#2C2C2C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[#FAFAF8]/80">
            <thead className="bg-[#0D0D0D] text-[#FAFAF8]/50 uppercase font-semibold border-b border-[#2C2C2C]">
              <tr>
                <th className="px-4 py-3">Platform & ID</th>
                <th className="px-4 py-3">Problem Title</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Topic Tags</th>
                <th className="px-4 py-3">Language & Stats</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2C2C]/70">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#FAFAF8]/40 italic font-sans">
                    No matching submissions found in OpenSearch.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isAC = sub.submission.verdict === "AC";
                  return (
                    <tr
                      key={sub.submission_id}
                      className="hover:bg-[#222222] transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold uppercase text-[#1B1BFF]">
                            {sub.platform}
                          </span>
                          <span className="text-[#FAFAF8]/60">#{sub.problem.id}</span>
                        </div>
                        <span className="text-[10px] text-[#FAFAF8]/40 block">
                          {sub.submission_id}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold font-headline text-[#FAFAF8] max-w-xs truncate">
                        {sub.problem.title}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            isAC
                              ? "bg-[#00FF9C]/20 text-[#00FF9C] border border-[#00FF9C]/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {sub.submission.verdict}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {sub.problem.topic_tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 text-[10px] bg-[#0D0D0D] text-[#FAFAF8]/80 rounded border border-[#2C2C2C]"
                            >
                              {tag}
                            </span>
                          ))}
                          {sub.problem.topic_tags.length > 3 && (
                            <span className="text-[10px] text-[#FAFAF8]/40">
                              +{sub.problem.topic_tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-[#FAFAF8]/60 text-[11px]">
                        <div>{sub.submission.language}</div>
                        {sub.submission.runtime_ms !== undefined && (
                          <div className="text-[10px] text-[#FAFAF8]/40">
                            {sub.submission.runtime_ms}ms &bull; {sub.submission.memory_mb || "-"}MB
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectSubmission(sub)}
                          className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#1A1A1A] hover:bg-[#2C2C2C] text-[#FAFAF8] border border-[#2C2C2C] transition-all"
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
