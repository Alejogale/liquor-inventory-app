'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        router.push('/login')
        return
      }

      try {
        // Check user profile for admin role
        if (userProfile?.role === 'admin') {
          setIsAdmin(true)
          setLoading(false)
          return
        }

        // Fallback: Check if user is organization owner (created_by)
        if (userProfile?.organization_id) {
          const { data: organization } = await supabase
            .from('organizations')
            .select('created_by')
            .eq('id', userProfile.organization_id)
            .single()

          if (organization?.created_by === user.id) {
            setIsAdmin(true)
            setLoading(false)
            return
          }
        }

        // If not admin, redirect to dashboard
        router.push('/dashboard')
      } catch (error) {
        console.error('Error checking admin access:', error)
        router.push('/dashboard')
      }
    }

    checkAdminAccess()
  }, [user, userProfile, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Checking admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
