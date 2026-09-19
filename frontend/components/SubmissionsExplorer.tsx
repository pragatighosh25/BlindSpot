"use client";

import React, { useState } from "react";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { Search } from "akar-icons";

interface SubmissionsExplorerProps {
  submissions: CanonicalSubmission[];
  onSelectSubmission?: (sub: CanonicalSubmission) => void;
  onSearchChange: (query: string) => void;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  selectedVerdict: string;
  onSelectVerdict: (verdict: string) => void;
}

export const SubmissionsExplorer: React.FC<SubmissionsExplorerProps> = ({
  submissions,
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
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#E4007C] font-semibold">
            01 / CANONICAL STORE
          </div>
          <h2 className="text-xl font-bold font-mono text-white mt-1">
            OpenSearch Submissions Explorer
          </h2>
          <p className="text-xs font-sans text-white/60 mt-0.5">
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
              className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs font-mono bg-[#141414] border border-white/10 rounded-full text-white placeholder-white/40 focus:outline-none focus:border-[#E4007C] transition-colors"
            />
            <Search size={13} className="text-white/40 absolute left-3 top-2.5" />
          </form>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => onSelectPlatform(e.target.value)}
            className="text-xs font-mono bg-[#141414] border border-white/10 rounded-full px-3 py-1.5 text-white focus:outline-none focus:border-[#E4007C] transition-colors"
          >
            <option value="">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          {/* Verdict Filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => onSelectVerdict(e.target.value)}
            className="text-xs font-mono bg-[#141414] border border-white/10 rounded-full px-3 py-1.5 text-white focus:outline-none focus:border-[#E4007C] transition-colors"
          >
            <option value="">All Verdicts</option>
            <option value="AC">AC (Accepted)</option>
            <option value="WA">WA (Wrong Answer)</option>
            <option value="TLE">TLE (Time Limit)</option>
            <option value="MLE">MLE (Memory Limit)</option>
            <option value="RE">RE (Runtime Error)</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card-candle-glow overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-white/80">
            <thead className="bg-[#0A0A0A] text-white/50 uppercase font-semibold border-b border-white/10 text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Platform & ID</th>
                <th className="px-4 py-3">Problem Title</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Topic Tags</th>
                <th className="px-4 py-3">Language & Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-white/40 italic font-sans">
                    No matching submissions found in OpenSearch.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isAC = sub.submission.verdict === "AC";
                  return (
                    <tr
                      key={sub.submission_id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold uppercase text-[#E4007C]">
                            {sub.platform}
                          </span>
                          <span className="text-white/60">#{sub.problem.id}</span>
                        </div>
                        <span className="text-[10px] text-white/40 block">
                          {sub.submission_id}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-semibold font-mono text-white max-w-xs truncate">
                        {sub.problem.url ? (
                          <a
                            href={sub.problem.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#00FF9C] transition-colors"
                          >
                            {sub.problem.title}
                          </a>
                        ) : (
                          sub.problem.title
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            isAC
                              ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30"
                              : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
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
                              className="px-2 py-0.5 text-[10px] bg-[#0A0A0A] text-white/80 rounded-full border border-white/10"
                            >
                              {tag}
                            </span>
                          ))}
                          {sub.problem.topic_tags.length > 3 && (
                            <span className="text-[10px] text-white/40">
                              +{sub.problem.topic_tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-white/60 text-[11px]">
                        <div>{sub.submission.language}</div>
                        {sub.submission.runtime_ms !== undefined ? (
                          <div className="text-[10px] text-white/40">
                            {sub.submission.runtime_ms}ms &bull; {sub.submission.memory_mb ? sub.submission.memory_mb + "MB" : "N/A"}
                          </div>
                        ) : (
                          <div className="text-[10px] text-white/30">N/A</div>
                        )}
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
