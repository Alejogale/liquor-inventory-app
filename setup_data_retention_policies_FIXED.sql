-- =====================================================
-- DATA RETENTION POLICIES - FIXED VERSION
-- =====================================================
-- This version drops existing functions first to avoid conflicts
-- =====================================================

-- =====================================================
-- PART 1: Drop existing functions (if they exist)
-- =====================================================

DROP FUNCTION IF EXISTS cleanup_old_activity_logs() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_invitations() CASCADE;
DROP FUNCTION IF EXISTS anonymize_old_activity_data() CASCADE;
DROP FUNCTION IF EXISTS archive_old_stock_movements() CASCADE;
DROP FUNCTION IF EXISTS archive_old_reservations() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_cancelled_reservations() CASCADE;
DROP FUNCTION IF EXISTS run_all_cleanup_tasks() CASCADE;

-- =====================================================
-- PART 2: Create Archive Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_movements_archive (
  LIKE stock_movements INCLUDING ALL
);

CREATE TABLE IF NOT EXISTS reservations_archive (
  LIKE reservations INCLUDING ALL
);

-- =====================================================
-- PART 3: Cleanup Functions (recreated)
-- =====================================================

-- Function 1: Clean up old activity logs (keep 90 days)
CREATE FUNCTION cleanup_old_activity_logs()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  deleted BIGINT;
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;

  DELETE FROM user_activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
  GET DIAGNOSTICS deleted = deleted + ROW_COUNT;

  RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Clean up expired invitations
CREATE FUNCTION cleanup_expired_invitations()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  deleted BIGINT;
BEGIN
  DELETE FROM user_invitations
  WHERE status IN ('expired', 'cancelled')
  AND expires_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Anonymize IP addresses (GDPR)
CREATE FUNCTION anonymize_old_activity_data()
RETURNS TABLE(anonymized_count BIGINT) AS $$
DECLARE
  anonymized BIGINT;
BEGIN
  UPDATE user_activity_logs
  SET ip_address = NULL, user_agent = 'anonymized'
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND ip_address IS NOT NULL;
  GET DIAGNOSTICS anonymized = ROW_COUNT;
  RETURN QUERY SELECT anonymized;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Archive old stock movements
CREATE FUNCTION archive_old_stock_movements()
RETURNS TABLE(archived_count BIGINT) AS $$
DECLARE
  archived BIGINT;
BEGIN
  INSERT INTO stock_movements_archive
  SELECT * FROM stock_movements
  WHERE created_at < NOW() - INTERVAL '2 years'
  ON CONFLICT DO NOTHING;

  DELETE FROM stock_movements
  WHERE created_at < NOW() - INTERVAL '2 years';
  GET DIAGNOSTICS archived = ROW_COUNT;
  RETURN QUERY SELECT archived;
END;
$$ LANGUAGE plpgsql;

-- Function 5: Archive old reservations
CREATE FUNCTION archive_old_reservations()
RETURNS TABLE(archived_count BIGINT) AS $$
DECLARE
  archived BIGINT;
BEGIN
  INSERT INTO reservations_archive
  SELECT * FROM reservations
  WHERE reservation_date < CURRENT_DATE - INTERVAL '2 years'
  ON CONFLICT DO NOTHING;

  DELETE FROM reservations
  WHERE reservation_date < CURRENT_DATE - INTERVAL '2 years';
  GET DIAGNOSTICS archived = ROW_COUNT;
  RETURN QUERY SELECT archived;
END;
$$ LANGUAGE plpgsql;

-- Function 6: Clean up cancelled reservations
CREATE FUNCTION cleanup_old_cancelled_reservations()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
  deleted BIGINT;
BEGIN
  DELETE FROM reservations
  WHERE status = 'Canceled'
  AND reservation_date < CURRENT_DATE - INTERVAL '1 year';
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;

-- Function 7: Master cleanup function
CREATE FUNCTION run_all_cleanup_tasks()
RETURNS TABLE(
  task_name TEXT,
  records_affected BIGINT,
  completed_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY SELECT 'Activity Logs Cleanup'::TEXT, deleted_count, NOW() FROM cleanup_old_activity_logs();
  RETURN QUERY SELECT 'Expired Invitations Cleanup'::TEXT, deleted_count, NOW() FROM cleanup_expired_invitations();
  RETURN QUERY SELECT 'GDPR IP Anonymization'::TEXT, anonymized_count, NOW() FROM anonymize_old_activity_data();
  RETURN QUERY SELECT 'Stock Movements Archive'::TEXT, archived_count, NOW() FROM archive_old_stock_movements();
  RETURN QUERY SELECT 'Reservations Archive'::TEXT, archived_count, NOW() FROM archive_old_reservations();
  RETURN QUERY SELECT 'Cancelled Reservations Cleanup'::TEXT, deleted_count, NOW() FROM cleanup_old_cancelled_reservations();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 4: Monitoring Views
-- =====================================================

CREATE OR REPLACE VIEW cleanup_candidates AS
SELECT 'activity_logs' AS table_name, COUNT(*) AS old_records, MIN(created_at) AS oldest_record, MAX(created_at) AS newest_record
FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days'
UNION ALL
SELECT 'user_activity_logs', COUNT(*), MIN(created_at), MAX(created_at)
FROM user_activity_logs WHERE created_at < NOW() - INTERVAL '90 days'
UNION ALL
SELECT 'user_invitations (expired)', COUNT(*), MIN(expires_at), MAX(expires_at)
FROM user_invitations WHERE status IN ('expired', 'cancelled') AND expires_at < NOW() - INTERVAL '30 days'
UNION ALL
SELECT 'stock_movements (old)', COUNT(*), MIN(created_at), MAX(created_at)
FROM stock_movements WHERE created_at < NOW() - INTERVAL '2 years';

-- =====================================================
-- DONE! Now you can run:
-- SELECT * FROM run_all_cleanup_tasks();
-- =====================================================
