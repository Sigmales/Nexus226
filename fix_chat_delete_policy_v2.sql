-- Fix RLS policies for chat_messages to allow Admin deletion
-- Run this in your Supabase SQL Editor

-- Drop existing DELETE policies to avoid conflicts
DROP POLICY IF EXISTS "users_can_delete_own_messages" ON chat_messages;
DROP POLICY IF EXISTS "users_and_admins_can_delete_messages" ON chat_messages;

-- Create a comprehensive DELETE policy
-- Allows deletion if:
-- 1. User is the author (sender_id = auth.uid())
-- 2. OR User is an admin
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

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';
