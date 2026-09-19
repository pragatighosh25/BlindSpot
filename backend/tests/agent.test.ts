import test from "node:test";
import assert from "node:assert/strict";
import { analyzeSubmission, analyzeUserHistory, getWeaknessProfile, getRecommendations } from "../services/agent";
import { CanonicalSubmission } from "../schemas/submission.schema";
import { AnalysisOutputSchema } from "../schemas/analysis.schema";
import { SubmissionDiagnosisSchema } from "../services/agent/types";

// -------------------------------------------------------------
// Test 1: House Robber / Incorrect DP Transition
// -------------------------------------------------------------
test("Test 1 - House Robber: Diagnoses adjacent state overlap and correct recurrence", async () => {
  const houseRobberSub: CanonicalSubmission = {
    submission_id: "lc_sub_110",
    user_id: "user_demo",
    platform: "leetcode",
    problem: {
      id: "198",
      title: "House Robber",
      difficulty: "Medium",
      topic_tags: ["Dynamic Programming", "Array"],
      url: "https://leetcode.com/problems/house-robber/",
    },
    submission: {
      language: "javascript",
      verdict: "WA",
      runtime_ms: 50,
      memory_mb: 42.1,
      timestamp: 1709218000,
      code: `
        var rob = function(nums) {
            if (nums.length === 0) return 0;
            if (nums.length === 1) return nums[0];
            let dp = new Array(nums.length);
            dp[0] = nums[0];
            dp[1] = Math.max(nums[0], nums[1]);
            for (let i = 2; i < nums.length; i++) {
                // Bug: state definition error omitting skip-two transition
                dp[i] = dp[i-1] + nums[i];
            }
            return dp[nums.length - 1];
        };
      `,
      error_message: "Wrong Answer: Input [2,7,9,3,1] -> Output 20, Expected 12",
    },
  };

  const diagnosis = await analyzeSubmission(houseRobberSub);

  // 1. Failure Pattern & Mode
  assert.equal(diagnosis.is_failure, true);
  assert.equal(diagnosis.failure_pattern, "wrong_transition");
  assert.ok(diagnosis.confidence >= 0.9);

  // 2. Root Cause explains dp[i] = dp[i-1] + nums[i] mistake
  assert.ok(diagnosis.root_cause.includes("dp[i-1] + nums[i]"));
  assert.ok(diagnosis.root_cause.toLowerCase().includes("non-adjacent"));

  // 3. Why It Fails explains test case [2,7,9,3,1] with 20 vs 12
  assert.ok(diagnosis.why_it_fails.includes("20"));
  assert.ok(diagnosis.why_it_fails.includes("12"));

  // 4. Correct Concept explains mutually exclusive choice
  assert.ok(diagnosis.correct_concept.toLowerCase().includes("optimal substructure"));

  // 5. Suggested Fix specifies correct recurrence dp[i] = max(dp[i-1], dp[i-2] + nums[i])
  assert.ok(diagnosis.suggested_fix.includes("dp[i-2] + nums[i]"));

  // 6. Evidence extraction
  assert.ok(diagnosis.evidence);
  assert.equal(diagnosis.evidence?.actual_output, "20");
  assert.equal(diagnosis.evidence?.expected_output, "12");

  const parsed = SubmissionDiagnosisSchema.safeParse(diagnosis);
  assert.equal(parsed.success, true);
});

// -------------------------------------------------------------
// Test 2: Binary Search Boundary Condition Error
// -------------------------------------------------------------
test("Test 2 - Binary Search: Diagnoses while (left < right) premature loop termination", async () => {
  const binarySearchSub: CanonicalSubmission = {
    submission_id: "lc_sub_101",
    user_id: "user_demo",
    platform: "leetcode",
    problem: {
      id: "704",
      title: "Binary Search",
      difficulty: "Easy",
      topic_tags: ["Binary Search", "Array"],
      url: "https://leetcode.com/problems/binary-search/",
    },
    submission: {
      language: "cpp",
      verdict: "WA",
      runtime_ms: 32,
      memory_mb: 27.5,
      timestamp: 1709120400,
      code: `
        class Solution {
        public:
            int search(vector<int>& nums, int target) {
                int left = 0, right = nums.size() - 1;
                while (left < right) {
                    int mid = left + (right - left) / 2;
                    if (nums[mid] == target) return mid;
                    else if (nums[mid] < target) left = mid + 1;
                    else right = mid - 1;
                }
                return -1;
            }
        };
      `,
      error_message: "Wrong Answer: Input [-1,0,3,5,9,12], target 9 -> Output -1, Expected 4",
    },
  };

  const diagnosis = await analyzeSubmission(binarySearchSub);

  assert.equal(diagnosis.is_failure, true);
  assert.equal(diagnosis.failure_pattern, "boundary_condition_error");
  assert.ok(diagnosis.confidence >= 0.9);
  assert.ok(diagnosis.root_cause.includes("left < right"));
  assert.ok(diagnosis.suggested_fix.includes("left <= right"));
  assert.equal(diagnosis.evidence?.actual_output, "-1");
  assert.equal(diagnosis.evidence?.expected_output, "4");
});

