import { CanonicalSubmission, Verdict } from "@/schemas/submission.schema";

/**
 * Raw LeetCode Submission structure (matching LeetCode GraphQL / REST response schema)
 */
export interface RawLeetCodeSubmission {
  id: string | number;
  questionId?: string | number;
  title?: string;
  titleSlug?: string;
  lang?: string;
  statusDisplay?: string; // e.g. "Accepted", "Wrong Answer", "Time Limit Exceeded", "Memory Limit Exceeded", "Runtime Error"
  runtime?: string | number; // e.g. "32 ms" or 32
  memory?: string | number;  // e.g. "27.5 MB" or 27.5
  timestamp: string | number; // epoch seconds or ms
  code?: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  topicTags?: Array<{ name: string; slug?: string }> | string[];
  userId?: string;
  errorResponse?: string;
}

/**
 * Map LeetCode status string to Canonical Verdict
 */
export function mapLeetCodeVerdict(statusDisplay?: string): Verdict {
  if (!statusDisplay) return "OTHER";
  const status = statusDisplay.toLowerCase().trim();
  if (status.includes("accepted")) return "AC";
  if (status.includes("wrong answer")) return "WA";
  if (status.includes("time limit")) return "TLE";
  if (status.includes("memory limit")) return "MLE";
  if (status.includes("runtime error")) return "RE";
  if (status.includes("compile") || status.includes("compilation")) return "CE";
  return "OTHER";
}

/**
 * Parse runtime string (e.g., "32 ms") into number ms
 */
function parseRuntimeMs(runtime?: string | number): number | undefined {
  if (typeof runtime === "number") return runtime;
  if (!runtime) return undefined;
  const match = runtime.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : undefined;
}

/**
 * Parse memory string (e.g., "27.5 MB" or "28000 KB") into number MB
 */
function parseMemoryMb(memory?: string | number): number | undefined {
  if (typeof memory === "number") return memory;
  if (!memory) return undefined;
  const val = parseFloat(memory);
  if (isNaN(val)) return undefined;
  if (memory.toLowerCase().includes("kb")) {
    return parseFloat((val / 1024).toFixed(2));
  }
  return val;
}

/**
 * Normalize raw LeetCode submission into CanonicalSubmission
 */
export function normalizeLeetCodeSubmission(
  raw: RawLeetCodeSubmission,
  userId = "default_user"
): CanonicalSubmission {
  const submissionId = `lc_${raw.id}`;
  const problemId = String(raw.questionId || raw.titleSlug || raw.id);
  const problemTitle = raw.title || raw.titleSlug || `Problem ${problemId}`;

  const topicTags: string[] = [];
  if (Array.isArray(raw.topicTags)) {
    for (const tag of raw.topicTags) {
      if (typeof tag === "string") {
        topicTags.push(tag);
      } else if (tag && typeof tag.name === "string") {
        topicTags.push(tag.name);
      }
    }
  }

  const rawTimestamp = typeof raw.timestamp === "string" ? parseInt(raw.timestamp, 10) : raw.timestamp;
  const timestamp = rawTimestamp > 1e11 ? Math.floor(rawTimestamp / 1000) : rawTimestamp;

  return {
    submission_id: submissionId,
    user_id: raw.userId || userId,
    platform: "leetcode",
    problem: {
      id: problemId,
      title: problemTitle,
      difficulty: raw.difficulty || "Medium",
      topic_tags: topicTags,
      url: raw.titleSlug ? `https://leetcode.com/problems/${raw.titleSlug}/` : undefined,
    },
    submission: {
      language: raw.lang || "unknown",
      verdict: mapLeetCodeVerdict(raw.statusDisplay),
      runtime_ms: parseRuntimeMs(raw.runtime),
      memory_mb: parseMemoryMb(raw.memory),
      timestamp,
      code: raw.code || "// No code available",
      error_message: raw.errorResponse,
    },
  };
}
