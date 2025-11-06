-- =============================================================================
-- DELETE 4 TEST USERS WITH THEIR ORGANIZATIONS - COMPLETE CLEANUP
-- =============================================================================
-- This script deletes users AND their entire organizations with all data
-- Users to delete:
-- 1. vikijakubikova@gmail.com (org: 719a887e-7fc8-4086-b518-9cc4e8f99f21)
-- 2. galeano.alejandro@student.ccm.edu (org: 4477f54c-eeff-45b5-a234-5e9cab6247e0)
-- 3. alehoegali@gmail.com (org: 876bdf87-5983-4b57-9274-811be47b8671)
-- 4. invyeasy@gmail.com (org: b10f47a2-c46e-44fb-8312-04e8484d5b91)
-- =============================================================================

-- =============================================================================
-- STEP 1: VERIFY - See everything that will be deleted
-- =============================================================================

-- View the 4 organizations and all their data
SELECT
    o.id as org_id,
    o.name as org_name,
    o.created_by,
    up.email as owner_email,
    -- Count all data in this organization
    (SELECT COUNT(*) FROM user_profiles WHERE organization_id = o.id) as team_members,
    (SELECT COUNT(*) FROM inventory_items WHERE organization_id = o.id) as inventory_items,
    (SELECT COUNT(*) FROM stock_movements WHERE organization_id = o.id) as stock_movements,
    (SELECT COUNT(*) FROM rooms WHERE organization_id = o.id) as rooms,
    (SELECT COUNT(*) FROM categories WHERE organization_id = o.id) as categories,
    (SELECT COUNT(*) FROM suppliers WHERE organization_id = o.id) as suppliers
FROM organizations o
LEFT JOIN user_profiles up ON o.created_by = up.id
WHERE o.created_by IN (
    SELECT id FROM user_profiles WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    )
)
ORDER BY up.email;

-- =============================================================================
-- STEP 2: DRY RUN - Test deletion without committing
-- =============================================================================

BEGIN;

DO $$
DECLARE
    org_record RECORD;
    deleted_inventory INT := 0;
    deleted_movements INT := 0;
    deleted_rooms INT := 0;
    deleted_categories INT := 0;
    deleted_suppliers INT := 0;
    deleted_profiles INT := 0;
    deleted_orgs INT := 0;
    deleted_auth INT := 0;
    total_deleted INT;
BEGIN
    RAISE NOTICE '=== STARTING DRY RUN - COMPLETE CLEANUP ===';
    RAISE NOTICE '';

    -- Loop through each organization owned by these 4 users
    FOR org_record IN
        SELECT
            o.id as org_id,
            o.name as org_name,
            up.email as owner_email,
            up.id as owner_id
        FROM organizations o
        JOIN user_profiles up ON o.created_by = up.id
        WHERE up.email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    LOOP
        RAISE NOTICE '--- Processing organization: % (Owner: %) ---', org_record.org_name, org_record.owner_email;

        -- Delete inventory items
        DELETE FROM inventory_items WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_inventory := deleted_inventory + total_deleted;
        RAISE NOTICE '  Deleted % inventory items', total_deleted;

        -- Delete stock movements
        DELETE FROM stock_movements WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_movements := deleted_movements + total_deleted;
        RAISE NOTICE '  Deleted % stock movements', total_deleted;

        -- Delete rooms
        DELETE FROM rooms WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_rooms := deleted_rooms + total_deleted;
        RAISE NOTICE '  Deleted % rooms', total_deleted;

        -- Delete categories
        DELETE FROM categories WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_categories := deleted_categories + total_deleted;
        RAISE NOTICE '  Deleted % categories', total_deleted;

        -- Delete suppliers
        DELETE FROM suppliers WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_suppliers := deleted_suppliers + total_deleted;
        RAISE NOTICE '  Deleted % suppliers', total_deleted;

        -- Delete user profiles in this organization
        DELETE FROM user_profiles WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_profiles := deleted_profiles + total_deleted;
        RAISE NOTICE '  Deleted % user profiles', total_deleted;

        -- Delete user invitations
        DELETE FROM user_invitations WHERE organization_id = org_record.org_id;

        -- Delete user activity logs
        DELETE FROM user_activity_logs WHERE organization_id = org_record.org_id;

        -- Delete the organization
        DELETE FROM organizations WHERE id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_orgs := deleted_orgs + total_deleted;
        RAISE NOTICE '  Deleted organization';

        RAISE NOTICE '';
    END LOOP;

    -- Delete from auth.users
    RAISE NOTICE 'Deleting from auth.users...';
    DELETE FROM auth.users
    WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    );
    GET DIAGNOSTICS deleted_auth = ROW_COUNT;
    RAISE NOTICE '  Deleted % auth users', deleted_auth;

    RAISE NOTICE '';
    RAISE NOTICE '=== DRY RUN SUMMARY ===';
    RAISE NOTICE 'Inventory items deleted: %', deleted_inventory;
    RAISE NOTICE 'Stock movements deleted: %', deleted_movements;
    RAISE NOTICE 'Rooms deleted: %', deleted_rooms;
    RAISE NOTICE 'Categories deleted: %', deleted_categories;
    RAISE NOTICE 'Suppliers deleted: %', deleted_suppliers;
    RAISE NOTICE 'User profiles deleted: %', deleted_profiles;
    RAISE NOTICE 'Organizations deleted: %', deleted_orgs;
    RAISE NOTICE 'Auth users deleted: %', deleted_auth;
    RAISE NOTICE '';
    RAISE NOTICE '=== THIS IS A DRY RUN - NOTHING WAS SAVED ===';
    RAISE NOTICE 'If this looks correct, proceed to STEP 3';
