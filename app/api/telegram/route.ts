import { NextRequest, NextResponse } from "next/server";
import {
  TelegramUpdate,
  sendMessage,
  sendChatAction,
  transcribeVoice,
  getFile,
  escapeTelegramHtml,
} from "@/lib/telegram";
import { trackServer, Events } from "@/lib/posthog";
import { checkAndRecordUsage } from "@/lib/supabase";
import {
  getOrCreateConversation,
  resetConversation,
  addMessage,
  updateConversation,
} from "@/lib/conversation";
import {
  processMessage,
  buildDeckFromConversation,
} from "@/lib/conversation-engine";

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com"
)
  .trim()
  .replace(/\/$/, "");

const esc = (value: string): string => escapeTelegramHtml(value);

// ============================================
// COMMAND HANDLERS
// ============================================

async function handleStart(chatId: number): Promise<void> {
  // Reset any existing conversation and start fresh
  await resetConversation(String(chatId));

  await sendMessage(
    chatId,
    `🎤 <b>Welcome to SpeakToSlides!</b>\n\n` +
      `I'm your presentation coach. Tell me what you need to present, and I'll help you build a great deck.\n\n` +
      `<b>How it works:</b>\n` +
      `1️⃣ Tell me about your presentation\n` +
      `2️⃣ I'll ask a few questions to get it right\n` +
      `3️⃣ We'll agree on a structure\n` +
      `4️⃣ I'll build it — you get a shareable link\n` +
      `5️⃣ Want changes? Just tell me — I'll update the same link\n\n` +
      `<b>Commands:</b>\n` +
      `/new — Start a fresh deck\n` +
      `/outline — Show current planned structure\n` +
      `/build — Force build with current outline\n` +
      `/reset — Clear current conversation\n\n` +
      `Ready? Just tell me what you need to present! 🎯`
  );
}

async function handleNew(chatId: number): Promise<void> {
  await resetConversation(String(chatId));
  await sendMessage(
    chatId,
    "🆕 Fresh start! What presentation are you working on?"
  );
}

async function handleOutline(chatId: number): Promise<void> {
  const conv = await getOrCreateConversation(String(chatId));

  if (!conv.outline) {
    await sendMessage(
      chatId,
      "📋 No outline yet — we're still planning. Tell me more about your presentation!"
    );
    return;
  }

  const outlineText = conv.outline.slides
    .map((s) => {
      const emoji =
        s.type === "title"
          ? "🎯"
          : s.type === "bullets"
            ? "📋"
            : s.type === "stats"
              ? "📊"
              : s.type === "quote"
                ? "💬"
                : s.type === "image"
                  ? "🖼️"
                  : "📝";
      return `${emoji} Slide ${s.index}: ${esc(s.heading)}`;
    })
    .join("\n");

  await sendMessage(
    chatId,
    `📊 <b>Current outline: ${esc(conv.outline.title)}</b>\n\n${outlineText}\n\n` +
      `Want to adjust anything? Or send /build to generate the deck.`
  );
}

async function handleBuild(chatId: number): Promise<void> {
  const conv = await getOrCreateConversation(String(chatId));

  if (conv.state === "building") {
    await sendMessage(chatId, "⏳ Already building — hang tight!");
    return;
  }

  if (conv.messages.length === 0) {
    await sendMessage(
      chatId,
      "I need to know what you're presenting first! Tell me about it."
    );
    return;
  }

  // Check usage limits
  const userId = `tg_${chatId}`;
  const usageCheck = await checkAndRecordUsage(null, userId);
  if (!usageCheck.allowed) {
    await trackServer(userId, Events.FREE_LIMIT_HIT, { channel: 'telegram' });
    await sendMessage(
      chatId,
      `⚠️ <b>Free tier limit reached</b>\n\nVisit ${BASE_URL} to unlock more decks.`
    );
    return;
  }

  await buildAndSendDeck(chatId, conv);
}

async function handleReset(chatId: number): Promise<void> {
  await resetConversation(String(chatId));
  await sendMessage(chatId, "🗑 Conversation cleared. Ready when you are!");
}

// ============================================
// MAIN MESSAGE HANDLER
// ============================================

