-- ============================================
-- Fix service_proposals RLS Policies for Admin Deletions
-- ============================================
-- This script ensures admins can delete category proposals
-- from the service_proposals table
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can delete own proposals" ON service_proposals;
DROP POLICY IF EXISTS "Admins can delete all proposals" ON service_proposals;

-- CREATE DELETE POLICY for service_proposals
CREATE POLICY "Users and admins can delete proposals" ON service_proposals
FOR DELETE
USING (
    auth.uid() = user_id 
    OR 
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running this script, verify with:

-- SELECT policyname, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'service_proposals' 
-- AND cmd = 'DELETE';
-- ============================================
