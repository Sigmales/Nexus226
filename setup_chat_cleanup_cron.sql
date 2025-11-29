-- Setup Automatic Chat Message Cleanup (7-day retention)
-- Run this in Supabase SQL Editor

-- 1. Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_chat_messages()
RETURNS TABLE(deleted_count INTEGER, execution_time TIMESTAMPTZ) AS $$
DECLARE
  msg_count INTEGER;
BEGIN
  -- Delete messages older than 7 days
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS msg_count = ROW_COUNT;
  
  -- Return results for logging
  RETURN QUERY SELECT msg_count, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Schedule daily cleanup at 2:00 AM UTC
-- Note: If job already exists, unschedule it first manually:
-- SELECT cron.unschedule('cleanup-old-chat-messages');
SELECT cron.schedule(
  'cleanup-old-chat-messages',  -- Job name
  '0 2 * * *',                   -- Cron expression: Every day at 2:00 AM UTC
  'SELECT cleanup_old_chat_messages();'  -- SQL command to execute
);

-- 5. Verify the job was scheduled
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-chat-messages';

-- 6. (Optional) Test the cleanup function manually
-- Uncomment the line below to test immediately:
-- SELECT * FROM cleanup_old_chat_messages();

-- 7. Monitor job execution history (run this later to check if it's working)
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-chat-messages') ORDER BY start_time DESC LIMIT 10;
