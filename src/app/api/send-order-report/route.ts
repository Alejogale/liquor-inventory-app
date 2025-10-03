import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendOrderReport } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API route called')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('❌ Auth error:', authError?.message || 'No user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Authenticated user:', user.email)

    const body = await request.json()
    console.log('📦 Request body keys:', Object.keys(body))
    console.log('📦 Report data keys:', body.reportData ? Object.keys(body.reportData) : 'No reportData')
    
    const { to, organizationName, reportData, reportDate, reportUrl } = body

    if (!to || !organizationName || !reportData || !reportDate) {
      console.log('❌ Missing required fields:', { 
        to: !!to, 
        organizationName: !!organizationName, 
        reportData: !!reportData, 
        reportDate: !!reportDate 
      })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('🔑 Environment check - RESEND_API_KEY present:', !!process.env.RESEND_API_KEY)
    console.log('📧 Attempting to send email to:', to)

    // Send the email using the email service
    const result = await sendOrderReport({
      to,
      organizationName,
      reportData,
      reportDate,
      reportUrl
    })

    console.log('📧 Email service result:', result)

    if (result.success) {
      console.log('✅ Email sent successfully')
      return NextResponse.json({ success: true, data: result.data })
    } else {
      console.log('❌ Email service failed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Error sending order report email:', error)
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
