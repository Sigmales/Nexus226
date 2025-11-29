-- Fix Chat Storage Bucket and Policies
-- Run this in Supabase SQL Editor

-- 1. Create Bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-images', 
    'chat-images', 
    true, 
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- 2. Enable RLS on storage.objects (safety check)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "authenticated_users_can_upload_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "anyone_can_view_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "users_can_delete_own_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "admins_can_delete_any_chat_images" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1oj01k_3" ON storage.objects;

-- 4. Create Policies

-- Policy: Authenticated users can upload images to their own folder
-- Path convention: userId/filename.ext
CREATE POLICY "authenticated_users_can_upload_chat_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Anyone can view chat images (public bucket)
CREATE POLICY "anyone_can_view_chat_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-images');

-- Policy: Users can delete their own uploaded images
CREATE POLICY "users_can_delete_own_chat_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Admins can delete any chat image
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

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'chat-images';