END $$;

ROLLBACK;

-- =============================================================================
-- STEP 3: ACTUAL DELETION - Run ONLY after reviewing Step 2
-- =============================================================================
-- ⚠️ WARNING: THIS WILL PERMANENTLY DELETE ALL DATA FOR THESE 4 ORGANIZATIONS
-- Remove the /* and */ to enable this section

/*
BEGIN;

DO $$
DECLARE
    org_record RECORD;
    deleted_inventory INT := 0;
    deleted_movements INT := 0;
    deleted_rooms INT := 0;
    deleted_categories INT := 0;
    deleted_suppliers INT := 0;
    deleted_profiles INT := 0;
    deleted_orgs INT := 0;
    deleted_auth INT := 0;
    total_deleted INT;
BEGIN
    RAISE NOTICE '=== STARTING ACTUAL DELETION ===';
    RAISE NOTICE '';

    FOR org_record IN
        SELECT
            o.id as org_id,
            o.name as org_name,
            up.email as owner_email,
            up.id as owner_id
        FROM organizations o
        JOIN user_profiles up ON o.created_by = up.id
        WHERE up.email IN (
            'vikijakubikova@gmail.com',
            'galeano.alejandro@student.ccm.edu',
            'alehoegali@gmail.com',
            'invyeasy@gmail.com'
        )
    LOOP
        RAISE NOTICE '--- Deleting organization: % (Owner: %) ---', org_record.org_name, org_record.owner_email;

        -- Delete all organization data
        DELETE FROM inventory_items WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_inventory := deleted_inventory + total_deleted;

        DELETE FROM stock_movements WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_movements := deleted_movements + total_deleted;

        DELETE FROM rooms WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_rooms := deleted_rooms + total_deleted;

        DELETE FROM categories WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_categories := deleted_categories + total_deleted;

        DELETE FROM suppliers WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_suppliers := deleted_suppliers + total_deleted;

        DELETE FROM user_profiles WHERE organization_id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_profiles := deleted_profiles + total_deleted;

        DELETE FROM user_invitations WHERE organization_id = org_record.org_id;
        DELETE FROM user_activity_logs WHERE organization_id = org_record.org_id;

        DELETE FROM organizations WHERE id = org_record.org_id;
        GET DIAGNOSTICS total_deleted = ROW_COUNT;
        deleted_orgs := deleted_orgs + total_deleted;

        RAISE NOTICE '  ✓ Organization deleted';
    END LOOP;

    -- Delete from auth.users
    DELETE FROM auth.users
    WHERE email IN (
        'vikijakubikova@gmail.com',
        'galeano.alejandro@student.ccm.edu',
        'alehoegali@gmail.com',
        'invyeasy@gmail.com'
    );
    GET DIAGNOSTICS deleted_auth = ROW_COUNT;

    RAISE NOTICE '';
    RAISE NOTICE '=== DELETION COMPLETE ===';
    RAISE NOTICE 'Inventory items: %', deleted_inventory;
    RAISE NOTICE 'Stock movements: %', deleted_movements;
    RAISE NOTICE 'Rooms: %', deleted_rooms;
    RAISE NOTICE 'Categories: %', deleted_categories;
    RAISE NOTICE 'Suppliers: %', deleted_suppliers;
    RAISE NOTICE 'User profiles: %', deleted_profiles;
    RAISE NOTICE 'Organizations: %', deleted_orgs;
    RAISE NOTICE 'Auth users: %', deleted_auth;
    RAISE NOTICE '';
    RAISE NOTICE '✅ ALL 4 TEST USERS AND THEIR ORGANIZATIONS DELETED!';
END $$;

COMMIT;
*/

-- =============================================================================
-- STEP 4: VERIFY DELETION
-- =============================================================================

/*
-- Should return 0 rows
SELECT email FROM auth.users
WHERE email IN (
    'vikijakubikova@gmail.com',
    'galeano.alejandro@student.ccm.edu',
    'alehoegali@gmail.com',
    'invyeasy@gmail.com'
);

-- Should return 0 rows
SELECT * FROM organizations
WHERE id IN (
    '719a887e-7fc8-4086-b518-9cc4e8f99f21',
    '4477f54c-eeff-45b5-a234-5e9cab6247e0',
    '876bdf87-5983-4b57-9274-811be47b8671',
    'b10f47a2-c46e-44fb-8312-04e8484d5b91'
);
*/
