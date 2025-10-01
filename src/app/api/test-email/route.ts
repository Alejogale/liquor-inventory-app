import { NextRequest, NextResponse } from 'next/server'
import { 
  sendWelcomeEmail, 
  sendEmailVerificationEmail, 
  sendPasswordResetEmail,
  sendTeamInvitationEmail 
} from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { emailType, to, ...params } = await request.json()

    if (!emailType || !to) {
      return NextResponse.json(
        { error: 'emailType and to are required' },
        { status: 400 }
      )
    }

    let result

    switch (emailType) {
      case 'welcome':
        result = await sendWelcomeEmail({
          to,
          userName: params.userName || 'Test User',
          loginUrl: params.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL}/login`
        })
        break

      case 'verification':
        result = await sendEmailVerificationEmail({
          to,
          userName: params.userName || 'Test User',
          verificationUrl: params.verificationUrl || `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=test123`,
          expirationTime: params.expirationTime || '24 hours'
        })
        break

      case 'password-reset':
        // Password reset is handled by Supabase Auth directly
        // Use supabase.auth.resetPasswordForEmail() in your frontend
        return NextResponse.json({
          success: false,
          message: 'Password reset is handled by Supabase Auth. Use supabase.auth.resetPasswordForEmail() instead.',
          info: 'This ensures proper security with Supabase tokens and email delivery.'
        }, { status: 400 })

      case 'team-invitation':
        result = await sendTeamInvitationEmail({
          to,
          inviterName: params.inviterName || 'Test Inviter',
          organizationName: params.organizationName || 'Test Restaurant',
          role: params.role || 'manager',
          inviteUrl: params.inviteUrl || `${process.env.NEXT_PUBLIC_APP_URL}/invite/test123`,
          customMessage: params.customMessage || 'Welcome to our team! We look forward to working with you.'
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid emailType. Use: welcome, verification, or team-invitation. Note: password-reset is handled by Supabase Auth.' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${emailType} email sent successfully`,
        data: result.data
      })
    } else {
      return NextResponse.json(
        { error: `Failed to send ${emailType} email`, details: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Test email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}