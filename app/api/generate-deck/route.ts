import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";
import { auth } from "@clerk/nextjs/server";
import { checkAndRecordUsage } from "@/lib/supabase";
import { generateDeck, createDeckWithSlides } from "@/lib/deck-generator";
import { renderDeckToHTML } from "@/lib/deck-renderer";
import { trackServer, Events } from "@/lib/posthog";

function getClientIp(req: NextRequest): string | null {
  const realIp = req.headers.get("x-real-ip");
  if (realIp && isIP(realIp)) {
    return realIp;
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (!forwardedFor) return null;

  const firstValid = forwardedFor
    .split(",")
    .map((ip) => ip.trim())
    .find((ip) => Boolean(ip) && isIP(ip));

  return firstValid || null;
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
    const ipAddress = getClientIp(req);

    // SECURITY: user identity comes from server-side auth, not request body.
    let userId: string | null = null;
    try {
      const authState = await auth();
      userId = authState.userId;
    } catch (authError) {
      // Keep anonymous flow working even when Clerk isn't configured in a given env.
      console.warn("Clerk auth unavailable in generate-deck route:", authError);
    }
    const usageCheck = await checkAndRecordUsage(ipAddress, userId || null);
    if (!usageCheck.allowed) {
      await trackServer(userId || ipAddress || "anon", Events.FREE_LIMIT_HIT, {
        channel: "web",
      });
      return NextResponse.json(
        { error: usageCheck.reason || "Usage limit reached" },
        { status: 429 }
      );
    }

    // Track prompt sent
    await trackServer(userId || ipAddress || "anon", Events.WEB_PROMPT_SENT, {
      prompt_length: prompt.trim().length,
    });

    // Check Pro status via Clerk public metadata
    let isPro = false;
    if (userId) {
      try {
        const { clerkClient } = await import("@clerk/nextjs/server");
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);
        isPro = Boolean(user.publicMetadata?.isPro);
      } catch (proCheckError) {
        console.warn("Failed to check Pro status, defaulting to free:", proCheckError);
        isPro = false;
      }
    }

    const { deckJson } = await generateDeck(prompt.trim(), isPro);
    const htmlContent = renderDeckToHTML(deckJson, isPro);

    // Store in Supabase (with slides_json for future editing)
    const deck = await createDeckWithSlides({
      userId: userId || null,
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
    await trackServer(userId || ipAddress || "anon", Events.DECK_CREATED, {
      deck_id: deck.id,
      slide_count: deckJson.slides.length,
      theme: deckJson.theme,
      channel: "web",
    });

    return NextResponse.json({
      deckId: deck.id,
      url: deckUrl,
      title: deckJson.title,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme,
    });
  } catch (error) {
    console.error("generate-deck error:", error instanceof Error ? error.message : "unknown error");

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
