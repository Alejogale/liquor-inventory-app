-- Simple UUID Fix for Organizations Table
-- Run this in your Supabase SQL Editor
-- This adds a UUID column and migrates the data

-- First, let's see the current schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check current data
SELECT 
    id,
    "Name",
    slug,
    created_by,
    created_at
FROM organizations
ORDER BY created_at DESC;

-- Step 1: Add a new UUID column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS uuid_id UUID DEFAULT gen_random_uuid();

-- Step 2: Update the UUID column for existing records
UPDATE organizations SET uuid_id = gen_random_uuid() WHERE uuid_id IS NULL;

-- Step 3: Make the UUID column NOT NULL
ALTER TABLE organizations ALTER COLUMN uuid_id SET NOT NULL;

-- Step 4: Add unique constraint on UUID
ALTER TABLE organizations ADD CONSTRAINT organizations_uuid_unique UNIQUE (uuid_id);

-- Step 5: Create index on UUID
CREATE INDEX IF NOT EXISTS idx_organizations_uuid ON organizations(uuid_id);

-- Step 6: Show the updated schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Step 7: Show the data with both old and new IDs
SELECT 
    id as old_integer_id,
    uuid_id as new_uuid_id,
    "Name",
    slug,
    created_by,
    created_at
FROM organizations
ORDER BY created_at DESC; 