import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Debug environment variables
    const envDebug = {
      nodeEnv: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
      resendKeyStart: process.env.RESEND_API_KEY?.substring(0, 5) || 'none',
      resendKeyEnd: process.env.RESEND_API_KEY?.substring(-4) || 'none',
      isServerSide: typeof window === 'undefined',
      allResendVars: Object.keys(process.env).filter(key => key.startsWith('RESEND')),
      timestamp: new Date().toISOString()
    }

    console.log('🔍 Environment Debug:', envDebug)

    return NextResponse.json({ 
      success: true, 
      env: envDebug 
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}