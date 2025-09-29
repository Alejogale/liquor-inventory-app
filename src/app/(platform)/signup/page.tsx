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
    useCase: 'personal',
    plan: 'pro',
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
          plan: 'pro',
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
      id: 'personal',
      title: 'Personal Use',
      description: 'Organize your home, pantry, garage, or closet',
      icon: Home,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'hobby',
      title: 'Hobby & Collectibles',
      description: 'Track craft supplies, sports equipment, books, games',
      icon: Heart,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'business',
      title: 'Small Business',
      description: 'Manage retail inventory, home-based business, side hustles',
      icon: Briefcase,
      color: 'from-blue-500 to-indigo-500'
    }
  ]

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
              <span className="text-xl font-bold text-gray-900">Easy Inventory</span>
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
                Start Your Free Trial
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                Join thousands of people who are organizing their lives with Easy Inventory.
              </p>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">30-day free trial</h3>
                  <p className="text-gray-600">No credit card required. Cancel anytime.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Setup in 5 minutes</h3>
                  <p className="text-gray-600">Get started immediately with our intuitive interface.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Perfect for everyone</h3>
                  <p className="text-gray-600">Whether you're organizing your home or running a business.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mobile-first design</h3>
                  <p className="text-gray-600">Count inventory on your phone, manage on any device.</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">4.9/5 stars</span>
              </div>
              <p className="text-gray-700 italic mb-4">
                "Finally, I can keep track of everything in my house! My pantry is perfectly organized and I never run out of essentials."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">SM</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah M.</p>
                  <p className="text-sm text-gray-600">Home Organizer</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Easy Inventory!</h3>
                <p className="text-gray-600 mb-8">
                  Your account has been created successfully. You can now start organizing everything you own!
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                      This could be your home, business name, or project name
                    </p>
                  </div>

                  {/* Use Case Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      How will you use Easy Inventory?
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

                  {/* Plan Selection */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Easy Inventory Pro</h3>
                      <p className="text-sm text-gray-600 mb-4">Everything you need to stay organized</p>
                      
                      {/* Billing Cycle Selection */}
                      <div className="space-y-3">
                        <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.billingCycle === 'monthly'
                            ? 'border-orange-500 bg-orange-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="billingCycle"
                            value="monthly"
                            checked={formData.billingCycle === 'monthly'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium text-gray-900">Monthly Plan</div>
                              <div className="text-sm text-gray-600">Pay monthly, cancel anytime</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">$10</div>
                              <div className="text-sm text-gray-600">/month</div>
                            </div>
                          </div>
                          {formData.billingCycle === 'monthly' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </label>
                        
                        <label className={`relative flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.billingCycle === 'annual'
                            ? 'border-orange-500 bg-orange-100'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            name="billingCycle"
                            value="annual"
                            checked={formData.billingCycle === 'annual'}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium text-gray-900">Annual Plan</div>
                              <div className="text-sm text-gray-600">Save $20 per year</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-gray-900">$100</div>
                              <div className="text-sm text-gray-600">/year</div>
                              <div className="text-xs text-green-600 font-medium">Save $20</div>
                            </div>
                          </div>
                          {formData.billingCycle === 'annual' && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Unlimited items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Multi-location</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Team access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Mobile app</span>
                      </div>
                    </div>
                    <p className="text-sm text-orange-700 font-medium">
                      🎉 30-day free trial • No credit card required
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
                        Start Free Trial
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