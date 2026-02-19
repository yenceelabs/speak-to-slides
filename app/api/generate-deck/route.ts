import { NextRequest, NextResponse } from "next/server";
import { checkAndRecordUsage } from "@/lib/supabase";
import { generateDeck, createDeckWithSlides } from "@/lib/deck-generator";
import { renderDeckToHTML } from "@/lib/deck-renderer";

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
      return NextResponse.json(
        { error: usageCheck.reason || "Usage limit reached" },
        { status: 429 }
      );
    }

    // Generate deck with shared generator (free tier = Haiku)
    const { deckJson } = await generateDeck(prompt.trim(), false);
    const htmlContent = renderDeckToHTML(deckJson);

    // Store in Supabase (with slides_json for future editing)
    const deck = await createDeckWithSlides({
      userId: null,
      title: deckJson.title,
      prompt: prompt.trim(),
      htmlContent,
      slidesJson: deckJson.slides,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme || "modern",
    });

    const baseUrl = (
      process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com"
    )
      .trim()
      .replace(/\/$/, "");
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
