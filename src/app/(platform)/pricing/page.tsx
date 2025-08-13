'use client'

import Link from 'next/link'
import { Check, Star, Zap, Shield, Users, Building2, ArrowRight } from 'lucide-react'
import { useState } from 'react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc] via-[#f7fafc] to-[#edf2f7]">
      {/* Glassmorphic Bubble Navigation - Mofin Style */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl"
           style={{
             background: 'linear-gradient(135deg, rgba(247,250,252,0.9) 0%, rgba(237,242,247,0.85) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(26, 54, 93, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
           }}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-[#d69e2e] to-[#b7791f] rounded-lg flex items-center justify-center shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)',
                   boxShadow: '0 4px 12px rgba(214, 158, 46, 0.25)'
                 }}>
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Hospitality Hub</span>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Home</Link>
            <Link href="/#apps" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Apps</Link>
            <Link href="/#features" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Features</Link>
            <Link href="/pricing" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Pricing</Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Contact</Link>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm px-3 py-1.5">
              Sign In
            </Link>
            <button 
              onClick={() => window.location.href = '/signup'}
              className="px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm text-white"
              style={{
                background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(214, 158, 46, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.25)';
              }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Luxury Tones */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-[#f7fafc]/60 to-[#edf2f7]/60 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-[#edf2f7]/60 to-[#f7fafc]/60 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#f7fafc] text-[#1a365d] px-4 py-2 rounded-full text-sm font-medium border border-[#a0aec0]/40">
              <Star className="w-4 h-4 fill-current" />
              Flexible App-Based Pricing
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Simple, Affordable Pricing
                <span className="block text-[#d69e2e]">For Exclusive Clubs</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Pay only for the apps you need. Start with one app and add more as your business grows. 
                All apps work together seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Each App Designed for Success
            </h2>
            <p className="text-lg text-slate-600">
              Professional tools with real hospitality data and workflows.
            </p>
          </div>

          <div className="flex justify-center items-center space-x-6">
            {/* Inventory App Preview */}
            <div className="w-52 h-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-4 bg-gray-900 rounded-t-xl"></div>
              <div className="bg-gradient-to-r from-[#1a365d] to-[#2d3748] p-3 text-white">
                <h3 className="font-bold text-sm">Liquor Inventory</h3>
                <p className="text-[#a0aec0] text-xs">Manhattan Club</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Grey Goose</div>
                  <div className="text-[#d69e2e]">Low: 23 bottles</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Macallan 18</div>
                  <div className="text-green-600">Stock: 8 bottles</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Dom Pérignon</div>
                  <div className="text-red-600">Critical: 3</div>
                </div>
                <div className="bg-[#f7fafc] p-2 rounded text-xs text-center border border-[#a0aec0]/30">
                  <div className="text-[#1a365d] font-medium">$29/month</div>
                </div>
              </div>
            </div>

            {/* Reservations App Preview */}
            <div className="w-52 h-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-4 bg-gray-900 rounded-t-xl"></div>
              <div className="bg-gradient-to-r from-[#1a365d] to-[#2d3748] p-3 text-white">
                <h3 className="font-bold text-sm">Reservations</h3>
                <p className="text-[#a0aec0] text-xs">The Capital Grille</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">7:30 PM - Table 12</div>
                  <div className="text-gray-500">Johnson (4)</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">8:00 PM - Table 5</div>
                  <div className="text-gray-500">Chen (2)</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">8:30 PM - VIP</div>
                  <div className="text-[#742a2a]">Corporate (6)</div>
                </div>
                <div className="bg-[#f7fafc] p-2 rounded text-xs text-center border border-[#a0aec0]/30">
                  <div className="text-[#1a365d] font-medium">Coming Soon</div>
                </div>
              </div>
            </div>

            {/* Members App Preview */}
            <div className="w-52 h-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-4 bg-gray-900 rounded-t-xl"></div>
              <div className="bg-gradient-to-r from-[#22543d] to-[#1a365d] p-3 text-white">
                <h3 className="font-bold text-sm">Member Database</h3>
                <p className="text-[#a0aec0] text-xs">Elite Country Club</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Sarah Williams</div>
                  <div className="text-green-600">VIP Member</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Michael Chen</div>
                  <div className="text-[#1a365d]">Gold Member</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Robert Davis</div>
                  <div className="text-[#742a2a]">Premium</div>
                </div>
                <div className="bg-[#f7fafc] p-2 rounded text-xs text-center border border-[#a0aec0]/30">
                  <div className="text-[#1a365d] font-medium">Coming Soon</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Pricing Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Individual App Pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start with any app and add more as needed. All apps include full platform features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Liquor Inventory App */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Liquor Inventory</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-900">$29</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Professional inventory management with barcode scanning and automated ordering.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Barcode scanning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Automated ordering
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Real-time analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Multi-location support
                </li>
              </ul>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="block w-full text-white text-center px-4 py-3 rounded-xl font-medium transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                  boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(214, 158, 46, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.25)';
                }}>
                Start Free Trial
              </button>
            </div>

            {/* Reservation Management App */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center mb-4 border border-[#a0aec0]/30">
                <Building2 className="w-6 h-6 text-[#1a365d]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Reservation Management</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-900">$39</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Table reservations, room bookings, and walk-in management.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Table management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Room bookings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Walk-in tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Guest notifications
                </li>
              </ul>
              <div className="w-full bg-[#f7fafc] text-[#1a365d] text-center px-4 py-3 rounded-xl font-medium border border-[#a0aec0]/30">
                Coming Soon
              </div>
            </div>

            {/* Member Database App */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Member Database</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-900">$49</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Comprehensive member management with family tracking and advanced search.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Member profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Family tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Advanced search
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Activity history
                </li>
              </ul>
              <div className="w-full bg-[#f7fafc] text-[#1a365d] text-center px-4 py-3 rounded-xl font-medium border border-[#a0aec0]/30">
                Coming Soon
              </div>
            </div>

            {/* POS System App */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-[#f7fafc] rounded-xl flex items-center justify-center mb-4 border border-[#a0aec0]/30">
                <Shield className="w-6 h-6 text-[#742a2a]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">POS System</h3>
              <div className="mb-4">
                <span className="text-2xl font-bold text-slate-900">$79</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Complete point-of-sale system integrated with inventory and member data.</p>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Payment processing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Inventory sync
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Member integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Sales analytics
                </li>
              </ul>
              <div className="w-full bg-gray-100 text-gray-700 text-center px-4 py-3 rounded-xl font-medium">
                Future
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Plans Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Platform Plans
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose a plan that fits your business size and needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$29</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">1 App of your choice</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">2 Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Basic Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Standard Features</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-[#f7fafc] hover:bg-[#edf2f7] text-[#1a365d] text-center px-6 py-3 rounded-xl font-medium transition-colors border border-[#a0aec0]/40">
                Start Free Trial
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-[#d69e2e] relative hover:shadow-2xl transition-all duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#1a365d] text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Professional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$99</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">All Apps Included</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">10 Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">API Access</span>
                </li>
              </ul>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="block w-full text-white text-center px-6 py-3 rounded-xl font-medium transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                  boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(214, 158, 46, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 54, 93, 0.25)';
                }}>
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$199</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">All Apps + Custom</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Unlimited Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Dedicated Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">Custom Integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-slate-600">SLA Guarantee</span>
                </li>
              </ul>
              <Link href="/contact" className="block w-full bg-[#f7fafc] hover:bg-[#edf2f7] text-[#1a365d] text-center px-6 py-3 rounded-xl font-medium transition-colors border border-[#a0aec0]/40">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I start with just one app?</h3>
              <p className="text-slate-600">Yes! You can start with any single app and add more as your business grows. Each app works independently but also integrates seamlessly with others.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Is there a free trial?</h3>
              <p className="text-slate-600">Yes, all plans include a 30-day free trial. No credit card required to start.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I change my plan later?</h3>
              <p className="text-slate-600">Absolutely! You can upgrade, downgrade, or add/remove apps at any time. Changes take effect immediately.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">What's included in the platform?</h3>
              <p className="text-slate-600">All plans include the core platform features: user management, security, analytics, support, and seamless app integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-[#1a365d] to-[#2d3748] rounded-2xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Choose the plan that fits your business and start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-[#1a365d] hover:bg-[#edf2f7] px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-xl flex items-center gap-2 justify-center group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center gap-2 justify-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#d69e2e] to-[#b7791f] rounded-lg flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)',
                       boxShadow: '0 4px 12px rgba(214, 158, 46, 0.25)'
                     }}>
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-bold text-slate-900">Hospitality Hub</span>
              </div>
              <p className="text-slate-600 text-sm">
                Complete hospitality management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Apps</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Member Database</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">POS System</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/about" className="hover:text-slate-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2024 Hospitality Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
