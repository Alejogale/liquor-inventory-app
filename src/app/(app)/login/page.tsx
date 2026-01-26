'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      setWelcomeMessage(message)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
    setWelcomeMessage('')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error
      router.push('/apps')

    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      alert('Password reset email sent! Check your inbox for the reset link.')
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
      {/* Header */}
      <header className="fixed w-full top-0 z-[1000] bg-white/80 backdrop-blur-xl border-b border-gray-200/50" style={{ padding: '12px 0' }}>
        <nav className="max-w-[1024px] mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-gray-900" style={{ fontFamily: 'system-ui' }}>
              InvyEasy
            </span>
            <span className="text-xs text-gray-400 font-medium">by AIGENZ</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-6 pt-20">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2" style={{ fontFamily: 'system-ui' }}>
                Welcome Back
              </h1>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            {/* Success Message */}
            {welcomeMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 text-sm">{welcomeMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#FF6B35] bg-gray-100 border-gray-300 rounded focus:ring-[#FF6B35]"
                  />
                  <span className="ml-2 text-gray-600 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[#FF6B35] hover:text-[#e55a2b] text-sm transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#FF6B35] text-white hover:bg-[#e55a2b] shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Google Sign In (placeholder) */}
            <button
              type="button"
              className="w-full py-3 px-4 bg-white border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#FF6B35] hover:text-[#e55a2b] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-gray-500 text-sm">
            A product by{' '}
            <a href="https://aigenz.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">
              AIGENZ
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/30">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
            <div className="animate-spin h-8 w-8 border-2 border-[#FF6B35] border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
