import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSubmission, analyzeUserHistory, getWeaknessProfile, getRecommendations } from "../services/agent";
import { CanonicalSubmission } from "../schemas/submission.schema";
import { AnalysisOutputSchema } from "../schemas/analysis.schema";
import { SubmissionDiagnosisSchema } from "../services/agent/types";

test("analyzeSubmission accurately diagnoses a Binary Search boundary error", async () => {
  const binarySearchSub: CanonicalSubmission = {
    submission_id: "test_bs_01",
    user_id: "user_test",
    platform: "leetcode",
    problem: {
      id: "704",
      title: "Binary Search",
      difficulty: "Easy",
      topic_tags: ["Binary Search", "Array"],
    },
    submission: {
      language: "cpp",
      verdict: "WA",
      timestamp: 1709120400,
      code: `
        class Solution {
        public:
            int search(vector<int>& nums, int target) {
                int left = 0, right = nums.size() - 1;
                while (left < right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] == target) return mid;
                    if (nums[mid] < target) left = mid + 1;
                    else right = mid - 1;
                }
                return -1;
            }
        };
      `,
    },
  };

  const diagnosis = await analyzeSubmission(binarySearchSub);
  
  assert.equal(diagnosis.submission_id, "test_bs_01");
  assert.equal(diagnosis.failure_pattern, "boundary_condition_error");
  assert.equal(diagnosis.is_failure, true);
  assert.ok(diagnosis.confidence >= 0.8);
  
  const parsed = SubmissionDiagnosisSchema.safeParse(diagnosis);
  assert.equal(parsed.success, true);
});

test("analyzeSubmission handles AC submissions without reporting false failures", async () => {
  const acSub: CanonicalSubmission = {
    submission_id: "test_ac_01",
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
      verdict: "AC",
      timestamp: 1709120400,
      code: `
        class Solution {
        public:
            int search(vector<int>& nums, int target) {
                int left = 0, right = nums.size() - 1;
                while (left <= right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] == target) return mid;
                    if (nums[mid] < target) left = mid + 1;
                    else right = mid - 1;
                }
                return -1;
            }
        };
      `,
    },
  };

  const diagnosis = await analyzeSubmission(acSub);
  assert.equal(diagnosis.is_failure, false);
  assert.equal(diagnosis.verdict, "AC");
  assert.equal(diagnosis.confidence, 1.0);
});

test("analyzeSubmission classifies TLE submissions as complexity or state issues", async () => {
  const tleSub: CanonicalSubmission = {
    submission_id: "test_tle_01",
    user_id: "user_test",
    platform: "leetcode",
    problem: {
      id: "300",
      title: "Longest Increasing Subsequence",
      difficulty: "Medium",
      topic_tags: ["Dynamic Programming"],
    },
    submission: {
      language: "python",
      verdict: "TLE",
      timestamp: 1709120400,
      code: `
        def lengthOfLIS(nums):
            def helper(i, prev):
                if i == len(nums): return 0
                taken = 0
                if prev == -1 or nums[i] > nums[prev]:
                    taken = 1 + helper(i + 1, i)
                not_taken = helper(i + 1, prev)
                return max(taken, not_taken)
            return helper(0, -1)
      `,
    },
  };

  const diagnosis = await analyzeSubmission(tleSub);
  assert.equal(diagnosis.is_failure, true);
  assert.equal(diagnosis.failure_pattern, "incorrect_state_definition");
});

test("analyzeUserHistory produces valid AnalysisOutput conforming to schema", async () => {
  const output = await analyzeUserHistory("user_demo");
  
  const validation = AnalysisOutputSchema.safeParse(output);
  assert.equal(validation.success, true);
  assert.ok(output.weak_topics.length > 0);
  assert.ok(output.recommended_problems.length > 0);
});

test("getWeaknessProfile and getRecommendations helpers return typed items", async () => {
  const weakTopics = await getWeaknessProfile("user_demo");
  const recommendations = await getRecommendations("user_demo");

  assert.ok(Array.isArray(weakTopics));
  assert.ok(Array.isArray(recommendations));
  assert.ok(weakTopics.length > 0);
  assert.ok(recommendations.length > 0);
});
