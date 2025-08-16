'use client'

import React, { useState, useEffect } from 'react'
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
  // Simple cursor animation for first mockup only
  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    
    // Create global cursor gradient
    const cursorGradient = document.createElement('div');
    cursorGradient.className = 'cursor-gradient';
    document.body.appendChild(cursorGradient);
    
    // Get only the first mockup card
    const firstMockupCard = document.querySelector('.mockup-card');
    
    function handleGlobalMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Update global cursor gradient
      cursorGradient.style.setProperty('--mouse-x', mouseX + 'px');
      cursorGradient.style.setProperty('--mouse-y', mouseY + 'px');
      
      // Animate only the first mockup card
      if (firstMockupCard) {
        const rect = firstMockupCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        
        const distanceX = mouseX - cardCenterX;
        const distanceY = mouseY - cardCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        if (distance < 400) {
          const intensity = 1 - (distance / 400);
          const transformX = (distanceX / 400) * 20 * intensity;
          const transformY = (distanceY / 400) * 20 * intensity;
          const rotateX = (distanceY / 400) * 10 * intensity;
          const rotateY = -(distanceX / 400) * 10 * intensity;
          
          (firstMockupCard as HTMLElement).style.transform = `
            translate3d(${transformX}px, ${transformY}px, ${intensity * 50}px)
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
            scale(${1 + intensity * 0.05})
          `;
          
          // Dynamic shadow
          const shadowX = distanceX * 0.1;
          const shadowY = distanceY * 0.1;
          (firstMockupCard as HTMLElement).style.boxShadow = `
            ${shadowX}px ${shadowY}px 30px rgba(0, 0, 0, 0.3),
            0 20px 40px rgba(0, 0, 0, 0.1)
          `;
        } else {
          (firstMockupCard as HTMLElement).style.transform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)';
          (firstMockupCard as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        }
      }
    }
    
    function handleMouseLeave() {
      // Reset first mockup card
      if (firstMockupCard) {
        (firstMockupCard as HTMLElement).style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        (firstMockupCard as HTMLElement).style.transform = 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)';
        (firstMockupCard as HTMLElement).style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        
        setTimeout(() => {
          (firstMockupCard as HTMLElement).style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 1000);
      }
    }
    
    // Add event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup function
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (cursorGradient.parentNode) {
        cursorGradient.parentNode.removeChild(cursorGradient);
      }
    };
  }, []);

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
              <a href="#apps" className="text-muted hover:text-primary transition-colors font-medium">Apps</a>
              <a href="#features" className="text-muted hover:text-primary transition-colors font-medium">Features</a>
              <Link href="/pricing" className="text-muted hover:text-primary transition-colors font-medium">Pricing</Link>
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

      {/* Hero Section - Modern Minimalist with Mockups */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-stone-gray">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-caption text-secondary">#1 Hospitality Platform</span>
              </div>
              
              {/* Main Headline - Inspired by minimalist typography */}
              <div className="space-y-6">
                <h1 className="text-display text-primary leading-tight">
                  The Best &<br />
                  Easiest Apps<br />
                  for <span className="text-accent">Hospitality</span>
                </h1>
                <p className="text-title text-secondary">Simple. Reliable. Affordable.</p>
              </div>
              
              <p className="text-body text-muted leading-relaxed max-w-xl lg:max-w-none">
                All-in-one hospitality software that's simple, reliable, and affordable. 
                Manage inventory, reservations, members, POS systems, and more.
                <span className="block mt-2 text-lg">
                  <span className="text-accent font-semibold">8+ apps coming soon.</span> Need something custom? 
                  <Link href="/contact" className="text-accent hover:text-primary font-semibold underline">Just ask!</Link>
                </span>
              </p>
              
              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup" className="button-primary text-lg px-10 py-5">
                  Try the App Free
                  <ArrowRight className="inline-block w-5 h-5 ml-2" />
                </Link>
                <Link href="/pricing" className="button-secondary text-lg px-8 py-5">
                  View Pricing
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-caption text-muted justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>30-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-accent" />
                  <span>Setup in 5 minutes</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Multi-App Showcase with Modern Design */}
            <div className="relative lg:pl-8">
              {/* Stack of App Mockups */}
              <div className="relative mockup-container">
                {/* Liquor Inventory App (Front) - Modern Style */}
                <div className="relative z-30 transform -rotate-2 hover:rotate-0 transition-transform duration-500 card-elevated mockup-card">
                  <div className="bg-primary rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold text-sm">Liquor Inventory</div>
                      <Package className="w-4 h-4 text-accent" />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-accent rounded-lg p-3">
                        <div className="text-white/80 text-xs">Items in Stock</div>
                        <div className="text-white text-lg font-bold">247</div>
                      </div>
                      <div className="bg-charcoal rounded-lg p-3">
                        <div className="text-white/60 text-xs">Low Stock Items</div>
                        <div className="text-white text-lg font-bold">12</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consumption Sheet App (Middle) - Modern Style */}
                <div className="absolute top-8 left-8 z-20 transform rotate-3 hover:rotate-0 transition-transform duration-500 card-elevated mockup-card">
                  <div className="bg-charcoal rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold text-sm">Consumption Sheet</div>
                      <BarChart3 className="w-4 h-4 text-accent" />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-gray rounded-lg p-3">
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

                {/* Reservation App (Back) - Modern Style */}
                <div className="absolute top-16 left-16 z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500 card-elevated mockup-card">
                  <div className="bg-slate-gray rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-semibold text-sm">Reservations</div>
                      <Calendar className="w-4 h-4 text-accent" />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-charcoal rounded-lg p-3">
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

                {/* Floating Elements - Modern Style */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div className="absolute bottom-4 -left-4 w-8 h-8 bg-charcoal rounded-full shadow-lg animate-pulse"></div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* App Cards Section - Clean Grid Layout */}
      <section id="apps" className="section-spacing bg-surface">
        <div className="container-max">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-headline text-primary">
              Complete Suite of Business Apps
            </h2>
            <p className="text-body text-muted max-w-2xl mx-auto">
              Choose the apps you need. All seamlessly integrated, all working together.
            </p>
          </div>

          {/* Clean App Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Liquor Inventory App */}
            <div className="card-elevated group cursor-pointer service-card">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">🍾 Liquor Inventory</h3>
              <p className="text-body text-muted mb-6 leading-relaxed">
                Professional inventory management with barcode scanning and automated ordering.
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  ✅ Available Now
                </span>
                <ArrowUpRight className="w-4 h-4 text-accent group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Consumption Sheet App */}
            <div className="card-elevated group cursor-pointer service-card">
              <div className="w-12 h-12 bg-charcoal rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">📊 Consumption Sheet</h3>
              <p className="text-body text-muted mb-6 leading-relaxed">
                Real-time event consumption tracking with multi-window support and automated reporting.
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                  ✅ Available Now
                </span>
                <ArrowUpRight className="w-4 h-4 text-accent group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Reservation Management App */}
            <div className="card-elevated group cursor-pointer service-card">
              <div className="w-12 h-12 bg-slate-gray rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">📅 Reservation Management</h3>
              <p className="text-body text-muted mb-6 leading-relaxed">
                Table reservations, room bookings, and walk-in management for restaurants and clubs.
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-gray text-slate-gray">
                  🚀 Coming Soon
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-gray group-hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Member Database App */}
            <div className="card-elevated group cursor-pointer service-card">
              <div className="w-12 h-12 bg-charcoal rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">👥 Member Database</h3>
              <p className="text-body text-muted mb-6 leading-relaxed">
                Comprehensive member management with family tracking and advanced search.
              </p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-gray text-slate-gray">
                  📅 Planned
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-gray group-hover:text-primary transition-colors" />
              </div>
            </div>
          </div>

          {/* Integration Message */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-caption font-medium">
              <Zap className="w-4 h-4" />
              All apps work together seamlessly
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Clean Grid */}
      <section id="features" className="section-spacing bg-white">
        <div className="container-max">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-headline text-primary">
              Why Choose Hospitality Hub?
            </h2>
            <p className="text-body text-muted max-w-2xl mx-auto">
              Built specifically for hospitality businesses with features that matter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 - Security */}
            <div className="card text-center group">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">🔐 Secure & Reliable</h3>
              <p className="text-body text-muted leading-relaxed">
                Enterprise-grade security with 99.9% uptime guarantee and daily backups.
              </p>
            </div>

            {/* Feature 2 - Analytics */}
            <div className="card text-center group">
              <div className="w-12 h-12 bg-charcoal rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">📊 Real-time Analytics</h3>
              <p className="text-body text-muted leading-relaxed">
                Comprehensive reporting and analytics across all your apps and data.
              </p>
            </div>

            {/* Feature 3 - Team Management */}
            <div className="card text-center group">
              <div className="w-12 h-12 bg-slate-gray rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">👥 Team Management</h3>
              <p className="text-body text-muted leading-relaxed">
                Role-based access control with detailed activity tracking and permissions.
              </p>
            </div>

            {/* Feature 4 - Scalable Growth */}
            <div className="card text-center group">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">🚀 Scalable Growth</h3>
              <p className="text-body text-muted leading-relaxed">
                Start with one app, add more as you grow. Flexible pricing for any size business.
              </p>
            </div>

            {/* Feature 5 - 24/7 Support */}
            <div className="card text-center group">
              <div className="w-12 h-12 bg-charcoal rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">⏰ 24/7 Support</h3>
              <p className="text-body text-muted leading-relaxed">
                Dedicated support team available around the clock to help you succeed.
              </p>
            </div>

            {/* Feature 6 - Cost Effective */}
            <div className="card text-center group">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-title text-primary mb-3">💰 Cost Effective</h3>
              <p className="text-body text-muted leading-relaxed">
                Pay only for what you use. No hidden fees, no long-term contracts required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimalist with Orange Accent */}
      <section className="section-spacing bg-surface">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card-elevated bg-white">
              <h2 className="text-headline text-accent mb-6">
                Ready to Transform Your Business?
              </h2>
              <p className="text-body text-primary mb-8 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of businesses already using Hospitality Hub to streamline operations, 
                reduce costs, and improve customer experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="button-primary px-8 py-4 text-lg font-semibold flex items-center gap-2 justify-center group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="button-secondary px-8 py-4 text-lg font-semibold">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean and Minimal */}
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