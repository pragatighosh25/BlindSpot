import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  AnalysisOutput,
  AnalysisOutputSchema,
  WeakTopic,
  RecommendedProblem,
} from "@/schemas/analysis.schema";
import {
  SubmissionDiagnosis,
  SubmissionDiagnosisSchema,
} from "./types";
import { diagnoseSubmissionPattern } from "./agent";
import { SYSTEM_PROMPT, buildSingleSubmissionPrompt } from "./prompts";
import { invokeLLM, extractJsonFromResponse } from "./llm";
import {
  getUserSubmissions,
  getFailedSubmissions,
  searchPastMistakes,
  saveAnalysis,
} from "./tools";
import { saveSubmission } from "@/services/opensearch";

/**
 * Curated pedagogical problem bank addressing algorithmic failure modes
 */
const TOPIC_PROBLEM_BANK: Record<string, RecommendedProblem[]> = {
  "binary search": [
    {
      platform: "leetcode",
      problem_id: "704",
      title: "Binary Search",
      difficulty: "Easy",
      topic: "Binary Search",
      reason: "Reinforce strict left <= right loop invariants and exact target matching on single-element boundaries.",
      url: "https://leetcode.com/problems/binary-search/",
    },
    {
      platform: "leetcode",
      problem_id: "35",
      title: "Search Insert Position",
      difficulty: "Easy",
      topic: "Binary Search",
      reason: "Practice lower_bound invariant preservation when target is not present in array.",
      url: "https://leetcode.com/problems/search-insert-position/",
    },
    {
      platform: "leetcode",
      problem_id: "875",
      title: "Koko Eating Bananas",
      difficulty: "Medium",
      topic: "Binary Search",
      reason: "Master monotonic condition predicate search (binary search on answer space).",
      url: "https://leetcode.com/problems/koko-eating-bananas/",
    },
  ],
  "dynamic programming": [
    {
      platform: "leetcode",
      problem_id: "198",
      title: "House Robber",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      reason: "Master non-adjacent optimal substructure recurrence dp[i] = max(dp[i-1], dp[i-2] + nums[i]).",
      url: "https://leetcode.com/problems/house-robber/",
    },
    {
      platform: "leetcode",
      problem_id: "300",
      title: "Longest Increasing Subsequence",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      reason: "Build intuition for precise 1D DP state formulation dp[i] = length of LIS ending strictly at index i.",
      url: "https://leetcode.com/problems/longest-increasing-subsequence/",
    },
    {
      platform: "leetcode",
      problem_id: "322",
      title: "Coin Change",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      reason: "Practice memoized unbounded knapsack state transitions to eliminate exponential call overhead.",
      url: "https://leetcode.com/problems/coin-change/",
    },
  ],
  "graphs": [
    {
      platform: "leetcode",
      problem_id: "200",
      title: "Number of Islands",
      difficulty: "Medium",
      topic: "Graphs",
      reason: "Master immediate queue-enqueue visited marking in 2D grid BFS to prevent redundant node expansions.",
      url: "https://leetcode.com/problems/number-of-islands/",
    },
    {
      platform: "leetcode",
      problem_id: "785",
      title: "Is Graph Bipartite?",
      difficulty: "Medium",
      topic: "Graphs",
      reason: "Reinforce two-coloring state tracking across disconnected graph components.",
      url: "https://leetcode.com/problems/is-graph-bipartite/",
    },
  ],
  "sliding window": [
    {
      platform: "leetcode",
      problem_id: "3",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      topic: "Sliding Window",
      reason: "Fix window shrink logic using left = max(left, seen[char] + 1) to prevent left pointer backwards regression.",
      url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    },
    {
      platform: "leetcode",
      problem_id: "209",
      title: "Minimum Size Subarray Sum",
      difficulty: "Medium",
      topic: "Sliding Window",
      reason: "Practice dynamic window expansion and greedy contraction with while loops.",
      url: "https://leetcode.com/problems/minimum-size-subarray-sum/",
    },
  ],
};

/**
 * Diagnoses a single submission using Strands reasoning + OpenSearch historical context + LLM (with deterministic expert fallback)
 */
