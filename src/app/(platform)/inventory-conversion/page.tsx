'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, CheckCircle, DollarSign, Clock, Shield, Download, Package, Zap, AlertTriangle } from 'lucide-react'

export default function InventoryConversionPage() {
  const [files, setFiles] = useState<File[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'upload' | 'payment' | 'success'>('upload')
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (files.length === 0) {
      setError('Please upload at least one inventory file')
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      setError('Please fill in your name and email address')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Create FormData for file upload
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      formData.append('customerInfo', JSON.stringify(customerInfo))

      // Upload files and create conversion request
      const response = await fetch('/api/inventory-conversion/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload files')
      }

      // Proceed to payment
      setStep('payment')
      
      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/inventory-conversion/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversionId: result.conversionId,
          customerEmail: customerInfo.email,
        }),
      })

      const checkoutResult = await checkoutResponse.json()

      if (!checkoutResponse.ok) {
        throw new Error(checkoutResult.error || 'Failed to create payment session')
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutResult.url

    } catch (error) {
      console.error('Conversion upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to process request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const acceptedFileTypes = [
    '.xlsx', '.xls', '.csv', '.tsv', '.txt'
  ]

  const features = [
    {
      icon: Zap,
      title: "Professional Conversion",
      description: "Our experts manually review and convert your data to ensure 100% accuracy"
    },
    {
      icon: Clock,
      title: "24-48 Hour Delivery",
      description: "Receive your converted template file within 1-2 business days"
    },
    {
      icon: Shield,
      title: "Secure & Confidential",
      description: "Your inventory data is encrypted and permanently deleted after conversion"
    },
    {
      icon: CheckCircle,
      title: "Quality Guarantee",
      description: "Free re-conversion if you're not satisfied with the results"
    }
  ]

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
            
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
            <FileText className="w-4 h-4" />
            Professional Conversion Service
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Convert Your Inventory to
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> InvyEasy Format</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Upload your current inventory files (Excel, CSV, etc.) and our experts will convert them to the InvyEasy template format for seamless import.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span>$200 One-time Service</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>24-48 Hour Delivery</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>100% Secure</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Our Conversion Service?</h2>
              
              <div className="space-y-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">What You'll Receive</h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>InvyEasy-formatted Excel template</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>All your inventory items properly categorized</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Par levels and thresholds optimized</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Ready-to-import file with instructions</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Upload Form */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Inventory Files</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Inventory Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="mb-2">
                    <label className="cursor-pointer">
                      <span className="text-orange-600 hover:text-orange-700 font-medium">Click to upload</span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <input
                        type="file"
                        multiple
                        accept={acceptedFileTypes.join(',')}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Excel (.xlsx, .xls), CSV, TXT files up to 10MB each
                  </p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{file.name}</span>
                        <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Business
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={customerInfo.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Your Business Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  value={customerInfo.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  placeholder="Any specific requirements or notes about your inventory..."
                />
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Conversion Service</span>
                  <span className="text-2xl font-bold text-gray-900">$200</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  One-time professional conversion of your inventory files to InvyEasy template format
                </p>
                <div className="flex items-center gap-2 text-sm text-orange-700 mb-3">
                  <CheckCircle className="w-4 h-4" />
                  <span>Secure payment via Stripe • 24-48 hour delivery</span>
                </div>
              </div>

              {/* Service Terms */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Service Terms & Deliverable
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Deliverable:</strong> Your inventory data converted to InvyEasy Excel template format, ready for direct import into the system.</p>
                  <p><strong>Payment Policy:</strong> All payments are final and non-refundable upon service completion.</p>
                  <p><strong>Service Scope:</strong> Data formatting and categorization only. Does not include InvyEasy software subscription or ongoing support.</p>
                  <p><strong>Delivery:</strong> Converted file delivered via email within 24-48 hours of payment confirmation.</p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment ($200)
                    <DollarSign className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By proceeding to payment, you acknowledge that this service is non-refundable and the deliverable is your inventory data in InvyEasy template format only. Files are securely processed and deleted after delivery.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}