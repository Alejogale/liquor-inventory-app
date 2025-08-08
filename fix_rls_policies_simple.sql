-- =====================================================
-- FIX RLS POLICIES - SIMPLE APPROACH
-- =====================================================
-- This script fixes all RLS policies to work with UUID organization_id columns
-- Using a simpler, more direct approach

-- =====================================================
-- FIX CATEGORIES RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can insert categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can update categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can delete categories for their organization" ON categories;

-- Create new policies with simple UUID logic
CREATE POLICY "Users can view categories for their organization" ON categories
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert categories for their organization" ON categories
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update categories for their organization" ON categories
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete categories for their organization" ON categories
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- FIX SUPPLIERS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers for their organization" ON suppliers;

-- Create new policies
CREATE POLICY "Users can view suppliers for their organization" ON suppliers
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert suppliers for their organization" ON suppliers
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update suppliers for their organization" ON suppliers
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete suppliers for their organization" ON suppliers
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- FIX INVENTORY_ITEMS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items for their organization" ON inventory_items;

-- Create new policies
CREATE POLICY "Users can view inventory items for their organization" ON inventory_items
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert inventory items for their organization" ON inventory_items
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update inventory items for their organization" ON inventory_items
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete inventory items for their organization" ON inventory_items
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- FIX ROOMS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view rooms for their organization" ON rooms;
DROP POLICY IF EXISTS "Users can insert rooms for their organization" ON rooms;
DROP POLICY IF EXISTS "Users can update rooms for their organization" ON rooms;
DROP POLICY IF EXISTS "Users can delete rooms for their organization" ON rooms;

-- Create new policies
CREATE POLICY "Users can view rooms for their organization" ON rooms
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rooms for their organization" ON rooms
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update rooms for their organization" ON rooms
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete rooms for their organization" ON rooms
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- FIX ROOM_COUNTS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view room counts for their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can insert room counts for their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can update room counts for their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can delete room counts for their organization" ON room_counts;

-- Create new policies
CREATE POLICY "Users can view room counts for their organization" ON room_counts
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert room counts for their organization" ON room_counts
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update room counts for their organization" ON room_counts
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete room counts for their organization" ON room_counts
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- FIX ACTIVITY_LOGS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view activity logs for their organization" ON activity_logs;
DROP POLICY IF EXISTS "Users can insert activity logs for their organization" ON activity_logs;
DROP POLICY IF EXISTS "Users can update activity logs for their organization" ON activity_logs;
DROP POLICY IF EXISTS "Users can delete activity logs for their organization" ON activity_logs;

-- Create new policies
CREATE POLICY "Users can view activity logs for their organization" ON activity_logs
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert activity logs for their organization" ON activity_logs
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update activity logs for their organization" ON activity_logs
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete activity logs for their organization" ON activity_logs
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- VERIFY POLICIES
-- =====================================================

-- Check all policies after the fix
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('categories', 'suppliers', 'inventory_items', 'rooms', 'room_counts', 'activity_logs')
ORDER BY tablename, policyname;

-- Test queries to make sure RLS is working
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'room_counts', COUNT(*) FROM room_counts
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs; 