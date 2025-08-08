-- FIX ACTIVITY_LOGS 400 ERROR
-- This script fixes the activity_logs table issues causing 400 errors

-- 1. First, check if the table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE activity_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_email TEXT NOT NULL,
            action_type TEXT NOT NULL CHECK (action_type IN ('count_updated', 'item_added', 'item_edited', 'room_changed', 'report_sent')),
            item_brand TEXT,
            room_name TEXT,
            old_value INTEGER,
            new_value INTEGER,
            change_type TEXT CHECK (change_type IN ('scan', 'manual', 'button')),
            organization_id UUID REFERENCES organizations(uuid_id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created activity_logs table';
    ELSE
        RAISE NOTICE 'activity_logs table already exists';
    END IF;
END $$;

-- 2. Check and fix organization_id column type
DO $$
BEGIN
    -- Check if organization_id column exists and is the right type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' 
        AND column_name = 'organization_id'
        AND data_type = 'uuid'
    ) THEN
        RAISE NOTICE 'organization_id column is already UUID type';
    ELSE
        -- If it exists but is wrong type, fix it
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'activity_logs' 
            AND column_name = 'organization_id'
        ) THEN
            -- Convert to UUID
            ALTER TABLE activity_logs ALTER COLUMN organization_id TYPE UUID USING organization_id::UUID;
            RAISE NOTICE 'Fixed organization_id column type to UUID';
        ELSE
            -- Add the column if it doesn't exist
            ALTER TABLE activity_logs ADD COLUMN organization_id UUID REFERENCES organizations(uuid_id);
            RAISE NOTICE 'Added organization_id column';
        END IF;
    END IF;
END $$;

-- 3. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_organization ON activity_logs(organization_id);

-- 4. Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Drop and recreate RLS policy
DROP POLICY IF EXISTS "Users can view activity logs for their organization" ON activity_logs;

CREATE POLICY "Users can view activity logs for their organization" ON activity_logs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 6. Insert a test record to verify everything works
INSERT INTO activity_logs (
    user_email, 
    action_type, 
    item_brand, 
    room_name, 
    organization_id
) VALUES (
    'test@example.com',
    'count_updated',
    'Test Brand',
    'Test Room',
    (SELECT uuid_id FROM organizations LIMIT 1)
) ON CONFLICT DO NOTHING;

-- 7. Final success message
DO $$
BEGIN
    RAISE NOTICE 'Activity logs table fixed and ready to use';
END $$;
