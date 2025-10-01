-- Simple approach: Insert into a custom table that your app can monitor
-- This doesn't require the net extension

-- Create a table to track welcome email requests
CREATE TABLE IF NOT EXISTS public.welcome_email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Enable RLS on the table
ALTER TABLE public.welcome_email_queue ENABLE ROW LEVEL SECURITY;

-- Create a policy (only service role can manage this table)
CREATE POLICY "Service role can manage welcome emails" ON public.welcome_email_queue
  FOR ALL USING (auth.role() = 'service_role');

-- Create a function to queue welcome emails
CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if email_confirmed_at changed from null to a timestamp
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.welcome_email_queue (user_id, email, user_name)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_email_confirmed_queue ON auth.users;
CREATE TRIGGER on_email_confirmed_queue
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_welcome_email();

-- Grant necessary permissions
GRANT ALL ON public.welcome_email_queue TO postgres, service_role;