-- Check data counts
SELECT 'DATA COUNTS CHECK:' as info;
SELECT 
    'Categories' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as with_organization,
    COUNT(*) FILTER (WHERE organization_id IS NULL) as without_organization
FROM categories
UNION ALL
SELECT 
    'Suppliers',
    COUNT(*),
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL),
    COUNT(*) FILTER (WHERE organization_id IS NULL)
FROM suppliers
UNION ALL
SELECT 
    'Inventory Items',
    COUNT(*),
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL),
    COUNT(*) FILTER (WHERE organization_id IS NULL)
FROM inventory_items;