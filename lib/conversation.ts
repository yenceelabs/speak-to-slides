import { getSupabase } from "./supabase";

/**
 * Conversation state machine for SpeakToSlides Telegram bot.
 * States: gathering → confirming → building → reviewing → editing → done
 */

export type ConversationState =
  | "gathering"
  | "confirming"
  | "building"
  | "reviewing"
  | "editing"
  | "done";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface SlideOutline {
  title: string;
  slides: Array<{
    index: number;
    heading: string;
    type: string;
    notes?: string;
  }>;
}

export interface Conversation {
  id: string;
  chat_id: string;
  channel: string;
  state: ConversationState;
  messages: ConversationMessage[];
  outline: SlideOutline | null;
  visual_flavor: string;
  deck_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONVERSATION CRUD
// ============================================

/**
 * Get or create an active conversation for a Telegram chat.
 * Returns the most recent non-done conversation, or creates a new one.
 */
export async function getOrCreateConversation(
  chatId: string
): Promise<Conversation> {
  const db = getSupabase();

  // Find the most recent active (non-done) conversation
  const { data: existing, error: fetchError } = await db
    .from("speaktoslides_conversations")
    .select("*")
    .eq("chat_id", chatId)
    .neq("state", "done")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    return existing as Conversation;
  }

  // Create new conversation
  return createConversation(chatId);
}

export async function createConversation(
  chatId: string,
  channel: string = "telegram"
): Promise<Conversation> {
  const db = getSupabase();

  const { data, error } = await db
    .from("speaktoslides_conversations")
    .insert({
      chat_id: chatId,
      channel,
      state: "gathering",
      messages: [],
      outline: null,
      visual_flavor: "clean",
      deck_id: null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function updateConversation(
  id: string,
  updates: Partial<
    Pick<Conversation, "state" | "messages" | "outline" | "visual_flavor" | "deck_id">
  >
): Promise<Conversation> {
  const db = getSupabase();

  const { data, error } = await db
    .from("speaktoslides_conversations")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function resetConversation(chatId: string): Promise<void> {
  const db = getSupabase();

  // Mark all active conversations for this chat as done
  await db
    .from("speaktoslides_conversations")
    .update({ state: "done", updated_at: new Date().toISOString() })
    .eq("chat_id", chatId)
    .neq("state", "done");
}

/**
 * Add a message to the conversation history and return updated conversation.
 */
export async function addMessage(
  conversation: Conversation,
  role: "user" | "assistant",
  content: string
): Promise<Conversation> {
  const messages = [
    ...conversation.messages,
    { role, content, timestamp: Date.now() },
  ];

  return updateConversation(conversation.id, { messages });
}
