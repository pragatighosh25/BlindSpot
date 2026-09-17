import { AnalysisOutput } from "@/schemas/analysis.schema";
import { analyzeUserHistory, analyzeSubmission, getWeaknessProfile, getRecommendations } from "./agent";

/**
 * Service function to retrieve AI analysis for a user.
 * Dispatches to Person B's Agent analysis engine.
 */
export async function getAnalysisForUser(userId = "user_demo"): Promise<AnalysisOutput> {
  return analyzeUserHistory(userId);
}

export { analyzeSubmission, analyzeUserHistory, getWeaknessProfile, getRecommendations };
