import {
  searchSimilarMistakes as searchSimilarMistakesFromStore,
  getUserSubmissions as getUserSubmissionsFromStore,
  searchSubmissions as searchSubmissionsFromStore,
  getSubmission as getSubmissionFromStore,
  OpenSearchSubmissionDocument,
} from "@/services/opensearch";
import { CanonicalSubmission } from "@/schemas/submission.schema";
import { AnalysisOutput, WeakTopic, RecommendedProblem } from "@/schemas/analysis.schema";
import {
  saveWeaknesses,
  getWeaknessesFromDynamo,
  saveScheduleToDynamo,
  recordAnalysisRun,
  saveLatestAnalysis,
  getLatestAnalysisFromDynamo,
} from "@/services/storage/dynamodb";
import { scheduleProblem } from "@/scheduler/spaced-repetition";
import { DEFAULT_USER_CONFIG } from "@/services/ingestion/config";

function stripAnalysisMetadata(doc: OpenSearchSubmissionDocument): CanonicalSubmission {
  const { analysis, ...canonical } = doc;
  return canonical;
}

/**
 * 1. Returns the user's real normalized submissions from OpenSearch / Store
 */
export async function getUserSubmissions(userId = DEFAULT_USER_CONFIG.userId): Promise<CanonicalSubmission[]> {
  const results = await getUserSubmissionsFromStore(userId);
  return results.map(stripAnalysisMetadata);
}

/**
 * 2. Returns WA/TLE/MLE/RE/CE submissions relevant to diagnosis
 */
export async function getFailedSubmissions(userId = DEFAULT_USER_CONFIG.userId): Promise<CanonicalSubmission[]> {
  const allSubmissions = await getUserSubmissions(userId);
  return allSubmissions.filter((s) => s.submission.verdict !== "AC");
}

/**
 * 3. Uses OpenSearch to find historically similar mistakes
 */
export async function searchSimilarMistakes(
  userId = DEFAULT_USER_CONFIG.userId,
  query = "",
  limit = 10
): Promise<CanonicalSubmission[]> {
  const results = await searchSubmissionsFromStore({
    query,
    userId,
    limit,
  });
  return results.map(stripAnalysisMetadata);
}

/**
 * Historical mistake search by topic and verdict
 */
export async function searchPastMistakes(
  topic: string,
  verdict = "WA",
  userId = DEFAULT_USER_CONFIG.userId
): Promise<CanonicalSubmission[]> {
  const results = await searchSimilarMistakesFromStore(topic, verdict, userId);
  return results.map(stripAnalysisMetadata);
}

/**
 * 4. Gets previous weakness / analysis information from DynamoDB
 */
export async function getUserWeaknessHistory(userId = DEFAULT_USER_CONFIG.userId): Promise<WeakTopic[]> {
  return getWeaknessesFromDynamo(userId);
}

/**
 * 5. Retrieves available problem metadata and tags from stored submissions
 */
export async function getProblemContext(
  problemId: string,
  platform?: "leetcode" | "codeforces"
): Promise<{ id: string; title: string; difficulty?: string; topic_tags: string[]; url?: string } | null> {
  const searchResults = await searchSubmissionsFromStore({
    query: problemId,
    platform,
    limit: 5,
  });

  const matched = searchResults.find(
    (doc) => doc.problem.id === problemId && (!platform || doc.platform === platform)
  );

  if (matched) {
    return {
      id: matched.problem.id,
      title: matched.problem.title,
      difficulty: matched.problem.difficulty,
      topic_tags: matched.problem.topic_tags,
      url: matched.problem.url,
    };
  }

  return null;
}

/**
 * 6. Persists the final structured analysis to DynamoDB and populates spaced repetition schedule
 */
export async function saveAnalysis(userId: string, analysis: AnalysisOutput): Promise<void> {
  // 1. Save latest full analysis
  await saveLatestAnalysis(userId, analysis);

  // 2. Save weaknesses
  if (analysis.weak_topics && analysis.weak_topics.length > 0) {
    await saveWeaknesses(userId, analysis.weak_topics);
  }

  // 3. Schedule recommended problems
  if (analysis.recommended_problems && analysis.recommended_problems.length > 0) {
    for (const rec of analysis.recommended_problems) {
      const scheduled = scheduleProblem({
        problem_id: rec.problem_id,
        title: rec.title || `Problem ${rec.problem_id}`,
        topic: rec.topic || "Targeted Practice",
        platform: rec.platform,
        reason: rec.reason,
        url: rec.url,
      });
      await saveScheduleToDynamo(userId, scheduled);
    }
  }

  // 4. Record analysis run audit
  await recordAnalysisRun(userId, {
    analyzed_at: analysis.analyzed_at || Date.now(),
    summary: analysis.summary,
    weak_topics_count: analysis.weak_topics.length,
    recommended_problems_count: analysis.recommended_problems.length,
  });
}

// Backward compatibility helper
export const getUserHistory = getUserSubmissions;
