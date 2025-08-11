-- Safe Database Migration for Hospitality Hub Platform
-- This script safely adds missing columns and tables without breaking existing data

-- =====================================================
-- SAFE ORGANIZATION TABLE MIGRATION
-- =====================================================

-- Add missing columns to organizations table if they don't exist
DO $$
BEGIN
    -- Add owner_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'owner_id') THEN
        ALTER TABLE organizations ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'created_by') THEN
        ALTER TABLE organizations ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
    
    -- Add uuid_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'uuid_id') THEN
        ALTER TABLE organizations ADD COLUMN uuid_id UUID UNIQUE DEFAULT gen_random_uuid();
    END IF;
    
    -- Add missing subscription columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscription_status') THEN
        ALTER TABLE organizations ADD COLUMN subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'subscription_plan') THEN
        ALTER TABLE organizations ADD COLUMN subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'pro', 'enterprise'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE organizations ADD COLUMN stripe_customer_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'address') THEN
        ALTER TABLE organizations ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'phone') THEN
        ALTER TABLE organizations ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'industry') THEN
        ALTER TABLE organizations ADD COLUMN industry TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE organizations ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'updated_at') THEN
        ALTER TABLE organizations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- SAFE USER_PROFILES TABLE MIGRATION
-- =====================================================

-- Add missing columns to user_profiles table if they don't exist
DO $$
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'status') THEN
        ALTER TABLE user_profiles ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive'));
    END IF;
    
    -- Add invited_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'invited_by') THEN
        ALTER TABLE user_profiles ADD COLUMN invited_by UUID REFERENCES user_profiles(id);
    END IF;
    
    -- Add invited_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'invited_at') THEN
        ALTER TABLE user_profiles ADD COLUMN invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Add last_login column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'last_login') THEN
        ALTER TABLE user_profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- CREATE NEW TABLES (if they don't exist)
-- =====================================================

-- App Management System
CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    icon TEXT,
    price_tier TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Subscriptions for Organizations
CREATE TABLE IF NOT EXISTS app_subscriptions (
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    app_id TEXT REFERENCES apps(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active',
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (organization_id, app_id)
);

-- Granular User Permissions System
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL, -- 'liquor-inventory', 'reservation-management', 'member-database'
    permission_type TEXT NOT NULL, -- 'view', 'create', 'edit', 'delete', 'export', 'admin'
    granted_by UUID REFERENCES user_profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Enhanced Activity Logging (Platform-wide)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    app_id TEXT,
    action_type TEXT NOT NULL,
    action_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Templates for Organizations
CREATE TABLE IF NOT EXISTS role_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'Manager', 'Staff', 'Viewer'
    description TEXT,
    permissions JSONB NOT NULL, -- Default permissions for this role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Invitations table (for the invitation system)
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'viewer')),
    job_title TEXT,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES user_profiles(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    app_permissions JSONB, -- Custom permissions for this invitation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE NEW APP TABLES
-- =====================================================

-- Members with SEARCH optimization
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    member_number TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email TEXT,
    phone TEXT,
    address JSONB,
    membership_type TEXT,
    membership_status TEXT DEFAULT 'active',
    join_date DATE,
    notes TEXT,
    -- SEARCH OPTIMIZATION for reservation autocomplete
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || coalesce(member_number, ''))
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, member_number)
);

-- Family Members with reservation authorization
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    primary_member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    relationship TEXT,
    date_of_birth DATE,
    can_make_reservations BOOLEAN DEFAULT false, -- CRITICAL for reservation system
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservation Rooms (convert from Google Apps Script structure)
CREATE TABLE IF NOT EXISTS reservation_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- 'COV', 'RAYNOR', 'SUN', 'PUB'
    description TEXT,
    capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservation Tables with Layout System
