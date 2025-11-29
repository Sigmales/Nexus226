-- Fix chat_messages table creation
-- Run this in your Supabase SQL Editor

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create the table with all columns
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_chat_messages_category_id ON chat_messages(category_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all messages
CREATE POLICY "authenticated_users_can_read_messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Allow authenticated users to insert their own messages
CREATE POLICY "authenticated_users_can_insert_own_messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- RLS Policy: Allow users to delete their own messages
CREATE POLICY "users_can_delete_own_messages"
ON chat_messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Verify the table was created correctly
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
