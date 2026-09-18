import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { apiResponse, apiError } from "./response";
import { getAnalysisForUser, analyzeSubmission } from "../../services/analysis";
import {
  saveWeaknesses,
  saveScheduleToDynamo,
  recordAnalysisRun,
} from "../../services/storage/dynamodb";
import { scheduleProblem } from "../../scheduler/spaced-repetition";
import { isOpenSearchLive } from "../../services/opensearch";
import { DEFAULT_USER_CONFIG } from "../../services/ingestion/config";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, { ok: true });
  }

  try {
    // 1. Diagnose single submission on-the-fly
    if (event.path === "/api/analysis/submission" && event.httpMethod === "POST") {
      const body = event.body ? JSON.parse(event.body) : {};
      if (!body.submission) {
        return apiError(400, "Missing required field: submission");
      }
      const diagnosis = analyzeSubmission(body.submission);
      return apiResponse(200, { success: true, analysis: diagnosis });
    }

    // 2. Full User Analysis
    const queryParams = event.queryStringParameters || {};
    const body = event.body ? JSON.parse(event.body) : {};
    const userId = body.userId || queryParams.userId || DEFAULT_USER_CONFIG.userId;

    const analysis = await getAnalysisForUser(userId);

    // Persist weaknesses in DynamoDB
    if (analysis.weak_topics && analysis.weak_topics.length > 0) {
      await saveWeaknesses(userId, analysis.weak_topics);
    }

    // Auto-schedule recommendations into Spaced Repetition in DynamoDB
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

    // Record analysis run in DynamoDB
    await recordAnalysisRun(userId, {
      analyzed_at: analysis.analyzed_at || Date.now(),
      summary: analysis.summary,
      weak_topics_count: analysis.weak_topics.length,
      recommended_problems_count: analysis.recommended_problems.length,
    });

    return apiResponse(200, {
      success: true,
      isLive: isOpenSearchLive(),
      analysis,
    });
  } catch (error) {
    console.error("[triggerAnalysis Lambda Error]:", error);
    return apiError(500, (error as Error).message);
  }
}
