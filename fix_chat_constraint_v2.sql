-- Fix Chat Message Constraint
-- Run this in Supabase SQL Editor

-- 1. Drop the restrictive constraint that requires text length > 0
-- This was blocking image-only messages or causing issues if the frontend sent empty strings
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_message_check;

-- 2. Add a more flexible constraint
-- Logic: Message must be <= 500 chars AND (have text OR have an image)
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_content_check 
CHECK (
    char_length(message) <= 500
    AND
    (char_length(message) > 0 OR image_url IS NOT NULL)
);

-- 3. Verify constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'chat_messages'::regclass;
