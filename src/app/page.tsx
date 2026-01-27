'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Package,
  Home,
  Heart,
  Briefcase,
  Smartphone,
  BarChart3,
  Users,
  Shield,
  Zap,
  Clock,
  ChevronDown,
  Play,
  Building2,
  LayoutDashboard
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const router = useRouter()
  const { user, loading } = useAuth()

  // Custom cursor refs
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorRingRef = useRef<HTMLDivElement>(null)
  const [cursorHovering, setCursorHovering] = useState(false)

  // Handle password reset redirect
  useEffect(() => {
    const handleAuthRedirect = () => {
      const hash = window.location.hash
      if (hash.includes('access_token') && hash.includes('type=recovery')) {
        router.push(`/reset-password${hash}`)
      }
    }
    handleAuthRedirect()
  }, [router])

  // Scroll progress indicator with throttling
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight
          const progress = (window.scrollY / totalHeight) * 100
          setScrollProgress(progress)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Custom cursor effect with optimized animation
  useEffect(() => {
    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let animationId: number | null = null

    const animateRing = () => {
      if (cursorRingRef.current) {
        ringX += (mouseX - ringX) * 0.15
        ringY += (mouseY - ringY) * 0.15
        cursorRingRef.current.style.left = `${ringX}px`
        cursorRingRef.current.style.top = `${ringY}px`

        // Only continue if ring hasn't caught up
        const dx = mouseX - ringX
        const dy = mouseY - ringY
        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          animationId = requestAnimationFrame(animateRing)
        } else {
          animationId = null
        }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${mouseX}px`
        cursorDotRef.current.style.top = `${mouseY}px`
      }

      // Start ring animation if not running
      if (!animationId) {
        animationId = requestAnimationFrame(animateRing)
      }
    }

    const handleMouseEnter = () => setCursorHovering(true)
    const handleMouseLeave = () => setCursorHovering(false)

    // Check if device has fine pointer (mouse)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    if (hasFinePointer) {
      document.body.classList.add('custom-cursor-enabled')
      window.addEventListener('mousemove', handleMouseMove, { passive: true })

      // Add hover effect to clickable elements
      const clickables = document.querySelectorAll('a, button, [role="button"]')
      clickables.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter)
        el.addEventListener('mouseleave', handleMouseLeave)
      })

      return () => {
        document.body.classList.remove('custom-cursor-enabled')
        window.removeEventListener('mousemove', handleMouseMove)
        if (animationId) cancelAnimationFrame(animationId)
        clickables.forEach(el => {
          el.removeEventListener('mouseenter', handleMouseEnter)
          el.removeEventListener('mouseleave', handleMouseLeave)
        })
      }
    }
  }, [])

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const animatedElements = document.querySelectorAll('.animate-on-scroll')
    animatedElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index)
  }

  const faqs = [
    {
      question: "Is this just for bars?",
      answer: "No! InvyEasy works for any hospitality business — bars, restaurants, hotels, event venues, and catering companies. Our tools are built for the unique needs of the hospitality industry."
    },
    {
      question: "What apps are included?",
      answer: "It depends on your plan. Starter includes Consumption Tracker, Basic and Professional include Liquor Inventory, Business gives you access to all apps, and Enterprise includes custom solutions with white-label branding."
    },
    {
      question: "Can my team use this?",
      answer: "Yes! Invite team members with role-based access. Managers can view reports while staff counts inventory. Higher plans support more team members."
    },
    {
      question: "Can I use it for multiple locations?",
      answer: "Absolutely! Track inventory across all your bars, storage rooms, and locations. Everything syncs in real-time across all devices."
    },
    {
      question: "Is there a mobile app?",
      answer: "Yes! Full mobile access for counting and barcode scanning. Count inventory on your phone while walking the floor. Perfect for busy bar environments."
    },
    {
      question: "What if I need to cancel?",
      answer: "No problem! Cancel anytime from your dashboard. You keep access until your billing period ends. No long-term contracts or hidden fees."
    }
  ]

  return (
    <>
      <style jsx global>{`
        /* Grayscale Color System with Orange Accent */
        :root {
          --primary-color: #FF6B35;
          --text-dark: #000000;
          --text-secondary: #333333;
          --text-accent: #666666;
          --bg-primary: #FFFFFF;
          --bg-secondary: #F5F5F5;
          --border-color: rgba(0, 0, 0, 0.1);
        }

        /* Custom Cursor */
        @media (min-width: 769px) {
          body.custom-cursor-enabled {
            cursor: none;
          }
          body.custom-cursor-enabled a,
          body.custom-cursor-enabled button,
          body.custom-cursor-enabled [role="button"] {
            cursor: none;
          }
        }

        .cursor-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          background: #FF6B35;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          transform: translate(-50%, -50%);
          transition: transform 0.1s ease, background 0.2s ease;
        }

        .cursor-ring {
          position: fixed;
          width: 36px;
          height: 36px;
          border: 2px solid rgba(255, 107, 53, 0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease-out, width 0.2s ease, height 0.2s ease;
        }

        .cursor-dot.hovering {
          transform: translate(-50%, -50%) scale(0.5);
          background: #0351E4;
        }

        .cursor-ring.hovering {
          width: 50px;
          height: 50px;
          border-color: rgba(3, 81, 228, 0.5);
        }

        @media (max-width: 768px) {
          .cursor-dot, .cursor-ring { display: none !important; }
        }

        /* Scroll Progress */
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, #FF6B35, #F25050);
          z-index: 10001;
          transition: width 0.1s ease;
        }

        /* Animate on scroll */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease-out, transform 0.7s ease-out;
        }
        .animate-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .animate-on-scroll.delay-1 { transition-delay: 0.1s; }
        .animate-on-scroll.delay-2 { transition-delay: 0.2s; }
        .animate-on-scroll.delay-3 { transition-delay: 0.3s; }
        .animate-on-scroll.delay-4 { transition-delay: 0.4s; }

        /* Hero animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-animate {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .hero-animate-1 { animation-delay: 0.1s; }
        .hero-animate-2 { animation-delay: 0.25s; }
        .hero-animate-3 { animation-delay: 0.4s; }
        .hero-animate-4 { animation-delay: 0.55s; }

        /* Orbital animations */
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes counter-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        .orbit {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: orbit linear infinite;
        }

        .orbit-1 { width: 400px; height: 400px; animation-duration: 25s; }
        .orbit-2 { width: 600px; height: 600px; animation-duration: 35s; animation-direction: reverse; }
        .orbit-3 { width: 800px; height: 800px; animation-duration: 45s; }

        .orbital-item {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 107, 53, 0.1);
        }

        .orbit-1 .orbital-item { animation: counter-rotate 25s linear infinite; }
        .orbit-2 .orbital-item { animation: counter-rotate 35s linear infinite reverse; }
        .orbit-3 .orbital-item { animation: counter-rotate 45s linear infinite; }

        .orbital-item:nth-child(1) { top: 0; left: 50%; transform: translateX(-50%); }
        .orbital-item:nth-child(2) { top: 50%; right: 0; transform: translateY(-50%); }
        .orbital-item:nth-child(3) { bottom: 0; left: 50%; transform: translateX(-50%); }
        .orbital-item:nth-child(4) { top: 50%; left: 0; transform: translateY(-50%); }

        @media (max-width: 768px) {
          .orbital-container { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit, .orbital-item { animation: none !important; }
        }

        /* Partners carousel */
        @keyframes carousel-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .partners-carousel {
          display: flex;
          gap: 40px;
          animation: carousel-scroll 25s linear infinite;
          width: max-content;
        }

        .partners-carousel:hover {
          animation-play-state: paused;
        }

        /* Gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #FF6B35, #F7931E, #FF8C42);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Glass card */
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Custom Cursor */}
      <div
        ref={cursorDotRef}
        className={`cursor-dot ${cursorHovering ? 'hovering' : ''}`}
      />
      <div
        ref={cursorRingRef}
        className={`cursor-ring ${cursorHovering ? 'hovering' : ''}`}
      />

      {/* Scroll Progress */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
        {/* Header */}
        <header className="fixed w-full top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-gray-200/50" style={{ padding: '8px 0' }}>
          <nav className="max-w-[1024px] mx-auto px-[22px] flex justify-between items-center h-8">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'system-ui' }}>
                InvyEasy
              </span>
              <span className="text-xs text-gray-400 font-medium">by AIGENZ</span>
            </div>

            <ul className="hidden md:flex items-center gap-6">
              <li><Link href="/use-cases/liquor-inventory" className="text-sm text-gray-700 hover:text-[#FF6B35] transition-colors">Liquor Inventory</Link></li>
              <li><Link href="/use-cases/consumption-tracker" className="text-sm text-gray-700 hover:text-[#FF6B35] transition-colors">Consumption Tracker</Link></li>
              <li><a href="#pricing" className="text-sm text-gray-700 hover:text-[#FF6B35] transition-colors">Pricing</a></li>
              <li><a href="#faq" className="text-sm text-gray-700 hover:text-[#FF6B35] transition-colors">FAQ</a></li>
              {!loading && user ? (
                <li>
                  <Link
                    href="/apps"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#FF6B35] text-white rounded-lg hover:bg-[#e55a2b] transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-sm text-gray-700 hover:text-[#FF6B35] transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="px-4 py-2 text-sm font-semibold border-2 border-[#465C88] text-[#465C88] rounded-lg hover:bg-[#465C88] hover:text-white transition-all"
                    >
                      Start Free Trial
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
              <div className="px-4 py-4 space-y-3">
                <Link href="/use-cases/liquor-inventory" className="block text-gray-700 py-2">Liquor Inventory</Link>
                <Link href="/use-cases/consumption-tracker" className="block text-gray-700 py-2">Consumption Tracker</Link>
                <a href="#pricing" className="block text-gray-700 py-2">Pricing</a>
                <a href="#faq" className="block text-gray-700 py-2">FAQ</a>
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {!loading && user ? (
                    <Link href="/apps" className="flex items-center justify-center gap-2 bg-[#FF6B35] text-white py-3 rounded-lg font-medium">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="block text-center text-gray-700 py-2">Sign In</Link>
                      <Link href="/signup" className="block text-center bg-[#FF6B35] text-white py-3 rounded-lg font-medium">
                        Start Free Trial
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex items-center relative overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          {/* Orbital Accents */}
          <div className="orbital-container absolute top-1/2 left-1/2 w-full h-full pointer-events-none overflow-hidden z-0" style={{ transform: 'translate(-50%, -50%)' }}>
            <div className="orbit orbit-1">
              <div className="orbital-item">
                <Package className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <BarChart3 className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <Shield className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
            </div>
            <div className="orbit orbit-2">
              <div className="orbital-item">
                <Users className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <Smartphone className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <Zap className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <Clock className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
            </div>
            <div className="orbit orbit-3">
              <div className="orbital-item">
                <Home className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <Briefcase className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
              <div className="orbital-item">
                <Heart className="w-5 h-5 text-[#FF6B35] opacity-70" />
              </div>
            </div>
          </div>

          <div className="max-w-[1000px] mx-auto px-6 text-center relative z-10">
            <h1 className="hero-animate hero-animate-1 text-5xl md:text-6xl font-bold leading-tight mb-4 text-black" style={{ fontFamily: 'system-ui' }}>
              Smart Tools for <span className="gradient-text">Hospitality</span>.
            </h1>
            <p className="hero-animate hero-animate-2 text-xl text-gray-600 mb-4" style={{ fontFamily: 'Inter, system-ui' }}>
              Inventory management, consumption tracking, and more.
            </p>
            <p className="hero-animate hero-animate-3 text-base text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Built for bars, restaurants, hotels, and event venues. Powerful apps that work together to streamline your operations. No complex setup required.
            </p>
            <div className="hero-animate hero-animate-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border-2 border-[#465C88] text-[#465C88] hover:bg-[#465C88] hover:text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base glass-card text-gray-700 border-2 border-gray-300 hover:border-black transition-all hover:-translate-y-0.5">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Why InvyEasy */}
        <section className="py-16" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="animate-on-scroll text-center mb-10">
              <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                Built for Hospitality
              </span>
              <h2 className="text-4xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                Why Choose <span className="gradient-text">InvyEasy</span>
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Purpose-built tools for bars, restaurants, and hospitality businesses
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="animate-on-scroll delay-1 text-center">
                <div className="text-5xl font-bold gradient-text mb-2">30</div>
                <div className="text-gray-600">Day Free Trial</div>
              </div>
              <div className="animate-on-scroll delay-2 text-center">
                <div className="text-5xl font-bold gradient-text mb-2">5min</div>
                <div className="text-gray-600">Setup Time</div>
              </div>
              <div className="animate-on-scroll delay-3 text-center">
                <div className="text-5xl font-bold gradient-text mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-[1000px] mx-auto px-6">
            {/* Feature 1 - Mobile App */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
              <div className="animate-on-scroll">
                <span className="inline-block px-3 py-1 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                  Mobile First
                </span>
                <h2 className="text-4xl font-bold text-black mb-4" style={{ fontFamily: 'system-ui' }}>
                  Powerful <span className="gradient-text">Mobile App</span>
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Take your inventory management anywhere with our powerful mobile app. Built for speed and ease of use.
                </p>
                <div className="space-y-3">
                  {[
                    'Hands-free barcode scanning',
                    'Real-time inventory tracking',
                    'Offline mode support',
                    'Team management with PINs'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex gap-4">
                  <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border-2 border-[#465C88] text-[#465C88] hover:bg-[#465C88] hover:text-white transition-all">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              <div className="animate-on-scroll delay-2 flex justify-center">
                <div className="glass-card rounded-2xl p-8 shadow-xl">
                  <Image
                    src="/iphone-main-mockup-landing-page.png"
                    alt="InvyEasy Mobile App"
                    width={400}
                    height={800}
                    className="w-64 h-auto drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Feature 2 - Dashboard (Reversed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
              <div className="animate-on-scroll delay-1 flex justify-center lg:order-1">
                <div className="glass-card rounded-2xl p-6 shadow-xl">
                  <Image
                    src="/InvyEasyLaptop1.png"
                    alt="InvyEasy Dashboard"
                    width={600}
                    height={400}
                    className="w-full max-w-md h-auto rounded-lg"
                  />
                </div>
              </div>
              <div className="animate-on-scroll lg:order-2">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mb-4">
                  Full Control
                </span>
                <h2 className="text-4xl font-bold text-black mb-4" style={{ fontFamily: 'system-ui' }}>
                  Powerful <span className="gradient-text">Dashboard</span>
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Get a complete view of your inventory across all locations. Manage items, generate reports, and stay organized.
                </p>
                <div className="space-y-3">
                  {[
                    'Multi-location management',
                    'Real-time analytics & reports',
                    'Supplier order tracking',
                    'Team collaboration tools'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Apps Showcase Section */}
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="animate-on-scroll text-center mb-12">
              <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                Our Platform
              </span>
              <h2 className="text-4xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                Powerful <span className="gradient-text">Apps</span>, One Platform
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Choose the apps your business needs. Each one built for hospitality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Liquor Inventory App */}
              <div className="animate-on-scroll delay-1 glass-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">Liquor Inventory</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Complete inventory management with barcode scanning, multi-location support, and automated stock alerts. Know exactly what you have, where it is, and when to reorder.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['Barcode Scanning', 'Stock Alerts', 'Multi-Location', 'Analytics'].map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-50 text-[#FF6B35] text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link href="/use-cases/liquor-inventory" className="text-[#FF6B35] font-medium text-sm hover:underline flex items-center gap-1">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Consumption Tracker App */}
              <div className="animate-on-scroll delay-2 glass-card rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">Consumption Tracker</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Track drinks and items served at events in real-time. Simple one-tap counting with instant reports sent straight to your inbox.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {['One-Tap Counting', 'Real-Time', 'Email Reports', 'Event Tracking'].map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link href="/use-cases/consumption-tracker" className="text-blue-500 font-medium text-sm hover:underline flex items-center gap-1">
                      Learn more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <p className="animate-on-scroll delay-3 text-center text-gray-500 text-sm">
              More apps coming soon — reservations, member management, and more.
            </p>
          </div>
        </section>

        {/* Use Cases Section */}
        <section id="use-cases" className="py-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="animate-on-scroll text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                Built for Hospitality
              </span>
              <h2 className="text-4xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                Perfect for <span className="gradient-text">Your Business</span>
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                From neighborhood bars to multi-location chains, we have you covered.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Bars & Nightclubs */}
              <div className="animate-on-scroll delay-1 glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🍸</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Bars & Nightclubs</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Track spirits across multiple bar stations. Reduce shrinkage with real-time visibility.
                </p>
              </div>

              {/* Restaurants */}
              <div className="animate-on-scroll delay-2 glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Restaurants</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Manage wine inventory, track beverage costs, and optimize ordering cycles.
                </p>
              </div>

              {/* Hotels & Resorts */}
              <div className="animate-on-scroll delay-3 glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🏨</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Hotels & Resorts</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Multi-location inventory for lobby bars, room service, and event spaces.
                </p>
              </div>

              {/* Event Venues */}
              <div className="animate-on-scroll delay-4 glass-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🎉</span>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Event Venues</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Track consumption per event. Generate instant reports for billing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="animate-on-scroll text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                How <span className="gradient-text">It Works</span>
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto">
                Get started in minutes with our simple 3-step process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { num: '1', title: 'Set Up Your Spaces', desc: 'Create storage areas for each bar, cellar, or location. Organize inventory the way your business works.' },
                { num: '2', title: 'Add Your Items', desc: 'Scan barcodes, import from spreadsheets, or add items manually. Build your catalog in minutes.' },
                { num: '3', title: 'Track & Manage', desc: 'Count inventory, get low-stock alerts, and generate reports. Invite your team with role-based access.' }
              ].map((step, i) => (
                <div key={i} className={`animate-on-scroll delay-${i + 1} text-center`}>
                  <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B35] to-[#F25050] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="animate-on-scroll text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                Simple Pricing
              </span>
              <h2 className="text-4xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                Plans for <span className="gradient-text">Every Business</span>
              </h2>
              <p className="text-gray-600 max-w-lg mx-auto mb-8">
                Start with a 30-day free trial. Upgrade as your business grows.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm ${!isAnnual ? 'text-black font-semibold' : 'text-gray-500'}`}>Monthly</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-14 h-7 rounded-full transition-colors ${isAnnual ? 'bg-[#FF6B35]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm ${isAnnual ? 'text-black font-semibold' : 'text-gray-500'}`}>Annual</span>
                {isAnnual && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Save 15%</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {/* Starter Plan */}
              <div className="animate-on-scroll delay-1 glass-card rounded-2xl p-6 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">Starter</h3>
                <p className="text-xs text-[#FF6B35] font-medium mb-2">Consumption Tracker</p>
                <p className="text-gray-500 text-sm mb-4">Track event consumption</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-black">${isAnnual ? '21' : '25'}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {['2 storage areas', '100 items', '1 user', 'Email reports'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-black transition-all text-sm">
                  Get Started
                </Link>
              </div>

              {/* Basic Plan */}
              <div className="animate-on-scroll delay-2 glass-card rounded-2xl p-6 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">Basic</h3>
                <p className="text-xs text-[#FF6B35] font-medium mb-2">Liquor Inventory</p>
                <p className="text-gray-500 text-sm mb-4">Essential inventory tools</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-black">${isAnnual ? '84' : '99'}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {['5 storage areas', '500 items', '3 users', 'Barcode scanning'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-black transition-all text-sm">
                  Get Started
                </Link>
              </div>

              {/* Professional Plan */}
              <div className="animate-on-scroll delay-3 glass-card rounded-2xl p-6 shadow-xl border-2 border-[#FF6B35] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#e55a2b] flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">Professional</h3>
                <p className="text-xs text-[#FF6B35] font-medium mb-2">Liquor Inventory (Full)</p>
                <p className="text-gray-500 text-sm mb-4">Full-featured inventory</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-black">${isAnnual ? '127' : '150'}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {['15 storage areas', '2,500 items', '10 users', 'Advanced analytics'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#FF6B35]" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center py-2.5 rounded-lg bg-[#FF6B35] text-white font-semibold hover:bg-[#e55a2b] transition-all text-sm">
                  Get Started
                </Link>
              </div>

              {/* Business Plan */}
              <div className="animate-on-scroll delay-4 glass-card rounded-2xl p-6 shadow-lg">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">Business</h3>
                <p className="text-xs text-[#FF6B35] font-medium mb-2">All Apps Included</p>
                <p className="text-gray-500 text-sm mb-4">Everything unlimited</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-black">${isAnnual ? '425' : '500'}</span>
                  <span className="text-gray-500 text-sm">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {['Unlimited areas', 'Unlimited items', 'Unlimited users', 'API access'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing" className="block text-center py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-black transition-all text-sm">
                  Get Started
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="animate-on-scroll delay-5 glass-card rounded-2xl p-6 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-4">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-black mb-1">Enterprise</h3>
                <p className="text-xs text-[#FF6B35] font-medium mb-2">Custom Solution</p>
                <p className="text-gray-500 text-sm mb-4">White-label & custom</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-black">Custom</span>
                  <span className="text-gray-500 text-sm ml-1">pricing</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {['White-label branding', 'Custom apps', 'Custom automations', '24/7 support'].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-slate-600" /> {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/contact?inquiry=enterprise" className="block text-center py-2.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-all text-sm">
                  Contact Sales
                </Link>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/pricing" className="text-[#FF6B35] font-medium hover:underline">
                View full pricing details →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
          <div className="max-w-3xl mx-auto px-6">
            <div className="animate-on-scroll text-center mb-16">
              <span className="inline-block px-4 py-2 rounded-full bg-orange-100 text-[#FF6B35] text-xs font-semibold mb-4">
                FAQ
              </span>
              <h2 className="text-4xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                Common <span className="gradient-text">Questions</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="animate-on-scroll glass-card rounded-xl overflow-hidden"
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <span className="font-semibold text-black">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${activeFAQ === index ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFAQ === index && (
                    <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}>
          <div className="max-w-[800px] mx-auto px-6 text-center">
            <div className="animate-on-scroll">
              <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'system-ui' }}>
                Ready to Get <span className="gradient-text">Organized</span>?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Start your 30-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-[#FF6B35] text-white hover:bg-[#e55a2b] transition-all hover:-translate-y-0.5"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border-2 border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-[#0f172a] border-t border-gray-800">
          <div className="max-w-[1024px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-semibold text-white">InvyEasy</span>
                  <span className="text-xs text-gray-500">by AIGENZ</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Simple, smart inventory management for everyone.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 text-sm hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-gray-400 text-sm hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#faq" className="text-gray-400 text-sm hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><Link href="/contact" className="text-gray-400 text-sm hover:text-white transition-colors">Contact</Link></li>
                  <li><a href="https://aigenz.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 text-sm hover:text-white transition-colors">AIGENZ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-gray-400 text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 text-sm hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} InvyEasy. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                A product by <a href="https://aigenz.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">AIGENZ</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
