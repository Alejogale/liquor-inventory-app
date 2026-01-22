import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'

// Create Supabase Admin client for data queries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil'
  })
}

export async function GET(request: NextRequest) {
  try {
    // Get user from auth using SSR client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization using admin client
    const { data: userProfile, error: profileError } = await supabaseAdmin
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
    const { data: organization, error: orgError } = await supabaseAdmin
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
    const stripe = getStripe()
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
      subscription: (invoice as any).subscription ? {
        id: (invoice as any).subscription.id,
        plan: (invoice as any).subscription.items?.data[0]?.price?.nickname || 'Unknown Plan'
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
