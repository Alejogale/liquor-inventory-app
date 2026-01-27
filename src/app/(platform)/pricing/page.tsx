'use client'

import Link from 'next/link'
import { Check, ArrowRight, Package, BarChart3, Users, Smartphone, Shield, Building2 } from 'lucide-react'
import Script from 'next/script'

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      {/* Header */}
      <header className="fixed w-full top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-gray-200/50" style={{ padding: '12px 0' }}>
        <nav className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'system-ui' }}>
              InvyEasy
            </span>
            <span className="text-xs text-gray-400 font-medium">by AIGENZ</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/use-cases/liquor-inventory" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Liquor Inventory</Link>
            <Link href="/use-cases/consumption-tracker" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Consumption Tracker</Link>
            <Link href="/pricing" className="text-sm text-[#FF6B35] font-medium">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Stripe Pricing Table Script */}
      <Script async src="https://js.stripe.com/v3/pricing-table.js" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-gray-200/50 mb-6">
            <Package className="w-4 h-4 text-[#FF6B35]" />
            <span className="text-sm text-gray-600">Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4" style={{ fontFamily: 'system-ui' }}>
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Start with what you need today. Upgrade as you grow. All plans include a 30-day free trial.
          </p>
        </div>
      </section>

      {/* Stripe Pricing Table */}
      <section className="pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* @ts-expect-error - Stripe custom element */}
          <stripe-pricing-table
            pricing-table-id="prctbl_1Su0dBGp6QH8POrPuli88mFg"
            publishable-key="pk_test_51RraBbGp6QH8POrPKBX74oWuWBgbk2eyqu2JTCQWPVT0DeafPQOECWJf1PNGQb8mjZ4c31KaN2bcpdaSN45oSXvD00Y04EptnJ"
          />
        </div>

        {/* Enterprise CTA */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-4">
              Need white-label solutions, custom integrations, or dedicated support for your organization?
            </p>
            <Link
              href="/contact?inquiry=enterprise"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all"
            >
              Contact Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Apps Overview */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Apps</h2>
            <p className="text-gray-600">Choose the tools that fit your business needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Liquor Inventory */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Liquor Inventory</h3>
              <p className="text-gray-600 mb-4">
                Complete inventory management with barcode scanning, multi-location support, and real-time analytics.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> Barcode scanning
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> Stock alerts
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> Team collaboration
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> Advanced analytics
                </li>
              </ul>
              <Link href="/use-cases/liquor-inventory" className="text-[#FF6B35] font-medium text-sm hover:underline flex items-center gap-1">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Consumption Tracker */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Consumption Tracker</h3>
              <p className="text-gray-600 mb-4">
                Track event consumption in real-time with customizable categories and instant email reports.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500" /> Event-based tracking
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500" /> Custom categories
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500" /> Real-time counters
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500" /> Email reports
                </li>
              </ul>
              <Link href="/use-cases/consumption-tracker" className="text-blue-500 font-medium text-sm hover:underline flex items-center gap-1">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-600">All plans include these essential features</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-white/30">
              <Smartphone className="w-10 h-10 text-[#FF6B35] mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Mobile Ready</h3>
              <p className="text-sm text-gray-600">Access from any device. iOS app for hands-free counting.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-white/30">
              <Users className="w-10 h-10 text-[#FF6B35] mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-gray-600">Add staff with role-based permissions and PIN access.</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-white/30">
              <Shield className="w-10 h-10 text-[#FF6B35] mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
              <p className="text-sm text-gray-600">Enterprise-grade security with real-time sync.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-[800px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What's included in the free trial?",
                a: "All plans include a 30-day free trial with full access to all features. No credit card required to start."
              },
              {
                q: "Can I switch plans later?",
                a: "Yes! You can upgrade or downgrade at any time. Changes take effect on your next billing cycle, and we'll prorate any differences."
              },
              {
                q: "What's a storage area?",
                a: "A storage area is any location where you keep inventory - like Main Bar, Wine Cellar, Kitchen, or even different restaurant locations."
              },
              {
                q: "Do you offer discounts for nonprofits?",
                a: "Yes! We offer special pricing for nonprofits and educational institutions. Contact us for details."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel anytime from your dashboard. You'll keep access until your billing period ends."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-white/30">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-[600px] mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Join businesses managing their inventory smarter with InvyEasy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-[#FF6B35] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e55a2b] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="bg-gray-100 text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200/50">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-semibold">InvyEasy</span>
              <span className="text-xs text-gray-400">by AIGENZ</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2025 InvyEasy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
