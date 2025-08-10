import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const hdrs = await headers();
  const signature = hdrs.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    ) as Stripe.Event;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionResp = await stripe.subscriptions.retrieve(session.subscription as string);
        const subscription = (subscriptionResp as unknown as Stripe.Subscription);
        const subAny = subscription as any;
        
        await supabaseAdmin
          .from('organizations')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0].price?.id ?? null,
            subscription_status: subscription.status,
            subscription_period_start: new Date((subAny.current_period_start as number) * 1000).toISOString(),
            subscription_period_end: new Date((subAny.current_period_end as number) * 1000).toISOString(),
          })
          .eq('id', session.metadata?.organization_id as string);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const invAny = invoice as any;
        if (invAny.subscription) {
          const subscriptionResp = await stripe.subscriptions.retrieve(invAny.subscription as string);
          const subscription = (subscriptionResp as unknown as Stripe.Subscription);
          const subAny = subscription as any;
          
          await supabaseAdmin
            .from('organizations')
            .update({
              subscription_status: subscription.status,
              subscription_period_start: new Date((subAny.current_period_start as number) * 1000).toISOString(),
              subscription_period_end: new Date((subAny.current_period_end as number) * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invAny = invoice as any;
        if (invAny.subscription) {
          await supabaseAdmin
            .from('organizations')
            .update({
              subscription_status: 'past_due',
            })
            .eq('stripe_subscription_id', invAny.subscription as string);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        const subAny = subscriptionObj as any;
        
        await supabaseAdmin
          .from('organizations')
          .update({
            stripe_price_id: subscriptionObj.items.data[0].price?.id ?? null,
            subscription_status: subscriptionObj.status,
            subscription_period_start: new Date((subAny.current_period_start as number) * 1000).toISOString(),
            subscription_period_end: new Date((subAny.current_period_end as number) * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionObj.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        
        await supabaseAdmin
          .from('organizations')
          .update({
            stripe_subscription_id: null,
            stripe_price_id: null,
            subscription_status: 'canceled',
            subscription_period_start: null,
            subscription_period_end: null,
          })
          .eq('stripe_subscription_id', subscriptionObj.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
