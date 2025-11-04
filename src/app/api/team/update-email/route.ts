import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, newEmail, userName } = await request.json()

    if (!userId || !newEmail) {
      return NextResponse.json(
        { error: 'Missing userId or newEmail' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email is already in use
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const emailInUse = existingUser.users.some(
      (user) => user.email === newEmail && user.id !== userId
    )

    if (emailInUse) {
      return NextResponse.json(
        { error: 'Email is already in use by another account' },
        { status: 400 }
      )
    }

    // Update the user's email in auth.users
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email: newEmail,
        email_confirm: true // Auto-confirm the email
      }
    )

    if (updateError) {
      console.error('Error updating user email:', updateError)
      return NextResponse.json(
        { error: 'Failed to update email' },
        { status: 500 }
      )
    }

    // Send password reset email so they can set their password
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      newEmail,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/reset-password`
      }
    )

    if (resetError) {
      console.error('Error sending password reset email:', resetError)
      // Don't fail the request if email fails - user is still updated
      return NextResponse.json({
        success: true,
        emailSent: false,
        message: 'Email updated but failed to send setup link'
      })
    }

    return NextResponse.json({
      success: true,
      emailSent: true,
      message: `Password setup email sent to ${newEmail}`
    })

  } catch (error) {
    console.error('Error in update-email API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
