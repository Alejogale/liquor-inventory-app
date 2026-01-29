import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Only return safe metadata (no sensitive info)
    return NextResponse.json({
      metadata: session.metadata,
      customer_email: session.customer_email,
      customer_details: session.customer_details ? {
        email: session.customer_details.email,
        name: session.customer_details.name,
      } : null,
      payment_status: session.payment_status,
      status: session.status,
    })
  } catch (error: any) {
    console.error('Error retrieving Stripe session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}