// -------------------------------------------------------------
// Test 3: Graph Visited-State Error (BFS Queue Explosion)
// -------------------------------------------------------------
test("Test 3 - Graph: Diagnoses post-dequeue visited marking and BFS queue inflation", async () => {
  const graphSub: CanonicalSubmission = {
    submission_id: "lc_sub_111",
    user_id: "user_demo",
    platform: "leetcode",
    problem: {
      id: "200",
      title: "Number of Islands",
      difficulty: "Medium",
      topic_tags: ["Graphs", "Breadth-First Search"],
      url: "https://leetcode.com/problems/number-of-islands/",
    },
    submission: {
      language: "python",
      verdict: "MLE",
      runtime_ms: 1200,
      memory_mb: 512.0,
      timestamp: 1709300000,
      code: `
        class Solution:
            def numIslands(self, grid: List[List[str]]) -> int:
                if not grid: return 0
                m, n = len(grid), len(grid[0])
                count = 0
                for r in range(m):
                    for c in range(n):
                        if grid[r][c] == '1':
                            count += 1
                            q = collections.deque([(r, c)])
                            while q:
                                curr_r, curr_c = q.popleft()
                                grid[curr_r][curr_c] = '0' # Bug: visited marked after pop
                                for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                                    nr, nc = curr_r + dr, curr_c + dc
                                    if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == '1':
                                        q.append((nr, nc))
                return count
      `,
      error_message: "Memory Limit Exceeded / TLE due to exponential queue duplication",
    },
  };

  const diagnosis = await analyzeSubmission(graphSub);

  assert.equal(diagnosis.is_failure, true);
  assert.equal(diagnosis.failure_pattern, "visited_state_error");
  assert.ok(diagnosis.confidence >= 0.9);
  assert.ok(diagnosis.root_cause.toLowerCase().includes("pop") || diagnosis.root_cause.toLowerCase().includes("dequeue"));
  assert.ok(diagnosis.suggested_fix.toLowerCase().includes("grid[nr][nc]") || diagnosis.suggested_fix.toLowerCase().includes("enqueue"));
});

// -------------------------------------------------------------
// Test 4: TLE / Excessive Complexity (Unmemoized Recursion)
// -------------------------------------------------------------
test("Test 4 - TLE: Distinguishes unmemoized exponential recursion from logical WA", async () => {
  const tleSub: CanonicalSubmission = {
    submission_id: "lc_sub_106",
    user_id: "user_demo",
    platform: "leetcode",
    problem: {
      id: "322",
      title: "Coin Change",
      difficulty: "Medium",
      topic_tags: ["Dynamic Programming", "Breadth-First Search"],
      url: "https://leetcode.com/problems/coin-change/",
    },
    submission: {
      language: "python",
      verdict: "TLE",
      runtime_ms: 2000,
      memory_mb: 45.3,
      timestamp: 1709200000,
      code: `
        class Solution:
            def coinChange(self, coins: List[int], amount: int) -> int:
                def helper(rem):
                    if rem == 0: return 0
                    if rem < 0: return float('inf')
                    res = float('inf')
                    for c in coins:
                        res = min(res, 1 + helper(rem - c))
                    return res
                ans = helper(amount)
                return ans if ans != float('inf') else -1
      `,
      error_message: "Time Limit Exceeded",
    },
  };

  const diagnosis = await analyzeSubmission(tleSub);

  assert.equal(diagnosis.is_failure, true);
  assert.equal(diagnosis.failure_pattern, "incorrect_state_definition");
  assert.ok(diagnosis.confidence >= 0.85);
  assert.ok(diagnosis.root_cause.toLowerCase().includes("memo") || diagnosis.root_cause.toLowerCase().includes("cache"));
  assert.ok(diagnosis.why_it_fails.toLowerCase().includes("exponential") || diagnosis.why_it_fails.toLowerCase().includes("overlapping"));
});

