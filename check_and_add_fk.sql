-- Step 1: Check organizations table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND column_name IN ('id', 'uuid_id')
ORDER BY ordinal_position;

-- Step 2: Check user_profiles to see what it references
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name = 'organization_id';

-- Step 3: Add foreign key constraint based on what exists
-- Run ONE of these based on the results above:

-- Option A: If organizations.id is UUID
-- ALTER TABLE email_captures
--   ADD CONSTRAINT fk_email_captures_organization
--   FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Option B: If organizations has uuid_id column
-- ALTER TABLE email_captures
--   ADD CONSTRAINT fk_email_captures_organization
--   FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id) ON DELETE SET NULL;
