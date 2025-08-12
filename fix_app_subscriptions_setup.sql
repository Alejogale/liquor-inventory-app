-- Fix app_subscriptions table setup
-- This script handles existing table or creates new one with correct schema

-- First, drop the table if it exists to start fresh
DROP TABLE IF EXISTS app_subscriptions CASCADE;

-- Create the app_subscriptions table with correct schema
CREATE TABLE app_subscriptions (
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

-- Create default active subscriptions for all existing organizations
DO $$
DECLARE
    org_record RECORD;
    app_name TEXT;
    apps TEXT[] := ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'];
BEGIN
    RAISE NOTICE '🚀 Setting up app subscriptions for all organizations...';
    
    -- Loop through all existing organizations
    FOR org_record IN SELECT id, "Name" FROM organizations LOOP
        RAISE NOTICE 'Processing organization: % (ID: %)', org_record."Name", org_record.id;
        
        -- Loop through all apps
        FOREACH app_name IN ARRAY apps LOOP
            -- Insert active subscription for each app
            INSERT INTO app_subscriptions (
                organization_id,
                app_id,
                subscription_status,
                subscription_plan,
                trial_ends_at,
                subscription_ends_at,
                created_at,
                updated_at
            ) VALUES (
                org_record.id,
                app_name,
                'active',
                'bundle',
                NULL, -- No trial end since it's active
                NOW() + INTERVAL '1 year', -- Active for 1 year
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '  ✅ Added % subscription for organization %', app_name, org_record."Name";
        END LOOP;
    END LOOP;
    
    RAISE NOTICE '🎉 All organizations now have active bundle subscriptions to all apps!';
    
    -- Show summary
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '  - Organizations processed: %', (SELECT COUNT(*) FROM organizations);
    RAISE NOTICE '  - Total subscriptions created: %', (SELECT COUNT(*) FROM app_subscriptions);
    RAISE NOTICE '  - Apps covered: %', array_to_string(apps, ', ');
    
END $$;
