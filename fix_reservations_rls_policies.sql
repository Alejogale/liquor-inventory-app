-- Fix Reservations RLS Policies and Schema
-- Run this in your Supabase SQL Editor
-- 
-- This fixes the RLS policy error when importing reservations
-- Root cause: Missing RLS policies for reservations table

-- STEP 1: Fix the organization_id column type in reservations table
-- The schema shows BIGINT but the system uses UUID for organizations

-- Check current schema first
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'reservations'
ORDER BY ordinal_position;

-- Fix organization_id column type if needed
DO $$
BEGIN
    -- Check if organization_id is BIGINT and fix it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reservations' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        -- Drop foreign key constraint first if it exists
        ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_organization_id_fkey;
        
        -- Change column type to UUID
        ALTER TABLE reservations ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
        
        -- Re-add foreign key constraint
        ALTER TABLE reservations ADD CONSTRAINT reservations_organization_id_fkey 
            FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Drop any existing policies (in case they exist)
DROP POLICY IF EXISTS "Users can view reservations in their organization" ON reservations;
DROP POLICY IF EXISTS "Users can insert reservations in their organization" ON reservations;
DROP POLICY IF EXISTS "Users can update reservations in their organization" ON reservations;
DROP POLICY IF EXISTS "Users can delete reservations in their organization" ON reservations;

-- Create RLS policies for reservations table
CREATE POLICY "Users can view reservations in their organization" ON reservations
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reservations in their organization" ON reservations
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update reservations in their organization" ON reservations
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reservations in their organization" ON reservations
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Also create policies for reservation_rooms and reservation_tables
DROP POLICY IF EXISTS "Users can view reservation_rooms in their organization" ON reservation_rooms;
DROP POLICY IF EXISTS "Users can insert reservation_rooms in their organization" ON reservation_rooms;
DROP POLICY IF EXISTS "Users can update reservation_rooms in their organization" ON reservation_rooms;
DROP POLICY IF EXISTS "Users can delete reservation_rooms in their organization" ON reservation_rooms;

CREATE POLICY "Users can view reservation_rooms in their organization" ON reservation_rooms
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reservation_rooms in their organization" ON reservation_rooms
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update reservation_rooms in their organization" ON reservation_rooms
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reservation_rooms in their organization" ON reservation_rooms
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Also create policies for reservation_tables
DROP POLICY IF EXISTS "Users can view reservation_tables in their organization" ON reservation_tables;
DROP POLICY IF EXISTS "Users can insert reservation_tables in their organization" ON reservation_tables;
DROP POLICY IF EXISTS "Users can update reservation_tables in their organization" ON reservation_tables;
DROP POLICY IF EXISTS "Users can delete reservation_tables in their organization" ON reservation_tables;

CREATE POLICY "Users can view reservation_tables in their organization" ON reservation_tables
    FOR SELECT USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reservation_tables in their organization" ON reservation_tables
    FOR INSERT WITH CHECK (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update reservation_tables in their organization" ON reservation_tables
    FOR UPDATE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reservation_tables in their organization" ON reservation_tables
    FOR DELETE USING (
        organization_id = (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );
