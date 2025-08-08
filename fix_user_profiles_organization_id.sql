-- =====================================================
-- FIX USER_PROFILES ORGANIZATION_ID COLUMN
-- =====================================================
-- This script fixes the organization_id column in user_profiles table
-- Since it's already UUID, we just need to verify it's linked correctly

-- First, let's check the current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'organization_id';

-- Check if user_profiles have organization_id values
SELECT 
    up.id,
    up.full_name,
    up.organization_id,
    o."Name" as organization_name
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.uuid_id
LIMIT 5;

-- If any user_profiles don't have organization_id, link them
UPDATE user_profiles 
SET organization_id = o.uuid_id
FROM organizations o 
WHERE user_profiles.organization_id IS NULL 
AND organizations.created_by = user_profiles.id;

-- Verify the fix
SELECT 
    up.id,
    up.full_name,
    up.organization_id,
    o."Name" as organization_name
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.uuid_id
LIMIT 5; 