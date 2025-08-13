interface InvitationEmailData {
  organizationName: string
  inviterName: string
  role: string
  inviteUrl: string
  customMessage?: string
  expiresAt: string
  isReminder?: boolean
}

export function generateInvitationEmail(data: InvitationEmailData): { subject: string; html: string; text: string } {
  const { organizationName, inviterName, role, inviteUrl, customMessage, expiresAt, isReminder } = data
  
  const subject = isReminder 
    ? `Reminder: Invitation to join ${organizationName}`
    : `You're invited to join ${organizationName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f9fafb;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%);
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          color: white;
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
        }
        .content h2 {
          color: #1f2937;
          margin: 0 0 20px 0;
          font-size: 24px;
        }
        .content p {
          color: #6b7280;
          margin: 0 0 16px 0;
          font-size: 16px;
        }
        .organization-card {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .organization-card h3 {
          color: #1f2937;
          margin: 0 0 8px 0;
          font-size: 18px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #6b7280;
          font-size: 14px;
        }
        .detail-value {
          color: #1f2937;
          font-weight: 500;
          font-size: 14px;
        }
        .custom-message {
          background: #fffaf0;
          border: 1px solid #f6e05e;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-style: italic;
          color: #92400e;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #d69e2e 0%, #b7791f 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          margin: 24px 0;
          box-shadow: 0 4px 12px rgba(214, 158, 46, 0.25);
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-1px);
        }
        .footer {
          background: #f9fafb;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .footer a {
          color: #1a365d;
          text-decoration: none;
        }
        .reminder-notice {
          background: #fffaf0;
          border: 1px solid #f6e05e;
          border-radius: 8px;
          padding: 12px 16px;
          margin: 16px 0;
          font-size: 14px;
          color: #92400e;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Hospitality Hub</h1>
        </div>
        
        <div class="content">
          ${isReminder ? '<div class="reminder-notice">⏰ This is a reminder - your invitation expires soon!</div>' : ''}
          
          <h2>You're invited to join a team!</h2>
          
          <p>Hello!</p>
          
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Hospitality Hub as a <strong>${role}</strong>.</p>
          
          <div class="organization-card">
            <h3>Team Details</h3>
            <div class="detail-row">
              <span class="detail-label">Organization:</span>
              <span class="detail-value">${organizationName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Your Role:</span>
              <span class="detail-value">${role}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Invited by:</span>
              <span class="detail-value">${inviterName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expires:</span>
              <span class="detail-value">${expiresAt}</span>
            </div>
          </div>
          
          ${customMessage ? `
            <div class="custom-message">
              <strong>Personal message:</strong><br>
              "${customMessage}"
            </div>
          ` : ''}
          
          <p>Click the button below to accept this invitation and join the team:</p>
          
          <div style="text-align: center;">
            <a href="${inviteUrl}" class="cta-button">Accept Invitation</a>
          </div>
          
          <p><strong>What is Hospitality Hub?</strong></p>
          <p>Hospitality Hub is a comprehensive management platform designed specifically for hospitality businesses. It includes tools for inventory management, reservations, member databases, and more.</p>
          
          <p style="font-size: 14px; color: #9ca3af;">
            This invitation will expire on ${expiresAt}. If you don't have an account, you'll be guided through the signup process when you click the link above.
          </p>
        </div>
        
        <div class="footer">
          <p>
            Can't click the button? Copy and paste this link: <br>
            <a href="${inviteUrl}">${inviteUrl}</a>
          </p>
          <p style="margin-top: 16px;">
            This email was sent by Hospitality Hub. If you received this in error, you can safely ignore it.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
${subject}

Hello!

${inviterName} has invited you to join ${organizationName} on Hospitality Hub as a ${role}.

Team Details:
- Organization: ${organizationName}
- Your Role: ${role}
- Invited by: ${inviterName}
- Expires: ${expiresAt}

${customMessage ? `Personal message: "${customMessage}"` : ''}

To accept this invitation, visit: ${inviteUrl}

What is Hospitality Hub?
Hospitality Hub is a comprehensive management platform designed specifically for hospitality businesses. It includes tools for inventory management, reservations, member databases, and more.

This invitation will expire on ${expiresAt}. If you don't have an account, you'll be guided through the signup process when you click the link above.

---
This email was sent by Hospitality Hub. If you received this in error, you can safely ignore it.
  `

  return { subject, html, text }
}