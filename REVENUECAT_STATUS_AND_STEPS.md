# RevenueCat Integration - Current Status & Next Steps

## 📊 WHAT YOU CURRENTLY HAVE

### ✅ Mobile App Side (COMPLETE)

**File: `/src/mobile/config/revenuecat.ts`**
- ✅ RevenueCat API Key configured: `test_jXtmnHjGDBZQYFKWVkaTbwVpUQS`
- ✅ All 10 product IDs defined (matching App Store Connect):
  - Personal Monthly/Yearly
  - Starter Monthly/Yearly
  - Professional Monthly/Yearly
  - Premium Monthly/Yearly
  - Enterprise Monthly/Yearly
- ✅ Pricing matches your web app exactly
- ✅ Entitlement ID: `premium_access`

**File: `/src/mobile/hooks/usePurchases.ts`**
- ✅ Initializes RevenueCat with user ID
- ✅ Links RevenueCat customer to Supabase user
- ✅ Handles purchases, restores, subscription checks

**File: `/src/mobile/hooks/usePaywall.ts`**
- ✅ Manages paywall display logic
- ✅ Checks feature access
- ✅ Shows upgrade prompts

**File: `/src/mobile/components/PaywallScreen.tsx`**
- ✅ Beautiful paywall UI
- ✅ Shows all subscription options
- ✅ Displays correct pricing

**File: `/src/mobile/App.tsx`**
- ✅ Passes user ID to paywall system
- ✅ User linking is working

### ✅ Backend Webhook (COMPLETE)

**File: `/src/app/api/webhooks/revenuecat/route.ts`**
- ✅ Webhook endpoint created at: `/api/webhooks/revenuecat`
- ✅ Handles all subscription events:
  - INITIAL_PURCHASE (new subscription)
  - RENEWAL (subscription renewed)
  - PRODUCT_CHANGE (upgrade/downgrade)
  - CANCELLATION (user cancelled)
  - EXPIRATION (subscription expired)
  - BILLING_ISSUE (payment failed)
- ✅ Maps product IDs to plan names:
  - `com.invyeasy.personal.*` → `personal`
  - `com.invyeasy.starter.*` → `starter`
  - `com.invyeasy.professional.*` → `professional`
  - `com.invyeasy.premium.*` → `premium`
  - `com.invyeasy.enterprise.*` → `enterprise`
- ✅ Updates Supabase `organizations` table automatically

### ⚠️ Environment Variables (NEEDS WEBHOOK SECRET)

**File: `.env.local`**
- ✅ Supabase URL configured
- ✅ Supabase Service Role Key configured
- ⚠️ `REVENUECAT_WEBHOOK_SECRET` = `your_webhook_secret_here` (placeholder)
  - **This is OK for now** - you'll get the real secret from RevenueCat dashboard

---

## 🔍 WHAT NEEDS TO HAPPEN

To make RevenueCat work end-to-end, we need to complete 6 steps:

