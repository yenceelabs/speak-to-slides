import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "SpeakToSlides").slice(0, 100);
  const subtitle = (
    searchParams.get("subtitle") || "AI Presentations by Voice"
  ).slice(0, 150);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "40px",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            🎙️
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#a5b4fc",
              letterSpacing: "-0.02em",
            }}
          >
            SpeakToSlides
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
            marginBottom: "24px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          {subtitle}
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: "120px",
            height: "4px",
            borderRadius: "2px",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
            marginTop: "40px",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