// -------------------------------------------------------------
// Test 5: AC Submission
// -------------------------------------------------------------
test("Test 5 - AC: Accepted submission reports clean verdict with no false failure", async () => {
  const acSub: CanonicalSubmission = {
    submission_id: "lc_sub_104",
    user_id: "user_demo",
    platform: "leetcode",
    problem: {
      id: "875",
      title: "Koko Eating Bananas",
      difficulty: "Medium",
      topic_tags: ["Binary Search", "Array"],
      url: "https://leetcode.com/problems/koko-eating-bananas/",
    },
    submission: {
      language: "python",
      verdict: "AC",
      runtime_ms: 145,
      memory_mb: 18.1,
      timestamp: 1709134800,
      code: `
        class Solution:
            def minEatingSpeed(self, piles: List[int], h: int) -> int:
                low, high = 1, max(piles)
                res = high
                while low <= high:
                    k = low + (high - low) // 2
                    hours = sum((p + k - 1) // k for p in piles)
                    if hours <= h:
                        res = k
                        high = k - 1
                    else:
                        low = k + 1
                return res
      `,
    },
  };

  const diagnosis = await analyzeSubmission(acSub);
  assert.equal(diagnosis.is_failure, false);
  assert.equal(diagnosis.verdict, "AC");
  assert.equal(diagnosis.confidence, 1.0);
  assert.equal(diagnosis.failure_mode, "Accepted Solution");
});

// -------------------------------------------------------------
// Test 6: User History Analysis & Weakness Profile
// -------------------------------------------------------------
test("Test 6 - History: Aggregates recurring weaknesses with root-cause summaries", async () => {
  const { saveSubmission } = await import("../services/opensearch.js");
  
  // Seed sample submissions for testing agent history aggregation
  await saveSubmission({
    submission_id: "test_dp_1",
    user_id: "user_demo",
    platform: "leetcode",
    problem: { id: "198", title: "House Robber", difficulty: "Medium", topic_tags: ["Dynamic Programming"] },
    submission: { language: "cpp", verdict: "WA", timestamp: Date.now() - 3000, code: "dp[i] = dp[i-1] + nums[i];" }
  });
  await saveSubmission({
    submission_id: "test_bs_1",
    user_id: "user_demo",
    platform: "leetcode",
    problem: { id: "704", title: "Binary Search", difficulty: "Easy", topic_tags: ["Binary Search"] },
    submission: { language: "cpp", verdict: "WA", timestamp: Date.now() - 2000, code: "while (left < right) { if (nums[mid] == target) return mid; else right = mid - 1; }" }
  });
  await saveSubmission({
    submission_id: "test_graph_1",
    user_id: "user_demo",
    platform: "leetcode",
    problem: { id: "200", title: "Number of Islands", difficulty: "Medium", topic_tags: ["Graphs"] },
    submission: { language: "cpp", verdict: "TLE", timestamp: Date.now() - 1000, code: "queue.push({nr, nc}); visited[r][c] = true;" }
  });

  const output = await analyzeUserHistory("user_demo");

  const validation = AnalysisOutputSchema.safeParse(output);
  assert.equal(validation.success, true);
  assert.ok(output.weak_topics.length >= 3);

  // Verify that weak topics contain rich diagnostic reasoning
  const topWeakness = output.weak_topics[0];
  assert.ok(topWeakness.topic);
  assert.ok(topWeakness.failure_mode);
  assert.ok(topWeakness.root_cause);
  assert.ok(topWeakness.why_it_fails);
  assert.ok(topWeakness.correct_concept);
  assert.ok(topWeakness.suggested_fix);
});

test("Test 7 - Helpers: getWeaknessProfile and getRecommendations return typed arrays", async () => {
  const weakTopics = await getWeaknessProfile("user_demo");
  const recommendations = await getRecommendations("user_demo");

  assert.ok(Array.isArray(weakTopics));
  assert.ok(Array.isArray(recommendations));
  assert.ok(weakTopics.length > 0);
  assert.ok(recommendations.length > 0);
});

// -------------------------------------------------------------
// Test 8: Empty History Handling
// -------------------------------------------------------------
test("Test 8 - Empty History: Gracefully handles user with no submissions", async () => {
  const output = await analyzeUserHistory("non_existent_user_xyz");

  const validation = AnalysisOutputSchema.safeParse(output);
  assert.equal(validation.success, true);
  assert.equal(output.user_id, "non_existent_user_xyz");
  assert.equal(output.weak_topics.length, 0);
  assert.ok(output.summary?.includes("No submission history found"));
});

// -------------------------------------------------------------
// Test 9: All-AC History Handling
// -------------------------------------------------------------
test("Test 9 - All-AC: Gracefully handles user with only Accepted submissions", async () => {
  const { saveSubmission } = await import("../services/opensearch.js");
  const perfectSub: CanonicalSubmission = {
    submission_id: "perfect_sub_1",
    user_id: "user_perfect_coder",
    platform: "leetcode",
    problem: {
      id: "1",
      title: "Two Sum",
      difficulty: "Easy",
      topic_tags: ["Array", "Hash Table"],
    },
    submission: {
      language: "python",
      verdict: "AC",
      timestamp: Date.now(),
      code: "class Solution: ...",
    },
  };

  await saveSubmission(perfectSub);
  const output = await analyzeUserHistory("user_perfect_coder");

  assert.equal(output.user_id, "user_perfect_coder");
  assert.equal(output.weak_topics.length, 0);
  assert.ok(output.summary?.includes("Accepted (AC)"));
});

