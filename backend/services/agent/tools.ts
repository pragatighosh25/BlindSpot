import {
  searchSimilarMistakes as searchSimilarMistakesFromStore,
  getUserSubmissions as getUserSubmissionsFromStore,
  searchSubmissions as searchSubmissionsFromStore,
  OpenSearchSubmissionDocument,
} from "@/services/opensearch";
import { CanonicalSubmission } from "@/schemas/submission.schema";

/**
 * Agent Tool Interface for historical context retrieval
 * Integrates directly with Person A's OpenSearch store
 */
export async function searchPastMistakes(
  topic: string,
  verdict = "WA",
  userId = "user_demo"
): Promise<CanonicalSubmission[]> {
  const results = await searchSimilarMistakesFromStore(topic, verdict, userId);
  return results.map(stripAnalysisMetadata);
}

export async function getUserHistory(
  userId = "user_demo"
): Promise<CanonicalSubmission[]> {
  const results = await getUserSubmissionsFromStore(userId);
  return results.map(stripAnalysisMetadata);
}

export async function searchSimilarMistakes(
  query: string,
  userId = "user_demo",
  limit = 10
): Promise<CanonicalSubmission[]> {
  const results = await searchSubmissionsFromStore({
    query,
    userId,
    limit,
  });
  return results.map(stripAnalysisMetadata);
}

function stripAnalysisMetadata(doc: OpenSearchSubmissionDocument): CanonicalSubmission {
  const { analysis, ...canonical } = doc;
  return canonical;
}
