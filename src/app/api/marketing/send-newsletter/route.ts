import { NextRequest, NextResponse } from 'next/server'
import { sendNewsletterEmail, sendProductUpdateEmail, sendOnboardingEmail } from '@/lib/marketing-emails'

export async function POST(request: NextRequest) {
  try {
    const { type, ...params } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Email type is required' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'newsletter':
        const { to, subject, headline, content, ctaText, ctaUrl, preheader } = params
        if (!to || !subject || !headline || !content) {
          return NextResponse.json(
            { error: 'Missing required fields: to, subject, headline, content' },
            { status: 400 }
          )
        }
        result = await sendNewsletterEmail({
          to: Array.isArray(to) ? to : [to],
          subject,
          headline,
          content,
          ctaText,
          ctaUrl,
          preheader
        })
        break

      case 'product-update':
        const { to: updateTo, updateTitle, updateDescription, features, ctaUrl: updateCtaUrl } = params
        if (!updateTo || !updateTitle || !updateDescription || !features) {
          return NextResponse.json(
            { error: 'Missing required fields: to, updateTitle, updateDescription, features' },
            { status: 400 }
          )
        }
        result = await sendProductUpdateEmail({
          to: Array.isArray(updateTo) ? updateTo : [updateTo],
          updateTitle,
          updateDescription,
          features,
          ctaUrl: updateCtaUrl
        })
        break

      case 'onboarding':
        const { 
          to: onboardingTo, 
          userName, 
          emailNumber, 
          totalEmails, 
          topic, 
          content: onboardingContent, 
          ctaText: onboardingCtaText, 
          ctaUrl: onboardingCtaUrl, 
          nextEmailTopic 
        } = params
        if (!onboardingTo || !userName || !emailNumber || !totalEmails || !topic || !onboardingContent || !onboardingCtaText || !onboardingCtaUrl) {
          return NextResponse.json(
            { error: 'Missing required fields for onboarding email' },
            { status: 400 }
          )
        }
        result = await sendOnboardingEmail({
          to: onboardingTo,
          userName,
          emailNumber,
          totalEmails,
          topic,
          content: onboardingContent,
          ctaText: onboardingCtaText,
          ctaUrl: onboardingCtaUrl,
          nextEmailTopic
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type. Use: newsletter, product-update, or onboarding' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent successfully`,
        emailsSent: Array.isArray(result.data) ? result.data.length : 1
      })
    } else {
      return NextResponse.json(
        { error: `Failed to send ${type} email`, details: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Marketing email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}