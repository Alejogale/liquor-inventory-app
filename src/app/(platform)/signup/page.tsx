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
    <div className="min-h-screen bg-white">
      {/* Clean Modern Navigation */}
      <nav className="nav-modern">
        <div className="container-max">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-headline text-primary">Hospitality Hub</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-muted hover:text-primary transition-colors font-medium">Home</Link>
              <Link href="/#apps" className="text-muted hover:text-primary transition-colors font-medium">Apps</Link>
              <Link href="/#features" className="text-muted hover:text-primary transition-colors font-medium">Features</Link>
              <Link href="/pricing" className="text-muted hover:text-primary transition-colors font-medium">Pricing</Link>
              <Link href="/contact" className="text-muted hover:text-primary transition-colors font-medium">Contact</Link>
            </div>
            
            {/* CTA Button */}
            <Link href="/login" className="text-muted hover:text-primary transition-colors font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section-spacing bg-white">
        <div className="container-max">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-stone-gray">
              <Star className="w-4 h-4 text-accent" />
              <span className="text-caption text-secondary">Start Your Free Trial</span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-display text-primary">
                Start Your Free Trial
                <span className="block text-secondary">Easy Hospitality Management</span>
              </h1>
              <p className="text-body text-muted max-w-3xl mx-auto leading-relaxed">
                Join 500+ hospitality businesses already using our platform to streamline operations, 
                reduce costs, and improve customer experiences.
                <span className="block mt-2 text-lg">
                  <span className="text-accent font-semibold">8+ apps coming soon</span> - designed specifically for restaurants, bars, hotels, and clubs.
                </span>
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-accent font-medium text-caption transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Form Section */}
      <section className="py-16 bg-surface">
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Signup Form */}
            <div className="card-elevated">
              <h2 className="text-headline text-primary mb-8">Create Your Account</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-title text-primary mb-2">Welcome to Hospitality Hub!</h3>
                  <p className="text-body text-muted mb-6">Your account has been created successfully. Check your email for next steps.</p>
                  <Link href="/login" className="button-primary">
                    Sign In to Your Account
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-caption text-secondary mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="input-modern"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-caption text-secondary mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="input-modern"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-caption text-secondary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-modern"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-caption text-secondary mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="input-modern"
                        placeholder="Your Company"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-caption text-secondary mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-modern"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="businessType" className="block text-caption text-secondary mb-2">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                        className="input-modern"
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
                      <label htmlFor="employees" className="block text-caption text-secondary mb-2">
                        Number of Employees
                      </label>
                      <select
                        id="employees"
                        name="employees"
                        value={formData.employees}
                        onChange={handleChange}
                        className="input-modern"
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
                    <label htmlFor="primaryApp" className="block text-caption text-secondary mb-2">
                      Which app are you most interested in? *
                    </label>
                    <select
                      id="primaryApp"
                      name="primaryApp"
                      value={formData.primaryApp}
                      onChange={handleChange}
                      required
                      className="input-modern"
                    >
                      <option value="">Select primary app</option>
                      <option value="liquor-inventory">Liquor Inventory Management</option>
                      <option value="consumption-sheet">Consumption Sheet</option>
                      <option value="reservations">Reservation Management</option>
                      <option value="members">Member Database</option>
                      <option value="all">All Apps (Complete Platform)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-caption text-secondary mb-3">
                      Choose Your Plan *
                    </label>
                    
                    {/* Billing Cycle Toggle */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-surface rounded-lg p-1 flex border border-stone-gray">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, billingCycle: 'monthly'})}
                          className={`px-4 py-2 rounded-md text-caption font-medium transition-colors ${
                            formData.billingCycle === 'monthly' 
                              ? 'bg-white text-primary shadow-sm border border-stone-gray' 
                              : 'text-muted hover:text-primary'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, billingCycle: 'annual'})}
                          className={`px-4 py-2 rounded-md text-caption font-medium transition-colors ${
                            formData.billingCycle === 'annual' 
                              ? 'bg-white text-primary shadow-sm border border-stone-gray' 
                              : 'text-muted hover:text-primary'
                          }`}
                        >
                          Annual
                          <span className="ml-1 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">Save 30%</span>
                        </button>
                      </div>
                    </div>

                    {/* Compact Plan Selection */}
                    <div className="space-y-3">
                      <div 
                        className={`card cursor-pointer transition-all ${
                          formData.plan === 'individual' ? 'border-primary bg-surface' : 'hover:border-slate-gray'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'individual'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.plan === 'individual' ? 'border-primary' : 'border-stone-gray'
                            }`}>
                              {formData.plan === 'individual' && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="text-title text-primary">Individual App</h3>
                              <p className="text-caption text-muted">Start with one app, upgrade anytime</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-body font-bold text-primary">
                              {formData.billingCycle === 'monthly' ? '$29-79' : '$243-663'}
                              <span className="text-caption font-normal text-muted">
                                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                              </span>
                            </p>
                            <p className="text-caption text-muted">
                              {formData.billingCycle === 'monthly' ? 'Per app pricing' : 'Save 30% annually'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`card cursor-pointer transition-all ${
                          formData.plan === 'platform' ? 'border-accent bg-accent/5' : 'hover:border-slate-gray'
                        }`} 
                        onClick={() => setFormData({...formData, plan: 'platform'})}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              formData.plan === 'platform' ? 'border-accent' : 'border-stone-gray'
                            }`}>
                              {formData.plan === 'platform' && <div className="w-2 h-2 bg-accent rounded-full"></div>}
                            </div>
                            <div>
                              <h3 className="text-title text-primary">All Apps Platform</h3>
                              <p className="text-caption text-muted">Complete access to all current & future apps</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-body font-bold text-primary">
                              {formData.billingCycle === 'monthly' ? '$999' : '$8,388'}
                              <span className="text-caption font-normal text-muted">
                                /{formData.billingCycle === 'monthly' ? 'month' : 'year'}
                              </span>
                            </p>
                            {formData.billingCycle === 'annual' && (
                              <p className="text-caption text-accent">Save $6,000/year</p>
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

                  <div className="card bg-surface">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <div className="text-caption text-muted">
                        <p className="text-title text-primary mb-2">What's included in your free trial:</p>
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
                    className={`w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      isSubmitting || !formData.plan ? 'button-secondary' : 'button-primary'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        Start Free Trial
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-caption text-muted">
                    Already have an account?{' '}
                    <Link href="/login" className="text-accent hover:text-primary font-medium transition-colors">
                      Sign in here
                    </Link>
                  </p>
                </form>
              )}
            </div>

            {/* Benefits Sidebar */}
            <div className="space-y-8">
              <div className="card-elevated">
                <h2 className="text-headline text-primary mb-8">Why Choose Hospitality Hub?</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-title text-primary mb-1">Get Started in Minutes</h3>
                      <p className="text-body text-muted leading-relaxed">No complex setup required. Start using our platform immediately after signup.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-title text-primary mb-1">Enterprise Security</h3>
                      <p className="text-body text-muted leading-relaxed">Bank-level security with 99.9% uptime guarantee and daily backups.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-charcoal rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-title text-primary mb-1">Dedicated Support</h3>
                      <p className="text-body text-muted leading-relaxed">24/7 customer support with live chat, phone, and email assistance.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-gray rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-title text-primary mb-1">Scalable Platform</h3>
                      <p className="text-body text-muted leading-relaxed">Grow with confidence. Our platform scales from small businesses to enterprise.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="card-elevated">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-accent fill-current" />
                  ))}
                </div>
                <p className="text-body text-primary mb-6 leading-relaxed font-medium">
                  "Hospitality Hub transformed our operations. We've reduced inventory waste by 40% and saved 5 hours per week on manual tasks."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">SJ</span>
                  </div>
                  <div>
                    <p className="text-title text-primary">Sarah Johnson</p>
                    <p className="text-caption text-muted">General Manager, Blue Moon Restaurant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-gray py-12">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-title text-primary">Hospitality Hub</span>
              </div>
              <p className="text-caption text-muted">
                Complete hospitality management platform for modern businesses.
              </p>
            </div>
            
            <div>
              <h3 className="text-title text-primary mb-4">Apps</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><a href="#" className="hover:text-accent transition-colors">Liquor Inventory</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Consumption Sheet</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Reservation Management</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Member Database</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-title text-primary mb-4">Company</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/about" className="hover:text-accent transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-accent transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-title text-primary mb-4">Legal</h3>
              <ul className="space-y-2 text-caption text-muted">
                <li><Link href="/legal/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="hover:text-accent transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-stone-gray mt-8 pt-8 text-center text-caption text-muted">
            <p>&copy; 2024 Hospitality Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}