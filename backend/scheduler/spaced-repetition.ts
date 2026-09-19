import { Platform } from "@/schemas/submission.schema";

export interface ScheduledReviewItem {
  id: string;
  problem_id: string;
  title: string;
  topic: string;
  platform: Platform;
  reason?: string;
  url?: string;
  step_index: number; // 0 = Day 0, 1 = Day 1, 2 = Day 3, 3 = Day 7, 4 = Day 14, 5 = Mastered
  intervals_days: number[]; // [0, 1, 3, 7, 14]
  scheduled_date: number; // timestamp ms
  completed_history: Array<{ step: number; completed_at: number }>;
  status: "due_today" | "upcoming" | "completed" | "mastered";
}

const INTERVAL_DAYS = [0, 1, 3, 7, 14];

class SpacedRepetitionScheduler {
  private scheduleStore: Map<string, ScheduledReviewItem> = new Map();

  constructor() {
    this.seedDefaultSchedule();
  }

  private seedDefaultSchedule() {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const initialItems: Array<Omit<ScheduledReviewItem, "id" | "intervals_days" | "completed_history" | "status">> = [
      {
        problem_id: "704",
        title: "Binary Search",
        topic: "Binary Search",
        platform: "leetcode",
        reason: "Fix off-by-one error (left <= right single element boundary)",
        url: "https://leetcode.com/problems/binary-search/",
        step_index: 0,
        scheduled_date: now - 2 * 3600 * 1000, // Due Today
      },
      {
        problem_id: "35",
        title: "Search Insert Position",
        topic: "Binary Search",
        platform: "leetcode",
        reason: "Lower bound boundary invariant review",
        url: "https://leetcode.com/problems/search-insert-position/",
        step_index: 1,
        scheduled_date: now + 1 * dayMs, // Tomorrow
      },
      {
        problem_id: "300",
        title: "Longest Increasing Subsequence",
        topic: "Dynamic Programming",
        platform: "leetcode",
        reason: "1D DP state formulation practice",
        url: "https://leetcode.com/problems/longest-increasing-subsequence/",
        step_index: 2,
        scheduled_date: now + 3 * dayMs, // In 3 days
      },
      {
        problem_id: "200",
        title: "Number of Islands",
        topic: "Graphs",
        platform: "leetcode",
        reason: "BFS immediate queue visited-marking",
        url: "https://leetcode.com/problems/number-of-islands/",
        step_index: 3,
        scheduled_date: now + 7 * dayMs, // In 7 days
      },
      {
        problem_id: "3",
        title: "Longest Substring Without Repeating Characters",
        topic: "Sliding Window",
        platform: "leetcode",
        reason: "Shrink window without pointer regress",
        url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        step_index: 4,
        scheduled_date: now + 14 * dayMs, // In 14 days
      },
    ];

    for (const item of initialItems) {
      const id = `sched_${item.problem_id}_${item.platform}`;
      this.scheduleStore.set(id, {
        ...item,
        id,
        intervals_days: INTERVAL_DAYS,
        completed_history: [],
        status: this.computeStatus(item.scheduled_date, item.step_index),
      });
    }
  }

  private computeStatus(scheduledDate: number, stepIndex: number): ScheduledReviewItem["status"] {
    if (stepIndex >= INTERVAL_DAYS.length) return "mastered";
    const now = Date.now();
    const isPastOrToday = scheduledDate <= now + 12 * 3600 * 1000;
    return isPastOrToday ? "due_today" : "upcoming";
  }

  public scheduleProblem(params: {
    problem_id: string;
    title: string;
    topic: string;
    platform: Platform;
    reason?: string;
    url?: string;
  }): ScheduledReviewItem {
    const id = `sched_${params.problem_id}_${params.platform}`;
    const now = Date.now();

    const existing = this.scheduleStore.get(id);
    if (existing) {
      return existing;
    }

    const newItem: ScheduledReviewItem = {
      id,
      problem_id: params.problem_id,
      title: params.title,
      topic: params.topic,
      platform: params.platform,
      reason: params.reason,
      url: params.url,
      step_index: 0,
      intervals_days: INTERVAL_DAYS,
      scheduled_date: now,
      completed_history: [],
      status: "due_today",
    };

    this.scheduleStore.set(id, newItem);
    return newItem;
  }

  public getUpcomingPractice(): {
    today: ScheduledReviewItem[];
    tomorrow: ScheduledReviewItem[];
    in3Days: ScheduledReviewItem[];
    in7Days: ScheduledReviewItem[];
    later: ScheduledReviewItem[];
    all: ScheduledReviewItem[];
  } {
    const all = Array.from(this.scheduleStore.values()).map((item) => ({
      ...item,
      status: this.computeStatus(item.scheduled_date, item.step_index),
    }));

    const active = all.filter((i) => i.status !== "mastered" && i.step_index < INTERVAL_DAYS.length);

    const today = active.filter((i) => i.step_index === 0);
    const tomorrow = active.filter((i) => i.step_index === 1);
    const in3Days = active.filter((i) => i.step_index === 2);
    const in7Days = active.filter((i) => i.step_index === 3);
    const later = active.filter((i) => i.step_index === 4);

    return { today, tomorrow, in3Days, in7Days, later, all: active };
  }

  public markProblemCompleted(scheduleId: string): ScheduledReviewItem | null {
    const item = this.scheduleStore.get(scheduleId);
    if (!item) return null;

    const nextStep = item.step_index + 1;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    item.completed_history.push({ step: item.step_index, completed_at: now });
    item.step_index = nextStep;

    if (nextStep < INTERVAL_DAYS.length) {
      const nextIntervalDays = INTERVAL_DAYS[nextStep];
      item.scheduled_date = now + nextIntervalDays * dayMs;
      item.status = "upcoming";
    } else {
      item.status = "mastered";
    }

    this.scheduleStore.set(scheduleId, item);
    return item;
  }
}

const globalScheduler = new SpacedRepetitionScheduler();

export function scheduleProblem(params: {
  problem_id: string;
  title: string;
  topic: string;
  platform: Platform;
  reason?: string;
  url?: string;
}): ScheduledReviewItem {
  return globalScheduler.scheduleProblem(params);
}

export function getUpcomingPractice() {
  return globalScheduler.getUpcomingPractice();
}

export function markProblemCompleted(scheduleId: string) {
  return globalScheduler.markProblemCompleted(scheduleId);
}
