'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  Users, 
  Plus, 
  Settings, 
  Crown, 
  Shield, 
  Eye, 
  Edit,
  Trash2,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Search,
  UserCheck,
  UserX,
  Send,
  RefreshCw
} from 'lucide-react'

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
  status: string
  app_access: string[]
  job_title?: string
  created_at: string
  invited_by?: {
    full_name: string
    email: string
  }
}

interface Invitation {
  id: string
  email: string
  role: string
  app_access: string[]
  status: string
  expires_at: string
  created_at: string
  custom_message?: string
  user_profiles?: {
    full_name: string
    email: string
  }
}

const ROLES = [
  { id: 'owner', name: 'Owner', description: 'Full access to all features and billing', icon: Crown },
  { id: 'manager', name: 'Manager', description: 'Can manage inventory, users, and view reports', icon: Shield },
  { id: 'staff', name: 'Staff', description: 'Can view inventory and perform counts', icon: Users },
  { id: 'viewer', name: 'Viewer', description: 'Read-only access to inventory and reports', icon: Eye }
]

const APPS = [
  'liquor-inventory',
  'reservation-system', 
  'member-database',
  'pos-system'
]

export default function TeamManagement() {
  const { organization, userProfile } = useAuth()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [activeTab, setActiveTab] = useState<'members' | 'invitations'>('members')

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff',
    appAccess: ['liquor-inventory'],
    customMessage: ''
  })
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    if (organization?.id) {
      fetchTeamData()
    }
  }, [organization?.id])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      
      // Fetch team members
      const membersResponse = await fetch('/api/team/members')
      if (membersResponse.ok) {
        const { members: membersData } = await membersResponse.json()
        setMembers(membersData || [])
      }

      // Fetch invitations
      const invitationsResponse = await fetch('/api/team/invite')
      if (invitationsResponse.ok) {
        const { invitations: invitationsData } = await invitationsResponse.json()
        setInvitations(invitationsData || [])
      }

    } catch (error) {
      console.error('Error fetching team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async () => {
    try {
      setInviting(true)
      
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
          appAccess: inviteForm.appAccess,
          customMessage: inviteForm.customMessage
        })
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      // Reset form and close modal
      setInviteForm({
        email: '',
        role: 'staff',
        appAccess: ['liquor-inventory'],
        customMessage: ''
      })
      setShowInviteModal(false)
      
      // Refresh data
      await fetchTeamData()

    } catch (error) {
      console.error('Error sending invitation:', error)
      alert(error instanceof Error ? error.message : 'Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const updateMember = async (memberId: string, updates: any) => {
    try {
      const response = await fetch('/api/team/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, updates })
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      await fetchTeamData()

    } catch (error) {
      console.error('Error updating member:', error)
      alert(error instanceof Error ? error.message : 'Failed to update member')
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return

    try {
      const response = await fetch(`/api/team/members?memberId=${memberId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      await fetchTeamData()

    } catch (error) {
      console.error('Error removing member:', error)
      alert(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  const handleInvitationAction = async (invitationId: string, action: 'resend' | 'cancel' | 'delete') => {
    try {
      const response = await fetch(`/api/team/invitations/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId })
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      await fetchTeamData()

    } catch (error) {
      console.error(`Error ${action} invitation:`, error)
      alert(error instanceof Error ? error.message : `Failed to ${action} invitation`)
    }
  }

  const filteredMembers = members.filter(member =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleIcon = (role: string) => {
    const roleData = ROLES.find(r => r.id === role)
    const IconComponent = roleData?.icon || Users
    return <IconComponent className="h-4 w-4" />
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-orange-100 text-orange-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'staff': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-amber-500" />
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired': return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading team data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-600">Manage your team members and invitations</p>
        </div>
        
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
            boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
          }}
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-2xl p-1 max-w-md backdrop-blur-xl border border-white/20"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)'
           }}>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'members'
              ? 'text-white shadow-lg'
              : 'text-gray-700 hover:text-gray-900'
          }`}
          style={activeTab === 'members' ? {
            background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
            boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
          } : {}}
        >
          <Users className="h-4 w-4" />
          <span>Members ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
            activeTab === 'invitations'
              ? 'text-white shadow-lg'
              : 'text-gray-700 hover:text-gray-900'
          }`}
          style={activeTab === 'invitations' ? {
            background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
            boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
          } : {}}
        >
          <Mail className="h-4 w-4" />
          <span>Invitations ({invitations.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 w-full bg-white/50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all backdrop-blur-sm"
        />
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
           }}>
        
        {activeTab === 'members' && (
          <div className="p-6">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                <p className="text-gray-600">Invite team members to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-4 bg-white/50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                             style={{
                               background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                             }}>
                          <span className="text-white font-bold text-sm">
                            {member.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          {member.job_title && (
                            <p className="text-xs text-gray-500">{member.job_title}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                        
                        {userProfile?.role === 'owner' || userProfile?.role === 'manager' ? (
                          <div className="relative">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <MoreVertical className="h-4 w-4 text-gray-600" />
                            </button>
                            {/* TODO: Add dropdown menu for member actions */}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="p-6">
            {invitations.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                <p className="text-gray-600">All team members have joined or invitations have expired</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 bg-white/50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{invitation.email}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(invitation.role)}`}>
                            {getRoleIcon(invitation.role)}
                            {invitation.role}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            {getStatusIcon(invitation.status)}
                            {invitation.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Expires {new Date(invitation.expires_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {invitation.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleInvitationAction(invitation.id, 'resend')}
                              className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="Resend invitation"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleInvitationAction(invitation.id, 'cancel')}
                              className="p-2 hover:bg-gray-50 text-gray-600 rounded-lg transition-colors"
                              title="Cancel invitation"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleInvitationAction(invitation.id, 'delete')}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete invitation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="colleague@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {ROLES.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Access</label>
                <div className="space-y-2">
                  {APPS.map(app => (
                    <label key={app} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={inviteForm.appAccess.includes(app)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInviteForm({...inviteForm, appAccess: [...inviteForm.appAccess, app]})
                          } else {
                            setInviteForm({...inviteForm, appAccess: inviteForm.appAccess.filter(a => a !== app)})
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{app}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message (Optional)</label>
                <textarea
                  value={inviteForm.customMessage}
                  onChange={(e) => setInviteForm({...inviteForm, customMessage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={3}
                  placeholder="Welcome to our team!"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendInvitation}
                disabled={inviting || !inviteForm.email}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}