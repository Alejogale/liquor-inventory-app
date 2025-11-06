'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Star,
  FileText,
  Zap,
  Shield,
  BarChart3,
  Users,
  Building2,
  Clock,
  Package,
  Home,
  Heart,
  Briefcase,
  Smartphone,
  Globe,
  MessageCircle,
  ChevronDown,
  Play,
  Wifi
} from 'lucide-react'
import { ExitIntentPopup } from '@/components/ExitIntentPopup'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const router = useRouter()
  // Force deployment trigger - updated

  // Handle email capture from popup
  const handleEmailCapture = async (email: string) => {
    const response = await fetch('/api/capture-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    if (!response.ok) {
      throw new Error('Failed to capture email')
    }

    return response.json()
  }

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
      <nav className="sticky top-0 z-[9999] bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm w-full">
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
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
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
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-gray-600 hover:text-gray-900 py-2">Features</a>
              <a href="#use-cases" className="block text-gray-600 hover:text-gray-900 py-2">Use Cases</a>
              <a href="#how-it-works" className="block text-gray-600 hover:text-gray-900 py-2">How It Works</a>
              <a href="#pricing" className="block text-gray-600 hover:text-gray-900 py-2">Pricing</a>
              <a href="#faq" className="block text-gray-600 hover:text-gray-900 py-2">FAQ</a>
              <Link href="/contact" className="block text-gray-600 hover:text-gray-900 py-2">Contact</Link>
              
              {/* Mobile CTA Buttons */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link href="/login" className="block text-center text-gray-600 hover:text-gray-900 py-2 font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="block text-center bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-6 pb-8 sm:pt-8 sm:pb-12 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Left Side - Hero Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="whitespace-nowrap">Organize Everything You Own</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Easy Inventory<br />
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  Management
                </span><br />
                for Everyone
              </h1>
              
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
                Track, count, and manage inventory for your home, hobby, or business. 
                Never lose track of what you own with our intuitive mobile-first system.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 max-w-2xl mx-auto lg:mx-0">
                <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center min-w-[200px]">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 transition-all duration-200 flex items-center justify-center min-w-[200px]">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base whitespace-nowrap">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base whitespace-nowrap">Setup in 5 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base whitespace-nowrap">30-day free trial</span>
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2 mb-4 sm:mb-0">
              <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4 sm:px-0">
                <Image
                  src="/InvyEasyLaptop1.png"
                  alt="Inventory management with barcode scanning"
                  width={2000}
                  height={2000}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Logo */}
            <div className="flex justify-center lg:justify-end">
              <Image
                src="/InvyEasy-logo.png"
                alt="InvyEasy Logo"
                width={2000}
                height={1401}
                className="w-72 sm:w-80 md:w-96 lg:w-[28rem] h-auto"
              />
            </div>

            {/* Mission Text */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border border-orange-100 shadow-xl text-center lg:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start mb-3 sm:mb-4">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-2 sm:mb-0 sm:mr-2" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed px-2 sm:px-0">
                Making organization simple, smart, and accessible for everyone. Whether you're organizing your home pantry,
                managing craft supplies, or running a small business - we believe everyone deserves powerful tools that
                are easy to use and affordable.
              </p>
              <p className="text-base sm:text-lg md:text-xl font-bold text-orange-600 mt-3 sm:mt-4">Simple. Smart. Organized.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-visible">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Mobile App Image */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="relative -my-20 lg:-my-32">
                <Image
                  src="/iphone-main-mockup-landing-page.png"
                  alt="InvyEasy Mobile App Interface"
                  width={800}
                  height={1600}
                  className="w-96 sm:w-[450px] md:w-[550px] lg:w-[700px] xl:w-[800px] h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Mobile App Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 md:p-8 border border-orange-100 shadow-xl order-1 lg:order-2">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start mb-3 sm:mb-4">
                <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-2 sm:mb-0 sm:mr-2" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">InvyEasy Mobile App</h2>
              </div>

              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-4 px-2 sm:px-0">
                Take your inventory management anywhere with our powerful mobile app. Built for speed and ease of use.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                    <Zap className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Hands-Free Barcode Workflow</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Scan, type count, press Enter - zero clicking required</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Real-Time Inventory Tracking</h3>
                    <p className="text-xs sm:text-sm text-gray-600">View and count inventory across all locations instantly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Team Management with PINs</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Role-based access control for owners, managers, and staff</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Stock Analytics & Reports</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Track movements, trends, and generate detailed reports</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                    <Package className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Multi-Room & Supplier Management</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Organize by rooms and manage supplier orders seamlessly</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                    <Zap className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Offline Mode</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Count inventory without internet, syncs automatically</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-base sm:text-lg font-bold text-orange-600 text-center">
                  Available for iOS & Android
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Powerful features designed for everyone - from home organizers to small business owners.
            </p>
          </div>

          {/* Hero Feature with Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="lg:order-2">
              <Image
                src="/interactive-experience.png"
                alt="Interactive learning and organization experience"
                width={2000}
                height={2000}
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
            <div className="lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                📱 Simple & Powerful
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Inventory Management That Just Works
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Built for real people with real stuff to organize. Whether you're tracking pantry items at home or managing business inventory, InvyEasy makes it simple to know what you have and where you have it.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Room-Based Tracking</h4>
                    <p className="text-gray-600">Organize by location - kitchen, garage, office, warehouse. See exactly where everything is.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Mobile-First Experience</h4>
                    <p className="text-gray-600">Count and update inventory on the go with our mobile-optimized interface</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Team Collaboration</h4>
                    <p className="text-gray-600">Share and collaborate with family or team members seamlessly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Features in a More Natural Layout */}
          <div className="space-y-12">
            {/* Row 1: Two main features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-3xl border border-orange-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Smart Categories</h3>
                    <p className="text-orange-600 text-sm font-medium">Organize Your Way</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Create custom categories that make sense to you. From pantry staples to craft supplies, organize everything exactly how you think about it.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-orange-200">Pantry</span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-orange-200">Office</span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-orange-200">Garage</span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm text-gray-600 border border-orange-200">+More</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-3xl border border-blue-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Globe className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Multi-Location Sync</h3>
                    <p className="text-blue-600 text-sm font-medium">Everywhere You Go</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Track inventory across multiple locations - home, office, storage units, vacation homes. Everything syncs in real-time across all your devices.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>Home</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4 text-purple-500" />
                    <span>Office</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="w-4 h-4 text-blue-500" />
                    <span>Storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span>Warehouse</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Three supporting features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Smart Analytics</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  See trends, track usage patterns, and get insights that help you make smarter inventory decisions.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Team Collaboration</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Share with family, roommates, or team members. Everyone can contribute to keeping things organized.
                </p>
              </div>

              <div className="text-center p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-200">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Mobile Optimized</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Built mobile-first for quick updates while you're organizing. Scan, count, and manage on the go.
                </p>
              </div>
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
                  Hands-Free Barcode Scanning
                </h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Our revolutionary hands-free workflow means you never touch your computer during inventory counts.
                  Scan a barcode, type the count with your scanner's keyboard, hit Enter - and you're ready for the next item.
                  No clicking, no mouse, just pure efficiency.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">100% hands-free counting workflow</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Auto-focus on count input after scan</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Press Enter to save and continue</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Works with any Bluetooth scanner</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Cut counting time by 70%</span>
                  </li>
                </ul>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-orange-100">
                  <p className="text-sm text-gray-600 italic">
                    "The hands-free workflow is a game-changer. We finish our weekly inventory in half the time. Just scan, count, enter - done!"
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-2">- Michael R., Bar Manager</p>
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
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-bl-3xl opacity-10"></div>
              <Image
                src="/barcode-scanning.png"
                alt="Easy barcode scanning for home inventory"
                width={2000}
                height={2000}
                className="w-full h-36 object-contain rounded-xl mb-6"
              />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4">
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
            </div>

            {/* Hobby & Collectibles */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-br-3xl opacity-10"></div>
              <Image
                src="/digital-library.jpg"
                alt="Digital organization for hobbies and collections"
                width={5209}
                height={5210}
                className="w-full h-36 object-cover rounded-xl mb-6"
              />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
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
            </div>

            {/* Small Business */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-br-3xl opacity-10"></div>
              <Image
                src="/warehouse-management.jpg"
                alt="Professional warehouse and inventory management"
                width={5210}
                height={5209}
                className="w-full h-40 object-cover rounded-xl mb-6"
              />
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4">
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
                    Warehouses & storage
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Professional services
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Multi-location ops
                  </li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  Professional inventory management for retail stores, warehouses, and growing businesses. Scale with confidence.
                </p>
              </div>
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

      {/* Recommended Barcode Scanner Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
              <Package className="w-4 h-4" />
              Recommended Hardware
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get the Most Out of InvyEasy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A dedicated Bluetooth barcode scanner makes inventory management lightning-fast and effortless.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Product Images */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
                <div className="relative">
                  <Image
                    src="/barccode scanner image.jpg"
                    alt="Bluetooth Wireless Barcode Scanner - Perfect for InvyEasy"
                    width={1500}
                    height={1359}
                    className="w-full h-auto max-w-md mx-auto rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => setModalImage('/barccode scanner image.jpg')}
                  />
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                    ⭐ Recommended
                  </div>
                </div>
                
                {/* Additional product images */}
                <div className="flex gap-3 mt-6 justify-center">
                  <Image
                    src="/71F7l9ydGeL._AC_SL1500_.jpg"
                    alt="Scanner angle 1"
                    width={1500}
                    height={1500}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                    onClick={() => setModalImage('/71F7l9ydGeL._AC_SL1500_.jpg')}
                  />
                  <Image
                    src="/71tAACAKRdL._AC_SL1500_.jpg"
                    alt="Scanner angle 2"
                    width={1500}
                    height={1500}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                    onClick={() => setModalImage('/71tAACAKRdL._AC_SL1500_.jpg')}
                  />
                  <Image
                    src="/81GEHejYbnL._AC_SL1500_.jpg"
                    alt="Scanner angle 3"
                    width={1500}
                    height={1466}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                    onClick={() => setModalImage('/81GEHejYbnL._AC_SL1500_.jpg')}
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-yellow-400 text-lg">★★★★★</div>
                  <span className="text-gray-600 text-sm">(1000+ reviews)</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Bluetooth Wireless Barcode Scanner
                </h3>
                
                <div className="text-3xl font-bold text-blue-600 mb-6">
                  $39.99
                  <span className="text-lg text-gray-500 font-normal ml-2">(price may vary)</span>
                </div>

                <div className="space-y-4 mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Perfect for InvyEasy because:</h4>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Wireless Bluetooth Connection</span>
                      <p className="text-gray-600 text-sm">Connects directly to your phone, tablet, or computer</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">All Barcode Types</span>
                      <p className="text-gray-600 text-sm">Reads 1D, 2D, QR codes, and more</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Long Battery Life</span>
                      <p className="text-gray-600 text-sm">Days of use on a single charge</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Plug & Play Setup</span>
                      <p className="text-gray-600 text-sm">No drivers needed - works instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">Portable & Durable</span>
                      <p className="text-gray-600 text-sm">Perfect for home, office, or warehouse use</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h5 className="font-semibold text-blue-900 mb-2">💡 Pro Tip:</h5>
                  <p className="text-blue-800 text-sm">
                    Any Bluetooth barcode scanner will work with InvyEasy! This is just our top recommendation based on user feedback and reliability.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://amzn.to/4pMXEEK"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
                  >
                    <Package className="w-5 h-5" />
                    View on Amazon
                  </a>
                  <Link 
                    href="/signup" 
                    className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-center flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Try InvyEasy Free
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              <strong>Don't need a scanner?</strong> No problem! InvyEasy works great with:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white rounded-lg px-4 py-2 shadow-md border">
                <span className="text-sm text-gray-700">📄 CSV file imports</span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 shadow-md border">
                <span className="text-sm text-gray-700">⌨️ Manual entry</span>
              </div>
            </div>
          </div>

          {/* Scanner One - Alternative Option */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Another Great Option
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Looking for alternatives? This scanner also works perfectly with InvyEasy.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-0">
                {/* Product Images */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12">
                  <div className="relative">
                    <Image
                      src="/71QmDP5DjpL._AC_SL1500_.jpg"
                      alt="Alternative Bluetooth Barcode Scanner"
                      width={1500}
                      height={1482}
                      className="w-full h-auto max-w-md mx-auto rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => setModalImage('/71QmDP5DjpL._AC_SL1500_.jpg')}
                    />
                  </div>

                  {/* Additional product images */}
                  <div className="flex gap-3 mt-6 justify-center flex-wrap">
                    <Image
                      src="/71mehx2HvsL._AC_SL1500_.jpg"
                      alt="Scanner view 1"
                      width={1500}
                      height={1469}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                      onClick={() => setModalImage('/71mehx2HvsL._AC_SL1500_.jpg')}
                    />
                    <Image
                      src="/71lHVUl-3jL._AC_SL1500_.jpg"
                      alt="Scanner view 2"
                      width={1500}
                      height={1370}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                      onClick={() => setModalImage('/71lHVUl-3jL._AC_SL1500_.jpg')}
                    />
                    <Image
                      src="/61hQBIB41TL._AC_SL1500_.jpg"
                      alt="Scanner view 3"
                      width={1302}
                      height={1141}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                      onClick={() => setModalImage('/61hQBIB41TL._AC_SL1500_.jpg')}
                    />
                    <Image
                      src="/61NpPb-xBML._AC_.jpg"
                      alt="Scanner view 4"
                      width={970}
                      height={600}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer hover:scale-110"
                      onClick={() => setModalImage('/61NpPb-xBML._AC_.jpg')}
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-8 lg:p-12">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="text-yellow-400 text-lg">★★★★★</div>
                    <span className="text-gray-600 text-sm">(500+ reviews)</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Alternative Bluetooth Barcode Scanner
                  </h3>

                  <div className="text-3xl font-bold text-blue-600 mb-6">
                    Check Amazon for Price
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Wireless Connectivity</span>
                        <p className="text-gray-600 text-sm">Bluetooth connection to all devices</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Multi-Format Support</span>
                        <p className="text-gray-600 text-sm">Reads all standard barcode types</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Reliable Performance</span>
                        <p className="text-gray-600 text-sm">Consistent scanning speed and accuracy</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">Easy Setup</span>
                        <p className="text-gray-600 text-sm">Quick pairing with your devices</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://amzn.to/4h2tJVm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl text-center flex items-center justify-center gap-2"
                    >
                      <Package className="w-5 h-5" />
                      View on Amazon
                    </a>
                    <Link
                      href="/signup"
                      className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-center flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5" />
                      Try InvyEasy Free
                    </Link>
                  </div>
                </div>
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

          <div className="bg-gradient-to-br from-white via-orange-50/30 to-white rounded-2xl shadow-2xl border-2 border-orange-100 p-6 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-3xl opacity-30 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-red-100 to-transparent rounded-full blur-3xl opacity-20 -z-10"></div>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold mb-2 shadow-lg">
                <Star className="w-3 h-3 fill-white" />
                Enterprise-Grade Solution
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Custom Pricing</span> for Your Business
              </h3>
              <p className="text-sm text-gray-600 mb-2">Pricing tailored to your business size and needs. Start your 30-day free trial, then get invoiced monthly.</p>
              <div className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg px-4 py-2">
                <div className="text-xs font-semibold text-blue-900 mb-0.5">Starting at</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">$499<span className="text-sm text-gray-600">/month</span></div>
                <div className="text-xs text-blue-700">Final price based on business size</div>
              </div>
            </div>

            {/* Main Content - Horizontal Layout */}
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              {/* Left - Pricing Benefits */}
              <div className="bg-white rounded-lg shadow-md border-2 border-orange-200 p-4 flex flex-col h-full">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  What You Get
                </h4>
                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="font-medium">30 days completely free</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">Monthly invoice billing</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                    <span className="font-medium">Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span className="font-medium">Unlimited locations</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span className="font-medium">Unlimited users</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-teal-500 flex-shrink-0" />
                    <span className="font-medium">Priority support</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mt-3">
                  <div className="text-xs font-semibold text-green-800 mb-0.5">Typical ROI</div>
                  <div className="text-lg font-bold text-green-700">$2K-$10K/mo</div>
                  <div className="text-xs text-green-600">in savings</div>
                </div>
              </div>

              {/* Middle - How It Works */}
              <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 flex flex-col h-full">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                  <ArrowRight className="w-4 h-4 text-orange-500" />
                  How It Works
                </h4>
                <div className="flex flex-col justify-between flex-1 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">1</div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Start Free Trial</div>
                      <div className="text-xs text-gray-600">No credit card required</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">2</div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Use for 30 Days</div>
                      <div className="text-xs text-gray-600">See the value firsthand</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">3</div>
                    <div>
                      <div className="font-bold text-xs text-gray-900">Get Custom Invoice</div>
                      <div className="text-xs text-gray-600">Based on your business size</div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 mt-3">
                  <div className="text-xs font-bold text-orange-900 text-center">Volume Discounts Available</div>
                  <div className="text-xs text-orange-700 text-center">Contact us for multi-location pricing</div>
                </div>
              </div>

              {/* Right - Key Features */}
              <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 p-4 flex flex-col h-full">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                  <Star className="w-4 h-4 text-orange-500" />
                  Key Features
                </h4>
                <div className="grid grid-cols-1 gap-2 flex-1">
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-gray-900">Barcode Scanning</div>
                      <div className="text-xs text-gray-600">Lightning-fast counts</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-gray-900">Mobile App</div>
                      <div className="text-xs text-gray-600">Count anywhere</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-gray-900">Smart Reports</div>
                      <div className="text-xs text-gray-600">Real-time insights</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-gray-900">Team Collaboration</div>
                      <div className="text-xs text-gray-600">Unlimited access</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 max-w-4xl mx-auto">
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Unlimited Items</div>
                  <div className="text-xs text-gray-600">Track unlimited products</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Multi-Location</div>
                  <div className="text-xs text-gray-600">Manage across locations</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Team Collaboration</div>
                  <div className="text-xs text-gray-600">Unlimited team members</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Mobile Access</div>
                  <div className="text-xs text-gray-600">Count on-the-go</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Smart Reports</div>
                  <div className="text-xs text-gray-600">Real-time analytics</div>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-gray-900">Priority Support</div>
                  <div className="text-xs text-gray-600">Get help when needed</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/signup" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-xl hover:shadow-2xl inline-flex items-center group transform hover:scale-105">
                Start Your Free 30-Day Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-xs text-gray-500 mt-3 max-w-md mx-auto">
                No credit card required • Full access • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion Service Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                <FileText className="w-4 h-4" />
                Professional Service
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Inventory Conversion Service</h3>
              <p className="text-xl text-gray-600 mb-6">
                Don't have time to format your inventory? We'll do it for you.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-gray-900">$200</span>
                <span className="text-gray-600">one-time</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">What's Included:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Professional data conversion to InvyEasy format</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Proper categorization and optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Ready-to-import Excel template</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">24-48 hour delivery</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Perfect For:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Large existing inventory lists</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Complex or messy data formats</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Businesses that need immediate setup</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Save time and ensure accuracy</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Link href="/inventory-conversion" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center">
                Get Professional Conversion
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Secure payment • Expert conversion • 24-48 hour delivery
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

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setModalImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-4xl font-bold"
            >
              ×
            </button>
            <img
              src={modalImage}
              alt="Enlarged view"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Exit Intent Popup */}
      <ExitIntentPopup onEmailSubmit={handleEmailCapture} />
    </div>
  )
}