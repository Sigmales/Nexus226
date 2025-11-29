-- Migration: Ensure service_proposals table exists with correct schema
-- Run this in your Supabase SQL Editor

-- Check if table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'service_proposals') THEN
        -- Create service_proposals table
        CREATE TABLE service_proposals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            service_id UUID REFERENCES services(id) ON DELETE CASCADE,
            user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE service_proposals ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view proposals for their services" 
        ON service_proposals 
        FOR SELECT 
        USING (
            user_id = auth.uid() 
            OR service_id IN (SELECT id FROM services WHERE user_id = auth.uid())
        );

        CREATE POLICY "Users can create proposals" 
        ON service_proposals 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Admins can view all proposals"
        ON service_proposals
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() 
                AND users.role = 'admin'
            )
        );

        CREATE POLICY "Admins can update proposals"
        ON service_proposals
        FOR UPDATE
        USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid() 
                AND users.role = 'admin'
            )
        );

        RAISE NOTICE 'Table service_proposals created successfully';
    ELSE
        -- Table exists, check if user_id column exists
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'service_proposals' 
            AND column_name = 'user_id'
        ) THEN
            -- Add user_id column if missing
            ALTER TABLE service_proposals 
            ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL;
            
            RAISE NOTICE 'Column user_id added to service_proposals';
        ELSE
            RAISE NOTICE 'Table service_proposals already exists with user_id column';
        END IF;
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'service_proposals'
ORDER BY ordinal_position;
