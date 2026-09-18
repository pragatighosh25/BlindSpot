import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { WeakTopic } from "@/schemas/analysis.schema";
import { ScheduledReviewItem } from "@/scheduler/spaced-repetition";

export interface UserProfileRecord {
  userId: string;
  email?: string;
  passwordHash?: string;
  leetcodeUsername?: string;
  codeforcesHandle?: string;
  isVerified?: boolean;
  leetcodeVerified?: boolean;
  codeforcesVerified?: boolean;
  createdAt: number;
  updatedAt: number;
  lastSyncAt?: number;
}

const TABLE_NAME = process.env.DYNAMODB_TABLE || process.env.CORE_TABLE || "BlindSpot-Core";
const IS_AWS_CONFIGURED = Boolean(process.env.AWS_REGION && (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.DYNAMODB_TABLE));

// Lazy-initialized AWS DynamoDB Document Client
let ddbDocClient: DynamoDBDocumentClient | null = null;

function getDocClient(): DynamoDBDocumentClient | null {
  if (!IS_AWS_CONFIGURED) return null;
  if (!ddbDocClient) {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
    });
    ddbDocClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return ddbDocClient;
}

/**
 * Local In-Memory Fallback for Local Development & Unit Tests
 */
class LocalDynamoDBStore {
  private profiles = new Map<string, UserProfileRecord>();
  private weaknesses = new Map<string, WeakTopic[]>();
  private schedules = new Map<string, Map<string, ScheduledReviewItem>>();
  private analysisRuns = new Map<string, any[]>();
  private fullAnalyses = new Map<string, any>();

  public async saveProfile(profile: UserProfileRecord) {
    this.profiles.set(profile.userId, { ...profile });
  }

  public async getProfile(userId: string): Promise<UserProfileRecord | null> {
    return this.profiles.get(userId) || null;
  }

  public async saveWeaknesses(userId: string, weakTopics: WeakTopic[]) {
    this.weaknesses.set(userId, [...weakTopics]);
  }

  public async getWeaknesses(userId: string): Promise<WeakTopic[]> {
    return this.weaknesses.get(userId) || [];
  }

  public async saveScheduleItem(userId: string, item: ScheduledReviewItem) {
    if (!this.schedules.has(userId)) {
      this.schedules.set(userId, new Map());
    }
    this.schedules.get(userId)!.set(item.id, { ...item });
  }

  public async getSchedule(userId: string): Promise<ScheduledReviewItem[]> {
    const userMap = this.schedules.get(userId);
    return userMap ? Array.from(userMap.values()) : [];
  }

  public async saveAnalysisRun(userId: string, run: any) {
    if (!this.analysisRuns.has(userId)) {
      this.analysisRuns.set(userId, []);
    }
    this.analysisRuns.get(userId)!.push(run);
  }

  public async getLatestAnalysisRun(userId: string): Promise<any | null> {
    const runs = this.analysisRuns.get(userId);
    return runs && runs.length > 0 ? runs[runs.length - 1] : null;
  }

  public async saveLatestAnalysis(userId: string, analysis: any) {
    this.fullAnalyses.set(userId, { ...analysis });
  }

  public async getLatestAnalysis(userId: string): Promise<any | null> {
    return this.fullAnalyses.get(userId) || null;
  }
}

const localStore = new LocalDynamoDBStore();

/**
 * ============================================================================
 * DynamoDB Service Abstraction
 * ============================================================================
 */

// 1. User Profile Operations
export async function saveUserProfile(profile: {
  userId: string;
  email?: string;
  passwordHash?: string;
  leetcodeUsername?: string;
  codeforcesHandle?: string;
  isVerified?: boolean;
  leetcodeVerified?: boolean;
  codeforcesVerified?: boolean;
  lastSyncAt?: number;
}): Promise<UserProfileRecord> {
  const now = Date.now();
  const existing = await getUserProfile(profile.userId);

  const record: UserProfileRecord = {
    userId: profile.userId,
    email: profile.email || existing?.email,
    passwordHash: profile.passwordHash || existing?.passwordHash,
    leetcodeUsername: profile.leetcodeUsername || existing?.leetcodeUsername,
    codeforcesHandle: profile.codeforcesHandle || existing?.codeforcesHandle,
    isVerified: profile.isVerified !== undefined ? profile.isVerified : existing?.isVerified ?? true,
    leetcodeVerified: profile.leetcodeVerified !== undefined ? profile.leetcodeVerified : existing?.leetcodeVerified ?? true,
    codeforcesVerified: profile.codeforcesVerified !== undefined ? profile.codeforcesVerified : existing?.codeforcesVerified ?? true,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    lastSyncAt: profile.lastSyncAt || now,
  };

  const client = getDocClient();
  if (client) {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${record.userId}`,
          SK: `PROFILE`,
          Type: "UserProfile",
          ...record,
        },
      })
    );
  } else {
    await localStore.saveProfile(record);
  }

  return record;
}

export async function getUserProfile(userId: string): Promise<UserProfileRecord | null> {
  const client = getDocClient();
  if (client) {
    try {
      const res = await client.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `PROFILE`,
          },
        })
      );
      if (res.Item) {
        return {
          userId: res.Item.userId,
          email: res.Item.email,
          passwordHash: res.Item.passwordHash,
          leetcodeUsername: res.Item.leetcodeUsername,
          codeforcesHandle: res.Item.codeforcesHandle,
          isVerified: res.Item.isVerified,
          leetcodeVerified: res.Item.leetcodeVerified,
          codeforcesVerified: res.Item.codeforcesVerified,
          createdAt: res.Item.createdAt,
          updatedAt: res.Item.updatedAt,
          lastSyncAt: res.Item.lastSyncAt,
        };
      }
    } catch (e) {
      console.warn(`[DynamoDB getUserProfile Error]:`, (e as Error).message);
    }
  }

  return localStore.getProfile(userId);
}

// 2. Weaknesses Operations
export async function saveWeaknesses(userId: string, weaknesses: WeakTopic[]): Promise<void> {
  const client = getDocClient();
  const now = Date.now();

  if (client && weaknesses.length > 0) {
    // Write in batch
    const putRequests = weaknesses.map((w) => ({
      PutRequest: {
        Item: {
          PK: `USER#${userId}`,
          SK: `WEAKNESS#${w.topic}#${w.failure_mode}`,
          Type: "Weakness",
          userId,
          updatedAt: now,
          ...w,
        },
      },
    }));

    // DynamoDB batch limit is 25 items per chunk
    for (let i = 0; i < putRequests.length; i += 25) {
      const chunk = putRequests.slice(i, i + 25);
      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: chunk,
          },
        })
      );
    }
  } else {
    await localStore.saveWeaknesses(userId, weaknesses);
  }
}

