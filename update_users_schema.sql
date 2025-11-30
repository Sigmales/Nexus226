-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows updating these columns (already covered by "Users can update their own profile" policy)
-- But let's be safe and verify the policy exists (it was added in fix_avatar_upload.sql)
