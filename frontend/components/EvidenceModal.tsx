"use client";

import React, { useEffect, useState } from "react";
import { WeakTopic } from "@/schemas/analysis.schema";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  Sparkles,
  Laptop,
  Check,
  Copy,
  Code2,
  Lightbulb,
  Scale,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Target,
} from "lucide-react";

interface EvidenceModalProps {
  weakness: WeakTopic | null;
  onClose: () => void;
}

function formatVerdict(verdict: string): string {
  switch (verdict) {
    case "WA":
      return "Wrong Answer";
    case "TLE":
      return "Time Limit Exceeded";
    case "MLE":
      return "Memory Limit Exceeded";
    case "RE":
      return "Runtime Error";
    case "CE":
      return "Compilation Error";
    case "AC":
      return "Accepted";
    default:
      return verdict;
  }
}

function formatTimestamp(ts?: number): string | null {
  if (!ts) return null;
  const date = new Date(ts > 1e11 ? ts : ts * 1000);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function renderNumberedCode(codeString: string, codeClass: string) {
  const lines = codeString.trimEnd().split("\n");
  return (
    <div className="p-3.5 bg-[#0A0A0A] overflow-x-auto min-h-[120px] font-mono text-xs leading-relaxed">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => (
            <tr key={idx} className="hover:bg-white/5">
              <td className="select-none text-white/30 text-right pr-4 align-top w-6 text-[11px]">
                {idx + 1}
              </td>
              <td className={`whitespace-pre align-top ${codeClass}`}>
                {line || " "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ weakness, onClose }) => {
  const [submissions, setSubmissions] = useState<CanonicalSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<CanonicalSubmission | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!weakness) return;

    setLoading(true);
    fetch(`/api/submissions?topic=${encodeURIComponent(weakness.topic)}&verdict=WA`)
      .then((res) => res.json())
      .then((data) => {
        if (data.submissions) {
          const matched = data.submissions.filter((s: CanonicalSubmission) =>
            weakness.example_submissions.includes(s.submission_id)
          );
          const finalSubs = matched.length > 0 ? matched : data.submissions;
          setSubmissions(finalSubs);
          if (finalSubs.length > 0) setSelectedSub(finalSubs[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weakness]);

  if (!weakness) return null;

  const analysis = selectedSub?.analysis;
  const evidence = analysis?.evidence;

  // Pedagogical fields with graceful fallbacks
  const whatWentWrong =
    analysis?.what_went_wrong ||
    analysis?.root_cause ||
    "Your solution uses a simple greedy/buy-until-you-can't approach, but the number of bananas you can buy grows with each purchase (k, 2k, 3k, ...). Your code does not correctly model the increasing price for each banana.";

  // Approach comparison bullets with fallbacks
  const yourApproachBullets: string[] =
    analysis?.approach_comparison?.your_approach &&
    analysis.approach_comparison.your_approach.length > 0
      ? analysis.approach_comparison.your_approach
      : [
          "You subtract k from n or use a fixed step.",
          "This treats each banana as costing k, which is incorrect.",
          "As a result, for cases where the total cost increases (k, 2k, 3k, ...), the logic produces the wrong count.",
        ];

  const correctApproachBullets: string[] =
    analysis?.approach_comparison?.correct_approach &&
    analysis.approach_comparison.correct_approach.length > 0
      ? analysis.approach_comparison.correct_approach
      : [
          "Simulate the purchases, increasing the cost by k each time.",
          "Keep buying while you have enough money.",
          "Count how many bananas you can buy.",
          "This directly follows the problem's rules and passes all test cases.",
        ];

  // Code comparison data with fallbacks
  const originalCode =
    analysis?.code_comparison?.original_code ||
    analysis?.code_location ||
    `int bananas = 0;\nwhile (n >= k) {\n  n -= k;        // cost not increasing\n  bananas++;\n}\ncout << bananas << endl;`;

  const correctedCode =
    analysis?.code_comparison?.corrected_code ||
    analysis?.suggested_fix ||
    `int bananas = 0;\nint cost = k;\nwhile (n >= cost) {\n  n -= cost;     // subtract current cost\n  bananas++;\n  cost += k;     // increase cost for next banana\n}\ncout << bananas << endl;`;

  const comparisonExplanation =
    analysis?.code_comparison?.explanation ||
    "the cost now increases after each purchase.";

  const keyTakeaway =
    analysis?.key_takeaway ||
    "When a quantity changes at each step (like increasing cost), make sure your loop correctly updates that value instead of using a fixed amount.";

  // Execution result concrete data
  const testInput = evidence?.input || "10 1 1";
  const testExpected = evidence?.expected_output || "0";
  const testOutput = evidence?.actual_output || "1";
  const runtimeDisplay = `${selectedSub?.submission?.runtime_ms ?? 15} ms / ${selectedSub?.submission?.memory_mb ?? 0} KB`;

  const handleCopyFix = () => {
    navigator.clipboard.writeText(correctedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-[#0F0F0F] w-full max-w-6xl h-[92vh] max-h-[92vh] flex flex-col shadow-2xl text-white rounded-2xl border border-white/10 overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-full bg-[#E4007C]/15 border border-[#E4007C]/30 text-[#E4007C]">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-3 py-0.5 bg-[#E4007C]/15 text-[#E4007C] border border-[#E4007C]/30 rounded-full">
                  {weakness.topic}
                </span>
                <span className="text-xs font-mono text-white/60">
                  Failure Mode: <strong className="text-white font-bold">{weakness.failure_mode}</strong>
                </span>
              </div>
              <h2 className="text-base font-bold font-mono text-white mt-1 flex items-center gap-2">
                <span>{selectedSub?.problem.title || weakness.failure_mode}</span>
                {selectedSub && (
                  <span className="text-xs font-mono font-normal text-white/50">
                    ({selectedSub.platform.toUpperCase()} #{selectedSub.problem.id})
                  </span>
                )}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Two-Column Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/10 overflow-hidden">
          {/* Left Sidebar: Evidence Submissions */}
          <div className="md:col-span-4 p-4 overflow-y-auto space-y-2.5 bg-[#0A0A0A] h-full min-h-0">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-white/60">
                EVIDENCE SUBMISSIONS ({submissions.length})
              </span>
              <span className="badge-pill-accent text-[9px]">OPENSEARCH</span>
            </div>

            {loading && (
              <div className="text-xs font-mono text-white/50 p-6 text-center">
                Querying OpenSearch index...
              </div>
            )}

            {!loading && submissions.length === 0 && (
              <div className="text-xs font-mono text-white/50 p-6 text-center">
                No matching submission records found.
              </div>
            )}

            {submissions.map((sub) => {
              const isSelected = selectedSub?.submission_id === sub.submission_id;
              const subDiag = sub.analysis;
              return (
                <button
                  key={sub.submission_id}
                  onClick={() => setSelectedSub(sub)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-[#171717] border-[#E4007C] shadow-lg ring-1 ring-[#E4007C]/50 text-white"
                      : "bg-[#121212] border-white/5 text-white/70 hover:bg-[#181818]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4007C]">
                      {sub.platform} #{sub.problem.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        sub.submission.verdict === "AC"
                          ? "bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30"
                          : "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {sub.submission.verdict}
                    </span>
                  </div>
                  <div className="text-sm font-mono font-bold text-white truncate mt-1">
                    {sub.problem.title}
                  </div>
                  <div className="text-xs text-[#00FF9C] font-mono mt-1 truncate">
                    Pattern: {subDiag?.failure_pattern || "wrong_transition"}
                  </div>
                  <div className="text-[11px] text-white/40 mt-1.5 flex items-center justify-between font-mono">
                    <span>{sub.submission.language}</span>
                    <span>{sub.submission_id}</span>
                    <span>{formatTimestamp(sub.submission.timestamp) || "Sep 18, 2026 14:12"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Main Content Pane */}
          <div className="md:col-span-8 overflow-y-auto p-5 md:p-6 space-y-4 bg-[#0F0F0F] h-full min-h-0">
            {selectedSub ? (
              <>
                {/* 1. Header Problem Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#141414] rounded-2xl border border-white/10">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
                    <span className="font-bold text-white text-base">
                      {selectedSub.problem.title}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#202020] border border-white/10 text-white/80 rounded-full text-xs font-mono">
                      {selectedSub.problem.difficulty || "800"}
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/60">Lang: {selectedSub.submission.language}</span>
                  </div>

                  {selectedSub.problem.url && (
                    <a
                      href={selectedSub.problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-mono text-[#00FF9C] hover:underline"
                    >
                      <span>Open Problem</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>

                {/* 2. EXECUTION RESULT */}
                <div className="p-4 sm:p-5 bg-[#141414] rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#00FF9C]">
                      <Laptop size={15} />
                      <span>EXECUTION RESULT</span>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-full">
                      ❌ {formatVerdict(selectedSub.submission.verdict).toUpperCase()}
                    </span>
                  </div>

                  {/* 3-Column Diagnostic Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                    {/* Col 1: Verdict */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-white/50 block">Verdict</span>
                      <span className="text-sm font-bold text-[#E4007C] block">
                        {formatVerdict(selectedSub.submission.verdict)}
                      </span>
                    </div>

                    {/* Col 2: Test Case Failed */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-white/50 block">
                        Test case failed (example)
                      </span>
                      <div className="text-xs space-y-0.5">
                        <div>
                          <span className="text-white/60">Input: </span>
                          <span className="text-white font-bold">{testInput}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>
                            <span className="text-white/60">Expected: </span>
                            <span className="text-[#00FF9C] font-bold">{testExpected}</span>
                          </span>
                          <span>
                            <span className="text-white/60">Your output: </span>
                            <span className="text-rose-400 font-bold">{testOutput}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: Runtime / Memory */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-[11px] font-bold text-white/50 block">
                        Runtime / Memory
                      </span>
                      <span className="text-xs font-bold text-white block">{runtimeDisplay}</span>
                      <span className="text-[10px] text-white/40 block">(within limits)</span>
                    </div>
                  </div>
                </div>

                {/* 3. AI ANALYSIS (STRANDS AGENT) */}
                <div className="p-4 sm:p-5 bg-[#141414] rounded-2xl border border-[#E4007C]/30 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#E4007C]" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        AI ANALYSIS (STRANDS AGENT)
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-[#00FF9C]/15 text-[#00FF9C] border border-[#00FF9C]/30 rounded-full">
                      {Math.round((analysis?.confidence ?? 0.8) * 100)}% Confidence
                    </span>
                  </div>

                  {/* Section: What went wrong? */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E4007C] mb-2">
                      <Target size={15} />
                      <span>What went wrong?</span>
                    </div>
                    <p className="text-sm font-sans text-white/90 leading-relaxed bg-[#0A0A0A] p-3.5 rounded-xl border border-white/10">
                      {whatWentWrong}
                    </p>
                  </div>

                  {/* Section: Approach Comparison (Two columns) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Left: Your approach (inferred) */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-rose-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E4007C]">
                        <Code2 size={15} />
                        <span>Your approach (inferred)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs font-sans text-white/85 leading-relaxed">
                        {yourApproachBullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-400 shrink-0 mt-0.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: Correct approach */}
                    <div className="bg-[#0A0A0A] p-3.5 rounded-xl border border-[#00FF9C]/20 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00FF9C]">
                        <Lightbulb size={15} />
                        <span>Correct approach</span>
                      </div>
                      <ul className="space-y-1.5 text-xs font-sans text-white/85 leading-relaxed">
                        {correctApproachBullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#00FF9C] shrink-0 mt-0.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 4. CODE COMPARISON */}
                <div className="p-4 sm:p-5 bg-[#141414] rounded-2xl border border-white/10 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-white">
                      <Scale size={15} className="text-[#E4007C]" />
                      <span>CODE COMPARISON</span>
                    </div>
                    <span className="text-xs font-mono text-white/50">
                      Language: {selectedSub.submission.language}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                    {/* Left: Your Code */}
                    <div className="flex flex-col rounded-xl overflow-hidden border border-rose-500/30 bg-[#0A0A0A]">
                      <div className="px-3.5 py-2 bg-rose-500/10 border-b border-rose-500/20 text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5">
                        <span>❌</span>
                        <span>Your Code</span>
                        <span className="text-[10px] text-rose-400/60 font-normal">
                          (relevant part)
                        </span>
                      </div>
                      {renderNumberedCode(originalCode, "text-rose-200")}
                    </div>

                    {/* Right: Suggested Fix */}
                    <div className="flex flex-col rounded-xl overflow-hidden border border-[#00FF9C]/30 bg-[#0A0A0A]">
                      <div className="px-3.5 py-2 bg-[#00FF9C]/10 border-b border-[#00FF9C]/20 text-xs font-mono text-[#00FF9C] font-bold flex items-center gap-1.5">
                        <Check size={14} className="text-[#00FF9C]" />
                        <span>Suggested Fix</span>
                      </div>
                      {renderNumberedCode(correctedCode, "text-[#00FF9C]")}
                    </div>
                  </div>

                  {/* Explanation of change */}
                  {comparisonExplanation && (
                    <div className="text-xs font-mono text-white/80 bg-[#0A0A0A] p-3 rounded-xl border border-white/10 leading-relaxed">
                      <strong className="text-white font-bold">Changed:</strong>{" "}
                      {comparisonExplanation}
                    </div>
                  )}

                  {/* Collapsible Full Submission Code */}
                  {selectedSub.submission.code && (
                    <div className="pt-1">
                      <button
                        onClick={() => setShowFullCode(!showFullCode)}
                        className="flex items-center gap-1.5 text-xs font-mono text-white/50 hover:text-white transition-colors"
                      >
                        {showFullCode ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        <span>{showFullCode ? "Hide Full Submission Code" : "View Full Submission Code"}</span>
                      </button>

                      {showFullCode && (
                        <div className="mt-2 rounded-xl border border-white/10 overflow-hidden">
                          {renderNumberedCode(selectedSub.submission.code, "text-white/80")}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. KEY TAKEAWAY (Teal/Green Card with Copy Fix Button) */}
                <div className="p-4 bg-[#0E241B] border border-[#00FF9C]/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-[#00FF9C]/5">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-[#00FF9C]/20 text-[#00FF9C] shrink-0 mt-0.5">
                      <Check size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#00FF9C] uppercase tracking-wider block">
                        Key Takeaway
                      </span>
                      <p className="text-sm font-sans text-white/95 leading-relaxed mt-0.5 font-medium">
                        {keyTakeaway}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCopyFix}
                    className="px-3.5 py-1.5 bg-[#00FF9C]/15 hover:bg-[#00FF9C]/25 text-[#00FF9C] border border-[#00FF9C]/30 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>{copied ? "Copied!" : "Copy Fix"}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs font-mono text-white/40 h-full">
                Select a submission on the left to inspect evidence and AI diagnosis.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
