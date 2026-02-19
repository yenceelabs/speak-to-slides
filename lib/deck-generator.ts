import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "./env";
import {
  renderDeckToHTML,
  parseDeckJSON,
  DeckJSON,
  Slide,
} from "./deck-renderer";
import { getSupabase } from "./supabase";

// ============================================
// PROMPTS
// ============================================

const GENERATION_SYSTEM_PROMPT = `You are a professional presentation designer. Given a structured outline (or a raw topic), create a visually engaging deck.

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
- Always start with a title slide
- Always end with a "Thank You" or "Questions?" title slide
- Mix slide types for visual variety (avoid 3+ bullets in a row)
- Keep text concise — presentations need punchy text, not paragraphs
- For bullets: max 5 points per slide, each under 15 words
- For stats: use real or realistic statistics when possible
- Choose theme based on content: modern for tech, minimal for business, bold for creative/marketing
- The title should be a clean, professional title`;

const EDIT_SYSTEM_PROMPT = `You are a professional presentation designer editing an existing deck. The user wants changes to specific slides.

You will receive the current slides as JSON and the user's edit request. Return ONLY the updated slides array as valid JSON.

Rules:
- Only change the slides the user mentions
- Keep all other slides exactly as they are
- Maintain the same JSON format
- If adding a slide, insert it at the right position
- If removing a slide, remove it and re-index
- Return the COMPLETE slides array (all slides, not just changed ones)

Output ONLY valid JSON — an array of slide objects. No markdown, no explanation.`;

// ============================================
// GENERATION
// ============================================

/**
 * Generate a full deck from a prompt or outline.
 * Used by both web API and Telegram bot.
 */
export async function generateDeck(
  prompt: string,
  isPro: boolean = false
): Promise<{ deckJson: DeckJSON; rawContent: string }> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  const model = isPro ? "claude-sonnet-4-20250514" : "claude-3-haiku-20240307";

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: GENERATION_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const rawContent =
    message.content[0].type === "text" ? message.content[0].text : "";

  const deckJson = parseDeckJSON(rawContent);
  return { deckJson, rawContent };
}

/**
 * Generate a deck from a structured outline.
 */
export async function generateDeckFromOutline(
  outline: { title: string; slides: Array<{ heading: string; type: string; notes?: string }> },
  isPro: boolean = false
): Promise<{ deckJson: DeckJSON; rawContent: string }> {
  const outlinePrompt = `Create a presentation based on this outline:

Title: ${outline.title}

Slides:
${outline.slides.map((s, i) => `${i + 1}. [${s.type}] ${s.heading}${s.notes ? ` — ${s.notes}` : ""}`).join("\n")}

Follow the outline structure closely. Each slide heading in the outline should map to a slide.`;

  return generateDeck(outlinePrompt, isPro);
}

// ============================================
// SURGICAL EDITING
// ============================================

/**
 * Edit specific slides in an existing deck.
 * Returns the updated slides array.
 */
export async function editSlides(
  currentSlides: Slide[],
  editRequest: string,
  isPro: boolean = false
): Promise<Slide[]> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  const model = isPro ? "claude-sonnet-4-20250514" : "claude-3-haiku-20240307";

  const slidesContext = JSON.stringify(currentSlides, null, 2);

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: EDIT_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Current slides:\n${slidesContext}\n\nEdit request: ${editRequest}`,
      },
    ],
  });

  const rawContent =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parse the slides array
  let clean = rawContent.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  const updatedSlides: Slide[] = JSON.parse(clean);
  return updatedSlides;
}

// ============================================
// DECK PERSISTENCE (with slides_json)
// ============================================

/**
 * Create a deck with slides_json stored for surgical editing.
 */
export async function createDeckWithSlides(params: {
  userId?: string | null;
  title: string;
  prompt: string;
  htmlContent: string;
  slidesJson: Slide[];
  slideCount: number;
  theme: string;
  conversationId?: string | null;
  isPro?: boolean;
}): Promise<{ id: string }> {
  const db = getSupabase();

  const { data, error } = await db
    .from("speaktoslides_decks")
    .insert({
      user_id: params.userId || null,
      title: params.title,
      prompt: params.prompt,
      html_content: params.htmlContent,
      slides_json: params.slidesJson,
      slide_count: params.slideCount,
      theme: params.theme,
      is_public: true,
      conversation_id: params.conversationId || null,
      is_pro: params.isPro ?? false,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data as { id: string };
}

/**
 * Update an existing deck's slides (for surgical edits).
 * Re-renders HTML from updated slides and updates the record in place.
 */
export async function updateDeckSlides(
  deckId: string,
  updatedSlides: Slide[],
  theme: string = "modern",
  isPro = false
): Promise<void> {
  const db = getSupabase();

  const deckJson: DeckJSON = {
    title: "", // Will be taken from first slide
    theme: theme as "modern" | "minimal" | "bold",
    slides: updatedSlides,
  };

  // Extract title from the first title slide
  const titleSlide = updatedSlides.find((s) => s.type === "title");
  if (titleSlide?.heading) {
    deckJson.title = titleSlide.heading;
  }

  const htmlContent = renderDeckToHTML(deckJson, isPro);

  const { error } = await db
    .from("speaktoslides_decks")
    .update({
      html_content: htmlContent,
      slides_json: updatedSlides,
      slide_count: updatedSlides.length,
    })
    .eq("id", deckId);

  if (error) throw error;
}

/**
 * Get a deck's slides_json for editing.
 */
export async function getDeckSlidesJson(
  deckId: string
): Promise<{ slides_json: Slide[]; theme: string } | null> {
  const db = getSupabase();

  const { data, error } = await db
    .from("speaktoslides_decks")
    .select("slides_json, theme")
    .eq("id", deckId)
    .single();

  if (error) return null;
  return data as { slides_json: Slide[]; theme: string };
}
