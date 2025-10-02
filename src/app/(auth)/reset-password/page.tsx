'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Eye, EyeOff, Lock, CheckCircle, Package } from 'lucide-react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Updated with Supabase redirect URL fix

  useEffect(() => {
    console.log('🔍 Password reset page loaded, checking URL for tokens...')
    
    // Test Supabase connectivity
    const testSupabaseConnection = async () => {
      try {
        console.log('🔍 Testing Supabase connectivity...')
        const { data, error } = await supabase.auth.getSession()
        console.log('✅ Supabase connection test result:', { 
          success: !error, 
          error: error?.message,
          hasSession: !!data.session 
        })
      } catch (err) {
        console.error('❌ Supabase connection test failed:', err)
      }
    }
    
    testSupabaseConnection()
    
    // Check if this is a direct access without tokens
    if (!window.location.hash && !window.location.search) {
      setError('Please click the reset link from your email.')
      return
    }

    // Let Supabase handle the auth state automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      
      if (event === 'PASSWORD_RECOVERY' && session) {
        console.log('✅ Password recovery session established via auth state change')
        setError('')
        setSessionReady(true)
      }
      
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in via auth state change:', session.user?.email)
        setError('')
        setSessionReady(true)
      }
      
      if (event === 'TOKEN_REFRESHED' && session) {
        console.log('✅ Token refreshed via auth state change')
        setError('')
        setSessionReady(true)
      }
    })
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔥 Form submitted!')
    console.log('🔥 Password length:', password.length)
    console.log('🔥 Passwords match:', password === confirmPassword)
    
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match')
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      console.log('❌ Password too short')
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    console.log('✅ Validation passed, proceeding with update')

    try {
      // Use the session that's already established by Supabase auth state changes
      console.log('🔄 Using established session to update password...')
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })
      
      console.log('🔍 Update password response received:', { data: !!data, error: !!error, errorMessage: error?.message })

      if (error) {
        console.error('❌ Password update error:', error)
        if (error.message.includes('session')) {
          setError('Session expired. Please click the reset link in your email again.')
        } else {
          setError(error.message || 'Failed to update password')
        }
        return
      }
      
      console.log('✅ Password update response:', data)

      console.log('✅ Password updated successfully!')
      setSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        console.log('🔄 Redirecting to login...')
        window.location.href = '/login?message=Password updated successfully! You can now sign in.'
      }, 3000)

    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Password Updated!</h1>
            <p className="text-slate-600 mb-4">
              Your password has been successfully updated. You will be redirected to login shortly.
            </p>
            <div className="text-sm text-slate-500">Redirecting in 3 seconds...</div>
            <button 
              onClick={() => window.location.href = '/login?message=Password updated successfully! You can now sign in.'}
              className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-slate-600 mt-2">Choose a secure password for your account</p>
        </div>

        {/* Reset Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 focus:ring-4 focus:ring-orange-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => router.push('/login')}
              className="text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Loading...</h1>
            <p className="text-slate-600 mt-2">Please wait while we prepare the reset password form</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}