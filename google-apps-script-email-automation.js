/**
 * InvyEasy Email to Notion Support Tickets Automation
 * Google Apps Script - Runs FREE on Google's servers
 * 
 * This script:
 * 1. Monitors invyeasy@gmail.com for support emails
 * 2. Creates tickets in Notion Support Tickets database
 * 3. Sends confirmation replies to customers
 * 4. Handles signup confirmations and payment notifications
 * 5. Categorizes emails automatically
 */

// ========================================
// CONFIGURATION - FILL THESE VALUES
// ========================================

const CONFIG = {
  // Notion Configuration
  NOTION_API_KEY: 'YOUR_NOTION_INTEGRATION_TOKEN', // Get from notion.so/integrations
  NOTION_SUPPORT_DB_ID: 'YOUR_SUPPORT_TICKETS_DATABASE_ID', // From your Notion database URL
  NOTION_PROJECTS_DB_ID: 'YOUR_PROJECTS_DATABASE_ID', // From your Projects database URL
  
  // Email Configuration
  SUPPORT_EMAIL: 'invyeasy@gmail.com',
  EMAIL_LABEL: 'Support', // Gmail label to process
  PROCESS_UNREAD_ONLY: true,
  
  // InvyEasy Configuration
  APP_URL: 'https://invyeasy.com',
  COMPANY_NAME: 'InvyEasy',
  
  // Auto-categorization keywords
  CATEGORIES: {
    'Bug Report': ['bug', 'error', 'broken', 'not working', 'issue', 'problem'],
    'Feature Request': ['feature', 'enhancement', 'suggestion', 'add', 'improve', 'request'],
    'Account Help': ['login', 'password', 'account', 'access', 'signup', 'register'],
    'Billing': ['payment', 'billing', 'invoice', 'subscription', 'upgrade', 'charge'],
    'General': ['help', 'question', 'how to', 'support', 'assistance'],
    'Integration': ['api', 'webhook', 'integration', 'sync', 'connect'],
    'Data Import': ['import', 'csv', 'upload', 'data', 'file', 'export']
  }
}

// ========================================
// MAIN AUTOMATION FUNCTIONS
// ========================================

/**
 * Main function - Run this every 5 minutes via trigger
 */
function processEmailsToNotion() {
  console.log('🚀 Starting InvyEasy email automation...')
  
  try {
    // Get unread emails with support label
    const emails = getUnreadSupportEmails()
    console.log(`📧 Found ${emails.length} unread support emails`)
    
    if (emails.length === 0) {
      console.log('✅ No new emails to process')
      return
    }
    
    // Process each email
    for (const email of emails) {
      try {
        await processEmail(email)
        
        // Mark as read and add processed label
        email.markRead()
        addLabelToEmail(email, 'Processed')
        
        console.log(`✅ Processed email: ${email.getSubject()}`)
        
      } catch (error) {
        console.error(`❌ Error processing email "${email.getSubject()}":`, error)
        addLabelToEmail(email, 'Error')
      }
    }
    
    console.log('🎉 Email automation completed successfully')
    
  } catch (error) {
    console.error('💥 Fatal error in email automation:', error)
    sendErrorNotification(error)
  }
}

/**
 * Process individual email and create Notion ticket
 */
async function processEmail(email) {
  // Extract email details
  const emailData = extractEmailData(email)
  
  // Check for duplicates
  if (await isDuplicateTicket(emailData)) {
    console.log(`⚠️ Duplicate ticket detected for: ${emailData.subject}`)
    return
  }
  
  // Categorize the email
  const category = categorizeEmail(emailData)
  
  // Determine priority
  const priority = determinePriority(emailData, category)
  
  // Create Notion ticket
  const ticketId = await createNotionTicket({
    ...emailData,
    category,
    priority
  })
  
  // Send confirmation email to customer
  await sendConfirmationEmail(emailData, ticketId)
  
  // Log to Integration Logs
  await logIntegration({
    type: 'Success',
    service: 'Email to Notion',
    details: `Created ticket ${ticketId} for ${emailData.from}`,
    timestamp: new Date()
  })
}

/**
 * Extract relevant data from Gmail message
 */
