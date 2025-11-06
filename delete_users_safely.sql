-- =============================================================================
-- DELETE USERS SAFELY - Comprehensive User Cleanup Script
-- =============================================================================
-- This script analyzes foreign key constraints and safely deletes users
-- with all their associated data across the entire database
-- =============================================================================

-- STEP 1: Analyze why users can't be deleted
-- Check all foreign key constraints that reference user_profiles
SELECT
    tc.table_name AS "Table",
    kcu.column_name AS "Column",
    ccu.table_name AS "Referenced Table",
    ccu.column_name AS "Referenced Column",
    rc.delete_rule AS "On Delete Action"
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name IN ('user_profiles', 'users')
ORDER BY tc.table_name;

-- =============================================================================
-- STEP 2: List all users and their data counts
-- =============================================================================
SELECT
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.organization_id,
    up.created_at,
    COUNT(DISTINCT sm.id) as stock_movements_count,
    COUNT(DISTINCT ual.id) as activity_logs_count,
    COUNT(DISTINCT ui.id) as invitations_count
FROM user_profiles up
LEFT JOIN stock_movements sm ON sm.user_id = up.id
LEFT JOIN user_activity_logs ual ON ual.user_id = up.id
LEFT JOIN user_invitations ui ON ui.invited_by = up.id
GROUP BY up.id, up.email, up.full_name, up.role, up.organization_id, up.created_at
ORDER BY up.created_at DESC;

-- =============================================================================
-- STEP 3: Safe User Deletion Script
-- =============================================================================
-- Replace 'user-email@example.com' with the actual email of the user to delete
-- This script deletes a user and ALL their associated data

-- To use this script:
-- 1. Replace 'user-email@example.com' with the actual user email
-- 2. Run the entire transaction
-- 3. If everything looks good, commit. Otherwise, rollback.

BEGIN;

-- Set the email of the user you want to delete
DO $$
DECLARE
    target_user_id UUID;
    target_user_email TEXT := 'user-email@example.com'; -- CHANGE THIS!
BEGIN
    -- Get the user ID
    SELECT id INTO target_user_id
    FROM user_profiles
    WHERE email = target_user_email;

    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', target_user_email;
    END IF;

    RAISE NOTICE 'Deleting user: % (ID: %)', target_user_email, target_user_id;

    -- 1. Delete stock movements (keep anonymized)
    RAISE NOTICE 'Anonymizing stock movements...';
    UPDATE stock_movements
    SET user_id = NULL
    WHERE user_id = target_user_id;

    -- 2. Delete user invitations sent by this user
    RAISE NOTICE 'Deleting user invitations...';
    DELETE FROM user_invitations
    WHERE invited_by = target_user_id;

    -- 3. Delete user activity logs
    RAISE NOTICE 'Deleting user activity logs...';
    DELETE FROM user_activity_logs
    WHERE user_id = target_user_id;

    -- 4. Delete activity logs (if separate table)
    RAISE NOTICE 'Deleting activity logs...';
    DELETE FROM activity_logs
    WHERE user_id = target_user_id;

    -- 5. Delete from user_profiles
    RAISE NOTICE 'Deleting user profile...';
    DELETE FROM user_profiles
    WHERE id = target_user_id;

    -- 6. Delete from auth.users (Supabase Auth)
    RAISE NOTICE 'Deleting from auth.users...';
    DELETE FROM auth.users
    WHERE id = target_user_id;

    RAISE NOTICE 'User % successfully deleted!', target_user_email;
END $$;

-- Review what was deleted
SELECT 'User deletion completed successfully' AS status;

-- COMMIT; -- Uncomment to commit the transaction
-- ROLLBACK; -- Uncomment to rollback if something went wrong

-- =============================================================================
-- STEP 4: Bulk Delete Multiple Users
-- =============================================================================
-- Use this to delete multiple test users at once