export async function analyzeSingleSubmissionWithStrands(
  submission: CanonicalSubmission,
  userId = "default_user"
): Promise<SubmissionDiagnosis> {
  const isFailure = submission.submission.verdict !== "AC";
  const primaryTopic = submission.problem.topic_tags[0] || "General";

  if (!isFailure) {
    return diagnoseSubmissionPattern(submission);
  }

  // Retrieve similar historical mistakes from OpenSearch to provide grounding context
  let pastMistakes: CanonicalSubmission[] = [];
  try {
    pastMistakes = await searchPastMistakes(primaryTopic, submission.submission.verdict, userId);
    // Exclude the current submission itself
    pastMistakes = pastMistakes.filter((m) => m.submission_id !== submission.submission_id);
  } catch (err) {
    console.warn(`[Strands OpenSearch retrieval note]: ${(err as Error).message}`);
  }

  // Build prompt with historical context
  const prompt = buildSingleSubmissionPrompt(submission, pastMistakes);

  try {
    const rawLlmResponse = await invokeLLM(SYSTEM_PROMPT, prompt, {
      temperature: 0.1,
      maxTokens: 2048,
    });

    if (rawLlmResponse) {
      const parsedJson = extractJsonFromResponse<SubmissionDiagnosis>(rawLlmResponse);
      const validated = SubmissionDiagnosisSchema.safeParse(parsedJson);
      if (validated.success) {
        return validated.data;
      }
    }
  } catch (err) {
    console.warn(`[Strands LLM diagnosis note]: ${(err as Error).message}. Using expert rule engine.`);
  }

  // Deterministic expert engine fallback
  return diagnoseSubmissionPattern(submission);
}

/**
 * Main Strands Agent Orchestrator for analyzing a user's real submission history
 */
