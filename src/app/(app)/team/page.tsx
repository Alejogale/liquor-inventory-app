'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import TeamPINManagement from '@/components/TeamPINManagement'

export default function TeamPage() {
  const router = useRouter()
  const { user, userProfile, organization, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Role-based access
  const isOwner = userProfile?.role === 'owner'
  const isManager = userProfile?.role === 'manager'
  const canManageTeam = isOwner || isManager

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user || !canManageTeam) {
    router.push('/apps')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link
            href="/apps"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Apps</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {userProfile?.organization_id && (
            <TeamPINManagement
              organizationId={userProfile.organization_id}
              currentUserId={user?.id}
            />
          )}
        </div>
      </div>
    </div>
  )
}
