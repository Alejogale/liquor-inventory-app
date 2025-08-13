'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock, MessageSquare, ArrowRight, Check } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
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
            <div className="w-7 h-7 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg"
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
          
          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/signup" 
                  className="px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm text-white"
                  style={{
                    background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                    boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
                  }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mofin Style with Orange & Blue Tones */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-slate-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-slate-200/20 to-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              Get in Touch
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Contact Hospitality Hub
                <span className="block text-orange-600">Get Expert Help & Support</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Ready to transform your hospitality business? Our team is here to help you get started 
                and answer any questions you might have.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mini App Preview Section */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">
              See Our Platform in Action
            </h2>
            <p className="text-lg text-slate-600">
              Join 500+ hospitality businesses using our integrated suite.
            </p>
          </div>

          <div className="flex justify-center items-center space-x-8">
            {/* Mini Mockup 1 - Inventory */}
            <div className="w-48 h-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-4 bg-gray-900 rounded-t-xl"></div>
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 text-white">
                <h3 className="font-bold text-sm">Inventory</h3>
                <p className="text-orange-100 text-xs">Real-time tracking</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Premium Vodka</div>
                  <div className="text-green-600">In Stock: 42</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Single Malt</div>
                  <div className="text-orange-600">Low: 8</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Champagne</div>
                  <div className="text-red-600">Critical: 2</div>
                </div>
              </div>
            </div>

            {/* Mini Mockup 2 - Reservations */}
            <div className="w-48 h-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-4 bg-gray-900 rounded-t-xl"></div>
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 text-white">
                <h3 className="font-bold text-sm">Reservations</h3>
                <p className="text-blue-100 text-xs">Tonight's bookings</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Table 5 - 7:30 PM</div>
                  <div className="text-gray-500">Party of 4</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Table 12 - 8:00 PM</div>
                  <div className="text-gray-500">Party of 2</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">VIP Room - 9:00 PM</div>
                  <div className="text-purple-600">Corporate</div>
                </div>
              </div>
            </div>

            {/* Mini Mockup 3 - Members */}
            <div className="w-48 h-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <div className="h-4 bg-gray-900 rounded-t-xl"></div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white">
                <h3 className="font-bold text-sm">Members</h3>
                <p className="text-purple-100 text-xs">Premium database</p>
              </div>
              <div className="p-3 space-y-2">
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Sarah Chen</div>
                  <div className="text-green-600">VIP Member</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Mike Rodriguez</div>
                  <div className="text-blue-600">Gold Member</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <div className="font-medium">Lisa Johnson</div>
                  <div className="text-purple-600">Premium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                                        value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                        placeholder="John Doe"
                      />
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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                                        value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                                      value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="support">Technical Support</option>
                      <option value="demo">Request Demo</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-colors resize-none"
                      placeholder="Tell us about your business and how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                      boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
                <p className="text-slate-600 mb-8">
                  Our team is here to help you get the most out of Hospitality Hub. 
                  Whether you need technical support, want to discuss pricing, or just have questions, 
                  we're ready to assist you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Email Us</h3>
                    <p className="text-slate-600 mb-2">We'll respond within 24 hours</p>
                    <a href="mailto:hello@hospitalityhub.com" className="text-slate-600 hover:text-slate-700 font-medium">
                      hello@hospitalityhub.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Call Us</h3>
                    <p className="text-slate-600 mb-2">Mon-Fri, 9AM-6PM EST</p>
                    <a href="tel:+1-555-123-4567" className="text-slate-600 hover:text-slate-700 font-medium">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Visit Us</h3>
                    <p className="text-slate-600 mb-2">Schedule an in-person meeting</p>
                    <p className="text-slate-600">
                      123 Business Ave<br />
                      Suite 100<br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Support Hours</h3>
                    <p className="text-slate-600 mb-2">We're here when you need us</p>
                    <p className="text-slate-600">
                      Monday - Friday: 9AM - 6PM EST<br />
                      Saturday: 10AM - 4PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/signup" className="block w-full bg-white/20 hover:bg-white/30 text-white text-center px-4 py-3 rounded-xl font-medium transition-colors">
                    Start Free Trial
                  </Link>
                  <Link href="/pricing" className="block w-full bg-white/20 hover:bg-white/30 text-white text-center px-4 py-3 rounded-xl font-medium transition-colors">
                    View Pricing
                  </Link>
                  <a href="#" className="block w-full bg-white/20 hover:bg-white/30 text-white text-center px-4 py-3 rounded-xl font-medium transition-colors">
                    Schedule Demo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Quick answers to common questions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">How quickly can I get started?</h3>
              <p className="text-slate-600">You can start using Hospitality Hub immediately after signing up. Our setup process takes less than 5 minutes, and you'll have access to all features right away.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Do you offer training and onboarding?</h3>
              <p className="text-slate-600">Yes! We provide comprehensive onboarding for all new customers, including video tutorials, live training sessions, and dedicated support to ensure you get the most out of the platform.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Can I integrate with my existing systems?</h3>
              <p className="text-slate-600">Absolutely! Hospitality Hub integrates with most popular hospitality software, including POS systems, accounting software, and more. Contact us to discuss your specific integration needs.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">What kind of support do you provide?</h3>
              <p className="text-slate-600">We offer multiple support channels including email, phone, live chat, and video calls. Our support team is available during business hours, and we provide 24/7 emergency support for enterprise customers.</p>
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
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-lg flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                       boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                     }}>
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
