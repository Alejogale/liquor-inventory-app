import { Resend } from 'resend'

// Initialize Resend - will be created when needed
function getResendClient(): Resend | null {
  if (typeof window !== 'undefined') {
    console.warn('❌ Attempted to use Resend on client side')
    return null
  }
  
  const apiKey = process.env.RESEND_API_KEY
  console.log('🔑 API Key check:', {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    starts: apiKey?.substring(0, 5) || 'none',
    env: process.env.NODE_ENV
  })
  
  // List all environment variables that start with RESEND for debugging
  const resendEnvVars = Object.keys(process.env).filter(key => key.startsWith('RESEND'))
  console.log('🔑 Resend env vars found:', resendEnvVars)
  
  if (!apiKey || apiKey === 'your_resend_api_key_here') {
    console.warn('❌ Resend API key not configured properly')
    console.warn('Available env vars:', Object.keys(process.env).slice(0, 10))
    return null
  }
  
  try {
    const client = new Resend(apiKey)
    console.log('✅ Resend client created successfully')
    return client
  } catch (error) {
    console.error('❌ Failed to create Resend client:', error)
    return null
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

// CSV generation function for inventory data
function generateInventoryCSV(reportData: any): string {
  console.log('📊 Generating CSV for reportData:', Object.keys(reportData || {}))
  console.log('📊 Items count:', reportData?.items?.length || 0)
  
  const headers = [
    'Item Brand',
    'Category',
    'Current Stock',
    'Threshold',
    'Par Level',
    'Unit Price',
    'Total Value',
    'Supplier',
    'Barcode',
    'Room Locations'
  ]
  
  const csvRows = [headers.join(',')]
  
  if (reportData.items && Array.isArray(reportData.items)) {
    console.log('📊 Processing', reportData.items.length, 'items for CSV')
    reportData.items.forEach((item: any, index: number) => {
      try {
        const roomLocations = item.rooms_with_stock && Array.isArray(item.rooms_with_stock) 
          ? item.rooms_with_stock.map((room: any) => `${room.roomName || room.room_name}(${room.count})`).join('; ')
          : 'No room data'
        
        const row = [
          `"${item.brand || 'Unknown Item'}"`,
          `"${item.category_name || 'N/A'}"`,
          item.current_stock || 0,
          item.threshold || 0,
          item.par_level || 0,
          item.price_per_item ? `$${item.price_per_item.toFixed(2)}` : '$0.00',
          item.total_value ? `$${item.total_value.toFixed(2)}` : '$0.00',
          `"${item.supplier_name || 'No supplier'}"`,
          `"${item.barcode || 'No barcode'}"`,
          `"${roomLocations}"`
        ]
        csvRows.push(row.join(','))
      } catch (itemError) {
        console.error(`💥 Error processing item ${index}:`, itemError)
        console.error('💥 Item data:', item)
      }
    })
  } else {
    console.log('📊 No items found in reportData')
  }
  
  const csvContent = csvRows.join('\n')
  console.log('📊 CSV generated, length:', csvContent.length)
  console.log('📊 CSV preview:', csvContent.substring(0, 200) + '...')
  
  return csvContent
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
  // Generate CSV filename first so it can be used in email template
  const csvFilename = `inventory-report-${organizationName.replace(/[^a-zA-Z0-9]/g, '-')}-${reportDate.replace(/\//g, '-')}.csv`
  
  // Create comprehensive inventory breakdown
  const itemsBreakdown = reportData.items ? reportData.items.map((item: any, index: number) => `
    <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.brand || 'Unknown Item'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.category_name || 'N/A'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        <span style="background-color: ${(item.current_stock || 0) <= (item.threshold || 0) ? '#fee2e2' : '#dcfce7'}; 
                     color: ${(item.current_stock || 0) <= (item.threshold || 0) ? '#991b1b' : '#166534'}; 
                     padding: 4px 8px; border-radius: 4px; font-weight: 600;">
          ${item.current_stock || 0}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.threshold || 0}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.par_level || 0}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">
        ${item.price_per_item ? `$${item.price_per_item.toFixed(2)}` : 'N/A'}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #059669;">
        $${item.total_value ? item.total_value.toFixed(2) : '0.00'}
      </td>
    </tr>
  `).join('') : ''

  // Calculate summary statistics
  const totalItems = reportData.totalItems || reportData.items?.length || 0
  const totalValue = reportData.totalValue || (reportData.items?.reduce((sum: number, item: any) => sum + (item.total_value || 0), 0)) || 0
  const lowStockItems = reportData.items?.filter((item: any) => (item.current_stock || 0) <= (item.threshold || 0)).length || 0
  const categories = reportData.categories || new Set(reportData.items?.map((item: any) => item.category_name)).size || 0

  const content = `
    <h2>📊 Comprehensive Inventory Dashboard Report</h2>
    <p>Hello,</p>
    <p>Your complete inventory dashboard report from <strong>${organizationName}</strong> is ready for review. This comprehensive report includes all inventory data, analysis, and actionable insights.</p>
    
    <!-- Executive Summary -->
    <div class="card">
      <h3>📋 Executive Summary</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 16px 0;">
        <div class="stat">
          <span class="stat-number">${totalItems}</span>
          <span class="stat-label">Total Items</span>
        </div>
        <div class="stat">
          <span class="stat-number">${categories}</span>
          <span class="stat-label">Categories</span>
        </div>
        <div class="stat">
          <span class="stat-number" style="color: ${lowStockItems > 0 ? EMAIL_DESIGN_SYSTEM.colors.error : EMAIL_DESIGN_SYSTEM.colors.success}">${lowStockItems}</span>
          <span class="stat-label">Low Stock Items</span>
        </div>
        <div class="stat">
          <span class="stat-number">$${totalValue.toFixed(2)}</span>
          <span class="stat-label">Total Inventory Value</span>
        </div>
      </div>
      
      <div style="margin-top: 16px;">
        <p><strong>Report Date:</strong> ${reportDate}</p>
        <p><strong>Generated By:</strong> ${reportData.generatedBy || 'System Administrator'}</p>
        <p><strong>Organization:</strong> ${organizationName}</p>
      </div>
    </div>

    <!-- Alert Section -->
    ${lowStockItems > 0 ? `
      <div class="alert alert-warning">
        <strong>⚠️ Action Required:</strong> ${lowStockItems} item(s) are at or below their threshold levels and need immediate attention.
        Review the detailed breakdown below and consider reordering these items.
      </div>
    ` : `
      <div class="alert alert-success">
        <strong>✅ Inventory Status Good:</strong> All items are currently above their threshold levels. 
        Your inventory management is on track!
      </div>
    `}

    <!-- Detailed Inventory Table -->
    ${reportData.items && reportData.items.length > 0 ? `
      <div class="card">
        <h3>📦 Detailed Inventory Breakdown</h3>
        <p style="color: #64748b; margin-bottom: 16px;">Complete overview of all tracked inventory items with current levels, thresholds, and values.</p>
        
        <div style="overflow-x: auto;">
          <table class="table" style="min-width: 800px;">
            <thead>
              <tr>
                <th>Item Brand</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Threshold</th>
                <th>Par Level</th>
                <th>Unit Price</th>
                <th>Total Value</th>
              </tr>
            </thead>
            <tbody>
              ${itemsBreakdown}
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background-color: #f1f5f9; border-radius: 8px;">
          <small style="color: #475569;">
            💡 <strong>Reading this table:</strong> Items with red background in "Current Stock" are below threshold and need reordering.
            Green backgrounds indicate healthy stock levels.
          </small>
        </div>
      </div>
    ` : ''}

    <!-- Key Performance Insights -->
    <div class="card">
      <h3>📈 Key Performance Insights</h3>
      <p>${reportData.summary || 'Complete inventory overview including all tracked items and categories.'}</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h4 style="margin: 0 0 12px 0; color: #1e293b;">📊 What this report tells you:</h4>
        <ul style="text-align: left; padding-left: 20px; margin: 0; line-height: 1.6;">
          <li>📦 <strong>Inventory Health:</strong> Track stock levels across all items and locations</li>
          <li>💰 <strong>Asset Valuation:</strong> Monitor total inventory investment ($${totalValue.toFixed(2)})</li>
          <li>🚨 <strong>Reorder Alerts:</strong> Identify ${lowStockItems} items requiring immediate attention</li>
          <li>📊 <strong>Category Distribution:</strong> Analyze performance across ${categories} different categories</li>
          <li>🎯 <strong>Operational Efficiency:</strong> Make data-driven restocking decisions</li>
        </ul>
      </div>
      
      ${lowStockItems > 0 ? `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h4 style="margin: 0 0 8px 0; color: #92400e;">🎯 Recommended Actions:</h4>
          <ul style="text-align: left; padding-left: 20px; margin: 0; color: #92400e;">
            <li>Review the ${lowStockItems} low-stock items marked in red above</li>
            <li>Contact suppliers for urgent reorders</li>
            <li>Consider adjusting par levels if stock-outs are frequent</li>
            <li>Monitor trends to prevent future shortages</li>
          </ul>
        </div>
      ` : ''}
    </div>

    <!-- Action Buttons -->
    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      ${reportUrl ? `<a href="${reportUrl}" class="button" style="margin-right: 12px;">View Live Dashboard</a>` : ''}
      <a href="${reportUrl ? reportUrl.replace('/dashboard', '/dashboard?tab=reports') : '#'}" class="button" style="background-color: ${EMAIL_DESIGN_SYSTEM.colors.success};">Generate CSV Report</a>
    </div>

    <!-- CSV Attachment Notice -->
    <div class="card" style="background-color: #f0f9ff; border: 1px solid #0ea5e9;">
      <h3 style="color: #0c4a6e;">📎 CSV File Attached</h3>
      <p style="color: #0c4a6e;">A comprehensive CSV file has been attached to this email containing all your inventory data for detailed analysis and record-keeping:</p>
      <ul style="text-align: left; padding-left: 20px; color: #0c4a6e;">
        <li>✅ Complete item details with pricing and stock levels</li>
        <li>✅ Room-by-room breakdown of inventory locations</li>
        <li>✅ Supplier information and contact details</li>
        <li>✅ Reorder recommendations based on thresholds</li>
        <li>✅ Compatible with Excel, Google Sheets, and all inventory systems</li>
      </ul>
      <div style="background-color: #dbeafe; padding: 12px; border-radius: 6px; margin-top: 12px;">
        <p style="color: #1e40af; margin: 0; font-weight: 600;">
          📁 Look for the attached file: <code>${csvFilename}</code>
        </p>
        <p style="color: #1e40af; margin: 4px 0 0 0; font-size: 14px;">
          Simply open with Excel or Google Sheets for instant analysis!
        </p>
      </div>
    </div>

    <!-- Footer with Support -->
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <p style="color: #64748b;">Questions about this report or need assistance with inventory management?</p>
      <p style="margin: 8px 0;">
        <a href="mailto:invyeasy@gmail.com" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary}; text-decoration: none; font-weight: 600;">📧 invyeasy@gmail.com</a> | 
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: ${EMAIL_DESIGN_SYSTEM.colors.primary}; text-decoration: none; font-weight: 600;">🌐 Support Center</a>
      </p>
      <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
        <em>This automated report was generated from your InvyEasy inventory management system. 
        For the most up-to-date information, visit your live dashboard.</em>
      </p>
    </div>
  `

  const html = createBaseEmailTemplate(content, 'Inventory Management')

  try {
    console.log('📧 Email service v2.0 - initializing resend client...')
    console.log('📧 Is server side:', typeof window === 'undefined')
    console.log('📧 Environment variables:', {
      nodeEnv: process.env.NODE_ENV,
      hasResendKey: !!process.env.RESEND_API_KEY,
      keyLength: process.env.RESEND_API_KEY?.length || 0
    })
    
    const resend = getResendClient()
    if (!resend) {
      console.warn('❌ Failed to initialize Resend client')
      return { success: false, error: 'Failed to initialize email service' }
    }
    
    console.log('📧 Generating CSV content...')
    // Generate CSV attachment
    const csvContent = generateInventoryCSV(reportData)
    console.log('📧 CSV content length:', csvContent.length)
    
    console.log('📧 Creating email configuration...')
    const emailConfig = {
      from: 'InvyEasy <noreply@invyeasy.com>',
      to: [to],
      subject: `Comprehensive Inventory Report - ${organizationName} - ${reportDate}`,
      html: html,
      attachments: [{
        filename: csvFilename,
        content: Buffer.from(csvContent, 'utf-8'),
        type: 'text/csv'
      }]
    }
    
    console.log('📧 Email config created, sending with Resend...')
    console.log('📧 Subject:', emailConfig.subject)
    console.log('📧 To:', emailConfig.to)
    console.log('📧 Attachment filename:', csvFilename)
    
    const result = await resend.emails.send(emailConfig)
    console.log('✅ Resend API response:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('💥 Error sending order report email:', error)
    console.error('💥 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    return { success: false, error: error instanceof Error ? error.message : 'Unknown email error' }
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
    <p>Welcome to <strong>InvyEasy</strong> - organize everything you own with our intuitive inventory management system!</p>
    
    <div class="card">
      <h3>🚀 Get Started - Organize Your Way</h3>
      <p>Your account is now active and ready to use. Here's what you can do:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>🏠 Home Organization:</strong> Track pantry items, craft supplies, and household goods</li>
        <li><strong>📱 Mobile-First:</strong> Count inventory on your phone, manage on any device</li>
        <li><strong>📍 Multiple Locations:</strong> Organize across home, office, storage units, and more</li>
        <li><strong>👥 Share & Collaborate:</strong> Invite family or team members to help stay organized</li>
        <li><strong>📊 Custom Categories:</strong> Create categories that make sense to you</li>
      </ul>
    </div>

    <div class="card">
      <h3>💡 Perfect for Everyone</h3>
      <p>Whether you're organizing your:</p>
      <ul style="text-align: left; padding-left: 20px;">
        <li>🍽️ <strong>Home:</strong> Pantry, garage, craft room, or entire household</li>
        <li>🎨 <strong>Hobbies:</strong> Craft supplies, books, collectibles, sports equipment</li>
        <li>🏢 <strong>Business:</strong> Retail store, office supplies, or small business inventory</li>
        <li>📦 <strong>Storage:</strong> Multiple properties, storage units, or shared spaces</li>
      </ul>
    </div>

    ${loginUrl ? `
      <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
        <a href="${loginUrl}" class="button">Start Organizing Today</a>
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

    <p>Thank you for choosing InvyEasy. <strong>Simple. Smart. Organized.</strong> - Never lose track of what you own again!</p>
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
      subject: 'Welcome to InvyEasy - Organize Everything You Own! 🎉',
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
    <p>Welcome to <strong>InvyEasy</strong>! To start organizing everything you own, please verify your email address to complete your account setup.</p>
    
    <div style="text-align: center; margin: ${EMAIL_DESIGN_SYSTEM.spacing.large} 0;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>

    <div class="card">
      <h3>🔐 Stay Connected & Secure</h3>
      <ul style="text-align: left; padding-left: 20px;">
        <li><strong>Security:</strong> Keep your organization system secure and protected</li>
        <li><strong>Tips & Updates:</strong> Get helpful tips for staying organized</li>
        <li><strong>Support:</strong> Ensure we can reach you when you need help</li>
        <li><strong>New Features:</strong> Be the first to know about new organizing tools</li>
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
    <p>We received a request to reset your password for your <strong>InvyEasy</strong> account. Click the button below to create a new password and get back to organizing everything you own.</p>
    
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
