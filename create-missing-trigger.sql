-- Create the missing trigger
-- This connects the function to the auth.users table

DROP TRIGGER IF EXISTS on_email_confirmed_queue ON auth.users;

CREATE TRIGGER on_email_confirmed_queue
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_welcome_email();

-- Verify it was created
SELECT
  'on_email_confirmed_queue trigger' as check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.triggers
      WHERE trigger_name = 'on_email_confirmed_queue'
    ) THEN '✅ CREATED SUCCESSFULLY'
    ELSE '❌ FAILED TO CREATE'
  END as status;
