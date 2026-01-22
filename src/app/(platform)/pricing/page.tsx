'use client'

import Link from 'next/link'
import { Check, Star, Zap, Shield, Building2, ArrowRight, Sparkles, Package } from 'lucide-react'
import { useState } from 'react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  // Pricing data from database structure
  const tiers = [
    {
      id: 'personal',
      name: 'Personal',
      description: 'Perfect for home bars and personal collections',
      monthlyPrice: 19,
      yearlyPrice: 193,
      icon: Star,
      features: [
        '2 storage areas',
        '150 items',
        '1 user',
        'Mobile app access',
        'Basic reports',
        'Email support',
      ],
      highlighted: false,
      cta: 'Start Free Trial',
      ctaLink: '/signup',
    },
    {
      id: 'starter',
      name: 'Starter',
      description: 'Everything you need for a single venue',
      monthlyPrice: 89,
      yearlyPrice: 906,
      icon: Zap,
      features: [
        '5 storage areas',
        '500 items',
        '5 users',
        'Room-by-room counting',
        'Stock alerts',
        'Team collaboration',
        'Basic analytics',
      ],
      highlighted: false,
      cta: 'Start Free Trial',
      ctaLink: '/signup',
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Advanced features for large venues or 2-3 locations',
      monthlyPrice: 229,
      yearlyPrice: 2334,
      icon: Shield,
      badge: 'MOST POPULAR',
      features: [
        '15 storage areas',
        '2,000 items',
        '15 users',
        'Advanced analytics',
        'Custom reports',
        'Stock movement tracking',
        'Priority support',
        'Export to Excel',
      ],
      highlighted: true,
      cta: 'Start Free Trial',
      ctaLink: '/signup',
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For multi-location chains and high-volume operations',
      monthlyPrice: 499,
      yearlyPrice: 5087,
      icon: Building2,
      features: [
        '50 storage areas',
        '10,000 items',
        '50 users',
        'Multi-location management',
        'API access',
        'Custom integrations',
        'Dedicated account manager',
        'Monthly strategy call',
      ],
      highlighted: false,
      cta: 'Start Free Trial',
      ctaLink: '/signup',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Unlimited everything for major chains and venues',
      monthlyPrice: 1499,
      yearlyPrice: 15287,
      icon: Sparkles,
      badge: 'CONTACT SALES',
      features: [
        'Unlimited storage areas',
        'Unlimited items',
        'Unlimited users',
        'White-label options',
        'Custom development',
        'On-site training',
        '24/7 phone support',
        'SLA guarantee',
      ],
      highlighted: false,
      cta: 'Contact Sales',
      ctaLink: '/contact',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="nav-modern">
        <div className="container-max">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-headline text-primary">InvyEasy</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-muted hover:text-primary transition-colors font-medium">Home</Link>
              <Link href="/#features" className="text-muted hover:text-primary transition-colors font-medium">Features</Link>
              <Link href="/pricing" className="text-primary font-medium">Pricing</Link>
              <Link href="/contact" className="text-muted hover:text-primary transition-colors font-medium">Contact</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-muted hover:text-primary transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/signup" className="button-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-stone-gray">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-caption text-secondary">Professional Inventory Management</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-display text-primary">
                Simple, Transparent Pricing
                <span className="block text-secondary">That Scales With Your Business</span>
              </h1>
              <p className="text-body text-muted max-w-3xl mx-auto leading-relaxed">
                Start with what you need today. Upgrade as you grow. All plans include 30-day free trial,
                no credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pb-8">
        <div className="container-max">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-body font-medium ${!isAnnual ? 'text-primary' : 'text-muted'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex items-center cursor-pointer"
            >
              <div className={`w-14 h-8 rounded-full transition-colors duration-200 ${isAnnual ? 'bg-accent' : 'bg-stone-gray'}`}>
                <div className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${isAnnual ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </button>
            <span className={`text-body font-medium ${isAnnual ? 'text-primary' : 'text-muted'}`}>
              Annual
              <span className="ml-2 text-accent font-bold">Save 15%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 bg-white">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon
              const price = isAnnual ? tier.yearlyPrice : tier.monthlyPrice
              const savings = tier.monthlyPrice * 12 - tier.yearlyPrice

              return (
                <div
                  key={tier.id}
                  className={`card-elevated relative flex flex-col ${tier.highlighted ? 'border-2 border-accent lg:scale-105 lg:z-10' : ''}`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      {tier.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${tier.highlighted ? 'bg-accent' : 'bg-surface'}`}>
                    <Icon className={`w-6 h-6 ${tier.highlighted ? 'text-white' : 'text-accent'}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-title text-primary mb-2">{tier.name}</h3>
                  <p className="text-caption text-muted mb-6 min-h-[40px]">{tier.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-primary">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-muted ml-2">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && savings > 0 && (
                      <p className="text-xs text-accent mt-1">
                        Save ${savings} per year
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-caption text-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href={tier.ctaLink}
                    className={`w-full text-center block ${tier.highlighted ? 'button-primary' : 'button-secondary'}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-surface">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-body text-muted">
              Trusted by restaurants, bars, hotels, and country clubs worldwide
            </p>
            <div className="flex items-center justify-center gap-8 text-primary opacity-60">
              <span className="text-sm font-medium">🍷 Restaurants</span>
              <span className="text-sm font-medium">🍸 Bars</span>
              <span className="text-sm font-medium">🏨 Hotels</span>
              <span className="text-sm font-medium">⛳ Country Clubs</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-headline text-primary">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-title text-primary mb-2">What's a storage area?</h3>
                <p className="text-body text-muted">
                  A storage area can be any room or location where you store inventory - like Main Bar, Wine Cellar,
                  Kitchen Storage, Pool Bar, or separate restaurant locations.
                </p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">Is there a free trial?</h3>
                <p className="text-body text-muted">
                  Yes! All plans include a 14-day free trial. No credit card required to start.
                </p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">Can I change my plan later?</h3>
                <p className="text-body text-muted">
                  Absolutely! You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.
                </p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">What if I need more storage areas?</h3>
                <p className="text-body text-muted">
                  Simply upgrade to the next tier! If you need something custom, Enterprise plan offers unlimited everything.
                </p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">Do you offer discounts?</h3>
                <p className="text-body text-muted">
                  Yes! Annual plans save 15%. We also offer special pricing for nonprofits, educational institutions,
                  and early-stage businesses. Contact sales for details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing bg-surface">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-elevated bg-white">
              <h2 className="text-headline text-accent mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-body text-primary mb-8">
                Join hundreds of venues managing their inventory with InvyEasy. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="button-primary px-8 py-4 text-lg font-semibold flex items-center gap-2 justify-center group"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="button-secondary px-8 py-4 text-lg font-semibold"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-gray py-12">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">I</span>
                </div>
                <span className="text-title text-primary">InvyEasy</span>
              </div>
              <p className="text-caption text-muted">
                Professional liquor inventory management for modern venues.
              </p>
            </div>

            <div>
              <h3 className="text-title text-primary mb-4">Product</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/#features" className="hover:text-accent transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Sales</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-title text-primary mb-4">Company</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-title text-primary mb-4">Legal</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-gray mt-8 pt-8 text-center text-caption text-muted">
            <p>&copy; 2025 InvyEasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
