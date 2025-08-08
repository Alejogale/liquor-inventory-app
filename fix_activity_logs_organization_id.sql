-- =====================================================
-- FIX ACTIVITY_LOGS ORGANIZATION_ID COLUMN
-- =====================================================
-- This script fixes the organization_id column in activity_logs table
-- to use UUID instead of integer to match other tables

-- First, let's check the current schema
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_logs' 
AND column_name = 'organization_id';

-- Add a new UUID column
ALTER TABLE activity_logs ADD COLUMN organization_id_uuid UUID;

-- Update the new column with the UUID values from organizations table
UPDATE activity_logs 
SET organization_id_uuid = o.uuid_id
FROM organizations o 
WHERE activity_logs.organization_id = o.id;

-- Drop the old integer column
ALTER TABLE activity_logs DROP COLUMN organization_id;

-- Rename the new UUID column to organization_id
ALTER TABLE activity_logs RENAME COLUMN organization_id_uuid TO organization_id;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'activity_logs' 
AND column_name = 'organization_id';

-- Test query to make sure it works
SELECT al.id, al.action, o."Name" as organization_name
FROM activity_logs al
LEFT JOIN organizations o ON al.organization_id = o.uuid_id
LIMIT 5; 