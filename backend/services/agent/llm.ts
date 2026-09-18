import OpenAI from "openai";

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey.trim(),
    });
  }
  return openaiClient;
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
 * Uses OpenAI API when OPENAI_API_KEY is configured,
 * or returns null to signal deterministic offline fallback.
 */
export async function invokeLLM(
  systemPrompt: string,
  userPrompt: string,
  options: LLMRequestOptions = {}
): Promise<string | null> {
  const openai = getOpenAIClient();
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (openai) {
    try {
      console.log(`[OpenAI] Invoking ${model}...`);

      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemPrompt && systemPrompt.trim()) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: userPrompt });

      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature: options.temperature ?? 0.1,
        max_tokens: options.maxTokens || 2048,
      });

      const responseText = completion.choices?.[0]?.message?.content || null;
      if (responseText) {
        console.log(`[OpenAI] Successfully received response from ${model} (${responseText.length} chars)`);
      }
      return responseText;
    } catch (err) {
      console.error(`[OpenAI Error] Failed invoking ${model}: ${(err as Error).name} - ${(err as Error).message}`);
      return null;
    }
  }

  return null;
}
