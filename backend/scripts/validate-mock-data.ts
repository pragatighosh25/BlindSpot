import fs from "fs";
import path from "path";
import { CanonicalSubmissionSchema, CanonicalSubmission } from "../schemas/submission.schema";
import {
  normalizeLeetCodeSubmission,
  RawLeetCodeSubmission,
} from "../services/ingestion/leetcode";
import {
  normalizeCodeforcesSubmission,
  RawCodeforcesSubmission,
} from "../services/ingestion/codeforces";

function runValidation() {
  console.log("==================================================");
  console.log(" 🔍 BLINDSPOT - MOCK DATA VALIDATION & SMOKE TEST ");
  console.log("==================================================\n");

  const dataFilePath = path.join(__dirname, "../data/mock-submissions.json");
  if (!fs.existsSync(dataFilePath)) {
    console.error(`❌ Data file not found at: ${dataFilePath}`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(dataFilePath, "utf-8");
  const submissions: unknown[] = JSON.parse(rawJson);

  console.log(`Loaded ${submissions.length} mock submissions from ${dataFilePath}`);

  let validCount = 0;
  const platformCounts: Record<string, number> = {};
  const verdictCounts: Record<string, number> = {};
  const topicCounts: Record<string, number> = {};

  for (let i = 0; i < submissions.length; i++) {
    const item = submissions[i];
    const parseResult = CanonicalSubmissionSchema.safeParse(item);

    if (!parseResult.success) {
      console.error(`❌ Validation failed for submission index ${i} (ID: ${(item as any)?.submission_id}):`);
      console.error(JSON.stringify(parseResult.error.format(), null, 2));
      process.exit(1);
    }

    validCount++;
    const sub: CanonicalSubmission = parseResult.data;
    platformCounts[sub.platform] = (platformCounts[sub.platform] || 0) + 1;
    verdictCounts[sub.submission.verdict] = (verdictCounts[sub.submission.verdict] || 0) + 1;

    for (const tag of sub.problem.topic_tags) {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    }
  }

  console.log(`\n✅ All ${validCount} mock submissions passed CanonicalSubmissionSchema validation!`);
  console.log("\n📊 Platform Breakdown:");
  for (const [p, c] of Object.entries(platformCounts)) {
    console.log(`   - ${p}: ${c}`);
  }

  console.log("\n📊 Verdict Breakdown:");
  for (const [v, c] of Object.entries(verdictCounts)) {
    console.log(`   - ${v}: ${c}`);
  }

  console.log("\n📊 Topic Tag Coverage:");
  for (const [t, c] of Object.entries(topicCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`   - ${t}: ${c}`);
  }

  // Test Normalization Layer
  console.log("\n--------------------------------------------------");
  console.log(" 🧪 Testing Normalization Layer with Raw Mock Payloads...");
  console.log("--------------------------------------------------");

  const rawLeetCodeSample: RawLeetCodeSubmission = {
    id: "998877",
    questionId: "704",
    title: "Binary Search",
    titleSlug: "binary-search",
    lang: "cpp",
    statusDisplay: "Wrong Answer",
    runtime: "28 ms",
    memory: "27.6 MB",
    timestamp: 1709120400,
    code: "class Solution { ... }",
    difficulty: "Easy",
    topicTags: [{ name: "Binary Search" }, { name: "Array" }],
    errorResponse: "Input [-1,0,3,5,9,12], 9 -> Expected 4, got -1",
  };

  const normalizedLC = normalizeLeetCodeSubmission(rawLeetCodeSample, "test_user");
  const lcValidation = CanonicalSubmissionSchema.safeParse(normalizedLC);
  if (!lcValidation.success) {
    console.error("❌ LeetCode normalization failed validation:", lcValidation.error);
    process.exit(1);
  }
  console.log("✅ normalizeLeetCodeSubmission verified successfully!");

  const rawCodeforcesSample: RawCodeforcesSubmission = {
    id: 99887766,
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

  const normalizedCF = normalizeCodeforcesSubmission(rawCodeforcesSample, "code_ninja");
  const cfValidation = CanonicalSubmissionSchema.safeParse(normalizedCF);
  if (!cfValidation.success) {
    console.error("❌ Codeforces normalization failed validation:", cfValidation.error);
    process.exit(1);
  }
  console.log("✅ normalizeCodeforcesSubmission verified successfully!");

  console.log("\n==================================================");
  console.log(" 🎉 ALL DATA CONTRACTS & NORMALIZATION TESTS PASSED ");
  console.log("==================================================\n");
}

runValidation();
