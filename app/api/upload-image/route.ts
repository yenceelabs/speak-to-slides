import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { normalizeDeckJSON, renderDeckToHTML } from "@/lib/deck-renderer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const internalSecret = req.headers.get("x-internal-secret");
    const expectedSecret = process.env.INTERNAL_API_SECRET;
    const isInternalRequest =
      Boolean(expectedSecret) &&
      Boolean(internalSecret) &&
      internalSecret === expectedSecret;

    // Allow either trusted internal calls (Telegram webhook path) or authenticated owner uploads.
    let callerUserId: string | null = null;
    if (!isInternalRequest) {
      try {
        const { userId } = await auth();
        callerUserId = userId;
      } catch (authError) {
        console.warn("Clerk auth unavailable in upload-image route:", authError);
      }

      if (!callerUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const deckId = formData.get("deckId");
    const slideIndex = formData.get("slideIndex");

    // Validate inputs
    if (!file || typeof deckId !== "string" || typeof slideIndex !== "string") {
      return NextResponse.json(
        { error: "Missing required fields: file, deckId, slideIndex" },
        { status: 400 }
      );
    }

    const idx = Number(slideIndex);
    if (!Number.isInteger(idx) || idx < 0) {
      return NextResponse.json(
        { error: "slideIndex must be a non-negative integer" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, and GIF images are supported" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 5 MB" },
        { status: 400 }
      );
    }

    const db = getSupabase();

    // Verify deck exists and enforce ownership for web requests.
    const { data: deck, error: deckErr } = await db
      .from("speaktoslides_decks")
      .select("id, user_id, title, slides_json, theme, is_pro")
      .eq("id", deckId)
      .single();

    if (deckErr || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (!isInternalRequest && deck.user_id !== callerUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const slides = Array.isArray(deck.slides_json) ? [...deck.slides_json] : [];
    if (slides.length === 0) {
      return NextResponse.json(
        { error: "Deck does not contain editable slides" },
        { status: 400 }
      );
    }

    if (idx >= slides.length) {
      return NextResponse.json(
        { error: `slideIndex out of range (0-${slides.length - 1})` },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";
    const storagePath = `deck-images/${deckId}/slide-${idx}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await db.storage
      .from("speaktoslides")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr instanceof Error ? uploadErr.message : "unknown error");
      return NextResponse.json(
        { error: "Failed to upload image. Storage may not be configured." },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = db.storage
      .from("speaktoslides")
      .getPublicUrl(storagePath);

    const imageUrl = publicUrlData.publicUrl;

    // Patch the slide in slides_json
    slides[idx] = {
      ...(typeof slides[idx] === "object" && slides[idx] !== null ? slides[idx] : {}),
      user_image_url: imageUrl,
    };

    // Re-render HTML with normalized slides.
    const normalizedDeck = normalizeDeckJSON({
      title:
        typeof deck.title === "string"
          ? deck.title
          : "Presentation",
      theme: deck.theme,
      slides,
    });
    const htmlContent = renderDeckToHTML(normalizedDeck, Boolean(deck.is_pro));

    // Update deck record
    const { error: updateErr } = await db
      .from("speaktoslides_decks")
      .update({ slides_json: slides, html_content: htmlContent })
      .eq("id", deckId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ imageUrl, slideIndex: idx });
  } catch (error) {
    console.error("upload-image error:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
