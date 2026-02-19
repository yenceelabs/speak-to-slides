// PostHog configuration — safe for both client and server imports
// No posthog-node import here (that lives in posthog.ts for server-only use)

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_GfraBph9Radjd6a4R0Zae89WbGozDvGZswo3OkEgynu';
export const POSTHOG_HOST = 'https://us.i.posthog.com';
