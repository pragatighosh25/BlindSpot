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

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let geminiClient: GoogleGenAI | null = null;

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
  const gemini = getGeminiClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  if (gemini) {
    try {
      console.log(`[Gemini] Invoking ${model}...`);

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
      if (responseText) {
        console.log(`[Gemini] Successfully received response from ${model} (${responseText.length} chars)`);
      }
      return responseText;
    } catch (err) {
      console.error(`[Gemini Error] Failed invoking ${model}: ${(err as Error).name} - ${(err as Error).message}`);
      return null;
    }
  }

  return null;
}

