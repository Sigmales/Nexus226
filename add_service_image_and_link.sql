-- Add image_url and link columns to services table
-- link column might already exist, using IF NOT EXISTS to be safe

ALTER TABLE services 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS link TEXT;

COMMENT ON COLUMN services.image_url IS 'URL of the custom service image/icon';
COMMENT ON COLUMN services.link IS 'External URL to the service website';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name IN ('image_url', 'link');
