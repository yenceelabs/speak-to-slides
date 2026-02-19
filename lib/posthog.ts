// PostHog analytics — client + server helpers
// Project: SpeakToSlides | ID: 314975

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_GfraBph9Radjd6a4R0Zae89WbGozDvGZswo3OkEgynu';
export const POSTHOG_HOST = 'https://us.i.posthog.com';

// ─── Server-side events (API routes) ───────────────────────────────────────
// Uses posthog-node — no browser required.

import { PostHog } from 'posthog-node';

let _serverClient: PostHog | null = null;

export function getServerPostHog(): PostHog {
  if (!_serverClient) {
    _serverClient = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      flushAt: 1,       // flush immediately on serverless
      flushInterval: 0,
    });
  }
  return _serverClient;
}

/**
 * Fire a server-side event and flush immediately.
 * distinctId: use deck id, tg_chatId, or IP-hash — something stable per "user".
 */
export async function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    const ph = getServerPostHog();
    ph.capture({ distinctId, event, properties });
    await ph.flush();
  } catch {
    // Never let analytics crash the app
  }
}

// ─── Event names ─────────────────────────────────────────────────────────────
export const Events = {
  // Deck lifecycle
  DECK_CREATED:        'deck_created',        // new deck generated
  DECK_EDITED:         'deck_edited',         // surgical slide edit
  DECK_VIEWED:         'deck_viewed',         // /d/[id] opened
  DECK_FRAME_LOADED:   'deck_frame_loaded',   // iframe loaded

  // Input channel
  WEB_PROMPT_SENT:     'web_prompt_sent',     // web UI generate
  TELEGRAM_MSG_SENT:   'telegram_msg_sent',   // telegram bot message
  VOICE_TRANSCRIBED:   'voice_transcribed',   // voice → text success

  // Images
  IMAGE_UPLOADED:      'image_uploaded',      // slide image upload

  // Funnel
  FREE_LIMIT_HIT:      'free_limit_hit',      // usage limit reached
  PRO_UPGRADE_CLICK:   'pro_upgrade_click',   // upgrade button tapped
} as const;