// -------------------------------------------------------------
// Test 10: Strands Agent Tools Suite
// -------------------------------------------------------------
test("Test 10 - Agent Tools: getUserSubmissions, getFailedSubmissions, searchSimilarMistakes, getProblemContext", async () => {
  const {
    getUserSubmissions,
    getFailedSubmissions,
    searchSimilarMistakes,
    getProblemContext,
  } = await import("../services/agent/tools.js");

  const allSubs = await getUserSubmissions("user_demo");
  const failedSubs = await getFailedSubmissions("user_demo");

  assert.ok(allSubs.length > 0);
  assert.ok(failedSubs.length > 0);
  assert.ok(allSubs.length >= failedSubs.length);

  const mistakes = await searchSimilarMistakes("user_demo", "Binary Search");
  assert.ok(Array.isArray(mistakes));

  const ctx = await getProblemContext("704", "leetcode");
  if (ctx) {
    assert.equal(ctx.id, "704");
    assert.ok(ctx.title);
  }
});

// -------------------------------------------------------------
// Test 11: DynamoDB Persistence of Analysis
// -------------------------------------------------------------
test("Test 11 - Persistence: Saves and verifies analysis in DynamoDB", async () => {
  const { getWeaknessesFromDynamo } = await import("../services/storage/dynamodb.js");
  
  await analyzeUserHistory("user_demo");
  const savedWeaknesses = await getWeaknessesFromDynamo("user_demo");

  assert.ok(Array.isArray(savedWeaknesses));
  assert.ok(savedWeaknesses.length > 0);
  assert.ok(savedWeaknesses[0].topic);
  assert.ok(savedWeaknesses[0].failure_mode);
});

// -------------------------------------------------------------
// Test 12: Gemini Response Extraction & Schema Validation
// -------------------------------------------------------------
test("Test 12 - Gemini: Correctly extracts and parses Gemini completion response structure", async () => {
  const { extractJsonFromResponse } = await import("../services/agent/llm.js");

  // Simulated raw output from Gemini generateContent (response.text)
  const simulatedGeminiText = `
  \`\`\`json
  {
    "submission_id": "test_gemini_01",
    "topic": "Binary Search",
    "verdict": "WA",
    "failure_pattern": "boundary_condition_error",
    "failure_mode": "Strict Inequality Off-by-One",
    "root_cause": "The while loop uses left < right instead of left <= right.",
    "why_it_fails": "Fails when target is located at the rightmost index.",
    "correct_concept": "Binary search on closed interval [left, right] requires left <= right.",
    "suggested_fix": "Change while (left < right) to while (left <= right).",
    "code_location": "line 4 while loop",
    "explanation": "Off-by-one boundary failure.",
    "confidence": 0.95,
    "is_failure": true
  }
  \`\`\`
  `;

  const parsed = extractJsonFromResponse(simulatedGeminiText);
  const validated = SubmissionDiagnosisSchema.safeParse(parsed);

  assert.equal(validated.success, true);
  if (validated.success) {
    assert.equal(validated.data.failure_pattern, "boundary_condition_error");
    assert.equal(validated.data.confidence, 0.95);
    assert.equal(validated.data.topic, "Binary Search");
  }
});

// -------------------------------------------------------------
// Test 13: LLM Provider Telemetry & Secret Sanitization
// -------------------------------------------------------------
test("Test 13 - Telemetry: Verifies provider telemetry tracking and key sanitization", async () => {
  const { getLLMTelemetry, recordLLMTelemetry, sanitizeErrorMessage } = await import("../services/agent/llm.js");

  // Verify telemetry retrieval
  const telemetry = getLLMTelemetry();
  assert.equal(telemetry.provider, "Gemini");
  assert.ok(telemetry.model);
  assert.ok(["GEMINI", "FALLBACK"].includes(telemetry.source));

  // Verify telemetry recording
  recordLLMTelemetry({ source: "FALLBACK", lastError: "Test error notice" });
  const updatedTelemetry = getLLMTelemetry();
  assert.equal(updatedTelemetry.source, "FALLBACK");
  assert.equal(updatedTelemetry.lastError, "Test error notice");

  // Verify secret sanitization prevents leakage
  const rawLeakMessage = "Google API call failed with key AIzaSyA12345678901234567890123456789012 and token xyz";
  const sanitized = sanitizeErrorMessage(rawLeakMessage);
  assert.equal(sanitized.includes("AIzaSyA12345678901234567890123456789012"), false);
  assert.ok(sanitized.includes("[REDACTED_API_KEY]"));
});


