-- Robust fix for Ribbon service
-- 1. Get the user ID for 'h55'
-- 2. Find the service 'Ribbon' using case-insensitive match
-- 3. Update the proposer_id

DO $$
DECLARE
    target_user_id UUID;
    target_service_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO target_user_id FROM users WHERE username = 'h55';
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User h55 not found!';
        RETURN;
    END IF;

    -- Find service ID (taking the most recent one if duplicates exist)
    SELECT id INTO target_service_id 
    FROM services 
    WHERE title ILIKE '%Ribbon%' 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF target_service_id IS NULL THEN
        RAISE NOTICE 'Service Ribbon not found!';
        RETURN;
    END IF;

    -- Update the service
    UPDATE services
    SET proposer_id = target_user_id
    WHERE id = target_service_id;

    RAISE NOTICE 'Updated service % (Ribbon) with proposer % (h55)', target_service_id, target_user_id;
END $$;
