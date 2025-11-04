'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  Users, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  role: string
  app_access: string[]
  custom_message?: string
  expires_at: string
  status: string
  organization_id: string
  organization: {
    Name: string
    id: string
  }
  invited_by: {
    full_name: string
    email: string
  } | null
}

export default function InvitePage() {
  const { token } = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      fetchInvitation()
    }
  }, [token])

  const fetchInvitation = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_invitations')
        .select(`
          id,
          email,
          role,
          app_access,
          custom_message,
          expires_at,
          status,
          organization_id
        `)
        .eq('invitation_token', token)
        .single()

      if (error) {
        throw new Error('Invitation not found')
      }

      if (data.status !== 'pending') {
        throw new Error('This invitation has already been used or cancelled')
      }

      if (new Date(data.expires_at) < new Date()) {
        throw new Error('This invitation has expired')
      }

      // Fetch organization separately
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, Name')
        .eq('id', data.organization_id)
        .single()

      // Fetch inviter info separately (optional)
      let inviterData = null
      if (data.invited_by) {
        const { data: inviter } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', data.invited_by)
          .single()
        inviterData = inviter
      }

      setInvitation({
        ...data,
        organization: orgData || { id: data.organization_id, Name: 'Unknown Organization' },
        invited_by: inviterData || { full_name: 'Team Admin', email: '' }
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const acceptInvitation = async () => {
    if (!user || !invitation) return

    try {
      setAccepting(true)
      setError(null)

      // Call the accept invitation function
      const { data, error } = await supabase.rpc('accept_invitation', {
        invitation_token_param: token,
        user_id_param: user.id
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('Failed to accept invitation')
      }

      setSuccess(true)
      
      // Redirect to apps page after a short delay
      setTimeout(() => {
        router.push('/apps')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      owner: 'Owner',
      manager: 'Manager', 
      staff: 'Staff Member',
      viewer: 'Viewer'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl p-8 text-center border border-white/20 backdrop-blur-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1)'
             }}>
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl p-8 text-center border border-white/20 backdrop-blur-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1)'
             }}>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h1>
          <p className="text-gray-600 mb-6">
            You've successfully joined {invitation?.organization.Name}. Redirecting you to the dashboard...
          </p>
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl p-8 text-center border border-white/20 backdrop-blur-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1)'
             }}>
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-600 mb-6">
            You need to sign in to accept this invitation to join {invitation?.organization.Name}.
          </p>
          <Link 
            href={`/login?redirect=/invite/${token}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
            }}
          >
            Sign In
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1)'
           }}>
        
        <div className="text-center mb-8">
          <Building2 className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Invitation</h1>
          <p className="text-gray-600">You've been invited to join a team</p>
        </div>

        {invitation && (
          <div className="space-y-6">
            {/* Organization Info */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Organization Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium text-gray-900">{invitation.organization.Name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Your Role:</span>
                  <span className="font-medium text-gray-900">{getRoleDisplayName(invitation.role)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Invited by:</span>
                  <span className="font-medium text-gray-900">
                    {invitation.invited_by?.full_name || invitation.invited_by?.email || 'Team Admin'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* App Access */}
            {invitation.app_access && invitation.app_access.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  App Access
                </h3>
                <div className="flex flex-wrap gap-2">
                  {invitation.app_access.map((app) => (
                    <span key={app} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Message */}
            {invitation.custom_message && (
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Message</h3>
                <p className="text-gray-700 italic">"{invitation.custom_message}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={acceptInvitation}
                disabled={accepting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 disabled:opacity-50"
                style={{
                  background: accepting ? '#9ca3af' : 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                  boxShadow: accepting ? 'none' : '0 4px 12px rgba(255, 119, 0, 0.3)'
                }}
              >
                {accepting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </button>
              
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                Decline
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}