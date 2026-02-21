# Code Review Fixes (February 21, 2026)

This document summarizes the fixes implemented from the recent code review and the remaining user-facing risks to address next.

## Scope

The changes in this batch cover:
- deck rendering hardening and XSS risk reduction
- iframe/frame security hardening
- upload auth and ownership validation
- Telegram API safety and message escaping
- conversation consistency and race-risk reductions
- atomic view-count update path
- CI quality gate setup
- user-facing copy corrections where behavior changed

## Implemented Fixes

### 1) Deck rendering and sanitization hardening

File: `lib/deck-renderer.ts`

Implemented:
- strict deck normalization via `normalizeDeckJSON(...)`
- slide type/theme allowlists
- field length clamping for text and arrays
- HTML escaping for all rendered text fields
- image URL protocol validation (`http`/`https` only)
- optional host allowlisting for image URLs using:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_APP_URL`
- parser now returns normalized deck data before rendering

Security goal:
- prevent untrusted deck content from injecting executable HTML/JS

### 2) Frame route now renders sanitized source and sets response security headers

File: `app/d/[id]/frame/route.ts`

Implemented:
- no longer returns raw `html_content` directly
- always rebuilds deck HTML from normalized `slides_json` (or safe fallback slide)
- added headers:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `Cache-Control: no-store`

Security goal:
- ensure output path is consistently sanitized and isolated

### 3) Viewer isolation improvements

File: `app/d/[id]/DeckViewer.tsx`

Implemented:
- iframe now uses `sandbox` restrictions
- event listener only accepts postMessage events from the deck iframe window
- removed unused/dead `htmlContent` plumbing and stale local state

### 4) Generate deck API: safer identity + IP handling

File: `app/api/generate-deck/route.ts`

Implemented:
- safe IP extraction with validation (`node:net isIP`)
- server-side Clerk `auth()` only (never client-supplied user IDs)
- authenticated web users are now stored as deck owners (`user_id`)
- fallback to anonymous behavior when Clerk is not configured

### 5) Upload image API: auth/ownership and input validation fixes

File: `app/api/upload-image/route.ts`

Implemented:
- supports two valid caller paths:
  - trusted internal Telegram calls via `x-internal-secret`
  - authenticated web user (Clerk) + ownership check
- enforces `deck.user_id === callerUserId` for web uploads
- validates `slideIndex` as non-negative integer and in-range
- uses normalized deck rendering after patching image URL
- returns proper `403` on ownership violations

### 6) Telegram helper hardening

File: `lib/telegram.ts`

Implemented:
- added Telegram response validation (`ok` and HTTP status checks)
- explicit helper to escape user-controlled HTML (`escapeTelegramHtml`)
- parse mode control (`HTML` vs plain text)
- stronger error handling for file fetch and transcription dependencies

### 7) Telegram route safety and behavior updates

File: `app/api/telegram/route.ts`

Implemented:
- escaped user/AI-derived values before HTML-formatted messages
- sent non-markup conversational replies with `parseMode: "none"`
- validated internal secret presence before forwarding image upload
- adjusted slide caption parsing (`slide 0` now invalid)
- removed unused import

### 8) Conversation duplicate-message fix

File: `lib/conversation-engine.ts`

Implemented:
- avoids appending the same latest user message twice when history already includes it

### 9) Conversation race mitigation and atomic append path

File: `lib/conversation.ts`

Implemented:
- switched `addMessage(...)` to DB RPC append path first
- fallback to previous update behavior if RPC not yet available

### 10) Atomic deck view-count increment

File: `lib/supabase.ts`

Implemented:
- replaced broken/non-atomic view-count logic with RPC call

### 11) Database migration for atomic operations

File: `supabase/migrations/003_hardening.sql`

Adds:
- `append_conversation_message(...)`
- `increment_deck_view_count(...)`

### 12) CI quality gate

File: `.github/workflows/ci.yml`

Adds CI checks on push/PR:
- `npm ci`
- `npm run lint`
- `npm run build`

### 13) User-facing copy updates for behavioral accuracy

Files:
- `app/page.tsx`
- `lib/supabase.ts`

Changes:
- homepage claim now clarifies web image upload is owner-based
- anonymous free-tier limit message no longer instructs sign-in for unlimited access (which is not currently wired in)

## Files Changed

- `app/api/generate-deck/route.ts`
- `app/api/telegram/route.ts`
- `app/api/upload-image/route.ts`
- `app/d/[id]/DeckViewer.tsx`
- `app/d/[id]/frame/route.ts`
- `app/d/[id]/page.tsx`
- `app/page.tsx`
- `lib/conversation-engine.ts`
- `lib/conversation.ts`
- `lib/deck-renderer.ts`
- `lib/supabase.ts`
- `lib/telegram.ts`
- `.github/workflows/ci.yml`
- `supabase/migrations/003_hardening.sql`
- `CODE_REVIEW_FIXES.md` (this file)

## Required Deployment Step

Apply DB migration:
- `supabase/migrations/003_hardening.sql`

Without this migration:
- conversation append still works via fallback path
- view count increment RPC path will fail until function exists

## Verification Notes

Local verification was limited by environment-level npm instability (`npm error Exit handler never called!`), which prevented reliable local lint/build execution in this workspace session.

CI workflow was added so the branch can be validated in GitHub with a clean runner.

## Remaining User-Flow Risks

1. Telegram photo without caption still requires user to resend the image with a slide number.

2. If `TELEGRAM_WEBHOOK_SECRET` is missing/misconfigured, webhook requests are intentionally acknowledged but ignored, which appears as bot silence to the end user.

3. Decks created anonymously before login do not have an ownership claim flow; signed-in users cannot later upload images to those specific old decks.

## Suggested Next Iteration

- add “pending photo” conversational state in Telegram so users can send slide number after photo without re-upload
- add explicit health/error visibility for Telegram webhook misconfiguration
- add deck claim/transfer flow for anonymous deck ownership promotion after authentication
