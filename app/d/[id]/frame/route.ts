import { NextRequest, NextResponse } from "next/server";
import { getDeckById } from "@/lib/supabase";
import { normalizeDeckJSON, renderDeckToHTML } from "@/lib/deck-renderer";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deck = await getDeckById(params.id);

  if (!deck) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let html: string;
  try {
    const sourceSlides = Array.isArray(deck.slides_json)
      ? deck.slides_json
      : [
          {
            type: "title",
            heading: deck.title || "Presentation",
            subtitle:
              typeof deck.prompt === "string"
                ? deck.prompt.slice(0, 180)
                : undefined,
          },
        ];
    const normalized = normalizeDeckJSON({
      title: deck.title,
      theme: deck.theme,
      slides: sourceSlides,
    });
    html = renderDeckToHTML(normalized, Boolean(deck.is_pro));
  } catch (error) {
    console.error("Failed to render deck HTML:", error instanceof Error ? error.message : "unknown error");
    return new NextResponse("Failed to render deck", { status: 500 });
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": [
        "default-src 'none'",
        "style-src 'unsafe-inline'",
        "script-src 'unsafe-inline'",
        "img-src https: http: data:",
        "font-src 'none'",
        "connect-src 'none'",
        "frame-ancestors 'self'",
        "base-uri 'none'",
        "form-action 'none'",
      ].join("; "),
    },
  });
}
