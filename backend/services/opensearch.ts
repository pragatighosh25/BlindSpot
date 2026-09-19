import { Client } from "@opensearch-project/opensearch";
import { CanonicalSubmission, SubmissionAnalysis } from "@/schemas/submission.schema";
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

const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_URL || process.env.OPENSEARCH_ENDPOINT;
const INDEX_NAME = process.env.OPENSEARCH_INDEX || "blindspot-submissions";

let openSearchClient: Client | null = null;
let isIndexInitialized = false;

function getOpenSearchClient(): Client | null {
  if (!OPENSEARCH_ENDPOINT) return null;
  if (!openSearchClient) {
    openSearchClient = new Client({
      node: OPENSEARCH_ENDPOINT,
    });
  }
  return openSearchClient;
}

async function ensureOpenSearchIndex(client: Client) {
  if (isIndexInitialized) return;
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (!exists.body) {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              user_id: { type: "keyword" },
              submission_id: { type: "keyword" },
              platform: { type: "keyword" },
              problem: {
                properties: {
                  id: { type: "keyword" },
                  title: { type: "text" },
                  difficulty: { type: "keyword" },
                  topic_tags: { type: "keyword" },
                },
              },
              submission: {
                properties: {
                  verdict: { type: "keyword" },
                  language: { type: "keyword" },
                  timestamp: { type: "long" },
                  code: { type: "text" },
                  error_message: { type: "text" },
                },
              },
              analysis: {
                properties: {
                  topic: { type: "keyword" },
                  failure_mode: { type: "text", fields: { keyword: { type: "keyword" } } },
                  root_cause: { type: "text" },
                  confidence: { type: "float" },
                  is_failure: { type: "boolean" },
                },
              },
            },
          },
        },
      });
      console.log(`[OpenSearch] Created index: ${INDEX_NAME}`);
    }
    isIndexInitialized = true;
  } catch (e) {
    console.warn(`[OpenSearch ensureIndex notice]:`, (e as Error).message);
  }
}

/**
 * In-memory OpenSearch document store for local development and live index caching.
 */
class LocalOpenSearchStore {
  private documents: Map<string, OpenSearchSubmissionDocument> = new Map();
  private isLive = false;

  constructor() {
    // Start empty so only real submissions ingested via live API or S3/OpenSearch are indexed
  }

  public clearAll() {
    this.documents.clear();
    this.isLive = true;
  }

  public resetToMock() {
    this.documents.clear();
    this.isLive = false;
  }

  public isLiveMode(): boolean {
    return this.documents.size > 0 || this.isLive;
  }

  public async save(sub: CanonicalSubmission, analysis?: SubmissionAnalysis): Promise<void> {
    const diag = analysis || (sub.analysis as SubmissionAnalysis) || diagnoseSubmissionPattern(sub);
    const doc: OpenSearchSubmissionDocument = {
      ...sub,
      analysis: diag,
    };
    this.documents.set(sub.submission_id, doc);
    this.isLive = true;
  }

  public async get(submissionId: string): Promise<OpenSearchSubmissionDocument | null> {
    return this.documents.get(submissionId) || null;
  }

  public async getByUser(userId: string): Promise<OpenSearchSubmissionDocument[]> {
    if (!userId || userId === "all") {
      return Array.from(this.documents.values());
    }
    return Array.from(this.documents.values()).filter((d) => d.user_id === userId);
  }

