-- Replace test12 with NexusHub in navigation
-- Run this in Supabase SQL Editor

-- 1. Delete test12 category (and its subcategories/services if any)
DELETE FROM categories WHERE name = 'test12';

-- 2. Create NexusHub category
INSERT INTO categories (name, description, parent_id, display_order)
VALUES (
  'NexusHub',
  'Services officiels proposés par l''équipe Nexus226 : formations, création de sites web, et plus encore',
  NULL,  -- Root category (appears in Header)
  999    -- Display at the end of navigation
)
ON CONFLICT (name) DO NOTHING;

-- 3. Verify the change
SELECT id, name, description, parent_id, display_order 
FROM categories 
WHERE parent_id IS NULL 
ORDER BY display_order, name;
