'use client'

import Link from 'next/link'
import {
  Package,
  BarChart3,
  Smartphone,
  Users,
  Shield,
  Check,
  ArrowRight,
  Scan,
  Bell,
  TrendingUp,
  FileSpreadsheet,
  MapPin,
  Clock,
  Layers,
  Zap,
  Star,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LiquorInventoryPage() {
  const { user, loading } = useAuth()
  const features = [
    {
      icon: Scan,
      title: 'Barcode Scanning',
      description: 'Scan bottles instantly with your phone camera. Add items in seconds, not minutes.'
    },
    {
      icon: Bell,
      title: 'Smart Stock Alerts',
      description: 'Get notified when items run low. Never run out of your best sellers again.'
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Track trends, spot patterns, and make data-driven purchasing decisions.'
    },
    {
      icon: FileSpreadsheet,
      title: 'Export to Excel',
      description: 'One-click exports for accounting, ordering, or sharing with your team.'
    },
    {
      icon: MapPin,
      title: 'Multi-Location Support',
      description: 'Manage inventory across multiple bars, storage rooms, or locations.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Role-based access for owners, managers, and staff with PIN protection.'
    },
  ]

  const benefits = [
    { stat: '75%', label: 'Less time counting' },
    { stat: '30%', label: 'Reduce waste' },
    { stat: '50%', label: 'Faster ordering' },
  ]

  const useCases = [
    {
      title: 'Bars & Nightclubs',
      description: 'Track spirits, mixers, and garnishes across multiple bar stations.',
      icon: '🍸'
    },
    {
      title: 'Restaurants',
      description: 'Manage wine lists, spirits, and beverage inventory with ease.',
      icon: '🍽️'
    },
    {
      title: 'Hotels',
      description: 'Coordinate inventory across lobbies, room service, and event spaces.',
      icon: '🏨'
    },
    {
      title: 'Event Venues',
      description: 'Track consumption for events, weddings, and corporate functions.',
      icon: '🎉'
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
            <Link href="/use-cases/liquor-inventory" className="text-sm text-[#FF6B35] font-medium">Liquor Inventory</Link>
            <Link href="/use-cases/consumption-tracker" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Consumption Tracker</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && user ? (
              <Link
                href="/apps"
                className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup?plan=professional" className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e55a2b] transition-colors">
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B35]/10 mb-6">
                <Package className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-sm text-[#FF6B35] font-medium">Liquor Inventory Management</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6" style={{ fontFamily: 'system-ui', lineHeight: 1.1 }}>
                Stop counting bottles.
                <span className="text-[#FF6B35]"> Start managing.</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                The modern way to manage bar inventory. Scan, track, and analyze your stock in real-time. Built for bars, restaurants, and hospitality professionals.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/signup?plan=professional"
                  className="bg-[#FF6B35] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#e55a2b] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
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
                    <h3 className="font-semibold text-gray-900">Inventory Overview</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live</span>
                  </div>

                  {/* Mock Inventory Items */}
                  <div className="space-y-3">
                    {[
                      { name: 'Grey Goose Vodka', qty: 12, status: 'good' },
                      { name: 'Hendricks Gin', qty: 4, status: 'low' },
                      { name: 'Don Julio 1942', qty: 8, status: 'good' },
                      { name: 'Macallan 18', qty: 2, status: 'critical' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{item.qty}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'good' ? 'bg-green-500' :
                            item.status === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-[#FF6B35]">248</p>
                      <p className="text-xs text-gray-500">Total Items</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-yellow-500">12</p>
                      <p className="text-xs text-gray-500">Low Stock</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                      <p className="text-2xl font-bold text-green-500">$24k</p>
                      <p className="text-xs text-gray-500">Value</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Scan className="w-5 h-5 text-[#FF6B35]" />
                  <span className="text-sm font-medium">Barcode Scanned</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-medium">Low Stock Alert</span>
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
            {benefits.map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-[#FF6B35] mb-2">{item.stat}</p>
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
              Everything you need to manage inventory
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built by hospitality professionals, for hospitality professionals. Every feature designed to save you time and money.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center mb-4">
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
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Set Up Your Spaces',
                description: 'Create storage areas for each bar, cellar, or location. Organize your inventory the way you work.',
                icon: Layers
              },
              {
                step: '2',
                title: 'Add Your Items',
                description: 'Scan barcodes or add manually. Import from spreadsheets if you have existing data.',
                icon: Scan
              },
              {
                step: '3',
                title: 'Track & Analyze',
                description: 'Count inventory with one tap. Get insights, alerts, and reports automatically.',
                icon: TrendingUp
              }
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="relative">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8 text-center">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold">
                      {item.step}
                    </div>
                    <Icon className="w-12 h-12 text-[#FF6B35] mx-auto mb-4 mt-2" />
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
              Built for Hospitality
            </h2>
            <p className="text-lg text-gray-600">
              From neighborhood bars to multi-location chains
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
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that fits your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-[700px] mx-auto">
            {/* Basic */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Basic</h3>
                  <p className="text-xs text-gray-500">For small venues</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$99</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> 5 storage areas
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> 500 items
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> 3 users
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-green-500" /> Barcode scanning
                </li>
              </ul>
              <Link href="/signup?plan=basic" className="block w-full text-center py-3 rounded-xl font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200 transition-all">
                Start Free Trial
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-[#FF6B35] p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FF6B35] text-white px-4 py-1 rounded-full text-xs font-bold">
                MOST POPULAR
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Professional</h3>
                  <p className="text-xs text-gray-500">Full features</p>
                </div>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$150</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> 15 storage areas
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> 2,500 items
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> 10 users
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-[#FF6B35]" /> Advanced analytics
                </li>
              </ul>
              <Link href="/signup?plan=professional" className="block w-full text-center py-3 rounded-xl font-semibold bg-[#FF6B35] text-white hover:bg-[#e55a2b] transition-all shadow-lg">
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center mt-8 text-gray-600">
            Need unlimited access?{' '}
            <Link href="/pricing" className="text-[#FF6B35] font-medium hover:underline">
              View all plans
            </Link>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-[700px] mx-auto">
          <div className="bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to modernize your inventory?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-md mx-auto">
              Join hospitality professionals who are saving hours every week with InvyEasy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup?plan=professional"
                className="bg-white text-[#FF6B35] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
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
