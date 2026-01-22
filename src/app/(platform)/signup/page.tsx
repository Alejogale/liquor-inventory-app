'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Star, Package, Home, Heart, Briefcase, ArrowRight, Lock, Mail, User, Building } from 'lucide-react'
import { trackSignup, trackButtonClick } from '@/lib/analytics'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    useCase: 'restaurant',
    selectedTier: 'professional', // Default to most popular
    billingCycle: 'monthly'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

      console.log('✅ Account created successfully:', result)
      
      // Track successful signup
      trackSignup('email')
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('❌ Signup error:', error)
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
      description: 'Liquor, beer, wine, and food inventory tracking',
      icon: Briefcase,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'retail',
      title: 'Retail Store',
      description: 'Multi-location inventory and stock management',
      icon: Package,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'hospitality',
      title: 'Hospitality',
      description: 'Hotels, events, catering inventory control',
      icon: Home,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  // Pricing tiers matching database structure
  const tiers = [
    {
      id: 'personal',
      name: 'Personal',
      monthlyPrice: 19,
      yearlyPrice: 193,
      features: ['2 storage areas', '150 items', '1 user', 'Mobile app access']
    },
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: 89,
      yearlyPrice: 906,
      features: ['5 storage areas', '500 items', '5 users', 'Team collaboration']
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: 229,
      yearlyPrice: 2334,
      popular: true,
      features: ['15 storage areas', '2,000 items', '15 users', 'Advanced analytics']
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InvyEasy</span>
            </Link>
            
            {/* Back to Home */}
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left Side - Benefits */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Professional Inventory Management
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6">
                Join businesses managing their inventory with InvyEasy. Custom pricing based on your business size.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Enterprise-grade features</h3>
                  <p className="text-gray-600">Full inventory tracking, barcode scanning, real-time updates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hands-free operation</h3>
                  <p className="text-gray-600">Barcode scanner workflow for lightning-fast counting.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Multi-location support</h3>
                  <p className="text-gray-600">Manage inventory across multiple venues and locations.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile + Web platform</h3>
                  <p className="text-gray-600">iOS app for counting, web dashboard for management.</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white p-5 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">5.0/5 stars</span>
              </div>
              <p className="text-gray-700 italic mb-3">
                "InvyEasy transformed our inventory management. The barcode scanning is incredibly fast, and we've cut counting time by 70%."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Michael R.</p>
                  <p className="text-sm text-gray-600">Bar Manager</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Signup Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to InvyEasy!</h3>
                <p className="text-gray-600 mb-8">
                  Your account has been created successfully. Our team will contact you shortly to finalize your custom pricing.
                </p>
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  Sign In to Your Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Create Your Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="John"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="Create a secure password"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Must be at least 6 characters long
                    </p>
                  </div>

                  {/* Organization/Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization/Project Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        placeholder="My Home, My Business, etc."
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Your business or venue name
                    </p>
                  </div>

                  {/* Use Case Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What type of business do you have?
                    </label>
                    <div className="space-y-3">
                      {useCases.map((useCase) => {
                        const Icon = useCase.icon
                        return (
                          <label
                            key={useCase.id}
                            className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              formData.useCase === useCase.id
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="useCase"
                              value={useCase.id}
                              checked={formData.useCase === useCase.id}
                              onChange={handleChange}
                              className="sr-only"
                            />
                            <div className={`w-10 h-10 bg-gradient-to-br ${useCase.color} rounded-lg flex items-center justify-center mr-4`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{useCase.title}</h3>
                              <p className="text-sm text-gray-600">{useCase.description}</p>
                            </div>
                            {formData.useCase === useCase.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Billing Cycle Toggle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Billing Cycle
                    </label>
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          formData.billingCycle === 'monthly'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          formData.billingCycle === 'annual'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Annual
                        <span className="ml-2 text-xs">Save 15%</span>
                      </button>
                    </div>
                  </div>

                  {/* Tier Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Your Plan
                    </label>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tiers.map((tier) => {
                        const isSelected = formData.selectedTier === tier.id
                        const tierPrice = formData.billingCycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice
                        const tierSavings = tier.monthlyPrice * 12 - tier.yearlyPrice

                        return (
                          <label
                            key={tier.id}
                            className={`relative block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 shadow-md'
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

                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                                  {tier.popular && (
                                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                                      POPULAR
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                  <span className="text-2xl font-bold text-gray-900">
                                    ${tierPrice.toLocaleString()}
                                  </span>
                                  <span className="text-gray-600 text-sm">
                                    /{formData.billingCycle === 'monthly' ? 'mo' : 'yr'}
                                  </span>
                                </div>
                                {formData.billingCycle === 'annual' && tierSavings > 0 && (
                                  <p className="text-xs text-green-600 font-medium mb-2">
                                    Save ${tierSavings}/year
                                  </p>
                                )}
                                <ul className="space-y-1">
                                  {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                      <span>{feature}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {isSelected && (
                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      All plans include a <span className="font-semibold text-orange-600">30-day free trial</span>. No credit card required.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 text-center">
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className="text-orange-600 hover:text-orange-700">
                      Terms & Liability
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-orange-600 hover:text-orange-700">
                      Privacy Policy
                    </Link>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}