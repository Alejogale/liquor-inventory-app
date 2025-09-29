-- Safe script to fix room_counts table - only creates what's missing
-- This handles the case where some parts already exist

-- First, let's see what we have
SELECT '=== CHECKING CURRENT STATE ===' as info;

-- Check if table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') 
        THEN 'room_counts table EXISTS' 
        ELSE 'room_counts table MISSING' 
    END as table_status;

-- Check if table has the right structure
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') 
        THEN (SELECT json_agg(column_name ORDER BY ordinal_position) FROM information_schema.columns WHERE table_name = 'room_counts')::text
        ELSE 'N/A' 
    END as table_columns;

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- Enable RLS (safe to run multiple times)
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view room counts for their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can insert room counts for their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can update room counts for their organization" ON room_counts;
DROP POLICY IF EXISTS "Users can delete room counts for their organization" ON room_counts;

-- Create RLS policies (fresh)
CREATE POLICY "Users can view room counts for their organization" ON room_counts 
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can insert room counts for their organization" ON room_counts 
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can update room counts for their organization" ON room_counts 
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can delete room counts for their organization" ON room_counts 
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

-- Create indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_room_counts_room_id ON room_counts(room_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_organization_id ON room_counts(organization_id);

-- Create or replace the trigger function (safe to run multiple times)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop and recreate trigger (to avoid conflicts)
DROP TRIGGER IF EXISTS update_room_counts_updated_at ON room_counts;
CREATE TRIGGER update_room_counts_updated_at 
    BEFORE UPDATE ON room_counts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Final verification
SELECT '=== FINAL STATUS ===' as info;
SELECT 'room_counts table is ready!' as status;
SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_name = 'room_counts';
SELECT COUNT(*) as policies_exist FROM pg_policies WHERE tablename = 'room_counts';
