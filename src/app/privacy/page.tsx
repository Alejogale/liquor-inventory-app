'use client'

import Link from 'next/link'
import { ArrowLeft, Package, Shield, Eye, Lock, Database, Smartphone, Globe, CreditCard } from 'lucide-react'

export default function PrivacyPage() {
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

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            How we handle your data and protect your privacy
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 25, 2025
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="prose prose-lg max-w-none">

            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                InvyEasy (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is an inventory management application available on web and mobile platforms.
                This privacy policy explains how we collect, use, and protect your information when you use our services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using InvyEasy, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Information We Collect</h2>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                  </div>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Name and email address</li>
                    <li>• Organization/business name</li>
                    <li>• Account preferences</li>
                    <li>• Authentication credentials</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Inventory Data</h3>
                  </div>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Items and categories you create</li>
                    <li>• Inventory counts and locations</li>
                    <li>• Room and supplier information</li>
                    <li>• Barcodes and product details</li>
                  </ul>
                </div>
              </div>

              {/* Mobile App Specific Data */}
              <div className="bg-blue-50 p-6 rounded-xl mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Mobile App Data</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  When using the InvyEasy mobile app, we may collect:
                </p>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li>• <strong>Purchase History:</strong> In-app subscription purchases for app functionality</li>
                  <li>• <strong>Product Interaction:</strong> How you interact with inventory items and features</li>
                  <li>• <strong>Camera Access:</strong> Only when you use barcode scanning (images are processed locally and not stored)</li>
                </ul>
                <div className="mt-4 p-4 bg-green-100 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">
                    This data is NOT linked to your identity and is NOT used for tracking purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How We Use Your Information</h2>
              <div className="bg-blue-50 p-6 rounded-xl">
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To provide and maintain our inventory management service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To process your account and subscription payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To sync your data across web and mobile platforms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To send important account notifications and updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To improve our service based on usage patterns</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Services</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We use trusted third-party services to provide our platform. These services have their own privacy policies:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Globe className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Supabase</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Database and authentication services</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Stripe</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Web payment processing</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">RevenueCat</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Mobile in-app purchase management</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Resend</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Transactional email delivery</p>
                </div>
              </div>
            </section>

            {/* Data Protection */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Protection</h2>
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Security Measures</h3>
                </div>
                <ul className="text-gray-700 space-y-2">
                  <li>• All data is encrypted in transit (HTTPS/TLS) and at rest</li>
                  <li>• We use industry-standard security practices</li>
                  <li>• Access to your data is limited and monitored</li>
                  <li>• Regular security updates and vulnerability monitoring</li>
                  <li>• Secure authentication with email verification</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• When required by law or legal process</li>
                <li>• To protect our rights and prevent fraud</li>
                <li>• With your explicit consent</li>
                <li>• With the service providers listed above (under strict confidentiality agreements)</li>
              </ul>
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>We do not:</strong> Sell your data, use it for advertising, or share it with data brokers.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Rights</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Access & Control</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• View and update your account information</li>
                    <li>• Export your inventory data</li>
                    <li>• Delete your account and all associated data</li>
                    <li>• Opt out of non-essential communications</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Data Portability</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Request a copy of your data</li>
                    <li>• Data export in standard formats (CSV)</li>
                    <li>• No vendor lock-in</li>
                    <li>• Transfer data to another service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Retention</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your data for as long as your account is active or as needed to provide services.
                When you delete your account:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• Your inventory data is permanently deleted within 30 days</li>
                <li>• Account information is removed from our systems</li>
                <li>• Some data may be retained for legal or compliance purposes</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Children&apos;s Privacy</h2>
              <p className="text-gray-600 leading-relaxed">
                InvyEasy is not intended for use by children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian and
                believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any significant
                changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                We encourage you to review this policy periodically.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <div className="bg-orange-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this privacy policy, how we handle your data,
                  or would like to exercise your data rights, please contact us:
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200"
                >
                  Contact Us
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </section>

          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-6">
            <Link
              href="/terms"
              className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/contact"
              className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
