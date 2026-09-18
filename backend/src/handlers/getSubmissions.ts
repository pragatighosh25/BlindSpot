import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { apiResponse, apiError } from "./response";
import { searchSubmissions, getSubmission, isOpenSearchLive } from "../../services/opensearch";
import { getUserProfile } from "../../services/storage/dynamodb";
import { DEFAULT_USER_CONFIG } from "../../services/ingestion/config";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, { ok: true });
  }

  try {
    const submissionId = event.pathParameters?.id;
    if (submissionId) {
      const submission = await getSubmission(submissionId);
      if (!submission) {
        return apiError(404, "Submission not found");
      }
      return apiResponse(200, { success: true, submission });
    }

    const queryParams = event.queryStringParameters || {};
    const query = queryParams.q || "";
    const platform = queryParams.platform || undefined;
    const verdict = queryParams.verdict || undefined;
    const topic = queryParams.topic || undefined;
    const userId = queryParams.userId || DEFAULT_USER_CONFIG.userId;

    const submissions = await searchSubmissions({
      query,
      platform,
      verdict,
      topic,
      userId,
    });

    const profile = await getUserProfile(userId);

    return apiResponse(200, {
      success: true,
      count: submissions.length,
      isLive: isOpenSearchLive(),
      profile: profile || { userId, isLive: isOpenSearchLive() },
      submissions,
    });
  } catch (error) {
    console.error("[getSubmissions Lambda Error]:", error);
    return apiError(500, (error as Error).message);
  }
}
