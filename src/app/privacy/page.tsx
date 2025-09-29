'use client'

import Link from 'next/link'
import { ArrowLeft, Package, Shield, Eye, Lock, Database } from 'lucide-react'

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
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="prose prose-lg max-w-none">
            
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Easy Inventory is a personal project designed to help you manage your inventory. 
                This privacy policy explains how we collect, use, and protect your information.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using our service, you agree to the collection and use of information in accordance with this policy.
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
                    <li>• Organization/project name</li>
                    <li>• Use case preferences</li>
                    <li>• Account creation date</li>
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
                    <li>• Usage patterns and preferences</li>
                  </ul>
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
                    <span>To process your account and subscription</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To improve our service and user experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>To communicate with you about your account</span>
                  </li>
                </ul>
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
                  <li>• All data is encrypted in transit and at rest</li>
                  <li>• We use industry-standard security practices</li>
                  <li>• Access to your data is limited and monitored</li>
                  <li>• Regular security updates and monitoring</li>
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
                <li>• With service providers who assist in our operations (under strict confidentiality agreements)</li>
              </ul>
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
                    <li>• Delete your account and data</li>
                    <li>• Opt out of communications</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3">Data Portability</h3>
                  <ul className="text-gray-600 space-y-2 text-sm">
                    <li>• Request a copy of your data</li>
                    <li>• Transfer data to another service</li>
                    <li>• Data export in standard formats</li>
                    <li>• No vendor lock-in</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
              <div className="bg-orange-50 p-6 rounded-xl">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this privacy policy or how we handle your data, 
                  please contact us through our support channels.
                </p>
                <p className="text-sm text-gray-600">
                  This privacy policy may be updated from time to time. We will notify you of any 
                  significant changes by posting the new policy on this page.
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
