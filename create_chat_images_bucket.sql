-- Create Supabase Storage bucket for chat images
-- Run this in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can upload images to chat-images bucket
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

-- Verify bucket was created
SELECT * FROM storage.buckets WHERE id = 'chat-images';
