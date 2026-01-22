-- Quick check to see what email verification setup exists in your database

-- 1. Check if welcome_email_queue table exists
SELECT
  'welcome_email_queue table' as check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'welcome_email_queue'
    ) THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND'
  END as status;

-- 2. Check if trigger exists
SELECT
  'on_email_confirmed_queue trigger' as check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.triggers
      WHERE trigger_name = 'on_email_confirmed_queue'
    ) THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND'
  END as status;

-- 3. Check if function exists
SELECT
  'queue_welcome_email function' as check_name,
  CASE
    WHEN EXISTS (
      SELECT FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'queue_welcome_email'
    ) THEN '✅ EXISTS'
    ELSE '❌ NOT FOUND'
  END as status;

-- 4. If table exists, show its structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'welcome_email_queue'
ORDER BY ordinal_position;

-- 5. If table exists, show any data in it
SELECT
  COUNT(*) as total_emails,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM public.welcome_email_queue;

-- 6. Show recent entries (if any)
SELECT * FROM public.welcome_email_queue
ORDER BY created_at DESC
LIMIT 5;
