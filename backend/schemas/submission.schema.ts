import { z } from "zod";

export const PlatformSchema = z.enum(["leetcode", "codeforces"]);
export type Platform = z.infer<typeof PlatformSchema>;

export const VerdictSchema = z.enum([
  "AC",
  "WA",
  "TLE",
  "MLE",
  "RE",
  "CE",
  "OTHER"
]);
export type Verdict = z.infer<typeof VerdictSchema>;

export const CanonicalProblemSchema = z.object({
  id: z.string().min(1, "Problem ID is required"),
  title: z.string().min(1, "Problem title is required"),
  difficulty: z.string().optional(),
  topic_tags: z.array(z.string()).default([]),
  url: z.string().url().optional(),
});
export type CanonicalProblem = z.infer<typeof CanonicalProblemSchema>;

export const CanonicalSubmissionDetailsSchema = z.object({
  language: z.string().min(1, "Language is required"),
  verdict: VerdictSchema,
  runtime_ms: z.number().nonnegative().optional(),
  memory_mb: z.number().nonnegative().optional(),
  timestamp: z.number().int(),
  code: z.string(),
  error_message: z.string().optional(),
});
export type CanonicalSubmissionDetails = z.infer<typeof CanonicalSubmissionDetailsSchema>;

export const CanonicalSubmissionSchema = z.object({
  submission_id: z.string().min(1, "Submission ID is required"),
  user_id: z.string().optional().default("default_user"),
  platform: PlatformSchema,
  problem: CanonicalProblemSchema,
  submission: CanonicalSubmissionDetailsSchema,
  raw_payload: z.record(z.unknown()).optional(),
});

export type CanonicalSubmission = z.infer<typeof CanonicalSubmissionSchema>;
