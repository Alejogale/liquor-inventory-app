'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  ArrowUpRight
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fafc]/60 via-white to-[#edf2f7]/60">
      {/* Glassmorphic Bubble Navigation - Luxury */}
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
            <a href="#apps" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Apps</a>
            <a href="#features" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Features</a>
            <Link href="/pricing" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Pricing</Link>
            <Link href="/contact" className="text-gray-700 hover:text-[#d69e2e] transition-colors font-medium text-sm">Contact</Link>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup" 
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
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Luxury Tones */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-[#f7fafc]/60 to-[#edf2f7]/60 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-[#edf2f7]/60 to-[#f7fafc]/60 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                {/* Enhanced Heading with Better Typography */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm mb-4"
                       style={{
                         background: 'linear-gradient(135deg, rgba(247,250,252,0.8) 0%, rgba(237,242,247,0.7) 100%)',
                         borderColor: 'rgba(160, 174, 192, 0.35)',
                         color: '#1a365d'
                       }}>
                    <Zap className="w-3.5 h-3.5" />
                    #1 Hospitality Platform
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[0.9] tracking-tight">
                    <span className="block text-gray-900">The Best &</span>
                    <span className="block text-gray-900">Easiest Apps</span>
                    <span className="block">for{' '}
                      <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)' }}>
                        Hospitality
                      </span>
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 font-medium mt-4">
                    Simple. Reliable. Affordable.
                  </p>
                </div>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl lg:max-w-none">
                  All-in-one hospitality software that's simple, reliable, and affordable. 
                  Manage inventory, reservations, members, POS systems, and more. 
                  <span className="block mt-2 text-lg">
                    <span className="text-[#d69e2e] font-semibold">8+ apps coming soon.</span> Need something custom? 
                    <Link href="/contact" className="text-[#1a365d] hover:text-[#2d3748] font-semibold underline">Just ask!</Link>
                  </span>
                </p>
              </div>
              
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup" 
                  className="px-10 py-5 rounded-xl font-bold text-white transition-all duration-300 text-center text-lg shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                    boxShadow: '0 8px 25px rgba(26, 54, 93, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(214, 158, 46, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(26, 54, 93, 0.25)';
                  }}>
                  Try the App Free
                  <ArrowRight className="inline-block w-5 h-5 ml-2" />
                </Link>
                <Link href="/pricing" 
                  className="px-8 py-5 rounded-xl font-semibold text-gray-700 border-2 border-gray-300 hover:border-[#d69e2e] transition-all duration-300 text-center bg-white hover:bg-[#f7fafc] text-lg">
                  View Pricing
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-500 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">30-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="font-medium">Setup in 5 minutes</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Multi-App Showcase */}
            <div className="relative lg:pl-8">
              {/* Stack of App Mockups */}
              <div className="relative">
                {/* Liquor Inventory App (Front) */}
                <div className="relative z-30 transform -rotate-2 hover:rotate-0 transition-transform duration-500"
                     style={{
                       background: 'linear-gradient(135deg, rgba(247,250,252,0.95) 0%, rgba(237,242,247,0.9) 100%)',
                       boxShadow: '0 25px 60px rgba(26, 54, 93, 0.12)',
                       borderRadius: '24px'
                     }}>
                  <div className="p-3">
                    <div className="bg-gray-900 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-sm">Liquor Inventory</div>
                        <Package className="w-4 h-4 text-[#d69e2e]" />
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-[#1a365d] to-[#2d3748] rounded-lg p-3">
                          <div className="text-[#a0aec0] text-xs">Items in Stock</div>
                          <div className="text-white text-lg font-bold">247</div>
                        </div>
                        <div className="bg-gradient-to-r from-[#742a2a] to-[#2d3748] rounded-lg p-3">
                          <div className="text-[#fed7d7] text-xs">Low Stock Items</div>
                          <div className="text-white text-lg font-bold">12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reservation App (Middle) */}
                <div className="absolute top-8 left-8 z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500"
                     style={{
                       background: 'linear-gradient(135deg, rgba(247,250,252,0.9) 0%, rgba(237,242,247,0.85) 100%)',
                       boxShadow: '0 20px 50px rgba(26, 54, 93, 0.12)',
                       borderRadius: '24px'
                     }}>
                  <div className="p-3">
                    <div className="bg-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-sm">Reservations</div>
                        <Calendar className="w-4 h-4 text-[#a0aec0]" />
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-[#1a365d] to-[#2d3748] rounded-lg p-3">
                          <div className="text-[#a0aec0] text-xs">Today's Bookings</div>
                          <div className="text-white text-lg font-bold">28</div>
                        </div>
                        <div className="bg-gradient-to-r from-[#22543d] to-[#1a365d] rounded-lg p-3">
                          <div className="text-[#c6f6d5] text-xs">Available Tables</div>
                          <div className="text-white text-lg font-bold">6</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Database App (Back) */}
                <div className="absolute top-16 left-16 z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500"
                     style={{
                       background: 'linear-gradient(135deg, rgba(247,250,252,0.85) 0%, rgba(240,253,244,0.8) 100%)',
                       boxShadow: '0 15px 40px rgba(34, 85, 61, 0.12)',
                       borderRadius: '24px'
                     }}>
                  <div className="p-3">
                    <div className="bg-gray-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-sm">Member Database</div>
                        <Users className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-[#22543d] to-[#1a365d] rounded-lg p-3">
                          <div className="text-green-100 text-xs">Active Members</div>
                          <div className="text-white text-lg font-bold">1,847</div>
                        </div>
                        <div className="bg-gradient-to-r from-[#22543d] to-[#1a365d] rounded-lg p-3">
                          <div className="text-emerald-100 text-xs">New This Month</div>
                          <div className="text-white text-lg font-bold">23</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-[#d69e2e] to-[#b7791f] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#a0aec0] to-[#718096] rounded-full shadow-lg animate-pulse"></div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* App Marketplace Section - Luxury Theme */}
      <section id="apps" className="py-20 relative overflow-hidden">
        {/* Background with Luxury Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f7fafc]/50 via-white to-[#edf2f7]/50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-[#f7fafc]/60 to-[#edf2f7]/60 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-[#edf2f7]/60 to-[#f7fafc]/60 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)' }}>
                Complete Suite of Hospitality Apps
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the apps you need. All seamlessly integrated, all working together.
            </p>
          </div>

          {/* App Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Liquor Inventory App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-[#d69e2e]/40 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(26, 54, 93, 0.08)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(247,250,252,0.9) 0%, rgba(237,242,247,0.85) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(26, 54, 93, 0.15)'
                   }}>
                <div className="p-1">
                  <div className="bg-gray-800 rounded p-1.5 space-y-1">
                    <div className="bg-[#1a365d] rounded-sm h-1.5"></div>
                    <div className="bg-[#742a2a] rounded-sm h-1"></div>
                    <div className="bg-[#d69e2e] rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)',
                     boxShadow: '0 4px 12px rgba(214, 158, 46, 0.25)'
                   }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Liquor Inventory</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Professional inventory management with barcode scanning and automated ordering.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  ✅ Available Now
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#d69e2e] group-hover:text-[#b7791f] transition-colors" />
              </div>
            </div>

            {/* Reservation Management App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-[#1a365d]/30 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(26, 54, 93, 0.08)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(247,250,252,0.9) 0%, rgba(239,246,255,0.85) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(26, 54, 93, 0.15)'
                   }}>
                <div className="p-1">
                  <div className="bg-slate-800 rounded p-1.5 space-y-1">
                    <div className="bg-[#1a365d] rounded-sm h-1.5"></div>
                    <div className="bg-[#22543d] rounded-sm h-1"></div>
                    <div className="bg-[#2d3748] rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                     boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)'
                   }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Reservation Management</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Table reservations, room bookings, and walk-in management for restaurants and clubs.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  ✅ Available Now
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#1a365d] group-hover:text-[#2d3748] transition-colors" />
              </div>
            </div>

            {/* Member Database App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-[#22543d]/30 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(34, 85, 61, 0.12)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(247,250,252,0.9) 0%, rgba(240,253,244,0.85) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(34, 85, 61, 0.15)'
                   }}>
                <div className="p-1">
                  <div className="bg-gray-800 rounded p-1.5 space-y-1">
                    <div className="bg-[#22543d] rounded-sm h-1.5"></div>
                    <div className="bg-[#38a169] rounded-sm h-1"></div>
                    <div className="bg-[#22543d] rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #22543d 0%, #1a365d 100%)',
                     boxShadow: '0 4px 12px rgba(34, 85, 61, 0.25)'
                   }}>
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Member Database</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Comprehensive member management with family tracking and advanced search.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  🚀 Coming Soon
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#22543d] group-hover:text-[#1a365d] transition-colors" />
              </div>
            </div>

            {/* POS System App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-[#742a2a]/30 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(116, 42, 42, 0.12)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(247,250,252,0.9) 0%, rgba(248,250,252,0.85) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(116, 42, 42, 0.15)'
                   }}>
                <div className="p-1">
                  <div className="bg-gray-800 rounded p-1.5 space-y-1">
                    <div className="bg-[#742a2a] rounded-sm h-1.5"></div>
                    <div className="bg-[#9f7aea] rounded-sm h-1"></div>
                    <div className="bg-[#742a2a] rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #742a2a 0%, #2d3748 100%)',
                     boxShadow: '0 4px 12px rgba(116, 42, 42, 0.25)'
                   }}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">POS System</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Complete point-of-sale system integrated with inventory and member data.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  📅 Planned
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#742a2a] group-hover:text-[#2d3748] transition-colors" />
              </div>
            </div>
          </div>

          {/* App Integration Benefits */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
              <Zap className="w-4 h-4" />
              All apps work together seamlessly
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative bg-gradient-to-br from-white via-[#f7fafc]/50 to-[#edf2f7]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)' }}>
                Why Choose Hospitality Hub?
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for hospitality businesses with features that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Security */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Floating Security Icons */}
              <div className="absolute top-4 right-4 flex space-x-1">
                <div className="w-3 h-3 bg-[#a0aec0] rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-[#cbd5e0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-[#e2e8f0] rounded-full opacity-60"></div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                     boxShadow: '0 8px 24px rgba(26, 54, 93, 0.25)'
                   }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">Enterprise-grade security with 99.9% uptime guarantee and daily backups.</p>
            </div>

            {/* Feature 2 - Analytics */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Mini Chart Visualization */}
              <div className="absolute top-4 right-4 w-12 h-8 flex items-end space-x-1">
                <div className="w-1 bg-green-400 h-3 rounded-sm"></div>
                <div className="w-1 bg-green-500 h-6 rounded-sm"></div>
                <div className="w-1 bg-green-400 h-4 rounded-sm"></div>
                <div className="w-1 bg-green-600 h-8 rounded-sm"></div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #22543d 0%, #1a365d 100%)',
                     boxShadow: '0 8px 24px rgba(34, 85, 61, 0.25)'
                   }}>
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real-time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">Comprehensive reporting and analytics across all your apps and data.</p>
            </div>

            {/* Feature 3 - Team Management */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Team Avatar Stack */}
              <div className="absolute top-4 right-4 flex -space-x-1">
                <div className="w-4 h-4 bg-[#a0aec0] rounded-full border border-white"></div>
                <div className="w-4 h-4 bg-[#cbd5e0] rounded-full border border-white"></div>
                <div className="w-4 h-4 bg-[#e2e8f0] rounded-full border border-white"></div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #742a2a 0%, #2d3748 100%)',
                     boxShadow: '0 8px 24px rgba(116, 42, 42, 0.25)'
                   }}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Team Management</h3>
              <p className="text-gray-600 leading-relaxed">Role-based access control with detailed activity tracking and permissions.</p>
            </div>

            {/* Feature 4 - Scalable Growth */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Growth Arrow */}
              <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center">
                <div className="w-6 h-1 bg-[#d69e2e] rounded-full relative">
                  <div className="absolute right-0 w-0 h-0 border-l-[4px] border-l-[#b7791f] border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex space-x-1">
                <div className="w-2 h-2 bg-[#f6e05e] rounded-sm"></div>
                <div className="w-2 h-3 bg-[#ecc94b] rounded-sm"></div>
                <div className="w-2 h-4 bg-[#d69e2e] rounded-sm"></div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)',
                     boxShadow: '0 8px 24px rgba(214, 158, 46, 0.25)'
                   }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Scalable Growth</h3>
              <p className="text-gray-600 leading-relaxed">Start with one app, add more as you grow. Flexible pricing for any size business.</p>
            </div>

            {/* Feature 5 - 24/7 Support */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Clock Hands */}
              <div className="absolute top-4 right-4 w-6 h-6 border-2 border-[#cbd5e0] rounded-full flex items-center justify-center">
                <div className="w-1 h-2 bg-[#a0aec0] rounded-full transform rotate-90"></div>
                <div className="w-1 h-1.5 bg-[#718096] rounded-full absolute"></div>
              </div>
              {/* 24/7 indicator */}
              <div className="absolute bottom-4 right-4 text-xs font-bold text-[#a0aec0]">24/7</div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                     boxShadow: '0 8px 24px rgba(26, 54, 93, 0.25)'
                   }}>
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">Dedicated support team available around the clock to help you succeed.</p>
            </div>

            {/* Feature 6 - Cost Effective */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Money Coins */}
              <div className="absolute top-4 right-4 flex space-x-1">
                <div className="w-3 h-3 bg-[#fed7d7] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <div className="w-3 h-3 bg-[#feb2b2] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Price Tag */}
              <div className="absolute bottom-4 left-4 w-6 h-4 bg-[#fed7d7] rounded-sm flex items-center justify-center">
                <div className="text-xs font-bold text-[#742a2a]">$</div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #742a2a 0%, #2d3748 100%)',
                     boxShadow: '0 8px 24px rgba(116, 42, 42, 0.25)'
                   }}>
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Cost Effective</h3>
              <p className="text-gray-600 leading-relaxed">Pay only for what you use. No hidden fees, no long-term contracts required.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)',
                 boxShadow: '0 25px 50px rgba(26, 54, 93, 0.25)'
               }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
            
            {/* Floating App Icons */}
            <div className="absolute top-6 left-6 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '0.5s' }}>
              <Package className="w-4 h-4 text-white" />
            </div>
            <div className="absolute top-12 right-20 w-6 h-6 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Calendar className="w-3 h-3 text-white" />
            </div>
            <div className="absolute bottom-8 left-12 w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm animate-bounce" style={{ animationDelay: '1s' }}>
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="absolute bottom-12 right-8 w-5 h-5 bg-white/15 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your<br />
                Hospitality Business?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of businesses already using Hospitality Hub to streamline operations, 
                reduce costs, and improve customer experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" 
                      className="bg-white text-[#1a365d] hover:bg-[#f7fafc] px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-2xl flex items-center gap-2 justify-center group border border-white">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center gap-2 justify-center backdrop-blur-sm">
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                     style={{
                       background: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)',
                     }}>
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Hospitality Hub</span>
              </div>
              <p className="text-gray-600 text-sm">
                Complete hospitality management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Apps</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">Member Database</a></li>
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">POS System</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-[#d69e2e] transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-[#d69e2e] transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/legal/privacy" className="hover:text-[#d69e2e] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-[#d69e2e] transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-[#d69e2e] transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Hospitality Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
