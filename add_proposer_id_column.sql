-- ============================================
-- Add proposer_id column to services table
-- ============================================
-- This column stores the ID of the user who proposed the service
-- user_id will be used for the admin who publishes it
-- proposer_id will be used for the user who originally proposed it
-- ============================================

-- Add proposer_id column
ALTER TABLE services ADD COLUMN IF NOT EXISTS proposer_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Add comment
COMMENT ON COLUMN services.proposer_id IS 'ID of the user who originally proposed this service';

-- Migrate existing data: if a service has status='pending', set proposer_id = user_id
-- (assuming pending services were proposed by the user_id)
UPDATE services 
SET proposer_id = user_id 
WHERE status = 'pending' AND proposer_id IS NULL;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running this script, verify with:
-- SELECT id, title, user_id, proposer_id, status FROM services WHERE status = 'pending';
-- ============================================

