import Anthropic from "@anthropic-ai/sdk";
import { requireEnv } from "./env";
import {
  Conversation,
  ConversationMessage,
  ConversationState,
  SlideOutline,
} from "./conversation";
import {
  generateDeck,
  createDeckWithSlides,
  editSlides,
  updateDeckSlides,
  getDeckSlidesJson,
} from "./deck-generator";
import { renderDeckToHTML } from "./deck-renderer";
import { Slide, DeckJSON } from "./deck-renderer";

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://speaktoslides.com"
)
  .trim()
  .replace(/\/$/, "");

// ============================================
// SYSTEM PROMPTS
// ============================================

const PLANNER_SYSTEM_PROMPT = `You are a presentation coach and builder for SpeakToSlides. Your job is to help users create great presentations through conversation.

CONVERSATION RULES:
1. NEVER build a deck without asking at least one clarifying question first.
2. Keep questions focused — 1-2 questions max per turn. Don't interrogate.
3. When you have enough context, proactively suggest: "I have a solid outline — shall I build the first version?"
4. If the user gives a very detailed brief (audience, goal, key points, slide count), you can propose an outline after just 1 question.
5. Be conversational and friendly, not robotic.

YOUR CURRENT TASK depends on the conversation state:

STATE: gathering
- Ask focused clarifying questions to understand:
  - Who is the audience?
  - What's the goal of the presentation?
  - Any specific points or data to include?
  - Preferred style (professional, casual, bold)?
- When ready, propose a slide outline and ask to confirm.
- To signal you're ready to propose an outline, include the tag [READY_TO_OUTLINE] at the END of your message.

STATE: confirming
- The user is reviewing your proposed outline.
- If they approve, respond with [BUILD_NOW] at the end.
- If they want changes, adjust the outline and ask again.

STATE: reviewing
- The user has received their deck and may have feedback.
- If they request edits (mention specific slides, changes, additions), respond with [EDIT_DETECTED] at the end, followed by a brief summary of what you'll change.
- If they say it looks good, congratulate them and suggest they present it.

Always respond in plain text (no markdown). Keep responses under 300 words. Be warm but efficient.

IMPORTANT: The tags ([READY_TO_OUTLINE], [BUILD_NOW], [EDIT_DETECTED]) are for the system — they will be stripped before sending to the user. Place them at the very end of your message on a new line.`;

// ============================================
// MAIN CONVERSATION HANDLER
// ============================================

export interface ConversationResult {
  reply: string;
  newState?: ConversationState;
  outline?: SlideOutline;
  deckUrl?: string;
  shouldBuild?: boolean;
}

/**
 * Process a user message through the conversation engine.
 * Returns the AI reply and any state transitions needed.
 */
export async function processMessage(
  conversation: Conversation,
  userMessage: string
): Promise<ConversationResult> {
  const state = conversation.state;

  // Handle based on current state
  switch (state) {
    case "gathering":
    case "confirming":
      return handlePlanningPhase(conversation, userMessage);

    case "building":
      // User sent a message while deck is building — acknowledge
      return {
        reply:
          "⏳ Your deck is still being built — hang tight! I'll send the link as soon as it's ready.",
      };

    case "reviewing":
    case "editing":
      return handleReviewPhase(conversation, userMessage);

    case "done":
      // Conversation is done — they should start a new one
      return {
        reply:
          'This conversation is complete! Send /new to start a fresh deck, or just tell me what you want to present next.',
        newState: "gathering",
      };

    default:
      return handlePlanningPhase(conversation, userMessage);
  }
}

// ============================================
// PLANNING PHASE (gathering + confirming)
// ============================================

