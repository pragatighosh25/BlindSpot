import { GoogleGenAI } from "@google/genai";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LLMTelemetryInfo {
  provider: "Gemini";
  model: string;
  source: "GEMINI" | "FALLBACK";
  timestamp: number;
  lastError?: string;
  requestCount: number;
  successCount: number;
  fallbackCount: number;
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

let geminiClient: GoogleGenAI | null = null;

let currentRunInvocationCount = 0;
let isInAnalysisRun = false;

/**
 * Marks the beginning of an analysis run and resets invocation counters.
 */
export function startAnalysisRun(): void {
  isInAnalysisRun = true;
  currentRunInvocationCount = 0;
  console.log(`[LLM] Analysis run started`);
}

/**
 * Marks the completion of an analysis run.
 */
export function endAnalysisRun(): void {
  isInAnalysisRun = false;
  currentRunInvocationCount = 0;
}

/**
 * Returns the invocation count for the current analysis run.
 */
export function getAnalysisRunInvocationCount(): number {
  return currentRunInvocationCount;
}

let telemetryState: LLMTelemetryInfo = {
  provider: "Gemini",
  model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
  source: "FALLBACK",
  timestamp: Date.now(),
  requestCount: 0,
  successCount: 0,
  fallbackCount: 0,
};

/**
 * Returns current internal telemetry metadata for debugging and observability.
 */
export function getLLMTelemetry(): LLMTelemetryInfo {
  return { ...telemetryState };
}

/**
 * Updates internal telemetry state without altering external API contracts.
 */
export function recordLLMTelemetry(update: Partial<LLMTelemetryInfo>) {
  telemetryState = {
    ...telemetryState,
    ...update,
    timestamp: Date.now(),
  };
}

/**
 * Sanitizes error messages to ensure API keys or credentials are never exposed in logs.
 */
export function sanitizeErrorMessage(msg: string): string {
  const apiKey = process.env.GEMINI_API_KEY;
  let clean = msg;
  if (apiKey && apiKey.trim().length > 4) {
    clean = clean.split(apiKey.trim()).join("[REDACTED_API_KEY]");
  }
  return clean.replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]");
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
    });
  }
  return geminiClient;
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
 * Uses Google Gemini API when GEMINI_API_KEY is configured,
 * or returns null to signal deterministic offline fallback.
 */
export async function invokeLLM(
  systemPrompt: string,
  userPrompt: string,
  options: LLMRequestOptions = {}
): Promise<string | null> {
  if (isInAnalysisRun) {
    currentRunInvocationCount++;
    if (currentRunInvocationCount === 1) {
      console.log(`[LLM] Gemini invocation #1`);
    } else {
      console.log(`[LLM] WARNING: Gemini invocation #${currentRunInvocationCount} in the same analysis run`);
    }
  } else {
    console.log(`[LLM] Gemini invocation #1`);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const gemini = getGeminiClient();

  if (!gemini) {
    const safeError = "GEMINI_API_KEY is not configured";
    console.log(`[LLM] Gemini request failed: ${safeError}`);
    recordLLMTelemetry({
      provider: "Gemini",
      model,
      source: "FALLBACK",
      lastError: safeError,
      fallbackCount: telemetryState.fallbackCount + 1,
    });
    return null;
  }

  console.log(`[LLM] Provider: Gemini`);
  console.log(`[LLM] Model: ${model}`);
  console.log(`[LLM] Sending request...`);
  recordLLMTelemetry({
    provider: "Gemini",
    model,
    requestCount: telemetryState.requestCount + 1,
  });

  try {
    const config: {
      temperature?: number;
      maxOutputTokens?: number;
      systemInstruction?: string;
      responseMimeType?: string;
    } = {
      temperature: options.temperature ?? 0.1,
    };

    if (options.maxTokens) {
      config.maxOutputTokens = options.maxTokens;
    }

    if (systemPrompt && systemPrompt.trim()) {
      config.systemInstruction = systemPrompt.trim();
    }

    if (options.jsonMode) {
      config.responseMimeType = "application/json";
    }

    const response = await gemini.models.generateContent({
      model,
      contents: userPrompt,
      config,
    });

    const responseText = response.text || null;
    if (responseText && responseText.trim()) {
      console.log(`[LLM] Gemini response received`);
      recordLLMTelemetry({
        provider: "Gemini",
        model,
        source: "GEMINI",
        lastError: undefined,
        successCount: telemetryState.successCount + 1,
      });
      return responseText;
    }

    const safeError = "Empty or null response payload received from Gemini";
    console.log(`[LLM] Gemini request failed: ${safeError}`);
    recordLLMTelemetry({
      provider: "Gemini",
      model,
      source: "FALLBACK",
      lastError: safeError,
      fallbackCount: telemetryState.fallbackCount + 1,
    });
    return null;
  } catch (err) {
    const safeError = sanitizeErrorMessage((err as Error).message || "Unknown error during Gemini invocation");
    console.log(`[LLM] Gemini request failed: ${safeError}`);
    recordLLMTelemetry({
      provider: "Gemini",
      model,
      source: "FALLBACK",
      lastError: safeError,
      fallbackCount: telemetryState.fallbackCount + 1,
    });
    return null;
  }
}


