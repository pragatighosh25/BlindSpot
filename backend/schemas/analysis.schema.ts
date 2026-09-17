import { z } from "zod";
import { PlatformSchema } from "./submission.schema";

export const WeakTopicSchema = z.object({
  topic: z.string().min(1, "Topic name is required"),
  failure_mode: z.string().min(1, "Specific recurring failure mode"),
  confidence: z.number().min(0).max(1),
  evidence_count: z.number().int().nonnegative(),
  example_submissions: z.array(z.string()),
  description: z.string().optional(),
});
export type WeakTopic = z.infer<typeof WeakTopicSchema>;

export const RecommendedProblemSchema = z.object({
  platform: PlatformSchema,
  problem_id: z.string().min(1, "Problem identifier"),
  title: z.string().optional(),
  difficulty: z.string().optional(),
  topic: z.string().optional(),
  reason: z.string().min(1, "Pedagogical rationale"),
  url: z.string().optional(),
});
export type RecommendedProblem = z.infer<typeof RecommendedProblemSchema>;

export const AnalysisOutputSchema = z.object({
  user_id: z.string().optional().default("default_user"),
  analyzed_at: z.number().int().optional().default(() => Date.now()),
  summary: z.string().optional(),
  weak_topics: z.array(WeakTopicSchema),
  recommended_problems: z.array(RecommendedProblemSchema),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;
