'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Star, Package, Home, Briefcase, ArrowRight, Lock, Mail, User, Building, Eye, EyeOff, Building2 } from 'lucide-react'
import { trackSignup, trackButtonClick } from '@/lib/analytics'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    organization: '',
    useCase: 'bar',
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

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const canProceedStep1 = formData.firstName && formData.lastName && formData.email && formData.password.length >= 6
  const canProceedStep2 = formData.organization && formData.useCase

  const useCases = [
    { id: 'bar', title: 'Bar & Nightclub', icon: Briefcase },
    { id: 'restaurant', title: 'Restaurant', icon: Package },
    { id: 'hotel', title: 'Hotel & Resort', icon: Home },
    { id: 'events', title: 'Event Venue', icon: Star }
  ]

  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      app: 'Consumption Tracker',
      monthlyPrice: 25,
      yearlyPrice: 255,
      features: ['2 areas', '100 items', '1 user']
    },
    {
      id: 'basic',
      name: 'Basic',
      app: 'Liquor Inventory',
      monthlyPrice: 99,
      yearlyPrice: 1010,
      features: ['5 areas', '500 items', '3 users']
    },
    {
      id: 'professional',
      name: 'Professional',
      app: 'Liquor Inventory (Full)',
      monthlyPrice: 150,
      yearlyPrice: 1530,
      popular: true,
      features: ['15 areas', '2,500 items', '10 users']
    },
    {
      id: 'business',
      name: 'Business',
      app: 'All Apps',
      monthlyPrice: 500,
      yearlyPrice: 5100,
      features: ['Unlimited', 'API access', 'Priority support']
    }
  ]

  const selectedTierData = tiers.find(t => t.id === formData.selectedTier) || tiers[2]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 py-3 px-6">
        <nav className="max-w-[600px] mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-gray-900">InvyEasy</span>
            <span className="text-xs text-gray-400 font-medium">by AIGENZ</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-[480px]">

          {isSubmitted ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to InvyEasy!</h3>
              <p className="text-gray-600 mb-6">Your account has been created. Check your email to verify and get started.</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e55a2b] transition-all"
              >
                Sign In <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

              {/* Progress Steps */}
              <div className="flex border-b border-gray-100">
                {[
                  { num: 1, label: 'Account' },
                  { num: 2, label: 'Business' },
                  { num: 3, label: 'Plan' }
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`flex-1 py-3 px-4 text-center text-sm font-medium transition-colors ${
                      step === s.num
                        ? 'bg-[#FF6B35] text-white'
                        : step > s.num
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">Step {s.num}</span>
                    {step > s.num && <Check className="w-4 h-4 inline ml-1" />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-6">

                {/* Step 1: Account Details */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
                      <p className="text-sm text-gray-500 mt-1">Start your 30-day free trial</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent focus:bg-white transition-all text-gray-900 text-sm"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent focus:bg-white transition-all text-gray-900 text-sm"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent focus:bg-white transition-all text-gray-900 text-sm"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          minLength={6}
                          className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent focus:bg-white transition-all text-gray-900 text-sm"
                          placeholder="Min. 6 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!canProceedStep1}
                      className="w-full py-3 bg-[#FF6B35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-sm text-gray-500">
                      Already have an account?{' '}
                      <Link href="/login" className="text-[#FF6B35] font-medium hover:underline">Sign in</Link>
                    </p>
                  </div>
                )}

                {/* Step 2: Business Info */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Tell us about your business</h2>
                      <p className="text-sm text-gray-500 mt-1">We'll customize your experience</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleChange}
                          required
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent focus:bg-white transition-all text-gray-900 text-sm"
                          placeholder="Your business name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {useCases.map((uc) => {
                          const Icon = uc.icon
                          const isSelected = formData.useCase === uc.id
                          return (
                            <label
                              key={uc.id}
                              className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                isSelected ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name="useCase"
                                value={uc.id}
                                checked={isSelected}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#FF6B35]' : 'bg-gray-100'}`}>
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{uc.title}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceedStep2}
                        className="flex-1 py-3 bg-[#FF6B35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Choose Plan */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Choose your plan</h2>
                      <p className="text-sm text-gray-500 mt-1">30-day free trial, cancel anytime</p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 p-1 bg-gray-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                          formData.billingCycle === 'annual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                        }`}
                      >
                        Annual <span className="text-green-600 text-xs font-bold">-15%</span>
                      </button>
                    </div>

                    {/* Plan Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {tiers.map((tier) => {
                        const isSelected = formData.selectedTier === tier.id
                        const price = formData.billingCycle === 'monthly' ? tier.monthlyPrice : Math.round(tier.yearlyPrice / 12)
                        return (
                          <label
                            key={tier.id}
                            className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all ${
                              isSelected ? 'border-[#FF6B35] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
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
                            {tier.popular && (
                              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-full">
                                POPULAR
                              </span>
                            )}
                            <div className="text-center">
                              <h3 className="font-bold text-gray-900 text-sm">{tier.name}</h3>
                              <p className="text-[10px] text-[#FF6B35] font-medium">{tier.app}</p>
                              <div className="mt-2">
                                <span className="text-2xl font-bold text-gray-900">${price}</span>
                                <span className="text-gray-500 text-xs">/mo</span>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">{tier.features.join(' • ')}</p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-[#FF6B35] rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </label>
                        )
                      })}
                    </div>

                    {/* Enterprise Option */}
                    <Link
                      href="/contact?inquiry=enterprise"
                      className="block p-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-all text-center"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Enterprise</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">White-label, custom apps & automations</p>
                      <span className="text-xs text-[#FF6B35] font-medium">Contact Sales →</span>
                    </Link>

                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-[#FF6B35] text-white rounded-xl font-semibold hover:bg-[#e55a2b] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Creating...
                          </>
                        ) : (
                          <>Start Free Trial</>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-gray-400 text-center">
                      By signing up, you agree to our{' '}
                      <Link href="/terms" className="text-[#FF6B35] hover:underline">Terms</Link> &{' '}
                      <Link href="/privacy" className="text-[#FF6B35] hover:underline">Privacy</Link>
                    </p>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Trust indicators */}
          {!isSubmitted && (
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> No credit card</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> 30-day trial</span>
              <span className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Cancel anytime</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
