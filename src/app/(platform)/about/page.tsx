import Link from 'next/link'
import { Users, Target, Award, Heart, ArrowRight, Star, Zap, Shield } from 'lucide-react'

export default function AboutPage() {
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
              <Link href="/signup" className="bg-black hover:bg-slate-800 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg">
                Start Free Trial
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
              <Heart className="w-4 h-4" />
              Built for Hospitality
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                About Hospitality Hub
                <span className="block text-blue-600">Easy, Reliable Software for Hospitality</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                We're passionate about helping hospitality businesses thrive in the digital age. 
                Our platform brings together everything you need to run your business efficiently, 
                from inventory management to customer relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
              <div className="space-y-6 text-slate-600">
                <p>
                  Hospitality Hub was born from a simple observation: hospitality businesses were struggling 
                  with fragmented software solutions that didn't work together. Restaurant owners, hotel managers, 
                  and club operators were spending more time managing their tools than serving their customers.
                </p>
                <p>
                  We started with a single app - Liquor Inventory - and quickly realized that the real value 
                  came from creating a unified platform where all hospitality management tools work together seamlessly.
                </p>
                <p>
                  Today, we serve hundreds of businesses across the hospitality industry, from small family-owned 
                  restaurants to large hotel chains, helping them streamline operations and focus on what matters most: 
                  delivering exceptional experiences to their guests.
                </p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Our Vision</h3>
                    <p className="text-sm text-slate-600">To be the leading unified platform for hospitality management</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Our Mission</h3>
                    <p className="text-sm text-slate-600">Empower hospitality businesses with integrated tools that drive success</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Our Values</h3>
                    <p className="text-sm text-slate-600">Innovation, reliability, and customer success above all</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Trusted by Hundreds of Businesses
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our platform is helping hospitality businesses across the country streamline their operations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-slate-600">Active Businesses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-slate-600">Cities Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-slate-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Meet Our Team
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We're a passionate team of hospitality experts, developers, and designers 
              dedicated to building the best platform for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Leadership Team</h3>
              <p className="text-slate-600 text-sm">
                Experienced hospitality professionals with decades of combined industry knowledge.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Development Team</h3>
              <p className="text-slate-600 text-sm">
                Skilled engineers building robust, scalable solutions for modern businesses.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Support Team</h3>
              <p className="text-slate-600 text-sm">
                Dedicated customer success specialists ready to help you succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Our Core Values
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Excellence</h3>
              <p className="text-slate-600 text-sm">
                We strive for excellence in everything we do, from product development to customer support.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Customer First</h3>
              <p className="text-slate-600 text-sm">
                Our customers' success is our success. We listen, learn, and adapt to their needs.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Innovation</h3>
              <p className="text-slate-600 text-sm">
                We continuously innovate to stay ahead of industry trends and customer needs.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Reliability</h3>
              <p className="text-slate-600 text-sm">
                We build robust, secure systems that businesses can depend on day in and day out.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Collaboration</h3>
              <p className="text-slate-600 text-sm">
                We believe in the power of teamwork and collaboration, both internally and with our customers.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Integrity</h3>
              <p className="text-slate-600 text-sm">
                We operate with honesty, transparency, and integrity in all our business relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Join Our Mission?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your journey with Hospitality Hub and transform your business today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:shadow-xl flex items-center gap-2 justify-center group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 flex items-center gap-2 justify-center">
                Contact Us
              </Link>
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