export async function getWeaknessesFromDynamo(userId: string): Promise<WeakTopic[]> {
  const client = getDocClient();
  if (client) {
    try {
      const res = await client.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
          ExpressionAttributeValues: {
            ":pk": `USER#${userId}`,
            ":prefix": "WEAKNESS#",
          },
        })
      );

      if (res.Items && res.Items.length > 0) {
        return res.Items.map((item) => ({
          topic: item.topic,
          failure_mode: item.failure_mode,
          confidence: item.confidence,
          evidence_count: item.evidence_count,
          example_submissions: item.example_submissions || [],
          description: item.description,
          root_cause: item.root_cause,
          why_it_fails: item.why_it_fails,
          correct_concept: item.correct_concept,
          suggested_fix: item.suggested_fix,
        }));
      }
    } catch (e) {
      console.warn(`[DynamoDB getWeaknesses Error]:`, (e as Error).message);
    }
  }

  return localStore.getWeaknesses(userId);
}

// 3. Spaced Repetition Schedule Operations
export async function saveScheduleToDynamo(userId: string, item: ScheduledReviewItem): Promise<void> {
  const client = getDocClient();
  if (client) {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `SCHEDULE#${item.platform}#${item.problem_id}`,
          Type: "ScheduleItem",
          userId,
          ...item,
        },
      })
    );
  } else {
    await localStore.saveScheduleItem(userId, item);
  }
}

export async function getScheduleFromDynamo(userId: string): Promise<ScheduledReviewItem[]> {
  const client = getDocClient();
  if (client) {
    try {
      const res = await client.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
          ExpressionAttributeValues: {
            ":pk": `USER#${userId}`,
            ":prefix": "SCHEDULE#",
          },
        })
      );

      if (res.Items) {
        return res.Items.map((item) => ({
          id: item.id || `sched_${item.problem_id}_${item.platform}`,
          problem_id: item.problem_id,
          title: item.title,
          topic: item.topic,
          platform: item.platform,
          reason: item.reason,
          url: item.url,
          step_index: item.step_index,
          intervals_days: item.intervals_days,
          scheduled_date: item.scheduled_date,
          completed_history: item.completed_history || [],
          status: item.status,
        }));
      }
    } catch (e) {
      console.warn(`[DynamoDB getSchedule Error]:`, (e as Error).message);
    }
  }

  return localStore.getSchedule(userId);
}

// 4. Analysis Run Recording
export async function recordAnalysisRun(
  userId: string,
  run: {
    analyzed_at: number;
    summary?: string;
    weak_topics_count: number;
    recommended_problems_count: number;
  }
): Promise<void> {
  const client = getDocClient();
  if (client) {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `RUN#${run.analyzed_at}`,
          Type: "AnalysisRun",
          userId,
          ...run,
        },
      })
    );
  } else {
    await localStore.saveAnalysisRun(userId, run);
  }
}

// 5. Full Structured Analysis Document Persistence
export async function saveLatestAnalysis(userId: string, analysis: any): Promise<void> {
  const client = getDocClient();
  if (client) {
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${userId}`,
          SK: `LATEST_ANALYSIS`,
          Type: "LatestAnalysis",
          userId,
          analysis,
          updatedAt: Date.now(),
        },
      })
    );
  } else {
    await localStore.saveLatestAnalysis(userId, analysis);
  }
}

export async function getLatestAnalysisFromDynamo(userId: string): Promise<any | null> {
  const client = getDocClient();
  if (client) {
    try {
      const res = await client.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `LATEST_ANALYSIS`,
          },
        })
      );
      if (res.Item && res.Item.analysis) {
        return res.Item.analysis;
      }
    } catch (e) {
      console.warn(`[DynamoDB getLatestAnalysis Error]:`, (e as Error).message);
    }
  }

  return localStore.getLatestAnalysis(userId);
}

