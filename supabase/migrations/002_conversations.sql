-- SpeakToSlides v2: Conversation state machine
-- Run this migration in Supabase SQL editor

-- 1. Conversations table (multi-turn state)
CREATE TABLE IF NOT EXISTS speaktoslides_conversations (
  id TEXT PRIMARY KEY DEFAULT nanoid(),
  chat_id TEXT NOT NULL,
  channel TEXT DEFAULT 'telegram',
  state TEXT DEFAULT 'gathering',
  messages JSONB DEFAULT '[]',
  outline JSONB,
  visual_flavor TEXT DEFAULT 'clean',
  deck_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by chat_id + state
CREATE INDEX IF NOT EXISTS idx_conversations_chat_state 
  ON speaktoslides_conversations(chat_id, state);

-- Index for active conversations
CREATE INDEX IF NOT EXISTS idx_conversations_active
  ON speaktoslides_conversations(chat_id, created_at DESC)
  WHERE state != 'done';

-- 2. Add columns to existing decks table
ALTER TABLE speaktoslides_decks 
  ADD COLUMN IF NOT EXISTS slides_json JSONB,
  ADD COLUMN IF NOT EXISTS conversation_id TEXT;

-- Index for deck lookup by conversation
CREATE INDEX IF NOT EXISTS idx_decks_conversation 
  ON speaktoslides_decks(conversation_id)
  WHERE conversation_id IS NOT NULL;

-- 3. Ensure nanoid function exists (needed for conversations.id default)
-- If you already have nanoid() from the decks table setup, skip this.
CREATE OR REPLACE FUNCTION nanoid(size int DEFAULT 21)
RETURNS text AS $$
DECLARE
  id text := '';
  i int := 0;
  urlAlphabet char(36) := 'abcdefghijklmnopqrstuvwxyz0123456789';
  bytes bytea := gen_random_bytes(size);
  byte int;
BEGIN
  WHILE i < size LOOP
    byte := get_byte(bytes, i);
    id := id || substr(urlAlphabet, (byte % 36) + 1, 1);
    i := i + 1;
  END LOOP;
  RETURN id;
END
$$ LANGUAGE plpgsql VOLATILE;
