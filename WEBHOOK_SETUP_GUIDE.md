# RevenueCat Webhook Setup Guide

## Overview
This guide will help you set up RevenueCat webhooks to automatically sync mobile subscriptions with your Supabase database.

## What We Built

✅ **Backend Webhook Endpoint**: `/api/webhooks/revenuecat`
✅ **User ID Linking**: Mobile app passes Supabase user ID to RevenueCat
✅ **Auto-sync**: Subscriptions update automatically when purchased on mobile

## Step-by-Step Setup in RevenueCat Dashboard

### 1. Navigate to Webhooks
1. Log in to [RevenueCat Dashboard](https://app.revenuecat.com)
2. Select your **InvyEasy** project
3. Click on **Integrations** in the left sidebar
4. Click on **Webhooks**

### 2. Add New Webhook
1. Click **+ New Webhook** button
2. Configure the webhook with these settings:

**Webhook URL**:
```
https://invyeasy.com/api/webhooks/revenuecat
```
(Or use your production URL when deployed)

**For Testing Locally** (optional):
- Use [ngrok](https://ngrok.com/) to expose your local server:
  ```bash
  ngrok http 3001
  ```
- Use the ngrok URL: `https://your-ngrok-url.ngrok.io/api/webhooks/revenuecat`

### 3. Select Events to Track

Enable these events (check the boxes):
- ✅ **INITIAL_PURCHASE** - User makes their first purchase
- ✅ **RENEWAL** - Subscription auto-renews
- ✅ **PRODUCT_CHANGE** - User upgrades/downgrades plan
- ✅ **CANCELLATION** - User cancels subscription
- ✅ **EXPIRATION** - Subscription expires
- ✅ **BILLING_ISSUE** - Payment fails

### 4. Get Authorization Key
1. After creating the webhook, RevenueCat will show you an **Authorization Key**
2. Copy this key - you'll need it for your .env file

### 5. Update Environment Variables

Add the authorization key to your `.env.local` file:

```env
# Replace 'your_webhook_secret_here' with the key from RevenueCat
REVENUECAT_WEBHOOK_SECRET=sk_xxxxxxxxxxxxxxxxxxxx
```

Also add this to your **production environment** (Vercel/deployment platform):
1. Go to your deployment dashboard (e.g., Vercel)
2. Navigate to Environment Variables
3. Add `REVENUECAT_WEBHOOK_SECRET` with the RevenueCat authorization key

### 6. Test the Webhook

#### Option A: Use RevenueCat Test Event
1. In RevenueCat Dashboard > Webhooks
2. Click **Send Test Event** next to your webhook
3. Check your backend logs to see if the webhook was received

#### Option B: Make a Test Purchase
1. Use a sandbox Apple account
2. Make a test purchase in your mobile app
3. Check:
   - RevenueCat Dashboard > Customers > Your test user
   - Your Supabase `organizations` table
   - Backend logs for webhook processing

## How It Works

```
┌─────────────┐
│  Mobile App │
│  (iOS)      │
└──────┬──────┘
       │ 1. User subscribes
       │
       ▼
┌─────────────┐
│ RevenueCat  │◄── 2. Validates receipt with Apple
└──────┬──────┘
       │ 3. Sends webhook
       │
       ▼
┌─────────────┐
│ Your API    │
│ /webhooks/  │
│ revenuecat  │
└──────┬──────┘
       │ 4. Updates database
       │
       ▼
┌─────────────┐
│  Supabase   │
│organizations│ ◄── 5. Subscription active!
└─────────────┘
```

## What Gets Synced

The webhook automatically updates your `organizations` table:

```sql
UPDATE organizations SET
  plan = 'professional',           -- Maps from product ID
  status = 'active',                -- 'active', 'cancelled', 'expired', 'past_due'
  current_period_start = '2024-01-01',
  current_period_end = '2024-02-01'
WHERE id = (SELECT organization_id FROM organization_members WHERE user_id = '...' AND role = 'owner')
```

## Event Handling

| RevenueCat Event | Database Action |
|-----------------|-----------------|
| `INITIAL_PURCHASE` | Set plan to purchased tier, status = 'active' |
| `RENEWAL` | Update period dates, status = 'active' |
| `PRODUCT_CHANGE` | Change plan tier |
| `CANCELLATION` | Set plan = 'free', status = 'cancelled' |
| `EXPIRATION` | Set plan = 'free', status = 'expired' |
| `BILLING_ISSUE` | Set status = 'past_due' |

## Troubleshooting

### Webhook Not Firing
1. Check webhook URL is correct and accessible
2. Verify webhook is enabled in RevenueCat dashboard
3. Check RevenueCat Dashboard > Activity for webhook delivery status

### Database Not Updating
1. Check backend logs for errors
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in .env
3. Ensure user has an organization with role = 'owner'
4. Check product IDs match between mobile config and webhook handler

### Testing Issues
1. **Sandbox purchases not working?**
   - Verify you're signed in with a sandbox Apple account
   - Check RevenueCat Dashboard shows the purchase

2. **Webhook not received locally?**
   - Make sure your local server is running
   - Use ngrok for local testing

3. **Wrong plan assigned?**
   - Verify product IDs in `PRODUCT_TO_PLAN_MAP` match your App Store Connect products

## Security Notes

✅ **Authorization**: RevenueCat signs webhooks with a secret key
✅ **HTTPS**: Always use HTTPS in production
✅ **Service Role**: Webhook uses Supabase service role key (bypasses RLS)
✅ **User Validation**: Webhook validates user exists before updating

## Monitoring

Watch these logs to ensure webhooks are working:

```bash
# Backend logs (local)
npm run dev

# Check for:
📱 RevenueCat webhook received: {...}
✅ Organization subscription updated: {...}

# RevenueCat Dashboard
Integrations > Webhooks > Activity
- Shows all webhook deliveries
- Green = success, Red = failed
```

## Next Steps

1. ✅ Complete webhook setup in RevenueCat dashboard
2. ✅ Test with sandbox purchase
3. ✅ Verify database updates correctly
4. ✅ Monitor webhook activity
5. 🚀 Ready for production!

## Support

- RevenueCat Docs: https://docs.revenuecat.com/docs/webhooks
- Test webhooks: RevenueCat Dashboard > Webhooks > Send Test Event
- Questions? Check webhook delivery status in RevenueCat Dashboard
