import { CanonicalSubmission } from "@/schemas/submission.schema";
import { FailurePatterns } from "./types";

export const SYSTEM_PROMPT = `You are BlindSpot, an expert competitive programming coach and rigorous code reviewer.
Your goal is to provide a precise, high-density code review for failed competitive programming submissions (LeetCode / Codeforces) that feels like it was written by an experienced Grandmaster coach — NOT generic AI filler.

CRITICAL CODE REVIEW INSTRUCTIONS:
1. Every major explanation MUST reference specific elements from THIS submitted code:
   - Specific variable names (e.g. \`dp[i]\`, \`left\`, \`right\`, \`visited\`, \`nums[j]\`, \`k\`, \`n\`)
   - Specific loop bounds or termination checks (e.g. \`while (left < right)\`, \`while (n >= k)\`)
   - Specific recurrence transitions, state definitions, or updates (e.g. \`n -= k\`)
   - Actual test case inputs and outputs when available.

2. LENGTH & DEPTH GUIDELINES:
   - "what_went_wrong": 2–4 concise sentences explaining the exact logical flaw in THIS code.
   - "where_it_happens": 1–2 concrete sentences identifying the exact line, loop, condition, or operation.
   - "why_it_fails": 2–4 concise sentences explaining the failure mechanism with a tiny concrete calculation/example.
   - "correct_reasoning": 2–4 concise sentences explaining the correct invariant and algorithmic formulation.
   - "approach_comparison":
     - "your_approach": 3–4 concise bullet points summarizing what the user's code did, the specific mistake, and consequence.
     - "correct_approach": 3–4 concise bullet points summarizing the correct invariant, state update, and expected behavior.
   - "code_comparison":
     - "original_code": The actual buggy snippet from the user's submission.
     - "corrected_code": The corresponding minimal correct fix preserving the user's structure.
     - "explanation": Exactly 1 concise sentence describing what changed.
   - "key_takeaway": 1–2 memorable, technical sentences summarizing the invariant rule to remember.

3. STRICTLY FORBIDDEN GENERIC FILLER:
   - Do NOT say "Your solution has an incorrect approach" or "The recurrence is incorrect" without immediately explaining the concrete variable/state flaw.
   - Do NOT output generic motivational cheerleading ("Keep practicing!").

4. ZERO HALLUCINATION POLICY:
   - NEVER invent or fabricate test cases, expected outputs, actual outputs, runtime, or memory.
   - Base all reasoning strictly on the submitted code and provided problem context.

Controlled Vocabulary of Failure Patterns:
${FailurePatterns.map((p) => `- ${p}`).join("\n")}`;

export function buildSingleSubmissionPrompt(
  submission: CanonicalSubmission,
  historicalMistakes: CanonicalSubmission[] = []
): string {
  const contextSection =
    historicalMistakes.length > 0
      ? `\nOpenSearch Historical Mistake Context for User:
${historicalMistakes
  .slice(0, 3)
  .map(
    (m, idx) =>
      `[Past Mistake ${idx + 1}] Problem: ${m.problem.title} (${m.platform}), Verdict: ${m.submission.verdict}, Language: ${m.submission.language}`
  )
  .join("\n")}\n(Note: This submission is the primary subject. Historical context is for pattern correlation.)\n`
      : "";

  return `Review and diagnose this failed competitive programming submission like an experienced coach.

Problem Details:
- Platform: ${submission.platform}
- Problem ID: ${submission.problem.id}
- Title: ${submission.problem.title}
- Difficulty: ${submission.problem.difficulty || "Unknown"}
- Topic Tags: ${submission.problem.topic_tags.join(", ") || "None"}
${submission.problem.url ? `- Problem URL: ${submission.problem.url}` : ""}

Submission Details:
- Submission ID: ${submission.submission_id}
- Language: ${submission.submission.language}
- Verdict: ${submission.submission.verdict}
- Runtime: ${submission.submission.runtime_ms != null ? `${submission.submission.runtime_ms} ms` : "N/A"}
- Memory: ${submission.submission.memory_mb != null ? `${submission.submission.memory_mb} MB` : "N/A"}
${submission.submission.error_message ? `- Judge Error Message / Execution Output:\n${submission.submission.error_message}` : "- Execution Output: Not available in judge payload"}
${contextSection}
Submitted Code:
\`\`\`${submission.submission.language}
${submission.submission.code}
\`\`\`

Return a valid JSON object matching this exact schema:
{
  "submission_id": "${submission.submission_id}",
  "topic": "<primary algorithmic topic e.g. Dynamic Programming, Binary Search, Graphs, Two Pointers, Brute Force>",
  "verdict": "${submission.submission.verdict}",
  "failure_pattern": "<one of the controlled vocabulary values>",
  "failure_mode": "<descriptive title for this specific failure mode>",
  "what_went_wrong": "<2-4 sentences explaining the concrete logical mistake in this code>",
  "where_it_happens": "<the exact function, loop, condition, or recurrence construct where the bug is located>",
  "why_it_fails": "<2-4 sentences explaining the failure mechanism with a tiny example>",
  "correct_reasoning": "<2-4 sentences explaining the correct algorithmic invariant>",
  "approach_comparison": {
    "your_approach": [
      "<specific observation of what user's code does>",
      "<the specific flawed assumption>",
      "<the resulting consequence on test inputs>"
    ],
    "correct_approach": [
      "<the correct simulation / invariant requirement>",
      "<how state should progress at each step>",
      "<why this passes all test cases>"
    ]
  },
  "code_comparison": {
    "original_code": "<the focused buggy snippet from the submission>",
    "corrected_code": "<the minimal clean fix for that snippet>",
    "explanation": "<short 1-sentence description of the fix>"
  },
  "key_takeaway": "<1-2 sentence memorable technical lesson derived from this bug>",
  "root_cause": "<concise root cause summary for backward compatibility>",
  "correct_concept": "<concise concept summary for backward compatibility>",
  "suggested_fix": "<concise fix summary for backward compatibility>",
  "code_location": "<code location summary for backward compatibility>",
  "explanation": "<one sentence diagnosis summary>",
  "confidence": <confidence score between 0.0 and 1.0>,
  "is_failure": ${submission.submission.verdict !== "AC"},
  "evidence": {
    "input": "${submission.submission.error_message?.match(/Input[:\s]+([^,\n]+)/i)?.[1]?.replace(/"/g, '\\"') || ""}",
    "actual_output": "${submission.submission.error_message?.match(/Output[:\s]+([^,\n]+)/i)?.[1]?.replace(/"/g, '\\"') || ""}",
    "expected_output": "${submission.submission.error_message?.match(/Expected[:\s]+([^,\n]+)/i)?.[1]?.replace(/"/g, '\\"') || ""}",
    "error_message": "${submission.submission.error_message ? submission.submission.error_message.replace(/"/g, '\\"').replace(/\n/g, " ") : ""}"
  }
}`;
}
