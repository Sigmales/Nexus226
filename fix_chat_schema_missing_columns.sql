-- Fix Missing Columns in chat_messages
-- Run this in your Supabase SQL Editor

-- 1. Add image_url column if it doesn't exist
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add edited_at column if it doesn't exist
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- 3. Force schema cache reload (usually automatic, but good to be safe)
NOTIFY pgrst, 'reload config';

-- 4. Verify columns exist
SELECT 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'chat_messages';
