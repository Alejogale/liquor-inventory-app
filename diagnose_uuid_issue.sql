-- Diagnose UUID Issue
-- Run this in your Supabase SQL Editor to identify the problem

-- Check organizations table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check for any non-UUID data in organizations
SELECT 
    id,
    "Name",
    slug,
    created_by,
    CASE 
        WHEN created_by IS NULL THEN 'NULL'
        WHEN created_by::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'Valid UUID' 
        ELSE 'Invalid UUID: ' || created_by::text 
    END as uuid_status
FROM organizations
ORDER BY created_at DESC;

-- Check user_profiles table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check for any non-UUID data in user_profiles
SELECT 
    id,
    full_name,
    email,
    organization_id,
    CASE 
        WHEN organization_id IS NULL THEN 'NULL'
        WHEN organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'Valid UUID' 
        ELSE 'Invalid UUID: ' || organization_id::text 
    END as uuid_status
FROM user_profiles
ORDER BY created_at DESC;

-- Check auth.users table
SELECT 
    id,
    email,
    CASE 
        WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
        THEN 'Valid UUID' 
        ELSE 'Invalid UUID: ' || id::text 
    END as uuid_status
FROM auth.users
ORDER BY created_at DESC; 