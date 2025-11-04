-- Check if role column exists and see current data
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name IN ('role', 'pin_code', 'status');

-- Check current users and their roles
SELECT
    id,
    email,
    full_name,
    role,
    pin_code,
    status,
    organization_id,
    created_at
FROM user_profiles
ORDER BY created_at;

-- If role column doesn't exist, this will add it (run this if needed)
-- ALTER TABLE user_profiles
-- ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'staff'
-- CHECK (role IN ('owner', 'manager', 'staff', 'viewer'));

-- Update the first user (you) to be owner if not already
-- UPDATE user_profiles
-- SET role = 'owner'
-- WHERE id = (SELECT id FROM user_profiles ORDER BY created_at LIMIT 1);
