import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { apiResponse, apiError } from "./response";
import { getWeaknessesFromDynamo } from "../../services/storage/dynamodb";
import { getAnalysisForUser } from "../../services/analysis";
import { DEFAULT_USER_CONFIG } from "../../services/ingestion/config";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, { ok: true });
  }

  try {
    const queryParams = event.queryStringParameters || {};
    const userId = queryParams.userId || DEFAULT_USER_CONFIG.userId;

    // 1. Try to fetch persisted weaknesses from DynamoDB
    let weaknesses = await getWeaknessesFromDynamo(userId);

    // 2. If no persisted weaknesses yet, run AI analysis engine
    if (!weaknesses || weaknesses.length === 0) {
      const analysis = await getAnalysisForUser(userId);
      weaknesses = analysis.weak_topics;
    }

    return apiResponse(200, {
      success: true,
      count: weaknesses.length,
      userId,
      weaknesses,
    });
  } catch (error) {
    console.error("[getWeaknesses Lambda Error]:", error);
    return apiError(500, (error as Error).message);
  }
}
