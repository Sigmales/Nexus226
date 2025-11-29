-- Fix Chat Storage Policies (Lite Version)
-- This script removes the 'ALTER TABLE' command which caused the permission error.

-- 1. Create Bucket (Safe to run, updates if exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-images', 
    'chat-images', 
    true, 
    5242880, 
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Policies
-- We attempt to drop existing policies with these specific names to avoid conflicts.
-- If this fails, you may need to delete them manually in the Dashboard > Storage > Policies.

DROP POLICY IF EXISTS "authenticated_users_can_upload_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "anyone_can_view_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "users_can_delete_own_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "admins_can_delete_any_chat_images" ON storage.objects;

-- 3. Create Policies

-- Allow Upload (Insert)
CREATE POLICY "authenticated_users_can_upload_chat_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow View (Select)
CREATE POLICY "anyone_can_view_chat_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Allow Delete (Own)
CREATE POLICY "users_can_delete_own_chat_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow Delete (Admin)
CREATE POLICY "admins_can_delete_any_chat_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat-images'
    AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);
