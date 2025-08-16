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
    <div className="min-h-screen bg-white">
      {/* Clean Modern Navigation */}
      <nav className="nav-modern">
        <div className="container-max">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-headline text-primary">Hospitality Hub</span>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-muted hover:text-primary transition-colors font-medium">Home</Link>
              <Link href="/#apps" className="text-muted hover:text-primary transition-colors font-medium">Apps</Link>
            </div>
            
            {/* CTA Button */}
            <Link href="/signup" className="button-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Back to Landing */}
          <Link 
            href="/"
            className="inline-flex items-center text-muted hover:text-accent mb-8 transition-colors text-caption font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-headline text-primary mb-2">Sign In to Hospitality Hub</h1>
            <p className="text-body text-muted">Access your complete hospitality management platform</p>
          </div>

          {/* Login Form Card */}
          <div className="card-elevated">
            {welcomeMessage && (
              <div className="card bg-accent/10 border-accent/20 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <p className="text-accent text-caption">{welcomeMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="card bg-red-50 border-red-200 mb-6">
                <p className="text-red-700 text-caption">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-caption text-secondary mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-gray" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-modern pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-caption text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-gray" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-modern pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-gray hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="bg-white border border-stone-gray rounded text-accent focus:ring-accent/20"
                  />
                  <span className="ml-2 text-muted text-caption">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-accent hover:text-primary text-caption transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group ${
                  isLoading ? 'button-secondary' : 'button-primary'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Signing In...
                  </div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-gray" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-2 bg-white text-muted">Don&apos;t have an account?</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <Link
              href="/signup"
              className="button-secondary w-full text-center"
            >
              Create Account
            </Link>
          </div>

          {/* Additional Links */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-muted text-caption">
              Need help?{' '}
              <Link href="/contact" className="text-accent hover:text-primary transition-colors font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}