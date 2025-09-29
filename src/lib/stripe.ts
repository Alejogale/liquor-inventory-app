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

// Product IDs for your plans from Stripe Dashboard
export const STRIPE_PRODUCT_IDS = {
  pro_monthly: 'prod_T8qd2GbwG57o28', // Monthly subscription product
  pro_annual: 'prod_T8qd22OvVC3sxX',  // Annual subscription product
} as const;

// NOTE: You'll need to get the specific PRICE IDs for each product from Stripe Dashboard
// Products can have multiple prices (different currencies, billing intervals, etc.)
// For checkout, we need the price IDs, not product IDs
export const STRIPE_PRICE_IDS = {
  pro_monthly: 'price_1SCW6jGp6QH8POrP1X7faANK', // PLACEHOLDER - Update with actual price ID for monthly
  pro_annual: 'price_1SCW89Gp6QH8POrP7dPZ5dED',  // PLACEHOLDER - Update with actual price ID for annual
} as const;