async function handleTextMessage(
  chatId: number,
  text: string
): Promise<void> {
  await sendChatAction(chatId, "typing");

  try {
    const conv = await getOrCreateConversation(String(chatId));

    // Add user message to conversation
    const updatedConv = await addMessage(conv, "user", text);

    // Process through conversation engine
    const result = await processMessage(updatedConv, text);

    // Update state if changed
    if (result.newState) {
      await updateConversation(updatedConv.id, {
        state: result.newState,
        ...(result.outline ? { outline: result.outline } : {}),
      });
    }

    // If we should build, do it
    if (result.shouldBuild) {
      // Check usage limits first
      const userId = `tg_${chatId}`;
      const usageCheck = await checkAndRecordUsage(null, userId);
      if (!usageCheck.allowed) {
        await sendMessage(
          chatId,
          `⚠️ <b>Free tier limit reached</b>\n\nVisit ${BASE_URL} to unlock more decks.`
        );
        return;
      }

      // Send the confirmation reply first
      if (result.reply) {
        await sendMessage(chatId, result.reply, { parseMode: "none" });
      }

      // Fetch the latest conversation state (with outline)
      const latestConv = await getOrCreateConversation(String(chatId));
      await buildAndSendDeck(chatId, latestConv);
      return;
    }

    // Send AI reply
    if (result.reply) {
      // Add assistant message to conversation
      await addMessage(updatedConv, "assistant", result.reply);
      await sendMessage(chatId, result.reply, { parseMode: "none" });
    }
  } catch (error) {
    console.error("Conversation error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Missing required env var")
    ) {
      await sendMessage(
        chatId,
        "⚠️ Service is temporarily unavailable. Please try again later."
      );
      return;
    }

    await sendMessage(
      chatId,
      "❌ Something went wrong. Try again, or send /new to start fresh."
    );
  }
}

// ============================================
// DECK BUILDING
// ============================================

async function buildAndSendDeck(
  chatId: number,
  conv: Awaited<ReturnType<typeof getOrCreateConversation>>
): Promise<void> {
  // Mark as building
  await updateConversation(conv.id, { state: "building" });
  await sendMessage(chatId, "🎨 Building your deck...");
  await sendChatAction(chatId, "typing");

  try {
    const deckResult = await buildDeckFromConversation(conv);

    // Track deck created via Telegram
    await trackServer(`tg_${chatId}`, Events.DECK_CREATED, {
      deck_id: deckResult.deckId,
      slide_count: deckResult.slideCount,
      channel: 'telegram',
    });

    // Link deck to conversation and move to reviewing
    await updateConversation(conv.id, {
      state: "reviewing",
      deck_id: deckResult.deckId,
    });

    await sendMessage(
      chatId,
      `✅ <b>Your deck is ready!</b>\n\n` +
        `📊 <b>${esc(deckResult.title)}</b>\n` +
        `🎞 ${deckResult.slideCount} slides\n\n` +
        `🔗 ${deckResult.deckUrl}\n\n` +
        `Open the link to present — keyboard nav, fullscreen, and touch swipe!\n\n` +
        `💡 <b>Want changes?</b> Just tell me — e.g. "change slide 3" or "add a slide about X". Same link, instant update.`
    );

    // Add the deck message to conversation history
    await addMessage(
      conv,
      "assistant",
      `Deck ready: ${deckResult.title} (${deckResult.slideCount} slides) — ${deckResult.deckUrl}`
    );
  } catch (error) {
    console.error("Deck build error:", error);

    // Revert to confirming state so they can try again
    await updateConversation(conv.id, { state: "confirming" });

    await sendMessage(
      chatId,
      "❌ Failed to generate the deck. Send /build to try again, or tell me what to adjust."
    );
  }
}

// ============================================
// VOICE HANDLER
// ============================================

async function handleVoice(chatId: number, fileId: string): Promise<void> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    await sendMessage(
      chatId,
      "🎤 Voice transcription is not available right now. Please type your request instead!"
    );
    return;
  }

  await sendChatAction(chatId, "typing");
  await sendMessage(chatId, "🎤 Transcribing your voice message...");

  try {
    const transcribedText = await transcribeVoice(fileId);

    if (!transcribedText || transcribedText.trim().length === 0) {
      await sendMessage(
        chatId,
        "❌ Could not understand the voice message. Please try again or type your request."
      );
      return;
    }

    // Track successful voice transcription
    await trackServer(`tg_${chatId}`, Events.VOICE_TRANSCRIBED, {
      text_length: transcribedText.trim().length,
    });

    await sendMessage(
      chatId,
      `💬 I heard: "<i>${esc(transcribedText)}</i>"`
    );

    // Process the transcribed text through the conversation engine
    await handleTextMessage(chatId, transcribedText);
  } catch (err) {
    console.error("Voice transcription error:", err);
    await sendMessage(
      chatId,
      "❌ Failed to process voice message. Please type your request instead."
    );
  }
}

// ============================================
// PHOTO / IMAGE UPLOAD HANDLER
// ============================================

/**
 * Parse a slide number from a caption like "slide 3", "3", "slide3"
 * Returns 0-based index, or null if not specified.
 */
