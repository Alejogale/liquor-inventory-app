'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { UserInvitationService, type InvitationData } from '@/lib/user-invitation'
import { Users, Mail, Plus, X } from 'lucide-react'

interface OrgMember {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  job_title?: string | null
  status?: string | null
}

export default function TeamManager() {
  const { user, organization } = useAuth()
  const [members, setMembers] = useState<OrgMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', role: 'staff' })

  useEffect(() => {
    if (!organization?.id) {
      setLoading(false)
      return
    }
    fetchData()
  }, [organization?.id])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Fetch members
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, job_title, status')
        .eq('organization_id', organization!.id)
        .order('full_name')
      if (!error) setMembers(users as any[])

      // Fetch pending invitations via service
      const service = new UserInvitationService(organization!.id, user!.id)
      const invites = await service.getPendingInvitations()
      setPendingInvitations(invites)
    } finally {
      setLoading(false)
    }
  }

  const sendInvite = async () => {
    if (!form.email) return
    setInviting(true)
    try {
      const service = new UserInvitationService(organization!.id, user!.id)
      const payload: InvitationData = {
        email: form.email,
        full_name: form.full_name || form.email.split('@')[0],
        role: form.role as any,
        app_permissions: []
      }
      const res = await service.sendInvitation(payload)
      if (!res.success) {
        alert(res.error || 'Failed to send invitation')
      } else {
        alert('Invitation sent')
        setForm({ email: '', full_name: '', role: 'staff' })
        await fetchData()
      }
    } catch (e) {
      console.error(e)
      alert('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const cancelInvite = async (id: string) => {
    const service = new UserInvitationService(organization!.id, user!.id)
    const res = await service.cancelInvitation(id)
    if (!res.success) {
      alert(res.error || 'Failed to cancel invitation')
    }
    await fetchData()
  }

  const resendInvite = async (id: string) => {
    const service = new UserInvitationService(organization!.id, user!.id)
    const res = await service.resendInvitation(id)
    if (!res.success) {
      alert(res.error || 'Failed to resend invitation')
    } else {
      alert('Invitation resent')
    }
  }

  if (loading) {
    return <div className="text-slate-600">Loading team...</div>
  }

  if (!organization?.id) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Users className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-800">Organization Required</h3>
        </div>
        <p className="text-yellow-700">Join or create an organization to manage team members.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Invite Form */}
      <div className="bg-white rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Invite Team Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            placeholder="Full name"
            className="border border-slate-200 rounded-lg px-3 py-2"
          />
          <input
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="Email"
            className="border border-slate-200 rounded-lg px-3 py-2"
          />
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            onClick={sendInvite}
            disabled={inviting}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            <span>{inviting ? 'Sending…' : 'Send Invite'}</span>
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Team Members</h3>
          <div className="text-slate-500 text-sm">{members.length} members</div>
        </div>
        {members.length === 0 ? (
          <div className="text-slate-600">No team members yet.</div>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold">
                    {(m.full_name || m.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-slate-800 font-medium">{m.full_name || m.email}</div>
                    <div className="text-slate-600 text-sm">{m.role || 'staff'}{m.job_title ? ` • ${m.job_title}` : ''}</div>
                  </div>
                </div>
                <div className="text-slate-500 text-sm">{m.status || 'active'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Pending Invitations</h3>
          <div className="text-slate-500 text-sm">{pendingInvitations.length}</div>
        </div>
        {pendingInvitations.length === 0 ? (
          <div className="text-slate-600">No pending invitations.</div>
        ) : (
          <div className="space-y-2">
            {pendingInvitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                <div>
                  <div className="text-slate-800 font-medium">{inv.full_name} &lt;{inv.email}&gt;</div>
                  <div className="text-slate-600 text-sm">Role: {inv.role} • Expires {new Date(inv.expires_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => resendInvite(inv.id)} className="text-blue-700 hover:text-blue-900 text-sm">Resend</button>
                  <button onClick={() => cancelInvite(inv.id)} className="text-red-600 hover:text-red-800 text-sm">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}