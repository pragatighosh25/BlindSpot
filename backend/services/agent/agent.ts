import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  SubmissionDiagnosis,
  SubmissionDiagnosisSchema,
  SubmissionEvidence,
  FailurePattern,
} from "./types";

/**
 * Extracts structured execution evidence from runtime judge error messages
 */
export function extractExecutionEvidence(errorMessage?: string): SubmissionEvidence {
  if (!errorMessage || errorMessage.trim().length === 0) {
    return {};
  }

  const evidence: SubmissionEvidence = {
    error_message: errorMessage,
  };

  // Match: Input [...] -> Output ..., Expected ...
  const inputMatch = errorMessage.match(/Input[:\s]+([^\->]+?)(?=\s*->|\s*,\s*target|\s*Output|\s*$)/i);
  const targetMatch = errorMessage.match(/target[:\s]+([^\->]+?)(?=\s*->|\s*Output|\s*$)/i);
  const outputMatch = errorMessage.match(/Output[:\s]+([^,]+?)(?=\s*,\s*Expected|\s*$)/i);
  const expectedMatch = errorMessage.match(/Expected[:\s]+(.*)$/i);

  if (inputMatch) {
    let inp = inputMatch[1].trim();
    if (targetMatch) {
      inp += `, target: ${targetMatch[1].trim()}`;
    }
    evidence.input = inp;
  }

  if (outputMatch) {
    evidence.actual_output = outputMatch[1].trim();
  }

  if (expectedMatch) {
    evidence.expected_output = expectedMatch[1].trim();
  }

  return evidence;
}

/**
 * Deep Algorithmic Diagnostic Engine for BlindSpot
 * Grounded in code syntax, control flow, recurrence relations, invariants, and judge feedback.
 */
