import { Resend } from 'resend'

// Initialize Resend only on server side
let resend: Resend | null = null

if (typeof window === 'undefined') {
  // Server side only
  resend = new Resend(process.env.RESEND_API_KEY)
}

// Email Design System - Consistent across all apps
const EMAIL_DESIGN_SYSTEM = {
  colors: {
    primary: '#1e40af', // Blue
    secondary: '#64748b', // Gray
    accent: '#f59e0b', // Amber
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    background: '#f8fafc', // Light gray
    white: '#ffffff',
    text: '#1e293b', // Dark gray
    textLight: '#64748b' // Light gray
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px'
  },
  borderRadius: '8px',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
}

// Base email template with consistent design
function createBaseEmailTemplate(content: string, appName?: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${appName || 'Hospitality Hub'} - Notification</title>
      <style>
        body {
          font-family: ${EMAIL_DESIGN_SYSTEM.fonts.primary};
          line-height: 1.6;
          color: ${EMAIL_DESIGN_SYSTEM.colors.text};
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.background};
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.white};
          border-radius: ${EMAIL_DESIGN_SYSTEM.borderRadius};
          overflow: hidden;
          box-shadow: ${EMAIL_DESIGN_SYSTEM.shadow};
        }
        .header {
          background: linear-gradient(135deg, ${EMAIL_DESIGN_SYSTEM.colors.primary}, #3b82f6);
          color: ${EMAIL_DESIGN_SYSTEM.colors.white};
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.xlarge};
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          font-family: ${EMAIL_DESIGN_SYSTEM.fonts.heading};
        }
        .header .subtitle {
          margin: ${EMAIL_DESIGN_SYSTEM.spacing.small} 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content {
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.xlarge};
        }
        .footer {
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.background};
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.large};
          text-align: center;
          font-size: 12px;
          color: ${EMAIL_DESIGN_SYSTEM.colors.textLight};
        }
        .button {
          display: inline-block;
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.primary};
          color: ${EMAIL_DESIGN_SYSTEM.colors.white};
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.medium} ${EMAIL_DESIGN_SYSTEM.spacing.large};
          text-decoration: none;
          border-radius: ${EMAIL_DESIGN_SYSTEM.borderRadius};
          font-weight: 600;
          margin: ${EMAIL_DESIGN_SYSTEM.spacing.medium} 0;
        }
        .card {
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.white};
          border: 1px solid #e2e8f0;
          border-radius: ${EMAIL_DESIGN_SYSTEM.borderRadius};
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.large};
          margin: ${EMAIL_DESIGN_SYSTEM.spacing.medium} 0;
        }
        .stat {
          display: inline-block;
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.background};
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.medium};
          border-radius: ${EMAIL_DESIGN_SYSTEM.borderRadius};
          margin: ${EMAIL_DESIGN_SYSTEM.spacing.small};
          text-align: center;
          min-width: 100px;
        }
        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: ${EMAIL_DESIGN_SYSTEM.colors.primary};
          display: block;
        }
        .stat-label {
          font-size: 12px;
          color: ${EMAIL_DESIGN_SYSTEM.colors.textLight};
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: ${EMAIL_DESIGN_SYSTEM.spacing.medium} 0;
        }
        .table th {
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.primary};
          color: ${EMAIL_DESIGN_SYSTEM.colors.white};
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.medium};
          text-align: left;
          font-weight: 600;
        }
        .table td {
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.medium};
          border-bottom: 1px solid #e2e8f0;
        }
        .table tr:nth-child(even) {
          background-color: ${EMAIL_DESIGN_SYSTEM.colors.background};
        }
        .alert {
          padding: ${EMAIL_DESIGN_SYSTEM.spacing.medium};
          border-radius: ${EMAIL_DESIGN_SYSTEM.borderRadius};
          margin: ${EMAIL_DESIGN_SYSTEM.spacing.medium} 0;
        }
        .alert-success {
          background-color: #d1fae5;
          border: 1px solid #a7f3d0;
          color: #065f46;
        }
        .alert-warning {
          background-color: #fef3c7;
          border: 1px solid #fde68a;
          color: #92400e;
        }
        .alert-error {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: ${EMAIL_DESIGN_SYSTEM.spacing.large};
          }
          .header {
            padding: ${EMAIL_DESIGN_SYSTEM.spacing.large};
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Hospitality Hub</h1>
          ${appName ? `<div class="subtitle">${appName}</div>` : ''}
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 Hospitality Hub. Made with ❤️ for the hospitality industry.</p>
          <p>This email was sent from your Hospitality Hub account.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Guest Manager Email Templates
export async function sendGuestReportEmail({
  to,
  clubName,
  clubLocation,
  contactPerson,
  guestData,
  totalGuests,
  totalRevenue,
  reportDate
}: {
  to: string
  clubName: string
  clubLocation: string
  contactPerson: string
  guestData: any[]
  totalGuests: number
  totalRevenue: number
  reportDate: string
}) {
  const guestRows = guestData.map(guest => `
    <tr>
      <td>${guest.guest_name}</td>
      <td>${guest.member_number}</td>
      <td>${new Date(guest.visit_date).toLocaleDateString()}</td>
      <td>$${guest.total_amount?.toFixed(2) || '0.00'}</td>
      <td>${guest.status}</td>
    </tr>
  `).join('')

  const content = `
    <h2>Guest Report - ${clubName}</h2>
    <p>Hello ${contactPerson},</p>
    <p>Here's your guest report for <strong>${clubName}</strong> as of ${reportDate}.</p>
    
    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <div class="stat">
        <span class="stat-number">${totalGuests}</span>
        <span class="stat-label">Total Guests</span>
      </div>
      <div class="stat">
        <span class="stat-number">$${totalRevenue.toFixed(2)}</span>
        <span class="stat-label">Total Revenue</span>
      </div>
    </div>

    <div class="card">
      <h3>Guest Details</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Member #</th>
            <th>Visit Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${guestRows}
        </tbody>
      </table>
    </div>

    <p>For detailed purchase information or questions, please contact the management team.</p>
  `

  const html = createBaseEmailTemplate(content, 'Guest Manager')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: `Guest Report - ${clubName} - ${reportDate}`,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending guest report email:', error)
    return { success: false, error }
  }
}

