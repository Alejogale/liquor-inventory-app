-- Add manager_email column to user_profiles table
-- This allows users to save their manager's email for reports

-- Add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'manager_email'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN manager_email TEXT;
    END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN user_profiles.manager_email IS 'Manager email address for report notifications';

-- Update RLS policy to include manager_email
-- (The existing policy should already cover this column)

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'manager_email';