/*
BEGIN;

DO $$
DECLARE
    test_user RECORD;
    deleted_count INT := 0;
BEGIN
    -- Delete all users created in the last 7 days (adjust as needed)
    -- OR delete users by role
    -- OR delete specific users by email

    FOR test_user IN
        SELECT id, email
        FROM user_profiles
        WHERE
            -- Option 1: Delete users created recently (test users)
            created_at > NOW() - INTERVAL '7 days'
            -- Option 2: Delete users by role
            -- AND role = 'staff'
            -- Option 3: Exclude specific users
            AND email NOT LIKE '%@yourdomain.com'
        ORDER BY created_at DESC
    LOOP
        RAISE NOTICE 'Deleting user: % (ID: %)', test_user.email, test_user.id;

        -- Anonymize stock movements
        UPDATE stock_movements SET user_id = NULL WHERE user_id = test_user.id;

        -- Delete invitations
        DELETE FROM user_invitations WHERE invited_by = test_user.id;

        -- Delete activity logs
        DELETE FROM user_activity_logs WHERE user_id = test_user.id;
        DELETE FROM activity_logs WHERE user_id = test_user.id;

        -- Delete user profile
        DELETE FROM user_profiles WHERE id = test_user.id;

        -- Delete from auth
        DELETE FROM auth.users WHERE id = test_user.id;

        deleted_count := deleted_count + 1;
    END LOOP;

    RAISE NOTICE 'Total users deleted: %', deleted_count;
END $$;

-- COMMIT; -- Uncomment to commit
-- ROLLBACK; -- Uncomment to rollback
*/

-- =============================================================================
-- STEP 5: Verify Deletion
-- =============================================================================
-- Run this after deletion to verify all data was removed

-- Count remaining records for a specific user
-- Replace 'user-id-here' with actual UUID
/*
SELECT
    'user_profiles' as table_name,
    COUNT(*) as count
FROM user_profiles
WHERE id = 'user-id-here'
UNION ALL
SELECT 'stock_movements', COUNT(*) FROM stock_movements WHERE user_id = 'user-id-here'
UNION ALL
SELECT 'user_activity_logs', COUNT(*) FROM user_activity_logs WHERE user_id = 'user-id-here'
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs WHERE user_id = 'user-id-here'
UNION ALL
SELECT 'user_invitations', COUNT(*) FROM user_invitations WHERE invited_by = 'user-id-here'
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users WHERE id = 'user-id-here';
*/

-- =============================================================================
-- STEP 6: Quick Delete by Email (Most Common)
-- =============================================================================
-- This is the simplest version for quick deletion

/*
-- Just change the email and run this entire block
BEGIN;

WITH target_user AS (
    SELECT id, email FROM user_profiles WHERE email = 'test@example.com'
)
DELETE FROM user_invitations WHERE invited_by IN (SELECT id FROM target_user);

WITH target_user AS (
    SELECT id FROM user_profiles WHERE email = 'test@example.com'
)
UPDATE stock_movements SET user_id = NULL WHERE user_id IN (SELECT id FROM target_user);

WITH target_user AS (
    SELECT id FROM user_profiles WHERE email = 'test@example.com'
)
DELETE FROM user_activity_logs WHERE user_id IN (SELECT id FROM target_user);

WITH target_user AS (
    SELECT id FROM user_profiles WHERE email = 'test@example.com'
)
DELETE FROM activity_logs WHERE user_id IN (SELECT id FROM target_user);

DELETE FROM user_profiles WHERE email = 'test@example.com';
DELETE FROM auth.users WHERE email = 'test@example.com';

SELECT 'User deleted successfully' as status;
COMMIT;
*/

-- =============================================================================
-- NOTES:
-- =============================================================================
-- 1. ALWAYS test with ROLLBACK first before COMMIT
-- 2. Stock movements are anonymized (user_id set to NULL) to preserve history
-- 3. Make sure to run as a user with proper permissions
-- 4. Consider backing up data before bulk deletions
-- 5. Ghost users usually happen when:
--    - Foreign key constraints prevent deletion
--    - Deletion only happened in one table (user_profiles OR auth.users)
--    - Data wasn't cascaded properly
-- =============================================================================