// Inventory Email Templates
export async function sendLowStockAlertEmail({
  to,
  organizationName,
  lowStockItems,
  totalItems
}: {
  to: string
  organizationName: string
  lowStockItems: any[]
  totalItems: number
}) {
  const itemRows = lowStockItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.brand || 'N/A'}</td>
      <td>${item.current_stock}</td>
      <td>${item.threshold}</td>
      <td>${item.category?.name || 'N/A'}</td>
    </tr>
  `).join('')

  const content = `
    <h2>Low Stock Alert</h2>
    <p>Hello,</p>
    <p>This is an automated alert from your <strong>${organizationName}</strong> inventory system.</p>
    
    <div class="alert alert-warning">
      <strong>⚠️ Low Stock Alert:</strong> ${totalItems} item(s) are running low on stock and need to be reordered.
    </div>

    <div class="card">
      <h3>Items Requiring Attention</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Brand</th>
            <th>Current Stock</th>
            <th>Threshold</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <p>Please review these items and place orders as needed to maintain proper stock levels.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?tab=inventory" class="button">View Inventory</a>
  `

  const html = createBaseEmailTemplate(content, 'Inventory Management')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: `Low Stock Alert - ${organizationName}`,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending low stock alert email:', error)
    return { success: false, error }
  }
}

// Team Invitation Email Template
export async function sendTeamInvitationEmail({
  to,
  inviterName,
  organizationName,
  role,
  inviteUrl,
  customMessage
}: {
  to: string
  inviterName: string
  organizationName: string
  role: string
  inviteUrl: string
  customMessage?: string
}) {
  const content = `
    <h2>You're Invited!</h2>
    <p>Hello,</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Hospitality Hub.</p>
    
    <div class="card">
      <h3>Invitation Details</h3>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
      <p><strong>Invited by:</strong> ${inviterName}</p>
    </div>

    ${customMessage ? `
      <div class="card">
        <h3>Personal Message</h3>
        <p><em>"${customMessage}"</em></p>
      </div>
    ` : ''}

    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </div>

    <p>Hospitality Hub is a comprehensive platform designed specifically for hospitality businesses to manage inventory, reservations, customer relationships, and more - all in one place.</p>
    
    <div class="alert alert-success">
      <strong>Note:</strong> This invitation will expire in 7 days. If you have any questions, please contact ${inviterName}.
    </div>
  `

  const html = createBaseEmailTemplate(content, 'Team Management')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: `You're invited to join ${organizationName} on Hospitality Hub`,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending team invitation email:', error)
    return { success: false, error }
  }
}

