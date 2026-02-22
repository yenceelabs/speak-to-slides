import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role (bypasses RLS)
// Lazy initialization to avoid build errors
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error("Supabase credentials not configured");
    }

    _supabase = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          apikey: serviceKey,
        },
      },
    });
  }
  return _supabase;
}

export const supabase = {
  get rpc() {
    return getSupabase().rpc.bind(getSupabase());
  },
  get from() {
    return getSupabase().from.bind(getSupabase());
  },
};

// Types
export interface Deck {
  id: string;
  user_id: string | null;
  title: string;
  prompt: string;
  html_content: string;
  slides_json?: unknown;
  slide_count: number;
  theme: string;
  is_public: boolean;
  is_pro: boolean;
  conversation_id?: string | null;
  view_count: number;
  created_at: string;
}

export interface UsageRecord {
  id: number;
  user_id: string | null;
  ip_address: string | null;
  created_at: string;
}

// ============================================
// DECK OPERATIONS
// ============================================

export async function createDeck(params: {
  userId?: string | null;
  title: string;
  prompt: string;
  htmlContent: string;
  slideCount: number;
  theme: string;
}): Promise<Deck> {
  const { data, error } = await supabase
    .from("speaktoslides_decks")
    .insert({
      user_id: params.userId || null,
      title: params.title,
      prompt: params.prompt,
      html_content: params.htmlContent,
      slide_count: params.slideCount,
      theme: params.theme,
      is_public: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Deck;
}

export async function getDeckById(id: string): Promise<Deck | null> {
  let db: SupabaseClient;
  try {
    db = getSupabase();
  } catch {
    // Supabase not configured — deck cannot exist
    return null;
  }

  const { data, error } = await db
    .from("speaktoslides_decks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Deck;
}

export async function incrementViewCount(id: string): Promise<void> {
  const db = getSupabase();
  const { error } = await db.rpc("increment_deck_view_count", {
    p_deck_id: id,
  });
  if (error) {
    throw error;
  }
}

// ============================================
// USAGE / RATE LIMITING
// ============================================

export async function checkAndRecordUsage(
  ipAddress: string | null,
  userId?: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  const db = getSupabase();

  // Telegram users: limited to FREE_DECK_LIMIT_TELEGRAM decks (default 3)
  if (userId?.startsWith("tg_")) {
    const telegramLimit = parseInt(process.env.FREE_DECK_LIMIT_TELEGRAM || "3", 10);
    const { data } = await db
      .from("speaktoslides_usage")
      .select("id")
      .eq("user_id", userId)
      .limit(telegramLimit + 1);

    if (data && data.length >= telegramLimit) {
      return {
        allowed: false,
        reason: `Free tier: ${telegramLimit} deck${telegramLimit === 1 ? "" : "s"} per user. Start a Pro subscription at speaktoslides.com`,
      };
    }

    await db.from("speaktoslides_usage").insert({
      user_id: userId,
      ip_address: ipAddress,
    });
    return { allowed: true };
  }

  // Authenticated (Clerk) users get unlimited decks
  if (userId) {
    await db.from("speaktoslides_usage").insert({
      user_id: userId,
      ip_address: ipAddress,
    });
    return { allowed: true };
  }

  // Anonymous users: 1 deck per IP
  if (ipAddress) {
    const { data, error } = await db
      .from("speaktoslides_usage")
      .select("id")
      .eq("ip_address", ipAddress)
      .is("user_id", null)
      .limit(1);

    if (!error && data && data.length > 0) {
      return {
        allowed: false,
        reason:
          "Free tier limit reached for this network. Please try again later.",
      };
    }

    await db.from("speaktoslides_usage").insert({
      user_id: null,
      ip_address: ipAddress,
    });
  }

  return { allowed: true };
}
