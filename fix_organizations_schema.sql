-- Fix Organizations Table Schema
-- Run this in your Supabase SQL Editor

-- Add created_by column if it doesn't exist
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add owner_id column if it doesn't exist (for backward compatibility)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- Update existing organizations to have created_by if it's null
UPDATE organizations 
SET created_by = owner_id 
WHERE created_by IS NULL AND owner_id IS NOT NULL;

-- Create index on created_by for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- Show the final schema
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position; 