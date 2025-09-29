'use client'

import Link from 'next/link'
import { ArrowLeft, Package, AlertTriangle, Shield, CreditCard, Database } from 'lucide-react'

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

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service & Liability
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Important information about using Easy Inventory
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="prose prose-lg max-w-none">
            
            {/* Important Notice */}
            <section className="mb-12">
              <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-red-800">Important Notice</h2>
                </div>
                <p className="text-red-700 leading-relaxed">
                  Easy Inventory is a personal project. By using this service, you acknowledge and agree 
                  to the terms and limitations outlined below. We are not responsible for data loss, 
                  service interruptions, or any damages that may occur from using this service.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Description</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Easy Inventory is a personal project designed to help users manage their inventory. 
                This service is provided "as is" without warranties of any kind.
              </p>
              <p className="text-gray-600 leading-relaxed">
                The service may experience downtime, bugs, or other issues. We do not guarantee 
                continuous availability or error-free operation.
              </p>
            </section>

            {/* Data Loss Disclaimer */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Loss Disclaimer</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-800">No Data Loss Responsibility</h3>
                </div>
                <div className="text-yellow-700 space-y-3">
                  <p>
                    <strong>We are NOT responsible for any data loss that may occur while using Easy Inventory.</strong>
                  </p>
                  <p>This includes but is not limited to:</p>
                  <ul className="ml-6 space-y-2">
                    <li>• Loss of inventory data due to system errors</li>
                    <li>• Data corruption or deletion</li>
                    <li>• Service interruptions or downtime</li>
                    <li>• Technical issues or bugs</li>
                    <li>• User errors or accidental deletions</li>
                  </ul>
                  <p>
                    <strong>You are responsible for backing up your own data.</strong> 
                    We recommend keeping copies of important inventory information outside of our system.
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Terms</h2>
              <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                  <h3 className="text-lg font-semibold text-orange-800">Payment & Refund Policy</h3>
                </div>
                <div className="text-orange-700 space-y-3">
                  <p>
                    <strong>Payments are generally non-refundable.</strong>
                  </p>
                  <p>Refunds will only be considered in the following circumstances:</p>
                  <ul className="ml-6 space-y-2">
                    <li>• Technical issues that prevent service usage for extended periods</li>
                    <li>• Billing errors on our part</li>
                    <li>• Duplicate charges</li>
                  </ul>
                  <p>
                    <strong>Refund decisions are at our sole discretion.</strong> 
                    All refund requests will be evaluated by our team, and we reserve the right 
                    to approve or deny refunds based on the specific circumstances.
                  </p>
                  <p>
                    To request a refund, contact us with a detailed explanation of the issue. 
                    We will evaluate each request individually and respond within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Service Limitations */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Limitations</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">No Warranties</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Service provided "as is"</li>
                    <li>• No guarantee of uptime</li>
                    <li>• No warranty of merchantability</li>
                    <li>• No fitness for particular purpose</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• No liability for data loss</li>
                    <li>• No liability for service interruptions</li>
                    <li>• No liability for indirect damages</li>
                    <li>• Maximum liability limited to fees paid</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">User Responsibilities</h2>
              <div className="bg-blue-50 p-6 rounded-xl">
                <p className="text-blue-800 mb-4">
                  By using Easy Inventory, you agree to:
                </p>
                <ul className="text-blue-700 space-y-2">
                  <li>• Use the service responsibly and legally</li>
                  <li>• Not attempt to harm or disrupt the service</li>
                  <li>• Keep your account information secure</li>
                  <li>• Back up your own data regularly</li>
                  <li>• Report bugs or issues promptly</li>
                  <li>• Comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            {/* Service Changes */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Changes</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We reserve the right to modify, suspend, or discontinue the service at any time 
                without notice. This includes:
              </p>
              <ul className="text-gray-600 space-y-2 ml-6">
                <li>• Changes to features or functionality</li>
                <li>• Service interruptions for maintenance</li>
                <li>• Temporary or permanent service shutdown</li>
                <li>• Changes to pricing or terms</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact & Disputes</h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  For questions about these terms or to report issues, please contact us through 
                  our support channels.
                </p>
                <p className="text-sm text-gray-600">
                  These terms may be updated from time to time. Continued use of the service 
                  after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
