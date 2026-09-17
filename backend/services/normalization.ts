import {
  CanonicalSubmission,
  CanonicalSubmissionSchema,
  Platform,
} from "@/schemas/submission.schema";
import {
  RawLeetCodeSubmission,
  normalizeLeetCodeSubmission,
} from "./ingestion/leetcode";
import {
  RawCodeforcesSubmission,
  normalizeCodeforcesSubmission,
} from "./ingestion/codeforces";

export { normalizeLeetCodeSubmission } from "./ingestion/leetcode";
export { normalizeCodeforcesSubmission } from "./ingestion/codeforces";

/**
 * Unified Normalization Gateway for any raw submission
 */
export function normalizeSubmission(
  platform: Platform,
  raw: unknown,
  userId = "default_user"
): CanonicalSubmission {
  let canonical: CanonicalSubmission;

  if (platform === "leetcode") {
    canonical = normalizeLeetCodeSubmission(raw as RawLeetCodeSubmission, userId);
  } else if (platform === "codeforces") {
    canonical = normalizeCodeforcesSubmission(raw as RawCodeforcesSubmission, userId);
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // Strictly validate against canonical schema
  return CanonicalSubmissionSchema.parse(canonical);
}

/**
 * Safe validation helper for submissions
 */
export function validateCanonicalSubmission(submission: unknown) {
  return CanonicalSubmissionSchema.safeParse(submission);
}
