-- Email Captures Table for Lead Generation
-- Purpose: Store emails from exit-intent popup, blog signups, etc.
-- Marketing Use: Track lead sources, conversion funnel, export for campaigns

CREATE TABLE IF NOT EXISTS email_captures (
  -- Primary identifier
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Contact information
  email TEXT UNIQUE NOT NULL,

  -- Marketing attribution
  source TEXT NOT NULL DEFAULT 'popup', -- 'popup', 'blog', 'footer', 'pricing'
  page_url TEXT, -- Which page they were on
  utm_source TEXT, -- Marketing campaign tracking
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Engagement tracking
  template_downloaded BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  marketing_consent BOOLEAN DEFAULT true, -- GDPR compliance

  -- Conversion tracking
  converted_to_user BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_download_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Additional context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_source ON email_captures(source);
CREATE INDEX IF NOT EXISTS idx_email_captures_captured_at ON email_captures(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_captures_converted ON email_captures(converted_to_user);

-- Row Level Security (RLS)
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view email captures
CREATE POLICY "Admins can view all email captures"
  ON email_captures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_platform_admin = true
    )
  );

-- Policy: Public can insert (for the popup form)
CREATE POLICY "Anyone can insert email captures"
  ON email_captures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Public can update their own record (for download tracking)
CREATE POLICY "Users can update their own capture record"
  ON email_captures
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Function to prevent duplicate emails (updates existing instead)
CREATE OR REPLACE FUNCTION upsert_email_capture()
RETURNS TRIGGER AS $$
BEGIN
  -- If email exists, update the record instead of failing
  UPDATE email_captures
  SET
    download_count = download_count + 1,
    last_download_at = NOW(),
    source = COALESCE(NEW.source, source), -- Keep original source
    page_url = COALESCE(NEW.page_url, page_url)
  WHERE email = NEW.email;

  -- If update affected 0 rows, allow insert
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Prevent insert if update succeeded
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle duplicates gracefully
DROP TRIGGER IF EXISTS handle_duplicate_email_capture ON email_captures;
CREATE TRIGGER handle_duplicate_email_capture
  BEFORE INSERT ON email_captures
  FOR EACH ROW
  EXECUTE FUNCTION upsert_email_capture();

-- Grant permissions
GRANT SELECT ON email_captures TO authenticated;
GRANT INSERT ON email_captures TO anon, authenticated;
GRANT UPDATE ON email_captures TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE email_captures IS 'Stores email addresses captured from lead magnets, popups, and content downloads';
COMMENT ON COLUMN email_captures.source IS 'Where the email was captured: popup, blog, footer, pricing, etc.';
COMMENT ON COLUMN email_captures.marketing_consent IS 'User agreed to receive marketing emails (GDPR compliance)';
COMMENT ON COLUMN email_captures.converted_to_user IS 'Whether this lead became a paying customer';
