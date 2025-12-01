-- Add proposer_id column if it doesn't exist
ALTER TABLE services ADD COLUMN IF NOT EXISTS proposer_id UUID REFERENCES users(id);

-- Populate proposer_id from service_proposals (most reliable source for proposals)
-- This recovers the original proposer even if user_id was changed to Admin
UPDATE services
SET proposer_id = sp.user_id
FROM service_proposals sp
WHERE services.id = sp.service_id
  AND (services.proposer_id IS NULL OR services.proposer_id != sp.user_id);

-- Fallback: Populate proposer_id from current user_id for others (e.g. created directly)
UPDATE services
SET proposer_id = user_id
WHERE proposer_id IS NULL;
