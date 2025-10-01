import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/lib/email-service'

// Create Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.INTERNAL_API_KEY || 'your-secret-key'
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get pending welcome emails from queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('welcome_email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10) // Process 10 at a time

    if (fetchError) {
      throw fetchError
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending welcome emails',
        processed: 0
      })
    }

    let successCount = 0
    let failureCount = 0

    // Process each pending email
    for (const emailRequest of pendingEmails) {
      try {
        console.log('Sending welcome email to:', emailRequest.email)
        
        const result = await sendWelcomeEmail({
          to: emailRequest.email,
          userName: emailRequest.user_name || 'New User',
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
        })

        if (result.success) {
          // Mark as sent
          await supabase
            .from('welcome_email_queue')
            .update({
              status: 'sent',
              processed_at: new Date().toISOString()
            })
            .eq('id', emailRequest.id)
          
          successCount++
          console.log('Welcome email sent successfully to:', emailRequest.email)
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (error) {
        console.error('Failed to send welcome email:', error)
        
        // Mark as failed
        await supabase
          .from('welcome_email_queue')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString()
          })
          .eq('id', emailRequest.id)
        
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${pendingEmails.length} welcome emails`,
      processed: pendingEmails.length,
      successful: successCount,
      failed: failureCount
    })

  } catch (error) {
    console.error('Welcome email processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process welcome emails' },
      { status: 500 }
    )
  }
}

// GET endpoint to check queue status
export async function GET() {
  try {
    // Get queue statistics
    const { data: stats, error } = await supabase
      .from('welcome_email_queue')
      .select('status')
    
    if (error) throw error

    const pending = stats?.filter(s => s.status === 'pending').length || 0
    const sent = stats?.filter(s => s.status === 'sent').length || 0
    const failed = stats?.filter(s => s.status === 'failed').length || 0

    return NextResponse.json({
      success: true,
      queue_stats: {
        pending,
        sent,
        failed,
        total: stats?.length || 0
      }
    })
  } catch (error) {
    console.error('Queue stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get queue stats' },
      { status: 500 }
    )
  }
}