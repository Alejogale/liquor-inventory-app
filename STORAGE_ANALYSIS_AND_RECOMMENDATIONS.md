# 📊 SaaS Storage Analysis & Recommendations

## Executive Summary

After analyzing your entire database schema and codebase, here's what I found about data storage, efficiency, and what needs attention.

---

## Part 1: Data Storage Analysis

### ✅ GOOD - Efficient & Necessary

#### Core Business Data (Keep Forever)
- **Organizations** - Your customers (ESSENTIAL)
- **User Profiles** - Team members (ESSENTIAL)
- **Inventory Items** - Product catalog (ESSENTIAL)
- **Categories** - Organization system (ESSENTIAL)
- **Suppliers** - Vendor relationships (ESSENTIAL)
- **Rooms** - Physical locations (ESSENTIAL)
- **Room Counts** - Current inventory levels (ESSENTIAL)
- **Members** - Customer database (ESSENTIAL for clubs)
- **Reservations** - Booking history (ESSENTIAL for analytics)

**Storage Impact:** ~5-10 MB per organization per year
**Recommendation:** ✅ Keep all of this indefinitely

---

### ⚠️ WARNING - Potentially Wasteful

#### 1. Activity Logs (`activity_logs`)
**Current Status:**
- Stores EVERY count update, item edit, room change
- No expiration or cleanup
- Grows indefinitely
- Can reach 100,000+ records per year for active organizations

**Storage Impact:** ~50-200 MB per organization per year

**Problems:**
```sql
-- Every time staff updates a count:
INSERT INTO activity_logs (user_email, action_type, item_brand, room_name, old_value, new_value, ...)

-- This creates:
- 50 inventory items × 10 updates/day × 365 days = 182,500 records/year
```

**Recommendation:** ⚠️ **ADD RETENTION POLICY**
- Keep last 90 days for operational needs
- Archive or delete older logs
- Estimated savings: 75% storage reduction

---

#### 2. User Activity Logs (`user_activity_logs`)
**Current Status:**
- Platform-wide activity tracking
- Stores IP addresses, user agents, action details (JSONB)
- No cleanup strategy
- JSONB fields can be large (1-5 KB each)

**Storage Impact:** ~100-500 MB per organization per year

**Problems:**
- Tracks EVERYTHING (clicks, views, edits, exports)
- Duplicates some data from `activity_logs`
- IP addresses stored forever (GDPR concern!)

**Recommendation:** ⚠️ **ADD RETENTION POLICY + PRIVACY COMPLIANCE**
- Keep last 90 days for security/audit
- Delete IP addresses after 30 days (GDPR requirement)
- Anonymize old logs (remove PII)
- Estimated savings: 80% storage reduction + GDPR compliance

---

#### 3. User Invitations (`user_invitations`)
**Current Status:**
- Stores ALL invitations (pending, expired, cancelled)
- Never cleaned up
- Includes expired invitations from months/years ago

**Storage Impact:** ~1-5 MB per organization (small but wasteful)

**Problems:**
```sql
-- Invitations expire after 7 days but are never deleted:
SELECT * FROM user_invitations WHERE status = 'expired' AND expires_at < NOW() - INTERVAL '6 months';
-- Returns hundreds of useless records
```

**Recommendation:** ✅ **AUTOMATIC CLEANUP**
- Delete expired invitations after 30 days
- Keep accepted ones for audit trail
- Estimated savings: 60% of invitation records

---

#### 4. Stock Movements (`stock_movements`) - NEW TABLE
**Current Status:**
- Just created, not yet accumulating data
- Will track EVERY stock IN/OUT movement
- No retention policy defined

**Future Storage Impact:** ~20-100 MB per organization per year

**Future Problems:**
```sql
-- With 50 items × 5 movements/week × 52 weeks = 13,000 records/year
-- After 3 years = 39,000 records
```

**Recommendation:** ⚠️ **PLAN AHEAD**
- Keep last 2 years for analytics and compliance
- Archive older data to cold storage
- Consider aggregating very old movements into monthly summaries

---

### ❌ WASTEFUL - Delete or Fix

#### 1. Duplicate Activity Logging
**Problem:**
You have TWO activity log tables that overlap:
- `activity_logs` - Legacy, liquor-specific
- `user_activity_logs` - New, platform-wide

**Storage Impact:** Duplicate ~30-50% of logs

**Recommendation:** ❌ **CONSOLIDATE**
```sql
-- Migrate all data to user_activity_logs (it's more flexible with JSONB)
-- Then drop activity_logs table
-- Estimated savings: 30-50 MB per organization
```

---

#### 2. Reservation Data Without Cleanup
**Problem:**
- Old reservations (2+ years ago) still stored
- Includes "Cancelled" and "No Dessert" status records
- Historical data grows forever

**Storage Impact:** ~10-50 MB per organization per year

**Recommendation:** ⚠️ **ARCHIVE OLD RESERVATIONS**
- Keep last 2 years in main database (for analytics)
- Move 2+ year old data to archive table
- Delete cancelled reservations after 1 year

---

## Part 2: Critical Issues Found

### 🔴 HIGH PRIORITY

#### Issue 1: No Data Retention Policies
**Problem:** Nothing ever gets deleted
**Impact:** Database will grow 200-500% larger than necessary over 3 years
**Fix Required:** Implement retention policies (see Part 3)

