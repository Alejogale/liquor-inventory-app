'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'

export default function LoginPage() {
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

  // Check for welcome message from URL params
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
    setError('') // Clear error when user types
    setWelcomeMessage('') // Clear welcome message when user types
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔄 Signing in...')

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) throw error

      console.log('✅ Login successful:', data.user?.email)
      
      // Redirect to app launcher
      router.push('/apps')

    } catch (error: any) {
      console.error('💥 Login error:', error)
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

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      
      alert('Password reset email sent! Check your inbox for the reset link.')
    } catch (error: any) {
      setError(error.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Glassmorphic Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 orange-glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-orange-600)] to-[var(--accent-orange-500)] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Liquor Inventory</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/signup" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
                Don&apos;t have an account? Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          {/* Back to Landing */}
          <Link 
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-orange-600)] to-[var(--accent-orange-500)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-600 mt-2">Sign in to your Liquor Inventory account</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            {welcomeMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 text-sm">{welcomeMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="bg-white border border-slate-200 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-slate-600 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-600 hover:text-blue-700 text-sm transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full orange-cta hover:opacity-90 text-white py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-600">Don&apos;t have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              href="/signup"
              className="w-full bg-white hover:bg-slate-50 text-slate-900 py-3 rounded-xl transition-all duration-200 border border-slate-200 font-semibold text-center block"
            >
              Create Account
            </Link>
          </div>

          {/* Additional Links */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-slate-600 text-sm">
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 transition-colors">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
