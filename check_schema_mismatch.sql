-- Check Schema Mismatch
-- Run this in your Supabase SQL Editor to identify the exact issue

-- 1. Check user_profiles table structure
SELECT '=== USER_PROFILES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check organizations table structure
SELECT '=== ORGANIZATIONS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- 3. Check if user_profiles table exists
SELECT '=== TABLE EXISTENCE CHECK ===' as info;
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as user_profiles_exists;

SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations'
) as organizations_exists;

-- 4. Check current data
SELECT '=== CURRENT DATA ===' as info;
SELECT 'user_profiles count:' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'organizations count:' as table_name, COUNT(*) as count FROM organizations;

-- 5. Check for any data in user_profiles
SELECT '=== USER_PROFILES DATA ===' as info;
SELECT id, full_name, email, role, organization_id, created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check for any data in organizations
SELECT '=== ORGANIZATIONS DATA ===' as info;
SELECT id, "Name", slug, created_by, created_at
FROM organizations
ORDER BY created_at DESC
LIMIT 5;
