'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Star,
  Zap,
  Shield,
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Calendar,
  UserCheck,
  CreditCard,
  ArrowUpRight,
  Home,
  Heart,
  Briefcase,
  Smartphone,
  Globe,
  Lock,
  MessageCircle,
  ChevronDown,
  Play
} from 'lucide-react'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const router = useRouter()

  // Handle password reset redirect
  useEffect(() => {
    const handleAuthRedirect = () => {
      const hash = window.location.hash
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        // This is a password reset link, redirect to reset password page
        router.push(`/reset-password${hash}`)
      }
    }

    handleAuthRedirect()
  }, [])

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "Is this just for businesses?",
      answer: "No! Easy Inventory is perfect for personal use, hobbies, and businesses. Whether you're organizing your home pantry, tracking craft supplies, or managing a small retail store - we've got you covered."
    },
    {
      question: "Can I use it for multiple locations?",
      answer: "Absolutely! Track inventory across your home, office, storage units, and any other locations. Everything syncs seamlessly across all your devices."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! Full mobile access for counting and management. Count inventory on your phone, manage on any device. Perfect for quick updates while you're organizing."
    },
    {
      question: "Can I share with family or team members?",
      answer: "Yes! Invite family members, roommates, or team members to help manage your inventory. Everyone can contribute to keeping things organized."
    },
    {
      question: "What if I need to cancel?",
      answer: "No problem! You can cancel anytime. Contact our support team and we'll help you export your data if needed. No long-term contracts or hidden fees."
    }
  ]


  return (
    <div className="min-h-screen bg-white">
      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InvyEasy</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 transition-colors">Use Cases</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">FAQ</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-200 ${isMenuOpen ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900">Features</a>
              <a href="#use-cases" className="block text-gray-600 hover:text-gray-900">Use Cases</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900">How It Works</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#faq" className="block text-gray-600 hover:text-gray-900">FAQ</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-8">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Organize Everything You Own
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Easy Inventory<br />
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Management
              </span><br />
              for Everyone
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Track, count, and manage inventory for your home, hobby, or business. 
              Never lose track of what you own with our intuitive mobile-first system.
            </p>
            
            {/* Mission Statement */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-4xl mx-auto border border-orange-100 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-orange-500 mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed text-center">
                Making organization simple, smart, and accessible for everyone. Whether you're organizing your home pantry, 
                managing craft supplies, or running a small business - we believe everyone deserves powerful tools that 
                are easy to use and affordable. <strong className="text-orange-600">Simple. Smart. Organized.</strong>
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
          </div>
          
          {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600">
            <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm sm:text-base">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-sm sm:text-base">Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm sm:text-base">30-day free trial</span>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed for everyone - from home organizers to small business owners.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Mobile-First Design */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📱 Mobile-First Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Count inventory on your phone, manage on any device. Perfect for quick updates while you're organizing.
              </p>
            </div>

            {/* Real-Time Sync */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔄 Real-Time Sync</h3>
              <p className="text-gray-600 leading-relaxed">
                Works everywhere - home, office, storage units. All your data syncs instantly across all devices.
              </p>
            </div>

            {/* Smart Categories */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🏷️ Smart Categories</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize your way - pantry items, craft supplies, business inventory. Create custom categories that make sense to you.
              </p>
            </div>

            {/* Multi-Location */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🏢 Multi-Location Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Track inventory across home, office, storage units, and multiple locations seamlessly.
              </p>
            </div>

            {/* Team Access */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">👥 Team Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Share with family, roommates, or team members. Everyone can help keep things organized.
              </p>
            </div>

            {/* Analytics */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Smart Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                See what you have, what you need, and trends over time. Make smarter decisions about your inventory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Every Need
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how Easy Inventory's advanced features make organization effortless and efficient.
            </p>
          </div>

          <div className="space-y-20">
            {/* Barcode Scanner Feature */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  📱 Mobile Scanning
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Barcode Scanner
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We recommend using a dedicated barcode scanner for the best experience, but items can also be added manually. 
                  Scan barcodes to instantly add items to your inventory with all product details auto-filled.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Dedicated barcode scanner recommended</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Manual entry also available</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Auto-fills product details</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Lightning-fast scanning</span>
                  </li>
                </ul>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
                  <p className="text-sm text-gray-600 italic">
                    "I can scan my groceries as I put them away. No more forgetting what I have in the pantry!"
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-2">- Sarah, Home Organizer</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-orange-100">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Scan & Go</h4>
                  <p className="text-orange-100">Dedicated scanner recommended</p>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Item added to inventory</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Category auto-assigned</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Count updated instantly</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rooms & Locations Feature */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-orange-100">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white text-center">
                      <Building2 className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Home</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4 text-white text-center">
                      <Briefcase className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Office</p>
                      </div>
                    <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-white text-center">
                      <Home className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Storage</p>
                      </div>
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
                      <Package className="w-6 h-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Garage</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Pantry Items</span>
                      <span className="text-orange-600 font-medium">47 items</span>
                </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Office Supplies</span>
                      <span className="text-blue-600 font-medium">23 items</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Storage Boxes</span>
                      <span className="text-green-600 font-medium">12 items</span>
                    </div>
                  </div>
                </div>
                      </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  🏢 Multi-Location
                      </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Rooms & Locations
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Organize your inventory by rooms, locations, or any way that makes sense to you. 
                  Track items across your entire home, office, or multiple properties.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Unlimited rooms and locations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Room-specific counting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Cross-location reports</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Custom room organization</span>
                  </li>
                </ul>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
                  <p className="text-sm text-gray-600 italic">
                    "I can track my craft supplies in the studio, office supplies at work, and pantry items at home - all in one place!"
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-2">- Mike, Small Business Owner</p>
                    </div>
                  </div>
                </div>

            {/* Import & Export Feature */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  📊 Data Management
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Import & Export
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Easily import your existing inventory from spreadsheets or export your data for backup, 
                  analysis, or migration. No data loss, no manual entry.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">CSV import/export support</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Bulk data operations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Duplicate prevention</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Data validation & cleanup</span>
                  </li>
                </ul>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-green-100">
                  <p className="text-sm text-gray-600 italic">
                    "I imported my entire pantry inventory from my old spreadsheet in minutes. The duplicate detection saved me hours!"
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-2">- Jennifer, Home Organizer</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Data Import</h4>
                  <p className="text-gray-600">Upload your CSV file</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">File uploaded successfully</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      </div>
                    <span className="text-gray-700">247 items imported</span>
                      </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-gray-700">12 duplicates skipped</span>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Import Progress</span>
                    <span className="text-green-600 font-medium">100% Complete</span>
                </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Perfect for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're organizing your home, managing a hobby, or running a business - we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Home Organization */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🏠 Home Organization</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Pantry management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Garage inventory
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Closet organization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Emergency supplies
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                Never lose track of what you own. Organize your entire home with ease and always know what you have.
              </p>
            </div>

            {/* Hobby & Collectibles */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎨 Hobby & Collectibles</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Craft supplies
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Sports equipment
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Books & games
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Collectibles
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                Track craft supplies, sports equipment, books, games, and collectibles with ease across multiple rooms.
              </p>
            </div>

            {/* Small Business */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💼 Small Business</h3>
              <ul className="space-y-3 text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Retail stores
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Home-based businesses
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Side hustles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Multi-location ops
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                Perfect for retail stores, home-based businesses, and side hustles. Track everything professionally.
              </p>
            </div>
          </div>
              </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How Easy Inventory Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in minutes with our simple 3-step process. No complex setup, no learning curve.
            </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Set Up Your Spaces</h3>
              <p className="text-gray-600 leading-relaxed">
                Create rooms and locations that match your life - pantry, garage, office, storage units. 
                Organize the way that makes sense to you.
              </p>
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-2">Example rooms:</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">Kitchen</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Office</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Garage</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Your Items</h3>
                <p className="text-gray-600 leading-relaxed">
                  Scan barcodes with a dedicated scanner, import from spreadsheets, or add items manually. 
                  Create categories and organize everything your way.
                </p>
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-2">Quick ways to add:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-orange-500" />
                    <span>Scan with barcode scanner</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span>Import CSV files</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Add manually</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Track & Manage</h3>
              <p className="text-gray-600 leading-relaxed">
                Count inventory, generate reports, and stay organized. 
                Share with family or team members to keep everyone in sync.
              </p>
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-2">Stay organized with:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-green-500" />
                    <span>Smart reports</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Team sharing</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Real-time updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Everything You Need to Get Started
              </h3>
              <p className="text-lg text-gray-600">
                No complex setup, no learning curve. Just powerful features that work the way you do.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mobile Ready</h4>
                <p className="text-sm text-gray-600">Works perfectly on your phone</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
                <p className="text-sm text-gray-600">Your data is always protected</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
                <p className="text-sm text-gray-600">Instant updates and sync</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Team Friendly</h4>
                <p className="text-sm text-gray-600">Share with family or colleagues</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              One plan. Everything included. No hidden fees.
              </p>
            </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Most Popular
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Easy Inventory Pro</h3>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <span className={`text-sm ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Monthly</span>
                <div className="relative">
                  <button 
                    onClick={() => setIsAnnual(!isAnnual)}
                    className="flex items-center cursor-pointer"
                  >
                    <div className="relative">
                      <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ${isAnnual ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                      <div className={`dot absolute top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-md ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`}></div>
                    </div>
                  </button>
                </div>
                <span className={`text-sm ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                  Annual <span className="text-orange-600 font-medium">Save $20</span>
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
                {!isAnnual ? (
                  <>
                    <span className="text-4xl sm:text-5xl font-bold text-gray-900">$10</span>
                    <span className="text-gray-600">/month</span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-gray-900">$100</span>
                      <span className="text-gray-600">/year</span>
                    </div>
                    <div className="text-sm mt-2 sm:mt-0 sm:ml-4 text-center sm:text-left">
                      <div className="text-gray-500 line-through">$120/year</div>
                      <div className="text-green-600 font-medium">Save $20</div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-gray-600">30-day free trial • No credit card required</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Unlimited inventory items</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Multi-location support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Team collaboration</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Advanced reporting</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Mobile app access</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Data export</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">Smart analytics</span>
            </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
              </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Easy Inventory
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      activeFAQ === index ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {activeFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
              </div>
            </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and never lose track of what you own again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/#faq" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-200 inline-flex items-center justify-center">
              <MessageCircle className="mr-2 w-5 h-5" />
              View FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">InvyEasy</span>
              </div>
              <p className="text-gray-400">
                Organize everything you own with our intuitive inventory management system.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/login" className="hover:text-white transition-colors">Sign In</a></li>
                <li><a href="/signup" className="hover:text-white transition-colors">Sign Up</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms & Liability</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InvyEasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}