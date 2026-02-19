import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    // Verify internal API secret — only our Telegram bot should call this
    const internalSecret = req.headers.get("x-internal-secret");
    const expectedSecret = process.env.INTERNAL_API_SECRET;
    if (!expectedSecret || internalSecret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const deckId = formData.get("deckId") as string | null;
    const slideIndex = formData.get("slideIndex") as string | null;

    // Validate inputs
    if (!file || !deckId || slideIndex === null) {
      return NextResponse.json(
        { error: "Missing required fields: file, deckId, slideIndex" },
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

    // Verify deck exists
    const { data: deck, error: deckErr } = await db
      .from("speaktoslides_decks")
      .select("id, slides_json, theme")
      .eq("id", deckId)
      .single();

    if (deckErr || !deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Upload to Supabase Storage
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `deck-images/${deckId}/slide-${slideIndex}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await db.storage
      .from("speaktoslides")
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
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
    const slides = Array.isArray(deck.slides_json) ? [...deck.slides_json] : [];
    const idx = parseInt(slideIndex, 10);

    if (idx >= 0 && idx < slides.length) {
      // Attach image URL to the target slide regardless of type
      // This allows ANY slide type to have an associated user image
      slides[idx] = { ...slides[idx], user_image_url: imageUrl };
    }

    // Re-render HTML with updated slides
    const { renderDeckToHTML } = await import("@/lib/deck-renderer");
    const htmlContent = renderDeckToHTML({
      title: slides.find((s) => s.type === "title")?.heading || "Presentation",
      theme: (deck.theme as "modern" | "minimal" | "bold") || "modern",
      slides,
    });

    // Update deck record
    const { error: updateErr } = await db
      .from("speaktoslides_decks")
      .update({ slides_json: slides, html_content: htmlContent })
      .eq("id", deckId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ imageUrl, slideIndex: idx });
  } catch (error) {
    console.error("upload-image error:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
