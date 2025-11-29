-- ============================================
-- Fix Services RLS Policies for Admin Updates AND Deletions
-- ============================================
-- This script ensures admins can:
-- 1. Update service status from 'pending' to 'active'
-- 2. Delete (reject) service proposals
-- Without RLS blocking these operations
-- ============================================

-- First, let's check current policies
-- Run this to see existing policies:
-- SELECT * FROM pg_policies WHERE tablename = 'services';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update own services" ON services;
DROP POLICY IF EXISTS "Users and admins can update services" ON services;
DROP POLICY IF EXISTS "Admins can update all services" ON services;
DROP POLICY IF EXISTS "Users can delete own services" ON services;
DROP POLICY IF EXISTS "Admins can delete all services" ON services;

-- ============================================
-- CREATE COMPREHENSIVE POLICIES
-- ============================================

-- POLICY 1: UPDATE - Allow users and admins to update services
CREATE POLICY "Users and admins can update services" ON services
FOR UPDATE
USING (
    auth.uid() = user_id 
    OR 
    auth.uid() = proposer_id
    OR 
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
)
WITH CHECK (
    auth.uid() = user_id 
    OR 
    auth.uid() = proposer_id
    OR 
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- POLICY 2: DELETE - Allow users and admins to delete services
CREATE POLICY "Users and admins can delete services" ON services
FOR DELETE
USING (
    auth.uid() = user_id 
    OR 
    auth.uid() = proposer_id
    OR 
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- After running this script, verify with:

-- 1. Check all policies are in place
-- SELECT policyname, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'services' 
-- AND cmd IN ('UPDATE', 'DELETE')
-- ORDER BY cmd, policyname;

-- 2. Test UPDATE as admin
-- UPDATE services 
-- SET status = 'active', updated_at = NOW()
-- WHERE id = 'service-uuid-here';

-- 3. Test DELETE as admin
-- DELETE FROM services WHERE id = 'service-uuid-here';

-- 4. Verify the operations worked
-- SELECT id, title, status, user_id, proposer_id, updated_at
-- FROM services
-- WHERE id = 'service-uuid-here';
-- (Should be updated or not exist if deleted)
-- ============================================
