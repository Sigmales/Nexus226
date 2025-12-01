-- Fix Critical Bug: Unable to send messages
-- Run this in your Supabase SQL Editor

-- 1. Drop existing policies that might be conflicting or broken
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_messages" ON chat_messages;
DROP POLICY IF EXISTS "authenticated_users_can_read_messages" ON chat_messages;

-- 2. Recreate INSERT Policy
-- Allow authenticated users to insert messages where they are the sender
CREATE POLICY "authenticated_users_can_insert_own_messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- 3. Recreate SELECT Policy
-- Allow authenticated users to read all messages
CREATE POLICY "authenticated_users_can_read_messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (true);

-- 4. Verify policies
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';