  public async search(options: SearchSubmissionsQuery): Promise<OpenSearchSubmissionDocument[]> {
    let results = Array.from(this.documents.values());

    if (options.userId && options.userId !== "all") {
      results = results.filter((d) => d.user_id === options.userId);
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

const globalLocalStore = new LocalOpenSearchStore();

/**
 * ============================================================================
 * Unified OpenSearch Service API (AWS OpenSearch + Local Fallback)
 * ============================================================================
 */

export async function saveSubmission(
  submission: CanonicalSubmission,
  analysis?: SubmissionAnalysis
): Promise<void> {
  const diag = analysis || (submission.analysis as SubmissionAnalysis) || diagnoseSubmissionPattern(submission);
  const doc: OpenSearchSubmissionDocument = {
    ...submission,
    analysis: diag,
  };

  const client = getOpenSearchClient();
  if (client) {
    try {
      await ensureOpenSearchIndex(client);
      await client.index({
        index: INDEX_NAME,
        id: submission.submission_id,
        body: doc,
        refresh: true,
      });
      return;
    } catch (e) {
      console.warn(`[AWS OpenSearch save error, falling back]:`, (e as Error).message);
    }
  }

  await globalLocalStore.save(submission, diag);
}

export async function getSubmission(
  submissionId: string
): Promise<OpenSearchSubmissionDocument | null> {
  const client = getOpenSearchClient();
  if (client) {
    try {
      const res = await client.get({
        index: INDEX_NAME,
        id: submissionId,
      });
      if (res.body?._source) {
        return res.body._source as OpenSearchSubmissionDocument;
      }
    } catch (e) {
      // Return null or check local
    }
  }

  return globalLocalStore.get(submissionId);
}

export async function getUserSubmissions(
  userId = "user_demo"
): Promise<OpenSearchSubmissionDocument[]> {
  const client = getOpenSearchClient();
  if (client) {
    try {
      const res = await client.search({
        index: INDEX_NAME,
        body: {
          query: {
            term: { user_id: userId },
          },
          sort: [{ "submission.timestamp": { order: "desc" } }],
          size: 100,
        },
      });

      if (res.body?.hits?.hits) {
        return res.body.hits.hits.map((h: any) => h._source as OpenSearchSubmissionDocument);
      }
    } catch (e) {
      console.warn(`[AWS OpenSearch getUserSubmissions error]:`, (e as Error).message);
    }
  }

  return globalLocalStore.getByUser(userId);
}

export async function searchSubmissions(
  query: SearchSubmissionsQuery
): Promise<OpenSearchSubmissionDocument[]> {
  const client = getOpenSearchClient();
  if (client) {
    try {
      const mustClauses: any[] = [];

      if (query.userId && query.userId !== "all") {
        mustClauses.push({ term: { user_id: query.userId } });
      }
      if (query.platform) {
        mustClauses.push({ term: { platform: query.platform.toLowerCase() } });
      }
      if (query.verdict) {
        mustClauses.push({ term: { "submission.verdict": query.verdict.toUpperCase() } });
      }
      if (query.topic) {
        mustClauses.push({ match: { "problem.topic_tags": query.topic } });
      }
      if (query.query && query.query.trim().length > 0) {
        mustClauses.push({
          multi_match: {
            query: query.query,
            fields: [
              "problem.title^2",
              "problem.id",
              "problem.topic_tags",
              "submission.code",
              "analysis.failure_mode",
              "analysis.root_cause",
            ],
          },
        });
      }

      const res = await client.search({
        index: INDEX_NAME,
        body: {
          query: mustClauses.length > 0 ? { bool: { must: mustClauses } } : { match_all: {} },
          sort: [{ "submission.timestamp": { order: "desc" } }],
          size: query.limit || 50,
        },
      });

      if (res.body?.hits?.hits) {
        return res.body.hits.hits.map((h: any) => h._source as OpenSearchSubmissionDocument);
      }
    } catch (e) {
      console.warn(`[AWS OpenSearch search error, falling back to local]:`, (e as Error).message);
    }
  }

  return globalLocalStore.search(query);
}

export async function searchSimilarMistakes(
  topic: string,
  verdict = "WA",
  userId = "user_demo"
): Promise<OpenSearchSubmissionDocument[]> {
  const client = getOpenSearchClient();
  if (client) {
    try {
      const res = await client.search({
        index: INDEX_NAME,
        body: {
          query: {
            bool: {
              must: [
                { term: { user_id: userId } },
                { match: { "problem.topic_tags": topic } },
                { term: { "submission.verdict": verdict } },
              ],
            },
          },
          sort: [{ "submission.timestamp": { order: "desc" } }],
          size: 20,
        },
      });

      if (res.body?.hits?.hits) {
        return res.body.hits.hits.map((h: any) => h._source as OpenSearchSubmissionDocument);
      }
    } catch (e) {
      console.warn(`[AWS OpenSearch searchSimilarMistakes error]:`, (e as Error).message);
    }
  }

  return globalLocalStore.searchSimilarMistakes(topic, verdict, userId);
}

export function clearOpenSearch() {
  globalLocalStore.clearAll();
}

export function resetOpenSearchToMock() {
  globalLocalStore.resetToMock();
}

export function isOpenSearchLive(): boolean {
  return globalLocalStore.isLiveMode();
}
