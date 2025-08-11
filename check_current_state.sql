-- Check Current State - Diagnostic Script
-- Run this in your Supabase SQL Editor to understand the current state

-- 1. Check organizations table structure
SELECT '=== ORGANIZATIONS TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- 2. Check organizations data
SELECT '=== ORGANIZATIONS DATA ===' as info;
SELECT id, "Name", slug, created_by, created_at
FROM organizations
ORDER BY created_at DESC;

-- 3. Check user_profiles table structure
SELECT '=== USER_PROFILES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. Check user_profiles data
SELECT '=== USER_PROFILES DATA ===' as info;
SELECT id, full_name, email, organization_id, role
FROM user_profiles
ORDER BY created_at DESC;

-- 5. Check auth.users data
SELECT '=== AUTH.USERS DATA ===' as info;
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- 6. Check for orphaned data
SELECT '=== ORPHANED DATA CHECK ===' as info;

SELECT 'Categories with NULL organization_id:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NULL;

SELECT 'Suppliers with NULL organization_id:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NULL;

SELECT 'Inventory items with NULL organization_id:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NULL;

SELECT 'Rooms with NULL organization_id:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NULL;

-- 7. Check RLS policies
SELECT '=== RLS POLICIES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('organizations', 'user_profiles', 'categories', 'suppliers', 'inventory_items', 'rooms')
ORDER BY tablename, policyname;
