'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Package,
  Zap,
  Crown,
  Building,
  Star
} from 'lucide-react'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly')

  const pricingPlans = [
    {
      name: "Starter",
      monthlyPrice: 29,
      annualPrice: 278.40,
      stripePriceId: {
        monthly: 'price_1RraSpGp6QH8POrPJhMku7do',
        annual: 'price_1RraXVGp6QH8POrPzVMkXm6m',
      },
      description: "Perfect for small bars and restaurants",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "Up to 500 items",
        "2 rooms/locations", 
        "Basic barcode scanning",
        "Email reports",
        "Standard support",
        "14-day free trial"
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Professional",
      monthlyPrice: 79,
      annualPrice: 758.40,
      stripePriceId: {
        monthly: 'price_1RraTyGp6QH8POrPmO6Zob82',
        annual: 'price_1RraYCGp6QH8POrP8s29ZleI',
      },
      description: "For growing businesses with multiple locations",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Unlimited items",
        "Unlimited rooms/locations",
        "Advanced barcode scanning", 
        "QuickBooks Integration",
        "Real-time reports & analytics",
        "Activity logging & audit trails",
        "Priority support",
        "API access",
        "Team management",
        "14-day free trial"
      ],
      popular: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Enterprise",
      monthlyPrice: 199,
      annualPrice: 1910.40,
      stripePriceId: {
        monthly: 'price_1RraYzGp6QH8POrPfXKLCmes',
        annual: 'price_1RraZQGp6QH8POrP3iJKGMJs',
      },
      description: "For large operations and chains",
      icon: <Building className="h-6 w-6" />,
      features: [
        "Everything in Professional",
        "Multi-organization management",
        "Custom integrations",
        "Dedicated account manager",
        "Training sessions & onboarding",
        "White-label options",
        "Custom reporting",
        "SLA guarantee",
        "Priority feature requests"
      ],
      popular: false,
      color: "from-green-500 to-emerald-500"
    }
  ]

  const getSignupUrl = (planIndex: number) => {
    const plan = pricingPlans[planIndex]
    const priceId = billingPeriod === 'monthly' 
      ? plan.stripePriceId.monthly 
      : plan.stripePriceId.annual

    const params = new URLSearchParams({
      plan: plan.name.toLowerCase(),
      billing: billingPeriod,
      priceId: priceId,
    })
    
    return `/signup?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LiquorTrack</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-white/80 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/" className="text-white/60 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <span className="bg-blue-500/10 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20">
              💎 Choose Your Plan
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Simple, Transparent
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Pricing</span>
          </h1>
          
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start with a 14-day free trial. No credit card required.
            Cancel anytime with no questions asked.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-lg transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annually')}
                className={`px-6 py-2 rounded-lg transition-all relative ${
                  billingPeriod === 'annually'
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => {
              const price = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice
              const monthlyEquivalent = billingPeriod === 'annually' ? plan.annualPrice / 12 : plan.monthlyPrice
              const annualSavings = billingPeriod === 'annually' ? (plan.monthlyPrice * 12) - plan.annualPrice : 0
              
              return (
                <div
                  key={index}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                    plan.popular
                      ? 'border-blue-400 shadow-2xl shadow-blue-500/20 scale-105'
                      : 'border-white/20 hover:border-white/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-2">
                      ${billingPeriod === 'monthly' ? price : price.toFixed(0)}
                      <span className="text-lg text-white/60">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {billingPeriod === 'annually' && (
                      <div className="text-green-400 text-sm">
                        ${monthlyEquivalent.toFixed(0)}/month • Save ${annualSavings.toFixed(0)}/year
                      </div>
                    )}
                    <p className="text-white/70 mt-2">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-white/80">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : getSignupUrl(index)}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center group text-center ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LiquorTrack</span>
            </Link>
            
            <div className="text-white/60 text-center md:text-right">
              <p>&copy; 2024 LiquorTrack. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
