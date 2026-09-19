import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { apiResponse, apiError } from "./response";
import {
  getUpcomingPractice,
  markProblemCompleted,
  scheduleProblem,
  ScheduledReviewItem,
} from "../../scheduler/spaced-repetition";
import {
  getScheduleFromDynamo,
  saveScheduleToDynamo,
} from "../../services/storage/dynamodb";
import { DEFAULT_USER_CONFIG } from "../../services/ingestion/config";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, { ok: true });
  }

  const userId = event.queryStringParameters?.userId || DEFAULT_USER_CONFIG.userId;

  // GET /api/schedule
  if (event.httpMethod === "GET") {
    try {
      // 1. Try DynamoDB schedule
      const dynamoItems = await getScheduleFromDynamo(userId);
      let practice = getUpcomingPractice();

      if (dynamoItems && dynamoItems.length > 0) {
        const active = dynamoItems.filter((i) => i.status !== "mastered" && i.step_index < 5);
        const today = active.filter((i) => i.step_index === 0);
        const tomorrow = active.filter((i) => i.step_index === 1);
        const in3Days = active.filter((i) => i.step_index === 2);
        const in7Days = active.filter((i) => i.step_index === 3);
        const later = active.filter((i) => i.step_index === 4);

        practice = {
          today,
          tomorrow,
          in3Days,
          in7Days,
          later,
          all: active,
        };
      }

      return apiResponse(200, {
        success: true,
        userId,
        practice,
        schedule: practice,
      });
    } catch (error) {
      console.error("[getSchedule Lambda Error]:", error);
      return apiError(500, (error as Error).message);
    }
  }

  // POST /api/schedule
  if (event.httpMethod === "POST") {
    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { action, scheduleId, id } = body;
      const problem = body.problem || (body.problem_id ? body : null);

      if (action === "complete" && (scheduleId || id)) {
        const targetId = scheduleId || id;
        const updated = markProblemCompleted(targetId);
        if (updated) {
          await saveScheduleToDynamo(userId, updated);
        }
        return apiResponse(200, { success: true, item: updated });
      }

      if (problem && problem.problem_id) {
        const scheduled = scheduleProblem({
          problem_id: String(problem.problem_id),
          title: problem.title || `Problem ${problem.problem_id}`,
          topic: problem.topic || "Targeted Practice",
          platform: problem.platform || "leetcode",
          reason: problem.reason || "Targeted reinforcement for diagnosed blind spot",
          url: problem.url,
        });
        await saveScheduleToDynamo(userId, scheduled);
        return apiResponse(200, { success: true, item: scheduled });
      }

      return apiError(400, "Invalid action or missing parameters (action: 'complete' | 'schedule')");
    } catch (error) {
      console.error("[updateSchedule Lambda Error]:", error);
      return apiError(500, (error as Error).message);
    }
  }

  return apiError(405, `Method ${event.httpMethod} not allowed.`);
}
