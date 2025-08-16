-- Daily Reset System for Guest Manager
-- This system preserves member data but resets daily totals at 4 AM

-- 1. Create a table to track daily statistics
CREATE TABLE IF NOT EXISTS daily_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    club_id UUID REFERENCES country_clubs(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    total_guests INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, club_id, date)
);

-- 2. Create a table to preserve member information
CREATE TABLE IF NOT EXISTS member_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    member_number VARCHAR(100) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    home_club_id UUID REFERENCES country_clubs(id) ON DELETE SET NULL,
    first_visit_date DATE NOT NULL,
    last_visit_date DATE NOT NULL,
    total_visits INTEGER DEFAULT 1,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, member_number)
);

-- 3. Enable RLS on new tables
ALTER TABLE daily_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for daily_statistics
CREATE POLICY "Users can view daily statistics in their organization" ON daily_statistics
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert daily statistics in their organization" ON daily_statistics
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update daily statistics in their organization" ON daily_statistics
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 5. Create RLS policies for member_profiles
CREATE POLICY "Users can view member profiles in their organization" ON member_profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert member profiles in their organization" ON member_profiles
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update member profiles in their organization" ON member_profiles
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_statistics_org_date ON daily_statistics(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_club_date ON daily_statistics(club_id, date);
CREATE INDEX IF NOT EXISTS idx_member_profiles_org_member ON member_profiles(organization_id, member_number);
CREATE INDEX IF NOT EXISTS idx_member_profiles_club ON member_profiles(home_club_id);

-- 7. Function to update member profiles when guest visits are added
CREATE OR REPLACE FUNCTION update_member_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update member profile
    INSERT INTO member_profiles (
        organization_id,
        member_number,
        guest_name,
        home_club_id,
        first_visit_date,
        last_visit_date,
        total_visits,
        total_spent
    ) VALUES (
        NEW.organization_id,
        NEW.member_number,
        NEW.guest_name,
        NEW.home_club_id,
        NEW.visit_date,
        NEW.visit_date,
        1,
        NEW.total_amount
    )
    ON CONFLICT (organization_id, member_number)
    DO UPDATE SET
        guest_name = EXCLUDED.guest_name,
        home_club_id = COALESCE(EXCLUDED.home_club_id, member_profiles.home_club_id),
        first_visit_date = LEAST(member_profiles.first_visit_date, EXCLUDED.first_visit_date),
        last_visit_date = GREATEST(member_profiles.last_visit_date, EXCLUDED.last_visit_date),
        total_visits = member_profiles.total_visits + 1,
        total_spent = member_profiles.total_spent + EXCLUDED.total_spent,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger to automatically update member profiles
DROP TRIGGER IF EXISTS trigger_update_member_profile ON guest_visits;
CREATE TRIGGER trigger_update_member_profile
    AFTER INSERT ON guest_visits
    FOR EACH ROW EXECUTE FUNCTION update_member_profile();

-- 9. Function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily statistics for the organization
    INSERT INTO daily_statistics (
        organization_id,
        club_id,
        date,
        total_guests,
        total_revenue
    ) VALUES (
        NEW.organization_id,
        NEW.home_club_id,
        NEW.visit_date,
        1,
        NEW.total_amount
    )
    ON CONFLICT (organization_id, club_id, date)
    DO UPDATE SET
        total_guests = daily_statistics.total_guests + 1,
        total_revenue = daily_statistics.total_revenue + EXCLUDED.total_revenue,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger to automatically update daily statistics
DROP TRIGGER IF EXISTS trigger_update_daily_statistics ON guest_visits;
CREATE TRIGGER trigger_update_daily_statistics
    AFTER INSERT ON guest_visits
    FOR EACH ROW EXECUTE FUNCTION update_daily_statistics();

-- 11. Function to get current day statistics (for dashboard display)
CREATE OR REPLACE FUNCTION get_current_day_stats(org_id UUID)
RETURNS TABLE (
    total_guests_today INTEGER,
    total_revenue_today DECIMAL(10,2),
    active_clubs_today INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ds.total_guests), 0)::INTEGER as total_guests_today,
        COALESCE(SUM(ds.total_revenue), 0.00) as total_revenue_today,
        COUNT(DISTINCT ds.club_id)::INTEGER as active_clubs_today
    FROM daily_statistics ds
    WHERE ds.organization_id = org_id 
    AND ds.date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 12. Function to get monthly report data
CREATE OR REPLACE FUNCTION get_monthly_report(org_id UUID, report_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    club_name VARCHAR(255),
    club_location VARCHAR(255),
    total_guests INTEGER,
    total_revenue DECIMAL(10,2),
    daily_breakdown JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cc.name as club_name,
        cc.location as club_location,
        COALESCE(SUM(ds.total_guests), 0)::INTEGER as total_guests,
        COALESCE(SUM(ds.total_revenue), 0.00) as total_revenue,
        jsonb_object_agg(
            ds.date::TEXT, 
            jsonb_build_object(
                'guests', ds.total_guests,
                'revenue', ds.total_revenue
            )
        ) as daily_breakdown
    FROM country_clubs cc
    LEFT JOIN daily_statistics ds ON cc.id = ds.club_id 
        AND ds.organization_id = org_id 
        AND ds.date >= DATE_TRUNC('month', report_month)
        AND ds.date < DATE_TRUNC('month', report_month) + INTERVAL '1 month'
    WHERE cc.organization_id = org_id AND cc.status = 'active'
    GROUP BY cc.id, cc.name, cc.location
    ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql;

-- 13. Verify the schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('daily_statistics', 'member_profiles')
ORDER BY table_name, ordinal_position;

-- 14. Show empty tables (should be 0 records initially)
SELECT 'daily_statistics' as table_name, COUNT(*) as record_count FROM daily_statistics
UNION ALL
SELECT 'member_profiles' as table_name, COUNT(*) as record_count FROM member_profiles;
