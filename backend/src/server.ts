import express, { Request, Response } from "express";
import cors from "cors";
import {
  searchSubmissions,
  getSubmission,
  getUserSubmissions,
  saveSubmission,
  clearOpenSearch,
  resetOpenSearchToMock,
  isOpenSearchLive,
} from "../services/opensearch";
import { normalizeSubmission } from "../services/normalization";
import { getAnalysisForUser, analyzeSubmission } from "../services/analysis";
import {
  getUpcomingPractice,
  markProblemCompleted,
  scheduleProblem,
} from "../scheduler/spaced-repetition";
import {
  fetchLiveLeetCodeSubmissions,
  fetchLiveCodeforcesSubmissions,
} from "../services/ingestion/live-fetcher";
import { saveRawPayload } from "../services/storage/s3";
import {
  saveUserProfile,
  getUserProfile,
  saveWeaknesses,
  getWeaknessesFromDynamo,
  saveScheduleToDynamo,
  getScheduleFromDynamo,
  recordAnalysisRun,
} from "../services/storage/dynamodb";
import { DEFAULT_USER_CONFIG } from "../services/ingestion/config";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Active user session state
let currentProfile = {
  userId: DEFAULT_USER_CONFIG.userId,
  leetcodeUsername: DEFAULT_USER_CONFIG.leetcodeUsername,
  codeforcesHandle: DEFAULT_USER_CONFIG.codeforcesHandle,
  isLive: false,
};

/**
 * Auto-sync live profile data on server boot
 */
async function autoSeedLiveUserSubmissions() {
  console.log(`\n======================================================`);
  console.log(` 🌐 AUTO-FETCHING REAL LEETCODE & CODEFORCES DATA...`);
  console.log(` LeetCode: @${DEFAULT_USER_CONFIG.leetcodeUsername}`);
  console.log(` Codeforces: @${DEFAULT_USER_CONFIG.codeforcesHandle}`);
  console.log(`======================================================\n`);

  try {
    const [lcSubs, cfSubs] = await Promise.all([
      fetchLiveLeetCodeSubmissions(DEFAULT_USER_CONFIG.leetcodeUsername, 50, DEFAULT_USER_CONFIG.userId),
      fetchLiveCodeforcesSubmissions(DEFAULT_USER_CONFIG.codeforcesHandle, 50, DEFAULT_USER_CONFIG.userId),
    ]);

    const totalLive = lcSubs.length + cfSubs.length;

    if (totalLive > 0) {
      clearOpenSearch();

      // Save raw payloads to S3 / local storage
      if (lcSubs.length > 0) await saveRawPayload(DEFAULT_USER_CONFIG.userId, "leetcode", lcSubs);
      if (cfSubs.length > 0) await saveRawPayload(DEFAULT_USER_CONFIG.userId, "codeforces", cfSubs);

      for (const sub of [...lcSubs, ...cfSubs]) {
        await saveSubmission(sub);
      }
      currentProfile.isLive = true;
      console.log(`✅ Loaded ${totalLive} real submissions into OpenSearch & S3.`);

      // Save profile in DynamoDB
      await saveUserProfile({
        userId: DEFAULT_USER_CONFIG.userId,
        leetcodeUsername: DEFAULT_USER_CONFIG.leetcodeUsername,
        codeforcesHandle: DEFAULT_USER_CONFIG.codeforcesHandle,
        lastSyncAt: Date.now(),
      });

      // Run AI Agent Analysis on real user submissions
      const analysis = await getAnalysisForUser(DEFAULT_USER_CONFIG.userId);
      console.log(`🧠 AI Agent Analysis completed: ${analysis.weak_topics.length} blind spots detected.`);

      // Save weaknesses in DynamoDB
      if (analysis.weak_topics && analysis.weak_topics.length > 0) {
        await saveWeaknesses(DEFAULT_USER_CONFIG.userId, analysis.weak_topics);
      }

      // Auto-populate spaced repetition schedule in DynamoDB
      if (analysis.recommended_problems && analysis.recommended_problems.length > 0) {
        for (const rec of analysis.recommended_problems) {
          const scheduled = scheduleProblem({
            problem_id: rec.problem_id,
            title: rec.title || `Problem ${rec.problem_id}`,
            topic: rec.topic || "Targeted Practice",
            platform: rec.platform,
            reason: rec.reason,
            url: rec.url,
          });
          await saveScheduleToDynamo(DEFAULT_USER_CONFIG.userId, scheduled);
        }
      }

      // Record analysis run in DynamoDB
      await recordAnalysisRun(DEFAULT_USER_CONFIG.userId, {
        analyzed_at: analysis.analyzed_at || Date.now(),
        summary: analysis.summary,
        weak_topics_count: analysis.weak_topics.length,
        recommended_problems_count: analysis.recommended_problems.length,
      });
    } else {
      console.log(`ℹ️ No live submissions retrieved for @${DEFAULT_USER_CONFIG.leetcodeUsername} / @${DEFAULT_USER_CONFIG.codeforcesHandle}. Keeping preloaded canonical dataset active.`);
    }
  } catch (err) {
    console.warn(`[Auto-Sync Notice] Could not fetch remote profiles (${(err as Error).message}). Keeping local data active.`);
  }
}

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "blindspot-backend",
    isLiveMode: isOpenSearchLive(),
    currentProfile,
    timestamp: Date.now(),
  });
});

