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
      for (const sub of [...lcSubs, ...cfSubs]) {
        await saveSubmission(sub);
      }
      currentProfile.isLive = true;
      console.log(`✅ Loaded ${totalLive} real submissions into OpenSearch.`);

      // Run AI Agent Analysis on real user submissions
      const analysis = await getAnalysisForUser(DEFAULT_USER_CONFIG.userId);
      console.log(`🧠 AI Agent Analysis completed: ${analysis.weak_topics.length} blind spots detected.`);

      // Auto-populate spaced repetition schedule
      if (analysis.recommended_problems && analysis.recommended_problems.length > 0) {
        for (const rec of analysis.recommended_problems) {
          scheduleProblem({
            problem_id: rec.problem_id,
            title: rec.title || `Problem ${rec.problem_id}`,
            topic: rec.topic || "Targeted Practice",
            platform: rec.platform,
            reason: rec.reason,
            url: rec.url,
          });
        }
      }
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
        for (const sub of lcSubs) {
          await saveSubmission(sub);
        }
        lcCount = lcSubs.length;
      } catch (e) {
        console.error("LeetCode fetch error:", e);
        errors.push(`LeetCode: ${(e as Error).message}`);
      }
    }

    // Fetch Codeforces live submissions
    if (codeforcesHandle && codeforcesHandle.trim()) {
      try {
        const cfSubs = await fetchLiveCodeforcesSubmissions(codeforcesHandle.trim(), 50, userId);
        for (const sub of cfSubs) {
          await saveSubmission(sub);
        }
        cfCount = cfSubs.length;
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

    // Run Person B's AI Agent analysis on the freshly fetched real data
    const analysis = await getAnalysisForUser(userId);

    // Auto-schedule recommended problems into Spaced Repetition
    if (analysis.recommended_problems && analysis.recommended_problems.length > 0) {
      for (const rec of analysis.recommended_problems) {
        scheduleProblem({
          problem_id: rec.problem_id,
          title: rec.title || `Problem ${rec.problem_id}`,
          topic: rec.topic || "Targeted Practice",
          platform: rec.platform,
          reason: rec.reason,
          url: rec.url,
        });
      }
    }

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

    res.json({
      success: true,
      count: submissions.length,
      isLive: isOpenSearchLive(),
      profile: currentProfile,
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

// POST /api/submissions (Ingest individual raw submission)
app.post("/api/submissions", async (req: Request, res: Response) => {
  try {
    const { platform, raw, userId } = req.body;
    if (!platform || !raw) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: platform, raw",
      });
    }

    const canonical = normalizeSubmission(platform, raw, userId || currentProfile.userId);
    await saveSubmission(canonical);

    res.status(201).json({
      success: true,
      submission: canonical,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
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
app.get("/api/schedule", (req: Request, res: Response) => {
  try {
    const practice = getUpcomingPractice();
    res.json({ success: true, practice });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/schedule
app.post("/api/schedule", (req: Request, res: Response) => {
  try {
    const { action, scheduleId, problem } = req.body;

    if (action === "complete" && scheduleId) {
      const updated = markProblemCompleted(scheduleId);
      return res.json({ success: true, item: updated });
    }

    if (action === "schedule" && problem) {
      const scheduled = scheduleProblem(problem);
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