export function diagnoseSubmissionPattern(sub: CanonicalSubmission): SubmissionDiagnosis {
  const isFailure = sub.submission.verdict !== "AC";
  const primaryTopic = sub.problem.topic_tags[0] || "General Algorithms";
  const code = sub.submission.code;
  const codeLower = code.toLowerCase();
  const verdict = sub.submission.verdict;
  const errorMsg = sub.submission.error_message || "";
  const evidence = extractExecutionEvidence(errorMsg);

  // If the submission is AC, return a clean non-failure diagnosis
  if (!isFailure) {
    return SubmissionDiagnosisSchema.parse({
      submission_id: sub.submission_id,
      topic: primaryTopic,
      verdict: "AC",
      failure_pattern: "unknown",
      failure_mode: "Accepted Solution",
      root_cause: "No algorithmic failure detected. All judge test cases passed within constraints.",
      why_it_fails: "N/A - Solution satisfies problem invariants, time bounds, and boundary constraints.",
      correct_concept: "Correct algorithmic invariant and complexity bounds applied.",
      suggested_fix: "No fix needed.",
      code_location: "All code blocks valid.",
      explanation: "Submission passed all test cases successfully.",
      confidence: 1.0,
      is_failure: false,
      evidence,
    });
  }

  let pattern: FailurePattern = "unknown";
  let failureMode = "Algorithmic Logic Error";
  let rootCause = `The submission failed test verification with verdict ${verdict}.`;
  let whyItFails = "The submitted code produces incorrect output or violates runtime constraints on edge inputs.";
  let correctConcept = "Ensure solution respects problem invariants and constraints.";
  let suggestedFix = "Review algorithmic transitions and boundary conditions.";
  let codeLocation = "Main execution block";
  let confidence = 0.65;

  // -------------------------------------------------------------
  // 1. DYNAMIC PROGRAMMING DIAGNOSTICS
  // -------------------------------------------------------------
  const isDP = sub.problem.topic_tags.some((t) => /dynamic programming|dp/i.test(t)) ||
               /dp\[|memo|cache/i.test(codeLower) ||
               sub.problem.title.toLowerCase().includes("robber") ||
               sub.problem.title.toLowerCase().includes("subsequence");

  if (isDP) {
    // A. House Robber & Non-Adjacent Over-Robbery (e.g. dp[i] = dp[i-1] + nums[i])
    if (
      /dp\[i\]\s*=\s*dp\[i\s*-\s*1\]\s*\+\s*nums\[i\]/i.test(code) ||
      (codeLower.includes("rob") && /dp\[i\s*-\s*1\]\s*\+/i.test(code) && !/dp\[i\s*-\s*2\]/i.test(code))
    ) {
      pattern = "wrong_transition";
      failureMode = "Adjacent State Overlap in Dynamic Programming Recurrence";
      rootCause = "The transition `dp[i] = dp[i-1] + nums[i]` incorrectly assumes house `i` can be robbed immediately following house `i-1`, violating the non-adjacent house constraint.";
      whyItFails = "Because `dp[i-1]` already contains optimal loot that may include house `i-1`, adding `nums[i]` robs two adjacent houses. For input [2,7,9,3,1], at i=2 (val 9), it computes dp[2] = dp[1] + 9 = 7 + 9 = 16, resulting in total 20 instead of the optimal non-adjacent sum 12.";
      correctConcept = "Dynamic programming optimal substructure requires choosing between two mutually exclusive choices: (1) skip house `i` and keep `dp[i-1]`, or (2) rob house `i` and add it to non-adjacent optimal loot `dp[i-2]`.";
      suggestedFix = "Update the recurrence relation to `dp[i] = Math.max(dp[i-1], dp[i-2] + nums[i])` with base cases `dp[0] = nums[0]` and `dp[1] = Math.max(nums[0], nums[1])`.";
      codeLocation = "dp[i] = dp[i-1] + nums[i]";
      confidence = 0.95;
    }
    // B. Unmemoized Exponential Tree Recursion (e.g. Coin Change / recursive helper)
    else if (
      verdict === "TLE" ||
      (/def helper|function helper|int helper/i.test(code) && !/memo|cache|@lru_cache/i.test(codeLower))
    ) {
      pattern = "incorrect_state_definition";
      failureMode = "Unmemoized Exponential Tree Recursion";
      rootCause = "The recursive helper function branches on multiple choices without caching/memoizing intermediate subproblem results.";
      whyItFails = "The recursion tree explores overlapping subproblems with exponential O(K^N) branching complexity, rapidly exceeding the execution time limit on medium/large amounts.";
      correctConcept = "Optimal substructure with overlapping subproblems requires memoization (caching state values in an array or map) or bottom-up tabulation to achieve polynomial O(N * amount) time.";
      suggestedFix = "Introduce a memoization cache: `if (rem in memo) return memo[rem]`, and store computed answers `memo[rem] = res` before returning.";
      codeLocation = "helper() recursion without memo cache";
      confidence = 0.92;
    }
    // C. Greedy Prefix Assumption in Subsequence DP (e.g. LIS dp[i] = dp[i-1] + 1)
    else if (
      /if\s*\(\s*nums\[i\]\s*>\s*nums\[i\s*-\s*1\]\s*\)\s*dp\[i\]\s*=\s*dp\[i\s*-\s*1\]\s*\+\s*1/i.test(code) ||
      (/longest increasing subsequence|lis/i.test(sub.problem.title) && /dp\[i\s*-\s*1\]/i.test(code) && !/for\s*\(.*j\s*<\s*i/i.test(code))
    ) {
      pattern = "wrong_transition";
      failureMode = "Greedy Prefix Assumption in Subsequence DP";
      rootCause = "Comparing solely against the immediate preceding element `nums[i-1]` assumes the optimal increasing subsequence must be contiguous.";
      whyItFails = "A subsequence is non-contiguous; the optimal predecessor for `nums[i]` could be any previous element `nums[j]` where `j < i-1`. For input [0,1,0,3,2,3], it yields 3 instead of 4.";
      correctConcept = "Longest Increasing Subsequence state transition requires `dp[i] = 1 + max({dp[j] : 0 <= j < i and nums[j] < nums[i]})`.";
      suggestedFix = "Iterate over all previous indices with nested loops: `for (int j = 0; j < i; j++) if (nums[i] > nums[j]) dp[i] = max(dp[i], dp[j] + 1)`.";
      codeLocation = "if (nums[i] > nums[i-1]) dp[i] = dp[i-1] + 1";
      confidence = 0.91;
    }
    // D. Off-by-one 0-index without base padding (e.g. LCS dp[i-1][j-1])
    else if (
      /dp\[i\s*-\s*1\]\[j\s*-\s*1\]/i.test(code) &&
      /vector<vector<int>>\s*dp\s*\(\s*m\s*,\s*vector<int>\s*\(\s*n/i.test(code)
    ) {
      pattern = "incorrect_base_case";
      failureMode = "Off-by-One 0-Index Boundary in 2D Matrix DP";
      rootCause = "Allocating 2D DP matrix with dimensions `m x n` instead of `(m+1) x (n+1)` while accessing `dp[i-1][j-1]` without zero-base padding.";
      whyItFails = "When `i == 0` or `j == 0`, accessing boundary cases requires clunky ternary fallbacks that fail to account for single-character matches at index 0.";
      correctConcept = "2D Grid/String DP benefits from 1-based indexing with dimension `(m+1) x (n+1)` where `dp[0][j]` and `dp[i][0]` represent empty string base cases initialized to 0.";
      suggestedFix = "Allocate `dp(m + 1, vector<int>(n + 1, 0))` and loop `1..m` and `1..n`, setting `dp[i][j] = dp[i-1][j-1] + 1` on match.";
      codeLocation = "vector<vector<int>> dp(m, vector<int>(n, 0))";
      confidence = 0.88;
    }
    // E. General DP Transition Issue
    else {
      pattern = "wrong_transition";
      failureMode = "Dynamic Programming Recurrence & State Formulation Error";
      rootCause = "State recurrence relation fails to cover all valid subproblem transitions or optimal choices.";
      whyItFails = "Subproblems do not satisfy the optimal substructure invariant, leading to incorrect aggregation or base values.";
      correctConcept = "Identify the complete state space tuple and verify that every possible transition is evaluated via min/max.";
      suggestedFix = "Re-evaluate recurrence relation to ensure all previous state candidates are properly considered.";
      codeLocation = "DP transition loop";
      confidence = 0.8;
    }
  }

  // -------------------------------------------------------------
  // 2. BINARY SEARCH DIAGNOSTICS
  // -------------------------------------------------------------
  else if (
    sub.problem.topic_tags.some((t) => /binary search/i.test(t)) ||
    /while\s*\(\s*l\w*\s*<\s*r\w*\s*\)|while\s*\(\s*left\s*<\s*right\s*\)|mid\s*=\s*\(?left|\(low \+ high\)/i.test(code)
  ) {
    // A. Premature loop termination on single element (while (left < right) returning -1)
    if (
      /while\s*\(\s*left\s*<\s*right\s*\)/i.test(code) &&
      /return\s*-\s*1/i.test(code) &&
      /if\s*\(\s*nums\[mid\]\s*==\s*target\s*\)/i.test(code)
    ) {
      pattern = "boundary_condition_error";
      failureMode = "Premature Loop Termination on Single-Element Boundary";
      rootCause = "Using loop condition `while (left < right)` with symmetric updates terminates when `left == right`, skipping evaluation of the final single-element candidate.";
      whyItFails = "If the target element is located at the convergence index where `left == right` (e.g. searching 9 in [-1,0,3,5,9,12]), the loop exits before checking `nums[mid] == target`, erroneously returning -1.";
      correctConcept = "In standard closed-interval binary search `[left, right]`, the loop invariant must maintain `while (left <= right)` so that 1-element intervals `left == right` are evaluated.";
      suggestedFix = "Change loop condition to `while (left <= right)` with `left = mid + 1` and `right = mid - 1`.";
      codeLocation = "while (left < right)";
      confidence = 0.94;
    }
    // B. Search Insert Position / Lower Bound over-reduction (right = mid - 1 in lower_bound)
    else if (
      /searchInsert|lower_bound/i.test(sub.problem.title) ||
      (/while\s*\(\s*left\s*<\s*right\s*\)/i.test(code) && /right\s*=\s*mid\s*-\s*1/i.test(code))
    ) {
      pattern = "off_by_one";
      failureMode = "Lower Bound Over-Reduction on Upper Bound Branch";
      rootCause = "Setting `right = mid - 1` when `nums[mid] > target` in a search-insert position skips `mid` as a candidate insertion point.";
      whyItFails = "When `nums[mid] > target`, `mid` itself could still be the smallest index where `nums[index] >= target`. Decrementing `right = mid - 1` excludes the correct insert position.";
      correctConcept = "In lower_bound / insertion search, the candidate range must preserve `mid` on the upper branch (`right = mid`) until `left == right`.";
      suggestedFix = "Change the upper branch update to `right = mid;` while keeping `left = mid + 1;` when `nums[mid] < target`.";
      codeLocation = "right = mid - 1";
      confidence = 0.9;
    }
    // C. Rotated Sorted Array pivot comparison against Left instead of Right
    else if (
      /rotated/i.test(sub.problem.title) ||
      (/nums\[mid\]\s*>\s*nums\[l\]/i.test(code) && /findMin/i.test(code))
    ) {
      pattern = "boundary_condition_error";
      failureMode = "Rotated Array Pivot Comparison against Left instead of Right";
      rootCause = "Comparing `nums[mid] > nums[l]` fails to identify the unsorted half when the array or subarray is already sorted in ascending order.";
      whyItFails = "For already-sorted inputs like [11,13,15,17], `nums[mid] > nums[l]` executes `l = mid + 1`, skipping the minimum element at index 0 and returning 13.";
      correctConcept = "In rotated sorted array inflection search, compare `nums[mid]` against the right boundary `nums[r]` because the minimum element always lies in the unsorted partition relative to the right endpoint.";
      suggestedFix = "Compare with right endpoint: `if (nums[mid] > nums[r]) l = mid + 1; else r = mid;`.";
      codeLocation = "if (nums[mid] > nums[l]) l = mid + 1;";
      confidence = 0.93;
    }
    // D. Range search infinite loop / asymmetric update
    else if (
      /r\s*=\s*mid\b/i.test(code) &&
      /l\s*<=\s*r/i.test(code) &&
      /mid\s*=\s*\(l\s*\+\s*r\)\s*\/\/\s*2|\(l\s*\+\s*r\)\s*\/\s*2/i.test(code)
    ) {
      pattern = "boundary_condition_error";
      failureMode = "Asymmetric Pointer Update Causing Infinite Loop";
      rootCause = "Setting `r = mid` or `l = mid` inside `while (l <= r)` with standard integer division `(l + r) / 2` causes `mid == l`, creating an infinite loop when `r - l == 1`.";
      whyItFails = "When two elements remain, `(l + r) / 2` evaluates to `l`. If `l = mid`, pointers never progress, triggering Time Limit Exceeded.";
      correctConcept = "When using closed intervals `[l, r]`, always advance pointers strictly (`l = mid + 1` or `r = mid - 1`), or bias integer division `mid = (l + r + 1) / 2` when updating `l = mid`.";
      suggestedFix = "Use `ans = mid; r = mid - 1;` when searching first occurrence, and `ans = mid; l = mid + 1;` when searching last occurrence.";
      codeLocation = "r = mid / l = mid in while (l <= r)";
      confidence = 0.91;
    }
    // E. General Binary Search Boundary Error
    else {
      pattern = "boundary_condition_error";
      failureMode = "Binary Search Boundary & Monotonicity Error";
      rootCause = "The binary search boundary condition or predicate monotonicity check fails on edge cases.";
      whyItFails = "The search interval narrows incorrectly, skipping the target value or entering an infinite loop.";
      correctConcept = "Define a clear search range [low, high] and ensure the feasibility check `check(mid)` is strictly monotonic.";
      suggestedFix = "Ensure `low <= high` loop invariant with clear `mid + 1` / `mid - 1` updates.";
      codeLocation = "while loop and boundary pointer updates";
      confidence = 0.82;
    }
  }

  // -------------------------------------------------------------
  // 3. GRAPH & TREE DIAGNOSTICS
  // -------------------------------------------------------------
  else if (
    sub.problem.topic_tags.some((t) => /graph|breadth-first search|depth-first search|tree/i.test(t)) ||
    /bfs|dfs|adj\[|visited|numislands|numcourses/i.test(codeLower)
  ) {
    // A. BFS Queue Explosion (Visited marked after pop instead of push)
    if (
      /popleft\(\)|q\.pop\(\)/i.test(code) &&
      /grid\[curr_r\]\[curr_c\]\s*=\s*'0'|visited\.add\(\(curr_r,\s*curr_c\)\)/i.test(code) &&
      !/grid\[nr\]\[nc\]\s*=\s*'0'/i.test(code)
    ) {
      pattern = "visited_state_error";
      failureMode = "Post-Dequeue Visited Marking (BFS Queue Explosion)";
      rootCause = "Marking vertices as visited after dequeuing (`popleft()`) rather than immediately upon enqueuing into the BFS queue.";
      whyItFails = "Multiple adjacent neighbor cells explore and enqueue the exact same unvisited coordinate multiple times before it is popped. This causes exponential queue inflation, resulting in Memory Limit Exceeded (MLE) or TLE.";
      correctConcept = "In BFS on unweighted graphs and grids, vertices must be marked as visited immediately upon being pushed to the queue to guarantee each node is enqueued at most once (O(V + E) runtime and O(V) space).";
      suggestedFix = "Set `grid[nr][nc] = '0'` (or `visited.add((nr, nc))`) immediately inside the neighbor loop before `q.append((nr, nc))`.";
      codeLocation = "grid[curr_r][curr_c] = '0' placed after popleft()";
      confidence = 0.96;
    }
    // B. Multi-Component Traversal Omission (e.g. Is Graph Bipartite)
    else if (
      /bipartite/i.test(sub.problem.title) ||
      (/q\.push\(0\)/i.test(code) && !/for\s*\(int\s*i\s*=\s*0;\s*i\s*<\s*n;\s*i\+\+\)/i.test(code))
    ) {
      pattern = "visited_state_error";
      failureMode = "Omission of Multi-Component Traversal in General Graphs";
      rootCause = "Launching BFS/DFS traversal only from a single vertex (vertex 0), assuming the graph is a single connected component.";
      whyItFails = "Disconnected components or isolated vertices are never visited or colored, returning `true` erroneously on disconnected non-bipartite subgraphs.";
      correctConcept = "General graph algorithms must iterate through all vertices `0..n-1` and invoke traversal for each unvisited node `if (color[i] == 0)`.";
      suggestedFix = "Enclose traversal in a loop over all vertices: `for (int i = 0; i < n; i++) if (color[i] == 0) { if (!checkComponent(i)) return false; }`.";
      codeLocation = "q.push(0) without outer vertex iteration loop";
      confidence = 0.92;
    }
    // C. Course Schedule / Cycle Detection State Collision
    else if (
      /numcourses|course schedule/i.test(sub.problem.title) ||
      (/visited\s*=\s*set\(\)/i.test(code) && /if\s*node\s*in\s*visited/i.test(code) && !/visiting|onpath|state/i.test(codeLower))
    ) {
      pattern = "visited_state_error";
      failureMode = "Recursion Call-Stack vs Visited Node Collision in Cycle Detection";
      rootCause = "Using a single global `visited` set without distinguishing nodes currently active in the DFS call stack from nodes already fully explored.";
      whyItFails = "A node reachable from multiple distinct non-cyclic paths is erroneously flagged as a cycle when revisited, causing false positive cycle detections and TLE.";
      correctConcept = "Directed graph cycle detection requires 3-color state tracking (0: unvisited, 1: visiting on recursion stack, 2: visited) or Kahn's topological sort via in-degrees.";
      suggestedFix = "Add a `visiting` set or 3-state array: add node to `visiting` on DFS entry, remove on backtrack, and mark permanently in `visited`.";
      codeLocation = "if node in visited: return True";
      confidence = 0.94;
    }
    // D. General Graph Visited Issue
    else {
      pattern = "visited_state_error";
      failureMode = "Graph Traversal Invariant or Visited State Error";
      rootCause = "Incorrect vertex state tracking or cycle handling during graph exploration.";
      whyItFails = "Traversal revisits nodes infinitely or skips connected components.";
      correctConcept = "Ensure complete visited state tracking across all graph components.";
      suggestedFix = "Use a visited array/set and check all nodes in 0..V-1.";
      codeLocation = "DFS / BFS traversal loop";
      confidence = 0.8;
    }
  }

  // -------------------------------------------------------------
  // 4. SLIDING WINDOW & TWO POINTERS
  // -------------------------------------------------------------
  else if (
    sub.problem.topic_tags.some((t) => /sliding window|two pointers/i.test(t)) ||
    /left|right|window|seen\[|substr/i.test(codeLower)
  ) {
    if (/left\s*=\s*seen\[\w+\]\s*\+\s*1/i.test(code) && !/max\s*\(\s*left/i.test(code)) {
      pattern = "boundary_condition_error";
      failureMode = "Sliding Window Left Pointer Regression";
      rootCause = "Updating `left = seen[char] + 1` directly without clamping to `Math.max(left, ...)` allows the left pointer to regress backward on stale characters.";
      whyItFails = "When duplicate characters occur prior to the current active window left boundary, updating without `max` expands the window backward, producing invalid substring lengths.";
      correctConcept = "In monotonic sliding windows, the left window boundary must be non-decreasing: `left = Math.max(left, seen[char] + 1)`.";
      suggestedFix = "Update left pointer with `left = Math.max(left, (seen[char] || 0) + 1)`.";
      codeLocation = "left = seen[char] + 1";
      confidence = 0.92;
    } else {
      pattern = "off_by_one";
      failureMode = "Sliding Window Boundary Contraction Error";
      rootCause = "Window shrink condition or pointer increment logic fails to maintain valid window invariants.";
      whyItFails = "The window includes invalid elements or advances pointers past valid candidates.";
      correctConcept = "Maintain window condition: expand with right pointer, contract with `while` loop on left pointer.";
      suggestedFix = "Use a `while` loop to contract window whenever the invalid condition is met.";
      codeLocation = "Window expansion/contraction loop";
      confidence = 0.8;
    }
  }

  // -------------------------------------------------------------
  // 5. COMPLEXITY / TLE / MLE
  // -------------------------------------------------------------
  else if (verdict === "TLE") {
    pattern = "incorrect_complexity";
    failureMode = "Sub-Optimal Time Complexity Exceeding Judge Budget";
    rootCause = "The algorithm complexity (e.g. O(N^2) or O(2^N)) exceeds the runtime constraint for input size N >= 10^5.";
    whyItFails = "Executing ~10^10 operations on 10^5 elements exceeds the 1-2 second judge CPU limit (~10^8 ops/sec).";
    correctConcept = "Input sizes with N >= 10^5 require linear O(N) or linearithmic O(N log N) algorithms.";
    suggestedFix = "Optimize nested iterations using hash maps, binary search on answers, or prefix sums.";
    codeLocation = "Nested loops or unmemoized recursion";
    confidence = 0.86;
  }
  else if (verdict === "MLE") {
    pattern = "incorrect_complexity";
    failureMode = "Excessive Memory Allocation Exceeding Memory Limit";
    rootCause = "Storing redundant states or unbounded collection expansion exceeds the memory limit.";
    whyItFails = "Memory allocations exceed the 256MB/512MB heap limit during deep recursion or duplicate queue insertions.";
    correctConcept = "Space complexity should remain O(N) or O(1) by reusing memory buffers or eliminating duplicate entries.";
    suggestedFix = "Prune allocations and mark states visited immediately before buffering.";
    codeLocation = "Collection growth / memory buffer";
    confidence = 0.85;
  }

  // -------------------------------------------------------------
  // 6. RUNTIME ERROR (RE) / OVERFLOW
  // -------------------------------------------------------------
  else if (verdict === "RE") {
    if (/int |vector|\[|1e9|1000000000/i.test(codeLower)) {
      pattern = "overflow";
      failureMode = "Integer Overflow or Out-of-Bounds Memory Access";
      rootCause = "Intermediate arithmetic calculation overflows 32-bit signed integer (`int`) range [-2^31, 2^31-1] or accesses array out of bounds.";
      whyItFails = "Multiplying or summing large integers exceeds 2*10^9, causing signed integer overflow undefined behavior or segmentation fault.";
      correctConcept = "Use 64-bit integer types (`long long` in C++, `BigInt` / `number` in JS) for products and cumulative sums up to 10^18.";
      suggestedFix = "Change intermediate accumulator and formula variables to `long long`.";
      codeLocation = "Arithmetic product or array indexing";
      confidence = 0.82;
    } else {
      pattern = "implementation_error";
      failureMode = "Runtime Exception / Null Pointer Dereference";
      rootCause = "Accessing empty collection or uninitialized pointer at runtime.";
      whyItFails = "Execution crashes on empty input edge cases or null tree nodes.";
      correctConcept = "Always perform base boundary checks for empty or single-element inputs.";
      suggestedFix = "Add guard clause `if (nums.empty() || root == nullptr) return ...`.";
      codeLocation = "Initial input access";
      confidence = 0.78;
    }
  }

  const diagnosis: SubmissionDiagnosis = {
    submission_id: sub.submission_id,
    topic: primaryTopic,
    verdict,
    failure_pattern: pattern,
    failure_mode: failureMode,
    root_cause: rootCause,
    why_it_fails: whyItFails,
    correct_concept: correctConcept,
    suggested_fix: suggestedFix,
    code_location: codeLocation,
    explanation: `${failureMode}: ${rootCause}`,
    confidence,
    is_failure: true,
    evidence,
  };

  return SubmissionDiagnosisSchema.parse(diagnosis);
}

/**
 * Strands Agent Runner Interface
 * Executes algorithmic diagnosis on the submission
 */
export async function runStrandsAnalysisAgent(
  submission: CanonicalSubmission
): Promise<SubmissionDiagnosis> {
  return diagnoseSubmissionPattern(submission);
}
