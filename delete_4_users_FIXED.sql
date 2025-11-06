-- =============================================================================
-- DELETE 4 SPECIFIC TEST USERS - FIXED VERSION
-- =============================================================================
-- Users to delete:
-- 1. vikijakubikova@gmail.com
-- 2. galeano.alejandro@student.ccm.edu
-- 3. alehoegali@gmail.com
-- 4. invyeasy@gmail.com
-- =============================================================================

-- =============================================================================
-- STEP 1: VERIFY - See what will be deleted (RUN THIS FIRST)
-- =============================================================================

SELECT
    up.id as user_id,
    up.email,
    up.full_name,
    up.role,
    up.organization_id,
    up.created_at,
    (SELECT COUNT(*) FROM stock_movements WHERE user_id = up.id) as stock_movements,
    (SELECT COUNT(*) FROM user_activity_logs WHERE user_id = up.id) as activity_logs,
    (SELECT COUNT(*) FROM user_invitations WHERE invited_by = up.id) as invitations_sent
FROM user_profiles up
WHERE up.email IN (
    'vikijakubikova@gmail.com',
    'galeano.alejandro@student.ccm.edu',
    'alehoegali@gmail.com',
    'invyeasy@gmail.com'
)
ORDER BY up.email;

-- Check if these users exist in auth.users too
SELECT
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email IN (
    'vikijakubikova@gmail.com',
    'galeano.alejandro@student.ccm.edu',
    'alehoegali@gmail.com',
    'invyeasy@gmail.com'
)
ORDER BY email;

-- =============================================================================
-- STEP 2: DRY RUN - Delete with ROLLBACK (TEST WITHOUT COMMITTING)
-- =============================================================================

BEGIN;

DO $$
DECLARE
    deleted_profiles INT := 0;
    deleted_auth INT := 0;
    updated_movements INT := 0;
    deleted_invitations INT := 0;
    deleted_activity INT := 0;
BEGIN
    RAISE NOTICE '=== STARTING DRY RUN - DELETING 4 TEST USERS ===';
    RAISE NOTICE '';

    -- 1. Anonymize stock movements (preserve history)
    RAISE NOTICE 'Step 1: Anonymizing stock movements...';
    UPDATE stock_movements
    SET user_id = NULL
    WHERE user_id IN (
        SELECT id FROM user_profiles WHERE email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    );
    GET DIAGNOSTICS updated_movements = ROW_COUNT;
    RAISE NOTICE '  ✓ Anonymized % stock movements', updated_movements;

    -- 2. Delete user invitations
    RAISE NOTICE 'Step 2: Deleting user invitations...';
    DELETE FROM user_invitations
    WHERE invited_by IN (
        SELECT id FROM user_profiles WHERE email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    );
    GET DIAGNOSTICS deleted_invitations = ROW_COUNT;
    RAISE NOTICE '  ✓ Deleted % invitations', deleted_invitations;

    -- 3. Delete user activity logs
    RAISE NOTICE 'Step 3: Deleting user_activity_logs...';
    DELETE FROM user_activity_logs
    WHERE user_id IN (
        SELECT id FROM user_profiles WHERE email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    );
    GET DIAGNOSTICS deleted_activity = ROW_COUNT;
    RAISE NOTICE '  ✓ Deleted % user activity logs', deleted_activity;

    -- 4. Delete from user_profiles
    RAISE NOTICE 'Step 4: Deleting user profiles...';
    DELETE FROM user_profiles
    WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    );
    GET DIAGNOSTICS deleted_profiles = ROW_COUNT;
    RAISE NOTICE '  ✓ Deleted % user profiles', deleted_profiles;

    -- 5. Delete from auth.users
    RAISE NOTICE 'Step 5: Deleting from auth.users...';
    DELETE FROM auth.users
    WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    );
    GET DIAGNOSTICS deleted_auth = ROW_COUNT;
    RAISE NOTICE '  ✓ Deleted % auth users', deleted_auth;

    RAISE NOTICE '';
    RAISE NOTICE '=== DRY RUN SUMMARY ===';
    RAISE NOTICE 'Stock movements anonymized: %', updated_movements;
    RAISE NOTICE 'Invitations deleted: %', deleted_invitations;
    RAISE NOTICE 'User activity logs deleted: %', deleted_activity;
    RAISE NOTICE 'User profiles deleted: %', deleted_profiles;
    RAISE NOTICE 'Auth users deleted: %', deleted_auth;
    RAISE NOTICE '';
    RAISE NOTICE '=== THIS IS A DRY RUN - NOTHING WAS SAVED ===';
    RAISE NOTICE 'If this looks correct, proceed to STEP 3';
