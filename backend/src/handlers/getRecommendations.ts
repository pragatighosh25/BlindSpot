import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { apiResponse, apiError } from "./response";
import { getAnalysisForUser } from "../../services/analysis";
import { DEFAULT_USER_CONFIG } from "../../services/ingestion/config";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, { ok: true });
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const userId = queryParams.userId || DEFAULT_USER_CONFIG.userId;

    const analysis = await getAnalysisForUser(userId);
    const recommendations = analysis.recommended_problems || [];

    return apiResponse(200, {
      success: true,
      count: recommendations.length,
      userId,
      recommendations,
    });
  } catch (error) {
    console.error("[getRecommendations Lambda Error]:", error);
    return apiError(500, (error as Error).message);
  }
}
