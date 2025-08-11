-- Simple Authentication Fix
-- Run this in your Supabase SQL Editor

-- 1. Check current state
SELECT '=== CURRENT STATE ===' as info;

-- Check if user_profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as user_profiles_exists;

-- Check if organizations table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations'
) as organizations_exists;

-- Check current users
SELECT 'Current users:' as check_type, COUNT(*) as count FROM auth.users;

-- 2. Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'owner')),
    job_title TEXT,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'trial',
    subscription_plan TEXT DEFAULT 'free',
    created_by UUID REFERENCES auth.users(id),
    owner_id UUID REFERENCES auth.users(id),
    stripe_customer_id TEXT,
    address TEXT,
    phone TEXT,
    industry TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- 5. Create basic RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 6. Create user profile for current user if it doesn't exist
DO $$
DECLARE
    user_id UUID;
    user_email TEXT;
    profile_count INTEGER;
BEGIN
    -- Get the first user
    SELECT id, email INTO user_id, user_email FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Processing user: % (email: %)', user_id, user_email;
    
    -- Check if user profile exists
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = user_id;
    
    IF profile_count = 0 THEN
        RAISE NOTICE 'Creating user profile for user: %', user_id;
        
        -- Create user profile
        INSERT INTO user_profiles (id, full_name, email, role, organization_id)
        VALUES (user_id, COALESCE(user_email, 'Dashboard User'), user_email, 'owner', NULL);
        
        RAISE NOTICE 'User profile created successfully';
    ELSE
        RAISE NOTICE 'User profile already exists';
    END IF;
END $$;

-- 7. Create organization if it doesn't exist
DO $$
DECLARE
    user_id UUID;
    org_id UUID;
    org_count INTEGER;
BEGIN
    -- Get the first user
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users';
        RETURN;
    END IF;
    
    -- Check if organization exists
    SELECT COUNT(*) INTO org_count FROM organizations;
    
    IF org_count = 0 THEN
        RAISE NOTICE 'Creating organization for user: %', user_id;
        
        -- Create organization
        INSERT INTO organizations ("Name", slug, created_by)
        VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, user_id)
        RETURNING id INTO org_id;
        
        RAISE NOTICE 'Organization created successfully: %', org_id;
    ELSE
        -- Get existing organization
        SELECT id INTO org_id FROM organizations LIMIT 1;
        RAISE NOTICE 'Using existing organization: %', org_id;
    END IF;
    
    -- Link user profile to organization
    UPDATE user_profiles 
    SET organization_id = org_id
    WHERE id = user_id AND (organization_id IS NULL OR organization_id != org_id);
    
    RAISE NOTICE 'User profile linked to organization: %', org_id;
END $$;

-- 8. Fix orphaned data
DO $$
DECLARE
    first_org_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get the first organization
    SELECT id INTO first_org_id FROM organizations LIMIT 1;
    
    IF first_org_id IS NULL THEN
        RAISE NOTICE 'No organizations found. Cannot fix orphaned data.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Linking orphaned data to organization: %', first_org_id;
    
    -- Fix categories with NULL organization_id
    UPDATE categories
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % categories with organization_id', updated_count;
    
    -- Fix suppliers with NULL organization_id
    UPDATE suppliers
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % suppliers with organization_id', updated_count;
    
    -- Fix inventory_items with NULL organization_id
    UPDATE inventory_items
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % inventory items with organization_id', updated_count;
    
    -- Fix rooms with NULL organization_id
    UPDATE rooms
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % rooms with organization_id', updated_count;
    
END $$;

-- 9. Verify the fix
SELECT '=== VERIFICATION ===' as info;

-- Check user profiles
SELECT 'User profiles with organization_id:' as check_type, COUNT(*) as count
FROM user_profiles WHERE organization_id IS NOT NULL;

-- Check data in organizations
SELECT 'Categories in organizations:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NOT NULL;

SELECT 'Suppliers in organizations:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NOT NULL;

SELECT 'Inventory items in organizations:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NOT NULL;

SELECT 'Rooms in organizations:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NOT NULL;

-- Show final state
SELECT '=== FINAL STATE ===' as info;

SELECT 'Sample user profiles:' as check_type;
SELECT id, full_name, email, organization_id, role FROM user_profiles LIMIT 3;

SELECT 'Sample organizations:' as check_type;
SELECT id, "Name", slug, created_by FROM organizations LIMIT 3;

SELECT '=== SIMPLE AUTH FIX COMPLETE ===' as info;
SELECT 'Authentication should now be working. Dashboard should show data correctly.' as status;
