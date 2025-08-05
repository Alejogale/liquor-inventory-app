-- Check Actual Database Schema - Run this in your Supabase SQL Editor

-- Check what columns actually exist in inventory_items table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- Check what data exists in inventory_items (without the size column)
SELECT 
    id,
    brand,
    category_id,
    supplier_id,
    threshold,
    par_level,
    barcode,
    organization_id,
    created_at
FROM inventory_items
ORDER BY created_at DESC; 