-- =====================================================
-- SIMPLE CHECK - RUN EACH SECTION SEPARATELY
-- =====================================================

-- Run this first:
SELECT 'USER PROFILES CHECK:' as info;
SELECT 
    id,
    full_name,
    email,
    organization_id,
    role
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;