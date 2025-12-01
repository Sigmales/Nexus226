-- Add background image support to categories
-- Run this in Supabase SQL Editor

-- Add background_image_url column
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name = 'background_image_url';
