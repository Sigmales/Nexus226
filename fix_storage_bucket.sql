-- Fix Storage Bucket and Policies
-- Run this in Supabase SQL Editor

-- 1. Create the 'chat-images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1k0_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1k0_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1k0_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1ok1k0_3" ON storage.objects;

-- 4. Recreate Policies

-- Allow authenticated users to upload to chat-images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-images' );

-- Allow users to update/delete their own files
CREATE POLICY "Authenticated users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'chat-images' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'chat-images' AND auth.uid() = owner );

CREATE POLICY "Authenticated users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'chat-images' AND auth.uid() = owner );

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'chat-images' );
