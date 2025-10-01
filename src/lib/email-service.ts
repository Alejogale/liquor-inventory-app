import { Resend } from 'resend'

// Initialize Resend only on server side
let resend: Resend | null = null

if (typeof window === 'undefined') {
  // Server side only
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey && apiKey !== 'your_resend_api_key_here') {
    resend = new Resend(apiKey)
  } else {
    console.warn('Resend API key not configured. Email functionality will be disabled.')
  }
}

// Email Design System - InvyEasy Brand Colors
const EMAIL_DESIGN_SYSTEM = {
  colors: {
    primary: '#f97316', // InvyEasy Orange
    secondary: '#dc2626', // InvyEasy Red
    accent: '#f59e0b', // Amber
    success: '#10b981', // Green
    warning: '#f59e0b', // Amber
    error: '#ef4444', // Red
    background: '#fef2f2', // Light orange/red tint
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
          background: linear-gradient(135deg, ${EMAIL_DESIGN_SYSTEM.colors.primary}, ${EMAIL_DESIGN_SYSTEM.colors.secondary});
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
          <h1>📦 InvyEasy</h1>
          ${appName ? `<div class="subtitle">${appName}</div>` : ''}
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© 2024 InvyEasy. Made with ❤️ for inventory management excellence.</p>
          <p>This email was sent from your InvyEasy account.</p>
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
      from: 'InvyEasy <noreply@invyeasy.com>',
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
      from: 'InvyEasy <noreply@invyeasy.com>',
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
    <h2>You're Invited to Join ${organizationName}! 🎉</h2>
    <p>Hello,</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on InvyEasy.</p>
    
    <div class="card">
      <h3>📋 Invitation Details</h3>
      <p><strong>Organization:</strong> ${organizationName}</p>
      <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
      <p><strong>Invited by:</strong> ${inviterName}</p>
    </div>

    ${customMessage ? `
      <div class="card">
        <h3>💬 Personal Message</h3>
        <p style="font-style: italic; color: ${EMAIL_DESIGN_SYSTEM.colors.textLight};">"${customMessage}"</p>
      </div>
    ` : ''}

    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </div>

    <div class="card">
      <h3>🚀 What is InvyEasy?</h3>
      <p>InvyEasy is a comprehensive inventory management platform designed specifically for the liquor and hospitality industry. With InvyEasy, you can:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>📊 Track Inventory:</strong> Monitor stock levels in real-time</li>
        <li><strong>📱 Easy Data Import:</strong> Use our Excel templates for quick setup</li>
        <li><strong>🔔 Smart Alerts:</strong> Get notified when items are running low</li>
        <li><strong>👥 Team Collaboration:</strong> Work together with role-based permissions</li>
        <li><strong>📈 Generate Reports:</strong> Get insights into your inventory performance</li>
      </ul>
    </div>
    
    <div class="alert alert-warning">
      <strong>⏰ Important:</strong> This invitation will expire in 7 days. If you have any questions, please contact ${inviterName} or reach out to our support team at <a href="mailto:invyeasy@gmail.com" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary};">invyeasy@gmail.com</a>.
    </div>
  `

  const html = createBaseEmailTemplate(content, 'Team Management')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'InvyEasy <noreply@invyeasy.com>',
      to: [to],
      subject: `You're invited to join ${organizationName} on InvyEasy! 🎉`,
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
      from: 'InvyEasy <noreply@invyeasy.com>',
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
      from: 'InvyEasy <noreply@invyeasy.com>',
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
      from: 'InvyEasy <noreply@invyeasy.com>',
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
      from: 'InvyEasy <noreply@invyeasy.com>',
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

// Authentication Email Templates for InvyEasy

// Welcome Email for New Users
export async function sendWelcomeEmail({
  to,
  userName,
  loginUrl
}: {
  to: string
  userName: string
  loginUrl?: string
}) {
  const content = `
    <h2>Welcome to InvyEasy! 🎉</h2>
    <p>Hello ${userName},</p>
    <p>Welcome to <strong>InvyEasy</strong> - your all-in-one inventory management solution for the liquor and hospitality industry!</p>
    
    <div class="card">
      <h3>🚀 Get Started with InvyEasy</h3>
      <p>Your account is now active and ready to use. Here's what you can do:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>📊 Track Inventory:</strong> Monitor your stock levels in real-time</li>
        <li><strong>📱 Use Templates:</strong> Download our Excel template for easy data import</li>
        <li><strong>🔄 Set Thresholds:</strong> Get alerts when items are running low</li>
        <li><strong>👥 Invite Team:</strong> Collaborate with your staff and managers</li>
        <li><strong>📈 Generate Reports:</strong> Get insights into your inventory performance</li>
      </ul>
    </div>

    <div class="alert alert-success">
      <strong>💡 Pro Tip:</strong> Start by downloading our inventory template and uploading your current stock data. 
      This will get you up and running in minutes!
    </div>

    ${loginUrl ? `
      <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
        <a href="${loginUrl}" class="button">Access Your Dashboard</a>
      </div>
    ` : ''}

    <div class="card">
      <h3>🆘 Need Help?</h3>
      <p>We're here to help you succeed! Here are some resources:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary};">Contact Support</a></li>
        <li><a href="${process.env.NEXT_PUBLIC_APP_URL}/inventory-conversion" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary};">Professional Data Conversion Service</a></li>
        <li>Email us directly: <a href="mailto:invyeasy@gmail.com" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary};">invyeasy@gmail.com</a></li>
      </ul>
    </div>

    <p>Thank you for choosing InvyEasy. We're excited to help you streamline your inventory management!</p>
  `

  const html = createBaseEmailTemplate(content, 'Welcome')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'InvyEasy <noreply@invyeasy.com>',
      to: [to],
      subject: 'Welcome to InvyEasy - Your Inventory Management Journey Starts Here! 🎉',
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}

// Email Verification Template
export async function sendEmailVerificationEmail({
  to,
  userName,
  verificationUrl,
  expirationTime = '24 hours'
}: {
  to: string
  userName: string
  verificationUrl: string
  expirationTime?: string
}) {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hello ${userName},</p>
    <p>Thank you for signing up for <strong>InvyEasy</strong>! To complete your account setup, please verify your email address.</p>
    
    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>

    <div class="card">
      <h3>Why do we need to verify your email?</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Security:</strong> Protect your account from unauthorized access</li>
        <li><strong>Updates:</strong> Receive important notifications about your inventory</li>
        <li><strong>Support:</strong> Ensure we can reach you if you need help</li>
      </ul>
    </div>

    <div class="alert alert-warning">
      <strong>⏰ Important:</strong> This verification link will expire in ${expirationTime}. 
      If you don't verify within this time, you'll need to request a new verification email.
    </div>

    <p>If you didn't create an account with InvyEasy, please ignore this email.</p>
    
    <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: ${EMAIL_DESIGN_SYSTEM.colors.primary}; font-family: monospace; font-size: 12px;">
      ${verificationUrl}
    </p>
  `

  const html = createBaseEmailTemplate(content, 'Email Verification')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'InvyEasy <noreply@invyeasy.com>',
      to: [to],
      subject: 'Verify Your InvyEasy Account - Action Required',
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending email verification:', error)
    return { success: false, error }
  }
}

// Password Reset Email Template
export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
  expirationTime = '1 hour'
}: {
  to: string
  userName: string
  resetUrl: string
  expirationTime?: string
}) {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello ${userName},</p>
    <p>We received a request to reset the password for your <strong>InvyEasy</strong> account.</p>
    
    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>

    <div class="alert alert-warning">
      <strong>⏰ Time Sensitive:</strong> This password reset link will expire in ${expirationTime} for security reasons.
    </div>

    <div class="card">
      <h3>🔒 Security Tips</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li>Choose a strong password with at least 8 characters</li>
        <li>Include a mix of letters, numbers, and special characters</li>
        <li>Don't reuse passwords from other accounts</li>
        <li>Consider using a password manager</li>
      </ul>
    </div>

    <div class="alert alert-error">
      <strong>⚠️ Didn't request this?</strong> If you didn't request a password reset, 
      please ignore this email. Your account remains secure.
    </div>
    
    <p><strong>Can't click the button?</strong> Copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: ${EMAIL_DESIGN_SYSTEM.colors.primary}; font-family: monospace; font-size: 12px;">
      ${resetUrl}
    </p>

    <p>If you're having trouble accessing your account, contact our support team at 
    <a href="mailto:invyeasy@gmail.com" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary};">invyeasy@gmail.com</a></p>
  `

  const html = createBaseEmailTemplate(content, 'Password Reset')

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'InvyEasy <noreply@invyeasy.com>',
      to: [to],
      subject: 'Reset Your InvyEasy Password - Action Required',
      html: html
    })
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return { success: false, error }
  }
}
