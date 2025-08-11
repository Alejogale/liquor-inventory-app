-- Targeted Schema Fix
-- This script fixes the schema mismatch without dropping tables
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================
SELECT '=== STEP 1: CURRENT STATE CHECK ===' as info;

-- Check if tables exist and their structure
SELECT 'Tables that exist:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'organizations', 'categories', 'suppliers', 'inventory_items', 'rooms')
ORDER BY table_name;

-- =====================================================
-- STEP 2: FIX USER_PROFILES TABLE
-- =====================================================
SELECT '=== STEP 2: FIXING USER_PROFILES TABLE ===' as info;

-- Check if user_profiles table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) THEN
        -- Create user_profiles table
        CREATE TABLE user_profiles (
            id UUID REFERENCES auth.users(id) PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'owner')),
            job_title TEXT,
            organization_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created user_profiles table';
    ELSE
        -- Check if organization_id column exists and its type
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            AND column_name = 'organization_id'
        ) THEN
            -- Add organization_id column
            ALTER TABLE user_profiles ADD COLUMN organization_id UUID;
            RAISE NOTICE 'Added organization_id column to user_profiles';
        ELSE
            -- Check if organization_id is UUID type
            IF EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'user_profiles' 
                AND column_name = 'organization_id'
                AND data_type != 'uuid'
            ) THEN
                -- Convert organization_id to UUID
                ALTER TABLE user_profiles ALTER COLUMN organization_id TYPE UUID USING organization_id::uuid;
                RAISE NOTICE 'Converted organization_id to UUID type';
            ELSE
                RAISE NOTICE 'user_profiles table already has correct structure';
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- STEP 3: FIX ORGANIZATIONS TABLE
-- =====================================================
SELECT '=== STEP 3: FIXING ORGANIZATIONS TABLE ===' as info;

-- Check if organizations table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
    ) THEN
        -- Create organizations table
        CREATE TABLE organizations (
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
        RAISE NOTICE 'Created organizations table';
    ELSE
        -- Check if id column is UUID type
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'organizations' 
            AND column_name = 'id'
            AND data_type != 'uuid'
        ) THEN
            -- Convert id to UUID
            ALTER TABLE organizations ALTER COLUMN id TYPE UUID USING id::uuid;
            RAISE NOTICE 'Converted organizations.id to UUID type';
        ELSE
            RAISE NOTICE 'organizations table already has correct structure';
        END IF;
    END IF;
END $$;

-- =====================================================
-- STEP 4: ENABLE RLS AND CREATE POLICIES
-- =====================================================
SELECT '=== STEP 4: ENABLING RLS AND CREATING POLICIES ===' as info;

-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 5: CREATE USER PROFILE AND ORGANIZATION
-- =====================================================
SELECT '=== STEP 5: CREATING USER PROFILE AND ORGANIZATION ===' as info;

DO $$
DECLARE
    user_id UUID;
    user_email TEXT;
    org_id UUID;
    profile_count INTEGER;
    org_count INTEGER;
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

-- =====================================================
-- STEP 6: VERIFICATION
-- =====================================================
SELECT '=== STEP 6: VERIFICATION ===' as info;

-- Check user profiles
SELECT 'User profiles with organization_id:' as check_type, COUNT(*) as count
FROM user_profiles WHERE organization_id IS NOT NULL;

-- Check organizations
SELECT 'Organizations count:' as check_type, COUNT(*) as count
FROM organizations;

-- Show final state
SELECT '=== FINAL STATE ===' as info;

SELECT 'Sample user profiles:' as check_type;
SELECT id, full_name, email, organization_id, role FROM user_profiles LIMIT 3;

SELECT 'Sample organizations:' as check_type;
SELECT id, "Name", slug, created_by FROM organizations LIMIT 3;

SELECT '=== TARGETED SCHEMA FIX COMPLETE ===' as info;
SELECT 'Schema mismatch should now be resolved. Dashboard should show data correctly.' as status;
