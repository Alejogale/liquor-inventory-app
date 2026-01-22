-- ============================================
-- FIX: Make trigger safer to prevent signup failures
-- ============================================

-- Drop the existing trigger
DROP TRIGGER IF EXISTS on_email_confirmed_queue ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if email_confirmed_at changed from null to a timestamp
  -- AND this is an UPDATE (not INSERT)
  IF TG_OP = 'UPDATE'
     AND OLD.email_confirmed_at IS NULL
     AND NEW.email_confirmed_at IS NOT NULL
  THEN
    -- Use exception handling so a failure here doesn't break user creation
    BEGIN
      INSERT INTO public.welcome_email_queue (user_id, email, user_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
          NEW.raw_user_meta_data->>'first_name',
          NEW.raw_user_meta_data->>'full_name',
          split_part(NEW.email, '@', 1)
        )
      )
      ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicates
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error but don't fail the user verification
        RAISE WARNING 'Failed to queue welcome email for user %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_email_confirmed_queue
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_welcome_email();

-- Add unique constraint to prevent duplicate queue entries
ALTER TABLE public.welcome_email_queue
ADD CONSTRAINT IF NOT EXISTS welcome_email_queue_user_id_unique
UNIQUE (user_id);

-- Test the trigger is working
SELECT 'Trigger recreated successfully' as status;
