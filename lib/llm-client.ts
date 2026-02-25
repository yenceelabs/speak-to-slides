/**
 * LLM client with Anthropic primary + OpenRouter/minimax-01 fallback on 429.
 *
 * Usage:
 *   import { callLLM } from "@/lib/llm-client";
 *   const text = await callLLM({ system, messages, maxTokens });
 */

import Anthropic from "@anthropic-ai/sdk";

export interface LLMMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMParams {
  system: string;
  messages: LLMMessage[];
  maxTokens?: number;
  /** Override model (Anthropic model ID). Fallback always uses minimax/minimax-01. */
  model?: string;
}

const OPENROUTER_FALLBACK_MODEL = "minimax/minimax-01";
const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

function getAnthropicKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Missing required env var: ANTHROPIC_API_KEY");
  return key;
}

function getOpenRouterKey(): string | null {
  return process.env.OPENROUTER_API_KEY || null;
}

/**
 * Call Anthropic. Throws on all errors including 429.
 */
async function callAnthropic(params: LLMParams): Promise<string> {
  const client = new Anthropic({ apiKey: getAnthropicKey() });
  const model = params.model ?? DEFAULT_ANTHROPIC_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: params.messages,
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

/**
 * Call OpenRouter with minimax-01 as fallback.
 * Uses the OpenAI-compatible API endpoint.
 */
async function callOpenRouter(params: LLMParams): Promise<string> {
  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not set — cannot use fallback model");
  }

  const body = {
    model: OPENROUTER_FALLBACK_MODEL,
    max_tokens: params.maxTokens ?? 4096,
    messages: [
      { role: "system", content: params.system },
      ...params.messages,
    ],
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://speaktoslides.com",
      "X-Title": "SpeakToSlides",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `OpenRouter fallback failed: ${res.status} ${res.statusText} — ${text.slice(0, 200)}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Main entry point. Tries Anthropic first; on 429 falls back to OpenRouter minimax-01.
 */
export async function callLLM(params: LLMParams): Promise<string> {
  try {
    return await callAnthropic(params);
  } catch (err: unknown) {
    // Detect Anthropic rate-limit / overload errors
    const is429 =
      (err instanceof Anthropic.RateLimitError) ||
      (err instanceof Anthropic.APIError && err.status === 429) ||
      (err instanceof Error &&
        (err.message.includes("429") ||
          err.message.toLowerCase().includes("rate limit") ||
          err.message.toLowerCase().includes("overloaded")));

    if (!is429) throw err; // re-throw non-429 errors

    console.warn(
      "[llm-client] Anthropic 429 — falling back to OpenRouter minimax-01"
    );

    return await callOpenRouter(params);
  }
}
