-- Fix chat_messages schema to support image-only messages
-- Run this in Supabase SQL Editor

-- 1. Add missing columns (if they don't exist)
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- 2. Drop the old restrictive constraint
-- This constraint requires message to have length > 0, which blocks image-only messages
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_message_check;

-- 3. Add new flexible constraint
-- Allow empty message IF an image is provided
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_content_check 
CHECK (
    (char_length(message) > 0 AND char_length(message) <= 500)
    OR 
    (image_url IS NOT NULL)
);

-- 4. Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
