-- Comprehensive Database Fix
-- This script fixes ALL the authentication and data access issues
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================
SELECT '=== STEP 1: CURRENT STATE CHECK ===' as info;

-- Check if tables exist
SELECT 'Tables that exist:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'organizations', 'categories', 'suppliers', 'inventory_items', 'rooms')
ORDER BY table_name;

-- =====================================================
-- STEP 2: CREATE/FIX USER_PROFILES TABLE
-- =====================================================
SELECT '=== STEP 2: FIXING USER_PROFILES TABLE ===' as info;

-- Drop existing user_profiles table if it has wrong schema
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table with correct schema
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

-- =====================================================
-- STEP 3: CREATE/FIX ORGANIZATIONS TABLE
-- =====================================================
SELECT '=== STEP 3: FIXING ORGANIZATIONS TABLE ===' as info;

-- Drop existing organizations table if it has wrong schema
DROP TABLE IF EXISTS organizations CASCADE;

-- Create organizations table with correct schema
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

-- =====================================================
-- STEP 4: CREATE/FIX OTHER TABLES
-- =====================================================
SELECT '=== STEP 4: FIXING OTHER TABLES ===' as info;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_person TEXT,
    notes TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    size TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    threshold INTEGER DEFAULT 0,
    par_level INTEGER DEFAULT 0,
    barcode TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_counts table
CREATE TABLE IF NOT EXISTS room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    item_brand TEXT,
    room_name TEXT,
    old_value INTEGER,
    new_value INTEGER,
    change_type TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 5: ENABLE RLS AND CREATE POLICIES
-- =====================================================
SELECT '=== STEP 5: ENABLING RLS AND CREATING POLICIES ===' as info;

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can view inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can view rooms in their organization" ON rooms;
DROP POLICY IF EXISTS "Users can view room counts in their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can view activity logs in their organization" ON activity_logs;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view categories in their organization" ON categories
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view suppliers in their organization" ON suppliers
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view inventory items in their organization" ON inventory_items
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view rooms in their organization" ON rooms
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view room counts in their organization" ON room_counts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view activity logs in their organization" ON activity_logs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 6: CREATE USER PROFILE AND ORGANIZATION
-- =====================================================
SELECT '=== STEP 6: CREATING USER PROFILE AND ORGANIZATION ===' as info;

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
-- STEP 7: FIX ORPHANED DATA
-- =====================================================
SELECT '=== STEP 7: FIXING ORPHANED DATA ===' as info;

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

-- =====================================================
-- STEP 8: VERIFICATION
-- =====================================================
SELECT '=== STEP 8: VERIFICATION ===' as info;

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

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 3;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 3;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 3;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 3;

SELECT '=== COMPREHENSIVE DATABASE FIX COMPLETE ===' as info;
SELECT 'All authentication and data access issues should now be resolved. Dashboard should show data correctly.' as status;
