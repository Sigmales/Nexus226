-- COMPLETE FIX FOR CHAT (Version 3)
-- Run this in Supabase SQL Editor to fix ALL issues (Sending, Deleting, Admin Permissions)

-- ==========================================
-- 1. SCHEMA FIXES
-- ==========================================
-- Ensure columns exist
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- ==========================================
-- 2. CONSTRAINT FIXES
-- ==========================================
-- Allow image-only messages (drop strict text length check)
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_message_check;
ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_content_check;

ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_content_check 
CHECK (
    char_length(message) <= 500
    AND
    (char_length(message) > 0 OR image_url IS NOT NULL)
);

-- ==========================================
-- 3. RLS POLICIES (The Core Fixes)
-- ==========================================
-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure a clean slate
DROP POLICY IF EXISTS "authenticated_users_can_read_messages" ON chat_messages;
DROP POLICY IF EXISTS "authenticated_users_can_insert_own_messages" ON chat_messages;
DROP POLICY IF EXISTS "users_can_delete_own_messages" ON chat_messages;
DROP POLICY IF EXISTS "users_and_admins_can_delete_messages" ON chat_messages;
DROP POLICY IF EXISTS "admins_can_delete_any_message" ON chat_messages;

-- POLICY 1: SELECT (Everyone can read)
CREATE POLICY "authenticated_users_can_read_messages"
ON chat_messages FOR SELECT
TO authenticated
USING (true);

-- POLICY 2: INSERT (Users can post as themselves)
CREATE POLICY "authenticated_users_can_insert_own_messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- POLICY 3: DELETE (Authors OR Admins)
CREATE POLICY "users_and_admins_can_delete_messages"
ON chat_messages FOR DELETE
TO authenticated
USING (
    -- User is the author
    auth.uid() = sender_id 
    OR 
    -- User is an admin (checked via public.users table)
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- POLICY 4: UPDATE (Authors OR Admins - for editing)
CREATE POLICY "users_and_admins_can_update_messages"
ON chat_messages FOR UPDATE
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

-- ==========================================
-- 4. USERS TABLE PERMISSIONS (Safety Check)
-- ==========================================
-- Ensure authenticated users can read their own role in the users table
-- This is required for the Admin check to work
CREATE POLICY "users_can_read_own_profile"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
