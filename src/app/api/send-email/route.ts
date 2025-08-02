import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()
    
    // For demo purposes, we'll simulate email sending
    // In production, you'd integrate with SendGrid, Mailgun, or similar
    
    console.log('📧 Email would be sent to:', to)
    console.log('Subject:', subject)
    console.log('HTML content length:', html.length)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For now, return success (in production, integrate real email service)
    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      demo: true
    })
    
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    )
  }
}
