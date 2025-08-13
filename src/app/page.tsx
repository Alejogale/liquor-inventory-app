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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-slate-50/20">
      {/* Glassmorphic Bubble Navigation - Mofin Style */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
           }}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                   boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                 }}>
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Hospitality Hub</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#apps" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Apps</a>
            <a href="#features" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Features</a>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Pricing</Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Contact</Link>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup" 
                  className="px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                    boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
                  }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mofin Style with Orange & Blue Tones */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-slate-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-slate-200/20 to-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                {/* Enhanced Heading with Better Typography */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm mb-4"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                         borderColor: 'rgba(255, 119, 0, 0.2)',
                         color: '#ea580c'
                       }}>
                    <Zap className="w-3.5 h-3.5" />
                    #1 Hospitality Platform
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-[0.9] tracking-tight">
                    <span className="block text-gray-900">The Best &</span>
                    <span className="block text-gray-900">Easiest Apps</span>
                    <span className="block">for{' '}
                      <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent">
                        Hospitality
                      </span>
                    </span>
                  </h1>
                </div>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl lg:max-w-none">
                  All-in-one hospitality software that's simple, reliable, and affordable. 
                  Manage inventory, reservations, members, POS systems, and more. 
                  <span className="block mt-2 text-lg">
                    <span className="text-orange-600 font-semibold">8+ apps coming soon.</span> Need something custom? 
                    <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-semibold underline">Just ask!</Link>
                  </span>
                </p>
              </div>
              
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup" 
                  className="px-10 py-5 rounded-xl font-bold text-white transition-all duration-300 text-center text-lg shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                    boxShadow: '0 8px 25px rgba(255, 119, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 119, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 119, 0, 0.3)';
                  }}>
                  Try the App Free
                  <ArrowRight className="inline-block w-5 h-5 ml-2" />
                </Link>
                <Link href="/pricing" 
                  className="px-8 py-5 rounded-xl font-semibold text-gray-700 border-2 border-gray-300 hover:border-orange-500 transition-all duration-300 text-center bg-white hover:bg-orange-50 text-lg">
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
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,247,237,0.9) 100%)',
                       boxShadow: '0 25px 60px rgba(255, 119, 0, 0.15)',
                       borderRadius: '24px'
                     }}>
                  <div className="p-3">
                    <div className="bg-gray-900 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-sm">Liquor Inventory</div>
                        <Package className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3">
                          <div className="text-orange-100 text-xs">Items in Stock</div>
                          <div className="text-white text-lg font-bold">247</div>
                        </div>
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-3">
                          <div className="text-red-100 text-xs">Low Stock Items</div>
                          <div className="text-white text-lg font-bold">12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reservation App (Middle) */}
                <div className="absolute top-8 left-8 z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.85) 100%)',
                       boxShadow: '0 20px 50px rgba(59, 130, 246, 0.15)',
                       borderRadius: '24px'
                     }}>
                  <div className="p-3">
                    <div className="bg-slate-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-sm">Reservations</div>
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3">
                          <div className="text-blue-100 text-xs">Today's Bookings</div>
                          <div className="text-white text-lg font-bold">28</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3">
                          <div className="text-purple-100 text-xs">Available Tables</div>
                          <div className="text-white text-lg font-bold">6</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member Database App (Back) */}
                <div className="absolute top-16 left-16 z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(240,253,244,0.8) 100%)',
                       boxShadow: '0 15px 40px rgba(34, 197, 94, 0.15)',
                       borderRadius: '24px'
                     }}>
                  <div className="p-3">
                    <div className="bg-gray-800 rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-white font-semibold text-sm">Member Database</div>
                        <Users className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3">
                          <div className="text-green-100 text-xs">Active Members</div>
                          <div className="text-white text-lg font-bold">1,847</div>
                        </div>
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-3">
                          <div className="text-emerald-100 text-xs">New This Month</div>
                          <div className="text-white text-lg font-bold">23</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full shadow-lg animate-pulse"></div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* App Marketplace Section - Orange Theme */}
      <section id="apps" className="py-20 relative overflow-hidden">
        {/* Background with Orange Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/30 via-white to-slate-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-slate-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-slate-200/20 to-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-orange-800 to-slate-800 bg-clip-text text-transparent">
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
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-orange-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(255, 119, 0, 0.1)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(255, 119, 0, 0.2)'
                   }}>
                <div className="p-1">
                  <div className="bg-gray-800 rounded p-1.5 space-y-1">
                    <div className="bg-orange-500 rounded-sm h-1.5"></div>
                    <div className="bg-red-400 rounded-sm h-1"></div>
                    <div className="bg-orange-400 rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                     boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                   }}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Liquor Inventory</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Professional inventory management with barcode scanning and automated ordering.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  ✅ Available Now
                </span>
                <ArrowUpRight className="w-4 h-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
              </div>
            </div>

            {/* Reservation Management App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(59, 130, 246, 0.1)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.8) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                   }}>
                <div className="p-1">
                  <div className="bg-slate-800 rounded p-1.5 space-y-1">
                    <div className="bg-blue-500 rounded-sm h-1.5"></div>
                    <div className="bg-purple-400 rounded-sm h-1"></div>
                    <div className="bg-blue-400 rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                     boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                   }}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Reservation Management</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Table reservations, room bookings, and walk-in management for restaurants and clubs.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  ✅ Available Now
                </span>
                <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            {/* Member Database App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-green-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(34, 197, 94, 0.1)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.8) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)'
                   }}>
                <div className="p-1">
                  <div className="bg-gray-800 rounded p-1.5 space-y-1">
                    <div className="bg-green-500 rounded-sm h-1.5"></div>
                    <div className="bg-emerald-400 rounded-sm h-1"></div>
                    <div className="bg-green-400 rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                     boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                   }}>
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Member Database</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Comprehensive member management with family tracking and advanced search.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  🚀 Coming Soon
                </span>
                <ArrowUpRight className="w-4 h-4 text-green-500 group-hover:text-green-600 transition-colors" />
              </div>
            </div>

            {/* POS System App */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 group cursor-pointer relative overflow-hidden"
                 style={{
                   boxShadow: '0 8px 25px rgba(147, 51, 234, 0.1)'
                 }}>
              {/* Mini App Preview */}
              <div className="absolute top-4 right-4 w-16 h-20 transform rotate-12 group-hover:rotate-6 transition-transform duration-300"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)',
                     borderRadius: '8px',
                     boxShadow: '0 4px 12px rgba(147, 51, 234, 0.2)'
                   }}>
                <div className="p-1">
                  <div className="bg-gray-800 rounded p-1.5 space-y-1">
                    <div className="bg-purple-500 rounded-sm h-1.5"></div>
                    <div className="bg-violet-400 rounded-sm h-1"></div>
                    <div className="bg-purple-400 rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                     boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                   }}>
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">POS System</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">Complete point-of-sale system integrated with inventory and member data.</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  📅 Planned
                </span>
                <ArrowUpRight className="w-4 h-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
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
      <section id="features" className="py-20 relative bg-gradient-to-br from-white via-orange-50/20 to-blue-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-orange-800 to-slate-800 bg-clip-text text-transparent">
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
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-blue-200 rounded-full opacity-60"></div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                     boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
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
                     background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                     boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
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
                <div className="w-4 h-4 bg-purple-400 rounded-full border border-white"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full border border-white"></div>
                <div className="w-4 h-4 bg-purple-600 rounded-full border border-white"></div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                     boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)'
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
                <div className="w-6 h-1 bg-orange-300 rounded-full relative">
                  <div className="absolute right-0 w-0 h-0 border-l-[4px] border-l-orange-400 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"></div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 flex space-x-1">
                <div className="w-2 h-2 bg-orange-300 rounded-sm"></div>
                <div className="w-2 h-3 bg-orange-400 rounded-sm"></div>
                <div className="w-2 h-4 bg-orange-500 rounded-sm"></div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                     boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                   }}>
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Scalable Growth</h3>
              <p className="text-gray-600 leading-relaxed">Start with one app, add more as you grow. Flexible pricing for any size business.</p>
            </div>

            {/* Feature 5 - 24/7 Support */}
            <div className="text-center space-y-4 p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
              {/* Clock Hands */}
              <div className="absolute top-4 right-4 w-6 h-6 border-2 border-indigo-300 rounded-full flex items-center justify-center">
                <div className="w-1 h-2 bg-indigo-400 rounded-full transform rotate-90"></div>
                <div className="w-1 h-1.5 bg-indigo-500 rounded-full absolute"></div>
              </div>
              {/* 24/7 indicator */}
              <div className="absolute bottom-4 right-4 text-xs font-bold text-indigo-400">24/7</div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                     boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
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
                <div className="w-3 h-3 bg-red-300 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
                <div className="w-3 h-3 bg-red-400 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              {/* Price Tag */}
              <div className="absolute bottom-4 left-4 w-6 h-4 bg-red-200 rounded-sm flex items-center justify-center">
                <div className="text-xs font-bold text-red-600">$</div>
              </div>
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"
                   style={{
                     background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                     boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
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
                 background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                 boxShadow: '0 25px 50px rgba(255, 119, 0, 0.3)'
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
                      className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-2xl flex items-center gap-2 justify-center group border border-white">
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
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
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
                <li><a href="#" className="hover:text-orange-600 transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Member Database</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">POS System</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-orange-600 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/legal/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-orange-600 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Cookie Policy</a></li>
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
