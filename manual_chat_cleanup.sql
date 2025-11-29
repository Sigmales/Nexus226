-- Manual cleanup of ALL existing chat messages
-- This script deletes all messages and does NOT affect the automatic cleanup job
-- Run this in Supabase SQL Editor

-- WARNING: This will permanently delete ALL chat messages!
-- Make sure you want to do this before running.

-- Delete all messages from chat_messages table
DELETE FROM chat_messages;

-- Verify deletion
SELECT COUNT(*) as remaining_messages FROM chat_messages;

-- Note: Images in Storage (chat-images bucket) are NOT automatically deleted
-- To delete all images from the chat-images bucket:
-- 1. Go to Supabase Dashboard > Storage > chat-images
-- 2. Select all files
-- 3. Click "Delete"
-- OR use the Storage API/Dashboard to empty the bucket

-- The automatic cleanup job (cleanup-old-chat-messages) will continue
-- to run daily and delete messages older than 7 days going forward.
