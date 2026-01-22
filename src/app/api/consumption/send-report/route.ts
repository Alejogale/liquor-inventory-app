import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

// Lazy Supabase Admin client initialization
let supabaseAdmin: ReturnType<typeof createClient> | null = null
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return supabaseAdmin
}

interface ConsumptionItem {
  id: string
  name: string
  price: number
  category_name: string
  quantity: number
}

interface CategoryWithItems {
  name: string
  items: ConsumptionItem[]
  subtotal: number
  itemCount: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, organizationId } = body

    // Validate required fields
    if (!eventId || !organizationId) {
      return NextResponse.json({ error: 'Event ID and Organization ID required' }, { status: 400 })
    }

    // Use organizationId from request (frontend already authenticated)
    const userProfile = { organization_id: organizationId }

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Get event details
    const { data: event, error: eventError } = await getSupabaseAdmin()
      .from('consumption_events')
      .select('*')
      .eq('id', eventId)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get organization name
    const { data: org } = await getSupabaseAdmin()
      .from('organizations')
      .select('Name')
      .eq('id', userProfile.organization_id)
      .single()

    const organizationName = org?.Name || 'Organization'

    // Get categories
    const { data: categories, error: catError } = await getSupabaseAdmin()
      .from('consumption_categories')
      .select('id, name')
      .eq('organization_id', userProfile.organization_id)
      .order('sort_order', { ascending: true })

    if (catError) throw catError

    // Get items
    const { data: items, error: itemsError } = await getSupabaseAdmin()
      .from('consumption_items')
      .select('id, name, price, category_id')
      .eq('organization_id', userProfile.organization_id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (itemsError) throw itemsError

    // Get counts for this event
    const { data: counts, error: countsError } = await getSupabaseAdmin()
      .from('consumption_counts')
      .select('item_id, quantity')
      .eq('event_id', eventId)

    if (countsError) throw countsError

    // Build counts map
    const countsMap: Record<string, number> = {}
    counts?.forEach(c => {
      countsMap[c.item_id] = c.quantity
    })

    // Build category data with items and counts
    const categoryData: CategoryWithItems[] = []
    let grandTotal = 0
    let grandItemCount = 0

    categories?.forEach(cat => {
      const catItems = items?.filter(i => i.category_id === cat.id) || []
      const itemsWithCounts: ConsumptionItem[] = []
      let catSubtotal = 0
      let catItemCount = 0

      catItems.forEach(item => {
        const quantity = countsMap[item.id] || 0
        if (quantity > 0) {
          itemsWithCounts.push({
            id: item.id,
            name: item.name,
            price: item.price,
            category_name: cat.name,
            quantity
          })
          catSubtotal += quantity * item.price
          catItemCount += quantity
        }
      })

      if (itemsWithCounts.length > 0) {
        categoryData.push({
          name: cat.name,
          items: itemsWithCounts,
          subtotal: catSubtotal,
          itemCount: catItemCount
        })
        grandTotal += catSubtotal
        grandItemCount += catItemCount
      }
    })

    // Get active email recipients
    const { data: recipients, error: recipientsError } = await getSupabaseAdmin()
      .from('consumption_email_recipients')
      .select('email, name')
      .eq('organization_id', userProfile.organization_id)
      .eq('is_active', true)

    if (recipientsError) throw recipientsError

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No email recipients configured. Please add recipients in Settings.' }, { status: 400 })
    }

    // Generate email HTML
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const emailHtml = generateConsumptionReportEmail({
      organizationName,
      eventName: event.name,
      eventDate: new Date(event.event_date).toLocaleDateString(),
      reportDate,
      categoryData,
      grandTotal,
      grandItemCount
    })

    // Send emails to all recipients
    const emailPromises = recipients.map(recipient =>
      getResend().emails.send({
        from: 'InvyEasy <noreply@invyeasy.com>',
        to: [recipient.email],
        subject: `Consumption Report - ${event.name} - ${organizationName}`,
        html: emailHtml
      })
    )

    await Promise.all(emailPromises)

    // Update event totals
    await getSupabaseAdmin()
      .from('consumption_events')
      .update({
        total_items: grandItemCount,
        total_amount: grandTotal
      })
      .eq('id', eventId)

    return NextResponse.json({
      success: true,
      recipientCount: recipients.length,
      totalItems: grandItemCount,
      totalAmount: grandTotal
    })

  } catch (error) {
    console.error('Error sending consumption report:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send report' },
      { status: 500 }
    )
  }
}

