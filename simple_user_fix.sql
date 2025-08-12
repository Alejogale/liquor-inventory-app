-- Simple User Fix for alehoegali@gmail.com
-- Run this to check and fix the user profile issue

-- First, let's see what users exist in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'alehoegali@gmail.com';

-- Check if user profile exists
SELECT id, email, role, organization_id, is_platform_admin 
FROM user_profiles 
WHERE email = 'alehoegali@gmail.com';

-- Check organizations
SELECT id, "Name", subscription_status, subscription_plan 
FROM organizations 
LIMIT 3;

-- If the user exists but no profile, let's create it manually
-- Replace the user_id below with the actual ID from the first query

-- Example fix (you'll need to update the UUID):
-- INSERT INTO user_profiles (id, full_name, email, role, organization_id, is_platform_admin, app_access, status)
-- VALUES (
--     'PUT_USER_ID_HERE',  -- Replace with actual user ID from auth.users
--     'Manager User',
--     'alehoegali@gmail.com',
--     'manager',
--     'PUT_ORG_ID_HERE',   -- Replace with actual org ID from organizations
--     FALSE,
--     ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'],
--     'active'
-- )
-- ON CONFLICT (id) DO UPDATE SET
--     role = 'manager',
--     organization_id = EXCLUDED.organization_id,
--     app_access = EXCLUDED.app_access,
--     status = 'active',
--     updated_at = NOW();
