-- ============================================
-- Fix: Allow admins to view all services (including pending)
-- ============================================
-- This script adds a policy to allow admins to see all services
-- including those with status='pending' for moderation purposes
-- ============================================

-- Drop existing policy if it exists (optional, for clean reinstall)
-- DROP POLICY IF EXISTS "Anyone can view active services" ON services;

-- Update the existing policy to also allow admins to view all services
-- First, drop the old policy
DROP POLICY IF EXISTS "Anyone can view active services" ON services;

-- Create new policy that allows:
-- 1. Anyone to view active services
-- 2. Users to view their own services (any status)
-- 3. Admins to view all services (any status)
CREATE POLICY "Anyone can view active services" ON services FOR SELECT 
USING (
  status = 'active' 
  OR user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Also allow admins to update any service (for validation/rejection)
DROP POLICY IF EXISTS "Users can update own services" ON services;
CREATE POLICY "Users can update own services" ON services FOR UPDATE 
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running this script, verify with:
-- SELECT id, title, status, created_at FROM services WHERE status = 'pending' ORDER BY created_at DESC;
-- ============================================

