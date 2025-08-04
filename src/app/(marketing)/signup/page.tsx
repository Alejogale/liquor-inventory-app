'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Package, 
  CheckCircle,
  User,
  Building
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
  const supabase = createClientComponentClient() createClientComponentClient()

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

      console.log('✅ User created:', authData.user.email)
      console.log('🔍 User confirmation status:', authData.user.email_confirmed_at ? 'Confirmed' : 'Not confirmed')

      // 2. If user is not immediately confirmed, sign them in 
      if (!authData.user.email_confirmed_at) {
        console.log('🔑 Email not confirmed, attempting sign in...')
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (signInError) {
          console.error('❌ Sign in error:', signInError)
          throw new Error('Account created but unable to sign in. Please check your email confirmation settings.')
        }
        console.log('✅ User signed in successfully')
      }

      // 3. Create organization with slug
      console.log('🏢 Creating organization...')
      const orgSlug = generateSlug(formData.organizationName)
      
      const orgInsert = {
        Name: formData.organizationName,
        slug: orgSlug,
        created_by: authData.user.id,
        subscription_status: 'trial',
        subscription_plan: selectedPlan?.plan || 'starter',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      }

      console.log('📤 Inserting organization:', orgInsert)

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([orgInsert])
        .select()
        .single()

      if (orgError) {
        console.error('❌ Organization error:', orgError)
        throw new Error(`Organization error: ${orgError.message}`)
      }

      console.log('✅ Organization created:', orgData)

      // 3. Create user profile
      console.log("🔍 Creating user profile...")
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{
          id: authData.user.id,
          full_name: formData.fullName,
          email: formData.email,
          role: "admin",
          organization_id: orgData.id,
          job_title: formData.jobTitle
        }])

      if (profileError) {
        console.error("❌ Profile error:", profileError)
        throw new Error(`Profile error: ${profileError.message}`)
      }

      console.log("✅ Profile created")

      // 4. Wait a moment for session to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500))

      // 5. If plan selected, go to Stripe checkout
      if (selectedPlan && selectedPlan.priceId) {
        console.log('💳 Processing payment for plan:', selectedPlan.plan)
        
        const response = await fetch('/api/stripe/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId: selectedPlan.priceId,
            billingPeriod: selectedPlan.billing,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Stripe API error:', errorText)
          throw new Error(`Payment setup failed. Please contact support.`)
        }

        const { url, error: stripeError } = await response.json()

        if (stripeError) {
          throw new Error(`Payment setup failed: ${stripeError}`)
        }

        if (url) {
          console.log('🔄 Redirecting to Stripe checkout...')
          window.location.href = url
          return
        }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">LiquorTrack</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-white/80 hover:text-white transition-colors">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-white/60">
                {selectedPlan ? `Sign up for ${selectedPlan.plan} plan` : 'Start your free trial today'}
              </p>
            </div>

            {/* Selected Plan Display */}
            {selectedPlan && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <span className="text-blue-300 font-medium">
                    {selectedPlan.plan.charAt(0).toUpperCase() + selectedPlan.plan.slice(1)} Plan
                  </span>
                  <span className="text-blue-400">
                    ({selectedPlan.billing})
                  </span>
                </div>
                <p className="text-blue-200 text-xs mt-1">
                  You'll be redirected to secure payment after account creation
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Organization Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white flex items-center">
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
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (selectedPlan ? 'Creating Account & Setting Up Payment...' : 'Creating Account...') 
                  : (selectedPlan ? 'Create Account & Continue to Payment' : 'Start Free Trial')
                }
              </button>
            </form>

            <p className="text-center text-white/40 text-sm mt-6">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
