'use client'

import Link from 'next/link'
import { ArrowLeft, Package, AlertTriangle, Shield, CreditCard, Database, FileText, CheckCircle, Scale } from 'lucide-react'

export default function TermsPage() {
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

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using InvyEasy
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 25, 2025
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="prose prose-lg max-w-none">

            {/* Agreement */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing or using InvyEasy (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                If you disagree with any part of these terms, you may not access the Service.
              </p>
              <p className="text-gray-600 leading-relaxed">
                These terms apply to all users of the Service, including users of the web application and mobile applications.
              </p>
            </section>

            {/* Service Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                InvyEasy is an inventory management platform that allows users to:
              </p>
              <div className="bg-gray-50 p-6 rounded-xl">
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Track and manage inventory items across multiple locations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Organize items by categories, rooms, and suppliers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Perform inventory counts and track stock movements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Generate reports and export data</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Collaborate with team members</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Accounts */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use certain features of the Service, you must create an account. You agree to:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6 mb-4">
                <li>• Provide accurate and complete registration information</li>
                <li>• Maintain the security of your account credentials</li>
                <li>• Notify us immediately of any unauthorized access</li>
                <li>• Accept responsibility for all activities under your account</li>
              </ul>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-800 text-sm">
                  You must be at least 13 years old to create an account and use the Service.
                </p>
              </div>
            </section>

            {/* Subscriptions */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Subscriptions and Payments</h2>

              <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-800">Free Trial</h3>
                </div>
                <p className="text-orange-700">
                  New users may be eligible for a free trial period. At the end of the trial, you will need to
                  subscribe to continue using premium features.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Billing</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Subscription fees are billed in advance on a monthly or annual basis depending on your chosen plan.
                Payments are processed through Stripe (web) or Apple App Store / Google Play Store (mobile).
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation & Refunds</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may cancel your subscription at any time. Upon cancellation:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6 mb-4">
                <li>• You will retain access until the end of your current billing period</li>
                <li>• No refunds will be provided for partial billing periods</li>
                <li>• Your data will be retained and accessible if you resubscribe</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                Refunds may be considered for technical issues preventing service usage, billing errors, or duplicate charges.
                All refund requests are evaluated at our discretion.
              </p>
            </section>

            {/* Data Loss Disclaimer */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Data Responsibility</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800">Data Backup Recommendation</h3>
                </div>
                <div className="text-yellow-700 space-y-3">
                  <p>
                    While we take measures to protect your data, <strong>you are responsible for maintaining your own backups</strong>.
                    We recommend keeping copies of important inventory information outside of our system.
                  </p>
                  <p>We are not responsible for data loss due to:</p>
                  <ul className="ml-6 space-y-2">
                    <li>• System errors or technical issues</li>
                    <li>• Service interruptions or downtime</li>
                    <li>• User errors or accidental deletions</li>
                    <li>• Account termination</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Acceptable Use */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Acceptable Use</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to use the Service to:
              </p>
              <div className="bg-red-50 p-6 rounded-xl">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Violate any applicable laws or regulations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Infringe on intellectual property rights of others</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Attempt to gain unauthorized access to any systems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Transmit malware, viruses, or harmful code</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Interfere with or disrupt the Service</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Intellectual Property</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Our Property</h3>
                  <p className="text-gray-600 text-sm">
                    The Service, including its design, features, and content, is owned by InvyEasy and
                    protected by copyright, trademark, and other intellectual property laws.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Content</h3>
                  <p className="text-gray-600 text-sm">
                    You retain ownership of all data and content you upload to the Service.
                    You grant us a license to store and process your data solely to provide the Service.
                  </p>
                </div>
              </div>
            </section>

            {/* Disclaimers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Disclaimers & Limitation of Liability</h2>
              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                  EITHER EXPRESS OR IMPLIED.
                </p>
                <ul className="text-gray-600 space-y-2 ml-6">
                  <li>• No warranty of merchantability or fitness for a particular purpose</li>
                  <li>• No guarantee of uninterrupted or error-free operation</li>
                  <li>• No warranty of accuracy or reliability of any information</li>
                </ul>
              </div>

              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, InvyEasy shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including loss of profits, data,
                or business opportunities.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• Violates these Terms of Service</li>
                <li>• Is harmful to other users or the Service</li>
                <li>• Is fraudulent or illegal</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                You may terminate your account at any time through your account settings or by contacting us.
              </p>
            </section>

            {/* Service Changes */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Service Changes</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We reserve the right to modify, suspend, or discontinue the service at any time. This includes:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• Changes to features or functionality</li>
                <li>• Service interruptions for maintenance</li>
                <li>• Changes to pricing or terms</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We will make reasonable efforts to notify users of significant changes.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Governing Law</h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Jurisdiction</h3>
                </div>
                <p className="text-gray-600">
                  These Terms shall be governed by and construed in accordance with the laws of the
                  United States, without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">12. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of material changes
                by posting the new terms on this page and updating the &quot;Last updated&quot; date.
                Your continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">13. Contact Us</h2>
              <div className="bg-orange-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
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
              href="/privacy"
              className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
            >
              Privacy Policy
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
