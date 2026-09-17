import { CanonicalSubmission } from "@/schemas/submission.schema";
import { FailurePatterns } from "./types";

export const SYSTEM_PROMPT = `You are BlindSpot, an expert AI competitive programming coach and diagnostic engine.
Your task is to analyze competitive programming submissions (from LeetCode and Codeforces) that failed (WA, TLE, RE, MLE, CE),
diagnose the algorithmic root-cause failure pattern, and provide genuine algorithmic coaching.

Do NOT simply repeat execution logs or say "the code is wrong".
You must explain:
1. What went wrong (Root Cause).
2. Where in the submitted code is the likely bug (Code Location).
3. What algorithmic concept or invariant is being violated (Correct Concept).
4. What is the specific failure pattern from the controlled vocabulary (Failure Pattern).
5. Why the current code produces the observed incorrect result on test inputs (Why It Fails).
6. What the correct reasoning, recurrence relation, or pointer logic should be (Suggested Fix).
7. How confident is the diagnosis (Confidence between 0.0 and 1.0).

Controlled Vocabulary of Failure Patterns:
${FailurePatterns.map((p) => `- ${p}`).join("\n")}

Guidelines:
1. Ground your diagnosis strictly in the submitted code logic, algorithmic constraints, and problem statement.
2. If a submission is AC (Accepted), do not fabricate failure modes; set is_failure to false and confidence to 1.0.
3. If the verdict is TLE, analyze why time complexity is exceeded (e.g. unmemoized exponential recursion, O(N^2) on large constraints, or infinite loops).
4. For Dynamic Programming, check state transitions (e.g., adjacent item overlap like House Robber, missing memoization, off-by-one base cases).
5. For Binary Search, check loop condition invariants (left <= right vs left < right), boundary updates, or monotonicity checks.
6. For Graphs, check visited-state tracking (post-pop vs on-push in BFS queues), cycle checks, or disconnected component iteration.
7. Distinguish execution evidence (test inputs/outputs) from the algorithmic diagnosis itself.`;

export function buildSingleSubmissionPrompt(submission: CanonicalSubmission): string {
  return `Analyze the following code submission and provide a deep algorithmic diagnosis.

Problem Information:
- Platform: ${submission.platform}
- Problem ID: ${submission.problem.id}
- Title: ${submission.problem.title}
- Difficulty: ${submission.problem.difficulty || "Unknown"}
- Topic Tags: ${submission.problem.topic_tags.join(", ") || "None"}

Submission Information:
- Submission ID: ${submission.submission_id}
- Language: ${submission.submission.language}
- Verdict: ${submission.submission.verdict}
- Runtime: ${submission.submission.runtime_ms ?? "N/A"} ms
- Memory: ${submission.submission.memory_mb ?? "N/A"} MB
${submission.submission.error_message ? `- Error Message / Execution Trace: ${submission.submission.error_message}` : ""}

Submitted Code:
\`\`\`${submission.submission.language}
${submission.submission.code}
\`\`\`

Return a valid JSON object matching the following structure:
{
  "submission_id": "${submission.submission_id}",
  "topic": "<primary algorithmic topic>",
  "verdict": "${submission.submission.verdict}",
  "failure_pattern": "<one of the controlled vocabulary values>",
  "failure_mode": "<human-readable descriptive title for the failure>",
  "root_cause": "<concise explanation of what algorithmic mistake was made in the code>",
  "why_it_fails": "<explanation of how this mistake leads to wrong output on the given or typical test input>",
  "correct_concept": "<the algorithmic invariant, theorem, or principle that should have been applied>",
  "suggested_fix": "<precise recurrence relation, pointer update, or algorithmic correction>",
  "code_location": "<specific line or code construct responsible for the bug>",
  "explanation": "<summary diagnostic sentence>",
  "confidence": <number between 0.0 and 1.0>,
  "is_failure": ${submission.submission.verdict !== "AC"},
  "evidence": {
    "input": "<extracted test input if available>",
    "actual_output": "<extracted actual output if available>",
    "expected_output": "<extracted expected output if available>",
    "error_message": "${submission.submission.error_message ? submission.submission.error_message.replace(/"/g, '\\"') : ""}"
  }
}`;
}
