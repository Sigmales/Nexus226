-- Complete Fix for service_proposals RLS Policies
-- Run this in your Supabase SQL Editor

-- Step 1: Drop all existing policies on service_proposals
DROP POLICY IF EXISTS "Users can view proposals for their services" ON service_proposals;
DROP POLICY IF EXISTS "Users can create proposals" ON service_proposals;
DROP POLICY IF EXISTS "Admins can view all proposals" ON service_proposals;
DROP POLICY IF EXISTS "Admins can update proposals" ON service_proposals;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON service_proposals;

-- Step 2: Ensure RLS is enabled
ALTER TABLE service_proposals ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies

-- Policy 1: Allow authenticated users to INSERT their own proposals
CREATE POLICY "authenticated_users_can_insert_proposals" 
ON service_proposals 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 2: Allow users to SELECT their own proposals
CREATE POLICY "users_can_view_own_proposals" 
ON service_proposals 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Policy 3: Allow users to SELECT proposals for services they own
CREATE POLICY "users_can_view_proposals_for_their_services" 
ON service_proposals 
FOR SELECT 
TO authenticated
USING (
    service_id IN (
        SELECT id FROM services WHERE user_id = auth.uid()
    )
);

-- Policy 4: Allow admins to view all proposals
CREATE POLICY "admins_can_view_all_proposals" 
ON service_proposals 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Policy 5: Allow admins to update all proposals
CREATE POLICY "admins_can_update_proposals" 
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

-- Step 4: Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'service_proposals'
ORDER BY cmd, policyname;

-- Step 5: Test query (should return empty result if no proposals yet)
-- This will verify that the SELECT policies work
SELECT * FROM service_proposals LIMIT 5;
