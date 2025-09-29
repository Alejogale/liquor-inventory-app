// User Invitation System for Hospitality Hub Platform
// Allows managers to invite staff members with specific roles and permissions

import { supabase } from './supabase'
import { UserRole, Permission } from './permissions'

export interface InvitationData {
  email: string
  full_name: string
  role: UserRole
  job_title?: string
  app_permissions?: Array<{
    app_id: string
    permissions: string[]
  }>
  expires_in_hours?: number
}

export interface Invitation {
  id: string
  email: string
  full_name: string
  role: UserRole
  job_title?: string
  organization_id: string
  invited_by: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expires_at: string
  created_at: string
}

export class UserInvitationService {
  private organizationId: string
  private invitedBy: string

  constructor(organizationId: string, invitedBy: string) {
    this.organizationId = organizationId
    this.invitedBy = invitedBy
  }

  // Send invitation to a new user
  async sendInvitation(invitationData: InvitationData): Promise<{ success: boolean; error?: string; invitationId?: string }> {
    try {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(user => user.email === invitationData.email)
      if (existingUser) {
        return { success: false, error: 'User already exists with this email' }
      }

      // Create invitation record
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + (invitationData.expires_in_hours || 72)) // Default 72 hours

      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .insert({
          email: invitationData.email,
          full_name: invitationData.full_name,
          role: invitationData.role,
          job_title: invitationData.job_title,
          organization_id: this.organizationId,
          invited_by: this.invitedBy,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          app_permissions: invitationData.app_permissions || []
        })
        .select()
        .single()

      if (invitationError) {
        console.error('Error creating invitation:', invitationError)
        return { success: false, error: 'Failed to create invitation' }
      }

      // Send invitation email
      await this.sendInvitationEmail(invitationData.email, invitation.id)

      return { success: true, invitationId: invitation.id }
    } catch (error) {
      console.error('Error in sendInvitation:', error)
      return { success: false, error: 'Failed to send invitation' }
    }
  }

  // Send invitation email
  private async sendInvitationEmail(email: string, invitationId: string): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email,
          invitationId,
          organizationId: this.organizationId
        }
      })

      if (error) {
        console.error('Error sending invitation email:', error)
      }
    } catch (error) {
      console.error('Error in sendInvitationEmail:', error)
    }
  }

  // Accept invitation and create user account
  async acceptInvitation(invitationId: string, password: string): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // Get invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('status', 'pending')
        .single()

      if (invitationError || !invitation) {
        return { success: false, error: 'Invalid or expired invitation' }
      }

      // Check if invitation has expired
      if (new Date(invitation.expires_at) < new Date()) {
        await this.updateInvitationStatus(invitationId, 'expired')
        return { success: false, error: 'Invitation has expired' }
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            full_name: invitation.full_name,
            role: invitation.role,
            organization_id: invitation.organization_id
          }
        }
      })

      if (authError || !authData.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: invitation.full_name,
          email: invitation.email,
          role: invitation.role,
          job_title: invitation.job_title,
          organization_id: invitation.organization_id,
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at,
          status: 'active'
        })

      if (profileError) {
        console.error('Error creating user profile:', profileError)
        // Delete the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return { success: false, error: 'Failed to create user profile' }
      }

      // Create user permissions if specified
      if (invitation.app_permissions && invitation.app_permissions.length > 0) {
        await this.createUserPermissions(authData.user.id, invitation.app_permissions)
      }

      // Update invitation status
      await this.updateInvitationStatus(invitationId, 'accepted')

      return { success: true, userId: authData.user.id }
    } catch (error) {
      console.error('Error in acceptInvitation:', error)
      return { success: false, error: 'Failed to accept invitation' }
    }
  }

  // Create user permissions
  private async createUserPermissions(userId: string, appPermissions: any[]): Promise<void> {
    try {
      const permissionsToInsert = appPermissions.flatMap(appPerm => 
        appPerm.permissions.map((permission: string) => ({
          user_id: userId,
          app_id: appPerm.app_id,
          permission_type: permission,
          granted_by: this.invitedBy,
          is_active: true
        }))
      )

      if (permissionsToInsert.length > 0) {
        const { error } = await supabase
          .from('user_permissions')
          .insert(permissionsToInsert)

        if (error) {
          console.error('Error creating user permissions:', error)
        }
      }
    } catch (error) {
      console.error('Error in createUserPermissions:', error)
    }
  }

  // Update invitation status
  private async updateInvitationStatus(invitationId: string, status: 'accepted' | 'expired' | 'cancelled'): Promise<void> {
    try {
      await supabase
        .from('user_invitations')
        .update({ status })
        .eq('id', invitationId)
    } catch (error) {
      console.error('Error updating invitation status:', error)
    }
  }

  // Get pending invitations for organization
  async getPendingInvitations(): Promise<Invitation[]> {
    try {
      const { data: invitations, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('organization_id', this.organizationId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending invitations:', error)
        return []
      }

      return invitations || []
    } catch (error) {
      console.error('Error in getPendingInvitations:', error)
      return []
    }
  }

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId)
        .eq('organization_id', this.organizationId)

      if (error) {
        return { success: false, error: 'Failed to cancel invitation' }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in cancelInvitation:', error)
      return { success: false, error: 'Failed to cancel invitation' }
    }
  }

  // Resend invitation
  async resendInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('organization_id', this.organizationId)
        .single()

      if (invitationError || !invitation) {
        return { success: false, error: 'Invitation not found' }
      }

      // Extend expiration time
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 72)

      await supabase
        .from('user_invitations')
        .update({ expires_at: expiresAt.toISOString() })
        .eq('id', invitationId)

      // Resend email
      await this.sendInvitationEmail(invitation.email, invitationId)

      return { success: true }
    } catch (error) {
      console.error('Error in resendInvitation:', error)
      return { success: false, error: 'Failed to resend invitation' }
    }
  }
}

// React hook for user invitations
export const useUserInvitations = (organizationId: string, invitedBy: string) => {
  const invitationService = new UserInvitationService(organizationId, invitedBy)

  return {
    sendInvitation: (invitationData: InvitationData) => 
      invitationService.sendInvitation(invitationData),
    acceptInvitation: (invitationId: string, password: string) => 
      invitationService.acceptInvitation(invitationId, password),
    getPendingInvitations: () => 
      invitationService.getPendingInvitations(),
    cancelInvitation: (invitationId: string) => 
      invitationService.cancelInvitation(invitationId),
    resendInvitation: (invitationId: string) => 
      invitationService.resendInvitation(invitationId)
  }
}
