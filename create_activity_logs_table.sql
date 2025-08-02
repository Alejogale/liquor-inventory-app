-- Create activity_logs table to track all inventory changes
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('count_updated', 'item_added', 'item_edited', 'room_changed', 'report_sent')),
    item_brand TEXT,
    room_name TEXT,
    old_value INTEGER,
    new_value INTEGER,
    change_type TEXT CHECK (change_type IN ('scan', 'manual', 'button')),
    organization_id INTEGER REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_email ON activity_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_organization ON activity_logs(organization_id);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can view activity logs for their organization" ON activity_logs
    FOR ALL USING (organization_id = 1);
