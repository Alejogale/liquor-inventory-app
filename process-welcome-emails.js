// Simple script to process welcome emails
// You can run this as a cron job or manually

async function processWelcomeEmails() {
  try {
    const response = await fetch('https://invyeasy.com/api/process-welcome-emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invyeasy-welcome-emails-2024',
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    console.log('Welcome email processing result:', result)
    
    if (result.processed > 0) {
      console.log(`✅ Processed ${result.processed} emails (${result.successful} successful, ${result.failed} failed)`)
    } else {
      console.log('📭 No pending emails to process')
    }
  } catch (error) {
    console.error('❌ Error processing welcome emails:', error)
  }
}

// Run the function
processWelcomeEmails()