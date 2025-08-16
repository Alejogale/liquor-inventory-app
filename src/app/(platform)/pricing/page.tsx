'use client'

import Link from 'next/link'
import { Check, Star, Zap, Shield, Users, Building2, ArrowRight, Package, BarChart3, Calendar, UserCheck } from 'lucide-react'
import { useState } from 'react'

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const toggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Clean Modern Navigation */}
      <nav className="nav-modern">
        <div className="container-max">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-headline text-primary">Hospitality Hub</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-muted hover:text-primary transition-colors font-medium">Home</Link>
              <Link href="/#apps" className="text-muted hover:text-primary transition-colors font-medium">Apps</Link>
              <Link href="/#features" className="text-muted hover:text-primary transition-colors font-medium">Features</Link>
              <Link href="/pricing" className="text-primary font-medium">Pricing</Link>
              <Link href="/contact" className="text-muted hover:text-primary transition-colors font-medium">Contact</Link>
            </div>
            
            {/* CTA Buttons */}
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

      {/* Hero Section - Clean Minimalist */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-stone-gray">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-caption text-secondary">Modern Business Solutions</span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-display text-primary">
                Simple, Transparent Pricing
                <span className="block text-secondary">For Modern Businesses</span>
              </h1>
              <p className="text-body text-muted max-w-3xl mx-auto leading-relaxed">
                Clean, professional hospitality management solutions designed for modern businesses. 
                Sophisticated tools with intuitive workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section - Clean Modern Style */}
      <section className="py-12 bg-surface">
        <div className="container-max">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-headline text-primary">
              Modern Business Applications
            </h2>
            <p className="text-body text-muted">
              Clean, professional hospitality management solutions.
            </p>
          </div>

          <div className="relative flex justify-center items-center space-x-8">
            {/* Liquor Inventory App (Front) - Hero Style */}
            <div className="relative z-30 transform -rotate-1 hover:rotate-0 transition-transform duration-500 card-elevated">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-sm">🍾 Liquor Inventory</div>
                  <Package className="w-4 h-4 text-accent" />
                </div>
                <div className="space-y-3">
                  <div className="bg-accent rounded-lg p-3">
                    <div className="text-white/80 text-xs">Items in Stock</div>
                    <div className="text-white text-lg font-bold">247</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-white/80 text-xs">Low Stock Items</div>
                    <div className="text-white text-lg font-bold">12</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consumption Sheet App (Middle) - Hero Style */}
            <div className="relative z-20 transform rotate-2 hover:rotate-0 transition-transform duration-500 card-elevated">
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-sm">📊 Consumption Sheet</div>
                  <BarChart3 className="w-4 h-4 text-accent" />
                </div>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-white/80 text-xs">Events Today</div>
                    <div className="text-white text-lg font-bold">3</div>
                  </div>
                  <div className="bg-accent rounded-lg p-3">
                    <div className="text-white/80 text-xs">Items Tracked</div>
                    <div className="text-white text-lg font-bold">156</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation App (Back) - Hero Style */}
            <div className="relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 card-elevated">
              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-sm">📅 Reservations</div>
                  <Calendar className="w-4 h-4 text-accent" />
                </div>
                <div className="space-y-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-white/80 text-xs">Today's Bookings</div>
                    <div className="text-white text-lg font-bold">28</div>
                  </div>
                  <div className="bg-accent rounded-lg p-3">
                    <div className="text-white/80 text-xs">Available Tables</div>
                    <div className="text-white text-lg font-bold">6</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-white text-xl">✨</span>
            </div>
          </div>
        </div>
      </section>

      {/* Individual App Pricing Section */}
      <section id="app-pricing" className="section-spacing bg-white">
        <div className="container-max">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-headline text-primary">
              Individual App Pricing
            </h2>
            <p className="text-body text-muted max-w-2xl mx-auto">
              Start with any app and add more as needed. All apps include full platform features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Liquor Inventory App */}
            <div className="card-elevated group">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-2">Liquor Inventory</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">$29</span>
                <span className="text-muted ml-2">/month</span>
              </div>
              <p className="text-body text-muted mb-4 leading-relaxed">Professional inventory management with barcode scanning and automated ordering.</p>
              <ul className="space-y-2 mb-6 text-caption text-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Barcode scanning
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Automated ordering
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Real-time analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Multi-location support
                </li>
              </ul>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="button-primary w-full"
              >
                Start Free Trial
              </button>
            </div>

            {/* Consumption Sheet App */}
            <div className="card-elevated group">
              <div className="w-12 h-12 bg-charcoal rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-2">Consumption Sheet</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">$39</span>
                <span className="text-muted ml-2">/month</span>
              </div>
              <p className="text-body text-muted mb-4 leading-relaxed">Real-time event consumption tracking with multi-window support and automated reporting.</p>
              <ul className="space-y-2 mb-6 text-caption text-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Multi-window tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Google Sheets integration
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Automated email reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Real-time quantity updates
                </li>
              </ul>
              <button 
                onClick={() => window.location.href = '/signup'}
                className="button-primary w-full"
              >
                Start Free Trial
              </button>
            </div>

            {/* Reservation Management App */}
            <div className="card-elevated group">
              <div className="w-12 h-12 bg-slate-gray rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-2">Reservation Management</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">$39</span>
                <span className="text-muted ml-2">/month</span>
              </div>
              <p className="text-body text-muted mb-4 leading-relaxed">Table reservations, room bookings, and walk-in management.</p>
              <ul className="space-y-2 mb-6 text-caption text-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Table management
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Room bookings
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Walk-in tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Guest notifications
                </li>
              </ul>
              <div className="w-full bg-stone-gray text-slate-gray text-center px-4 py-3 rounded-lg font-medium">
                Coming Soon
              </div>
            </div>

            {/* Member Database App */}
            <div className="card-elevated group">
              <div className="w-12 h-12 bg-charcoal rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-2">Member Database</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary">$49</span>
                <span className="text-muted ml-2">/month</span>
              </div>
              <p className="text-body text-muted mb-4 leading-relaxed">Comprehensive member management with family tracking and advanced search.</p>
              <ul className="space-y-2 mb-6 text-caption text-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Member profiles
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Family tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Advanced search
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  Activity history
                </li>
              </ul>
              <div className="w-full bg-stone-gray text-slate-gray text-center px-4 py-3 rounded-lg font-medium">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Plans Section */}
      <section className="section-spacing bg-surface">
        <div className="container-max">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-headline text-primary">
              Platform Plans
            </h2>
            <p className="text-body text-muted max-w-2xl mx-auto">
              Choose the perfect plan that scales with your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="card-elevated">
              <div className="text-center mb-8">
                <h3 className="text-title text-primary mb-4">Starter</h3>
                <p className="text-body text-muted mb-6">Perfect for small businesses getting started</p>
                
                {/* Pricing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className={`text-caption ${!isAnnual ? 'text-primary font-medium' : 'text-muted'}`}>Monthly</span>
                  <div className="relative">
                    <button 
                      onClick={toggleBilling}
                      className="flex items-center cursor-pointer"
                    >
                      <div className="relative">
                        <div className={`block w-14 h-8 rounded-full transition-colors duration-200 ${isAnnual ? 'bg-accent' : 'bg-stone-gray'}`}></div>
                        <div className={`dot absolute top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out shadow-md ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`}></div>
                      </div>
                    </button>
                  </div>
                  <span className={`text-caption ${isAnnual ? 'text-primary font-medium' : 'text-muted'}`}>
                    Annual <span className="text-accent font-medium">Save 30%</span>
                  </span>
                </div>
                
                <div className="mb-4">
                  {!isAnnual ? (
                    <>
                      <span className="text-4xl font-bold text-primary">$100</span>
                      <span className="text-muted ml-2 text-xl">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-primary">$840</span>
                      <span className="text-muted ml-2 text-xl">/year</span>
                    </>
                  )}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 text-body text-muted">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Access to 3 Apps</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Up to 5 Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Basic Analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Email Support</span>
                </li>
              </ul>
              
              <Link href="/signup" className="button-secondary w-full text-center">
                Get Started
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="card-elevated relative border-2 border-accent">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-white px-6 py-2 rounded-full text-caption font-medium">
                Most Popular
              </div>
              
              <div className="text-center mb-8">
                <h3 className="text-title text-primary mb-4">Professional</h3>
                <p className="text-body text-muted mb-6">Great for growing hospitality businesses</p>
                
                <div className="mb-4">
                  {!isAnnual ? (
                    <>
                      <span className="text-4xl font-bold text-primary">$450</span>
                      <span className="text-muted ml-2 text-xl">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-primary">$3,780</span>
                      <span className="text-muted ml-2 text-xl">/year</span>
                    </>
                  )}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 text-body text-muted">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Access to 5 Apps</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Up to 15 Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Advanced Analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>API Access</span>
                </li>
              </ul>
              
              <Link href="/signup" className="button-primary w-full text-center">
                Get Started
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="card-elevated">
              <div className="text-center mb-8">
                <h3 className="text-title text-primary mb-4">Enterprise</h3>
                <p className="text-body text-muted mb-6">Complete solution for large organizations</p>
                
                <div className="mb-4">
                  {!isAnnual ? (
                    <>
                      <span className="text-4xl font-bold text-primary">$999</span>
                      <span className="text-muted ml-2 text-xl">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-primary">$8,388</span>
                      <span className="text-muted ml-2 text-xl">/year</span>
                    </>
                  )}
                </div>
              </div>
              
              <ul className="space-y-4 mb-8 text-body text-muted">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>All Apps + Future Releases</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Unlimited Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Custom App Development</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Partnership & Tailored Solutions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Dedicated Account Manager</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>White-label Options</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>SLA Guarantee</span>
                </li>
              </ul>
              
              <Link href="/contact" className="button-primary w-full text-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-headline text-primary">
                Frequently Asked Questions
              </h2>
              <p className="text-body text-muted">
                Everything you need to know about our pricing and plans.
              </p>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="text-title text-primary mb-2">Can I start with just one app?</h3>
                <p className="text-body text-muted">Yes! You can start with any single app and add more as your business grows. Each app works independently but also integrates seamlessly with others.</p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">Is there a free trial?</h3>
                <p className="text-body text-muted">Yes, all plans include a 30-day free trial. No credit card required to start.</p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">Can I change my plan later?</h3>
                <p className="text-body text-muted">Absolutely! You can upgrade, downgrade, or add/remove apps at any time. Changes take effect immediately.</p>
              </div>

              <div className="card">
                <h3 className="text-title text-primary mb-2">What's included in the platform?</h3>
                <p className="text-body text-muted">All plans include the core platform features: user management, security, analytics, support, and seamless app integration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-surface">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-elevated bg-white">
              <h2 className="text-headline text-accent mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-body text-primary mb-8">
                Choose the plan that fits your business and start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="button-primary px-8 py-4 text-lg font-semibold flex items-center gap-2 justify-center group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="button-secondary px-8 py-4 text-lg font-semibold flex items-center gap-2 justify-center">
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
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-title text-primary">Hospitality Hub</span>
              </div>
              <p className="text-caption text-muted">
                Complete hospitality management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="text-title text-primary mb-4">Apps</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><a href="#" className="hover:text-accent transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Consumption Sheet</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Member Database</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-title text-primary mb-4">Company</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-accent transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-title text-primary mb-4">Legal</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/legal/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-gray mt-8 pt-8 text-center text-caption text-muted">
            <p>&copy; 2024 Hospitality Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}