export async function runStrandsUserAnalysis(userId = "default_user"): Promise<AnalysisOutput> {
  console.log(`[Strands Agent] Starting intelligent analysis for user: ${userId}`);

  // Step 1: Fetch user's real submissions
  const allSubmissions = await getUserSubmissions(userId);
  const failedSubmissions = allSubmissions.filter((s) => s.submission.verdict !== "AC");

  console.log(
    `[Strands Agent] Retrieved ${allSubmissions.length} submissions (${failedSubmissions.length} failed) for user: ${userId}`
  );

  // Case 1: Empty history
  if (allSubmissions.length === 0) {
    const emptyOutput: AnalysisOutput = {
      user_id: userId,
      analyzed_at: Date.now(),
      summary: "No submission history found for this account. Ingest or sync submissions from LeetCode or Codeforces to begin blind spot diagnosis.",
      weak_topics: [],
      recommended_problems: [
        {
          platform: "leetcode",
          problem_id: "704",
          title: "Binary Search",
          difficulty: "Easy",
          topic: "Binary Search",
          reason: "Foundational baseline problem to assess loop invariants and search boundaries.",
          url: "https://leetcode.com/problems/binary-search/",
        },
        {
          platform: "leetcode",
          problem_id: "198",
          title: "House Robber",
          difficulty: "Medium",
          topic: "Dynamic Programming",
          reason: "Foundational problem to assess optimal substructure state recurrence definition.",
          url: "https://leetcode.com/problems/house-robber/",
        },
      ],
    };
    await saveAnalysis(userId, emptyOutput);
    return AnalysisOutputSchema.parse(emptyOutput);
  }

  // Case 2: All submissions Accepted (No failures)
  if (failedSubmissions.length === 0) {
    const cleanOutput: AnalysisOutput = {
      user_id: userId,
      analyzed_at: Date.now(),
      summary: `Analyzed ${allSubmissions.length} submissions. Outstanding performance! All analyzed submissions have an Accepted (AC) verdict. No recurring algorithmic blind spots detected.`,
      weak_topics: [],
      recommended_problems: [
        {
          platform: "leetcode",
          problem_id: "300",
          title: "Longest Increasing Subsequence",
          difficulty: "Medium",
          topic: "Dynamic Programming",
          reason: "Advance your mastery with O(N log N) patience sorting / binary search state transitions.",
          url: "https://leetcode.com/problems/longest-increasing-subsequence/",
        },
      ],
    };
    await saveAnalysis(userId, cleanOutput);
    return AnalysisOutputSchema.parse(cleanOutput);
  }

  // Step 2: Prioritize and process failed submissions (limit to 30 most recent to manage latency & budget)
  const prioritizedFailures = failedSubmissions
    .sort((a, b) => b.submission.timestamp - a.submission.timestamp)
    .slice(0, 30);

  // Step 3: Run Strands diagnosis on each failed submission
  const diagnoses: { submission: CanonicalSubmission; diagnosis: SubmissionDiagnosis }[] = [];

  for (const sub of prioritizedFailures) {
    const diag = await analyzeSingleSubmissionWithStrands(sub, userId);
    diagnoses.push({ submission: sub, diagnosis: diag });
    // Persist rich diagnosis directly to OpenSearch submission document
    try {
      await saveSubmission(sub, diag);
    } catch {}
  }

  // Step 4: Group diagnoses by topic and identify recurring patterns vs single mistakes
  const topicMap = new Map<
    string,
    {
      diagnoses: SubmissionDiagnosis[];
      subIds: string[];
    }
  >();

  for (const { submission, diagnosis } of diagnoses) {
    const topic = diagnosis.topic || submission.problem.topic_tags[0] || "General Algorithms";
    if (!topicMap.has(topic)) {
      topicMap.set(topic, { diagnoses: [], subIds: [] });
    }
    const entry = topicMap.get(topic)!;
    entry.diagnoses.push(diagnosis);
    if (!entry.subIds.includes(submission.submission_id)) {
      entry.subIds.push(submission.submission_id);
    }
  }

  const weakTopics: WeakTopic[] = [];
  const recommendedProblems: RecommendedProblem[] = [];
  const seenRecProblemIds = new Set<string>();

  for (const [topic, { diagnoses: topicDiags, subIds }] of topicMap.entries()) {
    // Tally failure modes within this topic
    const modeStats = new Map<
      string,
      {
        count: number;
        totalConf: number;
        exemplar: SubmissionDiagnosis;
      }
    >();

    for (const d of topicDiags) {
      const mode = d.failure_pattern;
      if (!modeStats.has(mode)) {
        modeStats.set(mode, {
          count: 0,
          totalConf: 0,
          exemplar: d,
        });
      }
      const stat = modeStats.get(mode)!;
      stat.count += 1;
      stat.totalConf += d.confidence;
      if (d.confidence > stat.exemplar.confidence) {
        stat.exemplar = d;
      }
    }

    // Identify dominant failure pattern
    let topMode = "unknown";
    let maxCount = 0;
    let avgConf = 0.6;
    let topExemplar: SubmissionDiagnosis | null = null;

    for (const [mode, stat] of modeStats.entries()) {
      if (stat.count > maxCount) {
        maxCount = stat.count;
        topMode = mode;
        avgConf = stat.totalConf / stat.count;
        topExemplar = stat.exemplar;
      }
    }

    if (maxCount >= 1 && topExemplar) {
      // Calculate grounded confidence
      const confidence = Math.min(
        0.98,
        Math.max(0.65, Math.round((avgConf + (maxCount > 1 ? 0.05 * Math.min(maxCount, 3) : 0)) * 100) / 100)
      );

      weakTopics.push({
        topic,
        failure_mode: topExemplar.failure_mode || topMode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        confidence,
        evidence_count: maxCount,
        example_submissions: subIds.slice(0, 5),
        description: `Detected ${maxCount} failure ${maxCount === 1 ? "occurrence" : "occurrences"} exhibiting ${topExemplar.failure_mode.toLowerCase()}.`,
        root_cause: topExemplar.root_cause,
        why_it_fails: topExemplar.why_it_fails,
        correct_concept: topExemplar.correct_concept,
        suggested_fix: topExemplar.suggested_fix,
      });

      // Match recommended problems targeted to this weak topic
      const normalizedTopic = topic.toLowerCase();
      let matchedBankProblems: RecommendedProblem[] = [];

      for (const [bankTopic, bankList] of Object.entries(TOPIC_PROBLEM_BANK)) {
        if (normalizedTopic.includes(bankTopic) || bankTopic.includes(normalizedTopic)) {
          matchedBankProblems = bankList;
          break;
        }
      }

      if (matchedBankProblems.length === 0) {
        matchedBankProblems = TOPIC_PROBLEM_BANK["binary search"];
      }

      for (const p of matchedBankProblems) {
        if (!seenRecProblemIds.has(p.problem_id)) {
          seenRecProblemIds.add(p.problem_id);
          recommendedProblems.push(p);
          if (recommendedProblems.length >= 6) break;
        }
      }
    }
  }

  // Sort weaknesses by evidence count descending
  weakTopics.sort((a, b) => b.evidence_count - a.evidence_count);

  const summary = `Strands Agent analyzed ${allSubmissions.length} submissions (${failedSubmissions.length} failed) for user '${userId}'. Identified ${weakTopics.length} algorithmic blind spots with ${weakTopics.reduce((acc, w) => acc + w.evidence_count, 0)} total failure evidence samples.`;

  const output: AnalysisOutput = {
    user_id: userId,
    analyzed_at: Date.now(),
    summary,
    weak_topics: weakTopics,
    recommended_problems: recommendedProblems,
  };

  const validatedOutput = AnalysisOutputSchema.parse(output);

  // Step 5: Save structured result to DynamoDB
  await saveAnalysis(userId, validatedOutput);
  console.log(`[Strands Agent] Analysis completed & persisted for user: ${userId}`);

  return validatedOutput;
}
