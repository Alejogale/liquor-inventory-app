-- SQL function to trigger welcome email after email confirmation
-- Run this in your Supabase SQL Editor

-- First, create a function to call your API
CREATE OR REPLACE FUNCTION trigger_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if email_confirmed_at changed from null to a timestamp
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    -- Make HTTP request to your welcome email API
    PERFORM net.http_post(
      url := 'https://invyeasy.com/api/webhooks/supabase',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'type', 'UPDATE',
        'table', 'auth.users',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;
CREATE TRIGGER on_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_welcome_email();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;

-- Note: Make sure the `net` extension is enabled in your Supabase project
-- You can enable it by running: CREATE EXTENSION IF NOT EXISTS "net";