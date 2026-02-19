import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createDeck, checkAndRecordUsage } from "@/lib/supabase";
import { renderDeckToHTML, parseDeckJSON, DeckJSON } from "@/lib/deck-renderer";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const DECK_SYSTEM_PROMPT = `You are a professional presentation designer. Convert the user's request into a beautiful, engaging presentation.

Output ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Presentation Title",
  "theme": "modern",
  "slides": [
    { "type": "title", "heading": "...", "subtitle": "..." },
    { "type": "bullets", "heading": "...", "points": ["point 1", "point 2", "point 3"] },
    { "type": "content", "heading": "...", "body": "paragraph text" },
    { "type": "quote", "text": "...", "attribution": "..." },
    { "type": "stats", "heading": "...", "stats": [{"value": "90%", "label": "description"}] },
    { "type": "image", "heading": "...", "caption": "...", "placeholder": true }
  ]
}

Theme options: "modern" (dark navy, indigo accent), "minimal" (light, clean), "bold" (dark, amber accent)

Rules:
- Generate 8-12 slides for a standard deck
- Always start with a title slide
- Always end with a "Thank You" or "Questions?" title slide
- Mix slide types for visual variety (avoid 3+ bullets in a row)
- Keep text concise — presentations need punchy text, not paragraphs
- For bullets: max 5 points per slide, each under 15 words
- For stats: use real or realistic statistics when possible
- Choose theme based on content: modern for tech, minimal for business, bold for creative/marketing
- The title in the JSON should be a clean, professional title (not "Create a deck about...")`;

async function generateDeck(
  prompt: string,
  isPro: boolean = false
): Promise<{ deckJson: DeckJSON; rawContent: string }> {
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
    const body = await req.json();
    const { prompt, userId } = body as {
      prompt: string;
      userId?: string;
    };

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

    // Check usage limits
    const usageCheck = await checkAndRecordUsage(ipAddress, userId);
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.reason || "Usage limit reached" },
        { status: 429 }
      );
    }

    // Generate deck with Claude
    const { deckJson } = await generateDeck(prompt.trim(), !!userId);

    // Render to self-contained HTML
    const htmlContent = renderDeckToHTML(deckJson);

    // Store in Supabase
    const deck = await createDeck({
      userId: userId || null,
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
