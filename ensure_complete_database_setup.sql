-- Comprehensive Database Setup Script
-- Run this in your Supabase SQL Editor to ensure all tables and constraints exist
-- This script is idempotent and can be run multiple times safely

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create organizations table (if not exists)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
    subscription_plan TEXT DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
    subscription_period_start TIMESTAMP WITH TIME ZONE,
    subscription_period_end TIMESTAMP WITH TIME ZONE,
    owner_id UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    address TEXT,
    phone TEXT,
    industry TEXT,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'viewer')),
    job_title TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    is_platform_admin BOOLEAN DEFAULT FALSE,
    app_access TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    invited_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_invitations table (if not exists)
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    app_access TEXT[] DEFAULT '{}',
    invited_by UUID REFERENCES user_profiles(id),
    invitation_token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE NULL,
    custom_message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create user_custom_permissions table (if not exists)
CREATE TABLE IF NOT EXISTS user_custom_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    app_id VARCHAR(100) NOT NULL,
    permission_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    granted_by UUID REFERENCES user_profiles(id),
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create activity_logs table (if not exists)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create categories table (if not exists)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create suppliers table (if not exists)
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

-- 8. Create inventory_items table (if not exists)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    size TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    threshold INTEGER DEFAULT 0,
    par_level INTEGER DEFAULT 0,
    barcode TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create rooms table (if not exists)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create reservations table (if not exists)
CREATE TABLE IF NOT EXISTS reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    member_id UUID,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    table_id UUID,
    reservation_date DATE NOT NULL,
    reservation_time TIME WITHOUT TIME ZONE NOT NULL,
    member_name TEXT NOT NULL,
    member_number TEXT,
    party_size INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    staff_member TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'completed', 'cancelled', 'no_show')),
    service_type TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create reservation_rooms table (if not exists)
CREATE TABLE IF NOT EXISTS reservation_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create reservation_tables table (if not exists)
CREATE TABLE IF NOT EXISTS reservation_tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES reservation_rooms(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    capacity INTEGER DEFAULT 4,
    position_x FLOAT DEFAULT 0,
    position_y FLOAT DEFAULT 0,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
-- Organizations policies
DROP POLICY IF EXISTS "Organizations access by member" ON organizations;
CREATE POLICY "Organizations access by member" ON organizations
    FOR ALL USING (
        id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- User profiles policies
DROP POLICY IF EXISTS "User profiles access" ON user_profiles;
CREATE POLICY "User profiles access" ON user_profiles
    FOR ALL USING (
        id = auth.uid()
        OR 
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_platform_admin = TRUE
        )
    );

-- Generic organization-based policies for other tables
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY[
        'user_invitations', 'user_custom_permissions', 'activity_logs', 
        'categories', 'suppliers', 'inventory_items', 'rooms', 
        'reservations', 'reservation_rooms', 'reservation_tables'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "%s_organization_access" ON %s', table_name, table_name);
        EXECUTE format('
            CREATE POLICY "%s_organization_access" ON %s
                FOR ALL USING (
                    organization_id IN (
                        SELECT organization_id FROM user_profiles 
                        WHERE id = auth.uid()
                    )
                    OR 
                    EXISTS (
                        SELECT 1 FROM user_profiles 
                        WHERE id = auth.uid() AND is_platform_admin = TRUE
                    )
                )', table_name, table_name);
    END LOOP;
END $$;

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS expire_old_invitations() CASCADE;
DROP FUNCTION IF EXISTS accept_invitation(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create functions for invitation handling
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_invitations 
    SET status = 'expired' 
    WHERE expires_at < NOW() AND status = 'pending';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION accept_invitation(invitation_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record user_invitations%ROWTYPE;
BEGIN
    -- Get the invitation
    SELECT * INTO invitation_record 
    FROM user_invitations 
    WHERE id = invitation_id AND status = 'pending' AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update user profile
    UPDATE user_profiles 
    SET 
        organization_id = invitation_record.organization_id,
        role = invitation_record.role,
        app_access = invitation_record.app_access,
        status = 'active',
        invited_by = invitation_record.invited_by
    WHERE id = user_id;
    
    -- Mark invitation as accepted
    UPDATE user_invitations 
    SET 
        status = 'accepted',
        accepted_at = NOW()
    WHERE id = invitation_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DO $$
DECLARE
    table_name TEXT;
    table_names TEXT[] := ARRAY[
        'organizations', 'user_profiles', 'user_invitations', 
        'user_custom_permissions', 'inventory_items', 'reservations'
    ];
BEGIN
    FOREACH table_name IN ARRAY table_names
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON %s
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- Note: Platform admin will be created automatically when the admin user logs in
-- The auth-context.tsx handles platform admin detection based on email

NOTIFY pgsql, 'Database setup completed successfully!';
