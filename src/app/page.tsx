'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
  CheckCircle,
  Users,
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  Building2,
  Utensils,
  Crown,
  MapPin,
  Star,
  Trophy,
  Activity,
  AlertTriangle,
  Calendar,
  FileText
} from 'lucide-react'

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null)
  const [hoveredIndustry, setHoveredIndustry] = useState<number | null>(null)

  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile-First Design",
      description: "Scan barcodes, count inventory, and manage stock from any device"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-Time Analytics",
      description: "Live dashboards with activity tracking and automated reports"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Role-based access with audit trails and organization management"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Auto-Save Technology",
      description: "Never lose data with intelligent auto-save and offline support"
    }
  ]

  const businessImpacts = [
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Save 70% Time",
      description: "Traditional inventory takes hours. With barcode scanning and auto-save, finish in minutes.",
      metric: "4 hours → 1 hour",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "Reduce Costs",
      description: "Eliminate over-ordering and stockouts. Real-time tracking prevents waste.",
      metric: "Save $2,000+/month",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Increase Accuracy",
      description: "Human errors cost money. Our system ensures 99.9% inventory accuracy.",
      metric: "Manual errors down 95%",
      color: "from-purple-500 to-pink-500"
    }
  ]

  const industries = [
    {
      icon: <Crown className="h-8 w-8" />,
      title: "Country Clubs",
      description: "Manage multiple bars, restaurants, and event spaces across your club. Perfect for golf clubs, tennis clubs, and private member clubs.",
      benefits: ["Multiple venue management", "Member event tracking", "Premium inventory control"],
      color: "from-amber-500 to-orange-500",
      featured: true
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "Luxury Hotels & Resorts",
      description: "Coordinate inventory across hotel bars, restaurants, room service, and poolside venues with enterprise-grade precision.",
      benefits: ["Multi-location sync", "Guest service optimization", "Cost center tracking"],
      color: "from-blue-500 to-indigo-500",
      featured: false
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: "Wedding & Event Venues",
      description: "Track inventory for multiple events simultaneously. Ensure you never run out during your most important occasions.",
      benefits: ["Event-specific tracking", "Supplier coordination", "Real-time alerts"],
      color: "from-pink-500 to-rose-500",
      featured: false
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Corporate Event Centers",
      description: "Professional inventory management for conference centers, corporate retreats, and business entertainment venues.",
      benefits: ["Client billing integration", "Professional reporting", "Compliance tracking"],
      color: "from-emerald-500 to-teal-500",
      featured: false
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Yacht Clubs & Marinas",
      description: "Specialized for waterfront dining and exclusive member venues. Handle seasonal fluctuations with precision.",
      benefits: ["Seasonal inventory planning", "Member preferences", "Marine compliance"],
      color: "from-cyan-500 to-blue-500",
      featured: false
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Private Dining Clubs",
      description: "Exclusive venues demand exclusive service. Maintain premium standards with professional inventory control.",
      benefits: ["Premium brand tracking", "Member billing", "White-glove service"],
      color: "from-violet-500 to-purple-500",
      featured: false
    }
  ]

  const pricingPlans = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for small bars and restaurants",
      features: [
        "Up to 500 items",
        "2 rooms/locations",
        "Basic barcode scanning",
        "Email reports",
        "Standard support"
      ],
      popular: false,
      buttonText: "Start Free Trial"
    },
    {
      name: "Professional",
      price: 79,
      description: "For growing businesses with multiple locations",
      features: [
        "Unlimited items",
        "Unlimited rooms/locations",
        "Advanced barcode scanning",
        "Real-time reports",
        "Activity logging",
        "Priority support",
        "API access"
      ],
      popular: true,
      buttonText: "Start Free Trial"
    },
    {
      name: "Enterprise",
      price: 199,
      description: "For large operations and chains",
      features: [
        "Everything in Professional",
        "Multi-organization management",
        "Custom integrations",
        "Dedicated support",
        "Training sessions",
        "White-label options"
      ],
      popular: false,
      buttonText: "Contact Sales"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LiquorTrack</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#industries" className="text-white/80 hover:text-white transition-colors">Industries</a>
            <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-white/80 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/pricing"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="mb-6">
            <span className="bg-blue-500/10 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/20">
              ✨ Professional Inventory Management
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Premium Inventory
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Management</span>
          </h1>
          
          <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
            Enterprise-grade liquor inventory management designed for country clubs, luxury hotels, 
            and premium venues. Barcode scanning, real-time tracking, and automated reporting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/pricing"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 font-semibold">
              Watch Demo
            </button>
          </div>

          {/* Updated Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/60">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">70%</div>
              <div className="text-white/60">Time Saved</div>
            </div>
          </div>
        </div>

        {/* TOP RIGHT - Floating Inventory Dashboard */}
        <div className="absolute top-4 right-4 transform hidden 2xl:block animate-pulse">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <span className="text-white/60 text-xs">Dashboard</span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Items</span>
                <span className="text-green-400 font-bold">847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Low Stock</span>
                <span className="text-orange-400 font-bold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Value</span>
                <span className="text-blue-400 font-bold">$24K</span>
              </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-white/10">
              <span className="text-green-300 text-xs">✅ Auto-saved</span>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT - Mobile Scanner */}
        <div className="absolute bottom-4 left-4 transform hidden xl:block animate-bounce">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-xs">Scanned</div>
                <div className="text-white/60 text-xs">Grey Goose</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </section>

      {/* Business Impact Section */}
      <section className="px-6 py-20 bg-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Transform Your Business</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              See the real impact LiquorTrack has on your operations and bottom line
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {businessImpacts.map((impact, index) => (
              <div
                key={index}
                className="relative group"
              >
                {/* Floating Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-r ${impact.color} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                    {impact.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{impact.title}</h3>
                  <p className="text-white/70 mb-4 leading-relaxed">{impact.description}</p>
                  
                  <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <div className="text-lg font-bold text-white">{impact.metric}</div>
                    <div className="text-white/60 text-sm">Average improvement</div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full blur-sm"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full blur-sm"></div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP LEFT - Security Badge */}
        <div className="absolute top-4 left-4 transform hidden xl:block animate-pulse">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-green-400/30 shadow-2xl">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-green-300 font-semibold text-xs">Secure</div>
                <div className="text-white/60 text-xs">Encrypted</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM RIGHT - Low Stock Alert */}
        <div className="absolute bottom-4 right-4 transform hidden xl:block">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-yellow-400/30 shadow-2xl animate-pulse">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div>
                <div className="text-yellow-300 font-semibold text-xs">Low Stock</div>
                <div className="text-white/60 text-xs">Dom Pérignon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="px-6 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="bg-amber-500/10 text-amber-300 px-4 py-2 rounded-full text-sm font-medium border border-amber-500/20">
                🏆 Premium Venues
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Built for Excellence</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              LiquorTrack was specifically designed for country clubs and premium hospitality venues 
              that demand professional-grade inventory management and exceptional service standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer ${
                  industry.featured ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
                onMouseEnter={() => setHoveredIndustry(index)}
                onMouseLeave={() => setHoveredIndustry(null)}
              >
                <div className={`bg-white/10 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:scale-105 h-full ${
                  industry.featured
                    ? 'border-amber-400/50 shadow-2xl shadow-amber-500/20'
                    : hoveredIndustry === index
                    ? 'border-white/30 shadow-2xl'
                    : 'border-white/20 hover:border-white/30'
                }`}>
                  {industry.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                        <Crown className="h-4 w-4 mr-1" />
                        Primary Focus
                      </span>
                    </div>
                  )}

                  <div className={`w-16 h-16 bg-gradient-to-r ${industry.color} rounded-2xl flex items-center justify-center mb-6 text-white`}>
                    {industry.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{industry.title}</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">{industry.description}</p>
                  
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-white/90 mb-2">Key Benefits:</div>
                    {industry.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center text-white/80">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {industry.featured && (
                    <div className="mt-6 pt-6 border-t border-white/20">
                      <Link
                        href="/pricing"
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center group"
                      >
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500/20 rounded-full blur-sm"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500/20 rounded-full blur-sm"></div>
              </div>
            ))}
          </div>

          {/* CTA for Industries */}
          <div className="text-center mt-16">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Don't See Your Industry?</h3>
              <p className="text-white/70 mb-6">
                LiquorTrack adapts to any premium venue with liquor inventory needs. 
                From private events to exclusive restaurants, we've got you covered.
              </p>
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold inline-flex items-center"
              >
                Schedule a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* TOP LEFT - Event Calendar */}
        <div className="absolute top-4 left-4 transform hidden 2xl:block">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-2xl animate-pulse">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-white font-semibold text-xs">Wedding</div>
                <div className="text-white/60 text-xs">150 guests</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need for modern inventory management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 hover:bg-white/10 rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
                  hoveredFeature === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/80'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM RIGHT - Analytics Chart */}
        <div className="absolute bottom-4 right-4 transform hidden xl:block">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-white font-semibold text-xs">Report</div>
                <div className="text-green-400 text-xs">↗ +23%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Choose the plan that fits your business. Start with a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${
                  plan.popular
                    ? 'border-blue-400 shadow-2xl shadow-blue-500/20'
                    : 'border-white/20 hover:border-white/30'
                }`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    ${plan.price}<span className="text-lg text-white/60">/month</span>
                  </div>
                  <p className="text-white/70">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-white/80">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className={`block text-center py-3 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/60 text-sm">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </div>

        {/* TOP RIGHT - Success Notification */}
        <div className="absolute top-4 right-4 transform hidden xl:block animate-bounce">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-green-400/30 shadow-2xl">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-green-300 font-semibold text-xs">Order Sent</div>
                <div className="text-white/60 text-xs">Confirmed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/70 mb-8">
            Join premium venues already using LiquorTrack to streamline their inventory
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              Start Your Free Trial
            </Link>
            <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 font-semibold">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">LiquorTrack</span>
            </div>
            
            <div className="text-white/60 text-center md:text-right">
              <p>&copy; 2024 LiquorTrack. All rights reserved.</p>
              <div className="flex items-center justify-center md:justify-end space-x-6 mt-2">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
