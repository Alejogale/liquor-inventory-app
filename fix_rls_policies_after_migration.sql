-- FIX RLS POLICIES AFTER UUID MIGRATION
-- This script recreates RLS policies that work with the new UUID schema

-- First, let's see what policies currently exist
SELECT '=== CURRENT POLICIES ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN (
    'organizations', 'user_profiles', 'app_subscriptions', 'user_activity_logs',
    'role_templates', 'user_invitations', 'members', 'family_members',
    'reservation_rooms', 'reservation_tables', 'reservations', 'categories',
    'suppliers', 'inventory_items', 'rooms', 'room_counts', 'activity_logs'
)
ORDER BY tablename, policyname;

-- Drop all existing policies on these tables
SELECT '=== DROPPING EXISTING POLICIES ===' as info;

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename IN (
            'organizations', 'user_profiles', 'app_subscriptions', 'user_activity_logs',
            'role_templates', 'user_invitations', 'members', 'family_members',
            'reservation_rooms', 'reservation_tables', 'reservations', 'categories',
            'suppliers', 'inventory_items', 'rooms', 'room_counts', 'activity_logs'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Create new RLS policies that work with UUID schema
SELECT '=== CREATING NEW RLS POLICIES ===' as info;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations 
FOR ALL USING (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert their own organization" ON organizations 
FOR INSERT WITH CHECK (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update their own organization" ON organizations 
FOR UPDATE USING (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles 
FOR ALL USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization" ON user_profiles 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert their own profile" ON user_profiles 
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles 
FOR UPDATE USING (id = auth.uid());

-- App subscriptions policies
CREATE POLICY "Users can view app subscriptions for their organization" ON app_subscriptions 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert app subscriptions for their organization" ON app_subscriptions 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- User activity logs policies
CREATE POLICY "Users can view activity logs for their organization" ON user_activity_logs 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert activity logs for their organization" ON user_activity_logs 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Role templates policies
CREATE POLICY "Users can view role templates for their organization" ON role_templates 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert role templates for their organization" ON role_templates 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- User invitations policies
CREATE POLICY "Users can view invitations for their organization" ON user_invitations 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert invitations for their organization" ON user_invitations 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Members policies
CREATE POLICY "Users can view members for their organization" ON members 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert members for their organization" ON members 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Family members policies
CREATE POLICY "Users can view family members for their organization" ON family_members 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert family members for their organization" ON family_members 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Reservation rooms policies
CREATE POLICY "Users can view reservation rooms for their organization" ON reservation_rooms 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert reservation rooms for their organization" ON reservation_rooms 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Reservation tables policies
CREATE POLICY "Users can view reservation tables for their organization" ON reservation_tables 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert reservation tables for their organization" ON reservation_tables 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Reservations policies
CREATE POLICY "Users can view reservations for their organization" ON reservations 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert reservations for their organization" ON reservations 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Categories policies
CREATE POLICY "Users can view categories for their organization" ON categories 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert categories for their organization" ON categories 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update categories for their organization" ON categories 
FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete categories for their organization" ON categories 
FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Suppliers policies
CREATE POLICY "Users can view suppliers for their organization" ON suppliers 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert suppliers for their organization" ON suppliers 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update suppliers for their organization" ON suppliers 
FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete suppliers for their organization" ON suppliers 
FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Inventory items policies
CREATE POLICY "Users can view inventory items for their organization" ON inventory_items 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert inventory items for their organization" ON inventory_items 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update inventory items for their organization" ON inventory_items 
FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete inventory items for their organization" ON inventory_items 
FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Rooms policies
CREATE POLICY "Users can view rooms for their organization" ON rooms 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert rooms for their organization" ON rooms 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update rooms for their organization" ON rooms 
FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete rooms for their organization" ON rooms 
FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Room counts policies
CREATE POLICY "Users can view room counts for their organization" ON room_counts 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert room counts for their organization" ON room_counts 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can update room counts for their organization" ON room_counts 
FOR UPDATE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can delete room counts for their organization" ON room_counts 
FOR DELETE USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Activity logs policies
CREATE POLICY "Users can view activity logs for their organization" ON activity_logs 
FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can insert activity logs for their organization" ON activity_logs 
FOR INSERT WITH CHECK (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Verify the new policies
SELECT '=== NEW POLICIES CREATED ===' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN (
    'organizations', 'user_profiles', 'app_subscriptions', 'user_activity_logs',
    'role_templates', 'user_invitations', 'members', 'family_members',
    'reservation_rooms', 'reservation_tables', 'reservations', 'categories',
    'suppliers', 'inventory_items', 'rooms', 'room_counts', 'activity_logs'
)
ORDER BY tablename, policyname;

-- Test data access
SELECT '=== TESTING DATA ACCESS ===' as info;

-- Check if we can see organizations
SELECT 'Organizations count:' as test, COUNT(*) as count FROM organizations;

-- Check if we can see user_profiles
SELECT 'User profiles count:' as test, COUNT(*) as count FROM user_profiles;

-- Check if we can see categories
SELECT 'Categories count:' as test, COUNT(*) as count FROM categories;

-- Check if we can see suppliers
SELECT 'Suppliers count:' as test, COUNT(*) as count FROM suppliers;

-- Check if we can see inventory_items
SELECT 'Inventory items count:' as test, COUNT(*) as count FROM inventory_items;

-- Check if we can see rooms
SELECT 'Rooms count:' as test, COUNT(*) as count FROM rooms;

SELECT '=== RLS POLICIES FIXED ===' as info;
SELECT 'RLS policies have been recreated to work with the new UUID schema. Dashboard should now show data correctly.' as status;
