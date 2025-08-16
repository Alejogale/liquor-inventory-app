import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia'
})

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user has permission to view billing
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get organization with Stripe customer ID
    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select('stripe_customer_id, Name')
      .eq('id', userProfile.organization_id)
      .single()

    if (orgError || !organization || !organization.stripe_customer_id) {
      return NextResponse.json({ 
        invoices: [],
        message: 'No billing history available'
      })
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: organization.stripe_customer_id,
      limit: 20,
      expand: ['data.subscription']
    })

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.total,
      currency: invoice.currency,
      created: invoice.created,
      dueDate: invoice.due_date,
      paidAt: invoice.status_transitions.paid_at,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      description: invoice.description,
      subscription: invoice.subscription ? {
        id: invoice.subscription.id,
        // @ts-expect-error - Stripe types might not include all expanded fields
        plan: invoice.subscription.items?.data[0]?.price?.nickname || 'Unknown Plan'
      } : null,
      lineItems: invoice.lines.data.map(line => ({
        id: line.id,
        description: line.description,
        amount: line.amount,
        quantity: line.quantity,
        period: line.period ? {
          start: line.period.start,
          end: line.period.end
        } : null
      }))
    }))

    return NextResponse.json({
      invoices: formattedInvoices,
      organization: {
        name: organization.Name,
        stripeCustomerId: organization.stripe_customer_id
      }
    })

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch billing history' }, { status: 500 })
  }
}