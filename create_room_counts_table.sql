-- Create room_counts table for storing inventory counts per room
-- This will fix the "Error loading room counts" issue

CREATE TABLE IF NOT EXISTS room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- Enable RLS
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view room counts for their organization" ON room_counts 
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can insert room counts for their organization" ON room_counts 
FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can update room counts for their organization" ON room_counts 
FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Users can delete room counts for their organization" ON room_counts 
FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_room_counts_room_id ON room_counts(room_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_organization_id ON room_counts(organization_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_room_counts_updated_at 
    BEFORE UPDATE ON room_counts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created
SELECT 'room_counts table created successfully!' as status;
SELECT COUNT(*) as table_exists FROM information_schema.tables WHERE table_name = 'room_counts';
