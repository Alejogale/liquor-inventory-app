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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20">
      {/* Glassmorphic Bubble Navigation - Mofin Style */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full backdrop-blur-xl border border-white/20 shadow-2xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
           }}>
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                   boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                 }}>
              <span className="text-white font-bold text-xs">H</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Hospitality Hub</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Home</Link>
            <Link href="/#apps" className="text-gray-700 hover:text-orange-600 transition-colors font-medium text-sm">Apps</Link>
          </div>
          
          {/* CTA Button */}
          <Link href="/signup" 
                className="px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm text-white"
                style={{
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                  boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
                }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Background Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-orange-200/20 to-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-orange-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>

      <div className="flex items-center justify-center px-6 py-20 relative z-10">
        <div className="w-full max-w-md">
          {/* Back to Landing */}
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-8 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                 style={{
                   background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                   boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                 }}>
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Sign In to Hospitality Hub</h1>
            <p className="text-gray-600 text-base">Access your complete hospitality management platform</p>
          </div>

          {/* Login Form Card - Glassmorphic */}
          <div className="rounded-2xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
               }}>
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

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-sm backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="bg-white border border-gray-200 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-gray-600 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-orange-600 hover:text-orange-700 text-sm transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 group text-sm"
                style={{
                  background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #ff7700 0%, #ff4500 50%, #e65100 100%)',
                  boxShadow: isLoading ? 'none' : '0 8px 24px rgba(255, 119, 0, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 119, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 119, 0, 0.3)';
                  }
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Don&apos;t have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              href="/signup"
              className="w-full py-3 rounded-xl transition-all duration-300 font-medium text-center block text-sm backdrop-blur-sm border border-white/30"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,247,237,0.5) 100%)',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.7) 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,247,237,0.5) 100%)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              Create Account
            </Link>
          </div>

          {/* Additional Links */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-gray-600 text-sm">
              Need help?{' '}
              <Link href="/contact" className="text-orange-600 hover:text-orange-700 transition-colors font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