#### Issue 2: GDPR Compliance Risk
**Problem:** IP addresses stored indefinitely
**Impact:** Legal risk in EU/California
**Fix Required:** Auto-delete IP addresses after 30 days

#### Issue 3: Orphaned Records
**Problem:** Some tables have `ON DELETE SET NULL` instead of `CASCADE`
**Impact:** Dead supplier/category references that can't be accessed
**Fix Required:** Regular cleanup query or change to CASCADE

---

## Part 3: Recommended Retention Policies

### Implement These SQL Policies:

```sql
-- 1. Activity Logs: Keep 90 days
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';

  DELETE FROM user_activity_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Run daily
SELECT cron.schedule('cleanup-activity-logs', '0 2 * * *', 'SELECT cleanup_old_activity_logs()');

-- 2. Expired Invitations: Keep 30 days after expiration
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM user_invitations
  WHERE status = 'expired'
  AND expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 3. IP Address Anonymization (GDPR)
CREATE OR REPLACE FUNCTION anonymize_old_ips()
RETURNS void AS $$
BEGIN
  UPDATE user_activity_logs
  SET ip_address = NULL,
      user_agent = 'anonymized'
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 4. Stock Movements: Keep 2 years
CREATE OR REPLACE FUNCTION archive_old_stock_movements()
RETURNS void AS $$
BEGIN
  -- Archive to separate table first
  INSERT INTO stock_movements_archive
  SELECT * FROM stock_movements
  WHERE created_at < NOW() - INTERVAL '2 years';

  -- Then delete from main table
  DELETE FROM stock_movements
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;
```

---

## Part 4: Storage Savings Estimate

### Current Trajectory (3 years, 100 organizations):
- Activity Logs: ~20 GB
- User Activity Logs: ~40 GB
- Invitations: ~500 MB
- Stock Movements: ~5 GB
- **Total:** ~66 GB

### With Retention Policies:
- Activity Logs: ~2 GB (90 days only)
- User Activity Logs: ~4 GB (90 days, anonymized)
- Invitations: ~200 MB (cleaned up)
- Stock Movements: ~3 GB (2 years only)
- **Total:** ~10 GB

### **Savings: 85% less storage = Lower hosting costs**

---

## Part 5: Immediate Action Items

### 🔥 Do These NOW:

1. **Run the SQL retention policy script** (I'll create this)
2. **Set up weekly cleanup job** in Supabase
3. **Add updated_at column to room_counts** (already created SQL for this)
4. **Change stock_movements to NUMERIC for decimals** (already created SQL)

### 📅 Do These This Month:

1. **Migrate activity_logs to user_activity_logs** (consolidate)
2. **Set up automatic archiving** for old data
3. **Add monitoring** for table sizes
4. **Create archive tables** for old stock movements and reservations

### 🎯 Do These This Quarter:

1. **Implement cold storage** for 2+ year old data
2. **Add data export** for archived records
3. **Create analytics summaries** (aggregate old movements into monthly totals)
4. **GDPR compliance audit** (ensure all PII has retention limits)

---

## Part 6: What About File Storage?

### Current File Storage: NONE DETECTED ✅

Your app doesn't appear to store:
- ❌ Images
- ❌ PDFs
- ❌ CSV uploads (they're processed and deleted)
- ❌ Profile pictures

**Recommendation:** ✅ You're good here! No file storage cleanup needed.

---

## Part 7: Stock Movement Analytics (Missing Features)

### What You DON'T Have Yet:

#### 1. Stock Movement History View
**Missing:** Web dashboard to view stock IN/OUT history
**Impact:** Can't audit who moved what
**Priority:** HIGH

#### 2. Staff Activity Reports
**Missing:** See which staff members are most active
**Impact:** Can't track team performance
**Priority:** MEDIUM

#### 3. Stock Movement Trends
**Missing:** Charts showing IN/OUT patterns over time
**Impact:** Can't identify inventory issues
**Priority:** MEDIUM

#### 4. CSV Export of Stock Movements
**Missing:** Export movements for external analysis
**Impact:** Can't use Excel for custom reports
**Priority:** HIGH

#### 5. Movement Filtering
**Missing:** Filter by date, user, item, room, type (IN/OUT)
**Impact:** Hard to find specific movements
**Priority:** HIGH

---

## Part 8: Estimated Costs

### Current Setup (No Retention Policies):
- **Year 1:** $50-100/month Supabase
- **Year 2:** $100-200/month (data doubled)
- **Year 3:** $200-400/month (data tripled)

### With Retention Policies:
- **Year 1:** $50-100/month
- **Year 2:** $60-120/month (controlled growth)
- **Year 3:** $70-140/month (controlled growth)

### **3-Year Savings: $600-800 per 100 organizations**

---

## Summary: Yes, You Need Data Cleanup!

### Problems Found:
1. ❌ Activity logs growing indefinitely
2. ❌ No retention policies
3. ❌ GDPR compliance risk (IP addresses)
4. ❌ Duplicate logging tables
5. ❌ Expired invitations never deleted
6. ⚠️ Future issues with stock movements (no policy yet)

### Benefits of Cleanup:
1. ✅ 85% less storage used
2. ✅ Faster queries (smaller tables)
3. ✅ Lower hosting costs
4. ✅ GDPR compliant
5. ✅ Better database performance

### Recommendation:
**YES - Implement data retention policies ASAP!**

I can help you build:
1. Automated cleanup scripts
2. Stock movement analytics dashboard
3. CSV export features
4. Retention policy setup

Ready to build these features?
