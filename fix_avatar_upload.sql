-- Fix Avatar Upload Issues
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on storage.objects if not already enabled (usually is)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Allow authenticated users to upload files to 'chat-images' bucket
-- This covers both chat images and avatars
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-images' );

-- 3. Allow authenticated users to update their own files
-- Crucial for replacing the avatar
CREATE POLICY "Authenticated users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'chat-images' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'chat-images' AND auth.uid() = owner );

-- 4. Allow public read access (if bucket is not public)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'chat-images' );

-- 5. Ensure Users can update their own profile (avatar_url)
CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );
