-- ============================================
-- GRANT ACCESS TO ALL EXISTING USERS
-- ============================================
-- This script marks all current users as verified
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- Step 1: See current status
SELECT
  'BEFORE UPDATE' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as verified,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unverified
FROM auth.users;

-- Step 2: Update all unverified users to be verified
-- This sets their email_confirmed_at to NOW()
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Step 3: Verify the update worked
SELECT
  'AFTER UPDATE' as status,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NOT NULL) as verified,
  COUNT(*) FILTER (WHERE email_confirmed_at IS NULL) as unverified
FROM auth.users;

-- Step 4: Show all users and their verification status
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ VERIFIED'
    ELSE '❌ UNVERIFIED'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- OPTIONAL: Send welcome emails to existing users
-- ============================================

-- Check if they already have welcome emails queued
SELECT
  COUNT(*) as emails_in_queue,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed
FROM public.welcome_email_queue;

-- OPTION A: Queue welcome emails for ALL existing users
-- (Uncomment the lines below if you want to send welcome emails)

/*
INSERT INTO public.welcome_email_queue (user_id, email, user_name, status)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) as user_name,
  'pending' as status
FROM auth.users u
WHERE NOT EXISTS (
  -- Don't add duplicates
  SELECT 1 FROM public.welcome_email_queue w
  WHERE w.user_id = u.id
);
*/

-- OPTION B: Queue welcome emails only for users who don't have one yet
-- (More conservative - only sends to users without existing queue entry)

/*
INSERT INTO public.welcome_email_queue (user_id, email, user_name, status)
SELECT
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'first_name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ) as user_name,
  'pending' as status
FROM auth.users u
LEFT JOIN public.welcome_email_queue w ON w.user_id = u.id
WHERE w.id IS NULL
AND u.email_confirmed_at IS NOT NULL;
*/

-- Check queue status after insert
SELECT
  'Queue status' as info,
  COUNT(*) as total_in_queue,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'sent') as sent
FROM public.welcome_email_queue;

-- ============================================
-- SUMMARY
-- ============================================

-- See users who now have access
SELECT
  'Summary: Users with access' as info,
  COUNT(*) as total_users_with_access
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

-- See users who will receive welcome emails
SELECT
  'Summary: Welcome emails to send' as info,
  COUNT(*) as emails_to_send
FROM public.welcome_email_queue
WHERE status = 'pending';
