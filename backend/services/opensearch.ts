import { CanonicalSubmission } from "@/schemas/submission.schema";
import initialSubmissions from "@/data/mock-submissions.json";

export interface OpenSearchSubmissionDocument extends CanonicalSubmission {
  analysis?: {
    failure_mode?: string;
    explanation?: string;
    topic?: string;
    confidence?: number;
  };
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
 * Automatically loads 37+ mock submissions.
 */
class LocalOpenSearchStore {
  private documents: Map<string, OpenSearchSubmissionDocument> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    for (const sub of initialSubmissions as CanonicalSubmission[]) {
      this.documents.set(sub.submission_id, { ...sub });
    }
  }

  public async save(sub: CanonicalSubmission, analysis?: OpenSearchSubmissionDocument["analysis"]): Promise<void> {
    const doc: OpenSearchSubmissionDocument = {
      ...sub,
      analysis: analysis || this.documents.get(sub.submission_id)?.analysis,
    };
    this.documents.set(sub.submission_id, doc);
  }

  public async get(submissionId: string): Promise<OpenSearchSubmissionDocument | null> {
    return this.documents.get(submissionId) || null;
  }

  public async getByUser(userId: string): Promise<OpenSearchSubmissionDocument[]> {
    return Array.from(this.documents.values()).filter(
      (d) => !userId || d.user_id === userId || d.user_id === "user_demo" || d.user_id === "default_user"
    );
  }

  public async search(options: SearchSubmissionsQuery): Promise<OpenSearchSubmissionDocument[]> {
    let results = Array.from(this.documents.values());

    if (options.userId) {
      results = results.filter((d) => d.user_id === options.userId || d.user_id === "user_demo" || d.user_id === "default_user");
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
  analysis?: OpenSearchSubmissionDocument["analysis"]
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
