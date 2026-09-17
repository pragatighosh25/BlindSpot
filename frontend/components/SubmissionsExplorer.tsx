"use client";

import React, { useState } from "react";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { Search, Filter, Code2, ExternalLink, Database } from "lucide-react";

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
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>OpenSearch Submissions Explorer</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
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
              className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </form>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => onSelectPlatform(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          {/* Verdict Filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => onSelectVerdict(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-blue-500"
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
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Platform & ID</th>
                <th className="px-4 py-3">Problem Title</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Topic Tags</th>
                <th className="px-4 py-3">Language & Stats</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 italic">
                    No matching submissions found in OpenSearch.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const isAC = sub.submission.verdict === "AC";
                  return (
                    <tr
                      key={sub.submission_id}
                      className="hover:bg-slate-800/40 transition"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold uppercase text-blue-400">
                            {sub.platform}
                          </span>
                          <span className="text-slate-400">#{sub.problem.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {sub.submission_id}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium text-white max-w-xs truncate">
                        {sub.problem.title}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            isAC
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
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
                              className="px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700/60"
                            >
                              {tag}
                            </span>
                          ))}
                          {sub.problem.topic_tags.length > 3 && (
                            <span className="text-[10px] text-slate-500">
                              +{sub.problem.topic_tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                        <div>{sub.submission.language}</div>
                        {sub.submission.runtime_ms !== undefined && (
                          <div className="text-[10px] text-slate-500">
                            {sub.submission.runtime_ms}ms &bull; {sub.submission.memory_mb || "-"}MB
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectSubmission(sub)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
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
