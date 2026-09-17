import express, { Request, Response } from "express";
import cors from "cors";
import {
  searchSubmissions,
  getSubmission,
  getUserSubmissions,
  saveSubmission,
} from "../services/opensearch";
import { normalizeSubmission } from "../services/normalization";
import { getAnalysisForUser, analyzeSubmission } from "../services/analysis";
import {
  getUpcomingPractice,
  markProblemCompleted,
  scheduleProblem,
} from "../scheduler/spaced-repetition";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", service: "blindspot-backend", timestamp: Date.now() });
});

// GET /api/submissions
app.get("/api/submissions", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || "";
    const platform = (req.query.platform as string) || undefined;
    const verdict = (req.query.verdict as string) || undefined;
    const topic = (req.query.topic as string) || undefined;
    const userId = (req.query.userId as string) || "user_demo";

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

// POST /api/submissions (Ingestion & Normalization)
app.post("/api/submissions", async (req: Request, res: Response) => {
  try {
    const { platform, raw, userId } = req.body;
    if (!platform || !raw) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: platform, raw",
      });
    }

    const canonical = normalizeSubmission(platform, raw, userId || "user_demo");
    const diagnosis = await analyzeSubmission(canonical);
    await saveSubmission(canonical, diagnosis);

    res.status(201).json({
      success: true,
      submission: {
        ...canonical,
        analysis: diagnosis,
      },
      diagnosis,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// POST /api/submissions/analyze (Direct single-submission diagnosis)
app.post("/api/submissions/analyze", async (req: Request, res: Response) => {
  try {
    const submission = req.body;
    const diagnosis = await analyzeSubmission(submission);
    res.json({ success: true, diagnosis });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/analysis (Person B output consumer)
app.get("/api/analysis", async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || "user_demo";
    const analysis = await getAnalysisForUser(userId);
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
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
});

export default app;
