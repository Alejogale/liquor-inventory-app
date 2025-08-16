-- Fix Subscription Management, Team Management, and Billing Systems
-- This script creates all missing tables and columns needed for the Team & Billing functionality
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: ENHANCE USER_PROFILES TABLE
-- =====================================================

-- Add missing columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS invitation_token TEXT,
ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;

-- Handle app_access column type conversion
DO $$ 
BEGIN
    -- Check if app_access column exists and its current type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'app_access'
    ) THEN
        -- If it exists as TEXT[], convert it to JSONB
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_profiles' 
            AND column_name = 'app_access' 
            AND data_type = 'ARRAY'
        ) THEN
            -- Drop the default constraint first
            ALTER TABLE user_profiles ALTER COLUMN app_access DROP DEFAULT;
            -- Convert TEXT[] to JSONB by first converting to JSON array
            ALTER TABLE user_profiles ALTER COLUMN app_access TYPE JSONB USING to_json(app_access);
            -- Add the new default value
            ALTER TABLE user_profiles ALTER COLUMN app_access SET DEFAULT '["liquor-inventory"]'::jsonb;
        END IF;
    ELSE
        -- If it doesn't exist, create it as JSONB
        ALTER TABLE user_profiles ADD COLUMN app_access JSONB DEFAULT '["liquor-inventory"]'::jsonb;
    END IF;
END $$;

-- =====================================================
-- STEP 2: ENHANCE ORGANIZATIONS TABLE
-- =====================================================

-- Add missing subscription columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS billing_email TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS app_subscriptions JSONB DEFAULT '["liquor-inventory"]'::jsonb;

-- =====================================================
-- STEP 3: CREATE APP_SUBSCRIPTIONS TABLE
-- =====================================================

-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS app_subscriptions CASCADE;

CREATE TABLE app_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    app_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, app_name)
);

-- =====================================================
-- STEP 4: CREATE TEAM_INVITATIONS TABLE
-- =====================================================

-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS team_invitations CASCADE;

CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES user_profiles(id),
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
    app_access JSONB DEFAULT '["liquor-inventory"]'::jsonb,
    token TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 5: CREATE BILLING_HISTORY TABLE
-- =====================================================

-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS billing_history CASCADE;

CREATE TABLE billing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT,
    stripe_subscription_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL,
    billing_period_start TIMESTAMP WITH TIME ZONE,
    billing_period_end TIMESTAMP WITH TIME ZONE,
    invoice_url TEXT,
    invoice_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 6: CREATE USAGE_LOGS TABLE
-- =====================================================

-- Drop the table if it exists to ensure clean creation
DROP TABLE IF EXISTS usage_logs CASCADE;

CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id),
    app_name TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 7: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE app_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 8: CREATE RLS POLICIES
-- =====================================================

-- App Subscriptions Policies
CREATE POLICY "Users can view app subscriptions in their organization" ON app_subscriptions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Only owners can manage app subscriptions" ON app_subscriptions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role = 'owner'
        )
    );

-- Team Invitations Policies
CREATE POLICY "Users can view invitations in their organization" ON team_invitations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Only managers and owners can create invitations" ON team_invitations
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

CREATE POLICY "Only managers and owners can update invitations" ON team_invitations
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('owner', 'manager')
        )
    );

-- Billing History Policies
CREATE POLICY "Users can view billing history in their organization" ON billing_history
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Usage Logs Policies
CREATE POLICY "Users can view usage logs in their organization" ON usage_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert usage logs in their organization" ON usage_logs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 9: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_app_subscriptions_org_id ON app_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_org_id ON team_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_billing_history_org_id ON billing_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_stripe_invoice ON billing_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_org_id ON usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_app_name ON usage_logs(app_name);

-- =====================================================
-- STEP 10: INSERT DEFAULT DATA FOR EXISTING ORGANIZATIONS
-- =====================================================

-- Verify table structure before inserting data
SELECT '=== VERIFYING TABLE STRUCTURE ===' as info;

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'app_subscriptions' 
ORDER BY ordinal_position;

-- Insert default app subscriptions for existing organizations
INSERT INTO app_subscriptions (organization_id, app_name, status)
SELECT 
    o.id,
    'liquor-inventory',
    CASE 
        WHEN o.subscription_status = 'active' THEN 'active'
        ELSE 'inactive'
    END
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM app_subscriptions app_sub
    WHERE app_sub.organization_id = o.id AND app_sub.app_name = 'liquor-inventory'
);

-- Insert app subscriptions for other apps
INSERT INTO app_subscriptions (organization_id, app_name, status)
SELECT 
    o.id,
    'reservation-system',
    CASE 
        WHEN o.subscription_status = 'active' THEN 'active'
        ELSE 'inactive'
    END
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM app_subscriptions app_sub
    WHERE app_sub.organization_id = o.id AND app_sub.app_name = 'reservation-system'
);

INSERT INTO app_subscriptions (organization_id, app_name, status)
SELECT 
    o.id,
    'consumption-sheet',
    CASE 
        WHEN o.subscription_status = 'active' THEN 'active'
        ELSE 'inactive'
    END
FROM organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM app_subscriptions app_sub
    WHERE app_sub.organization_id = o.id AND app_sub.app_name = 'consumption-sheet'
);

-- =====================================================
-- STEP 11: UPDATE EXISTING USER PROFILES
-- =====================================================

-- Update existing user profiles with default values
UPDATE user_profiles 
SET 
    status = COALESCE(status, 'active'),
    permissions = COALESCE(permissions, '{}'::jsonb)
WHERE status IS NULL OR permissions IS NULL;

-- Update app_access separately to handle type conversion
UPDATE user_profiles 
SET app_access = '["liquor-inventory"]'::jsonb
WHERE app_access IS NULL;

-- =====================================================
-- STEP 12: VERIFICATION QUERIES
-- =====================================================

-- Verify the setup
SELECT '=== VERIFICATION ===' as info;

SELECT 'User Profiles with missing data:' as check_type;
SELECT id, email, status, app_access, permissions 
FROM user_profiles 
WHERE status IS NULL OR app_access IS NULL OR permissions IS NULL;

SELECT 'Organizations with app subscriptions:' as check_type;
SELECT o."Name", COUNT(app_sub.app_name) as app_count
FROM organizations o
LEFT JOIN app_subscriptions app_sub ON o.id = app_sub.organization_id
GROUP BY o.id, o."Name";

SELECT 'Tables created successfully:' as check_type;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('app_subscriptions', 'team_invitations', 'billing_history', 'usage_logs')
ORDER BY table_name;