async function handlePlanningPhase(
  conversation: Conversation,
  userMessage: string
): Promise<ConversationResult> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  // Build conversation history for Claude
  const claudeMessages = buildClaudeMessages(conversation.messages, userMessage);

  const stateContext =
    conversation.state === "confirming" && conversation.outline
      ? `\n\nCurrent proposed outline:\n${formatOutline(conversation.outline)}`
      : "";

  const message = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    system: `${PLANNER_SYSTEM_PROMPT}\n\nCurrent state: ${conversation.state}${stateContext}`,
    messages: claudeMessages,
  });

  const rawReply =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Check for state transition tags
  const hasOutlineReady = rawReply.includes("[READY_TO_OUTLINE]");
  const hasBuildNow = rawReply.includes("[BUILD_NOW]");

  // Strip tags from reply
  let cleanReply = rawReply
    .replace(/\[READY_TO_OUTLINE\]/g, "")
    .replace(/\[BUILD_NOW\]/g, "")
    .replace(/\[EDIT_DETECTED\]/g, "")
    .trim();

  if (hasOutlineReady) {
    // AI is ready to propose an outline — generate one
    const outline = await generateOutline(conversation, userMessage);
    const outlineText = formatOutlineForUser(outline);

    cleanReply += `\n\nHere's what I'm thinking:\n\n${outlineText}\n\nShall I build this? Or want to adjust anything?`;

    return {
      reply: cleanReply,
      newState: "confirming",
      outline,
    };
  }

  if (hasBuildNow) {
    return {
      reply: cleanReply,
      newState: "building",
      shouldBuild: true,
    };
  }

  return { reply: cleanReply };
}

// ============================================
// REVIEW PHASE (reviewing + editing)
// ============================================

async function handleReviewPhase(
  conversation: Conversation,
  userMessage: string
): Promise<ConversationResult> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  // Build conversation history
  const claudeMessages = buildClaudeMessages(conversation.messages, userMessage);

  const message = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    system: `${PLANNER_SYSTEM_PROMPT}\n\nCurrent state: reviewing\nThe user has received their deck at ${BASE_URL}/d/${conversation.deck_id}`,
    messages: claudeMessages,
  });

  const rawReply =
    message.content[0].type === "text" ? message.content[0].text : "";

  const hasEditDetected = rawReply.includes("[EDIT_DETECTED]");

  let cleanReply = rawReply
    .replace(/\[READY_TO_OUTLINE\]/g, "")
    .replace(/\[BUILD_NOW\]/g, "")
    .replace(/\[EDIT_DETECTED\]/g, "")
    .trim();

  if (hasEditDetected && conversation.deck_id) {
    // Perform surgical edit
    try {
      const deckData = await getDeckSlidesJson(conversation.deck_id);
      if (!deckData || !deckData.slides_json) {
        return {
          reply:
            "Sorry, I couldn't load the deck for editing. Try sending /new to start fresh.",
        };
      }

      const updatedSlides = await editSlides(
        deckData.slides_json,
        userMessage,
        false
      );

      await updateDeckSlides(
        conversation.deck_id,
        updatedSlides,
        deckData.theme,
        false // isPro: TODO check subscription when payments ship
      );

      const deckUrl = `${BASE_URL}/d/${conversation.deck_id}`;
      cleanReply = `✏️ Done! I've updated your deck.\n\n🔗 ${deckUrl}\n\nSame link — just refresh to see the changes. Anything else to tweak?`;

      return {
        reply: cleanReply,
        newState: "reviewing",
      };
    } catch (err) {
      console.error("Surgical edit error:", err);
      return {
        reply:
          "Sorry, I hit an error while editing. Could you describe the change again?",
      };
    }
  }

  return { reply: cleanReply };
}

// ============================================
// DECK BUILDING
// ============================================

/**
 * Build the deck from the conversation context.
 * Called after user confirms the outline.
 */
