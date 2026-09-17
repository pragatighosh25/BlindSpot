import { z } from "zod";

/**
 * Supported platforms in BlindSpot
 */
export const PlatformSchema = z.enum(["leetcode", "codeforces"]);
export type Platform = z.infer<typeof PlatformSchema>;

/**
 * Standardized verdicts across platforms
 */
export const VerdictSchema = z.enum([
  "AC",   // Accepted / OK
  "WA",   // Wrong Answer
  "TLE",  // Time Limit Exceeded
  "MLE",  // Memory Limit Exceeded
  "RE",   // Runtime Error
  "CE",   // Compilation Error
  "OTHER" // Other/Unknown status
]);
export type Verdict = z.infer<typeof VerdictSchema>;

/**
 * Problem metadata within a canonical submission
 */
export const CanonicalProblemSchema = z.object({
  id: z.string().min(1, "Problem ID is required"),
  title: z.string().min(1, "Problem title is required"),
  difficulty: z.string().optional(), // e.g. "Easy" | "Medium" | "Hard" | "800" | "1400"
  topic_tags: z.array(z.string()).default([]), // e.g. ["Binary Search", "Array"]
  url: z.string().url().optional(),
});
export type CanonicalProblem = z.infer<typeof CanonicalProblemSchema>;

/**
 * Submission run details
 */
export const CanonicalSubmissionDetailsSchema = z.object({
  language: z.string().min(1, "Language is required"),
  verdict: VerdictSchema,
  runtime_ms: z.number().nonnegative().optional(),
  memory_mb: z.number().nonnegative().optional(),
  timestamp: z.number().int().describe("Unix epoch timestamp in seconds or milliseconds"),
  code: z.string().describe("Submitted source code"),
  error_message: z.string().optional(),
});
export type CanonicalSubmissionDetails = z.infer<typeof CanonicalSubmissionDetailsSchema>;

/**
 * Canonical Submission Schema
 * Strict contract shared across ingestion, normalization, OpenSearch, and AI analysis.
 */
export const CanonicalSubmissionSchema = z.object({
  submission_id: z.string().min(1, "Submission ID is required"),
  user_id: z.string().optional().default("default_user"),
  platform: PlatformSchema,
  problem: CanonicalProblemSchema,
  submission: CanonicalSubmissionDetailsSchema,
  raw_payload: z.record(z.unknown()).optional().describe("Optional preservation of raw API payload for debugging"),
});

export type CanonicalSubmission = z.infer<typeof CanonicalSubmissionSchema>;
