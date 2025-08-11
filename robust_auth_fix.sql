-- Robust Authentication Fix - Handle All Edge Cases
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check and create user_profiles table
-- =====================================================
SELECT '=== STEP 1: USER_PROFILES TABLE ===' as info;

DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) THEN
        RAISE NOTICE 'Creating user_profiles table...';
        
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
        
        -- Enable RLS
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy
        DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
        CREATE POLICY "Users can view their own profile" ON user_profiles
            FOR ALL USING (id = auth.uid());
            
        RAISE NOTICE '✅ user_profiles table created successfully';
    ELSE
        RAISE NOTICE '✅ user_profiles table already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 2: Check and create organizations table
-- =====================================================
SELECT '=== STEP 2: ORGANIZATIONS TABLE ===' as info;

DO $$
BEGIN
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
    ) THEN
        RAISE NOTICE 'Creating organizations table...';
        
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
        
        -- Enable RLS
        ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policy
        DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
        CREATE POLICY "Users can view their organization" ON organizations
            FOR ALL USING (
                id IN (
                    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
                )
            );
            
        RAISE NOTICE '✅ organizations table created successfully';
    ELSE
        RAISE NOTICE '✅ organizations table already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 3: Create user profile for all users
-- =====================================================
SELECT '=== STEP 3: CREATE USER PROFILES ===' as info;

DO $$
DECLARE
    user_record RECORD;
    profile_count INTEGER;
BEGIN
    -- Loop through all users in auth.users
    FOR user_record IN SELECT id, email FROM auth.users LOOP
        -- Check if user profile exists
        SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = user_record.id;
        
        IF profile_count = 0 THEN
            RAISE NOTICE 'Creating user profile for user: % (email: %)', user_record.id, user_record.email;
            
            -- Create user profile
            INSERT INTO user_profiles (id, full_name, email, role, organization_id)
            VALUES (
                user_record.id, 
                COALESCE(user_record.email, 'Dashboard User'), 
                user_record.email, 
                'owner', 
                NULL
            );
            
            RAISE NOTICE '✅ User profile created for: %', user_record.email;
        ELSE
            RAISE NOTICE '✅ User profile already exists for: %', user_record.email;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- STEP 4: Create organizations and link users
-- =====================================================
SELECT '=== STEP 4: CREATE ORGANIZATIONS ===' as info;

DO $$
DECLARE
    user_record RECORD;
    org_id UUID;
    org_count INTEGER;
BEGIN
    -- Check if any organizations exist
    SELECT COUNT(*) INTO org_count FROM organizations;
    
    IF org_count = 0 THEN
        RAISE NOTICE 'No organizations found. Creating default organization...';
        
        -- Get the first user to create organization
        SELECT id INTO user_record FROM auth.users LIMIT 1;
        
        IF user_record.id IS NOT NULL THEN
            -- Create default organization
            INSERT INTO organizations ("Name", slug, created_by)
            VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, user_record.id)
            RETURNING id INTO org_id;
            
            RAISE NOTICE '✅ Default organization created: %', org_id;
        ELSE
            RAISE NOTICE '❌ No users found to create organization';
            RETURN;
        END IF;
    ELSE
        -- Get existing organization
        SELECT id INTO org_id FROM organizations LIMIT 1;
        RAISE NOTICE '✅ Using existing organization: %', org_id;
    END IF;
    
    -- Link all user profiles to the organization
    UPDATE user_profiles 
    SET organization_id = org_id
    WHERE organization_id IS NULL;
    
    RAISE NOTICE '✅ All user profiles linked to organization: %', org_id;
END $$;

-- =====================================================
-- STEP 5: Fix orphaned data
-- =====================================================
SELECT '=== STEP 5: FIX ORPHANED DATA ===' as info;

DO $$
DECLARE
    first_org_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get the first organization
    SELECT id INTO first_org_id FROM organizations LIMIT 1;
    
    IF first_org_id IS NULL THEN
        RAISE NOTICE '❌ No organizations found. Cannot fix orphaned data.';
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

-- =====================================================
-- STEP 6: Verify the fix
-- =====================================================
SELECT '=== STEP 6: VERIFICATION ===' as info;

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

-- =====================================================
-- STEP 7: Show final state
-- =====================================================
SELECT '=== STEP 7: FINAL STATE ===' as info;

SELECT 'Sample user profiles:' as check_type;
SELECT id, full_name, email, organization_id, role FROM user_profiles LIMIT 3;

SELECT 'Sample organizations:' as check_type;
SELECT id, "Name", slug, created_by FROM organizations LIMIT 3;

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 3;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 3;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 3;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 3;

-- =====================================================
-- STEP 8: Test RLS access
-- =====================================================
SELECT '=== STEP 8: RLS ACCESS TEST ===' as info;

-- Test if current user can access their own profile
SELECT 'Can access own profile:' as test, COUNT(*) as count
FROM user_profiles 
WHERE id = auth.uid();

-- Test if current user can access organizations
SELECT 'Can access organizations:' as test, COUNT(*) as count
FROM organizations 
WHERE id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access categories
SELECT 'Can access categories:' as test, COUNT(*) as count
FROM categories 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access suppliers
SELECT 'Can access suppliers:' as test, COUNT(*) as count
FROM suppliers 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access inventory_items
SELECT 'Can access inventory_items:' as test, COUNT(*) as count
FROM inventory_items 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access rooms
SELECT 'Can access rooms:' as test, COUNT(*) as count
FROM rooms 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT '=== ROBUST AUTHENTICATION FIX COMPLETE ===' as info;
SELECT 'Authentication and data access should now be working. Dashboard should show data correctly.' as status;
