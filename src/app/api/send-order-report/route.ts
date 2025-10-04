import { NextRequest, NextResponse } from 'next/server'
import { sendOrderReport } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Email API route called')
    
    // Get user email from request headers for authentication
    const userEmail = request.headers.get('x-user-email')
    console.log('📧 User email from header:', userEmail)
    
    if (!userEmail) {
      console.log('❌ No user email provided in headers')
      return NextResponse.json({ error: 'Unauthorized - No user email' }, { status: 401 })
    }
    
    // For additional security, you could validate the user exists in your database
    // but for now, we'll trust the frontend since it's already authenticated
    console.log('✅ Proceeding with user:', userEmail)

    const body = await request.json()
    console.log('📦 Request body keys:', Object.keys(body))
    console.log('📦 Report data keys:', body.reportData ? Object.keys(body.reportData) : 'No reportData')
    console.log('📦 Items in reportData:', body.reportData?.items?.length || 'No items')
    console.log('📦 First item sample:', body.reportData?.items?.[0] || 'No first item')
    console.log('📦 Organization name:', body.organizationName)
    console.log('📦 Report date:', body.reportDate)
    
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
