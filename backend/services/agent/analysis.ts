import { CanonicalSubmission, CanonicalSubmissionSchema } from "@/schemas/submission.schema";
import {
  AnalysisOutput,
  AnalysisOutputSchema,
  WeakTopic,
  RecommendedProblem,
} from "@/schemas/analysis.schema";
import { SubmissionDiagnosis, SubmissionDiagnosisSchema } from "./types";
import {
  analyzeSingleSubmissionWithStrands,
  runStrandsUserAnalysis,
} from "./strandsAgent";

/**
 * Single submission deep algorithmic diagnosis with Strands agent
 */
export async function analyzeSubmission(
  submission: CanonicalSubmission,
  userId = "default_user"
): Promise<SubmissionDiagnosis> {
  const validatedSub = CanonicalSubmissionSchema.parse(submission);
  const diagnosis = await analyzeSingleSubmissionWithStrands(validatedSub, userId);
  return SubmissionDiagnosisSchema.parse(diagnosis);
}

/**
 * Strands Agent User History Analysis: Analyzes real user submission history,
 * correlates historical context from OpenSearch, determines recurring failure patterns,
 * generates targeted pedagogical recommendations, and persists to DynamoDB.
 */
export async function analyzeUserHistory(userId = "default_user"): Promise<AnalysisOutput> {
  const analysis = await runStrandsUserAnalysis(userId);
  return AnalysisOutputSchema.parse(analysis);
}

/**
 * Convenience helper to get weak topics
 */
export async function getWeaknessProfile(userId = "default_user"): Promise<WeakTopic[]> {
  const analysis = await analyzeUserHistory(userId);
  return analysis.weak_topics;
}

/**
 * Convenience helper to get recommendations
 */
export async function getRecommendations(userId = "default_user"): Promise<RecommendedProblem[]> {
  const analysis = await analyzeUserHistory(userId);
  return analysis.recommended_problems;
}
