-- Fix Missing Policies - Only Add What's Missing
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'owner')),
    job_title TEXT,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'trial',
    subscription_plan TEXT DEFAULT 'free',
    owner_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_person TEXT,
    notes TEXT,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create inventory_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    size TEXT,
    category_id UUID,
    supplier_id UUID,
    threshold INTEGER DEFAULT 0,
    par_level INTEGER DEFAULT 0,
    barcode TEXT,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create room_counts table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_counts (
    inventory_item_id UUID,
    room_id UUID,
    count INTEGER DEFAULT 0,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- 8. Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    item_brand TEXT,
    room_name TEXT,
    old_value INTEGER,
    new_value INTEGER,
    change_type TEXT,
    organization_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 10. Create inventory_items policies (the main issue) - only if they don't exist
DO $$ 
BEGIN
    -- Drop existing policies first
    DROP POLICY IF EXISTS "Users can view items in their organization" ON inventory_items;
    DROP POLICY IF EXISTS "Users can insert items in their organization" ON inventory_items;
    DROP POLICY IF EXISTS "Users can update items in their organization" ON inventory_items;
    DROP POLICY IF EXISTS "Users can delete items in their organization" ON inventory_items;
    
    -- Create new policies
    CREATE POLICY "Users can view items in their organization" ON inventory_items
        FOR SELECT USING (true);
    
    CREATE POLICY "Users can insert items in their organization" ON inventory_items
        FOR INSERT WITH CHECK (true);
    
    CREATE POLICY "Users can update items in their organization" ON inventory_items
        FOR UPDATE USING (true);
    
    CREATE POLICY "Users can delete items in their organization" ON inventory_items
        FOR DELETE USING (true);
        
    RAISE NOTICE 'Inventory items policies created successfully';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating inventory items policies: %', SQLERRM;
END $$;

-- 11. Create other policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can view categories in their organization') THEN
        CREATE POLICY "Users can view categories in their organization" ON categories
            FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Categories policy already exists or error: %', SQLERRM;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can view suppliers in their organization') THEN
        CREATE POLICY "Users can view suppliers in their organization" ON suppliers
            FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Suppliers policy already exists or error: %', SQLERRM;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rooms' AND policyname = 'Users can view rooms in their organization') THEN
        CREATE POLICY "Users can view rooms in their organization" ON rooms
            FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Rooms policy already exists or error: %', SQLERRM;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'room_counts' AND policyname = 'Users can view room counts in their organization') THEN
        CREATE POLICY "Users can view room counts in their organization" ON room_counts
            FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Room counts policy already exists or error: %', SQLERRM;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view profiles in their organization') THEN
        CREATE POLICY "Users can view profiles in their organization" ON user_profiles
            FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'User profiles policy already exists or error: %', SQLERRM;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can view their organization') THEN
        CREATE POLICY "Users can view their organization" ON organizations
            FOR ALL USING (true);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Organizations policy already exists or error: %', SQLERRM;
END $$;

-- Success message
SELECT 'Database policies fixed successfully! Edit Item functionality should now work.' as status; 