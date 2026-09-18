import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

const BUCKET_NAME = process.env.S3_BUCKET || process.env.RAW_DATA_BUCKET || "blindspot-raw-submissions";
const IS_AWS_CONFIGURED = Boolean(process.env.AWS_REGION && (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.S3_BUCKET));

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!IS_AWS_CONFIGURED) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
    });
  }
  return s3Client;
}

/**
 * Local file system fallback directory for storing raw payloads
 */
const LOCAL_RAW_DIR = path.join(__dirname, "../../data/raw");

function ensureLocalDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Save raw API payload into S3 (or local fallback)
 * Key: raw/{userId}/{platform}/{timestamp}.json
 */
export async function saveRawPayload(
  userId: string,
  platform: "leetcode" | "codeforces",
  payload: unknown,
  timestamp = Date.now()
): Promise<string> {
  const key = `raw/${userId}/${platform}/${timestamp}.json`;
  const bodyString = JSON.stringify(payload, null, 2);

  const client = getS3Client();
  if (client) {
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: bodyString,
        ContentType: "application/json",
        ServerSideEncryption: "AES256",
      })
    );
  } else {
    // Local filesystem storage
    const targetDir = path.join(LOCAL_RAW_DIR, userId, platform);
    ensureLocalDir(targetDir);
    const filePath = path.join(targetDir, `${timestamp}.json`);
    fs.writeFileSync(filePath, bodyString, "utf-8");
  }

  return key;
}

/**
 * Retrieve raw payload by key from S3 (or local fallback)
 */
export async function getRawPayload(key: string): Promise<unknown | null> {
  const client = getS3Client();
  if (client) {
    try {
      const res = await client.send(
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      );
      if (res.Body) {
        const str = await res.Body.transformToString();
        return JSON.parse(str);
      }
    } catch (e) {
      console.warn(`[S3 getRawPayload Error]:`, (e as Error).message);
    }
    return null;
  }

  // Local filesystem lookup
  const localPath = path.join(LOCAL_RAW_DIR, "..", "..", key);
  const altPath = path.join(LOCAL_RAW_DIR, key.replace(/^raw\//, ""));
  const chosenPath = fs.existsSync(localPath) ? localPath : altPath;

  if (fs.existsSync(chosenPath)) {
    const raw = fs.readFileSync(chosenPath, "utf-8");
    return JSON.parse(raw);
  }

  return null;
}
