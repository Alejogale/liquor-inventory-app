import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, to, subject, html, data } = body
    
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: to' },
        { status: 400 }
      )
    }

    let emailSubject = subject
    let emailHtml = html

    if (type === 'team_invitation') {
      // Generate team invitation email
      const { organization_name, inviter_name, role, app_access = [], custom_message, invitation_id } = data || {}
      
      emailSubject = `You're invited to join ${organization_name} on Hospitality Hub`
      emailHtml = generateInvitationEmailHtml({
        organizationName: organization_name,
        inviterName: inviter_name,
        role,
        appAccess: app_access,
        customMessage: custom_message,
        invitationId: invitation_id
      })
    }
    
    // For demo purposes, we'll simulate email sending
    // In production, you'd integrate with SendGrid, Mailgun, or similar
    
    console.log('📧 Email would be sent to:', to)
    console.log('Subject:', emailSubject)
    console.log('Email type:', type || 'standard')
    if (type === 'team_invitation') {
      console.log('Organization:', data?.organization_name)
      console.log('Role:', data?.role)
      console.log('App Access:', data?.app_access)
    }
    
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

function generateInvitationEmailHtml({
  organizationName,
  inviterName,
  role,
  appAccess,
  customMessage,
  invitationId
}: {
  organizationName: string
  inviterName: string
  role: string
  appAccess: string[]
  customMessage?: string
  invitationId: string
}) {
  const appNames = {
    'liquor-inventory': 'Liquor Inventory',
    'reservation-management': 'Reservation System',
    'member-database': 'Member Database',
    'pos-system': 'POS System'
  }

  const accessList = appAccess.map(appId => appNames[appId as keyof typeof appNames] || appId).join(', ')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Team Invitation - Hospitality Hub</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
        .footer { background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; font-size: 14px; color: #64748b; }
        .btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .app-list { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .role-badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 You're Invited!</h1>
          <p>Join ${organizationName} on Hospitality Hub</p>
        </div>
        
        <div class="content">
          <p>Hi there!</p>
          
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Hospitality Hub as a <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1)}</span>.</p>
          
          ${customMessage ? `
            <div style="background: #fefce8; border-left: 4px solid #facc15; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-style: italic;">"${customMessage}"</p>
            </div>
          ` : ''}
          
          <p>You'll have access to the following apps:</p>
          <div class="app-list">
            <strong>📱 Your App Access:</strong><br>
            ${accessList || 'No specific app access granted yet'}
          </div>
          
          <p>Hospitality Hub is a comprehensive platform designed specifically for hospitality businesses to manage inventory, reservations, customer relationships, and more - all in one place.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${invitationId}" class="btn">
              Accept Invitation
            </a>
          </div>
          
          <p style="font-size: 14px; color: #64748b;">This invitation will expire in 7 days. If you have any questions, please contact ${inviterName} or reply to this email.</p>
        </div>
        
        <div class="footer">
          <p>© 2024 Hospitality Hub. Made with ❤️ for the hospitality industry.</p>
          <p style="font-size: 12px;">If you don't want to receive these emails, you can safely ignore this invitation.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
