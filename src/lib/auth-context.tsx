'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  role?: string
  organization_id?: string
  job_title?: string
  // 🚀 NEW: Enhanced role system for hybrid admin model
  is_platform_admin?: boolean  // You (alejogaleis@gmail.com) - sees all data
}

interface Organization {
  id: string
  Name: string
  slug: string
  subscription_status: string
  subscription_plan: string
  created_by?: string
  owner_id?: string
  stripe_customer_id?: string
  address?: string
  phone?: string
  industry?: string
  trial_ends_at?: string
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  organization: Organization | null
  loading: boolean
  signOut: () => Promise<void>
  // 🚀 NEW: Helper functions for hybrid admin system
  isPlatformAdmin: () => boolean
  canAccessAllOrganizations: () => boolean
  getAccessibleOrganizationIds: () => string[]
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  organization: null,
  loading: true,
  signOut: async () => {},
  isPlatformAdmin: () => false,
  canAccessAllOrganizations: () => false,
  getAccessibleOrganizationIds: () => []
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setUserProfile(null)
        setOrganization(null)
      }
      setLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setUserProfile(null)
        setOrganization(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for:', userId)
      
      // Get user details from auth
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('❌ Error getting auth user:', authError)
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.log('ℹ️ No user profile found, creating one...')
        
        // Create user profile with actual user data
        const userEmail = authUser?.email || 'user@example.com'
        const userName = authUser?.user_metadata?.full_name || authUser?.email || 'Dashboard User'
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              full_name: userName,
              email: userEmail,
              role: 'owner',
              // 🚀 Set platform admin status for your email
              is_platform_admin: userEmail === 'alejogaleis@gmail.com'
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating user profile:', createError)
            return
          }

          console.log('✅ User profile created:', newProfile)
          setUserProfile(newProfile)

          // Check if organization exists
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .limit(1)
            .single()

          if (orgError || !orgData) {
            console.log('ℹ️ No organization found, creating one...')
            
            // Create organization with proper UUID slug
            const timestamp = Date.now()
            const randomSuffix = Math.random().toString(36).substr(2, 9)
            const slugSuffix = `${timestamp}-${randomSuffix}`
            const slug = `default-organization-${slugSuffix}`
            
            try {
              const { data: newOrg, error: createOrgError } = await supabase
                .from('organizations')
                .insert({
                  "Name": 'Default Organization',
                  slug: slug,
                  created_by: userId
                })
                .select()
                .single()

              if (createOrgError) {
                console.error('❌ Error creating organization:', createOrgError)
                return
              }

              console.log('✅ Organization created:', newOrg)
              setOrganization(newOrg)

              // Link user profile to organization
              const { error: linkError } = await supabase
                .from('user_profiles')
                .update({ organization_id: newOrg.id })
                .eq('id', userId)

              if (linkError) {
                console.error('❌ Error linking user to organization:', linkError)
              } else {
                console.log('✅ User linked to organization')
              }
            } catch (orgErr) {
              console.error('❌ Exception creating organization:', orgErr)
            }
          } else {
            console.log('✅ Found existing organization:', orgData)
            setOrganization(orgData)

            // Link user profile to organization
            const { error: linkError } = await supabase
              .from('user_profiles')
              .update({ organization_id: orgData.id })
              .eq('id', userId)

            if (linkError) {
              console.error('❌ Error linking user to organization:', linkError)
            } else {
              console.log('✅ User linked to organization')
            }
          }
        } catch (profileErr) {
          console.error('❌ Exception creating user profile:', profileErr)
        }
        return
      }

      console.log('✅ User profile found:', profile)
      setUserProfile(profile)

      if (profile.organization_id) {
        // Use the organization_id directly since it's now a UUID
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single()

        if (org) {
          console.log('✅ Organization found:', org)
          setOrganization(org)
        } else {
          console.log('❌ Organization not found for ID:', profile.organization_id)
        }
      } else {
        console.log('ℹ️ No organization_id in profile')
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setOrganization(null)
    router.push('/')
  }

  // 🚀 NEW: Helper functions for hybrid admin system
  const isPlatformAdmin = () => {
    return userProfile?.is_platform_admin === true || userProfile?.email === 'alejogaleis@gmail.com'
  }

  const canAccessAllOrganizations = () => {
    return isPlatformAdmin()
  }

  const getAccessibleOrganizationIds = () => {
    if (isPlatformAdmin()) {
      // Platform admin can access all organizations - return empty array to indicate "no filter"
      return []
    }
    
    // Regular organization admin can only access their own organization
    return userProfile?.organization_id ? [userProfile.organization_id] : []
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      organization, 
      loading, 
      signOut,
      isPlatformAdmin,
      canAccessAllOrganizations,
      getAccessibleOrganizationIds
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
