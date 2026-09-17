import { CanonicalSubmission, CanonicalSubmissionSchema } from "@/schemas/submission.schema";
import {
  AnalysisOutput,
  AnalysisOutputSchema,
  WeakTopic,
  RecommendedProblem,
} from "@/schemas/analysis.schema";
import { SubmissionDiagnosis, SubmissionDiagnosisSchema } from "./types";
import { runStrandsAnalysisAgent } from "./agent";
import { getUserHistory } from "./tools";

/**
 * Phase 2 & 3: Single submission analysis
 * Analyzes a canonical submission and returns structured diagnosis.
 */
export async function analyzeSubmission(
  submission: CanonicalSubmission
): Promise<SubmissionDiagnosis> {
  // Validate input
  const validatedSub = CanonicalSubmissionSchema.parse(submission);

  // Run agent analysis
  const diagnosis = await runStrandsAnalysisAgent(validatedSub);

  // Validate output against schema
  return SubmissionDiagnosisSchema.parse(diagnosis);
}

/**
 * Analyze user's entire submission history to detect recurring weaknesses
 */
export async function analyzeUserHistory(userId = "user_demo"): Promise<AnalysisOutput> {
  const history = await getUserHistory(userId);
  const failedSubmissions = history.filter((s) => s.submission.verdict !== "AC");

  // Group by topic and detect patterns
  const topicMap = new Map<string, { diagnoses: SubmissionDiagnosis[]; subIds: string[] }>();

  for (const sub of failedSubmissions) {
    const diag = await analyzeSubmission(sub);
    const topic = diag.topic || sub.problem.topic_tags[0] || "General";

    if (!topicMap.has(topic)) {
      topicMap.set(topic, { diagnoses: [], subIds: [] });
    }
    const entry = topicMap.get(topic)!;
    entry.diagnoses.push(diag);
    entry.subIds.push(sub.submission_id);
  }

  const weakTopics: WeakTopic[] = [];

  for (const [topic, { diagnoses, subIds }] of topicMap.entries()) {
    // Tally failure modes
    const modeCounts = new Map<string, { count: number; totalConf: number; explanations: string[] }>();
    for (const d of diagnoses) {
      const mode = d.failure_pattern;
      if (!modeCounts.has(mode)) {
        modeCounts.set(mode, { count: 0, totalConf: 0, explanations: [] });
      }
      const m = modeCounts.get(mode)!;
      m.count += 1;
      m.totalConf += d.confidence;
      m.explanations.push(d.explanation);
    }

    // Find dominant failure mode
    let topMode = "unknown";
    let maxCount = 0;
    let avgConf = 0.5;

    for (const [mode, stat] of modeCounts.entries()) {
      if (stat.count > maxCount) {
        maxCount = stat.count;
        topMode = mode;
        avgConf = stat.totalConf / stat.count;
      }
    }

    if (maxCount >= 1) {
      weakTopics.push({
        topic,
        failure_mode: topMode.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        confidence: Math.min(1.0, Math.round((avgConf + (maxCount > 2 ? 0.1 : 0)) * 100) / 100),
        evidence_count: maxCount,
        example_submissions: subIds.slice(0, 5),
        description: `Identified ${maxCount} instances of ${topMode.replace(/_/g, " ")} in ${topic} submissions.`,
      });
    }
  }

  // Sort by evidence count desc
  weakTopics.sort((a, b) => b.evidence_count - a.evidence_count);

  const recommendedProblems: RecommendedProblem[] = [
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
      problem_id: "300",
      title: "Longest Increasing Subsequence",
      difficulty: "Medium",
      topic: "Dynamic Programming",
      reason: "Build intuition for precise 1D DP state formulation dp[i] = length of LIS ending strictly at index i.",
      url: "https://leetcode.com/problems/longest-increasing-subsequence/",
    },
    {
      platform: "leetcode",
      problem_id: "200",
      title: "Number of Islands",
      difficulty: "Medium",
      topic: "Graphs",
      reason: "Master immediate queue-enqueue visited marking in 2D grid BFS to prevent redundant node expansions.",
      url: "https://leetcode.com/problems/number-of-islands/",
    },
  ];

  const output: AnalysisOutput = {
    user_id: userId,
    analyzed_at: Date.now(),
    summary: `Analyzed ${history.length} total submissions with ${failedSubmissions.length} failed attempts. Identified ${weakTopics.length} recurring blind spot patterns.`,
    weak_topics: weakTopics,
    recommended_problems: recommendedProblems,
  };

  return AnalysisOutputSchema.parse(output);
}

/**
 * Convenience helper to get weak topics
 */
export async function getWeaknessProfile(userId = "user_demo"): Promise<WeakTopic[]> {
  const analysis = await analyzeUserHistory(userId);
  return analysis.weak_topics;
}

/**
 * Convenience helper to get recommendations
 */
export async function getRecommendations(userId = "user_demo"): Promise<RecommendedProblem[]> {
  const analysis = await analyzeUserHistory(userId);
  return analysis.recommended_problems;
}
