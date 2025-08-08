-- Fix Organizations Table UUID Schema
-- Run this in your Supabase SQL Editor
-- This will convert the organizations table to use UUID primary keys

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

-- Step 1: Create a new organizations table with UUID primary key
CREATE TABLE IF NOT EXISTS organizations_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
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

-- Step 2: Copy data from old table to new table
INSERT INTO organizations_new (
    "Name", 
    slug, 
    subscription_status, 
    subscription_plan, 
    created_by, 
    stripe_customer_id, 
    address, 
    phone, 
    industry, 
    trial_ends_at, 
    created_at, 
    updated_at
)
SELECT 
    "Name", 
    slug, 
    subscription_status, 
    subscription_plan, 
    created_by, 
    stripe_customer_id, 
    address, 
    phone, 
    industry, 
    trial_ends_at, 
    created_at, 
    updated_at
FROM organizations;

-- Step 3: Drop the old table and rename the new one
DROP TABLE organizations;
ALTER TABLE organizations_new RENAME TO organizations;

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Step 5: Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Step 6: Recreate RLS policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Step 7: Verify the new schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Step 8: Show the new data
SELECT 
    id,
    "Name",
    slug,
    created_by,
    created_at
FROM organizations
ORDER BY created_at DESC; 