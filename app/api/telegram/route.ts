import { NextRequest, NextResponse } from "next/server";
import {
  TelegramUpdate,
  sendMessage,
  sendChatAction,
  transcribeVoice,
} from "@/lib/telegram";
import { createDeck, checkAndRecordUsage } from "@/lib/supabase";
import { renderDeckToHTML, parseDeckJSON } from "@/lib/deck-renderer";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com";

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
    { "type": "stats", "heading": "...", "stats": [{"value": "90%", "label": "description"}] }
  ]
}

Theme options: "modern" (dark navy, indigo accent), "minimal" (light, clean), "bold" (dark, amber accent)

Rules:
- Generate 8-12 slides
- Start with a title slide, end with "Thank You" or "Questions?" slide
- Mix slide types for visual variety
- Keep text concise and punchy
- Choose theme based on content type`;

async function handleDeckRequest(chatId: number, prompt: string) {
  await sendChatAction(chatId, "typing");
  await sendMessage(chatId, "🎨 Building your deck...");

  try {
    // Check usage (use chatId as user identifier for Telegram)
    const userId = `tg_${chatId}`;
    const usageCheck = await checkAndRecordUsage(null, userId);

    if (!usageCheck.allowed) {
      await sendMessage(
        chatId,
        `⚠️ <b>Free tier limit reached</b>\n\nYou've used your free deck. Visit ${BASE_URL} to unlock more.`
      );
      return;
    }

    // Generate with Claude Haiku (free tier)
    const message = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      system: DECK_SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent =
      message.content[0].type === "text" ? message.content[0].text : "";
    const deckJson = parseDeckJSON(rawContent);
    const htmlContent = renderDeckToHTML(deckJson);

    const deck = await createDeck({
      userId,
      title: deckJson.title,
      prompt,
      htmlContent,
      slideCount: deckJson.slides.length,
      theme: deckJson.theme || "modern",
    });

    const deckUrl = `${BASE_URL}/d/${deck.id}`;

    await sendMessage(
      chatId,
      `✅ <b>Your deck is ready!</b>\n\n` +
        `📊 <b>${deckJson.title}</b>\n` +
        `🎞 ${deckJson.slides.length} slides\n\n` +
        `🔗 ${deckUrl}\n\n` +
        `Open the link to present — works on any screen with keyboard navigation, fullscreen, and touch swipe!`
    );
  } catch (error) {
    console.error("Telegram deck generation error:", error);
    await sendMessage(
      chatId,
      "❌ Failed to generate your deck. Please try again with a different prompt."
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const update: TelegramUpdate = await req.json();

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id;
    const text = update.message.text?.trim();

    // Handle /start command
    if (text === "/start") {
      await sendMessage(
        chatId,
        `🎤 <b>Welcome to SpeakToSlides!</b>\n\n` +
          `Turn your ideas into beautiful presentations instantly.\n\n` +
          `<b>How to use:</b>\n` +
          `💬 Type your topic — e.g. "Build me a deck on why AI is changing healthcare"\n` +
          `🎤 Send a voice note describing your presentation\n\n` +
          `<b>Free tier:</b> 1 deck per user\n` +
          `<b>Pro:</b> Unlimited decks at ${BASE_URL}\n\n` +
          `Ready? Just tell me what deck you need!`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /help command
    if (text === "/help") {
      await sendMessage(
        chatId,
        `<b>SpeakToSlides Help</b>\n\n` +
          `Just describe the presentation you want:\n` +
          `• "10 slides on the future of electric vehicles"\n` +
          `• "Startup pitch deck for a food delivery app"\n` +
          `• "Quarterly results presentation for our team"\n\n` +
          `Or send a <b>voice message</b> and I'll transcribe it!\n\n` +
          `Each deck gets a permanent shareable link you can open on any screen.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (update.message.voice) {
      const voice = update.message.voice;
      await sendChatAction(chatId, "typing");
      await sendMessage(chatId, "🎤 Transcribing your voice message...");

      try {
        const transcribedText = await transcribeVoice(voice.file_id);

        if (!transcribedText || transcribedText.trim().length === 0) {
          await sendMessage(
            chatId,
            "❌ Could not understand the voice message. Please try again or type your request."
          );
          return NextResponse.json({ ok: true });
        }

        await sendMessage(chatId, `💬 I heard: "<i>${transcribedText}</i>"\n\nGenerating your deck...`);
        await handleDeckRequest(chatId, transcribedText);
      } catch (err) {
        console.error("Voice transcription error:", err);
        await sendMessage(
          chatId,
          "❌ Failed to process voice message. Please type your request instead."
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle text messages (deck generation)
    if (text && text.length > 3 && !text.startsWith("/")) {
      await handleDeckRequest(chatId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
