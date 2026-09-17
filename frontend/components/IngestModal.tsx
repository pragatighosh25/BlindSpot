"use client";

import React, { useState } from "react";
import { Platform } from "@/schemas/submission.schema";
import { X, Send, Database, CheckCircle, AlertCircle } from "lucide-react";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngestSuccess: () => void;
}

export const IngestModal: React.FC<IngestModalProps> = ({
  isOpen,
  onClose,
  onIngestSuccess,
}) => {
  const [platform, setPlatform] = useState<Platform>("leetcode");
  const [rawPayload, setRawPayload] = useState(
    JSON.stringify(
      {
        id: "998877",
        questionId: "704",
        title: "Binary Search",
        titleSlug: "binary-search",
        lang: "cpp",
        statusDisplay: "Wrong Answer",
        runtime: "32 ms",
        memory: "27.5 MB",
        timestamp: Math.floor(Date.now() / 1000),
        code: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l < r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            else if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n};",
        difficulty: "Easy",
        topicTags: [{ name: "Binary Search" }, { name: "Array" }],
        errorResponse: "Input [-1,0,3,5,9,12], 9 -> Expected 4, got -1",
      },
      null,
      2
    )
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleIngest = async () => {
    setLoading(true);
    setMessage(null);
    try {
      let parsedRaw;
      try {
        parsedRaw = JSON.parse(rawPayload);
      } catch {
        throw new Error("Invalid JSON format in raw payload box.");
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          raw: parsedRaw,
          userId: "user_demo",
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Normalization/Ingestion failed");
      }

      setMessage({
        text: `Successfully normalized & saved submission ID: ${data.submission.submission_id}`,
        isError: false,
      });
      onIngestSuccess();
    } catch (err) {
      setMessage({ text: (err as Error).message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Test Live Ingestion & Normalization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Source Platform
            </label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setPlatform("leetcode")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition ${
                  platform === "leetcode"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                LeetCode (GraphQL / REST)
              </button>
              <button
                type="button"
                onClick={() => setPlatform("codeforces")}
                className={`px-4 py-2 text-xs font-semibold rounded-lg border transition ${
                  platform === "codeforces"
                    ? "bg-blue-600/20 text-blue-400 border-blue-500"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                }`}
              >
                Codeforces (user.status API)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Raw Payload JSON
            </label>
            <textarea
              rows={9}
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                message.isError
                  ? "bg-rose-950/50 text-rose-300 border border-rose-800/50"
                  : "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50"
              }`}
            >
              {message.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleIngest}
            disabled={loading}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Normalizing..." : "Normalize & Ingest to OpenSearch"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
