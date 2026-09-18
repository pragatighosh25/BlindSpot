import { CanonicalSubmission, Verdict } from "@/schemas/submission.schema";

/**
 * Raw Codeforces Submission structure (matching Codeforces official user.status API)
 */
export interface RawCodeforcesSubmission {
  id: number | string;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds?: number;
  problem: {
    contestId?: number;
    index: string; // e.g. "A", "C", "D1"
    name: string;
    type?: string;
    rating?: number;
    tags?: string[];
  };
  author?: {
    contestId?: number;
    members?: Array<{ handle: string }>;
  };
  programmingLanguage: string;
  verdict?: string; // e.g. "OK", "WRONG_ANSWER", "TIME_LIMIT_EXCEEDED", "MEMORY_LIMIT_EXCEEDED", "RUNTIME_ERROR", "COMPILATION_ERROR"
  passedTestCount?: number;
  timeConsumedMillis?: number;
  memoryConsumedBytes?: number;
  sourceCode?: string; // from scraper/user submission export
  userId?: string;
}

/**
 * Map Codeforces verdict string to Canonical Verdict
 */
export function mapCodeforcesVerdict(verdict?: string): Verdict {
  if (!verdict) return "OTHER";
  const v = verdict.toUpperCase().trim();
  if (v === "OK") return "AC";
  if (v.includes("WRONG_ANSWER") || v.includes("WA")) return "WA";
  if (v.includes("TIME_LIMIT_EXCEEDED") || v.includes("TLE")) return "TLE";
  if (v.includes("MEMORY_LIMIT_EXCEEDED") || v.includes("MLE")) return "MLE";
  if (v.includes("RUNTIME_ERROR") || v.includes("RE")) return "RE";
  if (v.includes("COMPILATION_ERROR") || v.includes("CE")) return "CE";
  return "OTHER";
}

/**
 * Normalize raw Codeforces submission into CanonicalSubmission
 */
export function normalizeCodeforcesSubmission(
  raw: RawCodeforcesSubmission,
  userId = "default_user"
): CanonicalSubmission {
  const submissionId = `cf_${raw.id}`;
  const contestId = raw.problem.contestId || raw.contestId || 0;
  const problemIndex = raw.problem.index || "A";
  const problemId = contestId > 0 ? `${contestId}${problemIndex}` : problemIndex;
  const problemTitle = raw.problem.name || `Problem ${problemId}`;

  const topicTags = Array.isArray(raw.problem.tags)
    ? raw.problem.tags.map(t => {
        // Capitalize words for clean presentation
        return t
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      })
    : [];

  const memoryMb = raw.memoryConsumedBytes
    ? parseFloat((raw.memoryConsumedBytes / (1024 * 1024)).toFixed(2))
    : undefined;

  const userHandle = userId || raw.userId || raw.author?.members?.[0]?.handle || "default_user";

  const url = contestId > 0
    ? `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`
    : undefined;

  return {
    submission_id: submissionId,
    user_id: userHandle,
    platform: "codeforces",
    problem: {
      id: problemId,
      title: problemTitle,
      difficulty: raw.problem.rating ? String(raw.problem.rating) : undefined,
      topic_tags: topicTags,
      url,
    },
    submission: {
      language: raw.programmingLanguage || "unknown",
      verdict: mapCodeforcesVerdict(raw.verdict),
      runtime_ms: raw.timeConsumedMillis,
      memory_mb: memoryMb,
      timestamp: raw.creationTimeSeconds,
      code: raw.sourceCode || "// No code available",
    },
  };
}
