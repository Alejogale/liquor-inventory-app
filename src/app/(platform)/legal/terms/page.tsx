import Link from 'next/link'
import { FileText, Shield, Users, ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
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
              <FileText className="w-4 h-4" />
              Terms & Conditions
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                Terms of Service
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                Please read these terms carefully before using our services.
              </p>
            </div>

            <div className="flex justify-center">
              <Link href="/legal" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                <ArrowLeft className="w-4 h-4" />
                Back to Legal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="prose prose-slate max-w-none">
              <div className="text-sm text-slate-500 mb-8">
                <p>Last updated: December 2024</p>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 mb-6">
                By accessing and using Hospitality Hub services, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-600 mb-6">
                Hospitality Hub provides a comprehensive platform for hospitality business management, including 
                but not limited to inventory management, reservation systems, member databases, and point-of-sale solutions. 
                Our services are designed to help businesses streamline their operations and improve efficiency.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
              <p className="text-slate-600 mb-6">
                To access certain features of our service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Acceptable Use</h2>
              <p className="text-slate-600 mb-6">
                You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the service</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Payment Terms</h2>
              <p className="text-slate-600 mb-6">
                Our services are offered on a subscription basis. Payment terms include:
              </p>
              <ul className="list-disc list-inside text-slate-600 mb-6 space-y-2">
                <li>All fees are billed in advance on a monthly or annual basis</li>
                <li>Payments are non-refundable except as specified in our refund policy</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li>Failure to pay may result in service suspension or termination</li>
              </ul>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data and Privacy</h2>
              <p className="text-slate-600 mb-6">
                Your privacy is important to us. Our collection and use of personal information is governed by our 
                Privacy Policy, which is incorporated into these terms by reference. You agree to our collection 
                and use of information as described in our Privacy Policy.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Intellectual Property</h2>
              <p className="text-slate-600 mb-6">
                The service and its original content, features, and functionality are owned by Hospitality Hub 
                and are protected by international copyright, trademark, patent, trade secret, and other 
                intellectual property laws. You may not reproduce, distribute, or create derivative works 
                without our express written consent.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. User Content</h2>
              <p className="text-slate-600 mb-6">
                You retain ownership of any content you submit to our service. By submitting content, you grant us 
                a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content 
                in connection with providing the service.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Service Availability</h2>
              <p className="text-slate-600 mb-6">
                We strive to maintain high service availability but cannot guarantee uninterrupted access. 
                We may perform maintenance, updates, or modifications that temporarily affect service availability. 
                We will provide reasonable notice for scheduled maintenance when possible.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-600 mb-6">
                To the maximum extent permitted by law, Hospitality Hub shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including without limitation, loss of 
                profits, data, use, goodwill, or other intangible losses resulting from your use of the service.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Disclaimer of Warranties</h2>
              <p className="text-slate-600 mb-6">
                The service is provided "as is" and "as available" without warranties of any kind, either express 
                or implied. We disclaim all warranties, including but not limited to implied warranties of 
                merchantability, fitness for a particular purpose, and non-infringement.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Termination</h2>
              <p className="text-slate-600 mb-6">
                We may terminate or suspend your account and access to the service immediately, without prior notice 
                or liability, for any reason whatsoever, including without limitation if you breach the terms. 
                Upon termination, your right to use the service will cease immediately.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Governing Law</h2>
              <p className="text-slate-600 mb-6">
                These terms shall be governed by and construed in accordance with the laws of the State of New York, 
                without regard to its conflict of law provisions. Any disputes arising from these terms or the service 
                shall be resolved in the courts of New York.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">14. Changes to Terms</h2>
              <p className="text-slate-600 mb-6">
                We reserve the right to modify or replace these terms at any time. If a revision is material, 
                we will provide at least 30 days notice prior to any new terms taking effect. Your continued 
                use of the service after any changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 mb-4">15. Contact Information</h2>
              <p className="text-slate-600 mb-6">
                If you have any questions about these terms of service, please contact us at:
              </p>
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <p className="text-slate-600 mb-2">
                  <strong>Email:</strong> legal@hospitalityhub.com
                </p>
                <p className="text-slate-600 mb-2">
                  <strong>Address:</strong> 123 Business Ave, Suite 100, New York, NY 10001
                </p>
                <p className="text-slate-600">
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
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
