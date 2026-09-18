"use client";

import React, { useState } from "react";
import { Platform } from "@/schemas/submission.schema";
import { Cross, Send, Command, Check, CircleAlert } from "akar-icons";

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
          userId: "pragatighosh25",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="card-candle-glow bg-[#121212] w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-white">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2">
            <Command size={16} className="text-[#E4007C]" />
            <h2 className="text-base font-bold font-mono text-white">
              Test Live Ingestion & Normalization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Cross size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-mono text-white/70">Platform Engine:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlatform("leetcode")}
                className={`px-3.5 py-1 text-xs font-mono font-semibold rounded-full border transition-all ${
                  platform === "leetcode"
                    ? "bg-[#E4007C] text-white border-[#E4007C]"
                    : "bg-[#141414] text-white/60 border-white/10"
                }`}
              >
                LeetCode
              </button>
              <button
                type="button"
                onClick={() => setPlatform("codeforces")}
                className={`px-3.5 py-1 text-xs font-mono font-semibold rounded-full border transition-all ${
                  platform === "codeforces"
                    ? "bg-[#E4007C] text-white border-[#E4007C]"
                    : "bg-[#141414] text-white/60 border-white/10"
                }`}
              >
                Codeforces
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/70 mb-1.5">
              Raw Platform JSON Payload:
            </label>
            <textarea
              rows={8}
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-[#E4007C] leading-relaxed"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                message.isError
                  ? "bg-rose-950/50 text-rose-300 border border-rose-800/50"
                  : "bg-[#00FF9C]/10 text-[#00FF9C] border border-[#00FF9C]/30"
              }`}
            >
              {message.isError ? (
                <CircleAlert size={14} className="text-rose-400 shrink-0" />
              ) : (
                <Check size={14} className="text-[#00FF9C] shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono rounded-full text-white/60 hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleIngest}
              disabled={loading}
              className="btn-weevolve-primary py-2 px-4 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={14} />
              <span>{loading ? "Normalizing..." : "Normalize & Ingest"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
