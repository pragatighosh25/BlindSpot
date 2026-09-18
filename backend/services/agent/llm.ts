import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

const BEDROCK_REGION = process.env.AWS_REGION || process.env.BEDROCK_REGION || "us-east-1";
const BEDROCK_MODEL_ID =
  process.env.BEDROCK_MODEL_ID ||
  process.env.LLM_MODEL_ID ||
  "anthropic.claude-3-5-sonnet-20240620-v1:0";

let bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient | null {
  // Only initialize if AWS credentials or IAM role might be present
  if (!process.env.AWS_ACCESS_KEY_ID && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.USE_BEDROCK) {
    return null;
  }
  if (!bedrockClient) {
    try {
      bedrockClient = new BedrockRuntimeClient({ region: BEDROCK_REGION });
    } catch {
      bedrockClient = null;
    }
  }
  return bedrockClient;
}

/**
 * Extracts and cleans JSON from LLM text responses, stripping markdown code fences.
 */
export function extractJsonFromResponse<T = any>(rawText: string): T {
  let cleaned = rawText.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }

  // Attempt direct parse
  try {
    return JSON.parse(cleaned);
  } catch (initialErr) {
    // Attempt substring extraction between first { and last } or first [ and last ]
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {}
    }

    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
      } catch {}
    }

    throw new Error(`Failed to parse valid JSON from LLM response: ${(initialErr as Error).message}`);
  }
}

/**
 * Core LLM invoker for the Strands agent.
 * Tries Amazon Bedrock first if available, then custom HTTP provider if configured,
 * or returns null to signal deterministic offline fallback.
 */
export async function invokeLLM(
  systemPrompt: string,
  userPrompt: string,
  options: LLMRequestOptions = {}
): Promise<string | null> {
  // 1. Try Amazon Bedrock Runtime
  const bedrock = getBedrockClient();
  if (bedrock) {
    try {
      if (BEDROCK_MODEL_ID.includes("claude")) {
        const payload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.1,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        };

        const command = new InvokeModelCommand({
          modelId: BEDROCK_MODEL_ID,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(payload),
        });

        const response = await bedrock.send(command);
        const decoded = new TextDecoder().decode(response.body);
        const parsed = JSON.parse(decoded);
        return parsed.content?.[0]?.text || null;
      } else if (BEDROCK_MODEL_ID.includes("amazon.titan")) {
        const payload = {
          inputText: `${systemPrompt}\n\nUser: ${userPrompt}\n\nAssistant:`,
          textGenerationConfig: {
            maxTokenCount: options.maxTokens || 2048,
            temperature: options.temperature ?? 0.1,
          },
        };

        const command = new InvokeModelCommand({
          modelId: BEDROCK_MODEL_ID,
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify(payload),
        });

        const response = await bedrock.send(command);
        const decoded = new TextDecoder().decode(response.body);
        const parsed = JSON.parse(decoded);
        return parsed.results?.[0]?.outputText || null;
      }
    } catch (err) {
      console.warn(`[Bedrock Invocation Warning]: ${(err as Error).message}. Falling back to internal engine.`);
    }
  }

  // 2. Try Generic OpenAI / Compatible Endpoint if env set
  const genericApiUrl = process.env.LLM_API_URL;
  const genericApiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  if (genericApiUrl && genericApiKey) {
    try {
      const res = await fetch(genericApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${genericApiKey}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: options.temperature ?? 0.1,
          max_tokens: options.maxTokens || 4096,
        }),
      });

      if (res.ok) {
        const data: any = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (err) {
      console.warn(`[Generic LLM API Warning]: ${(err as Error).message}. Falling back.`);
    }
  }

  return null;
}
