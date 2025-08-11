-- SIMPLE ORGANIZATION UUID MIGRATION - STEP BY STEP
-- This script converts organizations.id from bigint to UUID safely
-- APPROACH: Change column types FIRST, then update values

-- Step 1: Create backup
CREATE TABLE IF NOT EXISTS backup_organizations AS SELECT * FROM organizations;

-- Step 2: Drop all foreign key constraints that reference organizations.id
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_organization_id_fkey;
ALTER TABLE app_subscriptions DROP CONSTRAINT IF EXISTS app_subscriptions_organization_id_fkey;
ALTER TABLE user_activity_logs DROP CONSTRAINT IF EXISTS user_activity_logs_organization_id_fkey;
ALTER TABLE role_templates DROP CONSTRAINT IF EXISTS role_templates_organization_id_fkey;
ALTER TABLE user_invitations DROP CONSTRAINT IF EXISTS user_invitations_organization_id_fkey;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_organization_id_fkey;
ALTER TABLE family_members DROP CONSTRAINT IF EXISTS family_members_organization_id_fkey;
ALTER TABLE reservation_rooms DROP CONSTRAINT IF EXISTS reservation_rooms_organization_id_fkey;
ALTER TABLE reservation_tables DROP CONSTRAINT IF EXISTS reservation_tables_organization_id_fkey;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_organization_id_fkey;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_organization_id_fkey;
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_organization_id_fkey;
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_organization_id_fkey;
ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_organization_id_fkey;
ALTER TABLE room_counts DROP CONSTRAINT IF EXISTS room_counts_organization_id_fkey;
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_organization_id_fkey;

-- Step 3: Drop RLS policies that depend on organization_id
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE policyname LIKE '%organization%' OR policyname LIKE '%organization_id%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      policy_record.policyname, 
                      policy_record.schemaname, 
                      policy_record.tablename);
    END LOOP;
END $$;

-- Step 4: Drop the primary key constraint on organizations
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_pkey;

-- Step 5: Add new UUID column to organizations
ALTER TABLE organizations ADD COLUMN id_new UUID DEFAULT gen_random_uuid();

-- Step 6: Drop old id column and rename new one
ALTER TABLE organizations DROP COLUMN id;
ALTER TABLE organizations RENAME COLUMN id_new TO id;
ALTER TABLE organizations ADD PRIMARY KEY (id);

-- Step 7: Change ALL organization_id columns to UUID type FIRST
ALTER TABLE user_profiles ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE app_subscriptions ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE user_activity_logs ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE role_templates ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE user_invitations ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE members ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE family_members ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE reservation_rooms ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE reservation_tables ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE reservations ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE categories ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE suppliers ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE inventory_items ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE rooms ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE room_counts ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;
ALTER TABLE activity_logs ALTER COLUMN organization_id TYPE UUID USING organization_id::text::uuid;

-- Step 8: Create mapping table
CREATE TABLE id_mapping (
    old_id bigint,
    new_uuid uuid
);

-- Step 9: Populate mapping table from backup
INSERT INTO id_mapping (old_id, new_uuid)
SELECT backup_organizations.id, organizations.id 
FROM backup_organizations 
JOIN organizations ON backup_organizations."Name" = organizations."Name";

-- Step 10: Update all dependent tables to use new UUIDs (now that columns are UUID type)
UPDATE user_profiles SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE user_profiles.organization_id::text = id_mapping.old_id::text;

UPDATE app_subscriptions SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE app_subscriptions.organization_id::text = id_mapping.old_id::text;

UPDATE user_activity_logs SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE user_activity_logs.organization_id::text = id_mapping.old_id::text;

UPDATE role_templates SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE role_templates.organization_id::text = id_mapping.old_id::text;

UPDATE user_invitations SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE user_invitations.organization_id::text = id_mapping.old_id::text;

UPDATE members SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE members.organization_id::text = id_mapping.old_id::text;

UPDATE family_members SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE family_members.organization_id::text = id_mapping.old_id::text;

UPDATE reservation_rooms SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE reservation_rooms.organization_id::text = id_mapping.old_id::text;

UPDATE reservation_tables SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE reservation_tables.organization_id::text = id_mapping.old_id::text;

UPDATE reservations SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE reservations.organization_id::text = id_mapping.old_id::text;

UPDATE categories SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE categories.organization_id::text = id_mapping.old_id::text;

UPDATE suppliers SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE suppliers.organization_id::text = id_mapping.old_id::text;

UPDATE inventory_items SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE inventory_items.organization_id::text = id_mapping.old_id::text;

UPDATE rooms SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE rooms.organization_id::text = id_mapping.old_id::text;

UPDATE room_counts SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE room_counts.organization_id::text = id_mapping.old_id::text;

UPDATE activity_logs SET organization_id = id_mapping.new_uuid 
FROM id_mapping WHERE activity_logs.organization_id::text = id_mapping.old_id::text;

-- Step 11: Recreate foreign key constraints
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE app_subscriptions ADD CONSTRAINT app_subscriptions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE user_activity_logs ADD CONSTRAINT user_activity_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE role_templates ADD CONSTRAINT role_templates_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE user_invitations ADD CONSTRAINT user_invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE members ADD CONSTRAINT members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE family_members ADD CONSTRAINT family_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE reservation_rooms ADD CONSTRAINT reservation_rooms_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE reservation_tables ADD CONSTRAINT reservation_tables_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE reservations ADD CONSTRAINT reservations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE categories ADD CONSTRAINT categories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE suppliers ADD CONSTRAINT suppliers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE rooms ADD CONSTRAINT rooms_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE room_counts ADD CONSTRAINT room_counts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- Step 12: Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Step 13: Create basic RLS policies
CREATE POLICY "Users can view their own organization" ON organizations FOR ALL USING (id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can view data for their organization" ON user_profiles FOR ALL USING (organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
));

-- Step 14: Clean up
DROP TABLE id_mapping;
DROP TABLE backup_organizations;

-- Migration complete!
SELECT 'Migration completed successfully! Organizations table now uses UUID primary keys.' as status;
