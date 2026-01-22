-- ============================================
-- DIAGNOSE SIGNUP ERROR
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Check if the trigger is causing issues
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND event_object_schema = 'auth';

-- 2. Check user_profiles table structure and constraints
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. Check for RLS policies on user_profiles
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- 4. Check for RLS policies on organizations
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'organizations';

-- 5. Test if we can create a user profile manually
-- (This simulates what the signup API does)
DO $$
DECLARE
  test_user_id UUID;
  test_org_id UUID;
BEGIN
  -- Create a test organization
  INSERT INTO organizations (name, slug, subscription_status)
  VALUES ('Test Org', 'test-org', 'trial')
  RETURNING id INTO test_org_id;

  -- Generate a fake user ID
  test_user_id := gen_random_uuid();

  -- Try to create a user profile
  INSERT INTO user_profiles (id, full_name, email, role, organization_id)
  VALUES (test_user_id, 'Test User', 'test@example.com', 'owner', test_org_id);

  -- Clean up
  DELETE FROM user_profiles WHERE id = test_user_id;
  DELETE FROM organizations WHERE id = test_org_id;

  RAISE NOTICE 'SUCCESS: Manual user profile creation works!';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: % - %', SQLERRM, SQLSTATE;
    -- Try to clean up if possible
    BEGIN
      DELETE FROM user_profiles WHERE id = test_user_id;
      DELETE FROM organizations WHERE id = test_org_id;
    EXCEPTION
      WHEN OTHERS THEN NULL;
    END;
END $$;

-- 6. Check recent auth errors in logs (if available)
-- This shows recent failed signups
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  confirmation_sent_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
