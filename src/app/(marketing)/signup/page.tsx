'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Package, 
  ArrowLeft, 
  CheckCircle, 
  Building,
  User,
  CreditCard,
  Zap,
  Crown,
  Enterprise
} from 'lucide-react'

interface PlanDetails {
  name: string
  price: number
  billing: 'monthly' | 'annually'
  features: string[]
  icon: React.ReactNode
  color: string
}

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [selectedPlan, setSelectedPlan] = useState<PlanDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Form data state
  const [organizationData, setOrganizationData] = useState({
    name: '',
    address: '',
    phone: '',
    industry: 'restaurant'
  })

  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: 'Manager'
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Get plan details from URL params
  useEffect(() => {
    const planName = searchParams.get('plan')
    const billing = searchParams.get('billing') as 'monthly' | 'annually' || 'monthly'
    const price = parseInt(searchParams.get('price') || '0')

    if (planName && price) {
      const planDetails: PlanDetails = {
        name: planName.charAt(0).toUpperCase() + planName.slice(1),
        price,
        billing,
        features: getPlanFeatures(planName),
        icon: getPlanIcon(planName),
        color: getPlanColor(planName)
      }
      setSelectedPlan(planDetails)
    } else {
      // Redirect to pricing if no plan selected
      router.push('/pricing')
    }
  }, [searchParams, router])

  const getPlanFeatures = (planName: string): string[] => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return ['Up to 500 items', '2 rooms/locations', 'Basic barcode scanning', 'Email reports']
      case 'professional':
        return ['Unlimited items', 'Unlimited rooms', 'Advanced scanning', 'Real-time reports', 'Activity logging']
      case 'enterprise':
        return ['Everything in Professional', 'Multi-organization', 'Custom integrations', 'Dedicated support']
      default:
        return []
    }
  }

  const getPlanIcon = (planName: string): React.ReactNode => {
    switch (planName.toLowerCase()) {
      case 'starter': return <Zap className="h-6 w-6" />
      case 'professional': return <Crown className="h-6 w-6" />
      case 'enterprise': return <Building className="h-6 w-6" />
      default: return <Package className="h-6 w-6" />
    }
  }

  const getPlanColor = (planName: string): string => {
    switch (planName.toLowerCase()) {
      case 'starter': return 'from-blue-500 to-cyan-500'
      case 'professional': return 'from-purple-500 to-pink-500'
      case 'enterprise': return 'from-green-500 to-emerald-500'
      default: return 'from-blue-500 to-purple-500'
    }
  }

  const validateStep1 = () => {
    if (!organizationData.name.trim()) return 'Organization name is required'
    if (!organizationData.phone.trim()) return 'Phone number is required'
    return null
  }

  const validateStep2 = () => {
    if (!userData.fullName.trim()) return 'Full name is required'
    if (!userData.email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(userData.email)) return 'Please enter a valid email'
    if (!userData.password) return 'Password is required'
    if (userData.password.length < 6) return 'Password must be at least 6 characters'
    if (userData.password !== userData.confirmPassword) return 'Passwords do not match'
    return null
  }

  const nextStep = () => {
    const error = step === 1 ? validateStep1() : validateStep2()
    if (error) {
      setError(error)
      return
    }
    setStep(step + 1)
    setError('')
  }

  const prevStep = () => {
    setStep(step - 1)
    setError('')
  }

  const handleCreateAccount = async () => {
    const validation = validateStep2()
    if (validation) {
      setError(validation)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('🔄 Creating account and organization...')

      // 1. Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            organization_name: organizationData.name,
            job_title: userData.jobTitle
          }
        }
      })

      if (authError) throw authError

      if (!authData.user) throw new Error('Failed to create user')

      console.log('✅ User created:', authData.user.email)

      // 2. Create organization record
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: organizationData.name,
          address: organizationData.address,
          phone: organizationData.phone,
          industry: organizationData.industry,
          created_by: authData.user.id,
          subscription_status: 'trial',
          subscription_plan: selectedPlan?.name.toLowerCase(),
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
        }])
        .select()
        .single()

      if (orgError) throw orgError

      console.log('✅ Organization created:', orgData.name)

      // 3. Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          full_name: userData.fullName,
          email: userData.email,
          role: 'admin',
          organization_id: orgData.id,
          job_title: userData.jobTitle
        }])

      if (profileError) throw profileError

      // 4. Create default categories for the organization
      const defaultCategories = [
        'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Wine', 'Beer', 'Liqueurs'
      ]

      const { error: categoriesError } = await supabase
        .from('categories')
        .insert(
          defaultCategories.map(name => ({
            name,
            organization_id: orgData.id
          }))
        )

      if (categoriesError) throw categoriesError

      // 5. Create default supplier
      const { error: supplierError } = await supabase
        .from('suppliers')
        .insert([{
          name: 'Default Supplier',
          email: 'supplier@example.com',
          organization_id: orgData.id
        }])

      if (supplierError) throw supplierError

      // 6. Log account creation activity
      await supabase
        .from('activity_logs')
        .insert([{
          user_email: userData.email,
          action_type: 'account_created',
          organization_id: orgData.id
        }])

      console.log('✅ Account setup completed successfully')
      
      // Move to payment step
      setStep(3)

    } catch (error: any) {
      console.error('💥 Signup error:', error)
      setError(error.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteSignup = () => {
    // For now, skip payment and go directly to dashboard
    // TODO: Integrate Stripe payment processing
    router.push('/dashboard')
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back to Pricing */}
        <Link 
          href="/pricing"
          className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-white/60 mt-2">Start your 14-day free trial today</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
              {step > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <div className={`w-12 h-0.5 transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-white/20'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
              {step > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
            </div>
            <div className={`w-12 h-0.5 transition-colors ${step >= 3 ? 'bg-blue-600' : 'bg-white/20'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              step >= 3 ? 'bg-green-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
              {step >= 3 ? <CheckCircle className="h-5 w-5" /> : '3'}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Selected Plan Header */}
          <div className={`bg-gradient-to-r ${selectedPlan.color} p-6`}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {selectedPlan.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPlan.name} Plan</h3>
                  <p className="text-white/90">
                    ${selectedPlan.price}/{selectedPlan.billing === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">14-Day Free Trial</div>
                <div className="text-white/90 text-sm">No credit card required</div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Step 1: Organization Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Building className="h-6 w-6 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Organization Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={organizationData.name}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Restaurant/Bar Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Industry
                    </label>
                    <select
                      value={organizationData.industry}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="restaurant" className="bg-gray-800">Restaurant</option>
                      <option value="bar" className="bg-gray-800">Bar/Pub</option>
                      <option value="retail" className="bg-gray-800">Retail Store</option>
                      <option value="hotel" className="bg-gray-800">Hotel</option>
                      <option value="other" className="bg-gray-800">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={organizationData.phone}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={organizationData.address}
                      onChange={(e) => setOrganizationData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                </div>

                <button
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  Continue to Account Setup
                </button>
              </div>
            )}

            {/* Step 2: User Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-6 w-6 text-blue-400" />
                    <h2 className="text-xl font-semibold text-white">Account Details</h2>
                  </div>
                  <button
                    onClick={prevStep}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    ← Back
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userData.fullName}
                      onChange={(e) => setUserData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Job Title
                    </label>
                    <select
                      value={userData.jobTitle}
                      onChange={(e) => setUserData(prev => ({ ...prev, jobTitle: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Owner" className="bg-gray-800">Owner</option>
                      <option value="Manager" className="bg-gray-800">Manager</option>
                      <option value="Assistant Manager" className="bg-gray-800">Assistant Manager</option>
                      <option value="Staff" className="bg-gray-800">Staff</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@restaurant.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userData.password}
                        onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Create password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={userData.confirmPassword}
                        onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateAccount}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account & Start Trial'
                  )}
                </button>
              </div>
            )}

            {/* Step 3: Success & Payment Setup */}
            {step === 3 && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Account Created Successfully!</h2>
                  <p className="text-white/70">
                    Welcome to LiquorTrack! Your 14-day free trial has started.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-2">What's Next?</h3>
                  <ul className="text-blue-300 text-sm space-y-2 text-left">
                    <li>✓ Organization "{organizationData.name}" created</li>
                    <li>✓ Default categories and suppliers added</li>
                    <li>✓ Admin account set up for {userData.fullName}</li>
                    <li>✓ 14-day trial activated (no payment required)</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleCompleteSignup}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                  >
                    Enter Dashboard
                  </button>
                  
                  <p className="text-white/60 text-sm">
                    Payment will be collected after your 14-day trial ends
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Need help?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
