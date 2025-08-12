-- Fix infinite recursion in user_profiles RLS policy
-- This script will disable and recreate the problematic RLS policies

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Disable RLS temporarily to check if that fixes the issue
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Check if we can now fetch the admin profile
SELECT * FROM user_profiles WHERE email = 'alejogaleis@gmail.com';

-- If that works, let's create a simple, safe RLS policy
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Platform admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Organization members can view profiles" ON user_profiles;

-- Create simple, safe policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Platform admins can view all profiles (for admin dashboard)
CREATE POLICY "Platform admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_platform_admin = true
        )
    );

-- Test the fix
SELECT * FROM user_profiles WHERE email = 'alejogaleis@gmail.com';

-- Verify the admin profile exists and is linked
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.organization_id,
    up.is_platform_admin,
    o."Name" as organization_name
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE up.email = 'alejogaleis@gmail.com';
