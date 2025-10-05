-- Check organizations
SELECT 'ORGANIZATIONS CHECK:' as info;
SELECT 
    id,
    "Name",
    slug,
    created_by,
    created_at
FROM organizations
ORDER BY created_at DESC;