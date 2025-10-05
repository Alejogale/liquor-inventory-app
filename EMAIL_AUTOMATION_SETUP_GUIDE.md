# 📧 InvyEasy Email Automation Setup Guide

## 🎯 What This Does

This automation system will:
- ✅ Monitor `invyeasy@gmail.com` for support emails every 5 minutes
- ✅ Automatically create tickets in your Notion Support Tickets database
- ✅ Send professional confirmation emails to customers
- ✅ Categorize emails (Bug Report, Feature Request, Billing, etc.)
- ✅ Set priority levels (High, Medium, Low)
- ✅ Work with your existing signup and payment email flows
- ✅ Run 100% FREE on Google's servers

## 🔧 Setup Instructions

### Step 1: Create Google Apps Script Project

1. **Go to Google Apps Script:**
   - Visit: https://script.google.com
   - Sign in with your Google account (the one that manages `invyeasy@gmail.com`)

2. **Create New Project:**
   - Click "New Project"
   - Name it: "InvyEasy Email Automation"

3. **Replace Default Code:**
   - Delete the default `myFunction()` code
   - Copy and paste the entire contents of `google-apps-script-email-automation.js`

### Step 2: Get Notion Integration Token

1. **Create Notion Integration:**
   - Go to: https://www.notion.so/my-integrations
   - Click "New integration"
   - Name: "InvyEasy Email Automation"
   - Select your workspace
   - Copy the "Internal Integration Token" (starts with `secret_`)

2. **Share Databases with Integration:**
   - Go to your "🎫 Support Tickets Database" in Notion
   - Click "Share" → "Invite"
   - Search for "InvyEasy Email Automation" and invite it
   - Repeat for "🎯 Master Projects Database"

### Step 3: Get Database IDs

1. **Get Support Tickets Database ID:**
   - Open your Support Tickets database in Notion
   - Copy the URL: `https://notion.so/workspace/DATABASE_ID?v=...`
   - The DATABASE_ID is the long string between the last `/` and `?`

2. **Get Projects Database ID:**
   - Same process for your Master Projects database

### Step 4: Configure the Script

In the Google Apps Script, find the CONFIG section and update:

```javascript
const CONFIG = {
  // Replace with your actual values
  NOTION_API_KEY: 'secret_YOUR_NOTION_TOKEN_HERE',
  NOTION_SUPPORT_DB_ID: 'YOUR_SUPPORT_DATABASE_ID',
  NOTION_PROJECTS_DB_ID: 'YOUR_PROJECTS_DATABASE_ID',
  
  // These should be correct already
  SUPPORT_EMAIL: 'invyeasy@gmail.com',
  APP_URL: 'https://invyeasy.com',
  // ... rest stays the same
}
```

### Step 5: Grant Permissions

1. **Save the Script:** Click the save icon or Ctrl+S

2. **Grant Gmail Permissions:**
   - Click "Run" on the `setupEmailAutomation` function
   - Google will ask for permissions
   - Click "Review permissions"
   - Choose your Google account
   - Click "Allow" for Gmail and Drive access

### Step 6: Test the Integration

1. **Run Setup Function:**
   - In the script editor, select `setupEmailAutomation` from the function dropdown
   - Click "Run"
   - Check the execution log for "Setup completed successfully!"

2. **Send Test Email:**
   - Send an email to `invyeasy@gmail.com` from a different email address
   - Subject: "Test support ticket"
   - Body: "This is a test of the automatic ticket system"

3. **Run Test Function:**
   - Select `testEmailProcessing` from the function dropdown
   - Click "Run"
   - Check your Notion Support Tickets database for the new ticket

### Step 7: Monitor and Verify

1. **Check Gmail Labels:**
   - Your Gmail should now have new labels: "Support", "Processed", "Error"

2. **Verify Automation:**
   - The script runs every 5 minutes automatically
   - New emails will be processed and marked with labels
   - Customers get confirmation emails with ticket IDs

## 🎛️ Automation Features

### Automatic Categorization

The system categorizes emails based on keywords:

- **Bug Report:** bug, error, broken, not working, issue, problem
- **Feature Request:** feature, enhancement, suggestion, add, improve
- **Account Help:** login, password, account, access, signup
- **Billing:** payment, billing, invoice, subscription, upgrade
- **General:** help, question, how to, support, assistance
- **Integration:** api, webhook, integration, sync, connect
- **Data Import:** import, csv, upload, data, file, export

### Priority Assignment

- **High Priority:** urgent, critical, emergency, billing, payment
- **Medium Priority:** bug, error, issue, problem, help
- **Low Priority:** everything else

### Customer Experience

When someone emails support:
1. ✅ Email arrives at `invyeasy@gmail.com`
2. ✅ System creates ticket in Notion (e.g., `INVYEASY-1699123456`)
3. ✅ Customer gets confirmation email with ticket ID
4. ✅ Email is labeled and marked as processed
5. ✅ You see the ticket in Notion with all details

## 🔄 Integration with Existing Systems

### Signup Emails
- Your existing signup emails continue to work normally
- Support emails are separate and get processed into tickets
- No interference with user onboarding

### Payment Emails
- Resend payment notifications continue as normal
- If customers reply to payment emails, they become support tickets
- Billing-related emails get "High" priority automatically

### Error Handling
- Failed emails are labeled "Error" for manual review
- Error notifications sent to your support email
- Detailed logging for troubleshooting

## 📊 Monitoring Dashboard

The system logs all activity to your Integration Logs database:
- ✅ Successfully processed emails
- ❌ Errors and failures
- 📈 Processing statistics
- 🔍 Detailed activity history

## 🆘 Troubleshooting

### Common Issues

1. **"Permission denied" errors:**
   - Re-run the setup function
   - Check that Notion integration has access to databases

2. **Emails not being processed:**
   - Check Gmail labels are created
   - Verify the trigger is running (every 5 minutes)
   - Look at execution log in Google Apps Script

3. **Notion tickets not created:**
   - Verify database IDs are correct
   - Check Notion integration token
   - Ensure databases are shared with integration

### Getting Help

1. **Google Apps Script Console:**
   - View → Logs to see processing details
   - View → Executions to see trigger history

2. **Notion Integration Logs:**
   - Check your Integration Logs database for errors

3. **Email Processing:**
   - Check Gmail labels for "Error" emails
   - Run `testEmailProcessing()` manually

## 🚀 Next Steps

Once email automation is working:
1. ✅ GitHub integration setup
2. ✅ Google Analytics reporting
3. ✅ Stripe webhook notifications
4. ✅ Complete automation dashboard

## 🔐 Security Notes

- ✅ API keys are stored securely in Google Apps Script
- ✅ No sensitive data in email confirmations
- ✅ Automatic error handling and notifications
- ✅ Rate limiting built into Notion API calls

---

**Ready to proceed?** Follow these steps and let me know when you need help with the next integration!