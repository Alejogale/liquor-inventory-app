'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    // For now, we'll check if the email is the admin email
    // In production, you'd check against a proper admin role in the database
    if (!user) {
      router.push('/login')
      return
    }

    const adminEmails = ['alejogaleis@gmail.com'] // Add your admin emails here
    const userIsAdmin = adminEmails.includes(user.email || '')
    
    if (!userIsAdmin) {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    setLoading(false)
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
