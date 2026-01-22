DROP TRIGGER IF EXISTS on_email_confirmed_queue ON auth.users;

CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    BEGIN
      INSERT INTO public.welcome_email_queue (user_id, email, user_name)
      VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Failed to queue welcome email for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_email_confirmed_queue
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION queue_welcome_email();

ALTER TABLE public.welcome_email_queue ADD CONSTRAINT IF NOT EXISTS welcome_email_queue_user_id_unique UNIQUE (user_id);

SELECT 'Login fix applied successfully' as status;
