import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple email test started')
    
    // Check if API key is available
    const apiKey = process.env.RESEND_API_KEY
    console.log('🔑 API Key present:', !!apiKey)
    console.log('🔑 API Key starts with:', apiKey?.substring(0, 5))
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 500 })
    }

    // Initialize Resend
    const resend = new Resend(apiKey)
    console.log('✅ Resend initialized')

    // Try to send a simple test email
    const result = await resend.emails.send({
      from: 'InvyEasy <hello@invyeasy.com>',
      to: ['alejogaleis@gmail.com'],
      subject: 'Simple Test Email',
      html: '<h1>Test Email</h1><p>This is a simple test email to verify Resend is working.</p>'
    })

    console.log('📧 Resend result:', result)
    
    return NextResponse.json({ 
      success: true, 
      result,
      apiKeyPresent: !!apiKey,
      apiKeyPrefix: apiKey?.substring(0, 10)
    })

  } catch (error) {
    console.error('💥 Simple email test error:', error)
    console.error('💥 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
  }
}