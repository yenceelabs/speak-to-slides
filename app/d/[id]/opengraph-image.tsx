import { ImageResponse } from "next/og";
import { getDeckById } from "@/lib/supabase";

export const runtime = "nodejs";
export const alt = "SpeakToSlides Deck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function DeckOGImage({
  params,
}: {
  params: { id: string };
}) {
  const deck = await getDeckById(params.id);

  const title = deck?.title || "Untitled Deck";
  const slideCount = deck?.slide_count ?? 0;
  const theme = deck?.theme || "modern";

  const themeColors = {
    modern: { bg: "#0f172a", surface: "#1e293b", accent: "#6366f1", text: "#f1f5f9", muted: "#94a3b8", border: "#334155" },
    minimal: { bg: "#f8f9fa", surface: "#ffffff", accent: "#2563eb", text: "#111827", muted: "#6b7280", border: "#e5e7eb" },
    bold:    { bg: "#0f0f1a", surface: "#1a1a2e", accent: "#f59e0b", text: "#ffffff", muted: "#a1a1aa", border: "#2d2d42" },
  }[theme] ?? { bg: "#0f172a", surface: "#1e293b", accent: "#6366f1", text: "#f1f5f9", muted: "#94a3b8", border: "#334155" };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: themeColors.bg,
          padding: "72px 80px",
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: themeColors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            🎤
          </div>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: themeColors.text,
              letterSpacing: "-0.01em",
            }}
          >
            SpeakToSlides
          </span>
        </div>

        {/* Middle: deck title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 5,
              background: themeColors.accent,
              borderRadius: 3,
            }}
          />
          <div
            style={{
              fontSize: slideCount > 0 && title.length > 60 ? 52 : 64,
              fontWeight: 800,
              color: themeColors.text,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 960,
            }}
          >
            {title}
          </div>
          {slideCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
              <span
                style={{
                  fontSize: 20,
                  color: themeColors.muted,
                  background: themeColors.surface,
                  border: `1px solid ${themeColors.border}`,
                  borderRadius: 8,
                  padding: "6px 16px",
                }}
              >
                {slideCount} slide{slideCount !== 1 ? "s" : ""}
              </span>
              <span
                style={{
                  fontSize: 20,
                  color: themeColors.muted,
                  background: themeColors.surface,
                  border: `1px solid ${themeColors.border}`,
                  borderRadius: 8,
                  padding: "6px 16px",
                  textTransform: "capitalize",
                }}
              >
                {theme} theme
              </span>
            </div>
          )}
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            fontSize: 18,
            color: themeColors.muted,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          speaktoslides.com
        </div>
      </div>
    ),
    { ...size }
  );
}