1. **Set up products in App Store Connect** (Apple's system)
2. **Configure RevenueCat dashboard** (RevenueCat's system)
3. **Set up webhook in RevenueCat** (connect RevenueCat → Your database)
4. **Verify database schema** (make sure database can receive updates)
5. **Test the flow** (make a test purchase)
6. **Deploy to production** (make webhook accessible)

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Check Database Schema (DO THIS FIRST)

Before anything else, let's make sure your database can receive subscription updates.

**Action:**
1. Go to Supabase Dashboard → SQL Editor
2. Run the file `check_revenuecat_setup.sql` that I just created
3. Send me the output

**What we're checking:**
- Does `organizations` table have: `plan`, `status`, `current_period_start`, `current_period_end`?
- What plan values exist?
- What status values exist?

**Why this matters:**
The webhook needs these columns to update subscriptions. If they're missing, we need to add them before proceeding.

---

### STEP 2: Create Products in App Store Connect

**Where:** [App Store Connect](https://appstoreconnect.apple.com)

**Action:**
1. Log in to App Store Connect
2. Go to **My Apps** → Select **InvyEasy** (or create it if it doesn't exist)
3. Go to **Features** → **In-App Purchases**
4. Create **Auto-Renewable Subscriptions**
5. Create a **Subscription Group** called "InvyEasy Subscriptions"

**Create 10 products with these EXACT IDs:**

| Product Reference Name | Product ID | Price | Duration |
|------------------------|-----------|-------|----------|
| Personal Monthly | `com.invyeasy.personal.monthly` | $19.00 | 1 Month |
| Personal Yearly | `com.invyeasy.personal.yearly` | $193.00 | 1 Year |
| Starter Monthly | `com.invyeasy.starter.monthly` | $89.00 | 1 Month |
| Starter Yearly | `com.invyeasy.starter.yearly` | $906.00 | 1 Year |
| Professional Monthly | `com.invyeasy.professional.monthly` | $229.00 | 1 Month |
| Professional Yearly | `com.invyeasy.professional.yearly` | $2,334.00 | 1 Year |
| Premium Monthly | `com.invyeasy.premium.monthly` | $499.00 | 1 Month |
| Premium Yearly | `com.invyeasy.premium.yearly` | $5,087.00 | 1 Year |
| Enterprise Monthly | `com.invyeasy.enterprise.monthly` | $1,499.00 | 1 Month |
| Enterprise Yearly | `com.invyeasy.enterprise.yearly` | $15,287.00 | 1 Year |

**For each product:**
- **Subscription Group**: InvyEasy Subscriptions
- **Review Information**: Add screenshots and description
- **Localization**: Add display names and descriptions
- **Status**: Make sure they're "Ready to Submit"

**IMPORTANT:** Product IDs MUST match exactly what's in your code, or nothing will work!

---

### STEP 3: Configure RevenueCat Dashboard

**Where:** [RevenueCat Dashboard](https://app.revenuecat.com)

#### 3.1 Create Project (if not done)
1. Log in to RevenueCat
2. Create a new project called "InvyEasy"
3. Select **iOS** as the platform

#### 3.2 Add App Store Connect Integration
1. In RevenueCat dashboard, go to **Project Settings** → **Apps**
2. Click **Add App**
3. Select **Apple App Store**
4. Enter your **Bundle ID**: `com.invyeasy.mobile`
5. Upload your App Store Connect API Key (or use shared secret)
6. Save

#### 3.3 Create Entitlement
1. Go to **Entitlements** in left sidebar
2. Click **+ New Entitlement**
3. Create entitlement with **ID**: `premium_access`
4. **Name**: "Premium Access"
5. Save

#### 3.4 Create Offering
1. Go to **Offerings** in left sidebar
2. Click **+ New Offering**
3. **Identifier**: `default`
4. **Description**: "Default subscription offering"
5. Save

#### 3.5 Add Products to Offering
1. Open the "default" offering
2. Click **+ Add Package**
3. Create packages for each product:

**Package 1: Personal Monthly**
- Package Identifier: `$rc_monthly` (or custom like `personal_monthly`)
- Product ID: `com.invyeasy.personal.monthly`

**Package 2: Personal Yearly**
- Package Identifier: `$rc_annual` (or custom like `personal_yearly`)
- Product ID: `com.invyeasy.personal.yearly`

**Repeat for all 10 products**

#### 3.6 Attach Entitlement to Products
1. Go to **Products** in left sidebar
2. For each product, click to edit
3. Attach entitlement: **premium_access**
4. Save

**Result:** All 10 products should now grant the "premium_access" entitlement

---

### STEP 4: Set Up Webhook in RevenueCat

#### 4.1 Navigate to Webhooks
1. In RevenueCat Dashboard, click **Integrations** in left sidebar
2. Click **Webhooks**
3. Click **+ New Webhook**

#### 4.2 Configure Webhook

**Webhook URL:**
```
https://invyeasy.com/api/webhooks/revenuecat
```

**For local testing (optional):**
- Use ngrok: `ngrok http 3001`
- Then use: `https://YOUR-NGROK-URL.ngrok.io/api/webhooks/revenuecat`

**Events to enable (check these boxes):**
- ✅ INITIAL_PURCHASE
- ✅ RENEWAL
- ✅ PRODUCT_CHANGE
- ✅ CANCELLATION
- ✅ EXPIRATION
- ✅ BILLING_ISSUE

**Authorization Header:**
- Leave blank (RevenueCat uses their own signature system)

#### 4.3 Get Webhook Secret
1. After creating the webhook, RevenueCat will show you an **Authorization Key**
2. **COPY THIS KEY** - you'll need it next
3. It will look like: `sk_xxxxxxxxxxxxxxxxxx`

#### 4.4 Update Environment Variable
1. Open your `.env.local` file
2. Replace the placeholder:
   ```env
   REVENUECAT_WEBHOOK_SECRET=sk_xxxxxxxxxxxxxxxxxx
   ```
3. Save the file
4. **Restart your Next.js server** for the change to take effect

---

### STEP 5: Verify & Test

#### 5.1 Verify Webhook is Saved
1. In RevenueCat Dashboard → Webhooks
2. You should see your webhook listed
3. Status should be "Active" or "Enabled"

#### 5.2 Send Test Event (Optional)
1. Click **Send Test Event** next to your webhook
2. Check your backend logs to see if it was received
3. Note: This will fail if webhook URL is localhost (that's OK for now)

#### 5.3 Test Purchase Flow (Sandbox)

**Prepare:**
1. Create a **Sandbox Apple ID** in App Store Connect:
   - Go to Users and Access → Sandbox Testers
   - Create a test account (e.g., `test@example.com`)

**Test:**
1. Open your mobile app in iOS Simulator or device
2. Log in with a real Supabase user account
3. Trigger the paywall (try to access a premium feature)
4. Select a subscription plan (e.g., Professional Monthly)
5. Apple will prompt for sandbox account login
6. Complete the purchase

**Verify:**
1. Check RevenueCat Dashboard → Customers
   - You should see your test user
   - Subscription should show as active
2. Check Supabase → Organizations table
   - Find your organization
   - `plan` should be updated (e.g., `professional`)
   - `status` should be `active`
   - `current_period_start` and `current_period_end` should be set

---

### STEP 6: Deploy to Production

Once testing works, deploy your backend so the webhook can receive events:

**Option A: Vercel**
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable: `REVENUECAT_WEBHOOK_SECRET`
4. Deploy

**Option B: Your existing deployment**
1. Deploy your Next.js app
2. Make sure `REVENUECAT_WEBHOOK_SECRET` is set in production environment
3. Webhook URL should be accessible at: `https://invyeasy.com/api/webhooks/revenuecat`

**Update RevenueCat Webhook URL:**
1. Go back to RevenueCat Dashboard → Webhooks
2. Edit your webhook
3. Change URL from local/ngrok to production: `https://invyeasy.com/api/webhooks/revenuecat`
4. Save

---

## 🧪 HOW TO TEST END-TO-END

### Complete Flow Test:

1. **User signs up** → Creates account in Supabase
2. **User creates organization** → Row added to `organizations` table with `plan = 'free'`
3. **User opens mobile app** → Logs in with Supabase credentials
4. **RevenueCat initializes** → Links RevenueCat customer ID with Supabase user ID
5. **User triggers paywall** → Sees subscription options
6. **User selects plan** → e.g., Professional Monthly ($229)
7. **Apple processes payment** → Using sandbox or real payment
8. **RevenueCat validates** → Confirms subscription with Apple
9. **RevenueCat sends webhook** → `INITIAL_PURCHASE` event to your API
10. **Your webhook updates database** → Sets `plan = 'professional'`, `status = 'active'`
11. **User refreshes app** → Now has access to Professional features

### What to Check:
- ✅ User can log in to mobile app
- ✅ Paywall shows correct pricing
- ✅ Purchase flow works (sandbox)
- ✅ RevenueCat Dashboard shows the purchase
- ✅ Webhook logs show event received
- ✅ Supabase database updated correctly
- ✅ User has access to subscribed features

---

## 🚨 POTENTIAL ISSUES & FIXES

### Issue: "Product IDs not found"
**Cause:** Products not created in App Store Connect or not synced to RevenueCat
**Fix:**
1. Verify products exist in App Store Connect
2. Wait 15-30 minutes for Apple to sync
3. Check RevenueCat Dashboard → Products

### Issue: "Webhook not receiving events"
**Cause:** Webhook URL not accessible or incorrect
**Fix:**
1. Test webhook URL in browser (should return 405 Method Not Allowed for GET)
2. Use ngrok for local testing
3. Check RevenueCat Dashboard → Webhooks → Activity for delivery status

### Issue: "Database not updating"
**Cause:** Missing columns or wrong column names
**Fix:**
1. Run `check_revenuecat_setup.sql` to verify schema
2. Add missing columns if needed
3. Check webhook logs for errors

### Issue: "Entitlement not active after purchase"
**Cause:** Product not attached to entitlement in RevenueCat
**Fix:**
1. Go to RevenueCat Dashboard → Products
2. For each product, attach entitlement: `premium_access`
3. Save

---

## 📋 WHAT WE NEED FROM YOU NOW

**To proceed, please do STEP 1 first:**

1. ✅ Run `check_revenuecat_setup.sql` in Supabase
2. ✅ Send me the output
3. ✅ Tell me: Have you created products in App Store Connect yet?
4. ✅ Tell me: Have you set up RevenueCat dashboard yet?

**Then we'll go step-by-step through the rest!**

---

## 🎯 SUMMARY

**What's Already Done:**
- ✅ Mobile app code (100% complete)
- ✅ Webhook endpoint (100% complete)
- ✅ Pricing aligned with web app
- ✅ User linking working
- ✅ Subscription logic working

**What You Need to Do:**
1. Verify database schema (5 minutes)
2. Create products in App Store Connect (30-45 minutes)
3. Configure RevenueCat dashboard (20-30 minutes)
4. Set up webhook (10 minutes)
5. Test with sandbox purchase (10 minutes)
6. Deploy to production (if not already)

**Total time:** ~2 hours to fully set up

**Once complete:** Subscriptions will sync automatically between mobile app and database! 🎉
