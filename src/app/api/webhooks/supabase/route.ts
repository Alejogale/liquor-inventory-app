import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    
    // Verify the webhook is from Supabase (optional: add webhook secret validation)
    const authHeader = request.headers.get('authorization')
    
    // Log the webhook for debugging
    console.log('Supabase webhook received:', {
      type: payload.type,
      table: payload.table,
      record: payload.record ? { id: payload.record.id, email: payload.record.email } : null
    })

    // Handle different webhook events
    switch (payload.type) {
      case 'INSERT':
        // When a new user is inserted into auth.users table
        if (payload.table === 'auth.users' && payload.record) {
          const user = payload.record
          
          // Only send welcome email if email is confirmed
          if (user.email_confirmed_at) {
            console.log('Sending welcome email to:', user.email)
            
            const result = await sendWelcomeEmail({
              to: user.email,
              userName: user.user_metadata?.full_name || user.email.split('@')[0] || 'New User',
              loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
            })

            if (result.success) {
              console.log('Welcome email sent successfully to:', user.email)
            } else {
              console.error('Failed to send welcome email:', result.error)
            }
          } else {
            console.log('User email not yet confirmed, skipping welcome email')
          }
        }
        break

      case 'UPDATE':
        // When a user record is updated (e.g., email confirmation)
        if (payload.table === 'auth.users' && payload.record) {
          const user = payload.record
          const oldRecord = payload.old_record
          
          // Check if this update is confirming the email
          if (!oldRecord?.email_confirmed_at && user.email_confirmed_at) {
            console.log('Email confirmed, sending welcome email to:', user.email)
            
            const result = await sendWelcomeEmail({
              to: user.email,
              userName: user.user_metadata?.full_name || user.email.split('@')[0] || 'New User',
              loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
            })

            if (result.success) {
              console.log('Welcome email sent successfully to:', user.email)
            } else {
              console.error('Failed to send welcome email:', result.error)
            }
          }
        }
        break

      default:
        console.log('Unhandled webhook type:', payload.type)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ 
    message: 'Supabase webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}