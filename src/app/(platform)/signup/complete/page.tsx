'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'

interface SignupData {
  firstName: string
  lastName: string
  email: string
  password: string
  organization: string
  useCase: string
  selectedTier: string
  billingCycle: string
}

function CompleteSignupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'loading' | 'creating' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      setErrorMessage('No session ID found. Please try signing up again.')
      return
    }

    createAccount()
  }, [sessionId])

  const createAccount = async () => {
    try {
      setStatus('creating')

      // Get signup data from sessionStorage
      let signupData: SignupData | null = null
      const signupDataStr = sessionStorage.getItem('signupData')

      if (signupDataStr) {
        try {
          signupData = JSON.parse(signupDataStr)
        } catch (e) {
          console.error('Error parsing sessionStorage data:', e)
        }
      }

      // If no data in sessionStorage, try to recover from Stripe session metadata
      if (!signupData) {
        console.log('SessionStorage empty, attempting to recover from Stripe...')
        try {
          const response = await fetch(`/api/stripe/get-session?session_id=${sessionId}`)
          if (response.ok) {
            const sessionData = await response.json()
            if (sessionData.metadata) {
              signupData = {
                firstName: sessionData.metadata.first_name || '',
                lastName: sessionData.metadata.last_name || '',
                email: sessionData.metadata.email || sessionData.customer_email || '',
                password: '', // Password not stored in Stripe - user will need to reset
                organization: sessionData.metadata.company || '',
                useCase: sessionData.metadata.business_type || 'bar',
                selectedTier: sessionData.metadata.plan || 'professional',
                billingCycle: sessionData.metadata.billing_cycle || 'monthly',
              }

              // If we recovered data but no password, we need to handle this
              if (!signupData.password) {
                setStatus('error')
                setErrorMessage('Your session expired. Please contact support with your email address and we will help you complete your account setup.')
                return
              }
            }
          }
        } catch (e) {
          console.error('Error recovering from Stripe:', e)
        }
      }

      if (!signupData) {
        setStatus('error')
        setErrorMessage('Signup data not found. Please try signing up again.')
        return
      }

      // Check if account was already created (idempotency check)
      // This handles page refresh scenarios
      const checkResponse = await fetch(`/api/stripe/get-session?session_id=${sessionId}`)
      if (checkResponse.ok) {
        const sessionData = await checkResponse.json()
        // If we have the email, check if account already exists
        const emailToCheck = signupData.email || sessionData.customer_email
        if (emailToCheck) {
          const existsResponse = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailToCheck }),
          })
          if (existsResponse.ok) {
            const existsData = await existsResponse.json()
            if (existsData.exists) {
              // Account already created - just redirect to login
              console.log('Account already exists, redirecting to login')
              sessionStorage.removeItem('signupData')
              setStatus('success')
              setTimeout(() => {
                router.push('/login?message=Account created! Please sign in.')
              }, 2000)
              return
            }
          }
        }
      }

      // Create the account
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          password: signupData.password,
          company: signupData.organization,
          businessType: signupData.useCase,
          primaryApp: 'liquor-inventory',
          plan: signupData.selectedTier,
          billingCycle: signupData.billingCycle,
          stripeSessionId: sessionId, // Pass session ID for linking
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account')
      }

      // Clear signup data from sessionStorage
      sessionStorage.removeItem('signupData')

      setStatus('success')

      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login?message=Account created! Please sign in.')
      }, 3000)

    } catch (error: any) {
      console.error('Account creation error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Failed to create account')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      <div className="max-w-md w-full">
        {status === 'loading' || status === 'creating' ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {status === 'loading' ? 'Processing...' : 'Creating Your Account...'}
            </h3>
            <p className="text-gray-600">
              Please wait while we set everything up for you.
            </p>
          </div>
        ) : status === 'success' ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to InvyEasy!</h3>
            <p className="text-gray-600 mb-2">Your account has been created successfully.</p>
            <p className="text-sm text-gray-500 mb-6">
              Your 30-day free trial has started. You won't be charged until the trial ends.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e55a2b] transition-all"
            >
              Sign In to Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-gray-400 mt-4">Redirecting automatically...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Something Went Wrong</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-y-3">
              <Link
                href="/signup"
                className="block w-full bg-[#FF6B35] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#e55a2b] transition-all text-center"
              >
                Try Again
              </Link>
              <Link
                href="/contact"
                className="block w-full text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    }>
      <CompleteSignupContent />
    </Suspense>
  )
}
