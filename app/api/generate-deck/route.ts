import { NextRequest, NextResponse } from "next/server";
import { checkAndRecordUsage } from "@/lib/supabase";
import { generateDeck, createDeckWithSlides } from "@/lib/deck-generator";
import { renderDeckToHTML } from "@/lib/deck-renderer";
import { trackServer, Events } from "@/lib/posthog";

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
    const usageCheck = await checkAndRecordUsage(ipAddress, null);
    if (!usageCheck.allowed) {
      await trackServer(ipAddress || 'anon', Events.FREE_LIMIT_HIT, { channel: 'web' });
      return NextResponse.json(
        { error: usageCheck.reason || "Usage limit reached" },
        { status: 429 }
      );
    }

    // Track prompt sent
    await trackServer(ipAddress || 'anon', Events.WEB_PROMPT_SENT, {
      prompt_length: prompt.trim().length,
    });

    // Generate deck with shared generator (free tier = Haiku, no pro)
    const isPro = false; // TODO: check Clerk userId + subscription when payments ship
    const { deckJson } = await generateDeck(prompt.trim(), isPro);
    const htmlContent = renderDeckToHTML(deckJson, isPro);

    // Store in Supabase (with slides_json for future editing)
    const deck = await createDeckWithSlides({
      userId: null,
      title: deckJson.title,
      prompt: prompt.trim(),
      htmlContent,
      slidesJson: deckJson.slides,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme || "modern",
      isPro,
    });

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com"
    )
      .trim()
      .replace(/\/$/, "");
    const deckUrl = `${baseUrl}/d/${deck.id}`;

    // Track deck created
    await trackServer(ipAddress || 'anon', Events.DECK_CREATED, {
      deck_id: deck.id,
      slide_count: deckJson.slides.length,
      theme: deckJson.theme,
      channel: 'web',
    });

    return NextResponse.json({
      deckId: deck.id,
      url: deckUrl,
      title: deckJson.title,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme,
    });
  } catch (error) {
    console.error("generate-deck error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Missing required env var")
    ) {
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
