'use client'

import Link from 'next/link'
import {
  BarChart3,
  Smartphone,
  Users,
  Check,
  ArrowRight,
  Plus,
  Minus,
  Mail,
  Clock,
  Layers,
  Zap,
  Target,
  FileText,
  Timer,
  Hash,
  MousePointer,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function ConsumptionTrackerPage() {
  const { user, loading } = useAuth()
  const features = [
    {
      icon: MousePointer,
      title: 'One-Tap Counting',
      description: 'Just tap to count. No typing, no forms. As simple as using a clicker counter.'
    },
    {
      icon: Layers,
      title: 'Custom Categories',
      description: 'Create categories for any item - drinks, food, supplies, or anything you need to track.'
    },
    {
      icon: Timer,
      title: 'Real-Time Updates',
      description: 'See counts update instantly across all devices. Perfect for team coordination.'
    },
    {
      icon: Mail,
      title: 'Email Reports',
      description: 'Get detailed reports sent to your inbox automatically when your event ends.'
    },
    {
      icon: Clock,
      title: 'Event History',
      description: 'Access past events and compare consumption patterns over time.'
    },
    {
      icon: FileText,
      title: 'Export Data',
      description: 'Download your data anytime for invoicing, analysis, or record keeping.'
    },
  ]

  const useCases = [
    {
      title: 'Open Bar Events',
      description: 'Track drinks served at weddings, corporate events, and parties.',
      icon: '🍸'
    },
    {
      title: 'Catering',
      description: 'Monitor food consumption and beverage service in real-time.',
      icon: '🍽️'
    },
    {
      title: 'Festivals & Fairs',
      description: 'Count sales across multiple booths and vendors.',
      icon: '🎪'
    },
    {
      title: 'Conference Events',
      description: 'Track meal counts, coffee service, and snack consumption.',
      icon: '📊'
    },
  ]

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
            <Link href="/use-cases/consumption-tracker" className="text-sm text-blue-500 font-medium">Consumption Tracker</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link
                href="/apps"
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup?plan=starter" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 mb-6">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-500 font-medium">Consumption Tracking</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6" style={{ fontFamily: 'system-ui', lineHeight: 1.1 }}>
                Count anything.
                <span className="text-blue-500"> Track everything.</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                The simplest way to track consumption at events. One tap to count. Real-time totals. Instant reports. Perfect for open bars, catering, and events.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup?plan=starter"
                  className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="bg-white/80 backdrop-blur text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-white transition-all border border-gray-200 flex items-center justify-center gap-2"
                >
                  View Pricing
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> 30-day free trial
                </span>
                <span className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" /> No credit card
                </span>
              </div>
            </div>

            {/* Product Preview */}
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-6">
                {/* Mock App Interface */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Corporate Gala 2025</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>

                  {/* Mock Counter Items */}
                  <div className="space-y-3">
                    {[
                      { name: 'Signature Cocktails', count: 247, color: 'blue' },
                      { name: 'Beer & Wine', count: 183, color: 'amber' },
                      { name: 'Mocktails', count: 56, color: 'green' },
                      { name: 'Appetizers', count: 412, color: 'purple' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${
                            item.color === 'blue' ? 'from-blue-500 to-blue-600' :
                            item.color === 'amber' ? 'from-amber-500 to-amber-600' :
                            item.color === 'green' ? 'from-green-500 to-green-600' :
                            'from-purple-500 to-purple-600'
                          } rounded-lg flex items-center justify-center`}>
                            <Hash className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="font-bold text-xl text-gray-900 w-12 text-center">{item.count}</span>
                          <button className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-4 bg-blue-500 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Count</span>
                      <span className="text-3xl font-bold">898</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-blue-100 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Event started 2h 34m ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">+1 Cocktail</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Report Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 bg-white/50">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {[
              { stat: '1 Tap', label: 'To count' },
              { stat: 'Real-Time', label: 'Updates' },
              { stat: 'Instant', label: 'Reports' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-500 mb-2">{item.stat}</p>
                <p className="text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple by design, powerful by nature
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We stripped away everything you don&apos;t need. What&apos;s left is the fastest way to track consumption at any event.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three steps to smarter event tracking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create an Event',
                description: 'Name your event and add the categories you want to track. Takes less than a minute.',
                icon: Target
              },
              {
                step: '2',
                title: 'Tap to Count',
                description: 'During the event, just tap the + button each time you serve an item. Simple as that.',
                icon: Plus
              },
              {
                step: '3',
                title: 'Get Your Report',
                description: 'When the event ends, get a detailed breakdown sent straight to your email.',
                icon: Mail
              }
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="relative">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <Icon className="w-12 h-12 text-blue-500 mx-auto mb-4 mt-2" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Any Event
            </h2>
            <p className="text-lg text-gray-600">
              From intimate gatherings to large-scale events
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {useCases.map((useCase, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 flex items-start gap-4">
                <span className="text-4xl">{useCase.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-white/50">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Just what you need at an affordable price
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-blue-500 p-8 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
              BEST VALUE
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                <p className="text-gray-500">Everything you need to track events</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-gray-900">$25</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-blue-500" />
                <span>2 storage areas</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-blue-500" />
                <span>100 items</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Unlimited events</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Email reports</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Custom categories</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-5 h-5 text-blue-500" />
                <span>Real-time sync</span>
              </div>
            </div>

            <Link href="/signup?plan=starter" className="block w-full text-center py-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg">
              Start Free Trial
            </Link>

            <p className="text-center text-sm text-gray-500 mt-4">
              30-day free trial. No credit card required.
            </p>
          </div>

          <p className="text-center mt-8 text-gray-600">
            Need inventory management too?{' '}
            <Link href="/pricing" className="text-blue-500 font-medium hover:underline">
              View all plans
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to simplify your event tracking?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-md mx-auto">
              Join event professionals who trust InvyEasy for accurate, hassle-free consumption tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup?plan=starter"
                className="bg-white text-blue-500 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="mt-6 text-sm text-white/80">
              30-day free trial. No credit card required.
            </p>
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
