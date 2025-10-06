-- =====================================================
-- EMAIL CAPTURES TABLE - Lead Magnet & Marketing
-- Integrates with existing InvyEasy database schema
-- =====================================================

-- Main table for email captures from popups, blog, etc.
CREATE TABLE IF NOT EXISTS email_captures (
    -- Primary key (UUID to match your schema)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Contact information
    email TEXT UNIQUE NOT NULL,

    -- Marketing attribution
    source TEXT NOT NULL DEFAULT 'popup', -- 'popup', 'blog', 'footer', 'pricing'
    page_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Engagement tracking
    template_downloaded BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    marketing_consent BOOLEAN DEFAULT true,

    -- Conversion tracking (link to user when they sign up)
    converted_to_user BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    organization_id UUID, -- Will add FK constraint after checking organizations table

    -- Timestamps (match your pattern)
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_download_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,

    -- Additional context
    referrer TEXT,
    user_agent TEXT,
    ip_address INET
);

-- =====================================================
-- INDEXES FOR PERFORMANCE (match your naming pattern)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_email_captures_source ON email_captures(source);
CREATE INDEX IF NOT EXISTS idx_email_captures_captured_at ON email_captures(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_captures_converted ON email_captures(converted_to_user);
CREATE INDEX IF NOT EXISTS idx_email_captures_organization_id ON email_captures(organization_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Match your pattern
-- =====================================================

ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;

-- Policy 1: Platform admins can view all email captures
CREATE POLICY "Platform admins can view all email captures"
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

-- Policy 2: Anyone can insert (for the public popup form)
CREATE POLICY "Anyone can insert email captures"
    ON email_captures
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 3: Anyone can update for download tracking
CREATE POLICY "Anyone can update email captures for tracking"
    ON email_captures
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- FUNCTIONS - Handle duplicates gracefully
-- =====================================================

-- Function to handle duplicate email submissions
CREATE OR REPLACE FUNCTION handle_email_capture_duplicate()
RETURNS TRIGGER AS $$
BEGIN
    -- If email already exists, update instead of failing
    UPDATE email_captures
    SET
        download_count = download_count + 1,
        last_download_at = NOW(),
        -- Keep original source (don't overwrite)
        page_url = COALESCE(NEW.page_url, page_url)
    WHERE email = NEW.email;

    -- If update succeeded (found existing email)
    IF FOUND THEN
        -- Prevent the INSERT
        RETURN NULL;
    END IF;

    -- If no existing email, allow INSERT
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle duplicates
DROP TRIGGER IF EXISTS trg_handle_email_capture_duplicate ON email_captures;
CREATE TRIGGER trg_handle_email_capture_duplicate
    BEFORE INSERT ON email_captures
    FOR EACH ROW
    EXECUTE FUNCTION handle_email_capture_duplicate();

-- =====================================================
-- GRANT PERMISSIONS (match your security model)
-- =====================================================

GRANT SELECT ON email_captures TO authenticated;
GRANT INSERT ON email_captures TO anon, authenticated;
GRANT UPDATE ON email_captures TO anon, authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE email_captures IS 'Stores email addresses from lead magnets, exit-intent popups, and content downloads for marketing campaigns';
COMMENT ON COLUMN email_captures.source IS 'Capture source: popup, blog, footer, pricing, etc.';
COMMENT ON COLUMN email_captures.marketing_consent IS 'User consent for marketing emails (GDPR compliance)';
COMMENT ON COLUMN email_captures.converted_to_user IS 'Whether this lead converted to a paying customer';
