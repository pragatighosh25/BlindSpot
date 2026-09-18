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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-[#FAFAF8]">
        <div className="px-6 py-4 border-b border-[#2C2C2C] flex items-center justify-between bg-[#0D0D0D]">
          <div className="flex items-center gap-2">
            <Command size={18} className="text-[#1B1BFF]" />
            <h2 className="text-base font-bold font-headline text-[#FAFAF8]">
              Test Live Ingestion & Normalization
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#2C2C2C] transition-colors"
          >
            <Cross size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-[#FAFAF8]/70 uppercase tracking-wider mb-2">
              Select Source Platform
            </label>
            <div className="flex gap-3 font-mono">
              <button
                type="button"
                onClick={() => setPlatform("leetcode")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  platform === "leetcode"
                    ? "bg-[#1B1BFF]/20 text-[#1B1BFF] border-[#1B1BFF]"
                    : "bg-[#0D0D0D] text-[#FAFAF8]/60 border-[#2C2C2C] hover:bg-[#222222]"
                }`}
              >
                LeetCode (GraphQL / REST)
              </button>
              <button
                type="button"
                onClick={() => setPlatform("codeforces")}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  platform === "codeforces"
                    ? "bg-[#1B1BFF]/20 text-[#1B1BFF] border-[#1B1BFF]"
                    : "bg-[#0D0D0D] text-[#FAFAF8]/60 border-[#2C2C2C] hover:bg-[#222222]"
                }`}
              >
                Codeforces (user.status API)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#FAFAF8]/70 uppercase tracking-wider mb-2">
              Raw Payload JSON
            </label>
            <textarea
              rows={8}
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-[#0D0D0D] border border-[#2C2C2C] rounded-xl text-[#FAFAF8] focus:outline-none focus:border-[#1B1BFF] leading-relaxed"
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
        </div>

        <div className="px-6 py-4 bg-[#0D0D0D] border-t border-[#2C2C2C] flex items-center justify-end gap-3 font-mono">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-xl text-[#FAFAF8]/60 hover:text-[#FAFAF8] hover:bg-[#2C2C2C] transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleIngest}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-headline font-bold rounded-xl bg-[#00FF9C] text-[#0D0D0D] hover:bg-[#26ffaa] shadow-md shadow-[#00FF9C]/20 transition-all disabled:opacity-50"
          >
            <Send size={14} />
            <span>{loading ? "Normalizing..." : "Normalize & Ingest to OpenSearch"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
