import { CanonicalSubmission } from "@/schemas/submission.schema";
import { FailurePatterns } from "./types";

export const SYSTEM_PROMPT = `You are BlindSpot, an expert AI competitive programming coach and diagnostic engine.
Your task is to analyze competitive programming submissions (from LeetCode and Codeforces) that failed,
diagnose the root-cause failure pattern, and identify recurring conceptual blind spots.

Controlled Vocabulary of Failure Patterns:
${FailurePatterns.map((p) => `- ${p}`).join("\n")}

Guidelines:
1. Ground your diagnosis in the problem statement, topic tags, error verdict, and code implementation.
2. If a submission is AC (Accepted), do not fabricate failure modes.
3. If the verdict is TLE, check for incorrect complexity or infinite loops before assuming wrong logic.
4. Distinguish isolated syntax/typo mistakes from conceptual algorithmic failures.
5. If there is insufficient evidence to determine the exact failure pattern, output "unknown" with lower confidence.
6. Provide concise, high-signal explanations with specific code references.`;

export function buildSingleSubmissionPrompt(submission: CanonicalSubmission): string {
  return `Analyze the following failed submission and diagnose its failure mode.

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
${submission.submission.error_message ? `- Error Message: ${submission.submission.error_message}` : ""}

Submitted Code:
\`\`\`${submission.submission.language}
${submission.submission.code}
\`\`\`

Return a valid JSON object with the following fields:
{
  "submission_id": "${submission.submission_id}",
  "topic": "<primary algorithmic topic>",
  "verdict": "${submission.submission.verdict}",
  "failure_pattern": "<one of the controlled vocabulary values>",
  "explanation": "<concise explanation of why the code failed>",
  "confidence": <number between 0.0 and 1.0>,
  "is_failure": ${submission.submission.verdict !== "AC"}
}`;
}
