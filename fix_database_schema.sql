-- Fix Database Schema - Create Missing Tables and Fix Permissions
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'owner')),
    job_title TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise')),
    owner_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    stripe_customer_id TEXT,
    address TEXT,
    phone TEXT,
    industry TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
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
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create inventory_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    size TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    threshold INTEGER DEFAULT 0,
    par_level INTEGER DEFAULT 0,
    barcode TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create room_counts table if it doesn't exist
CREATE TABLE IF NOT EXISTS room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- 8. Create activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('count_updated', 'item_added', 'item_edited', 'room_changed', 'report_sent', 'account_created')),
    item_brand TEXT,
    room_name TEXT,
    old_value INTEGER,
    new_value INTEGER,
    change_type TEXT CHECK (change_type IN ('scan', 'manual', 'button')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
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

-- 10. Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON user_profiles;
CREATE POLICY "Users can view profiles in their organization" ON user_profiles
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 11. Create RLS policies for organizations
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 12. Create RLS policies for categories
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
CREATE POLICY "Users can view categories in their organization" ON categories
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 13. Create RLS policies for suppliers
DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON suppliers;
CREATE POLICY "Users can view suppliers in their organization" ON suppliers
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 14. Create RLS policies for inventory_items
DROP POLICY IF EXISTS "Users can view items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete items in their organization" ON inventory_items;

CREATE POLICY "Users can view items in their organization" ON inventory_items
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert items in their organization" ON inventory_items
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update items in their organization" ON inventory_items
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete items in their organization" ON inventory_items
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 15. Create RLS policies for rooms
DROP POLICY IF EXISTS "Users can view rooms in their organization" ON rooms;
CREATE POLICY "Users can view rooms in their organization" ON rooms
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 16. Create RLS policies for room_counts
DROP POLICY IF EXISTS "Users can view room counts in their organization" ON room_counts;
CREATE POLICY "Users can view room counts in their organization" ON room_counts
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 17. Create RLS policies for activity_logs
DROP POLICY IF EXISTS "Users can view activity logs for their organization" ON activity_logs;
CREATE POLICY "Users can view activity logs for their organization" ON activity_logs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 18. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_categories_organization ON categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_organization ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_organization ON inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_rooms_organization ON rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_organization ON room_counts(organization_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_inventory_item ON room_counts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_room ON room_counts(room_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_organization ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- 19. Add unique constraints (drop first if exists)
DO $$ BEGIN
    ALTER TABLE room_counts ADD CONSTRAINT unique_room_count 
        UNIQUE (inventory_item_id, room_id, organization_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 20. Add check constraints (drop first if exists)
DO $$ BEGIN
    ALTER TABLE inventory_items ADD CONSTRAINT check_positive_threshold 
        CHECK (threshold >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE inventory_items ADD CONSTRAINT check_positive_par_level 
        CHECK (par_level >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE room_counts ADD CONSTRAINT check_non_negative_count 
        CHECK (count >= 0);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Success message
SELECT 'Database schema fixed successfully! All tables and policies created.' as status; 