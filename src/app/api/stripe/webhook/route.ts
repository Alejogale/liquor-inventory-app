import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Determine app access based on plan metadata
function getAppsForPlan(planMetadata: any, billingCycle?: string): string[] {
  const plan = planMetadata?.plan;
  
  // Map plan names to apps
  if (plan === 'bundle' || plan === 'enterprise') {
    return ['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'];
  } else if (plan === 'professional') {
    return ['liquor-inventory', 'reservation-management'];
  } else if (plan === 'starter') {
    return ['liquor-inventory'];
  } else {
    // Fallback - check primary_app if available
    const primaryApp = planMetadata?.primary_app;
    if (primaryApp) {
      return [primaryApp];
    }
    // Default to liquor inventory
    return ['liquor-inventory'];
  }
}

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
        
        console.log('🎉 Checkout completed for organization:', session.metadata?.organization_id);
        
        // Update organizations table
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

        // 🚨 CRITICAL FIX: Update app_subscriptions table for access control
        const organizationId = session.metadata?.organization_id;
        if (organizationId) {
          const apps = getAppsForPlan(session.metadata);
          const subscriptionEndDate = new Date((subAny.current_period_end as number) * 1000);
          
          console.log('🔐 Creating app subscriptions:', { organizationId, apps });
          
          // Create or update subscription for each app
          for (const appId of apps) {
            const { error } = await supabaseAdmin
              .from('app_subscriptions')
              .upsert({
                organization_id: organizationId,
                app_id: appId,
                subscription_status: 'active',
                subscription_plan: session.metadata?.plan === 'bundle' ? 'bundle' : 'individual',
                subscription_ends_at: subscriptionEndDate.toISOString(),
                stripe_subscription_id: subscription.id,
                trial_ends_at: null, // No longer in trial
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'organization_id,app_id'
              });
              
            if (error) {
              console.error(`❌ Error creating app subscription for ${appId}:`, error);
            } else {
              console.log(`✅ Created/updated app subscription: ${organizationId} -> ${appId}`);
            }
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const invAny = invoice as any;
        if (invAny.subscription) {
          const subscriptionResp = await stripe.subscriptions.retrieve(invAny.subscription as string);
          const subscription = (subscriptionResp as unknown as Stripe.Subscription);
          const subAny = subscription as any;
          
          console.log('💰 Payment succeeded for subscription:', subscription.id);
          
          // Update organizations table
          await supabaseAdmin
            .from('organizations')
            .update({
              subscription_status: subscription.status,
              subscription_period_start: new Date((subAny.current_period_start as number) * 1000).toISOString(),
              subscription_period_end: new Date((subAny.current_period_end as number) * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);

          // Update app_subscriptions table
          const subscriptionEndDate = new Date((subAny.current_period_end as number) * 1000);
          await supabaseAdmin
            .from('app_subscriptions')
            .update({
              subscription_status: 'active',
              subscription_ends_at: subscriptionEndDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const invAny = invoice as any;
        if (invAny.subscription) {
          console.log('❌ Payment failed for subscription:', invAny.subscription);
          
          // Update organizations table
          await supabaseAdmin
            .from('organizations')
            .update({
              subscription_status: 'past_due',
            })
            .eq('stripe_subscription_id', invAny.subscription as string);

          // Update app_subscriptions table
          await supabaseAdmin
            .from('app_subscriptions')
            .update({
              subscription_status: 'expired',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invAny.subscription as string);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        const subAny = subscriptionObj as any;
        
        console.log('🔄 Subscription updated:', subscriptionObj.id);
        
        // Update organizations table
        await supabaseAdmin
          .from('organizations')
          .update({
            stripe_price_id: subscriptionObj.items.data[0].price?.id ?? null,
            subscription_status: subscriptionObj.status,
            subscription_period_start: new Date((subAny.current_period_start as number) * 1000).toISOString(),
            subscription_period_end: new Date((subAny.current_period_end as number) * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionObj.id);

        // Update app_subscriptions table
        const subscriptionEndDate = new Date((subAny.current_period_end as number) * 1000);
        const newStatus = subscriptionObj.status === 'active' ? 'active' : 'expired';
        await supabaseAdmin
          .from('app_subscriptions')
          .update({
            subscription_status: newStatus,
            subscription_ends_at: subscriptionEndDate.toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionObj.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionObj = event.data.object as Stripe.Subscription;
        
        console.log('🗑️ Subscription deleted:', subscriptionObj.id);
        
        // Update organizations table
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

        // Update app_subscriptions table
        await supabaseAdmin
          .from('app_subscriptions')
          .update({
            subscription_status: 'cancelled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString()
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
