import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPasswordResetEmail } from '@/lib/email-service'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if user exists
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500, headers: corsHeaders }
      )
    }

    const user = existingUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase())

    // For security, don't reveal if user exists or not
    // But still try to generate a link if user exists
    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      }, { headers: corsHeaders })
    }

    // Get user's name from profile or metadata
    let userName = 'User'
    try {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        userName = profile.full_name.split(' ')[0] // Use first name
      } else if (user.user_metadata?.first_name) {
        userName = user.user_metadata.first_name
      }
    } catch (e) {
      // Use default name if profile lookup fails
    }

    // Generate password reset link using Supabase admin API
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://invyeasy.com/reset-password'
      : `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    })

    if (linkError) {
      console.error('Error generating reset link:', linkError)
      return NextResponse.json(
        { error: 'Failed to generate password reset link' },
        { status: 500, headers: corsHeaders }
      )
    }

    if (!linkData?.properties?.action_link) {
      console.error('No action link in response')
      return NextResponse.json(
        { error: 'Failed to generate password reset link' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Send password reset email via Resend
    const emailResult = await sendPasswordResetEmail({
      to: email,
      userName: userName,
      resetUrl: linkData.properties.action_link,
      expirationTime: '1 hour'
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('Password reset email sent successfully to:', email)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Forgot password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