// GET /api/sync-status
app.get("/api/sync-status", (req: Request, res: Response) => {
  res.json({
    success: true,
    isLive: isOpenSearchLive(),
    profile: currentProfile,
  });
});

// POST /api/sync (Sync any LeetCode & Codeforces User Profiles)
app.post("/api/sync", async (req: Request, res: Response) => {
  try {
    const {
      leetcodeUsername = currentProfile.leetcodeUsername,
      codeforcesHandle = currentProfile.codeforcesHandle,
      userId = currentProfile.userId,
      clearMock = true,
    } = req.body;

    if (clearMock) {
      clearOpenSearch();
    }

    let lcCount = 0;
    let cfCount = 0;
    const errors: string[] = [];

    // Fetch LeetCode live submissions
    if (leetcodeUsername && leetcodeUsername.trim()) {
      try {
        const lcSubs = await fetchLiveLeetCodeSubmissions(leetcodeUsername.trim(), 50, userId);
        if (lcSubs.length > 0) {
          await saveRawPayload(userId, "leetcode", lcSubs);
          for (const sub of lcSubs) {
            await saveSubmission(sub);
          }
          lcCount = lcSubs.length;
        }
      } catch (e) {
        console.error("LeetCode fetch error:", e);
        errors.push(`LeetCode: ${(e as Error).message}`);
      }
    }

    // Fetch Codeforces live submissions
    if (codeforcesHandle && codeforcesHandle.trim()) {
      try {
        const cfSubs = await fetchLiveCodeforcesSubmissions(codeforcesHandle.trim(), 50, userId);
        if (cfSubs.length > 0) {
          await saveRawPayload(userId, "codeforces", cfSubs);
          for (const sub of cfSubs) {
            await saveSubmission(sub);
          }
          cfCount = cfSubs.length;
        }
      } catch (e) {
        console.error("Codeforces fetch error:", e);
        errors.push(`Codeforces: ${(e as Error).message}`);
      }
    }

    const totalCount = lcCount + cfCount;
    currentProfile = {
      userId,
      leetcodeUsername: (leetcodeUsername || "").trim(),
      codeforcesHandle: (codeforcesHandle || "").trim(),
      isLive: totalCount > 0,
    };

    // Save profile to DynamoDB
    await saveUserProfile({
      userId,
      leetcodeUsername: currentProfile.leetcodeUsername,
      codeforcesHandle: currentProfile.codeforcesHandle,
      lastSyncAt: Date.now(),
    });

    // Run Person B's AI Agent analysis on the freshly fetched real data
    const analysis = await getAnalysisForUser(userId);

    // Save weaknesses in DynamoDB
    if (analysis.weak_topics && analysis.weak_topics.length > 0) {
      await saveWeaknesses(userId, analysis.weak_topics);
    }

    // Auto-schedule recommended problems into Spaced Repetition in DynamoDB
    if (analysis.recommended_problems && analysis.recommended_problems.length > 0) {
      for (const rec of analysis.recommended_problems) {
        const scheduled = scheduleProblem({
          problem_id: rec.problem_id,
          title: rec.title || `Problem ${rec.problem_id}`,
          topic: rec.topic || "Targeted Practice",
          platform: rec.platform,
          reason: rec.reason,
          url: rec.url,
        });
        await saveScheduleToDynamo(userId, scheduled);
      }
    }

    // Record analysis run in DynamoDB
    await recordAnalysisRun(userId, {
      analyzed_at: analysis.analyzed_at || Date.now(),
      summary: analysis.summary,
      weak_topics_count: analysis.weak_topics.length,
      recommended_problems_count: analysis.recommended_problems.length,
    });

    res.json({
      success: true,
      leetcodeCount: lcCount,
      codeforcesCount: cfCount,
      totalCount,
      profile: currentProfile,
      analysis,
      warnings: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/reset-mock (Restore mock dataset)
app.post("/api/reset-mock", async (req: Request, res: Response) => {
  resetOpenSearchToMock();
  currentProfile = {
    userId: DEFAULT_USER_CONFIG.userId,
    leetcodeUsername: DEFAULT_USER_CONFIG.leetcodeUsername,
    codeforcesHandle: DEFAULT_USER_CONFIG.codeforcesHandle,
    isLive: false,
  };
  const analysis = await getAnalysisForUser(currentProfile.userId);
  res.json({
    success: true,
    message: "Reset to mock dataset successfully",
    analysis,
  });
});

// GET /api/submissions
app.get("/api/submissions", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const platform = (req.query.platform as string) || undefined;
    const verdict = (req.query.verdict as string) || undefined;
    const topic = (req.query.topic as string) || undefined;
    const userId = (req.query.userId as string) || currentProfile.userId;

    const submissions = await searchSubmissions({
      query,
      platform,
      verdict,
      topic,
      userId,
    });

    const profile = await getUserProfile(userId);

    res.json({
      success: true,
      count: submissions.length,
      isLive: isOpenSearchLive(),
      profile: profile || currentProfile,
      submissions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/submissions/:id
app.get("/api/submissions/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const submission = await getSubmission(id);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" });
    }
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/weaknesses
app.get("/api/weaknesses", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || currentProfile.userId;
    let weaknesses = await getWeaknessesFromDynamo(userId);
    if (!weaknesses || weaknesses.length === 0) {
      const analysis = await getAnalysisForUser(userId);
      weaknesses = analysis.weak_topics;
    }
    res.json({ success: true, count: weaknesses.length, userId, weaknesses });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/recommendations
app.get("/api/recommendations", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || currentProfile.userId;
    const analysis = await getAnalysisForUser(userId);
    res.json({ success: true, recommendations: analysis.recommended_problems || [] });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/analysis (Person B AI Agent Output)
app.get("/api/analysis", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || currentProfile.userId;
    const analysis = await getAnalysisForUser(userId);
    res.json({ success: true, isLive: isOpenSearchLive(), analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/analysis/submission (Diagnose single submission on-the-fly)
app.post("/api/analysis/submission", (req: Request, res: Response) => {
  try {
    const { submission } = req.body;
    if (!submission) {
      return res.status(400).json({ success: false, error: "Missing required field: submission" });
    }
    const result = analyzeSubmission(submission);
    res.json({ success: true, analysis: result });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/schedule
app.get("/api/schedule", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || currentProfile.userId;
    const dynamoItems = await getScheduleFromDynamo(userId);
    let practice = getUpcomingPractice();

    if (dynamoItems && dynamoItems.length > 0) {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const today = dynamoItems.filter((i) => i.status === "due_today" || i.scheduled_date <= now + 12 * 3600 * 1000);
      const tomorrow = dynamoItems.filter((i) => i.scheduled_date > now + 12 * 3600 * 1000 && i.scheduled_date <= now + 1.5 * dayMs);
      const in3Days = dynamoItems.filter((i) => i.scheduled_date > now + 1.5 * dayMs && i.scheduled_date <= now + 3.5 * dayMs);
      const in7Days = dynamoItems.filter((i) => i.scheduled_date > now + 3.5 * dayMs && i.scheduled_date <= now + 7.5 * dayMs);
      const later = dynamoItems.filter((i) => i.scheduled_date > now + 7.5 * dayMs);

      practice = {
        today,
        tomorrow,
        in3Days,
        in7Days,
        later,
        all: dynamoItems,
      };
    }

    res.json({ success: true, userId, practice });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/schedule
app.post("/api/schedule", async (req: Request, res: Response) => {
  try {
    const { action, scheduleId, problem } = req.body;
    const userId = currentProfile.userId;

    if (action === "complete" && scheduleId) {
      const updated = markProblemCompleted(scheduleId);
      if (updated) {
        await saveScheduleToDynamo(userId, updated);
      }
      return res.json({ success: true, item: updated });
    }

    if (action === "schedule" && problem) {
      const scheduled = scheduleProblem(problem);
      await saveScheduleToDynamo(userId, scheduled);
      return res.json({ success: true, item: scheduled });
    }

    res.status(400).json({ success: false, error: "Invalid action or parameters" });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BlindSpot Backend API server running at http://localhost:${PORT}`);
  if (DEFAULT_USER_CONFIG.autoFetchOnStartup) {
    autoSeedLiveUserSubmissions();
  }
});

export default app;
