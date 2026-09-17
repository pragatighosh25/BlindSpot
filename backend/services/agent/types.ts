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
 * Execution evidence extracted from compiler / judge / test runner
 */
export const SubmissionEvidenceSchema = z.object({
  input: z.string().optional(),
  actual_output: z.string().optional(),
  expected_output: z.string().optional(),
  error_message: z.string().optional(),
});
export type SubmissionEvidence = z.infer<typeof SubmissionEvidenceSchema>;

/**
 * Single submission deep algorithmic diagnosis result returned by analyzeSubmission()
 */
export const SubmissionDiagnosisSchema = z.object({
  submission_id: z.string(),
  topic: z.string(),
  verdict: z.string(),
  failure_pattern: FailurePatternSchema,
  failure_mode: z.string(),
  root_cause: z.string(),
  why_it_fails: z.string(),
  correct_concept: z.string(),
  suggested_fix: z.string(),
  code_location: z.string().optional(),
  explanation: z.string(),
  confidence: z.number().min(0).max(1),
  is_failure: z.boolean(),
  evidence: SubmissionEvidenceSchema.optional(),
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
