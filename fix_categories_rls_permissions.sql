-- Fix RLS permissions for categories table
-- Allow all users (authenticated and anonymous) to read categories including background_image_url
-- Run this in Supabase SQL Editor

-- Enable RLS on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "public_can_read_categories" ON categories;
DROP POLICY IF EXISTS "anyone_can_read_categories" ON categories;

-- Create a permissive SELECT policy for everyone (authenticated and anonymous)
CREATE POLICY "anyone_can_read_categories"
ON categories
FOR SELECT
TO public
USING (true);

-- Verify the policy
SELECT * FROM pg_policies WHERE tablename = 'categories';
