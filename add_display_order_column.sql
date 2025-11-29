-- ============================================
-- Add display_order column to categories table
-- ============================================
-- This column controls the display order of root categories
-- in the Header navigation and /categories page
-- ============================================

-- Add display_order column
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Set initial display_order based on current alphabetical order
-- This preserves the current ordering while adding the new feature
WITH ordered_categories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as row_num
  FROM categories
  WHERE parent_id IS NULL
)
UPDATE categories
SET display_order = ordered_categories.row_num
FROM ordered_categories
WHERE categories.id = ordered_categories.id;

-- Create index for performance optimization
CREATE INDEX IF NOT EXISTS idx_categories_display_order 
ON categories(display_order);

-- Add comment for documentation
COMMENT ON COLUMN categories.display_order IS 'Display order for root categories in navigation and category pages. Lower numbers appear first.';

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running this script, verify with:
-- SELECT id, name, parent_id, display_order FROM categories WHERE parent_id IS NULL ORDER BY display_order;
-- ============================================
