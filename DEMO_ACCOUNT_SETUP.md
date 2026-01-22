# Demo Account Setup Guide for Apple App Review

This guide will help you set up the demo account that Apple reviewers will use to test your app.

## Demo Account Credentials

```
Email: reviewer@invyeasy.com
Password: AppleReview2024!
Organization: Demo Hospitality Group
Role: Owner (full access)
```

---

## Step-by-Step Setup

### Step 1: Create User in Supabase Auth

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **InvyEasy** project
3. Click **Authentication** in the left sidebar
4. Click **Users** tab
5. Click **Add user** → **Create new user**
6. Fill in:
   - **Email**: `reviewer@invyeasy.com`
   - **Password**: `AppleReview2024!`
   - ✅ **Auto Confirm User** (check this box so email confirmation isn't needed)
7. Click **Create user**

### Step 2: Get the User ID

1. In the Users list, find `reviewer@invyeasy.com`
2. Click on the user row to expand details
3. Copy the **UUID** (it looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)
4. Save this UUID - you'll need it in the next step

**Or use SQL Editor:**
```sql
SELECT id FROM auth.users WHERE email = 'reviewer@invyeasy.com';
```

### Step 3: Update the SQL Script

1. Open the file: `setup_demo_account.sql`
2. Find all instances of `USER_ID_HERE` (there are 3 places)
3. Replace each `USER_ID_HERE` with the actual UUID from Step 2

**Find and replace these 3 locations:**

```sql
-- Location 1: Organization member (around line 53)
INSERT INTO organization_members (
  organization_id,
  user_id,
  role,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'PASTE_USER_ID_HERE', -- Replace this
  'owner',
  NOW()
)

-- Location 2-3: Inventory counts (around line 198-200)
INSERT INTO inventory_counts (
  id,
  organization_id,
  storage_area_id,
  counted_by, -- Replace in this column
  notes,
  created_at
) VALUES
  ('...', '...', '...', 'PASTE_USER_ID_HERE', 'Weekly main bar count', ...),
  ('...', '...', '...', 'PASTE_USER_ID_HERE', 'Wine cellar monthly audit', ...),
  ('...', '...', '...', 'PASTE_USER_ID_HERE', 'Kitchen backup stock check', ...)
```

### Step 4: Run the SQL Script

1. In Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click **+ New query**
3. Copy the entire contents of `setup_demo_account.sql` (with your updated UUIDs)
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: ✅ `"Demo account setup complete! ✅"`

### Step 5: Verify the Setup

#### Option A: Test on Web App
1. Go to your web app: `http://localhost:3001` (or production URL)
2. Log in with:
   - Email: `reviewer@invyeasy.com`
   - Password: `AppleReview2024!`
3. You should see:
   - Organization: **Demo Hospitality Group**
   - Plan: **Professional** (active)
   - 3 Storage Areas: Main Bar, Wine Cellar, Kitchen Storage
   - 24 items across all areas

#### Option B: Test on Mobile App
1. Open the mobile app in simulator/device
2. Log in with same credentials
3. Verify:
   - Dashboard shows organization name
   - Can navigate to Count tab
   - Can see all 3 storage areas
   - Can view items in each area
   - Can perform test counts

---

## What Gets Created

The SQL script creates:

### 1. Organization
- **Name**: Demo Hospitality Group
- **Plan**: Professional (gives access to advanced features)
- **Status**: Active
- **Subscription**: Valid for 30 days from setup

### 2. Storage Areas (3)
| Name | Description | Items |
|------|-------------|-------|
| Main Bar | Primary bar area on first floor | 18 items |
| Wine Cellar | Temperature-controlled wine storage | 6 items |
| Kitchen Storage | Dry storage area in kitchen | 3 items (beer backup) |

### 3. Items (24 total)

**Spirits (11 items)**
- Grey Goose Vodka, Tito's Vodka
- Jack Daniel's, Jameson, Johnnie Walker (Whiskeys)
- Bacardi, Captain Morgan (Rum)
- Tanqueray, Bombay Sapphire (Gin)
- Patrón, Don Julio (Tequila)

**Liqueurs & Aperitifs (4 items)**
- Cointreau, Kahlúa, Baileys, Aperol

**Beer (3 items)**
- Corona, Heineken, Modelo (by case)

**Wine (6 items)**
- Château Margaux, Caymus (Red)
- La Crema (White)
- Whispering Angel (Rosé)
- Moët & Chandon, Veuve Clicquot (Champagne)

### 4. Inventory Counts (3 historical records)
- Main Bar: Counted 2 days ago
- Wine Cellar: Counted 3 days ago
- Kitchen Storage: Counted 1 day ago

### 5. Stock Levels
All items have:
- Current quantity (varies by item)
- Par level (reorder point)
- Last counted timestamp
- Some items are below par level (triggers alerts)

---

## Testing Instructions for Apple Reviewers

This is what you'll submit in App Store Connect (already written in `APP_STORE_METADATA.md`):

```
DEMO ACCOUNT ACCESS:
- Email: reviewer@invyeasy.com
- Password: AppleReview2024!
- This account has full owner access with pre-populated sample data

HOW TO TEST THE APP:

1. LOGIN
   Use the credentials above to sign in

2. VIEW DASHBOARD
   - See real-time inventory statistics
   - Review storage areas (Main Bar, Wine Cellar, Kitchen Storage)
   - Check recent activity

3. PERFORM A COUNT
   - Tap "Count" tab at the bottom
   - Select a storage area (e.g., "Main Bar")
   - Count sample items or adjust quantities
   - Tap "Save Count" to see updates in real-time

4. TEST TEAM FEATURES
   - Navigate to "Team" tab
   - View team members and roles

5. VIEW REPORTS
   - Tap "Reports" tab
   - Review usage analytics and stock movements

6. TEST OFFLINE MODE
   - Enable Airplane Mode
   - Perform inventory counts
   - Disable Airplane Mode to see automatic sync
```

---

## Maintenance

### To Reset Demo Data
If the demo account gets messy, you can re-run the SQL script. The script uses `ON CONFLICT` clauses, so it will update existing data rather than create duplicates.

### To Update Subscription
If the 30-day subscription expires:

```sql
UPDATE organizations
SET
  status = 'active',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '30 days'
WHERE id = '00000000-0000-0000-0000-000000000001';
```

### To Add More Sample Items
Follow the pattern in the SQL script and add new UUIDs for additional items.

---

## Troubleshooting

### Issue: User can't log in
- **Verify** user was created in Supabase Auth
- **Check** email is exactly: `reviewer@invyeasy.com`
- **Confirm** password is: `AppleReview2024!`
- **Ensure** "Auto Confirm User" was checked when creating

### Issue: No organization appears
- **Verify** you replaced `USER_ID_HERE` with actual UUID
- **Check** `organization_members` table has the correct user_id
- **Run query**:
  ```sql
  SELECT * FROM organization_members WHERE user_id = 'YOUR_USER_ID';
  ```

### Issue: No items showing
- **Verify** SQL script ran without errors
- **Check** `storage_areas` table has 3 rows
- **Check** `items` table has 24 rows
- **Check** `storage_area_items` table has records

### Issue: Can't perform counts
- **Verify** user role is `owner`
- **Check** organization status is `active`
- **Try** logging out and back in

---

## Security Notes

⚠️ **Important**: This demo account has full owner access. Make sure:
- Password is secure (already using strong password)
- Account is only used for demo purposes
- Don't store real/sensitive business data in this org
- Consider disabling this account after App Store approval if needed

---

## Ready for Submission

Once setup is complete:

- ✅ Demo account created
- ✅ Sample data populated
- ✅ All features testable
- ✅ Login credentials documented
- ✅ Testing instructions written

You're ready to submit these credentials to Apple in the **App Review Information** section of App Store Connect!
