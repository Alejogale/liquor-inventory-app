import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

export const getStripe = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
  }
  return import('@stripe/stripe-js').then(({ loadStripe }) =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  );
};

// Price IDs for your plans (you'll get these from Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter_monthly: 'price_starter_monthly_id',
  starter_annual: 'price_starter_annual_id', 
  professional_monthly: 'price_professional_monthly_id',
  professional_annual: 'price_professional_annual_id',
  enterprise_monthly: 'price_enterprise_monthly_id',
  enterprise_annual: 'price_enterprise_annual_id',
} as const;
