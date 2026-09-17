import { CanonicalSubmission } from "@/schemas/submission.schema";
import { SubmissionDiagnosis, SubmissionDiagnosisSchema, FailurePattern } from "./types";
import { SYSTEM_PROMPT, buildSingleSubmissionPrompt } from "./prompts";

/**
 * Heuristic/Pattern Rule Engine for standalone local execution before Strands agent connection
 */
export function diagnoseSubmissionPattern(sub: CanonicalSubmission): SubmissionDiagnosis {
  const isFailure = sub.submission.verdict !== "AC";
  const primaryTopic = sub.problem.topic_tags[0] || "General";
  const code = sub.submission.code.toLowerCase();
  const verdict = sub.submission.verdict;

  if (!isFailure) {
    return {
      submission_id: sub.submission_id,
      topic: primaryTopic,
      verdict: "AC",
      failure_pattern: "unknown",
      explanation: "Submission passed all test cases successfully.",
      confidence: 1.0,
      is_failure: false,
    };
  }

  let pattern: FailurePattern = "unknown";
  let explanation = `Submission failed with verdict ${verdict}.`;
  let confidence = 0.6;

  // Binary Search heuristics
  if (
    sub.problem.topic_tags.some((t) => t.toLowerCase().includes("binary search")) ||
    code.includes("while (left") ||
    code.includes("while(l < r") ||
    code.includes("while (l < r") ||
    code.includes("while(left < right")
  ) {
    if (code.includes("left < right") || code.includes("l < r")) {
      pattern = "boundary_condition_error";
      explanation = "Terminated with left < right instead of left <= right or improper boundary update on single-element search.";
      confidence = 0.88;
    } else if (code.includes("mid + 1") && !code.includes("mid - 1")) {
      pattern = "off_by_one";
      explanation = "Asymmetric pointer convergence in binary search causing potential infinite loop or skipped target.";
      confidence = 0.82;
    } else {
      pattern = "boundary_condition_error";
      explanation = "Binary search boundary condition error causing wrong answer on edge cases.";
      confidence = 0.75;
    }
  }
  // Dynamic Programming heuristics
  else if (
    sub.problem.topic_tags.some((t) => t.toLowerCase().includes("dynamic programming")) ||
    code.includes("dp[") ||
    code.includes("memo")
  ) {
    if (verdict === "TLE" || (!code.includes("memo") && code.includes("return "))) {
      pattern = "incorrect_state_definition";
      explanation = "Missing memoization or exponential recursion tree without overlapping subproblem caching.";
      confidence = 0.85;
    } else if (code.includes("dp[0]") || code.includes("dp[i - 1]")) {
      pattern = "incorrect_base_case";
      explanation = "Off-by-one base case initialization or unhandled 0-length prefix state.";
      confidence = 0.8;
    } else {
      pattern = "wrong_transition";
      explanation = "Optimal substructure violation or wrong recurrence relation in DP transition.";
      confidence = 0.78;
    }
  }
  // Graph / BFS / DFS heuristics
  else if (
    sub.problem.topic_tags.some((t) => t.toLowerCase().includes("graph")) ||
    code.includes("visited") ||
    code.includes("queue") ||
    code.includes("bfs") ||
    code.includes("dfs")
  ) {
    if (code.includes("queue") && code.includes("visited")) {
      pattern = "visited_state_error";
      explanation = "Marking visited states post-pop rather than on queue push, causing duplicate vertex expansions.";
      confidence = 0.84;
    } else if (code.includes("dfs") && !code.includes("visited")) {
      pattern = "visited_state_error";
      explanation = "Missing visited array leading to cycle traversal and stack overflow / TLE.";
      confidence = 0.82;
    }
  }
  // Complexity / TLE
  else if (verdict === "TLE") {
    pattern = "incorrect_complexity";
    explanation = "Algorithm time complexity exceeds constraints (e.g. O(N^2) instead of O(N log N)).";
    confidence = 0.85;
  }
  // Runtime Error
  else if (verdict === "RE") {
    if (code.includes("1e9") || code.includes("int ") || code.includes("long")) {
      pattern = "overflow";
      explanation = "Integer arithmetic overflow or out-of-bounds array index access.";
      confidence = 0.75;
    } else {
      pattern = "implementation_error";
      explanation = "Unhandled null dereference, index out of bounds, or division by zero.";
      confidence = 0.7;
    }
  }

  const result: SubmissionDiagnosis = {
    submission_id: sub.submission_id,
    topic: primaryTopic,
    verdict,
    failure_pattern: pattern,
    explanation,
    confidence,
    is_failure: true,
  };

  return SubmissionDiagnosisSchema.parse(result);
}

/**
 * Strands Agent Runner Interface
 * In Phase 4, this will invoke the local Strands agent with tools and prompt.
 */
export async function runStrandsAnalysisAgent(
  submission: CanonicalSubmission
): Promise<SubmissionDiagnosis> {
  // Phase 2 implementation uses the diagnostic pattern engine.
  // Strands local model execution will be plugged in Phase 4.
  return diagnoseSubmissionPattern(submission);
}
