import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Map subject codes to readable names
    const subjectMap: { [key: string]: string } = {
      'general_inquiry': 'General Inquiry',
      'technical_support': 'Technical Support',
      'billing_question': 'Billing Question',
      'feature_request': 'Feature Request',
      'bug_report': 'Bug Report',
      'partnership': 'Partnership Opportunity',
      'other': 'Other'
    }

    const subjectLine = subjectMap[subject] || subject
    
    // Prepare email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subjectLine}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; border-left: 4px solid #f97316;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Reply to this customer at:</strong> ${email}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>This message was sent from the InvyEasy contact form</p>
        </div>
      </div>
    `

    const emailText = `
New Contact Form Submission from InvyEasy

Name: ${name}
Email: ${email}
Subject: ${subjectLine}

Message:
${message}

---
Reply to this customer at: ${email}
    `

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your_resend_api_key_here') {
      console.log('📧 Contact form submission (Resend not configured):')
      console.log({
        to: 'invyeasy@gmail.com',
        from: email,
        subject: `[InvyEasy Contact] ${subjectLine}`,
        name,
        email,
        message
      })

      // Return success even without email service for development
      return NextResponse.json({
        success: true,
        message: 'Message received successfully (email service not configured)',
      })
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'noreply@invyeasy.com', // Using consistent domain
      to: ['invyeasy@gmail.com'],
      subject: `[InvyEasy Contact] ${subjectLine}`,
      html: emailHtml,
      text: emailText,
      replyTo: email,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('📧 Contact email sent successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      emailId: data?.id
    })

  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}