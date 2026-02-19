import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createDeck, checkAndRecordUsage } from "@/lib/supabase";
import { renderDeckToHTML, parseDeckJSON, DeckJSON } from "@/lib/deck-renderer";
import { requireEnv } from "@/lib/env";
import { DECK_SYSTEM_PROMPT } from "@/lib/deck-prompts";

async function generateDeck(
  prompt: string,
  isPro: boolean = false
): Promise<{ deckJson: DeckJSON; rawContent: string }> {
  // Fail fast if API key is missing
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  const model = isPro ? "claude-sonnet-4-20250514" : "claude-3-haiku-20240307";

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: DECK_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const rawContent =
    message.content[0].type === "text" ? message.content[0].text : "";

  const deckJson = parseDeckJSON(rawContent);
  return { deckJson, rawContent };
}

export async function POST(req: NextRequest) {
  try {
    // Parse body safely
    let body: { prompt?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a valid prompt (at least 5 characters)" },
        { status: 400 }
      );
    }

    // Get IP for rate limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.headers.get("x-real-ip") || null;

    // SECURITY: Do NOT accept userId from the request body (untrusted client input).
    // Rate limit all web requests by IP only.
    // The Telegram bot uses /api/telegram (server-side) and manages its own userId.
    const usageCheck = await checkAndRecordUsage(ipAddress, null);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.reason || "Usage limit reached" },
        { status: 429 }
      );
    }

    // Generate deck with Claude (free tier = Haiku, pro = Sonnet)
    const { deckJson } = await generateDeck(prompt.trim(), false);

    // Render to self-contained HTML
    const htmlContent = renderDeckToHTML(deckJson);

    // Store in Supabase
    const deck = await createDeck({
      userId: null,
      title: deckJson.title,
      prompt: prompt.trim(),
      htmlContent,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme || "modern",
    });

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com"
    ).trim().replace(/\/$/, "");
    const deckUrl = `${baseUrl}/d/${deck.id}`;

    return NextResponse.json({
      deckId: deck.id,
      url: deckUrl,
      title: deckJson.title,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme,
    });
  } catch (error) {
    console.error("generate-deck error:", error);

    if (error instanceof Error && error.message.includes("Missing required env var")) {
      return NextResponse.json(
        { error: "Service not configured. Please try again later." },
        { status: 503 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate deck. Please try again." },
      { status: 500 }
    );
  }
}
