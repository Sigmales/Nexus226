-- Enhance chat_messages table with image support and admin moderation
-- Run this in your Supabase SQL Editor

-- Add new columns for image support and edit tracking
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Drop existing policies to recreate them with admin privileges
DROP POLICY IF EXISTS "users_can_delete_own_messages" ON chat_messages;

-- RLS Policy: Users can delete their own messages OR admins can delete any message
CREATE POLICY "users_and_admins_can_delete_messages"
ON chat_messages
FOR DELETE
TO authenticated
USING (
    auth.uid() = sender_id 
    OR 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- RLS Policy: Admins can update any message (for moderation)
CREATE POLICY "admins_can_update_messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Verify the changes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
