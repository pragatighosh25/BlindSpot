import test from "node:test";
import assert from "node:assert/strict";
import { CanonicalSubmissionSchema } from "../schemas/submission.schema";
import { AnalysisOutputSchema } from "../schemas/analysis.schema";
import { normalizeSubmission } from "../services/normalization";
import {
  saveSubmission,
  getSubmission,
  searchSubmissions,
  searchSimilarMistakes,
} from "../services/opensearch";
import {
  scheduleProblem,
  getUpcomingPractice,
  markProblemCompleted,
} from "../scheduler/spaced-repetition";
import { getAnalysisForUser } from "../services/analysis";

test("CanonicalSubmissionSchema validates a well-formed submission", () => {
  const sample = {
    submission_id: "lc_123",
    user_id: "user_test",
    platform: "leetcode",
    problem: {
      id: "704",
      title: "Binary Search",
      difficulty: "Easy",
      topic_tags: ["Binary Search"],
    },
    submission: {
      language: "cpp",
      verdict: "WA",
      timestamp: 1709120400,
      code: "class Solution { ... }",
    },
  };

  const result = CanonicalSubmissionSchema.safeParse(sample);
  assert.equal(result.success, true);
});

test("CanonicalSubmissionSchema rejects invalid verdict or missing fields", () => {
  const invalid = {
    submission_id: "lc_123",
    platform: "leetcode",
    problem: { id: "1" },
    submission: {
      language: "cpp",
      verdict: "INVALID_VERDICT",
      timestamp: "invalid-time",
      code: "...",
    },
  };

  const result = CanonicalSubmissionSchema.safeParse(invalid);
  assert.equal(result.success, false);
});

test("AnalysisOutputSchema validates Person B contract payload", () => {
  const analysisSample = {
    user_id: "user_test",
    analyzed_at: 1709120400,
    weak_topics: [
      {
        topic: "Binary Search",
        failure_mode: "Boundary Condition Errors",
        confidence: 0.91,
        evidence_count: 5,
        example_submissions: ["lc_sub_101", "lc_sub_102"],
      },
    ],
    recommended_problems: [
      {
        platform: "leetcode",
        problem_id: "704",
        reason: "Practice handling edge condition when left == right",
      },
    ],
  };

  const result = AnalysisOutputSchema.safeParse(analysisSample);
  assert.equal(result.success, true);
});

test("normalizeSubmission normalizes LeetCode raw payload correctly", () => {
  const rawLC = {
    id: 101,
    questionId: 704,
    title: "Binary Search",
    titleSlug: "binary-search",
    lang: "cpp",
    statusDisplay: "Wrong Answer",
    runtime: "32 ms",
    memory: "27.5 MB",
    timestamp: 1709120400,
    code: "int search() {}",
    difficulty: "Easy",
    topicTags: [{ name: "Binary Search" }],
  };

  const canonical = normalizeSubmission("leetcode", rawLC, "user_demo");
  assert.equal(canonical.submission_id, "lc_101");
  assert.equal(canonical.platform, "leetcode");
  assert.equal(canonical.problem.id, "704");
  assert.equal(canonical.submission.verdict, "WA");
});

test("normalizeSubmission normalizes Codeforces raw payload correctly", () => {
  const rawCF = {
    id: 201,
    contestId: 1613,
    creationTimeSeconds: 1709131200,
    problem: {
      contestId: 1613,
      index: "C",
      name: "Poisoned Dagger",
      rating: 1200,
      tags: ["binary search", "greedy"],
    },
    author: { members: [{ handle: "code_ninja" }] },
    programmingLanguage: "GNU C++20 (64)",
    verdict: "WRONG_ANSWER",
    timeConsumedMillis: 110,
    memoryConsumedBytes: 3355443,
    sourceCode: "#include <bits/stdc++.h>...",
  };

  const canonical = normalizeSubmission("codeforces", rawCF);
  assert.equal(canonical.submission_id, "cf_201");
  assert.equal(canonical.platform, "codeforces");
  assert.equal(canonical.problem.id, "1613C");
});

test("OpenSearch service saves and searches submissions and similar mistakes", async () => {
  const customSub = {
    submission_id: "test_sub_999",
    user_id: "user_demo",
    platform: "leetcode" as const,
    problem: {
      id: "999",
      title: "Test Binary Search Edge",
      difficulty: "Medium",
      topic_tags: ["Binary Search", "Array"],
    },
    submission: {
      language: "cpp",
      verdict: "WA" as const,
      timestamp: 1709800000,
      code: "while(l < r) { ... }",
      error_message: "Wrong Answer on test 1",
    },
  };

  await saveSubmission(customSub);
  const fetched = await getSubmission("test_sub_999");
  assert.equal(fetched?.submission_id, "test_sub_999");

  const searchResults = await searchSubmissions({ query: "Test Binary Search" });
  assert.ok(searchResults.length > 0);

  const similarMistakes = await searchSimilarMistakes("Binary Search", "WA");
  assert.ok(similarMistakes.length >= 1);
});

test("Spaced-repetition scheduler manages intervals and progression", async () => {
  const scheduled = scheduleProblem({
    problem_id: "875",
    title: "Koko Eating Bananas",
    topic: "Binary Search",
    platform: "leetcode",
    reason: "Practice monotonic range condition",
  });

  assert.equal(scheduled.problem_id, "875");
  assert.equal(scheduled.step_index, 0);

  const practice = getUpcomingPractice();
  assert.ok(practice.all.length > 0);

  const completed = markProblemCompleted(scheduled.id);
  assert.equal(completed?.step_index, 1);
});

test("Person B analysis service returns validated analysis output", async () => {
  const analysis = await getAnalysisForUser("user_demo");
  assert.ok(analysis.weak_topics.length > 0);
  assert.ok(analysis.recommended_problems.length > 0);
  assert.equal(analysis.user_id, "user_demo");
});
