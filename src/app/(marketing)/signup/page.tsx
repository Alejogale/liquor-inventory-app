'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  CheckCircle,
  User,
  Building,
  ArrowRight
} from 'lucide-react'

interface PlanDetails {
  plan: string
  billing: string
  priceId: string
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    organizationName: '',
    jobTitle: ''
  })

  // Get plan details from URL
  useEffect(() => {
    const plan = searchParams.get('plan')
    const billing = searchParams.get('billing')
    const priceId = searchParams.get('priceId')
    
    if (plan && billing && priceId) {
      setSelectedPlan({ plan, billing, priceId })
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Generate a URL-friendly slug from organization name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim() // Remove leading/trailing spaces
      .substring(0, 50) // Limit length
      + '-' + Math.random().toString(36).substring(2, 8) // Add random suffix for uniqueness
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔄 Starting signup process...')

      // 1. Create user account (with email confirmation disabled, user should be immediately confirmed)
      console.log('📝 Creating user account...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            organization_name: formData.organizationName,
            job_title: formData.jobTitle
          }
        }
      })

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw new Error(`Auth error: ${authError.message}`)
      }
      
      if (!authData.user) {
        throw new Error('Failed to create user - no user data returned')
      }

      console.log('✅ User account created:', authData.user.id)

      // 2. Create user profile directly (skip the check since it's a new user)
      console.log('📝 Creating user profile...')
      console.log('📝 Profile data:', {
        id: authData.user.id,
        full_name: formData.fullName,
        email: formData.email,
        role: 'owner',
        job_title: formData.jobTitle || null
      })
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
            role: 'owner',
            job_title: formData.jobTitle || null
          })
          .select()
          .single()

        if (profileError) {
          console.error('❌ Profile error:', profileError)
          console.error('❌ Profile error details:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          })
          throw new Error(`Profile error: ${profileError.message}`)
        }

        console.log('✅ User profile created successfully:', profileData)
      } catch (error) {
        console.error('❌ Profile creation failed:', error)
        throw error
      }

      // 3. Create organization
      console.log('📝 Creating organization...')
      console.log('📝 Organization data:', {
        Name: formData.organizationName,
        slug: generateSlug(formData.organizationName),
        subscription_status: 'trial',
        subscription_plan: 'free',
        created_by: authData.user.id
      })
      
      const organizationSlug = generateSlug(formData.organizationName)
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          Name: formData.organizationName,
          slug: organizationSlug,
          subscription_status: 'trial',
          subscription_plan: 'free',
          created_by: authData.user.id
        })
        .select()
        .single()

      if (orgError) {
        console.error('❌ Organization error:', orgError)
        console.error('❌ Organization error details:', {
          message: orgError.message,
          details: orgError.details,
          hint: orgError.hint,
          code: orgError.code
        })
        throw new Error(`Organization error: ${orgError.message}`)
      }

      console.log('✅ Organization created:', orgData)
      console.log('✅ Organization ID:', orgData.id)
      console.log('✅ Organization UUID ID:', orgData.uuid_id)

      // 4. Update user profile with organization_id (use UUID)
      console.log('📝 Updating user profile with organization...')
      console.log('📝 Update data:', {
        organization_id: orgData.uuid_id || orgData.id,
        user_id: authData.user.id
      })
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ organization_id: orgData.uuid_id || orgData.id })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('❌ Update error:', updateError)
        console.error('❌ Update error details:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        })
        throw new Error(`Update error: ${updateError.message}`)
      }

      console.log('✅ User profile updated with organization')

      // 5. Handle paid plan - redirect to Stripe
      if (selectedPlan) {
        console.log('💰 Redirecting to Stripe for payment...')
        const url = `/api/stripe/create-subscription?priceId=${selectedPlan.priceId}&organizationId=${orgData.id}`
        window.location.href = url
        return
      }

      // 6. Free trial - go directly to dashboard
      console.log('✅ Signup completed - redirecting to dashboard')
      router.push('/dashboard?welcome=true')

    } catch (error: any) {
      console.error('❌ Full signup error:', error)
      setError(error?.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Glassmorphic Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Liquor Inventory</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-slate-700 hover:text-slate-900 transition-colors font-medium">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h1>
              <p className="text-slate-600">
                {selectedPlan ? `Sign up for ${selectedPlan.plan} plan` : 'Start free 30-day trial'}
              </p>
            </div>

            {/* Selected Plan Display */}
            {selectedPlan && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-900 font-medium">
                    {selectedPlan.plan.charAt(0).toUpperCase() + selectedPlan.plan.slice(1)} Plan
                  </span>
                  <span className="text-blue-700">
                    ({selectedPlan.billing})
                  </span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  You&apos;ll be redirected to secure payment after account creation
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="Job Title (optional)"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Organization Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Organization Information
                </h3>
                
                <div>
                  <input
                    type="text"
                    name="organizationName"
                    placeholder="Organization Name"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading 
                  ? (selectedPlan ? 'Creating Account & Setting Up Payment...' : 'Creating Account...') 
                  : (selectedPlan ? 'Create Account & Continue to Payment' : 'Start Free 30-Day Trial')
                }
                {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
