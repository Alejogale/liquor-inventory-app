import { Resend } from 'resend'

// Initialize Resend only on server side
let resend: Resend | null = null

if (typeof window === 'undefined') {
  // Server side only
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey && apiKey !== 'your_resend_api_key_here') {
    resend = new Resend(apiKey)
  } else {
    console.warn('Resend API key not configured. Marketing email functionality will be disabled.')
  }
}

// InvyEasy Marketing Email Design System
const MARKETING_EMAIL_DESIGN = {
  colors: {
    primary: '#f97316', // InvyEasy Orange
    secondary: '#dc2626', // InvyEasy Red
    accent: '#f59e0b', // Amber
    background: '#fef2f2', // Light orange/red tint
    white: '#ffffff',
    text: '#1e293b',
    textLight: '#64748b'
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }
}

// Base marketing email template
function createMarketingEmailTemplate(content: string, preheader?: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>InvyEasy - Organize Everything You Own</title>
      ${preheader ? `<meta name="description" content="${preheader}">` : ''}
      <style>
        body {
          font-family: ${MARKETING_EMAIL_DESIGN.fonts.primary};
          line-height: 1.6;
          color: ${MARKETING_EMAIL_DESIGN.colors.text};
          background-color: ${MARKETING_EMAIL_DESIGN.colors.background};
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${MARKETING_EMAIL_DESIGN.colors.white};
        }
        .header {
          background: linear-gradient(135deg, ${MARKETING_EMAIL_DESIGN.colors.primary}, ${MARKETING_EMAIL_DESIGN.colors.secondary});
          color: ${MARKETING_EMAIL_DESIGN.colors.white};
          padding: 40px 32px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header .subtitle {
          margin: 8px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 32px;
        }
        .hero-section {
          text-align: center;
          padding: 40px 0;
          background: linear-gradient(135deg, #fef3c7, #fed7aa);
          margin: -32px -32px 32px -32px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${MARKETING_EMAIL_DESIGN.colors.primary}, ${MARKETING_EMAIL_DESIGN.colors.secondary});
          color: ${MARKETING_EMAIL_DESIGN.colors.white};
          padding: 16px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 16px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin: 32px 0;
        }
        .feature-card {
          background: ${MARKETING_EMAIL_DESIGN.colors.white};
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
        }
        .feature-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .testimonial {
          background: #f8fafc;
          border-left: 4px solid ${MARKETING_EMAIL_DESIGN.colors.primary};
          padding: 24px;
          margin: 32px 0;
          font-style: italic;
        }
        .footer {
          background-color: #1f2937;
          color: #d1d5db;
          padding: 32px;
          text-align: center;
          font-size: 14px;
        }
        .footer a {
          color: ${MARKETING_EMAIL_DESIGN.colors.primary};
          text-decoration: none;
        }
        .social-links {
          margin: 16px 0;
        }
        .social-links a {
          margin: 0 8px;
          font-size: 18px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
          }
          .content {
            padding: 24px;
          }
          .header {
            padding: 32px 24px;
          }
          .hero-section {
            margin: -24px -24px 24px -24px;
            padding: 32px 24px;
          }
        }
      </style>
    </head>
    <body>
      ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
      <div class="container">
        <div class="header">
          <h1>📦 InvyEasy</h1>
          <div class="subtitle">Organize Everything You Own</div>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}">🌐 Website</a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">📧 Contact</a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/pricing">💰 Pricing</a>
          </div>
          <p>© 2024 InvyEasy. Made with ❤️ to help you organize everything you own.</p>
          <p>
            <a href="{{unsubscribe}}">Unsubscribe</a> | 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/privacy">Privacy Policy</a> | 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/terms">Terms of Service</a>
          </p>
          <p style="font-size: 12px; color: #9ca3af;">
            InvyEasy, LLC<br>
            You're receiving this because you signed up for InvyEasy updates.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Newsletter Email Template
