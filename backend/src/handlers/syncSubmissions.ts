import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { apiResponse, apiError } from "./response";
import {
  fetchLiveLeetCodeSubmissions,
  fetchLiveCodeforcesSubmissions,
} from "../../services/ingestion/live-fetcher";
import { saveSubmission, clearOpenSearch } from "../../services/opensearch";
import { saveRawPayload } from "../../services/storage/s3";
import {
  saveUserProfile,
  saveWeaknesses,
  saveScheduleToDynamo,
  recordAnalysisRun,
} from "../../services/storage/dynamodb";
import { getAnalysisForUser } from "../../services/analysis";
import { scheduleProblem } from "../../scheduler/spaced-repetition";
import { DEFAULT_USER_CONFIG } from "../../services/ingestion/config";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, { ok: true });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const leetcodeUsername = body.leetcodeUsername || DEFAULT_USER_CONFIG.leetcodeUsername;
    const codeforcesHandle = body.codeforcesHandle || DEFAULT_USER_CONFIG.codeforcesHandle;
    const userId = body.userId || DEFAULT_USER_CONFIG.userId;
    const clearMock = body.clearMock ?? true;

    if (!leetcodeUsername && !codeforcesHandle) {
      return apiError(400, "Please provide at least a LeetCode username or Codeforces handle.");
    }

    if (clearMock) {
      clearOpenSearch();
    }

    let lcCount = 0;
    let cfCount = 0;
    const errors: string[] = [];

    // 1. Fetch & Store LeetCode Submissions
    if (leetcodeUsername) {
      try {
        const lcSubs = await fetchLiveLeetCodeSubmissions(leetcodeUsername.trim(), 50, userId);
        if (lcSubs.length > 0) {
          await saveRawPayload(userId, "leetcode", lcSubs);
          for (const sub of lcSubs) {
            await saveSubmission(sub);
          }
          lcCount = lcSubs.length;
        }
      } catch (e) {
        console.error("LeetCode fetch error:", e);
        errors.push(`LeetCode: ${(e as Error).message}`);
      }
    }

    // 2. Fetch & Store Codeforces Submissions
    if (codeforcesHandle) {
      try {
        const cfSubs = await fetchLiveCodeforcesSubmissions(codeforcesHandle.trim(), 50, userId);
        if (cfSubs.length > 0) {
          await saveRawPayload(userId, "codeforces", cfSubs);
          for (const sub of cfSubs) {
            await saveSubmission(sub);
          }
          cfCount = cfSubs.length;
        }
      } catch (e) {
        console.error("Codeforces fetch error:", e);
        errors.push(`Codeforces: ${(e as Error).message}`);
      }
    }

    const totalCount = lcCount + cfCount;

    // 3. Save User Profile to DynamoDB
    await saveUserProfile({
      userId,
      leetcodeUsername: leetcodeUsername?.trim(),
      codeforcesHandle: codeforcesHandle?.trim(),
      lastSyncAt: Date.now(),
    });

    // 4. Run AI Agent Weakness Diagnosis
    const analysis = await getAnalysisForUser(userId);

    // 5. Persist Weaknesses & Spaced Repetition Schedule in DynamoDB
    if (analysis.weak_topics && analysis.weak_topics.length > 0) {
      await saveWeaknesses(userId, analysis.weak_topics);
    }

    if (analysis.recommended_problems && analysis.recommended_problems.length > 0) {
      for (const rec of analysis.recommended_problems) {
        const scheduledItem = scheduleProblem({
          problem_id: rec.problem_id,
          title: rec.title || `Problem ${rec.problem_id}`,
          topic: rec.topic || "Targeted Practice",
          platform: rec.platform,
          reason: rec.reason,
          url: rec.url,
        });
        await saveScheduleToDynamo(userId, scheduledItem);
      }
    }

    // 6. Record Analysis Run in DynamoDB
    await recordAnalysisRun(userId, {
      analyzed_at: analysis.analyzed_at || Date.now(),
      summary: analysis.summary,
      weak_topics_count: analysis.weak_topics.length,
      recommended_problems_count: analysis.recommended_problems.length,
    });

    return apiResponse(200, {
      success: true,
      leetcodeCount: lcCount,
      codeforcesCount: cfCount,
      totalCount,
      profile: {
        userId,
        leetcodeUsername,
        codeforcesHandle,
        isLive: totalCount > 0,
      },
      analysis,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[syncSubmissions Lambda Error]:", error);
    return apiError(500, (error as Error).message);
  }
}
