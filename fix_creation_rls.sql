-- Enable RLS on categories (safety check)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 1. CATEGORIES POLICIES
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can do everything on categories" ON categories;
DROP POLICY IF EXISTS "Everyone can view categories" ON categories;
DROP POLICY IF EXISTS "Public categories are viewable by everyone" ON categories;

-- Policy: Admins can do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Admins can do everything on categories" ON categories
FOR ALL
USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
)
WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Policy: Everyone can view categories (needed for navigation and selection)
CREATE POLICY "Everyone can view categories" ON categories
FOR SELECT
USING (true);


-- 2. SERVICES POLICIES (Focus on INSERT)
-- Drop existing insert policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert services" ON services;
DROP POLICY IF EXISTS "Users can insert pending services" ON services;

-- Policy: Admins can insert ANY service (Active, Pending, etc.)
CREATE POLICY "Admins can insert services" ON services
FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Policy: Authenticated Users can insert PENDING services (Proposals)
-- This allows them to set title, description, category_id, etc.
CREATE POLICY "Users can insert pending services" ON services
FOR INSERT
WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
);

-- Note: Existing Update/Delete policies for services should be fine, 
-- but ensure Admins have full control if not already set.
