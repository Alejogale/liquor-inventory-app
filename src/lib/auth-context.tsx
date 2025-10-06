'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { config } from './config'
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
  ready: boolean  // NEW: Indicates when auth and org are fully loaded
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
  ready: false,
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
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      console.log('🔄 Initializing auth context...')
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('✅ Session found for user:', session.user.email)
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        console.log('❌ No session found')
        setUser(null)
        setUserProfile(null)
        setOrganization(null)
      }
      setLoading(false)
      setReady(true)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setUserProfile(null)
        setOrganization(null)
      }
      setLoading(false)
      setReady(true)
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

      // Don't try to fetch profile if no authenticated user
      if (!authUser) {
        console.log('ℹ️ No authenticated user found')
        return
      }

      // Make sure the userId matches the authenticated user
      if (authUser.id !== userId) {
        console.log('⚠️ User ID mismatch, skipping profile fetch')
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        // If it's just "no rows returned" that's normal for new/missing users
        if (profileError.code === 'PGRST116') {
          console.log('ℹ️ No user profile found for user:', userId)
        } else {
          // For other errors, log but don't crash the app
          console.log('Profile query error:', profileError.message)
          console.log('Error code:', profileError.code)
          
          // For permission errors or other issues, just return without creating profile
          if (profileError.code === 'PGRST301' || profileError.message?.includes('permission')) {
            console.log('❌ Permission denied or access issue - user may need to log in')
            return
          }
          
          // For other unexpected errors, don't try to create profile
          console.log('⚠️ Unexpected error fetching profile - skipping profile creation')
          return
        }
        console.log('ℹ️ No user profile found, creating one...')
        
        // Double-check that profile doesn't exist before creating
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', userId)
          .single()
        
        if (existingProfile) {
          console.log('⚠️ Profile actually exists, refetching...')
          const { data: refetchedProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()
          
          if (refetchedProfile) {
            setUserProfile(refetchedProfile)
            
            if (refetchedProfile.organization_id) {
              const { data: org } = await supabase
                .from('organizations')
                .select('*')
                .eq('id', refetchedProfile.organization_id)
                .single()
              
              if (org) {
                setOrganization(org)
              }
            }
            return
          }
        }
        
        // Create user profile with actual user data
        const userEmail = authUser?.email || 'user@example.com'
        const firstName = authUser?.user_metadata?.first_name || ''
        const lastName = authUser?.user_metadata?.last_name || ''
        const userName = firstName && lastName ? `${firstName} ${lastName}` : (authUser?.user_metadata?.full_name || authUser?.email || 'Dashboard User')
        const signupCompleted = authUser?.user_metadata?.signup_completed || false
        
        try {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              full_name: userName,
              email: userEmail,
              role: signupCompleted ? 'owner' : 'staff', // Users from signup get 'owner', others get 'staff'
              // 🚀 Set platform admin status (configured via environment variable)
              is_platform_admin: config.isPlatformAdmin(userEmail)
            })
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating user profile:', createError)
            console.error('❌ Error details:', {
              message: createError.message,
              code: createError.code,
              details: createError.details,
              hint: createError.hint
            })
            return
          }

          console.log('✅ User profile created:', newProfile)
          setUserProfile(newProfile)

          // Only create organization for users not from signup (they already have one)
          if (!signupCompleted) {
            console.log('ℹ️ User not from signup, checking for existing organization...')
            
            // Check if organization exists for non-signup users
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('*')
              .limit(1)
              .single()

            if (orgError || !orgData) {
              console.log('ℹ️ No organization found, creating default one...')
              
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

                console.log('✅ Default organization created:', newOrg)
                setOrganization(newOrg)

                // Link user profile to organization
                const { error: linkError } = await supabase
                  .from('user_profiles')
                  .update({ organization_id: newOrg.id })
                  .eq('id', userId)

                if (linkError) {
                  console.error('❌ Error linking user to organization:', linkError)
                } else {
                  console.log('✅ User linked to default organization')
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
                console.log('✅ User linked to existing organization')
              }
            }
          } else {
            console.log('ℹ️ User from signup flow, organization should already exist')
          }
        } catch (profileErr) {
          console.error('❌ Exception creating user profile:', profileErr)
        }
        return
      }

      console.log('✅ User profile found:', profile)
      setUserProfile(profile)

      if (profile.organization_id) {
        console.log('🔍 Looking for organization with ID:', profile.organization_id)
        // Use the organization_id directly since it's now a UUID
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single()

        if (orgError) {
          console.log('❌ Error fetching organization:', orgError)
        } else if (org) {
          console.log('✅ Organization found:', org)
          setOrganization(org)
        } else {
          console.log('❌ Organization not found for ID:', profile.organization_id)
        }
      } else {
        console.log('❌ No organization_id in profile - checking if admin user...')
        
        // Special handling for admin user - ensure they have an organization
        if (config.isPlatformAdmin(profile.email) || profile.is_platform_admin) {
          console.log('🔧 Admin user detected, ensuring organization access...')
          
          // Try to find the default organization
          const { data: defaultOrg, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0')
            .single()
          
          if (defaultOrg) {
            console.log('✅ Found default organization for admin:', defaultOrg)
            setOrganization(defaultOrg)
            
            // Link admin user to organization
            const { error: linkError } = await supabase
              .from('user_profiles')
              .update({ organization_id: defaultOrg.id })
              .eq('id', userId)
            
            if (linkError) {
              console.error('❌ Error linking admin to organization:', linkError)
            } else {
              console.log('✅ Admin linked to default organization')
            }
          } else {
            console.log('❌ Default organization not found for admin')
          }
        }
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error)
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
    setOrganization(null)
    console.log('✅ Sign out complete')
    router.push('/login')
  }

  // 🚀 NEW: Helper functions for hybrid admin system
  const isPlatformAdmin = () => {
    // Check multiple sources to ensure admin access works
    const isAdmin = userProfile?.is_platform_admin === true ||
                   config.isPlatformAdmin(userProfile?.email) ||
                   config.isPlatformAdmin(user?.email)
    
    if (isAdmin) {
      console.log('✅ Platform admin detected:', {
        userProfileEmail: userProfile?.email,
        userEmail: user?.email,
        isPlatformAdminFlag: userProfile?.is_platform_admin
      })
    }
    
    return isAdmin
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
        ready,
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
