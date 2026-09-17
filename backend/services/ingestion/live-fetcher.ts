import { CanonicalSubmission } from "@/schemas/submission.schema";
import { normalizeCodeforcesSubmission, RawCodeforcesSubmission } from "./codeforces";
import { normalizeLeetCodeSubmission, RawLeetCodeSubmission } from "./leetcode";
import { DEFAULT_USER_CONFIG } from "./config";

// Cache question details to avoid duplicate requests
const questionMetadataCache = new Map<string, { id: string; difficulty: string; topicTags: string[] }>();

/**
 * Fetch question details using alfa-leetcode-api /select or LeetCode GraphQL
 * Docs: https://github.com/alfaarghya/alfa-leetcode-api
 */
async function fetchLeetCodeQuestionDetails(titleSlug: string) {
  if (questionMetadataCache.has(titleSlug)) {
    return questionMetadataCache.get(titleSlug)!;
  }

  // 1. Try alfa-leetcode-api select endpoint
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${encodeURIComponent(titleSlug)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data: any = await res.json();
      if (data && (data.questionId || data.questionFrontendId || data.topicTags)) {
        const metadata = {
          id: String(data.questionFrontendId || data.questionId || titleSlug),
          difficulty: data.difficulty || "Medium",
          topicTags: Array.isArray(data.topicTags)
            ? data.topicTags.map((t: any) => (typeof t === "string" ? t : t.name))
            : [],
        };
        questionMetadataCache.set(titleSlug, metadata);
        return metadata;
      }
    }
  } catch {
    // Fallback to GraphQL
  }

  // 2. Direct GraphQL fallback
  try {
    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionFrontendId
          title
          difficulty
          topicTags { name }
        }
      }
    `;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({ query, variables: { titleSlug } }),
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const json: any = await res.json();
      const q = json.data?.question;
      if (q) {
        const metadata = {
          id: String(q.questionFrontendId || titleSlug),
          difficulty: q.difficulty || "Medium",
          topicTags: Array.isArray(q.topicTags) ? q.topicTags.map((t: any) => t.name) : [],
        };
        questionMetadataCache.set(titleSlug, metadata);
        return metadata;
      }
    }
  } catch {
    // Return graceful default
  }

  return { id: titleSlug, difficulty: "Medium", topicTags: [] };
}

/**
 * Fetch real submissions from LeetCode using alfa-leetcode-api and GraphQL
 * Docs: https://github.com/alfaarghya/alfa-leetcode-api
 */
export async function fetchLiveLeetCodeSubmissions(
  username = DEFAULT_USER_CONFIG.leetcodeUsername,
  limit = 50,
  userId = DEFAULT_USER_CONFIG.userId
): Promise<CanonicalSubmission[]> {
  const cleanUsername = username.trim();
  if (!cleanUsername) return [];

  console.log(`[LeetCode Ingestion] Fetching live submissions for @${cleanUsername}...`);
  let rawSubmissions: any[] = [];

  // 1. Try alfa-leetcode-api endpoint (all submissions with verdicts WA/TLE/AC)
  try {
    const url = `https://alfa-leetcode-api.onrender.com/${encodeURIComponent(cleanUsername)}/submission?limit=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const json: any = await res.json();
      if (json && Array.isArray(json.submission)) {
        rawSubmissions = json.submission;
        console.log(`[LeetCode Ingestion] Retrieved ${rawSubmissions.length} submissions from alfa-leetcode-api`);
      }
    }
  } catch (e) {
    console.warn(`[LeetCode alfa-api notice]:`, (e as Error).message);
  }

  // 2. Direct GraphQL fallback if alfa-api was idle or rate-limited
  if (rawSubmissions.length === 0) {
    try {
      const query = `
        query recentSubmissions($username: String!, $limit: Int!) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      `;

      const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
        body: JSON.stringify({ query, variables: { username: cleanUsername, limit } }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const json: any = await res.json();
        if (json.data?.recentSubmissionList && Array.isArray(json.data.recentSubmissionList)) {
          rawSubmissions = json.data.recentSubmissionList;
          console.log(`[LeetCode Ingestion] Retrieved ${rawSubmissions.length} submissions from LeetCode GraphQL`);
        }
      }
    } catch (e) {
      console.warn(`[LeetCode GraphQL notice]:`, (e as Error).message);
    }
  }

  if (rawSubmissions.length === 0) {
    console.log(`[LeetCode Ingestion] No live submissions found for @${cleanUsername}`);
    return [];
  }

  // Normalize each record
  const canonicalList: CanonicalSubmission[] = [];

  for (let i = 0; i < rawSubmissions.length; i++) {
    const raw = rawSubmissions[i];
    const titleSlug = raw.titleSlug || raw.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const meta = titleSlug ? await fetchLeetCodeQuestionDetails(titleSlug) : { id: `lc_${i}`, difficulty: "Medium", topicTags: [] };

    const rawSub: RawLeetCodeSubmission = {
      id: `${cleanUsername}_${raw.timestamp || Date.now()}_${i}`,
      questionId: meta.id,
      title: raw.title,
      titleSlug: titleSlug,
      lang: raw.lang || "cpp",
      statusDisplay: raw.statusDisplay || "Accepted",
      runtime: raw.runtime,
      memory: raw.memory,
      timestamp: raw.timestamp ? Number(raw.timestamp) : Math.floor(Date.now() / 1000) - i * 3600,
      difficulty: meta.difficulty,
      topicTags: meta.topicTags,
      userId: userId,
      code: `// LeetCode Problem: ${raw.title}\n// Language: ${raw.lang || "cpp"}\n// Verdict: ${raw.statusDisplay || "Accepted"}\n// User: @${cleanUsername}`,
      errorResponse: raw.statusDisplay && raw.statusDisplay !== "Accepted" ? `Verdict: ${raw.statusDisplay}` : undefined,
    };

    canonicalList.push(normalizeLeetCodeSubmission(rawSub, userId));
  }

  console.log(`[LeetCode Ingestion] Successfully normalized ${canonicalList.length} live submissions.`);
  return canonicalList;
}