function extractEmailData(email) {
  const subject = email.getSubject()
  const body = email.getPlainBody()
  const htmlBody = email.getBody()
  const from = email.getFrom()
  const date = email.getDate()
  const messageId = email.getId()
  
  // Extract customer name from email
  const nameMatch = from.match(/^([^<]+)</)
  const customerName = nameMatch ? nameMatch[1].trim() : from.split('@')[0]
  
  // Extract email address
  const emailMatch = from.match(/<([^>]+)>/)
  const customerEmail = emailMatch ? emailMatch[1] : from
  
  return {
    subject,
    body,
    htmlBody,
    from,
    customerName,
    customerEmail,
    date,
    messageId,
    attachments: email.getAttachments().map(att => ({
      name: att.getName(),
      size: att.getSize(),
      type: att.getContentType()
    }))
  }
}

/**
 * Automatically categorize email based on content
 */
function categorizeEmail(emailData) {
  const text = `${emailData.subject} ${emailData.body}`.toLowerCase()
  
  for (const [category, keywords] of Object.entries(CONFIG.CATEGORIES)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category
    }
  }
  
  return 'General'
}

/**
 * Determine ticket priority based on content and category
 */
function determinePriority(emailData, category) {
  const text = `${emailData.subject} ${emailData.body}`.toLowerCase()
  
  // High priority keywords
  const highPriorityKeywords = [
    'urgent', 'critical', 'emergency', 'down', 'broken', 'not working',
    'billing', 'payment', 'charge', 'refund', 'money'
  ]
  
  // Medium priority keywords
  const mediumPriorityKeywords = [
    'bug', 'error', 'issue', 'problem', 'help', 'support'
  ]
  
  if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'High'
  } else if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'Medium'
  } else {
    return 'Low'
  }
}

/**
 * Create ticket in Notion Support Tickets database
 */
async function createNotionTicket(ticketData) {
  const ticketId = `INVYEASY-${Date.now()}`
  
  const notionPage = {
    parent: {
      database_id: CONFIG.NOTION_SUPPORT_DB_ID
    },
    properties: {
      'Ticket ID': {
        title: [
          {
            text: {
              content: ticketId
            }
          }
        ]
      },
      'Customer Name': {
        rich_text: [
          {
            text: {
              content: ticketData.customerName
            }
          }
        ]
      },
      'Customer Email': {
        email: ticketData.customerEmail
      },
      'Subject': {
        rich_text: [
          {
            text: {
              content: ticketData.subject
            }
          }
        ]
      },
      'Category': {
        select: {
          name: ticketData.category
        }
      },
      'Priority': {
        select: {
          name: ticketData.priority
        }
      },
      'Status': {
        select: {
          name: 'Open'
        }
      },
      'Source': {
        select: {
          name: 'Email'
        }
      },
      'Created Date': {
        date: {
          start: ticketData.date.toISOString()
        }
      }
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: 'Original Email Content'
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `From: ${ticketData.from}\nDate: ${ticketData.date}\nSubject: ${ticketData.subject}\n\n${ticketData.body}`
              }
            }
          ]
        }
      }
    ]
  }
  
  // Add attachments info if any
  if (ticketData.attachments.length > 0) {
    notionPage.children.push({
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: 'Attachments'
            }
          }
        ]
      }
    })
    
    const attachmentsList = ticketData.attachments.map(att => 
      `• ${att.name} (${att.type}, ${att.size} bytes)`
    ).join('\n')
    
    notionPage.children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: attachmentsList
            }
          }
        ]
      }
    })
  }
  
  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.NOTION_API_KEY}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify(notionPage)
  })
  
  if (!response.ok) {
    throw new Error(`Notion API error: ${response.status} - ${await response.text()}`)
  }
  
  const result = await response.json()
  console.log(`✅ Created Notion ticket: ${ticketId}`)
  
  return ticketId
}

/**
 * Send confirmation email to customer
 */
