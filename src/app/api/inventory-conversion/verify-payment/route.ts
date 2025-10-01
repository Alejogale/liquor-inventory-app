import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { readFile, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { sessionId, conversionId } = await request.json()

    if (!sessionId || !conversionId) {
      return NextResponse.json(
        { error: 'Missing sessionId or conversionId' },
        { status: 400 }
      )
    }

    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Update conversion metadata with payment confirmation
    const metadataPath = path.join(process.cwd(), 'uploads', 'conversions', conversionId, 'conversion_metadata.json')
    
    if (!existsSync(metadataPath)) {
      return NextResponse.json(
        { error: 'Conversion request not found' },
        { status: 404 }
      )
    }

    const conversionData = JSON.parse(await readFile(metadataPath, 'utf-8'))
    conversionData.paymentStatus = 'paid'
    conversionData.stripeSessionId = sessionId
    conversionData.paidAt = new Date().toISOString()
    conversionData.status = 'paid_processing'

    await writeFile(metadataPath, JSON.stringify(conversionData, null, 2))

    // Send confirmation email to customer
    try {
      const customerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your inventory conversion is being processed</p>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">Thank You, ${conversionData.customerInfo.name}!</h2>
              <p style="color: #6b7280; margin-bottom: 20px;">Your payment of <strong>$200</strong> has been successfully processed.</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #374151; font-size: 14px;"><strong>Conversion ID:</strong></p>
                <p style="margin: 5px 0 0 0; font-family: monospace; color: #1f2937; font-size: 16px;">${conversionId}</p>
              </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">What Happens Next?</h3>
              <div style="margin: 15px 0;">
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="background: #f97316; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">1</div>
                  <div>
                    <strong style="color: #1f2937;">File Review (Within 2 hours)</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">Our experts will review your uploaded inventory files</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="background: #f97316; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">2</div>
                  <div>
                    <strong style="color: #1f2937;">Data Conversion (12-24 hours)</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">Convert your data to InvyEasy template format with proper categorization</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                  <div style="background: #f97316; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; margin-right: 12px; flex-shrink: 0;">3</div>
                  <div>
                    <strong style="color: #1f2937;">Quality Check & Delivery</strong><br>
                    <span style="color: #6b7280; font-size: 14px;">Final review and email delivery of your converted template</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>Important:</strong> You'll receive your converted template file via email within 24-48 hours. 
                The file will be ready to import directly into your InvyEasy account.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>Questions? Contact us at <a href="mailto:invyeasy@gmail.com" style="color: #f97316;">invyeasy@gmail.com</a></p>
            <p>This is an automated confirmation email from InvyEasy</p>
          </div>
        </div>
      `

      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
        await resend.emails.send({
          from: 'noreply@invyeasy.com',
          to: [conversionData.customerInfo.email],
          subject: 'Payment Confirmed - Your Inventory Conversion is Being Processed',
          html: customerEmailHtml,
        })
      }

      // Send update notification to you
      const notificationHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">💰 Payment Received!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin-top: 0;">Conversion Request Ready for Processing</h2>
              <p><strong>Customer:</strong> ${conversionData.customerInfo.name} (${conversionData.customerInfo.email})</p>
              <p><strong>Conversion ID:</strong> ${conversionId}</p>
              <p><strong>Payment Amount:</strong> $200</p>
              <p><strong>Stripe Session:</strong> ${sessionId}</p>
              <p><strong>Files Uploaded:</strong> ${conversionData.files.length} file(s)</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Action Required:</strong><br>
                1. Download files from: <code>/uploads/conversions/${conversionId}/</code><br>
                2. Convert files to InvyEasy template format<br>
                3. Email converted file to customer<br>
                4. Update conversion status when complete
              </p>
            </div>
          </div>
        </div>
      `

      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your_resend_api_key_here') {
        await resend.emails.send({
          from: 'noreply@invyeasy.com',
          to: ['invyeasy@gmail.com'],
          subject: `[PAID] Conversion Request Ready - ${conversionData.customerInfo.name}`,
          html: notificationHtml,
        })
      }

    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the verification if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and conversion queued for processing'
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}