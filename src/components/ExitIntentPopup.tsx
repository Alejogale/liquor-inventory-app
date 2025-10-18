'use client'

import { useState, useEffect } from 'react'
import { X, Download, Sparkles, Package } from 'lucide-react'
import Image from 'next/image'

interface ExitIntentPopupProps {
  onEmailSubmit: (email: string) => Promise<void>
}

export function ExitIntentPopup({ onEmailSubmit }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Check if user already saw popup (localStorage)
    if (typeof window !== 'undefined') {
      const hasSeenPopup = localStorage.getItem('invyeasy_popup_shown')
      if (hasSeenPopup) {
        setHasShown(true)
        return
      }
    }

    let exitIntentTimeout: NodeJS.Timeout

    // Desktop: Mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasShown) return

      // Only trigger if mouse leaves from top (not sides/bottom)
      if (e.clientY <= 10 && !isVisible) {
        exitIntentTimeout = setTimeout(() => {
          setIsVisible(true)
          setHasShown(true)
          if (typeof window !== 'undefined') {
            localStorage.setItem('invyeasy_popup_shown', 'true')
          }
        }, 100)
      }
    }

    // Mobile: Scroll up aggressively (user might be leaving)
    let lastScrollY = 0
    const handleScroll = () => {
      if (hasShown) return

      const currentScrollY = window.scrollY

      // User scrolled up more than 100px rapidly
      if (currentScrollY < lastScrollY - 100 && currentScrollY > 300) {
        setIsVisible(true)
        setHasShown(true)
        if (typeof window !== 'undefined') {
          localStorage.setItem('invyeasy_popup_shown', 'true')
        }
      }

      lastScrollY = currentScrollY
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
      if (exitIntentTimeout) clearTimeout(exitIntentTimeout)
    }
  }, [isVisible, hasShown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    setIsSubmitting(true)

    try {
      await onEmailSubmit(email)
      setHasSubmitted(true)

      // Auto-download template after 2 seconds
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = '/templates/liquor-inventory-template.csv'
        link.download = 'liquor-inventory-template.csv'
        link.click()

        // Close popup after 3 seconds
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
      }, 2000)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Email capture error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white/90 rounded-full p-2 shadow-lg"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>

        {!hasSubmitted ? (
          <div className="grid md:grid-cols-5 gap-0">
            {/* Left side - Image (larger, 3 columns) */}
            <div className="hidden md:flex md:col-span-3 relative bg-gradient-to-br from-orange-500 to-red-500 p-8 items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Laptop Image - Larger */}
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src="/InvyEasyLaptop1.png"
                    alt="InvyEasy Dashboard Preview"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Right side - Form (smaller, 2 columns) */}
            <div className="md:col-span-2 p-8">
              {/* Mobile image */}
              <div className="md:hidden mb-6 -mx-8 -mt-8 p-6 bg-gradient-to-br from-orange-500 to-red-500">
                <div className="relative w-full aspect-[4/3]">
                  <Image
                    src="/InvyEasyLaptop1.png"
                    alt="InvyEasy Dashboard Preview"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Get Your Free Template
              </h2>

              <p className="text-gray-600 mb-6">
                Download our professional liquor inventory template — <span className="font-semibold text-orange-600">completely free</span>.
              </p>

              {/* Features */}
              <div className="space-y-2.5 mb-6 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>Pre-built formulas for calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>Sample data included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>Works with Excel & Google Sheets</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? 'Sending...' : 'Send Me the Template'}
                </button>
              </form>

              <p className="text-xs text-center text-gray-500 mt-4">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            {/* Success state */}
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-full">
                  <Download className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Check Your Email! 📧
              </h2>

              <p className="text-gray-600 mb-6">
                We've sent the template to <span className="font-semibold text-orange-600">{email}</span>.
                Your download will start automatically...
              </p>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold text-orange-600">Pro tip:</span> Ready to automate this?
                  Try InvyEasy for real-time inventory tracking, low-stock alerts, and more!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
