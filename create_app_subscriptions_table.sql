-- Create app_subscriptions table for subscription-level access control
-- This table tracks which organizations have access to which apps

CREATE TABLE IF NOT EXISTS app_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    app_id TEXT NOT NULL CHECK (app_id IN ('liquor-inventory', 'reservation-management', 'member-database', 'pos-system')),
    subscription_status TEXT NOT NULL CHECK (subscription_status IN ('active', 'cancelled', 'trial', 'expired')) DEFAULT 'trial',
    subscription_plan TEXT NOT NULL CHECK (subscription_plan IN ('individual', 'bundle')) DEFAULT 'individual',
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique subscription per org per app
    UNIQUE(organization_id, app_id)
);

-- Enable RLS
ALTER TABLE app_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view subscriptions for their organization" ON app_subscriptions
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create default subscriptions for existing organizations
-- This gives all existing organizations access to all apps with active subscription

DO $$
DECLARE
    org_record RECORD;
    app_name TEXT;
    apps TEXT[] := ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'];
BEGIN
    -- Loop through all existing organizations
    FOR org_record IN SELECT id FROM organizations LOOP
        -- Loop through all apps
        FOREACH app_name IN ARRAY apps LOOP
            -- Insert active subscription for each app
            INSERT INTO app_subscriptions (
                organization_id,
                app_id,
                subscription_status,
                subscription_plan,
                trial_ends_at,
                subscription_ends_at
            ) VALUES (
                org_record.id,
                app_name,
                'active',
                'bundle',
                NULL, -- No trial end since it's active
                NOW() + INTERVAL '1 year' -- Active for 1 year
            ) ON CONFLICT (organization_id, app_id) DO UPDATE SET
                subscription_status = 'active',
                subscription_plan = 'bundle',
                subscription_ends_at = NOW() + INTERVAL '1 year',
                updated_at = NOW();
        END LOOP;
        
        RAISE NOTICE 'Created/updated subscriptions for organization: %', org_record.id;
    END LOOP;
    
    RAISE NOTICE '✅ All organizations now have active subscriptions to all apps';
END $$;
