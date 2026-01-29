import { NextResponse } from 'next/server'

// Temporary debug endpoint - DELETE AFTER DEBUGGING
export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    stripe_prices: {
      starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ? 'SET' : 'NOT SET',
      starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY ? 'SET' : 'NOT SET',
      basic_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY ? 'SET' : 'NOT SET',
      basic_yearly: process.env.STRIPE_PRICE_BASIC_YEARLY ? 'SET' : 'NOT SET',
      professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY ? 'SET' : 'NOT SET',
      professional_yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY ? 'SET' : 'NOT SET',
      business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ? 'SET' : 'NOT SET',
      business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ? 'SET' : 'NOT SET',
    },
    // Show partial values for verification (first 10 chars only)
    partial_values: {
      business_monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY?.substring(0, 10) || 'empty',
      business_yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY?.substring(0, 10) || 'empty',
    },
    all_stripe_keys: Object.keys(process.env).filter(k => k.includes('STRIPE')),
  })
}
