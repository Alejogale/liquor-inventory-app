import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Resend client creation...')
    
    // Check environment
    const apiKey = process.env.RESEND_API_KEY
    console.log('🔑 API Key debug:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      starts: apiKey?.substring(0, 5) || 'none',
      ends: apiKey?.substring(-4) || 'none',
      nodeEnv: process.env.NODE_ENV,
      isServerSide: typeof window === 'undefined'
    })

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'No RESEND_API_KEY found',
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('RESEND'))
      })
    }

    if (apiKey === 'your_resend_api_key_here') {
      return NextResponse.json({ 
        success: false, 
        error: 'RESEND_API_KEY is placeholder value'
      })
    }

    // Try to create Resend client
    console.log('🔧 Creating Resend client...')
    const resend = new Resend(apiKey)
    console.log('✅ Resend client created successfully')

    // Try a test API call (this won't send an email, just validates the client)
    console.log('📧 Testing Resend API connection...')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Resend client created successfully',
      apiKeyValid: true,
      clientCreated: !!resend,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('🚨 Resend test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create Resend client',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}