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
      color: "from-blue-500 to-pink-500"
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
      title: "Fine Dining Restaurants",
      description: "Perfect for upscale restaurants with extensive wine lists, craft cocktails, and premium spirits.",
      benefits: ["Wine cellar management", "Craft cocktail tracking", "Premium spirit control"],
      color: "from-purple-500 to-pink-500",
      featured: false
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Sports Bars & Pubs",
      description: "Manage high-volume inventory with multiple bars, draft systems, and game day specials.",
      benefits: ["Draft system tracking", "Game day inventory", "High-volume management"],
      color: "from-green-500 to-teal-500",
      featured: false
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Glassmorphic Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-lg font-semibold text-slate-900">Liquor Inventory</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">Pricing</a>
              <a href="#industries" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">Industries</a>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors text-sm">
                Sign In
              </Link>
              <Link href="/signup" className="bg-black hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Frosted Glass */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Complex Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-slate-200/40 via-transparent to-blue-200/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 via-transparent to-slate-100/40"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-200/20 via-transparent to-indigo-200/20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tl from-slate-300/10 via-transparent to-blue-300/10"></div>
        </div>
        
        {/* Premium Frosted Glass Container */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-12 border border-white/30 shadow-2xl relative overflow-hidden">
            {/* Inner Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
            
            {/* Dynamic Layout */}
            <div className="relative">
              {/* Main Content Area */}
              <div className="relative z-10">
                {/* Hero Text - Centered with Dynamic Positioning */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 leading-tight drop-shadow-sm mb-4">
                    Professional Inventory
                    <span className="block text-blue-600">Management</span>
                  </h1>
                  <p className="text-base lg:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
                    Streamline your liquor inventory with real-time counting, automated ordering, 
                    and detailed reporting. Built for modern hospitality businesses.
                  </p>
                </div>

                {/* Dynamic Action Section */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mb-8">
                  <Link href="/signup" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center gap-3 group shadow-lg hover:shadow-xl transform hover:scale-105">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="bg-white/60 backdrop-blur-sm border border-slate-200/50 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/80 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Watch Demo
                  </button>
                </div>

                {/* Trust Indicators - Dynamic Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-white/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Free to start</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-white/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600 bg-white/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements for Dynamic Feel */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-slate-200/30 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>

        {/* Side Elements - Positioned Outside Main Container */}
        <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 left-4 max-w-xs">
          <div className="space-y-6 animate-scroll-up">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Real-time Sync</span>
              </div>
              <p className="text-xs text-slate-600">Instant inventory updates across all devices</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Smart Analytics</span>
              </div>
              <p className="text-xs text-slate-600">Advanced reporting and insights</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Cloud Backup</span>
              </div>
              <p className="text-xs text-slate-600">Secure data storage and recovery</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Real-time Sync</span>
              </div>
              <p className="text-xs text-slate-600">Instant inventory updates across all devices</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block absolute top-1/2 transform -translate-y-1/2 right-4 max-w-xs">
          <div className="space-y-6 animate-scroll-down">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Auto Ordering</span>
              </div>
              <p className="text-xs text-slate-600">Smart reorder points and notifications</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Barcode Scanning</span>
              </div>
              <p className="text-xs text-slate-600">Quick and accurate inventory counting</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Multi-location</span>
              </div>
              <p className="text-xs text-slate-600">Manage multiple venues from one dashboard</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Auto Ordering</span>
              </div>
              <p className="text-xs text-slate-600">Smart reorder points and notifications</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Impact Section - Simplified */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Transform Your Operations
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See measurable improvements in efficiency, cost savings, and accuracy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {businessImpacts.map((impact, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${impact.color} rounded-lg flex items-center justify-center mb-6 text-white`}>
                  {impact.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{impact.title}</h3>
                <p className="text-slate-600 mb-4 leading-relaxed">{impact.description}</p>
                <div className="text-lg font-bold text-slate-900">{impact.metric}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for the hospitality industry
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section - Simplified */}
      <section id="industries" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Built for Your Industry
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tailored solutions for different hospitality sectors
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {industries.map((industry, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${industry.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                    {industry.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{industry.title}</h3>
                    <p className="text-slate-600 mb-4 text-sm leading-relaxed">{industry.description}</p>
                    <div className="space-y-2">
                      {industry.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-2 text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Simplified */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg text-slate-600">
              Choose the plan that fits your business needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:-translate-y-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Starter</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">$29</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">1 Location</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">2 Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Basic Reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Email Support</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-center px-6 py-3 rounded-lg font-medium transition-colors text-sm">
                Start Free Trial
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 border-2 border-blue-500 relative shadow-lg hover:-translate-y-1 transition-transform">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Professional</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">$79</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">3 Locations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">10 Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Advanced Reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Barcode Scanning</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Priority Support</span>
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors text-sm">
                Start Free Trial
              </Link>
            </div>
            
            <div className="bg-white rounded-xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-200 hover:-translate-y-1">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Enterprise</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-slate-900">$199</span>
                <span className="text-slate-500 ml-2">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Unlimited Locations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Unlimited Team Members</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Custom Reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">API Access</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-slate-600 text-sm">Dedicated Support</span>
                </li>
              </ul>
              <Link href="/contact" className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-center px-6 py-3 rounded-lg font-medium transition-colors text-sm">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join hundreds of bars and restaurants that have already streamlined their operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
              Start Free Trial
            </Link>
            <Link href="/contact" className="border border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-colors">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Simplified */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">L</span>
                </div>
                <span className="text-lg font-semibold">Liquor Inventory</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md text-sm">
                Professional inventory management solution designed specifically for bars, restaurants, and hospitality businesses.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors text-sm">Pricing</a></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">Demo</Link></li>
                <li><Link href="/signup" className="text-slate-400 hover:text-white transition-colors text-sm">Free Trial</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">Contact</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-400 text-sm">
                &copy; 2024 Liquor Inventory Manager. All rights reserved.
              </p>
              <p className="text-slate-400 text-sm mt-4 md:mt-0">
                Made with ❤️ for the hospitality industry
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
