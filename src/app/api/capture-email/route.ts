import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for bypassing RLS
)

// Initialize Resend (only if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const referer = request.headers.get('referer') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : undefined

    // Extract UTM parameters from referer
    let utmSource, utmMedium, utmCampaign
    if (referer) {
      try {
        const url = new URL(referer)
        utmSource = url.searchParams.get('utm_source') || undefined
        utmMedium = url.searchParams.get('utm_medium') || undefined
        utmCampaign = url.searchParams.get('utm_campaign') || undefined
      } catch (e) {
        // Invalid URL, ignore
      }
    }

    // Insert email capture into database
    const { data, error } = await supabase
      .from('email_captures')
      .insert({
        email: email.toLowerCase().trim(),
        source: 'popup',
        page_url: referer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        template_downloaded: true,
        download_count: 1,
        marketing_consent: true,
        referrer: referer,
        user_agent: userAgent,
        ip_address: ipAddress,
        last_download_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // Don't fail if duplicate - the trigger handles this gracefully
      if (error.code !== '23505') { // 23505 = unique violation
        return NextResponse.json(
          { error: 'Failed to save email' },
          { status: 500 }
        )
      }
    }

    // Send email with template via Resend (only if configured)
    if (resend) {
      try {
        await resend.emails.send({
        from: 'InvyEasy <onboarding@resend.dev>', // Using Resend's test domain - update to your verified domain later
        to: email,
        subject: 'Your Free Liquor Inventory Template 🍸',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Thanks for Downloading! 🎉</h1>
              </div>

              <div style="background: #f9fafb; padding: 30px 20px; border-radius: 0 0 10px 10px;">

                <p style="font-size: 16px; margin-bottom: 20px;">
                  Hi there! 👋
                </p>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  Your <strong>free liquor inventory template</strong> is attached to this email. You can also download it anytime from our website.
                </p>

                <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 25px 0; border-radius: 4px;">
                  <h3 style="margin: 0 0 10px 0; color: #667eea;">What's Inside:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Pre-built formulas for inventory calculations</li>
                    <li>Sample data from real bars & restaurants</li>
                    <li>Par levels and reorder point tracking</li>
                    <li>Cost analysis and total value calculations</li>
                  </ul>
                </div>

                <p style="font-size: 16px; margin-bottom: 20px;">
                  <strong>Pro Tip:</strong> Update your inventory weekly (or after big events) to catch shrinkage early and avoid costly stockouts.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                <h3 style="color: #667eea; margin-bottom: 15px;">Ready to Automate?</h3>
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Managing inventory in spreadsheets works... but it's time-consuming. InvyEasy automates the entire process:
                </p>

                <ul style="margin-bottom: 25px; padding-left: 20px;">
                  <li>✨ Real-time inventory tracking</li>
                  <li>📊 Automated low-stock alerts</li>
                  <li>💰 Cost & profit analysis</li>
                  <li>📱 Access from any device</li>
                  <li>🔄 Automatic par level calculations</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://invyeasy.com/signup?utm_source=email&utm_medium=template&utm_campaign=lead_magnet" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Start Your Free Trial
                  </a>
                </div>

                <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
                  Questions? Just reply to this email — we're here to help!
                </p>

                <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 10px;">
                  — The InvyEasy Team
                </p>

              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                  InvyEasy | Inventory Management Made Simple
                </p>
                <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">
                  <a href="https://invyeasy.com" style="color: #667eea; text-decoration: none;">invyeasy.com</a>
                </p>
                <p style="font-size: 11px; color: #d1d5db; margin-top: 15px;">
                  Don't want these emails? <a href="{{unsubscribe_url}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                </p>
              </div>

            </body>
          </html>
        `,
        attachments: [
          {
            filename: 'liquor-inventory-template.csv',
            path: `${process.env.NEXT_PUBLIC_APP_URL}/templates/liquor-inventory-template.csv`
          }
        ]
        })
      } catch (emailError) {
        console.error('Resend error:', emailError)
        // Don't fail the request if email fails - we still captured the lead
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email captured successfully'
    })

  } catch (error) {
    console.error('Email capture error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
