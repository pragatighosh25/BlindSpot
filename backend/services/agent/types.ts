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
 * Focused code comparison between submitted bug and suggested fix
 */
export const CodeComparisonSchema = z.object({
  original_code: z.string(),
  corrected_code: z.string(),
  explanation: z.string().optional(),
});
export type CodeComparison = z.infer<typeof CodeComparisonSchema>;

/**
 * Approach comparison bullets contrasting user's approach with the correct approach
 */
export const ApproachComparisonSchema = z.object({
  your_approach: z.array(z.string()).default([]),
  correct_approach: z.array(z.string()).default([]),
});
export type ApproachComparison = z.infer<typeof ApproachComparisonSchema>;

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
  // Enhanced human code review fields
  what_went_wrong: z.string().optional(),
  where_it_happens: z.string().optional(),
  why_it_fails_detail: z.string().optional(),
  correct_reasoning: z.string().optional(),
  approach_comparison: ApproachComparisonSchema.optional(),
  code_comparison: CodeComparisonSchema.optional(),
  key_takeaway: z.string().optional(),
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
