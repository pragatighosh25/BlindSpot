import { AnalysisOutput } from "@/schemas/analysis.schema";
import { analyzeUserHistory, analyzeSubmission, getWeaknessProfile, getRecommendations } from "./agent";
import { DEFAULT_USER_CONFIG } from "./ingestion/config";
import { getLatestAnalysisFromDynamo } from "./storage/dynamodb";

/**
 * Service function to retrieve AI analysis for a user.
 * Returns persisted analysis from DynamoDB on GET queries unless forceFresh is explicitly requested.
 */
export async function getAnalysisForUser(
  userId = DEFAULT_USER_CONFIG.userId,
  forceFresh = false
): Promise<AnalysisOutput> {
  if (!forceFresh) {
    const existing = await getLatestAnalysisFromDynamo(userId);
    if (existing && existing.weak_topics) {
      return existing;
    }
  }
  return analyzeUserHistory(userId);
}

export { analyzeSubmission, analyzeUserHistory, getWeaknessProfile, getRecommendations };
