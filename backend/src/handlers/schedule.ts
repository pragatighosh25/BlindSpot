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
        // Compute active intervals from persisted DynamoDB items
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const today = dynamoItems.filter((i) => i.status === "due_today" || i.scheduled_date <= now + 12 * 3600 * 1000);
        const tomorrow = dynamoItems.filter((i) => i.scheduled_date > now + 12 * 3600 * 1000 && i.scheduled_date <= now + 1.5 * dayMs);
        const in3Days = dynamoItems.filter((i) => i.scheduled_date > now + 1.5 * dayMs && i.scheduled_date <= now + 3.5 * dayMs);
        const in7Days = dynamoItems.filter((i) => i.scheduled_date > now + 3.5 * dayMs && i.scheduled_date <= now + 7.5 * dayMs);
        const later = dynamoItems.filter((i) => i.scheduled_date > now + 7.5 * dayMs);

        practice = {
          today,
          tomorrow,
          in3Days,
          in7Days,
          later,
          all: dynamoItems,
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
