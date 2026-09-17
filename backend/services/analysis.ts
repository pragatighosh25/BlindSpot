import { AnalysisOutput, AnalysisOutputSchema } from "@/schemas/analysis.schema";
import mockAnalysisData from "@/data/mock-analysis.json";

/**
 * Service function to retrieve AI analysis for a user.
 * Currently uses mock data; Person B can replace this implementation with the live Strands agent.
 */
export async function getAnalysisForUser(userId = "user_demo"): Promise<AnalysisOutput> {
  // Validate against schema to ensure strict type compliance
  const parsed = AnalysisOutputSchema.safeParse(mockAnalysisData);
  if (!parsed.success) {
    throw new Error(`Invalid analysis mock data: ${JSON.stringify(parsed.error.format())}`);
  }

  return {
    ...parsed.data,
    user_id: userId,
  };
}
