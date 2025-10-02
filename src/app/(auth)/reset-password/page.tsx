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
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handlePasswordReset = async () => {
      // Get the full URL for debugging
      const fullUrl = window.location.href
      const hash = window.location.hash
      const search = window.location.search
      
      console.log('🔍 Full URL:', fullUrl)
      console.log('🔍 Hash:', hash)
      console.log('🔍 Search:', search)
      
      // Check if this is a direct access without tokens (user might have bookmarked)
      if (!hash && !search) {
        setError('Please click the reset link from your email.')
        return
      }
      
      // First check URL hash parameters (Supabase redirects with these)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')
      const errorParam = hashParams.get('error')
      const errorDescription = hashParams.get('error_description')
      
      // Also check search parameters (alternative method)
      const urlParams = new URLSearchParams(window.location.search)
      const urlAccessToken = urlParams.get('access_token')
      const urlRefreshToken = urlParams.get('refresh_token')
      const urlType = urlParams.get('type')
      const urlError = urlParams.get('error')
      
      // Use whichever set of parameters is available
      const finalAccessToken = accessToken || urlAccessToken
      const finalRefreshToken = refreshToken || urlRefreshToken
      const finalType = type || urlType
      const finalError = errorParam || urlError
      
      console.log('🔍 Reset password debug info:', {
        hashParams: {
          access_token: accessToken ? 'present' : 'missing',
          refresh_token: refreshToken ? 'present' : 'missing',
          type: type,
          error: errorParam,
          error_description: errorDescription
        },
        urlParams: {
          access_token: urlAccessToken ? 'present' : 'missing',
          refresh_token: urlRefreshToken ? 'present' : 'missing',
          type: urlType,
          error: urlError
        },
        final: {
          hasAccessToken: !!finalAccessToken,
          hasRefreshToken: !!finalRefreshToken,
          type: finalType,
          error: finalError
        }
      })
      
      // Check for errors first
      if (finalError) {
        console.error('❌ Supabase auth error:', finalError, errorDescription)
        setError(`Authentication error: ${finalError}. ${errorDescription || 'Please request a new password reset.'}`)
        return
      }
      
      if (!finalAccessToken || !finalRefreshToken) {
        console.error('❌ Missing tokens:', { accessToken: !!finalAccessToken, refreshToken: !!finalRefreshToken })
        setError('Invalid or expired reset link. Please request a new password reset.')
        return
      }
      
      if (finalType !== 'recovery') {
        console.error('❌ Invalid type:', finalType, 'expected: recovery')
        setError('Invalid reset link type. Please request a new password reset.')
        return
      }

      try {
        console.log('🔄 Setting session with tokens...')
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: finalAccessToken,
          refresh_token: finalRefreshToken
        })

        if (error) {
          console.error('❌ Session error:', error)
          setError(`Session error: ${error.message}. Please request a new password reset.`)
        } else {
          console.log('✅ Session established successfully for password reset')
          console.log('✅ User:', data.user?.email)
          // Clear the error if session was successful
          setError('')
        }
      } catch (error) {
        console.error('❌ Auth error:', error)
        setError('Invalid or expired reset link. Please try again.')
      }
    }

    // Also listen for auth state changes (alternative method)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email)
      if (event === 'PASSWORD_RECOVERY') {
        console.log('✅ Password recovery detected via auth state change')
        setError('')
      }
    })

    // Add a small delay to ensure the page has loaded completely
    const timeoutId = setTimeout(handlePasswordReset, 100)
    
    return () => {
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      // First check if we have a valid session
      const { data: { user }, error: sessionError } = await supabase.auth.getUser()
      
      if (sessionError || !user) {
        setError('Session expired. Please click the reset link in your email again.')
        setIsLoading(false)
        return
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update error:', error)
        if (error.message.includes('session')) {
          setError('Session expired. Please click the reset link in your email again.')
        } else {
          throw error
        }
        return
      }

      setSuccess(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?message=Password updated successfully! You can now sign in.')
      }, 2000)

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
            <div className="text-sm text-slate-500">Redirecting in 2 seconds...</div>
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