export async function buildDeckFromConversation(
  conversation: Conversation
): Promise<{ deckUrl: string; deckId: string; title: string; slideCount: number }> {
  // Build a comprehensive prompt from conversation history
  const prompt = buildGenerationPrompt(conversation);

  const isPro = false; // TODO: check subscription when payments ship
  const { deckJson } = await generateDeck(prompt, isPro);
  const htmlContent = renderDeckToHTML(deckJson, isPro);

  const userId = `tg_${conversation.chat_id}`;

  const deck = await createDeckWithSlides({
    userId,
    title: deckJson.title,
    prompt,
    htmlContent,
    slidesJson: deckJson.slides,
    slideCount: deckJson.slides.length,
    theme: deckJson.theme || "modern",
    conversationId: conversation.id,
    isPro,
  });

  const deckUrl = `${BASE_URL}/d/${deck.id}`;

  return {
    deckUrl,
    deckId: deck.id,
    title: deckJson.title,
    slideCount: deckJson.slides.length,
  };
}

// ============================================
// HELPERS
// ============================================

function buildClaudeMessages(
  history: ConversationMessage[],
  newUserMessage: string
): Array<{ role: "user" | "assistant"; content: string }> {
  // Convert conversation history to Claude format
  // Limit to last 20 messages to stay within context window
  const recent = history.slice(-20);

  const messages: Array<{ role: "user" | "assistant"; content: string }> =
    recent.map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const lastMessage = messages[messages.length - 1];
  const isAlreadyIncluded =
    lastMessage?.role === "user" && lastMessage.content === newUserMessage;
  if (!isAlreadyIncluded) {
    messages.push({ role: "user", content: newUserMessage });
  }

  // Ensure messages start with a user message (Claude requirement)
  while (messages.length > 0 && messages[0].role !== "user") {
    messages.shift();
  }

  return messages;
}

async function generateOutline(
  conversation: Conversation,
  latestMessage: string
): Promise<SlideOutline> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");
  const client = new Anthropic({ apiKey });

  // Build context from conversation
  const context = conversation.messages
    .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
    .join("\n");

  const message = await client.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 1024,
    system: `Generate a slide outline based on the conversation context. Output ONLY valid JSON:
{
  "title": "Presentation Title",
  "slides": [
    { "index": 1, "heading": "Title slide heading", "type": "title" },
    { "index": 2, "heading": "Slide heading", "type": "bullets", "notes": "optional context" }
  ]
}

Available types: title, bullets, content, quote, stats, image
Generate 8-12 slides. Start with title, end with closing. No markdown wrapping.`,
    messages: [
      {
        role: "user",
        content: `Conversation so far:\n${context}\n\nLatest: ${latestMessage}\n\nGenerate the outline.`,
      },
    ],
  });

  const rawContent =
    message.content[0].type === "text" ? message.content[0].text : "";

  let clean = rawContent.trim();
  if (clean.startsWith("```")) {
    clean = clean.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }

  return JSON.parse(clean) as SlideOutline;
}

function formatOutline(outline: SlideOutline): string {
  return outline.slides
    .map((s) => `${s.index}. [${s.type}] ${s.heading}`)
    .join("\n");
}

function formatOutlineForUser(outline: SlideOutline): string {
  return (
    `📊 ${outline.title}\n\n` +
    outline.slides
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
        return `${emoji} Slide ${s.index}: ${s.heading}`;
      })
      .join("\n")
  );
}

function buildGenerationPrompt(conversation: Conversation): string {
  // Collect all user messages as context
  const userContext = conversation.messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");

  // If we have an outline, use it
  if (conversation.outline) {
    const outlineText = conversation.outline.slides
      .map(
        (s) =>
          `Slide ${s.index} [${s.type}]: ${s.heading}${s.notes ? ` — ${s.notes}` : ""}`
      )
      .join("\n");

    return `Create a presentation based on this outline and context:

Title: ${conversation.outline.title}

Outline:
${outlineText}

User's context and requirements:
${userContext}

Follow the outline structure closely. Make the content rich and engaging based on the user's context.`;
  }

  // Fallback: use raw conversation as prompt
  return `Create a presentation based on this conversation:\n\n${userContext}`;
}