function parseSlideIndex(caption: string | undefined): number | null {
  if (!caption) return null;
  const match = caption.match(/slide\s*(\d+)/i) || caption.match(/^(\d+)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  if (isNaN(n) || n < 1) return null;
  return n - 1; // convert to 0-based
}

async function handlePhoto(chatId: number, fileId: string, caption?: string): Promise<void> {
  await sendChatAction(chatId, "typing");

  // Find the active deck for this conversation
  const conv = await getOrCreateConversation(String(chatId));
  if (!conv.deck_id) {
    await sendMessage(
      chatId,
      "📸 I received your image! But you don't have an active deck yet.\n\n" +
        "Generate a deck first, then send your image with a caption like <code>slide 3</code> to place it."
    );
    return;
  }

  const slideIndex = parseSlideIndex(caption);
  if (slideIndex === null) {
    await sendMessage(
      chatId,
      "📸 Got your image!\n\n" +
        "Which slide should I add it to? Reply with: <code>slide [number]</code>\n" +
        "Example: <code>slide 3</code>"
    );
    // Store pending image: next message with a slide number will trigger re-upload
    // For simplicity, ask them to resend with caption
    return;
  }

  // Download the image from Telegram
  let imageBuffer: ArrayBuffer;
  let fileUrl: string;
  try {
    fileUrl = await getFile(fileId);
    const res = await fetch(fileUrl);
    imageBuffer = await res.arrayBuffer();
  } catch {
    await sendMessage(chatId, "❌ Failed to download your image. Please try again.");
    return;
  }

  // Upload to our API
  const formData = new FormData();
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });
  formData.append("file", blob, `tg-photo-${Date.now()}.jpg`);
  formData.append("deckId", conv.deck_id);
  formData.append("slideIndex", String(slideIndex));

  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    await sendMessage(
      chatId,
      "❌ Image uploads are temporarily unavailable due to server configuration."
    );
    return;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com")
    .trim()
    .replace(/\/$/, "");

  const uploadRes = await fetch(`${baseUrl}/api/upload-image`, {
    method: "POST",
    headers: {
      "x-internal-secret": internalSecret,
    },
    body: formData,
  });

  const uploadData = await uploadRes.json();

  if (!uploadRes.ok) {
    await sendMessage(
      chatId,
      `❌ Failed to add image: ${uploadData.error || "Unknown error"}`,
      { parseMode: "none" }
    );
    return;
  }

  // Track image upload
  await trackServer(`tg_${chatId}`, Events.IMAGE_UPLOADED, {
    deck_id: conv.deck_id,
    slide_index: slideIndex,
    channel: 'telegram',
  });

  const deckUrl = `${baseUrl}/d/${conv.deck_id}`;
  await sendMessage(
    chatId,
    `✅ <b>Image added to slide ${slideIndex + 1}!</b>\n\n` +
      `Your deck has been updated — same link:\n🔗 ${deckUrl}\n\n` +
      `Want to add more images? Send another photo with <code>slide [number]</code> as the caption.`
  );
}

// ============================================
// WEBHOOK ENTRY POINT
// ============================================

export async function POST(req: NextRequest) {
  try {
    // FAIL CLOSED: if TELEGRAM_WEBHOOK_SECRET not configured, reject all requests
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!expectedSecret) {
      console.error('[Telegram] TELEGRAM_WEBHOOK_SECRET not configured — rejecting all requests');
      return NextResponse.json({ ok: true }); // 200 to avoid Telegram retry storms
    }

    const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
    if (secretToken !== expectedSecret) {
      // Return 200 to avoid Telegram retry storms, but don't process
      return NextResponse.json({ ok: true });
    }

    let update: TelegramUpdate;
    try {
      update = await req.json();
    } catch {
      return NextResponse.json({ ok: true });
    }

    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = update.message.chat.id;
    const text = update.message.text?.trim();

    // Handle commands
    if (text === "/start") {
      await handleStart(chatId);
      return NextResponse.json({ ok: true });
    }
    if (text === "/new") {
      await handleNew(chatId);
      return NextResponse.json({ ok: true });
    }
    if (text === "/outline") {
      await handleOutline(chatId);
      return NextResponse.json({ ok: true });
    }
    if (text === "/build") {
      await handleBuild(chatId);
      return NextResponse.json({ ok: true });
    }
    if (text === "/reset") {
      await handleReset(chatId);
      return NextResponse.json({ ok: true });
    }
    if (text === "/help") {
      await sendMessage(
        chatId,
        `<b>SpeakToSlides Help</b>\n\n` +
          `Just describe the presentation you want — I'll ask questions to get it right, then build it for you.\n\n` +
          `<b>Commands:</b>\n` +
          `/new — Start a fresh conversation\n` +
          `/outline — Show current planned structure\n` +
          `/build — Force build with current outline\n` +
          `/reset — Clear conversation\n` +
          `/help — This message\n\n` +
          `<b>Editing:</b>\nAfter your deck is built, just tell me what to change — "fix slide 3", "add a slide about X", "change the title". Same link, instant update!\n\n` +
          `🎤 You can also send <b>voice messages</b> — I'll transcribe and use them.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle voice messages
    if (update.message.voice) {
      await handleVoice(chatId, update.message.voice.file_id);
      return NextResponse.json({ ok: true });
    }

    // Handle photo messages — user uploading an image to a slide
    if (update.message.photo && update.message.photo.length > 0) {
      // Use the largest available photo (last in the array)
      const photo = update.message.photo[update.message.photo.length - 1];
      await handlePhoto(chatId, photo.file_id, update.message.caption);
      return NextResponse.json({ ok: true });
    }

    // Handle text messages (conversation flow)
    if (text && text.length > 2 && !text.startsWith("/")) {
      await handleTextMessage(chatId, text);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