/**
 * Fetch real submissions from Codeforces API
 * Docs: https://codeforces.com/apiHelp
 */
export async function fetchLiveCodeforcesSubmissions(
  handle = DEFAULT_USER_CONFIG.codeforcesHandle,
  count = 50,
  userId = DEFAULT_USER_CONFIG.userId
): Promise<CanonicalSubmission[]> {
  const cleanHandle = handle.trim();
  if (!cleanHandle) return [];

  console.log(`[Codeforces Ingestion] Fetching live submissions for @${cleanHandle}...`);
  const url = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(cleanHandle)}&from=1&count=${count}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      console.warn(`[Codeforces API Notice] HTTP ${res.status} for @${cleanHandle}`);
      return [];
    }

    const json: any = await res.json();
    if (json.status !== "OK" || !Array.isArray(json.result)) {
      console.warn(`[Codeforces API Notice] ${json.comment || "Invalid payload"}`);
      return [];
    }

    const rawSubmissions: RawCodeforcesSubmission[] = json.result;
    const canonicalList: CanonicalSubmission[] = [];

    for (const raw of rawSubmissions) {
      const problemName = raw.problem?.name || `Problem ${raw.problem?.index || ""}`;
      const codeStub = `// Codeforces ${raw.contestId || ""}${raw.problem?.index || ""} - ${problemName}\n// Language: ${raw.programmingLanguage}\n// Verdict: ${raw.verdict}\n// Time: ${raw.timeConsumedMillis || 0}ms\n// Memory: ${Math.round((raw.memoryConsumedBytes || 0) / 1024)}KB\n// Handle: @${cleanHandle}`;

      raw.sourceCode = raw.sourceCode || codeStub;
      raw.userId = userId;

      canonicalList.push(normalizeCodeforcesSubmission(raw, userId));
    }

    console.log(`[Codeforces Ingestion] Successfully normalized ${canonicalList.length} live submissions.`);
    return canonicalList;
  } catch (e) {
    console.warn(`[Codeforces API Error]:`, (e as Error).message);
    return [];
  }
}