// Reservation Confirmation Email Template
export async function sendReservationConfirmationEmail({
  to,
  guestName,
  reservationDate,
  roomName,
  organizationName,
  confirmationNumber
}: {
  to: string
  guestName: string
  reservationDate: string
  roomName: string
  organizationName: string
  confirmationNumber: string
}) {
  const content = `
    <h2>Reservation Confirmed</h2>
    <p>Hello ${guestName},</p>
    <p>Your reservation has been confirmed at <strong>${organizationName}</strong>.</p>
    
    <div class="card">
      <h3>Reservation Details</h3>
      <p><strong>Confirmation #:</strong> ${confirmationNumber}</p>
      <p><strong>Date:</strong> ${reservationDate}</p>
      <p><strong>Room:</strong> ${roomName}</p>
      <p><strong>Organization:</strong> ${organizationName}</p>
    </div>

    <div class="alert alert-success">
      <strong>✅ Confirmed!</strong> Your reservation is confirmed and ready for your visit.
    </div>

    <p>If you need to make any changes to your reservation, please contact us as soon as possible.</p>
    
    <p>We look forward to serving you!</p>
  `

  const html = createBaseEmailTemplate(content, 'Reservation System')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: `Reservation Confirmed - ${organizationName}`,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error)
    return { success: false, error }
  }
}

// Billing/Invoice Email Template
export async function sendInvoiceEmail({
  to,
  organizationName,
  invoiceNumber,
  amount,
  dueDate,
  invoiceUrl
}: {
  to: string
  organizationName: string
  invoiceNumber: string
  amount: number
  dueDate: string
  invoiceUrl: string
}) {
  const content = `
    <h2>Invoice Available</h2>
    <p>Hello,</p>
    <p>Your invoice from <strong>${organizationName}</strong> is now available.</p>
    
    <div class="card">
      <h3>Invoice Details</h3>
      <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
      <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Organization:</strong> ${organizationName}</p>
    </div>

    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <a href="${invoiceUrl}" class="button">View Invoice</a>
    </div>

    <div class="alert alert-warning">
      <strong>Payment Due:</strong> Please ensure payment is received by ${dueDate}.
    </div>

    <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
  `

  const html = createBaseEmailTemplate(content, 'Billing')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: `Invoice #${invoiceNumber} - ${organizationName}`,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending invoice email:', error)
    return { success: false, error }
  }
}

// Order report email for inventory management
export async function sendOrderReport({
  to,
  organizationName,
  reportData,
  reportDate,
  reportUrl
}: {
  to: string
  organizationName: string
  reportData: any
  reportDate: string
  reportUrl?: string
}) {
  const content = `
    <h2>Order Report</h2>
    <p>Hello,</p>
    <p>Your order report from <strong>${organizationName}</strong> is now available.</p>
    
    <div class="card">
      <h3>Report Summary</h3>
      <p><strong>Report Date:</strong> ${reportDate}</p>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Total Items:</strong> ${reportData.totalItems || 0}</p>
      <p><strong>Total Value:</strong> $${(reportData.totalValue || 0).toFixed(2)}</p>
    </div>

    ${reportUrl ? `
      <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
        <a href="${reportUrl}" class="button">View Full Report</a>
      </div>
    ` : ''}

    <p>If you have any questions about this report, please don't hesitate to contact us.</p>
  `

  const html = createBaseEmailTemplate(content, 'Inventory Management')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: `Order Report - ${organizationName} - ${reportDate}`,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending order report email:', error)
    return { success: false, error }
  }
}

// Generic notification email for any app
export async function sendNotificationEmail({
  to,
  subject,
  title,
  message,
  appName,
  actionUrl,
  actionText
}: {
  to: string
  subject: string
  title: string
  message: string
  appName?: string
  actionUrl?: string
  actionText?: string
}) {
  const content = `
    <h2>${title}</h2>
    <p>${message}</p>
    
    ${actionUrl && actionText ? `
      <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
        <a href="${actionUrl}" class="button">${actionText}</a>
      </div>
    ` : ''}
  `

  const html = createBaseEmailTemplate(content, appName)

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'Hospitality Hub <noreply@yourdomain.com>',
      to: [to],
      subject: subject,
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending notification email:', error)
    return { success: false, error }
  }
}
