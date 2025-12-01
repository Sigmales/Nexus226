-- Add show_in_nav column to control category visibility in navigation
-- Run this in Supabase SQL Editor

-- Add show_in_nav column (default: false for new categories)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS show_in_nav BOOLEAN DEFAULT false;

-- Set existing categories to visible (IA, Productivité, Développement, Autres)
-- Exclude NexusHub as it has its own dedicated link
UPDATE categories 
SET show_in_nav = true 
WHERE name IN ('IA', 'Productivité', 'Développement', 'Autres');

-- Verify the changes
SELECT id, name, show_in_nav, display_order 
FROM categories 
ORDER BY display_order, name;
