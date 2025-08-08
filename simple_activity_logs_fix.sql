-- SIMPLE ACTIVITY_LOGS FIX
-- This script creates or fixes the activity_logs table

-- 1. Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS activity_logs CASCADE;

-- 2. Create the activity_logs table
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

-- 3. Create indexes
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX idx_activity_logs_organization ON activity_logs(organization_id);

-- 4. Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy
CREATE POLICY "Users can view activity logs for their organization" ON activity_logs
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- 6. Insert a test record
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
);

-- Success message
SELECT 'Activity logs table created successfully!' as status;
