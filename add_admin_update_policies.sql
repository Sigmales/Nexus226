-- Add RLS Policy for Admins to Update Services and Service Proposals
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "admins_can_update_services" ON services;
DROP POLICY IF EXISTS "admins_can_update_service_proposals" ON service_proposals;

-- Policy for admins to update services table
CREATE POLICY "admins_can_update_services"
ON services
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Policy for admins to update service_proposals table
CREATE POLICY "admins_can_update_service_proposals"
ON service_proposals
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN ('services', 'service_proposals')
AND cmd = 'UPDATE'
ORDER BY tablename, policyname;
