-- Force update for specific services where the link was lost
-- This assumes the username is 'h55'

UPDATE services
SET proposer_id = (SELECT id FROM users WHERE username = 'h55' LIMIT 1)
WHERE title IN ('RICHA', 'Ribbon');

-- Verify the update
SELECT id, title, proposer_id FROM services WHERE title IN ('RICHA', 'Ribbon');
