'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Star, Zap, Shield, Users, Building2, ArrowRight } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    businessType: '',
    employees: '',
    primaryApp: '',
    plan: '',
    billingCycle: 'monthly'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/signup-with-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      console.log('✅ Account created successfully:', result)
      
      // Redirect to Stripe checkout
      if (result.stripe_url) {
        window.location.href = result.stripe_url
      } else {
        setIsSubmitted(true)
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20">
      {/* Glassmorphic Bubble Navigation - Mofin Style */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
           }}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                   boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                 }}>
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Hospitality Hub</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Home</Link>
            <Link href="/#apps" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Apps</Link>
            <Link href="/#features" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Features</Link>
            <Link href="/pricing" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Pricing</Link>
            <Link href="/contact" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Contact</Link>
          </div>
          
          {/* CTA Button */}
          <Link href="/login" 
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>

      {/* Hero Section */}
      <section className="pt-24 pb-12 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                   borderColor: 'rgba(255, 119, 0, 0.2)',
                   color: '#ea580c'
                 }}>
              <Star className="w-3.5 h-3.5" />
              Start Your Free Trial
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
                Start Your Free Trial
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-blue-600 bg-clip-text text-transparent">Easy Hospitality Management</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Join 500+ hospitality businesses already using our platform to streamline operations, 
                reduce costs, and improve customer experiences.
                <span className="block mt-2 text-lg">
                  <span className="text-orange-600 font-semibold">8+ apps coming soon</span> - designed specifically for restaurants, bars, hotels, and clubs.
                </span>
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Signup Form */}
            <div className="rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                 }}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Create Your Account</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Hospitality Hub!</h3>
                  <p className="text-gray-600 mb-6">Your account has been created successfully. Check your email for next steps.</p>
                  <Link href="/login" className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Sign In to Your Account
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-sm"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                      >
                        <option value="">Select business type</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="bar">Bar/Nightclub</option>
                        <option value="hotel">Hotel/Resort</option>
                        <option value="country-club">Country Club</option>
                        <option value="catering">Catering</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Number of Employees
                      </label>
                      <select
                        id="employees"
                        name="employees"
                        value={formData.employees}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                      >
                        <option value="">Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="200+">200+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="primaryApp" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Which app are you most interested in? *
                    </label>
                    <select
                      id="primaryApp"
                      name="primaryApp"
                      value={formData.primaryApp}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-sm"
                    >
                      <option value="">Select primary app</option>
                      <option value="liquor-inventory">Liquor Inventory Management</option>
                      <option value="reservations">Reservation Management</option>
                      <option value="members">Member Database</option>
                      <option value="pos">POS System</option>
                      <option value="all">All Apps (Complete Platform)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Choose Your Plan *
                    </label>
                    
                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-gray-100 rounded-lg p-1 flex">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, billingCycle: 'monthly'})}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.billingCycle === 'monthly' 
                              ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, billingCycle: 'annual'})}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.billingCycle === 'annual' 
                              ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Annual
                          <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save 20%</span>
                        </button>
                      </div>
                    </div>

                    {/* Compact Plan Selection */}
                    <div className="space-y-3">
                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.plan === 'starter' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'starter'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.plan === 'starter' ? 'border-gray-900' : 'border-gray-300'
                            }`}>
                              {formData.plan === 'starter' && <div className="w-2 h-2 bg-gray-900 rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Starter</h3>
                              <p className="text-xs text-gray-600">1 app, up to 5 users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formData.billingCycle === 'monthly' ? '$29' : '$279'}
                              <span className="text-sm font-normal text-gray-600">
                                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                              </span>
                            </p>
                            {formData.billingCycle === 'annual' && (
                              <p className="text-xs text-green-600">Save $69/year</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.plan === 'professional' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'professional'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.plan === 'professional' ? 'border-gray-900' : 'border-gray-300'
                            }`}>
                              {formData.plan === 'professional' && <div className="w-2 h-2 bg-gray-900 rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Professional</h3>
                              <p className="text-xs text-gray-600">All apps, up to 25 users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formData.billingCycle === 'monthly' ? '$79' : '$759'}
                              <span className="text-sm font-normal text-gray-600">
                                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                              </span>
                            </p>
                            {formData.billingCycle === 'annual' && (
                              <p className="text-xs text-green-600">Save $189/year</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          formData.plan === 'enterprise' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'enterprise'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.plan === 'enterprise' ? 'border-gray-900' : 'border-gray-300'
                            }`}>
                              {formData.plan === 'enterprise' && <div className="w-2 h-2 bg-gray-900 rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Enterprise</h3>
                              <p className="text-xs text-gray-600">All apps + custom features</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formData.billingCycle === 'monthly' ? '$199' : '$1,909'}
                              <span className="text-sm font-normal text-gray-600">
                                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                              </span>
                            </p>
                            {formData.billingCycle === 'annual' && (
                              <p className="text-xs text-green-600">Save $479/year</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.plan && (
                      <input
                        type="hidden"
                        name="plan"
                        value={formData.plan}
                      />
                    )}
                    {formData.billingCycle && (
                      <input
                        type="hidden"
                        name="billingCycle"
                        value={formData.billingCycle}
                      />
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900 mb-2">What's included in your free trial:</p>
                        <ul className="space-y-1">
                          <li>• 30-day free trial with full access</li>
                          <li>• No credit card required</li>
                          <li>• Cancel anytime</li>
                          <li>• Full customer support</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.plan}
                    className="w-full text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    style={{
                      background: (isSubmitting || !formData.plan) ? '#9ca3af' : 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                      boxShadow: (isSubmitting || !formData.plan) ? 'none' : '0 8px 24px rgba(255, 119, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting && formData.plan) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 119, 0, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting && formData.plan) {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 119, 0, 0.3)';
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </form>
              )}
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-8">
              <div className="rounded-2xl p-8 backdrop-blur-xl border border-white/20"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,247,237,0.6) 100%)',
                     backdropFilter: 'blur(20px)',
                     WebkitBackdropFilter: 'blur(20px)',
                     boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
                   }}>
                <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Why Choose Hospitality Hub?</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                           boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                         }}>
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Get Started in Minutes</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">No complex setup required. Start using our platform immediately after signup.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                           boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                         }}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Bank-level security with 99.9% uptime guarantee and daily backups.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                           boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                         }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Dedicated Support</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">24/7 customer support with live chat, phone, and email assistance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                           boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                         }}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Scalable Platform</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Grow with confidence. Our platform scales from small businesses to enterprise.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="rounded-2xl p-8 backdrop-blur-xl border border-white/20"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.7) 100%)',
                     backdropFilter: 'blur(20px)',
                     WebkitBackdropFilter: 'blur(20px)',
                     boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1)'
                   }}>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-base mb-6 leading-relaxed font-medium">
                  "Hospitality Hub transformed our operations. We've reduced inventory waste by 40% and saved 5 hours per week on manual tasks."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
                       }}>
                    <span className="text-white font-bold text-sm">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base">Sarah Johnson</p>
                    <p className="text-gray-600 text-sm">General Manager, Blue Moon Restaurant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                     style={{
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                     }}>
                  <span className="text-white font-semibold text-sm">H</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">Hospitality Hub</span>
              </div>
              <p className="text-gray-600 text-sm">
                Complete hospitality management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Apps</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-orange-600 transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Member Database</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">POS System</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-orange-600 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/legal/privacy" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-orange-600 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-orange-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Hospitality Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
