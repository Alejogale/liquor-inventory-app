-- Hospitality Hub Platform - Complete Database Schema
-- This extends the existing liquor inventory schema with new platform features

-- =====================================================
-- PLATFORM CORE TABLES (Enhanced from existing)
-- =====================================================

-- Enhanced Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id BIGSERIAL PRIMARY KEY,
    uuid_id UUID UNIQUE DEFAULT gen_random_uuid(),
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

-- Enhanced User Profiles with comprehensive role management
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'viewer')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    job_title TEXT,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES user_profiles(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- =====================================================
-- LIQUOR INVENTORY TABLES (Existing - to be migrated)
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_person TEXT,
    notes TEXT,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    size TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    threshold INTEGER DEFAULT 0,
    par_level INTEGER DEFAULT 0,
    barcode TEXT,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Counts table
CREATE TABLE IF NOT EXISTS room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- Activity Logs table (Legacy - will be replaced by user_activity_logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('count_updated', 'item_added', 'item_edited', 'room_changed', 'report_sent', 'account_created')),
    item_brand TEXT,
    room_name TEXT,
    old_value INTEGER,
    new_value INTEGER,
    change_type TEXT CHECK (change_type IN ('scan', 'manual', 'button')),
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- MEMBER DATABASE TABLES (NEW)
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

-- =====================================================
-- RESERVATION MANAGEMENT TABLES (NEW)
-- =====================================================

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
-- INDEXES FOR PERFORMANCE
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_organization ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_app ON user_permissions(app_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_organization ON user_activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Liquor Inventory Indexes
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
-- INITIAL DATA
-- =====================================================

-- Insert default apps
INSERT INTO apps (id, name, description, category, icon, price_tier) VALUES
('liquor-inventory', 'Liquor Inventory', 'Complete inventory management for bars and restaurants', 'inventory', 'package', 'basic'),
('reservation-management', 'Reservation Management', 'Table reservations and guest management', 'reservations', 'calendar', 'basic'),
('member-database', 'Member Database', 'Member management and search system', 'members', 'users', 'basic'),
('pos-system', 'POS System', 'Point of sale integration (coming soon)', 'pos', 'credit-card', 'pro')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Organization-based policies (example for user_profiles)
CREATE POLICY "Users can view their own organization's profiles" ON user_profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
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

-- Add more RLS policies as needed for each table...
