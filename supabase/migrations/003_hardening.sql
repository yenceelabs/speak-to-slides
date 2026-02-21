-- SpeakToSlides hardening migration
-- 1) Atomic conversation message appends
-- 2) Atomic deck view count increment

CREATE OR REPLACE FUNCTION append_conversation_message(
  p_conversation_id TEXT,
  p_role TEXT,
  p_content TEXT,
  p_timestamp BIGINT
)
RETURNS speaktoslides_conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row speaktoslides_conversations;
BEGIN
  UPDATE speaktoslides_conversations
  SET messages = COALESCE(messages, '[]'::jsonb) || jsonb_build_array(
      jsonb_build_object(
        'role', p_role,
        'content', p_content,
        'timestamp', p_timestamp
      )
    ),
    updated_at = NOW()
  WHERE id = p_conversation_id
  RETURNING * INTO updated_row;

  IF updated_row.id IS NULL THEN
    RAISE EXCEPTION 'Conversation % not found', p_conversation_id;
  END IF;

  RETURN updated_row;
END;
$$;

CREATE OR REPLACE FUNCTION increment_deck_view_count(
  p_deck_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE speaktoslides_decks
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_deck_id;
END;
$$;
