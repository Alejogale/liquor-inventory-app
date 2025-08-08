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
  Star,
  Users,
  Shield,
  Clock,
  TrendingUp,
  MessageCircle
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
        "Free 30-day trial"
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
        "Free 30-day trial"
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

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Bar Manager",
      company: "The Blue Room",
      content: "LiquorTrack has completely transformed our inventory management. We've reduced waste by 40% and our ordering is now spot-on.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Operations Director", 
      company: "Downtown Hospitality Group",
      content: "The QuickBooks integration alone has saved us hours every month. The real-time reporting gives us insights we never had before.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      role: "Owner",
      company: "Casa de Vinos",
      content: "As a small business owner, I needed something simple but powerful. LiquorTrack delivers exactly that - easy to use but packed with features.",
      rating: 5
    }
  ]

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and SOC 2 compliance keep your data safe"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Real-time Sync",
      description: "Instant updates across all devices and team members"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Smart Analytics",
      description: "AI-powered insights help optimize your inventory and reduce waste"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Team Collaboration",
      description: "Multiple users can work simultaneously with role-based permissions"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-slate-800" />
            </div>
            <span className="text-2xl font-bold text-slate-800">LiquorTrack</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-800 transition-colors">
              Log In
            </Link>
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-600 px-6 py-3 rounded-full text-sm font-semibold border border-blue-200/50 backdrop-blur-sm">
              💎 Choose Your Plan
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Simple, Transparent
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Pricing</span>
          </h1>
          
          <p className="text-xl text-slate-800/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start free 30-day trial. No credit card required.
            Cancel anytime with no questions asked.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-white/80 backdrop-blur-md rounded-xl p-1 border border-blue-100 shadow-lg">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                  billingPeriod === 'monthly'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('annually')}
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium relative ${
                  billingPeriod === 'annually'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
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
                  className={`relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    plan.popular
                      ? 'border-blue-400 shadow-2xl shadow-blue-500/20 scale-105 ring-2 ring-blue-200/50'
                      : 'border-blue-100 hover:border-blue-300 hover:shadow-xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center shadow-lg">
                        <Star className="h-4 w-4 mr-2" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-r ${plan.color} rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-slate-800 mb-3">{plan.name}</h3>
                    <div className="text-5xl font-bold text-slate-800 mb-3">
                      ${billingPeriod === 'monthly' ? price : price.toFixed(0)}
                      <span className="text-xl text-slate-500 font-normal">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {billingPeriod === 'annually' && (
                      <div className="text-green-500 text-sm font-medium bg-green-50 px-3 py-1 rounded-full inline-block">
                        ${monthlyEquivalent.toFixed(0)}/month • Save ${annualSavings.toFixed(0)}/year
                      </div>
                    )}
                    <p className="text-slate-600 mt-4 text-lg">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : getSignupUrl(index)}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center group text-center text-lg ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-blue-600 border-2 border-blue-200 hover:border-blue-300'
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

      {/* Features Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for the hospitality industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Trusted by industry leaders
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See what our customers say about LiquorTrack
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 text-lg leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-slate-800">{testimonial.name}</div>
                  <div className="text-slate-600">{testimonial.role} at {testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about LiquorTrack
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Can I cancel my subscription anytime?</h3>
              <p className="text-slate-600">Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Is there a free trial?</h3>
              <p className="text-slate-600">Yes, all plans come with a free 30-day trial. No credit card required to start.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Do you offer support?</h3>
              <p className="text-slate-600">Yes, we offer email support for all plans. Professional and Enterprise plans include priority support.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Can I upgrade or downgrade my plan?</h3>
              <p className="text-slate-600">Yes, you can change your plan at any time. Changes take effect immediately and are prorated.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-700 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-slate-800" />
              </div>
              <span className="text-xl font-bold text-slate-800">LiquorTrack</span>
            </Link>
            
            <div className="text-slate-500 text-center md:text-right">
              <p>&copy; 2024 LiquorTrack. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
