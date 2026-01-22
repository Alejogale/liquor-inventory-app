'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Star, Package, Home, Briefcase, ArrowRight, Lock, Mail, User, Building, Eye, EyeOff } from 'lucide-react'
import { trackSignup, trackButtonClick } from '@/lib/analytics'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    useCase: 'restaurant',
    selectedTier: 'professional',
    billingCycle: 'monthly'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          businessType: formData.useCase,
          company: formData.organization,
          primaryApp: 'liquor-inventory',
          plan: formData.selectedTier,
          billingCycle: formData.billingCycle,
          password: formData.password
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      console.log('Account created successfully:', result)
      trackSignup('email')
      setIsSubmitted(true)
    } catch (error) {
      console.error('Signup error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const useCases = [
    {
      id: 'restaurant',
      title: 'Restaurant & Bar',
      description: 'Liquor, beer, wine, and food inventory',
      icon: Briefcase
    },
    {
      id: 'retail',
      title: 'Retail Store',
      description: 'Multi-location stock management',
      icon: Package
    },
    {
      id: 'hospitality',
      title: 'Hospitality',
      description: 'Hotels, events, catering',
      icon: Home
    }
  ]

  const tiers = [
    {
      id: 'personal',
      name: 'Personal',
      monthlyPrice: 19,
      yearlyPrice: 193,
      features: ['2 storage areas', '150 items', '1 user', 'Mobile app']
    },
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 89,
      yearlyPrice: 906,
      features: ['5 storage areas', '500 items', '5 users', 'Team collab']
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 229,
      yearlyPrice: 2334,
      popular: true,
      features: ['15 storage areas', '2,000 items', '15 users', 'Analytics']
    },
    {
      id: 'premium',
      name: 'Premium',
      monthlyPrice: 499,
      yearlyPrice: 5087,
      features: ['50 storage areas', '10,000 items', '50 users', 'Multi-location']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 1499,
      yearlyPrice: 15287,
      features: ['Unlimited areas', 'Unlimited items', 'Unlimited users', 'White-label']
    }
  ]

  const selectedTierData = tiers.find(t => t.id === formData.selectedTier) || tiers[2]
  const price = formData.billingCycle === 'monthly' ? selectedTierData.monthlyPrice : selectedTierData.yearlyPrice
  const savings = selectedTierData.monthlyPrice * 12 - selectedTierData.yearlyPrice

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      {/* Header */}
      <header className="fixed w-full top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-gray-200/50" style={{ padding: '12px 0' }}>
        <nav className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'system-ui' }}>
              InvyEasy
            </span>
            <span className="text-xs text-gray-400 font-medium">by AIGENZ</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">

            {/* Left Side - Benefits */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-black mb-3" style={{ fontFamily: 'system-ui' }}>
                  Professional Inventory Management
                </h1>
                <p className="text-gray-600">
                  Join businesses managing their inventory with InvyEasy. Custom pricing based on your business size.
                </p>
              </div>

              {/* Benefits List */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6 space-y-4">
                {[
                  { title: 'Enterprise-grade features', desc: 'Full inventory tracking, barcode scanning, real-time updates.' },
                  { title: 'Hands-free operation', desc: 'Barcode scanner workflow for lightning-fast counting.' },
                  { title: 'Multi-location support', desc: 'Manage inventory across multiple venues and locations.' },
                  { title: 'Mobile + Web platform', desc: 'iOS app for counting, web dashboard for management.' }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Proof */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">5.0/5 stars</span>
                </div>
                <p className="text-gray-700 italic text-sm mb-3">
                  "InvyEasy transformed our inventory management. The barcode scanning is incredibly fast, and we've cut counting time by 70%."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Michael R.</p>
                    <p className="text-xs text-gray-600">Bar Manager</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-6">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'system-ui' }}>
                    Welcome to InvyEasy!
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Your account has been created successfully. Our team will contact you shortly to finalize your custom pricing.
                  </p>
                  <Link
                    href="/login"
                    className="bg-[#FF6B35] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#e55a2b] transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                  >
                    Sign In to Your Account
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-black mb-5" style={{ fontFamily: 'system-ui' }}>
                    Create Your Account
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full pl-9 pr-9 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                          placeholder="Create a secure password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Must be at least 6 characters long
                      </p>
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Organization Name
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400 text-sm"
                          placeholder="My Business Name"
                        />
                      </div>
                    </div>

                    {/* Use Case Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {useCases.map((useCase) => {
                          const Icon = useCase.icon
                          const isSelected = formData.useCase === useCase.id
                          return (
                            <label
                              key={useCase.id}
                              className={`relative flex flex-col items-center p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#FF6B35] bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="useCase"
                                value={useCase.id}
                                checked={isSelected}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                                isSelected ? 'bg-[#FF6B35]' : 'bg-gray-200'
                              }`}>
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <span className="text-xs font-medium text-gray-900 text-center">{useCase.title}</span>
                              {isSelected && (
                                <div className="absolute top-1 right-1 w-4 h-4 bg-[#FF6B35] rounded-full flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Billing Cycle Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Cycle
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            formData.billingCycle === 'monthly'
                              ? 'bg-[#FF6B35] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                          className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                            formData.billingCycle === 'annual'
                              ? 'bg-[#FF6B35] text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Annual
                          <span className="text-xs opacity-80">Save 15%</span>
                        </button>
                      </div>
                    </div>

                    {/* Tier Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose Your Plan
                      </label>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {tiers.map((tier) => {
                          const isSelected = formData.selectedTier === tier.id
                          const tierPrice = formData.billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice
                          const tierSavings = tier.monthlyPrice * 12 - tier.yearlyPrice

                          return (
                            <label
                              key={tier.id}
                              className={`relative block p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#FF6B35] bg-orange-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="selectedTier"
                                value={tier.id}
                                checked={isSelected}
                                onChange={handleChange}
                                className="sr-only"
                              />

                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <h3 className="font-semibold text-gray-900 text-sm">{tier.name}</h3>
                                    {tier.popular && (
                                      <span className="px-1.5 py-0.5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full">
                                        POPULAR
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-gray-900">
                                      ${tierPrice.toLocaleString()}
                                    </span>
                                    <span className="text-gray-600 text-xs">
                                      /{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
                                    </span>
                                    {formData.billingCycle === 'annual' && tierSavings > 0 && (
                                      <span className="text-xs text-green-600 font-medium ml-1">
                                        Save ${tierSavings}/yr
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {tier.features.join(' • ')}
                                  </p>
                                </div>

                                {isSelected && (
                                  <div className="w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                                    <Check className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        All plans include a <span className="font-semibold text-[#FF6B35]">30-day free trial</span>. No credit card required.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#FF6B35] text-white hover:bg-[#e55a2b] shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Creating Account...
                        </div>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {/* Terms */}
                    <p className="text-xs text-gray-500 text-center">
                      By creating an account, you agree to our{' '}
                      <Link href="/terms" className="text-[#FF6B35] hover:text-[#e55a2b]">
                        Terms & Liability
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-[#FF6B35] hover:text-[#e55a2b]">
                        Privacy Policy
                      </Link>
                    </p>

                    {/* Login Link */}
                    <p className="text-center text-gray-600 text-sm">
                      Already have an account?{' '}
                      <Link href="/login" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-8 text-center">
        <p className="text-gray-500 text-sm">
          A product by{' '}
          <a href="https://aigenz.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
            AIGENZ
          </a>
        </p>
      </div>
    </div>
  )
}
