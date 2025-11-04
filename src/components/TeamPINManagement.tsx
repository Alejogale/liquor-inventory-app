'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Key, Check, X, Plus, Mail, UserPlus, Shield, Eye, EyeOff, Trash2 } from 'lucide-react'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  pin_code: string | null
  role: 'owner' | 'manager' | 'staff' | 'viewer'
  created_at: string
}

interface PendingInvitation {
  id: string
  email: string
  invitation_token: string
  expires_at: string
  created_at: string
  status: string
}

interface TeamPINManagementProps {
  organizationId: string
}

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const colors = {
    owner: 'bg-purple-100 text-purple-800 border-purple-300',
    manager: 'bg-blue-100 text-blue-800 border-blue-300',
    staff: 'bg-green-100 text-green-800 border-green-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const icons = {
    owner: '👑',
    manager: '🔑',
    staff: '👤',
    viewer: '👁️'
  }

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${colors[role as keyof typeof colors] || colors.staff}`}>
      <span>{icons[role as keyof typeof icons] || icons.staff}</span>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  )
}

export default function TeamPINManagement({ organizationId }: TeamPINManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newPIN, setNewPIN] = useState('')
  const [saving, setSaving] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [showPIN, setShowPIN] = useState<string | null>(null)
  const [showQuickAddModal, setShowQuickAddModal] = useState(false)
  const [quickAddName, setQuickAddName] = useState('')
  const [quickAddPIN, setQuickAddPIN] = useState('')
  const [quickAdding, setQuickAdding] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPIN, setEditPIN] = useState('')
  const [editRole, setEditRole] = useState<'owner' | 'manager' | 'staff' | 'viewer'>('staff')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Fetch team members and pending invitations
  useEffect(() => {
    if (organizationId) {
      fetchTeamMembers()
      fetchPendingInvitations()
    }
  }, [organizationId])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, pin_code, role, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching team members:', error)
        return
      }

      setTeamMembers(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching team members:', error)
      setLoading(false)
    }
  }

  const fetchPendingInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('id, email, invitation_token, expires_at, created_at, status')
        .eq('organization_id', organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching invitations:', error)
        return
      }

      setPendingInvitations(data || [])
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const handleSetPIN = async (userId: string) => {
    if (!newPIN || newPIN.length !== 4 || !/^\d{4}$/.test(newPIN)) {
      alert('PIN must be exactly 4 digits')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('user_profiles')
        .update({ pin_code: newPIN })
        .eq('id', userId)

      if (error) {
        console.error('Error setting PIN:', error)
        alert('Error setting PIN')
        setSaving(false)
        return
      }

      // Refresh the list
      await fetchTeamMembers()
      setEditingUserId(null)
      setNewPIN('')
      setSaving(false)
    } catch (error) {
      console.error('Error setting PIN:', error)
      alert('Error setting PIN')
      setSaving(false)
    }
  }

  const handleRemovePIN = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this PIN?')) return

    try {
      setSaving(true)

      const { error } = await supabase
        .from('user_profiles')
        .update({ pin_code: null })
        .eq('id', userId)

      if (error) {
        console.error('Error removing PIN:', error)
        alert('Error removing PIN')
        setSaving(false)
        return
      }

      // Refresh the list
      await fetchTeamMembers()
      setSaving(false)
    } catch (error) {
      console.error('Error removing PIN:', error)
      alert('Error removing PIN')
      setSaving(false)
    }
  }

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    try {
      setInviting(true)

      // Get current user info
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to send invitations')
        setInviting(false)
        return
      }

      // Generate a unique token
      const inviteToken = crypto.randomUUID()

      // Set expiration to 7 days from now
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Create invitation in database
      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          organization_id: organizationId,
          email: inviteEmail,
          invitation_token: inviteToken,
          invited_by: user.id,
          role: 'staff', // Default role
          app_access: ['inventory'], // Default access
          status: 'pending',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating invitation:', error)
        alert('Error creating invitation. The email may already have a pending invitation.')
        setInviting(false)
        return
      }

      // Create invitation link
      const inviteLink = `${window.location.origin}/invite/${inviteToken}`

      // Copy to clipboard
      await navigator.clipboard.writeText(inviteLink)
      alert(`✅ Invitation created!\n\nInvitation link copied to clipboard.\n\nSend this link to ${inviteEmail}:\n${inviteLink}\n\nThis link expires in 7 days.`)

      setShowInviteModal(false)
      setInviteEmail('')
      setInviting(false)

      // Refresh invitations list
      fetchPendingInvitations()
    } catch (error) {
      console.error('Error creating invite:', error)
      alert('Error creating invitation')
      setInviting(false)
    }
  }

  const handleCopyInviteLink = async (token: string, email: string) => {
    const inviteLink = `${window.location.origin}/invite/${token}`
    await navigator.clipboard.writeText(inviteLink)
    alert(`✅ Invitation link copied!\n\nSend this link to ${email}:\n${inviteLink}`)
  }

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) return

    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)

      if (error) {
        console.error('Error canceling invitation:', error)
        alert('Error canceling invitation')
        return
      }

      alert(`✅ Invitation for ${email} has been cancelled.`)
      fetchPendingInvitations()
    } catch (error) {
      console.error('Error canceling invitation:', error)
      alert('Error canceling invitation')
    }
  }

  const handleQuickAddMember = async () => {
    if (!quickAddName || quickAddName.trim().length === 0) {
      alert('Please enter a name')
      return
    }

    if (!quickAddPIN || quickAddPIN.length !== 4 || !/^\d{4}$/.test(quickAddPIN)) {
      alert('PIN must be exactly 4 digits')
      return
    }

    try {
      setQuickAdding(true)

      // Generate unique identifiers
      const randomId = crypto.randomUUID().slice(0, 8)
      const placeholderEmail = `mobile-${quickAddName.toLowerCase().replace(/\s+/g, '-')}-${randomId}@staff.local`

      // Generate a random password (user will never use this, only PIN)
      const randomPassword = crypto.randomUUID() + crypto.randomUUID()

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: placeholderEmail,
        password: randomPassword,
        options: {
          data: {
            full_name: quickAddName,
            is_mobile_only: true
          }
        }
      })

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError)
        alert('Error creating team member account')
        setQuickAdding(false)
        return
      }

      // Step 2: Create or update user profile with PIN
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          organization_id: organizationId,
          email: placeholderEmail,
          full_name: quickAddName,
          pin_code: quickAddPIN,
          role: 'staff',
          app_access: ['inventory'], // Mobile app access only
          status: 'active'
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        alert('Error setting up team member profile')
        setQuickAdding(false)
        return
      }

      alert(`✅ ${quickAddName} has been added with PIN ${quickAddPIN}\n\nThey can now use the mobile app with their PIN.`)

      setShowQuickAddModal(false)
      setQuickAddName('')
      setQuickAddPIN('')
      setQuickAdding(false)

      // Refresh team members list
      fetchTeamMembers()
    } catch (error) {
      console.error('Error adding team member:', error)
      alert('Error adding team member')
      setQuickAdding(false)
    }
  }

  const handleOpenEditModal = (member: TeamMember) => {
    setEditingMember(member)
    setEditName(member.full_name || '')
    setEditEmail(member.email.includes('@staff.local') ? '' : member.email)
    setEditPIN(member.pin_code || '')
    setEditRole(member.role || 'staff')
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingMember) return

    if (!editName || editName.trim().length === 0) {
      alert('Please enter a name')
      return
    }

    if (editPIN && (editPIN.length !== 4 || !/^\d{4}$/.test(editPIN))) {
      alert('PIN must be exactly 4 digits')
      return
    }

    // Validate email format if provided
    if (editEmail && editEmail.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editEmail)) {
        alert('Please enter a valid email address')
        return
      }
    }

    try {
      setEditing(true)

      const updates: any = {
        full_name: editName,
      }

      // Update PIN if changed
      if (editPIN && editPIN !== editingMember.pin_code) {
        updates.pin_code = editPIN
      }

      // Check if we're upgrading from placeholder to real email
      const isUpgradingEmail =
        editEmail &&
        editEmail.trim().length > 0 &&
        editEmail !== editingMember.email &&
        editingMember.email.includes('@staff.local')

      // Update email if provided and different
      if (editEmail && editEmail.trim().length > 0 && editEmail !== editingMember.email) {
        updates.email = editEmail
      } else if (!editEmail && editingMember.email.includes('@staff.local')) {
        // Keep placeholder email if no email provided
        updates.email = editingMember.email
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', editingMember.id)

      if (error) {
        console.error('Error updating member:', error)
        alert('Error updating member')
        setEditing(false)
        return
      }

      // Update role if changed
      if (editRole !== editingMember.role) {
        await handleRoleChange(editingMember.id, editRole)
      }

      // If upgrading to real email, update auth.users and send password setup email
      if (isUpgradingEmail) {
        try {
          const response = await fetch('/api/team/update-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: editingMember.id,
              newEmail: editEmail,
              userName: editName
            })
          })

          const result = await response.json()

          if (!response.ok) {
            console.error('Error updating auth email:', result.error)
            alert(`⚠️ Profile updated, but failed to send setup email: ${result.error}`)
          } else if (result.emailSent) {
            alert(`✅ ${editName} has been updated!\n\n📧 Password setup email sent to ${editEmail}\n\nThey can now:\n• Continue using their PIN on mobile\n• Set a password and access the web dashboard`)
          } else {
            alert(`✅ ${editName} has been updated!\n\n⚠️ Email updated but setup link failed to send.`)
          }
        } catch (emailError) {
          console.error('Error calling update-email API:', emailError)
          alert(`✅ ${editName} has been updated!\n\n⚠️ Failed to send password setup email. You may need to manually send them a password reset link.`)
        }
      } else {
        alert(`✅ ${editName} has been updated`)
      }

      setShowEditModal(false)
      setEditingMember(null)
      setEditName('')
      setEditEmail('')
      setEditPIN('')
      setEditRole('staff')
      setEditing(false)

      // Refresh team members list
      fetchTeamMembers()
    } catch (error) {
      console.error('Error updating member:', error)
      alert('Error updating member')
      setEditing(false)
    }
  }

  const handleDeleteUser = async (member: TeamMember) => {
    const confirmMessage = `⚠️ DELETE USER: ${member.full_name || member.email}\n\nThis will permanently delete:\n✗ User account\n✗ All their data\n✗ Access to the system\n\nThis action CANNOT be undone!\n\nType DELETE to confirm:`

    const confirmation = prompt(confirmMessage)

    if (confirmation !== 'DELETE') {
      if (confirmation !== null) {
        alert('Deletion cancelled. You must type DELETE exactly to confirm.')
      }
      return
    }

    try {
      setDeleting(true)

      const response = await fetch('/api/team/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: member.id,
          userName: member.full_name || member.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Error deleting user:', result.error)
        alert(`❌ Error: ${result.error}${result.details ? '\n\nDetails: ' + result.details : ''}`)
        setDeleting(false)
        return
      }

      alert(`✅ ${member.full_name || member.email} has been completely removed from the system.`)

      // Refresh team members list
      await fetchTeamMembers()
      setDeleting(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
      setDeleting(false)
    }
  }

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        alert('You must be logged in to change roles')
        return
      }

      const response = await fetch('/api/team/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newRole,
          updatedBy: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(`❌ Error: ${result.error}`)
        return
      }

      alert(`✅ Role updated successfully!`)
      await fetchTeamMembers() // Refresh the list
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Team & PIN Management</h2>
          <p className="text-gray-600 mt-1">
            Manage team members and assign PINs for mobile stock management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuickAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-orange-700 bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Quick Add Staff
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
            }}
          >
            <Mail className="w-5 h-5" />
            Invite with Email
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{teamMembers.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">PINs Assigned</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {teamMembers.filter(m => m.pin_code).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Key className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Setup</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">
                {teamMembers.filter(m => !m.pin_code).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Invites</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {pendingInvitations.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Pending Invitations</h3>
              <p className="text-sm text-gray-600 mt-1">These invitations are waiting to be accepted</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          <div className="space-y-3">
            {pendingInvitations.map((invitation) => {
              const expiresDate = new Date(invitation.expires_at)
              const isExpiringSoon = expiresDate.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 // Less than 24 hours

              return (
                <div key={invitation.id} className="bg-white rounded-lg p-4 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm">
                      {invitation.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{invitation.email}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>Sent {new Date(invitation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span className={isExpiringSoon ? 'text-red-600 font-medium' : ''}>
                          Expires {expiresDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyInviteLink(invitation.invitation_token, invitation.email)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
                      }}
                      title="Copy invitation link"
                    >
                      <Mail className="w-4 h-4" />
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                      title="Cancel invitation"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Team Members Table */}
      {teamMembers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
          <p className="text-gray-600 mb-6">Get started by inviting your first team member</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
            }}
          >
            <UserPlus className="w-5 h-5" />
            Invite First Member
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Team Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    PIN Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                          {(member.full_name || member.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {member.full_name || member.email}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            {member.full_name && !member.email.includes('@staff.local') && (
                              <>
                                <span>{member.email}</span>
                                <span>•</span>
                              </>
                            )}
                            {member.email.includes('@staff.local') && (
                              <>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Mobile Only</span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              Joined {new Date(member.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={member.role || 'staff'} />
                    </td>
                    <td className="px-6 py-4">
                      {member.pin_code ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg">
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">PIN Active</span>
                          </div>
                          <button
                            onClick={() => setShowPIN(showPIN === member.id ? null : member.id)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title={showPIN === member.id ? "Hide PIN" : "Show PIN"}
                          >
                            {showPIN === member.id ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {showPIN === member.id && (
                            <span className="text-sm font-mono font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                              {member.pin_code}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg w-fit">
                          <X className="w-4 h-4" />
                          <span className="text-sm font-medium">No PIN</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingUserId === member.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={newPIN}
                            onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 4-digit PIN"
                            className="px-4 py-2 border-2 border-orange-200 rounded-lg text-gray-900 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSetPIN(member.id)}
                            disabled={saving || newPIN.length !== 4}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(null)
                              setNewPIN('')
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-orange-700 bg-orange-100 border border-orange-300 hover:bg-orange-200 transition-all"
                            title="Edit member details"
                          >
                            <UserPlus className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setEditingUserId(member.id)
                              setNewPIN('')
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
                            }}
                          >
                            <Key className="w-4 h-4" />
                            {member.pin_code ? 'Change PIN' : 'Set PIN'}
                          </button>
                          {member.pin_code && (
                            <button
                              onClick={() => handleRemovePIN(member.id)}
                              disabled={saving}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                              Remove PIN
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(member)}
                            disabled={deleting}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            title="Delete user completely"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete User
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">How Mobile PINs Work</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Each team member gets a unique 4-digit PIN for mobile app access</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>PINs are used to log stock movements (deliveries, bar restocking, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>All stock changes are tracked with the user's name for full audit trail</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>PINs are organization-specific and encrypted for security</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  onKeyPress={(e) => e.key === 'Enter' && handleInviteUser()}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleInviteUser}
                disabled={inviting || !inviteEmail}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
                }}
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(false)
                  setInviteEmail('')
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Team Member</h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMember(null)
                  setEditName('')
                  setEditEmail('')
                  setEditPIN('')
                  setEditRole('staff')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Update member information. Leave PIN field empty to keep current PIN unchanged.
              </p>
              {editingMember.email.includes('@staff.local') && (
                <p className="text-sm text-orange-700 mt-2 font-medium">
                  💡 Add an email to send them a password setup link. They'll be able to access both the mobile app (PIN) and web dashboard (email/password).
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email {editingMember.email.includes('@staff.local') && <span className="text-gray-500 font-normal">(optional)</span>}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PIN <span className="text-gray-500 font-normal">(leave empty to keep current)</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={editPIN}
                  onChange={(e) => setEditPIN(e.target.value.replace(/\D/g, ''))}
                  placeholder={editingMember.pin_code ? '••••' : '0000'}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as 'owner' | 'manager' | 'staff' | 'viewer')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 font-medium"
              >
                <option value="staff">👤 Staff - View & count only</option>
                <option value="manager">🔑 Manager - Full access</option>
                <option value="owner">👑 Owner - Admin rights</option>
                <option value="viewer">👁️ Viewer - Read-only</option>
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Staff can view inventory, count rooms, and make orders. Managers and owners have full access to all features.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={editing || !editName}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
                }}
              >
                {editing ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingMember(null)
                  setEditName('')
                  setEditEmail('')
                  setEditPIN('')
                  setEditRole('staff')
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Staff Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Quick Add Staff</h3>
              <button
                onClick={() => {
                  setShowQuickAddModal(false)
                  setQuickAddName('')
                  setQuickAddPIN('')
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Quick Add</strong> creates a staff member with just a name and PIN for mobile app access. No email required. You can add an email later if needed.
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Staff Name
              </label>
              <input
                type="text"
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                4-Digit PIN
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={quickAddPIN}
                  onChange={(e) => setQuickAddPIN(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-center text-2xl font-mono tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleQuickAddMember}
                disabled={quickAdding || !quickAddName || quickAddPIN.length !== 4}
                className="flex-1 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)'
                }}
              >
                {quickAdding ? 'Adding...' : 'Add Staff Member'}
              </button>
              <button
                onClick={() => {
                  setShowQuickAddModal(false)
                  setQuickAddName('')
                  setQuickAddPIN('')
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
