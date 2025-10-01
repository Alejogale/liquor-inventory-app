'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Mail, Download, Package, ArrowRight } from 'lucide-react'

function ConversionSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const sessionId = searchParams.get('session_id')
  const conversionId = searchParams.get('conversion_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || !conversionId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/inventory-conversion/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, conversionId }),
        })

        const result = await response.json()
        if (response.ok && result.success) {
          setPaymentVerified(true)
        }
      } catch (error) {
        console.error('Payment verification error:', error)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, conversionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your conversion request</p>
        </div>
      </div>
    )
  }

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
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for your payment. Your inventory conversion request has been received and our team will begin processing your files immediately.
          </p>

          {conversionId && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Conversion Request Details</h2>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="text-sm text-gray-600 mb-1">Conversion ID</div>
                <div className="font-mono text-gray-900 bg-white px-3 py-2 rounded border text-sm">
                  {conversionId}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Processing Time</h3>
                  <p className="text-sm text-gray-600">24-48 hours</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Delivery Method</h3>
                  <p className="text-sm text-gray-600">Email notification</p>
                </div>
                
                <div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Download className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">File Format</h3>
                  <p className="text-sm text-gray-600">InvyEasy template</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mb-8 max-w-2xl mx-auto border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-4">What Happens Next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                <div>
                  <p className="font-medium text-orange-800">File Review</p>
                  <p className="text-sm text-orange-700">Our experts review your uploaded inventory files</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                <div>
                  <p className="font-medium text-orange-800">Data Conversion</p>
                  <p className="text-sm text-orange-700">Convert your data to InvyEasy template format with proper categorization</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                <div>
                  <p className="font-medium text-orange-800">Quality Check</p>
                  <p className="text-sm text-orange-700">Verify accuracy and optimize par levels and thresholds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">4</div>
                <div>
                  <p className="font-medium text-orange-800">Delivery</p>
                  <p className="text-sm text-orange-700">Email you the converted file with import instructions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            
            <div>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Questions about your conversion? Contact us at{' '}
              <Link href="/contact" className="text-orange-600 hover:text-orange-700 font-medium">
                invyeasy.com/contact
              </Link>
            </p>
            <p className="text-xs text-gray-400">
              Keep your conversion ID for reference: {conversionId}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait while we load your conversion details</p>
      </div>
    </div>
  )
}

export default function ConversionSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConversionSuccessContent />
    </Suspense>
  )
}