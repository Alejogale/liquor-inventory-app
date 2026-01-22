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

  const categorySections = categoryData.map(cat => `
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
      <tr>
        <td style="background: linear-gradient(135deg, #14b8a6, #06b6d4); padding: 16px 20px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="color: #ffffff; font-size: 16px; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${cat.name}</td>
              <td align="right" style="color: rgba(255,255,255,0.9); font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${cat.itemCount} drinks &bull; $${cat.subtotal.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 0;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px 20px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0;">Item</td>
              <td align="center" style="padding: 12px 16px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; width: 60px;">Qty</td>
              <td align="right" style="padding: 12px 16px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; width: 70px;">Price</td>
              <td align="right" style="padding: 12px 20px; font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; width: 80px;">Total</td>
            </tr>
            ${cat.items.map((item, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
              <td style="padding: 14px 20px; font-size: 14px; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">${item.name}</td>
              <td align="center" style="padding: 14px 16px; font-size: 14px; font-weight: 600; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
              <td align="right" style="padding: 14px 16px; font-size: 14px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">$${item.price.toFixed(2)}</td>
              <td align="right" style="padding: 14px 20px; font-size: 14px; font-weight: 700; color: #0d9488; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; border-bottom: 1px solid #f1f5f9;">$${(item.quantity * item.price).toFixed(2)}</td>
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
  <title>Consumption Report - ${eventName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">

          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px 40px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://invyeasy.com'}/InvyEasy-logo.png" alt="InvyEasy" width="160" style="display: block; margin-bottom: 16px;" />
                    <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9); font-weight: 500;">Consumption Tracker Report</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Event Header -->
          <tr>
            <td style="padding: 32px 40px; background-color: #0f172a;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Event</p>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">${eventName}</h1>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Date</p>
                    <p style="margin: 0; font-size: 16px; color: #ffffff; font-weight: 500;">${eventDate}</p>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 12px;">
                    <p style="margin: 0; font-size: 13px; color: #64748b;">${organizationName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Stats -->
          <tr>
            <td style="padding: 32px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="48%" style="background: linear-gradient(135deg, #14b8a6, #0d9488); border-radius: 12px; padding: 24px; text-align: center;">
                    <p style="margin: 0; font-size: 42px; font-weight: 800; color: #ffffff; line-height: 1;">${grandItemCount}</p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Total Drinks</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 12px; padding: 24px; text-align: center;">
                    <p style="margin: 0; font-size: 42px; font-weight: 800; color: #14b8a6; line-height: 1;">$${grandTotal.toFixed(2)}</p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.85); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Total Revenue</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Insights Section -->
          ${mostPopularItem ? `
          <tr>
            <td style="padding: 0 40px 32px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef3c7; border-radius: 12px; border: 1px solid #fcd34d;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Event Insights</p>
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Most Popular</p>
                          <p style="margin: 0; font-size: 15px; color: #78350f; font-weight: 700;">${mostPopularItem.name}</p>
                          <p style="margin: 2px 0 0 0; font-size: 12px; color: #a16207;">${mostPopularItem.quantity} drinks served</p>
                        </td>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Top Category</p>
                          <p style="margin: 0; font-size: 15px; color: #78350f; font-weight: 700;">${topCategory?.name || 'N/A'}</p>
                          <p style="margin: 2px 0 0 0; font-size: 12px; color: #a16207;">${topCategory?.itemCount || 0} drinks &bull; $${topCategory?.subtotal.toFixed(2) || '0.00'}</p>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Avg. Per Drink</p>
                          <p style="margin: 0; font-size: 15px; color: #78350f; font-weight: 700;">$${avgPricePerDrink.toFixed(2)}</p>
                        </td>
                        <td width="50%" style="padding: 8px 0; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Top Revenue Item</p>
                          <p style="margin: 0; font-size: 15px; color: #78350f; font-weight: 700;">${highestRevenueItem?.name || 'N/A'}</p>
                          <p style="margin: 2px 0 0 0; font-size: 12px; color: #a16207;">$${highestRevenueItem ? (highestRevenueItem.quantity * highestRevenueItem.price).toFixed(2) : '0.00'}</p>
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
            <td style="padding: 0 40px 32px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 18px; font-weight: 700; color: #0f172a;">Detailed Breakdown</p>
              ${categorySections || '<p style="color: #64748b; text-align: center; padding: 24px;">No items recorded for this event.</p>'}
            </td>
          </tr>

          <!-- Grand Total Bar -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0f172a;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-size: 16px; font-weight: 600; color: #ffffff;">Grand Total</td>
                  <td align="right">
                    <span style="font-size: 14px; color: #94a3b8; margin-right: 16px;">${grandItemCount} drinks</span>
                    <span style="font-size: 28px; font-weight: 800; color: #14b8a6;">$${grandTotal.toFixed(2)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://invyeasy.com'}/InvyEasy-logo.png" alt="InvyEasy" width="100" style="display: inline-block; margin-bottom: 12px; opacity: 0.7;" />
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #64748b;">
                Sent via <strong style="color: #0f172a;">Consumption Tracker</strong> by InvyEasy
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Report generated: ${reportDate}
              </p>
              <p style="margin: 16px 0 0 0; font-size: 11px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} InvyEasy. All rights reserved.
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
