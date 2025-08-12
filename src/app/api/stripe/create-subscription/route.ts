import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, we'll create a simple implementation
    // In production, you would integrate with your auth system properly
    
    console.log('🔄 Creating Stripe subscription session...');
    
    const { priceId, billingPeriod } = await request.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // For demo purposes, create a simple checkout session without customer data
    // In production, you'd retrieve the customer from your database
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=subscription_created`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
      metadata: {
        billing_period: billingPeriod,
      },
    });

    console.log('✅ Stripe session created:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
