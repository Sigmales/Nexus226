-- Simplified Fix for Avatar Uploads
-- Run this in Supabase SQL Editor

-- 1. Create the bucket (safe attempt)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Create Policies (without altering table structure)

-- Upload policy
CREATE POLICY "Avatar Upload Policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'chat-images' );

-- Update policy (for changing avatar)
CREATE POLICY "Avatar Update Policy"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'chat-images' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'chat-images' AND auth.uid() = owner );

-- Select policy (public view)
CREATE POLICY "Avatar Select Policy"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'chat-images' );
