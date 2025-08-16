import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, subject, clubName, clubLocation, contactPerson, guestData, totalGuests, totalRevenue } = body

    // Generate HTML email content
    const htmlContent = generateClubReportEmail({
      clubName,
      clubLocation,
      contactPerson,
      guestData,
      totalGuests,
      totalRevenue
    })

    // For now, we'll use a simple email service
    // In production, you'd integrate with SendGrid, AWS SES, or similar
    console.log('Email would be sent to:', to)
    console.log('Subject:', subject)
    console.log('HTML Content:', htmlContent)

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to,
    //   from: 'your-verified-sender@domain.com',
    //   subject,
    //   html: htmlContent
    // })

    return NextResponse.json({ 
      success: true, 
      message: 'Email report generated successfully',
      to,
      subject,
      totalGuests,
      totalRevenue
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}

function generateClubReportEmail({ 
  clubName, 
  clubLocation, 
  contactPerson, 
  guestData, 
  totalGuests, 
  totalRevenue 
}: any) {
  const guestRows = guestData.map((guest: any) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${guest.guest_name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${guest.member_number}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${new Date(guest.visit_date).toLocaleDateString()}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">$${guest.total_amount?.toFixed(2) || '0.00'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${guest.status}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { background: #e9ecef; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #007bff; color: white; padding: 12px; text-align: left; }
        td { padding: 8px; border: 1px solid #ddd; }
        .total { font-weight: bold; background: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Guest Report - ${clubName}</h1>
        <p><strong>Location:</strong> ${clubLocation}</p>
        <p><strong>Contact:</strong> ${contactPerson}</p>
        <p><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Guests:</strong> ${totalGuests}</p>
        <p><strong>Total Revenue:</strong> $${totalRevenue.toFixed(2)}</p>
      </div>

      <h2>Guest Details</h2>
      <table>
        <thead>
          <tr>
            <th>Guest Name</th>
            <th>Member Number</th>
            <th>Visit Date</th>
            <th>Total Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${guestRows}
        </tbody>
      </table>

      <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p><strong>Note:</strong> This report contains all guest visits for ${clubName}. 
        For detailed purchase information, please contact the management team.</p>
      </div>
    </body>
    </html>
  `
}
