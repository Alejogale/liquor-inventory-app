-- Fix RLS Policies for Data Access
-- This script ensures that users can access their data properly
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT RLS POLICIES
-- =====================================================
SELECT '=== STEP 1: CHECKING CURRENT RLS POLICIES ===' as info;

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'organizations', 'categories', 'suppliers', 'inventory_items', 'rooms')
ORDER BY tablename, policyname;

-- =====================================================
-- STEP 2: DROP EXISTING POLICIES
-- =====================================================
SELECT '=== STEP 2: DROPPING EXISTING POLICIES ===' as info;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can view inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can view rooms in their organization" ON rooms;
DROP POLICY IF EXISTS "Users can view room counts in their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can view activity logs in their organization" ON activity_logs;

-- =====================================================
-- STEP 3: CREATE NEW RLS POLICIES
-- =====================================================
SELECT '=== STEP 3: CREATING NEW RLS POLICIES ===' as info;

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

-- Create RLS policies for organizations
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for categories
CREATE POLICY "Users can view categories in their organization" ON categories
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert categories in their organization" ON categories
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update categories in their organization" ON categories
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete categories in their organization" ON categories
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for suppliers
CREATE POLICY "Users can view suppliers in their organization" ON suppliers
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert suppliers in their organization" ON suppliers
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update suppliers in their organization" ON suppliers
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete suppliers in their organization" ON suppliers
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for inventory_items
CREATE POLICY "Users can view inventory items in their organization" ON inventory_items
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert inventory items in their organization" ON inventory_items
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update inventory items in their organization" ON inventory_items
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete inventory items in their organization" ON inventory_items
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for rooms
CREATE POLICY "Users can view rooms in their organization" ON rooms
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rooms in their organization" ON rooms
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update rooms in their organization" ON rooms
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete rooms in their organization" ON rooms
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for room_counts
CREATE POLICY "Users can view room counts in their organization" ON room_counts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert room counts in their organization" ON room_counts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update room counts in their organization" ON room_counts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete room counts in their organization" ON room_counts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for activity_logs
CREATE POLICY "Users can view activity logs in their organization" ON activity_logs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert activity logs in their organization" ON activity_logs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 4: VERIFY POLICIES
-- =====================================================
SELECT '=== STEP 4: VERIFYING POLICIES ===' as info;

SELECT 'New RLS policies created:' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'organizations', 'categories', 'suppliers', 'inventory_items', 'rooms')
ORDER BY tablename, policyname;

SELECT '=== RLS POLICIES FIX COMPLETE ===' as info;
SELECT 'Data access should now work properly for all users.' as status;
