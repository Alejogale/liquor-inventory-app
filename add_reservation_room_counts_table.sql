-- Add reservation_room_counts table for inventory counting in reservation rooms
CREATE TABLE IF NOT EXISTS reservation_room_counts (
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    room_id UUID REFERENCES reservation_rooms(id) ON DELETE CASCADE,
    count INTEGER DEFAULT 0,
    organization_id BIGINT REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (inventory_item_id, room_id)
);

-- Enable RLS
ALTER TABLE reservation_room_counts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view reservation room counts for their organization" ON reservation_room_counts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reservation room counts for their organization" ON reservation_room_counts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update reservation room counts for their organization" ON reservation_room_counts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete reservation room counts for their organization" ON reservation_room_counts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_room_id ON reservation_room_counts(room_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_organization_id ON reservation_room_counts(organization_id);
CREATE INDEX IF NOT EXISTS idx_reservation_room_counts_inventory_item_id ON reservation_room_counts(inventory_item_id);