CREATE TABLE IF NOT EXISTS reservation_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    room_id UUID REFERENCES reservation_rooms(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL, -- '801', '201', etc.
    seats INTEGER DEFAULT 4,
    -- Table Layout System (PRIORITY: circles, squares, rectangles)
    x_position FLOAT DEFAULT 0,
    y_position FLOAT DEFAULT 0,
    width FLOAT DEFAULT 100,
    height FLOAT DEFAULT 100,
    shape TEXT DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'square')),
    rotation FLOAT DEFAULT 0,
    is_combinable BOOLEAN DEFAULT true, -- For table combining feature
    combined_with_table_id UUID REFERENCES reservation_tables(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations (convert from Google Apps Script)
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id), -- CRITICAL: Link to member database
    room_id UUID REFERENCES reservation_rooms(id),
    table_id UUID REFERENCES reservation_tables(id),
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    member_name TEXT NOT NULL, -- Will auto-fill from member search
    member_number TEXT, -- Will auto-fill from member search
    party_size INTEGER NOT NULL,
    notes TEXT,
    staff_member TEXT,
    -- EXACT status options from Google Apps Script (NO F1 theme)
    status TEXT DEFAULT 'Waiting to arrive' CHECK (status IN ('Waiting to arrive', 'Here', 'Left', 'Canceled', 'No Dessert', 'Received Dessert', 'Menus Open', 'Ordered', 'At The Bar')),
    service_type TEXT DEFAULT 'dinner' CHECK (service_type IN ('dinner', 'lunch')),
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES SAFELY
-- =====================================================

-- Platform Core Indexes (with safe column checks)
DO $$
BEGIN
    -- Only create indexes if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'owner_id') THEN
        CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'created_by') THEN
        CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'uuid_id') THEN
        CREATE INDEX IF NOT EXISTS idx_organizations_uuid ON organizations(uuid_id);
    END IF;
END $$;

-- Safe indexes for user_profiles
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'organization_id') THEN
        CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON user_profiles(organization_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'email') THEN
        CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'role') THEN
        CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
    END IF;
END $$;

-- New table indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_app ON user_permissions(app_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_organization ON user_activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Liquor Inventory Indexes (safe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        CREATE INDEX IF NOT EXISTS idx_categories_organization ON categories(organization_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        CREATE INDEX IF NOT EXISTS idx_suppliers_organization ON suppliers(organization_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        CREATE INDEX IF NOT EXISTS idx_inventory_items_organization ON inventory_items(organization_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
        CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        CREATE INDEX IF NOT EXISTS idx_rooms_organization ON rooms(organization_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') THEN
        CREATE INDEX IF NOT EXISTS idx_room_counts_organization ON room_counts(organization_id);
        CREATE INDEX IF NOT EXISTS idx_room_counts_inventory_item ON room_counts(inventory_item_id);
        CREATE INDEX IF NOT EXISTS idx_room_counts_room ON room_counts(room_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_activity_logs_organization ON activity_logs(organization_id);
        CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
    END IF;
END $$;

-- Reservation Management Indexes
CREATE INDEX IF NOT EXISTS idx_reservation_rooms_organization ON reservation_rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_reservation_tables_room ON reservation_tables(room_id);
CREATE INDEX IF NOT EXISTS idx_reservation_tables_organization ON reservation_tables(organization_id);
CREATE INDEX IF NOT EXISTS idx_reservations_organization ON reservations(organization_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_reservations_member ON reservations(member_id);
CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_service_type ON reservations(service_type);

-- Member Database Indexes (CRITICAL for search performance)
CREATE INDEX IF NOT EXISTS idx_members_search ON members USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_members_organization ON members(organization_id);
CREATE INDEX IF NOT EXISTS idx_members_last_name ON members(organization_id, last_name);
CREATE INDEX IF NOT EXISTS idx_members_member_number ON members(organization_id, member_number);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(organization_id, membership_status);
CREATE INDEX IF NOT EXISTS idx_family_members_primary ON family_members(primary_member_id);
CREATE INDEX IF NOT EXISTS idx_family_members_organization ON family_members(organization_id);

-- =====================================================
-- INSERT INITIAL DATA
-- =====================================================

-- Insert default apps
INSERT INTO apps (id, name, description, category, icon, price_tier) VALUES
('liquor-inventory', 'Liquor Inventory', 'Complete inventory management for bars and restaurants', 'inventory', 'package', 'basic'),
('reservation-management', 'Reservation Management', 'Table reservations and guest management', 'reservations', 'calendar', 'basic'),
('member-database', 'Member Database', 'Member management and search system', 'members', 'users', 'basic'),
('pos-system', 'POS System', 'Point of sale integration (coming soon)', 'pos', 'credit-card', 'pro')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
DO $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'organizations', 'user_profiles', 'apps', 'app_subscriptions', 
            'user_permissions', 'user_activity_logs', 'role_templates',
            'categories', 'suppliers', 'inventory_items', 'rooms', 'room_counts', 
            'activity_logs', 'reservation_rooms', 'reservation_tables', 
            'reservations', 'members', 'family_members', 'user_invitations'
        )
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;
