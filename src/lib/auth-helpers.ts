import { supabase } from './supabase'

/**
 * Handle post-signup email confirmation
 * Call this after successful email confirmation
 */
export async function handleEmailConfirmation(user: any) {
  try {
    // Send welcome email via our API
    const response = await fetch('/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailType: 'welcome',
        to: user.email,
        userName: user.user_metadata?.full_name || user.email.split('@')[0] || 'New User'
      }),
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('Welcome email sent successfully')
    } else {
      console.error('Failed to send welcome email:', result.error)
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
  }
}

/**
 * Listen for auth state changes and trigger welcome email
 * Use this in your app's auth state listener
 */
export function setupAuthStateListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)
    
    if (event === 'SIGNED_IN' && session?.user) {
      const user = session.user
      
      // Check if this is a new user who just confirmed their email
      if (user.email_confirmed_at && user.created_at) {
        const createdAt = new Date(user.created_at)
        const confirmedAt = new Date(user.email_confirmed_at)
        const timeDiff = confirmedAt.getTime() - createdAt.getTime()
        
        // If email was confirmed within 5 minutes of account creation,
        // this is likely a new user confirming their email
        if (timeDiff < 5 * 60 * 1000) {
          console.log('New user email confirmation detected, sending welcome email')
          await handleEmailConfirmation(user)
        }
      }
    }
  })
}