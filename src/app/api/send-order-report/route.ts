import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendOrderReport } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, organizationName, reportData, reportDate, reportUrl } = body

    if (!to || !organizationName || !reportData || !reportDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Send the email using the email service
    const result = await sendOrderReport({
      to,
      organizationName,
      reportData,
      reportDate,
      reportUrl
    })

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

  } catch (error) {
    console.error('Error sending order report email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