export async function sendNewsletterEmail({
  to,
  subject,
  headline,
  content,
  ctaText = 'Learn More',
  ctaUrl,
  preheader
}: {
  to: string[]
  subject: string
  headline: string
  content: string
  ctaText?: string
  ctaUrl?: string
  preheader?: string
}) {
  const emailContent = `
    <div class="hero-section">
      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937;">${headline}</h2>
    </div>
    
    <div style="font-size: 16px; line-height: 1.8;">
      ${content}
    </div>
    
    ${ctaUrl ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
      </div>
    ` : ''}
    
    <div class="testimonial">
      <p style="margin: 0; font-size: 14px;">
        "InvyEasy has transformed how I organize my entire home. From pantry to garage to craft room - everything is perfectly tracked!" 
        <strong>- Sarah M., Home Organizer</strong>
      </p>
    </div>
  `

  const html = createMarketingEmailTemplate(emailContent, preheader)

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    // Send to multiple recipients
    const results = await Promise.all(
      to.map(email => 
        resend.emails.send({
          from: 'InvyEasy <newsletter@invyeasy.com>',
          to: [email],
          subject: subject,
          html: html
        })
      )
    )
    
    return { success: true, data: results }
  } catch (error) {
    console.error('Error sending newsletter:', error)
    return { success: false, error }
  }
}

// Product Update Email
export async function sendProductUpdateEmail({
  to,
  updateTitle,
  updateDescription,
  features,
  ctaUrl
}: {
  to: string[]
  updateTitle: string
  updateDescription: string
  features: { icon: string; title: string; description: string }[]
  ctaUrl?: string
}) {
  const featureCards = features.map(feature => `
    <div class="feature-card">
      <div class="feature-icon">${feature.icon}</div>
      <h3 style="margin: 0 0 8px 0; color: #1f2937;">${feature.title}</h3>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">${feature.description}</p>
    </div>
  `).join('')

  const emailContent = `
    <div class="hero-section">
      <h2 style="margin: 0 0 16px 0; font-size: 24px; color: #1f2937;">🚀 ${updateTitle}</h2>
      <p style="margin: 0; font-size: 16px; color: #4b5563;">${updateDescription}</p>
    </div>
    
    <h3 style="color: #1f2937; margin: 32px 0 16px 0;">What's New:</h3>
    
    <div class="feature-grid">
      ${featureCards}
    </div>
    
    ${ctaUrl ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${ctaUrl}" class="cta-button">Try New Features</a>
      </div>
    ` : ''}
    
    <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280;">
      These updates are already live in your InvyEasy account. Log in to start using them today!
    </p>
  `

  const html = createMarketingEmailTemplate(emailContent, `New InvyEasy features: ${updateTitle}`)

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const results = await Promise.all(
      to.map(email => 
        resend.emails.send({
          from: 'InvyEasy <updates@invyeasy.com>',
          to: [email],
          subject: `🚀 New InvyEasy Features: ${updateTitle}`,
          html: html
        })
      )
    )
    
    return { success: true, data: results }
  } catch (error) {
    console.error('Error sending product update:', error)
    return { success: false, error }
  }
}

// Onboarding Series Email
export async function sendOnboardingEmail({
  to,
  userName,
  emailNumber,
  totalEmails,
  topic,
  content,
  ctaText,
  ctaUrl,
  nextEmailTopic
}: {
  to: string
  userName: string
  emailNumber: number
  totalEmails: number
  topic: string
  content: string
  ctaText: string
  ctaUrl: string
  nextEmailTopic?: string
}) {
  const emailContent = `
    <h2 style="color: #1f2937; margin: 0 0 8px 0;">Hello ${userName}! 👋</h2>
    <p style="margin: 0 0 24px 0; color: #6b7280;">
      This is email ${emailNumber} of ${totalEmails} in your InvyEasy onboarding series.
    </p>
    
    <div class="hero-section">
      <h3 style="margin: 0 0 16px 0; font-size: 22px; color: #1f2937;">${topic}</h3>
    </div>
    
    <div style="font-size: 16px; line-height: 1.8; margin: 24px 0;">
      ${content}
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
    </div>
    
    ${nextEmailTopic ? `
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; font-size: 14px; color: #4b5563;">
          📬 <strong>Coming up next:</strong> ${nextEmailTopic}
        </p>
      </div>
    ` : ''}
    
    <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280;">
      Have questions? Just reply to this email - we're here to help! 🤝
    </p>
  `

  const html = createMarketingEmailTemplate(emailContent, `InvyEasy Guide: ${topic}`)

  try {
    if (!resend) {
      console.warn('Resend not available on client side')
      return { success: false, error: 'Resend not available on client side' }
    }
    
    const result = await resend.emails.send({
      from: 'InvyEasy <onboarding@invyeasy.com>',
      to: [to],
      subject: `📚 InvyEasy Guide ${emailNumber}/${totalEmails}: ${topic}`,
      html: html
    })
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error sending onboarding email:', error)
    return { success: false, error }
  }
}