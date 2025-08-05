-- Check Inventory Data - Run this in your Supabase SQL Editor
-- This will show us what items exist and their data types

-- Check all inventory items
SELECT 
    id,
    brand,
    size,
    category_id,
    supplier_id,
    threshold,
    par_level,
    barcode,
    organization_id,
    created_at
FROM inventory_items
ORDER BY created_at DESC;

-- Check the specific item with ID 9
SELECT 
    id,
    brand,
    size,
    category_id,
    supplier_id,
    threshold,
    par_level,
    barcode,
    organization_id
FROM inventory_items
WHERE id = '9';

-- Check data types of the inventory_items table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position; 