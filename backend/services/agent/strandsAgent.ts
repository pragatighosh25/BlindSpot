import { CanonicalSubmission } from "@/schemas/submission.schema";
import {
  AnalysisOutput,
  AnalysisOutputSchema,
  WeakTopic,
  RecommendedProblem,
  RecommendedProblemSchema,
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
 * Dynamically generates targeted practice problem recommendations from OpenAI / Strands LLM
 * based on the user's diagnosed algorithmic blind spots.
 */
export async function generateTargetedRecommendationsWithLLM(
  weakTopics: WeakTopic[],
  userId = "default_user"
): Promise<RecommendedProblem[]> {
  if (weakTopics.length === 0) {
    return [];
  }

  const prompt = `You are an expert competitive programming coach and curriculum curator.
The user '${userId}' has been analyzed across their LeetCode and Codeforces submissions and diagnosed with the following specific algorithmic blind spots:

${weakTopics.map((w, idx) => `[Blind Spot ${idx + 1}] Topic: ${w.topic}
- Specific Failure Mode: ${w.failure_mode}
- Root Cause: ${w.root_cause || w.description}
- Why It Fails: ${w.why_it_fails || "Violates algorithmic state invariant or boundary condition"}
- Algorithmic Invariant Needed: ${w.correct_concept || "Enforce correct problem constraints"}
- Suggested Strategy: ${w.suggested_fix || "Master recurrence or loop condition"}`).join("\n\n")}

Task:
Recommend 3 to 6 targeted, official LeetCode or Codeforces problems specifically chosen to help the user practice and eliminate these exact failure patterns.
Do NOT recommend generic problems; each recommendation MUST specifically address one of the diagnosed blind spots above.

Format Requirement:
Return ONLY a valid JSON array of objects matching this exact structure:
[
  {
    "platform": "leetcode" or "codeforces",
    "problem_id": "704",
    "title": "Exact Official Problem Title",
    "difficulty": "Easy" | "Medium" | "Hard" | "800" | "1200" | "1600",
    "topic": "Targeted Topic",
    "reason": "Clear 1-2 sentence pedagogical explanation of why solving this specific problem directly addresses their diagnosed blind spot.",
    "url": "https://leetcode.com/problems/slug/ or https://codeforces.com/problemset/problem/contest/index"
  }
]`;

  try {
    const rawResponse = await invokeLLM(SYSTEM_PROMPT, prompt, {
      temperature: 0.2,
      maxTokens: 1500,
    });

    if (rawResponse) {
      const parsed = extractJsonFromResponse<RecommendedProblem[]>(rawResponse);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: RecommendedProblem[] = [];
        for (const item of parsed) {
          const result = RecommendedProblemSchema.safeParse(item);
          if (result.success) {
            validated.push(result.data);
          }
        }
        if (validated.length > 0) {
          console.log(`[Strands Agent] Generated ${validated.length} dynamic targeted recommendations via OpenAI.`);
          return validated;
        }
      }
    }
  } catch (err) {
    console.warn(`[Strands Agent LLM recommendation notice]: ${(err as Error).message}`);
  }

  // Dynamic fallback: Generate tailored practice recommendations dynamically derived from the diagnosed weak topics
  const dynamicFallback: RecommendedProblem[] = [];
  const seenIds = new Set<string>();

  for (const w of weakTopics) {
    const topicLower = w.topic.toLowerCase();
    let candidateProblems: RecommendedProblem[] = [];

    if (topicLower.includes("binary search") || topicLower.includes("search")) {
      candidateProblems = [
        {
          platform: "leetcode",
          problem_id: "704",
          title: "Binary Search",
          difficulty: "Easy",
          topic: w.topic,
          reason: `Practice maintaining strict loop invariants to eliminate '${w.failure_mode}'.`,
          url: "https://leetcode.com/problems/binary-search/",
        },
        {
          platform: "leetcode",
          problem_id: "34",
          title: "Find First and Last Position of Element in Sorted Array",
          difficulty: "Medium",
          topic: w.topic,
          reason: `Targeted boundary conditions to resolve: ${w.why_it_fails || w.failure_mode}.`,
          url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
        },
      ];
    } else if (topicLower.includes("dynamic programming") || topicLower.includes("dp")) {
      candidateProblems = [
        {
          platform: "leetcode",
          problem_id: "198",
          title: "House Robber",
          difficulty: "Medium",
          topic: w.topic,
          reason: `Practice non-adjacent state recurrence to fix: ${w.root_cause || w.failure_mode}.`,
          url: "https://leetcode.com/problems/house-robber/",
        },
        {
          platform: "leetcode",
          problem_id: "300",
          title: "Longest Increasing Subsequence",
          difficulty: "Medium",
          topic: w.topic,
          reason: `Master state transitions and optimal substructure: ${w.correct_concept || w.failure_mode}.`,
          url: "https://leetcode.com/problems/longest-increasing-subsequence/",
        },
      ];
    } else if (topicLower.includes("graph") || topicLower.includes("bfs") || topicLower.includes("dfs")) {
      candidateProblems = [
        {
          platform: "leetcode",
          problem_id: "200",
          title: "Number of Islands",
          difficulty: "Medium",
          topic: w.topic,
          reason: `Practice immediate visited-marking upon queue enqueue: ${w.suggested_fix || w.failure_mode}.`,
          url: "https://leetcode.com/problems/number-of-islands/",
        },
      ];
    } else if (topicLower.includes("two pointer") || topicLower.includes("sliding window")) {
      candidateProblems = [
        {
          platform: "leetcode",
          problem_id: "3",
          title: "Longest Substring Without Repeating Characters",
          difficulty: "Medium",
          topic: w.topic,
          reason: `Practice window contraction without left pointer regression to resolve ${w.failure_mode}.`,
          url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        },
      ];
    } else {
      candidateProblems = [
        {
          platform: "leetcode",
          problem_id: "1",
          title: `${w.topic} Targeted Reinforcement`,
          difficulty: "Medium",
          topic: w.topic,
          reason: `Targeted problem to eliminate ${w.failure_mode.toLowerCase()} and reinforce ${w.correct_concept || "correct invariant"}.`,
          url: "https://leetcode.com/problemset/all/",
        },
      ];
    }

    for (const p of candidateProblems) {
      if (!seenIds.has(p.problem_id)) {
        seenIds.add(p.problem_id);
        dynamicFallback.push(p);
      }
    }
  }

  return dynamicFallback.slice(0, 6);
}

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
    }
  }

  // Sort weaknesses by evidence count descending
  weakTopics.sort((a, b) => b.evidence_count - a.evidence_count);

  // Dynamically generate targeted practice recommendations using Strands / OpenAI LLM
  const recommendedProblems = await generateTargetedRecommendationsWithLLM(weakTopics, userId);

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
