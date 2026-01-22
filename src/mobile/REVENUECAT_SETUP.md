# RevenueCat Setup Guide for InvyEasy

## Overview
This guide helps you configure RevenueCat and App Store Connect with the correct pricing to match the web app.

## App Store Connect Product IDs

Create the following In-App Purchase products in App Store Connect with these **exact** Product IDs:

### Personal Plan
- **Monthly**: `com.invyeasy.personal.monthly` - **$19.99/month**
- **Yearly**: `com.invyeasy.personal.yearly` - **$192.99/year** (Save $35/year)

### Starter Plan
- **Monthly**: `com.invyeasy.starter.monthly` - **$89.99/month**
- **Yearly**: `com.invyeasy.starter.yearly` - **$905.99/year** (Save $162/year)

### Professional Plan (Most Popular)
- **Monthly**: `com.invyeasy.professional.monthly` - **$229.99/month**
- **Yearly**: `com.invyeasy.professional.yearly` - **$2,333.99/year** (Save $414/year)

### Premium Plan
- **Monthly**: `com.invyeasy.premium.monthly` - **$499.99/month**
- **Yearly**: `com.invyeasy.premium.yearly` - **$5,086.99/year** (Save $901/year)

### Enterprise Plan
- **Monthly**: `com.invyeasy.enterprise.monthly` - **$1,499.99/month**
- **Yearly**: `com.invyeasy.enterprise.yearly` - **$15,286.99/year** (Save $2,701/year)

## RevenueCat Configuration

### 1. Create Products in App Store Connect
1. Go to App Store Connect > My Apps > Your App > Subscriptions
2. Create an Auto-Renewable Subscription Group named "InvyEasy Premium"
3. Add all 10 subscription products listed above
4. Set the pricing tier for each product to match the prices above

### 2. Configure RevenueCat Dashboard
1. Log in to RevenueCat Dashboard
2. Go to your InvyEasy project
3. Navigate to Products
4. Import the products from App Store Connect
5. Create an Offering called "Current" (default offering)
6. Add all 10 products to this offering
7. Create an Entitlement called "premium_access"
8. Link all products to the "premium_access" entitlement

### 3. Product Descriptions in App Store Connect
Use these descriptions for better user experience:

- **Personal**: "Perfect for home bars and personal collections"
- **Starter**: "Everything you need for a single venue"
- **Professional**: "Advanced features for large venues or 2-3 locations"
- **Premium**: "For multi-location chains and high-volume operations"
- **Enterprise**: "Unlimited everything for major chains and venues"

## Features by Plan

### Personal ($19/month, $193/year)
- 2 storage areas
- 150 items
- 1 user
- Mobile app access
- Basic reports
- Email support

### Starter ($89/month, $906/year)
- 5 storage areas
- 500 items
- 5 users
- Room-by-room counting
- Stock alerts
- Team collaboration

### Professional ($229/month, $2,334/year) - MOST POPULAR
- 15 storage areas
- 2,000 items
- 15 users
- Advanced analytics
- Custom reports
- Priority support

### Premium ($499/month, $5,087/year)
- 50 storage areas
- 10,000 items
- 50 users
- Multi-location management
- API access
- Dedicated account manager

### Enterprise ($1,499/month, $15,287/year)
- Unlimited storage areas
- Unlimited items
- Unlimited users
- White-label options
- 24/7 phone support
- SLA guarantee

## Testing

### Testing with Sandbox
1. Create sandbox test accounts in App Store Connect
2. Sign in to the iOS device with the sandbox account
3. Test purchases using the test API key: `test_jXtmnHjGDBZQYFKWVkaTbwVpUQS`

### Production
1. Replace test API key with production key in `/src/mobile/config/revenuecat.ts`
2. Update `REVENUECAT_API_KEY` with your production key from RevenueCat dashboard

## Important Notes

- All pricing must match the web app exactly
- The "Professional" plan should be marked as "Most Popular" in the offering
- Make sure the entitlement ID "premium_access" is used consistently
- Test restore purchases functionality thoroughly
- Verify offline functionality works with subscriptions

## Support

If you encounter issues:
1. Check RevenueCat dashboard for API errors
2. Verify all Product IDs match exactly
3. Ensure products are approved in App Store Connect
4. Test with sandbox accounts first before going live
