-- Add Missing Foreign Key Constraints
-- This script ensures data integrity across all tables

-- 1. Categories table foreign key constraints
ALTER TABLE categories ADD CONSTRAINT IF NOT EXISTS fk_categories_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- 2. Suppliers table foreign key constraints
ALTER TABLE suppliers ADD CONSTRAINT IF NOT EXISTS fk_suppliers_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- 3. Inventory items table foreign key constraints
ALTER TABLE inventory_items ADD CONSTRAINT IF NOT EXISTS fk_inventory_items_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE inventory_items ADD CONSTRAINT IF NOT EXISTS fk_inventory_items_category 
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE inventory_items ADD CONSTRAINT IF NOT EXISTS fk_inventory_items_supplier 
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- 4. Rooms table foreign key constraints
ALTER TABLE rooms ADD CONSTRAINT IF NOT EXISTS fk_rooms_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- 5. Room counts table foreign key constraints
ALTER TABLE room_counts ADD CONSTRAINT IF NOT EXISTS fk_room_counts_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE room_counts ADD CONSTRAINT IF NOT EXISTS fk_room_counts_inventory_item 
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE;

ALTER TABLE room_counts ADD CONSTRAINT IF NOT EXISTS fk_room_counts_room 
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE;

-- 6. Activity logs table foreign key constraints (already exists but ensuring it's correct)
ALTER TABLE activity_logs ADD CONSTRAINT IF NOT EXISTS fk_activity_logs_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- 7. User profiles table foreign key constraints (already exists but ensuring it's correct)
ALTER TABLE user_profiles ADD CONSTRAINT IF NOT EXISTS fk_user_profiles_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- 8. Add composite unique constraints to prevent duplicates
ALTER TABLE room_counts ADD CONSTRAINT IF NOT EXISTS unique_room_count 
    UNIQUE (inventory_item_id, room_id, organization_id);

-- 9. Add check constraints for data validation
ALTER TABLE inventory_items ADD CONSTRAINT IF NOT EXISTS check_positive_size 
    CHECK (size > 0);

ALTER TABLE room_counts ADD CONSTRAINT IF NOT EXISTS check_non_negative_count 
    CHECK (count >= 0);

-- 10. Add indexes for better performance on foreign keys
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_inventory_item ON room_counts(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_room_counts_room ON room_counts(room_id);

-- 11. Add cascade delete triggers for better data cleanup
-- When an organization is deleted, all related data should be cleaned up
-- This is handled by the CASCADE constraints above

-- 12. Add validation triggers for business logic
CREATE OR REPLACE FUNCTION validate_room_count_organization()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure room and inventory item belong to the same organization
    IF EXISTS (
        SELECT 1 FROM inventory_items i 
        JOIN rooms r ON r.id = NEW.room_id 
        WHERE i.id = NEW.inventory_item_id 
        AND i.organization_id != r.organization_id
    ) THEN
        RAISE EXCEPTION 'Room and inventory item must belong to the same organization';
    END IF;
    
    -- Ensure room count organization matches inventory item organization
    IF EXISTS (
        SELECT 1 FROM inventory_items i 
        WHERE i.id = NEW.inventory_item_id 
        AND i.organization_id != NEW.organization_id
    ) THEN
        RAISE EXCEPTION 'Room count organization must match inventory item organization';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for room_counts validation
DROP TRIGGER IF EXISTS trigger_validate_room_count_organization ON room_counts;
CREATE TRIGGER trigger_validate_room_count_organization
    BEFORE INSERT OR UPDATE ON room_counts
    FOR EACH ROW
    EXECUTE FUNCTION validate_room_count_organization();

-- 13. Add validation for inventory items
CREATE OR REPLACE FUNCTION validate_inventory_item_organization()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure category belongs to the same organization (if category_id is provided)
    IF NEW.category_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM categories c 
        WHERE c.id = NEW.category_id 
        AND c.organization_id != NEW.organization_id
    ) THEN
        RAISE EXCEPTION 'Category must belong to the same organization';
    END IF;
    
    -- Ensure supplier belongs to the same organization (if supplier_id is provided)
    IF NEW.supplier_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM suppliers s 
        WHERE s.id = NEW.supplier_id 
        AND s.organization_id != NEW.organization_id
    ) THEN
        RAISE EXCEPTION 'Supplier must belong to the same organization';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory_items validation
DROP TRIGGER IF EXISTS trigger_validate_inventory_item_organization ON inventory_items;
CREATE TRIGGER trigger_validate_inventory_item_organization
    BEFORE INSERT OR UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_inventory_item_organization();

-- 14. Add comments for documentation
COMMENT ON TABLE categories IS 'Product categories for each organization';
COMMENT ON TABLE suppliers IS 'Vendors and suppliers for each organization';
COMMENT ON TABLE inventory_items IS 'Individual inventory items with category and supplier relationships';
COMMENT ON TABLE rooms IS 'Physical locations/rooms for inventory storage';
COMMENT ON TABLE room_counts IS 'Inventory counts by room with organization isolation';
COMMENT ON TABLE activity_logs IS 'Audit trail for all inventory changes';
COMMENT ON TABLE user_profiles IS 'Extended user information with organization membership';

-- 15. Verify all constraints are in place
-- This query will show all foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name; 