import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { conversionId, customerEmail } = await request.json()

    if (!conversionId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing conversionId or customerEmail' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session using your live price ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price: 'price_1SDEzcGp6QH8POrP4p2kanYM', // Your live Stripe price ID for $200
          quantity: 1,
        },
      ],
      metadata: {
        conversionId,
        service: 'inventory_conversion',
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/inventory-conversion/success?session_id={CHECKOUT_SESSION_ID}&conversion_id=${conversionId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/inventory-conversion?cancelled=true`,
      automatic_tax: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}