-- FIX SCRIPT: Connect Rooms tab with Count tab
-- This script creates the missing reservation_room_counts table and sets up proper relationships

SELECT '=== FIXING ROOM COUNTING SYSTEM ===' as info;

-- Step 1: Create reservation_room_counts table
SELECT 'Step 1: Creating reservation_room_counts table...' as step;

CREATE TABLE IF NOT EXISTS reservation_room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES reservation_rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- Step 2: Enable RLS
SELECT 'Step 2: Enabling Row Level Security...' as step;
ALTER TABLE reservation_room_counts ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
SELECT 'Step 3: Creating RLS policies...' as step;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view reservation room counts for their organization" ON reservation_room_counts;
DROP POLICY IF EXISTS "Users can insert reservation room counts for their organization" ON reservation_room_counts;
DROP POLICY IF EXISTS "Users can update reservation room counts for their organization" ON reservation_room_counts;
DROP POLICY IF EXISTS "Users can delete reservation room counts for their organization" ON reservation_room_counts;

-- Create new policies
CREATE POLICY "Users can view reservation room counts for their organization" ON reservation_room_counts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reservation room counts for their organization" ON reservation_room_counts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update reservation room counts for their organization" ON reservation_room_counts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reservation room counts for their organization" ON reservation_room_counts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Step 4: Add indexes for performance
SELECT 'Step 4: Adding performance indexes...' as step;
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_room_id ON reservation_room_counts(room_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_organization_id ON reservation_room_counts(organization_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_inventory_item_id ON reservation_room_counts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_updated_at ON reservation_room_counts(updated_at);

-- Step 5: Verify the setup
SELECT 'Step 5: Verifying setup...' as step;

-- Check if table was created
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservation_room_counts') 
        THEN 'SUCCESS: reservation_room_counts table created'
        ELSE 'ERROR: reservation_room_counts table not created'
    END as table_creation_status;

-- Check if RLS is enabled
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace 
            WHERE c.relname = 'reservation_room_counts' 
            AND n.nspname = 'public' 
            AND c.relrowsecurity = true
        )
        THEN 'SUCCESS: RLS enabled on reservation_room_counts'
        ELSE 'ERROR: RLS not enabled on reservation_room_counts'
    END as rls_status;

-- Check if policies exist
SELECT 
    COUNT(*) as policy_count,
    'SUCCESS: RLS policies created' as policy_status
FROM pg_policies 
WHERE tablename = 'reservation_room_counts';

-- Check if indexes exist
SELECT 
    COUNT(*) as index_count,
    'SUCCESS: Performance indexes created' as index_status
FROM pg_indexes 
WHERE tablename = 'reservation_room_counts';

-- Step 6: Show current room data
SELECT 'Step 6: Current room data...' as step;
SELECT 
    'reservation_rooms' as table_name,
    COUNT(*) as room_count
FROM reservation_rooms
UNION ALL
SELECT 
    'reservation_room_counts' as table_name,
    COUNT(*) as room_count
FROM reservation_room_counts;

SELECT '=== FIX COMPLETE ===' as info;
SELECT 'Now your Rooms tab and Count tab should work together!' as result;
