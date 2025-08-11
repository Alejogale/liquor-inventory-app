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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Hospitality Hub</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">Home</Link>
              <Link href="/#apps" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">Apps</Link>
              <Link href="/#features" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">Features</Link>
              <Link href="/pricing" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">Pricing</Link>
              <Link href="/contact" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">Contact</Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              Start Your Free Trial
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Get Started with
                <span className="block text-blue-600">Hospitality Hub</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Join hundreds of hospitality businesses already using our platform to streamline operations, 
                reduce costs, and improve customer experiences.
              </p>
            </div>

            <div className="flex justify-center">
              <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Signup Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Your Account</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Welcome to Hospitality Hub!</h3>
                  <p className="text-slate-600 mb-6">Your account has been created successfully. Check your email for next steps.</p>
                  <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                    Sign In to Your Account
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-slate-700 mb-2">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                      <label htmlFor="employees" className="block text-sm font-medium text-slate-700 mb-2">
                        Number of Employees
                      </label>
                      <select
                        id="employees"
                        name="employees"
                        value={formData.employees}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    <label htmlFor="primaryApp" className="block text-sm font-medium text-slate-700 mb-2">
                      Which app are you most interested in? *
                    </label>
                    <select
                      id="primaryApp"
                      name="primaryApp"
                      value={formData.primaryApp}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Choose Your Plan *
                    </label>
                    
                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-slate-100 rounded-lg p-1 flex">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, billingCycle: 'monthly'})}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.billingCycle === 'monthly' 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, billingCycle: 'annual'})}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            formData.billingCycle === 'annual' 
                              ? 'bg-white text-slate-900 shadow-sm' 
                              : 'text-slate-600 hover:text-slate-900'
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
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          formData.plan === 'starter' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'starter'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                              {formData.plan === 'starter' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">Starter</h3>
                              <p className="text-xs text-slate-600">1 app, up to 5 users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">
                              {formData.billingCycle === 'monthly' ? '$29' : '$279'}
                              <span className="text-sm font-normal text-slate-600">
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
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          formData.plan === 'professional' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'professional'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                              {formData.plan === 'professional' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">Professional</h3>
                              <p className="text-xs text-slate-600">All apps, up to 25 users</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">
                              {formData.billingCycle === 'monthly' ? '$79' : '$759'}
                              <span className="text-sm font-normal text-slate-600">
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
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          formData.plan === 'enterprise' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'enterprise'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                              {formData.plan === 'enterprise' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">Enterprise</h3>
                              <p className="text-xs text-slate-600">All apps + custom features</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-900">
                              {formData.billingCycle === 'monthly' ? '$199' : '$1,909'}
                              <span className="text-sm font-normal text-slate-600">
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

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-slate-600">
                        <p className="font-medium text-slate-900 mb-1">What's included in your free trial:</p>
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
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                      Sign in here
                    </Link>
                  </p>
                </form>
              )}
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Choose Hospitality Hub?</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Get Started in Minutes</h3>
                      <p className="text-slate-600 text-sm">No complex setup required. Start using our platform immediately after signup.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Enterprise Security</h3>
                      <p className="text-slate-600 text-sm">Bank-level security with 99.9% uptime guarantee and daily backups.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Dedicated Support</h3>
                      <p className="text-slate-600 text-sm">24/7 customer support with live chat, phone, and email assistance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Scalable Platform</h3>
                      <p className="text-slate-600 text-sm">Grow with confidence. Our platform scales from small businesses to enterprise.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm mb-4">
                  "Hospitality Hub transformed our operations. We've reduced inventory waste by 40% and saved 5 hours per week on manual tasks."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">Sarah Johnson</p>
                    <p className="text-slate-500 text-xs">General Manager, Blue Moon Restaurant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-bold text-slate-900">Hospitality Hub</span>
              </div>
              <p className="text-slate-600 text-sm">
                Complete hospitality management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Apps</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Member Database</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">POS System</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/about" className="hover:text-slate-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900 transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="/legal/privacy" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2024 Hospitality Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
