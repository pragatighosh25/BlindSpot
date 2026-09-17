import { z } from "zod";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { AnalysisOutput, WeakTopic, RecommendedProblem } from "@/schemas/analysis.schema";

/**
 * Controlled vocabulary of algorithmic failure patterns
 */
export const FailurePatterns = [
  "boundary_condition_error",
  "off_by_one",
  "incorrect_base_case",
  "incorrect_state_definition",
  "wrong_transition",
  "incorrect_invariant",
  "wrong_greedy_choice",
  "missing_edge_case",
  "incorrect_initialization",
  "visited_state_error",
  "incorrect_complexity",
  "overflow",
  "implementation_error",
  "unknown",
] as const;

export const FailurePatternSchema = z.enum(FailurePatterns);
export type FailurePattern = z.infer<typeof FailurePatternSchema>;

/**
 * Single submission diagnosis result returned by analyzeSubmission()
 */
export const SubmissionDiagnosisSchema = z.object({
  submission_id: z.string(),
  topic: z.string(),
  verdict: z.string(),
  failure_pattern: FailurePatternSchema,
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  is_failure: z.boolean(),
});

export type SubmissionDiagnosis = z.infer<typeof SubmissionDiagnosisSchema>;

/**
 * Context provided to the agent during analysis
 */
export interface AgentContext {
  userId?: string;
  historicalMistakes?: CanonicalSubmission[];
}

export type { AnalysisOutput, WeakTopic, RecommendedProblem, CanonicalSubmission };