END $$;

ROLLBACK;

-- =============================================================================
-- STEP 3: ACTUAL DELETION - Run this ONLY if Step 2 looked correct
-- =============================================================================
-- ⚠️ WARNING: THIS WILL PERMANENTLY DELETE THE DATA
-- Remove the /* and */ comment markers to enable this section

/*
BEGIN;

DO $$
DECLARE
    deleted_profiles INT := 0;
    deleted_auth INT := 0;
    updated_movements INT := 0;
    deleted_invitations INT := 0;
    deleted_activity INT := 0;
BEGIN
    RAISE NOTICE '=== STARTING ACTUAL DELETION ===';
    RAISE NOTICE '';

    -- 1. Anonymize stock movements
    RAISE NOTICE 'Anonymizing stock movements...';
    UPDATE stock_movements
    SET user_id = NULL
    WHERE user_id IN (
        SELECT id FROM user_profiles WHERE email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    );
    GET DIAGNOSTICS updated_movements = ROW_COUNT;
    RAISE NOTICE '✓ Anonymized % stock movements', updated_movements;

    -- 2. Delete user invitations
    RAISE NOTICE 'Deleting user invitations...';
    DELETE FROM user_invitations
    WHERE invited_by IN (
        SELECT id FROM user_profiles WHERE email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    );
    GET DIAGNOSTICS deleted_invitations = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % invitations', deleted_invitations;

    -- 3. Delete user activity logs
    RAISE NOTICE 'Deleting user_activity_logs...';
    DELETE FROM user_activity_logs
    WHERE user_id IN (
        SELECT id FROM user_profiles WHERE email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    );
    GET DIAGNOSTICS deleted_activity = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % user activity logs', deleted_activity;

    -- 4. Delete from user_profiles
    RAISE NOTICE 'Deleting user profiles...';
    DELETE FROM user_profiles
    WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    );
    GET DIAGNOSTICS deleted_profiles = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % user profiles', deleted_profiles;

    -- 5. Delete from auth.users
    RAISE NOTICE 'Deleting from auth.users...';
    DELETE FROM auth.users
    WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    );
    GET DIAGNOSTICS deleted_auth = ROW_COUNT;
    RAISE NOTICE '✓ Deleted % auth users', deleted_auth;

    RAISE NOTICE '';
    RAISE NOTICE '=== DELETION COMPLETE ===';
    RAISE NOTICE 'Stock movements anonymized: %', updated_movements;
    RAISE NOTICE 'Invitations deleted: %', deleted_invitations;
    RAISE NOTICE 'User activity logs deleted: %', deleted_activity;
    RAISE NOTICE 'User profiles deleted: %', deleted_profiles;
    RAISE NOTICE 'Auth users deleted: %', deleted_auth;
    RAISE NOTICE '';
    RAISE NOTICE '✅ ALL 4 USERS SUCCESSFULLY DELETED!';
END $$;

COMMIT;
*/

-- =============================================================================
-- STEP 4: VERIFY DELETION - Check that users are gone
-- =============================================================================

/*
-- Should return 0 rows
SELECT
    up.email,
    up.full_name
FROM user_profiles up
WHERE up.email IN (
    'vikijakubikova@gmail.com',
    'galeano.alejandro@student.ccm.edu',
    'alehoegali@gmail.com',
    'invyeasy@gmail.com'
);

-- Should return 0 rows
SELECT
    email
FROM auth.users
WHERE email IN (
    'vikijakubikova@gmail.com',
    'galeano.alejandro@student.ccm.edu',
    'alehoegali@gmail.com',
    'invyeasy@gmail.com'
);
*/