function generateConsumptionReportEmail({
  organizationName,
  eventName,
  eventDate,
  reportDate,
  categoryData,
  grandTotal,
  grandItemCount
}: {
  organizationName: string
  eventName: string
  eventDate: string
  reportDate: string
  categoryData: CategoryWithItems[]
  grandTotal: number
  grandItemCount: number
}): string {
  // Calculate insights
  const allItems = categoryData.flatMap(cat => cat.items)
  const mostPopularItem = allItems.length > 0
    ? allItems.reduce((max, item) => item.quantity > max.quantity ? item : max, allItems[0])
    : null
  const topCategory = categoryData.length > 0
    ? categoryData.reduce((max, cat) => cat.itemCount > max.itemCount ? cat : max, categoryData[0])
    : null
  const avgPricePerDrink = grandItemCount > 0 ? grandTotal / grandItemCount : 0
  const highestRevenueItem = allItems.length > 0
    ? allItems.reduce((max, item) => (item.quantity * item.price) > (max.quantity * max.price) ? item : max, allItems[0])
    : null

  // Mobile-friendly category sections - simplified 3-column layout
  const categorySections = categoryData.map(cat => `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
      <tr>
        <td style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 12px 16px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="color: #ffffff; font-size: 14px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${cat.name}</td>
              <td align="right" style="color: rgba(255,255,255,0.9); font-size: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${cat.itemCount} &bull; $${cat.subtotal.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 8px 12px; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0;">Item</td>
              <td align="center" style="padding: 8px 8px; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; width: 40px;">Qty</td>
              <td align="right" style="padding: 8px 12px; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; width: 65px;">Total</td>
            </tr>
            ${cat.items.map((item, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 10px 12px; font-size: 13px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">${item.name}</td>
              <td align="center" style="padding: 10px 8px; font-size: 13px; font-weight: 600; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
              <td align="right" style="padding: 10px 12px; font-size: 13px; font-weight: 700; color: #0d9488; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
            `).join('')}
          </table>
        </td>
      </tr>
    </table>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Consumption Report - ${eventName}</title>
  <style type="text/css">
    /* Mobile styles */
    @media only screen and (max-width: 480px) {
      .wrapper { padding: 12px !important; }
      .container { border-radius: 12px !important; }
      .header-pad { padding: 20px 16px !important; }
      .content-pad { padding: 20px 16px !important; }
      .stat-box { padding: 16px 12px !important; }
      .stat-number { font-size: 32px !important; }
      .stat-label { font-size: 11px !important; }
      .event-title { font-size: 22px !important; }
      .section-title { font-size: 16px !important; }
      .footer-pad { padding: 20px 16px !important; }
      .grand-total-pad { padding: 16px !important; }
      .grand-total-amount { font-size: 22px !important; }
      .insight-cell { display: block !important; width: 100% !important; padding: 8px 0 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" class="wrapper" style="padding: 24px 12px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" class="container" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">

          <!-- Header with Logo -->
          <tr>
            <td class="header-pad" style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px 20px; text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://invyeasy.com'}/InvyEasy-logo.png" alt="InvyEasy" width="130" style="display: block; margin: 0 auto 12px auto;" />
              <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 500;">Consumption Report</p>
            </td>
          </tr>

          <!-- Event Header -->
          <tr>
            <td class="content-pad" style="padding: 20px; background-color: #0f172a;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Event</p>
              <h1 class="event-title" style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.2;">${eventName}</h1>
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff;">${eventDate}</p>
              <p style="margin: 0; font-size: 12px; color: #64748b;">${organizationName}</p>
            </td>
          </tr>

          <!-- Main Stats - Stacked for mobile -->
          <tr>
            <td class="content-pad" style="padding: 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48%" class="stat-box" style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 10px; padding: 18px 14px; text-align: center; vertical-align: top;">
                    <p class="stat-number" style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; line-height: 1;">${grandItemCount}</p>
                    <p class="stat-label" style="margin: 6px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Total Drinks</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" class="stat-box" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 10px; padding: 18px 14px; text-align: center; vertical-align: top;">
                    <p class="stat-number" style="margin: 0; font-size: 36px; font-weight: 800; color: #14b8a6; line-height: 1;">$${grandTotal.toFixed(0)}</p>
                    <p class="stat-label" style="margin: 6px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.85); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Revenue</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Insights Section - Compact for mobile -->
          ${mostPopularItem ? `
          <tr>
            <td style="padding: 0 20px 20px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 10px; border: 1px solid #fcd34d;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.3px;">Insights</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td class="insight-cell" width="50%" style="padding: 6px 4px 6px 0; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 10px; color: #92400e; text-transform: uppercase; font-weight: 600;">Most Popular</p>
                          <p style="margin: 0; font-size: 13px; color: #78350f; font-weight: 700;">${mostPopularItem.name}</p>
                          <p style="margin: 1px 0 0 0; font-size: 11px; color: #a16207;">${mostPopularItem.quantity} served</p>
                        </td>
                        <td class="insight-cell" width="50%" style="padding: 6px 0 6px 4px; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 10px; color: #92400e; text-transform: uppercase; font-weight: 600;">Top Category</p>
                          <p style="margin: 0; font-size: 13px; color: #78350f; font-weight: 700;">${topCategory?.name || 'N/A'}</p>
                          <p style="margin: 1px 0 0 0; font-size: 11px; color: #a16207;">$${topCategory?.subtotal.toFixed(2) || '0.00'}</p>
                        </td>
                      </tr>
                      <tr>
                        <td class="insight-cell" width="50%" style="padding: 6px 4px 6px 0; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 10px; color: #92400e; text-transform: uppercase; font-weight: 600;">Avg Price</p>
                          <p style="margin: 0; font-size: 13px; color: #78350f; font-weight: 700;">$${avgPricePerDrink.toFixed(2)}</p>
                        </td>
                        <td class="insight-cell" width="50%" style="padding: 6px 0 6px 4px; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 10px; color: #92400e; text-transform: uppercase; font-weight: 600;">Top Revenue</p>
                          <p style="margin: 0; font-size: 13px; color: #78350f; font-weight: 700;">${highestRevenueItem?.name || 'N/A'}</p>
                          <p style="margin: 1px 0 0 0; font-size: 11px; color: #a16207;">$${highestRevenueItem ? (highestRevenueItem.quantity * highestRevenueItem.price).toFixed(2) : '0.00'}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Detailed Breakdown -->
          <tr>
            <td style="padding: 0 20px 20px 20px;">
              <p class="section-title" style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Breakdown</p>
              ${categorySections || '<p style="color: #64748b; text-align: center; padding: 20px; font-size: 13px;">No items recorded.</p>'}
            </td>
          </tr>

          <!-- Grand Total Bar -->
          <tr>
            <td class="grand-total-pad" style="padding: 16px 20px; background-color: #0f172a;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 14px; font-weight: 600; color: #ffffff; vertical-align: middle;">
                    Total
                    <span style="font-size: 12px; color: #94a3b8; font-weight: 400; display: block;">${grandItemCount} drinks</span>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span class="grand-total-amount" style="font-size: 26px; font-weight: 800; color: #14b8a6;">$${grandTotal.toFixed(2)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-pad" style="padding: 20px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://invyeasy.com'}/InvyEasy-logo.png" alt="InvyEasy" width="80" style="display: inline-block; margin-bottom: 8px; opacity: 0.6;" />
              <p style="margin: 0 0 2px 0; font-size: 11px; color: #64748b;">
                Sent via <strong style="color: #0f172a;">Consumption Tracker</strong>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                ${reportDate}
              </p>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} InvyEasy
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