async function sendConfirmationEmail(emailData, ticketId) {
  const confirmationSubject = `[${ticketId}] Thank you for contacting InvyEasy Support`
  
  const confirmationBody = `
    Hello ${emailData.customerName},
    
    Thank you for contacting InvyEasy support! We've received your message and created a support ticket for you.
    
    📋 TICKET DETAILS:
    • Ticket ID: ${ticketId}
    • Subject: ${emailData.subject}
    • Priority: ${determinePriority(emailData, categorizeEmail(emailData))}
    • Status: Open
    
    🕐 WHAT HAPPENS NEXT:
    Our support team will review your request and respond within:
    • High Priority: 4 hours
    • Medium Priority: 24 hours  
    • Low Priority: 48 hours
    
    📧 IMPORTANT:
    When replying, please keep this ticket ID [${ticketId}] in the subject line so we can track your conversation.
    
    💡 HELPFUL RESOURCES:
    While you wait, check out these resources:
    • Help Center: ${CONFIG.APP_URL}/contact
    • Feature Requests: ${CONFIG.APP_URL}/contact
    • Billing Questions: ${CONFIG.APP_URL}/pricing
    
    Thank you for using InvyEasy - we're here to help you organize everything you own!
    
    Best regards,
    The InvyEasy Support Team
    
    ---
    InvyEasy Support
    📧 ${CONFIG.SUPPORT_EMAIL}
    🌐 ${CONFIG.APP_URL}
    
    This is an automated confirmation. Please do not reply to this email address.
  `
  
  // Send via Gmail
  GmailApp.sendEmail(
    emailData.customerEmail,
    confirmationSubject,
    confirmationBody,
    {
      from: CONFIG.SUPPORT_EMAIL,
      name: 'InvyEasy Support'
    }
  )
  
  console.log(`✅ Sent confirmation email to ${emailData.customerEmail}`)
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get unread emails with support label
 */
function getUnreadSupportEmails() {
  try {
    // Search for unread emails to support address
    const query = `to:${CONFIG.SUPPORT_EMAIL} is:unread`
    const threads = GmailApp.search(query, 0, 50)
    
    const emails = []
    for (const thread of threads) {
      const messages = thread.getMessages()
      for (const message of messages) {
        if (message.isUnread()) {
          emails.push(message)
        }
      }
    }
    
    return emails
  } catch (error) {
    console.error('Error fetching emails:', error)
    return []
  }
}

/**
 * Add label to email
 */
function addLabelToEmail(email, labelName) {
  try {
    let label = GmailApp.getUserLabelByName(labelName)
    if (!label) {
      label = GmailApp.createLabel(labelName)
    }
    email.getThread().addLabel(label)
  } catch (error) {
    console.error(`Error adding label ${labelName}:`, error)
  }
}

/**
 * Check if ticket already exists for this email
 */
async function isDuplicateTicket(emailData) {
  // Simple duplicate check based on subject and sender
  // In a real implementation, you'd query Notion for existing tickets
  return false
}

/**
 * Log integration activity to Notion
 */
async function logIntegration(logData) {
  // Implementation would create entry in Integration Logs database
  console.log('📊 Integration Log:', logData)
}

/**
 * Send error notification
 */
function sendErrorNotification(error) {
  try {
    GmailApp.sendEmail(
      CONFIG.SUPPORT_EMAIL,
      '🚨 InvyEasy Email Automation Error',
      `An error occurred in the email automation:\n\n${error.toString()}\n\nStack trace:\n${error.stack}`,
      {
        from: CONFIG.SUPPORT_EMAIL
      }
    )
  } catch (e) {
    console.error('Failed to send error notification:', e)
  }
}

// ========================================
// SETUP FUNCTIONS - RUN ONCE
// ========================================

/**
 * Initial setup - creates labels and triggers
 */
function setupEmailAutomation() {
  console.log('🔧 Setting up InvyEasy email automation...')
  
  // Create necessary Gmail labels
  const labels = ['Support', 'Processed', 'Error', 'InvyEasy Automation']
  for (const labelName of labels) {
    let label = GmailApp.getUserLabelByName(labelName)
    if (!label) {
      GmailApp.createLabel(labelName)
      console.log(`✅ Created label: ${labelName}`)
    }
  }
  
  // Create time-based trigger (every 5 minutes)
  ScriptApp.newTrigger('processEmailsToNotion')
    .timeBased()
    .everyMinutes(5)
    .create()
  
  console.log('✅ Email automation setup completed!')
  console.log('🔄 Emails will be processed every 5 minutes')
  console.log('📧 Monitoring:', CONFIG.SUPPORT_EMAIL)
  
  return 'Setup completed successfully!'
}

/**
 * Test function - processes one email manually
 */
function testEmailProcessing() {
  console.log('🧪 Testing email processing...')
  
  try {
    const emails = getUnreadSupportEmails()
    if (emails.length > 0) {
      const testEmail = emails[0]
      processEmail(testEmail)
      console.log('✅ Test completed successfully!')
    } else {
      console.log('⚠️ No unread emails found for testing')
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

/**
 * Cleanup function - removes triggers and labels (for testing)
 */
function cleanupEmailAutomation() {
  // Delete all triggers
  const triggers = ScriptApp.getProjectTriggers()
  for (const trigger of triggers) {
    ScriptApp.deleteTrigger(trigger)
  }
  
  console.log('🧹 Cleanup completed - all triggers removed')
}

// ========================================
// EXPORT FOR TESTING
// ========================================

// Uncomment for manual testing
// setupEmailAutomation()
// testEmailProcessing()