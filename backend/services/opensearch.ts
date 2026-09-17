import { CanonicalSubmission, SubmissionAnalysis } from "@/schemas/submission.schema";
import initialSubmissions from "@/data/mock-submissions.json";
import { diagnoseSubmissionPattern } from "./agent/agent";

export interface OpenSearchSubmissionDocument extends CanonicalSubmission {
  analysis?: SubmissionAnalysis;
}

export interface SearchSubmissionsQuery {
  query?: string;
  userId?: string;
  platform?: string;
  verdict?: string;
  topic?: string;
  limit?: number;
}

/**
 * In-memory simulated OpenSearch store for standalone local development and testing.
 * Supports indexing both mock datasets and live fetched LeetCode/Codeforces submissions.
 */
class LocalOpenSearchStore {
  private documents: Map<string, OpenSearchSubmissionDocument> = new Map();
  private isLive = false;

  constructor() {
    this.seed();
  }

  private seed() {
    for (const sub of initialSubmissions as CanonicalSubmission[]) {
      const diag = diagnoseSubmissionPattern(sub);
      this.documents.set(sub.submission_id, {
        ...sub,
        analysis: diag,
      });
    }
  }

  public clearAll() {
    this.documents.clear();
    this.isLive = true;
  }

  public resetToMock() {
    this.documents.clear();
    this.isLive = false;
    this.seed();
  }

  public isLiveMode(): boolean {
    return this.isLive;
  }

  public async save(sub: CanonicalSubmission, analysis?: SubmissionAnalysis): Promise<void> {
    const diag = analysis || (sub.analysis as SubmissionAnalysis) || diagnoseSubmissionPattern(sub);
    const doc: OpenSearchSubmissionDocument = {
      ...sub,
      analysis: diag,
    };
    this.documents.set(sub.submission_id, doc);
  }

  public async get(submissionId: string): Promise<OpenSearchSubmissionDocument | null> {
    return this.documents.get(submissionId) || null;
  }

  public async getByUser(userId: string): Promise<OpenSearchSubmissionDocument[]> {
    if (!userId || userId === "all") {
      return Array.from(this.documents.values());
    }
    return Array.from(this.documents.values()).filter(
      (d) => d.user_id === userId || (!this.isLive && (d.user_id === "user_demo" || d.user_id === "default_user"))
    );
  }

  public async search(options: SearchSubmissionsQuery): Promise<OpenSearchSubmissionDocument[]> {
    let results = Array.from(this.documents.values());

    if (options.userId && options.userId !== "all") {
      results = results.filter((d) => d.user_id === options.userId || (!this.isLive && (d.user_id === "user_demo" || d.user_id === "default_user")));
    }

    if (options.platform) {
      results = results.filter((d) => d.platform.toLowerCase() === options.platform?.toLowerCase());
    }

    if (options.verdict) {
      results = results.filter((d) => d.submission.verdict.toUpperCase() === options.verdict?.toUpperCase());
    }

    if (options.topic) {
      results = results.filter((d) =>
        d.problem.topic_tags.some((t) => t.toLowerCase().includes(options.topic!.toLowerCase()))
      );
    }

    if (options.query && options.query.trim().length > 0) {
      const q = options.query.toLowerCase();
      results = results.filter((d) => {
        return (
          d.problem.title.toLowerCase().includes(q) ||
          d.problem.id.toLowerCase().includes(q) ||
          d.submission.code.toLowerCase().includes(q) ||
          (d.submission.error_message && d.submission.error_message.toLowerCase().includes(q)) ||
          (d.analysis?.root_cause && d.analysis.root_cause.toLowerCase().includes(q)) ||
          (d.analysis?.failure_mode && d.analysis.failure_mode.toLowerCase().includes(q)) ||
          d.problem.topic_tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // Sort by timestamp desc
    results.sort((a, b) => b.submission.timestamp - a.submission.timestamp);

    if (options.limit && options.limit > 0) {
      return results.slice(0, options.limit);
    }

    return results;
  }

  public async searchSimilarMistakes(
    topic: string,
    verdict = "WA",
    userId = "user_demo"
  ): Promise<OpenSearchSubmissionDocument[]> {
    const all = await this.getByUser(userId);
    return all.filter((d) => {
      const matchesTopic = d.problem.topic_tags.some((t) =>
        t.toLowerCase().includes(topic.toLowerCase())
      );
      const isMistake = d.submission.verdict !== "AC";
      const matchesVerdict = verdict ? d.submission.verdict === verdict : true;
      return matchesTopic && isMistake && matchesVerdict;
    });
  }
}

// Global singleton instance for local dev
const globalStore = new LocalOpenSearchStore();

/**
 * OpenSearch Service API (Facade for Person A pipeline)
 */
export async function saveSubmission(
  submission: CanonicalSubmission,
  analysis?: SubmissionAnalysis
): Promise<void> {
  await globalStore.save(submission, analysis);
}

export async function getSubmission(
  submissionId: string
): Promise<OpenSearchSubmissionDocument | null> {
  return globalStore.get(submissionId);
}

export async function getUserSubmissions(
  userId = "user_demo"
): Promise<OpenSearchSubmissionDocument[]> {
  return globalStore.getByUser(userId);
}

export async function searchSubmissions(
  query: SearchSubmissionsQuery
): Promise<OpenSearchSubmissionDocument[]> {
  return globalStore.search(query);
}

export async function searchSimilarMistakes(
  topic: string,
  verdict = "WA",
  userId = "user_demo"
): Promise<OpenSearchSubmissionDocument[]> {
  return globalStore.searchSimilarMistakes(topic, verdict, userId);
}

export function clearOpenSearch() {
  globalStore.clearAll();
}

export function resetOpenSearchToMock() {
  globalStore.resetToMock();
}

export function isOpenSearchLive(): boolean {
  return globalStore.isLiveMode();
}
