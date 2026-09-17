import { Platform } from "@/schemas/submission.schema";

export interface ScheduledReviewItem {
  id: string;
  problem_id: string;
  title: string;
  topic: string;
  platform: Platform;
  reason?: string;
  url?: string;
  step_index: number;
  intervals_days: number[];
  scheduled_date: number;
  completed_history: Array<{ step: number; completed_at: number }>;
  status: "due_today" | "upcoming" | "completed" | "mastered";
}
