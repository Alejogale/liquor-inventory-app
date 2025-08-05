import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'

export interface SecurityValidationResult {
  isValid: boolean
  organizationId?: string
  error?: string
}

/**
 * Validates that a user has access to a specific organization
 */
export async function validateOrganizationAccess(
  user: User | null,
  organizationId?: string
): Promise<SecurityValidationResult> {
  if (!user) {
    return { isValid: false, error: 'User not authenticated' }
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { isValid: false, error: 'User profile not found' }
    }

    // If no specific organization requested, use user's organization
    const targetOrgId = organizationId || profile.organization_id

    if (!targetOrgId) {
      return { isValid: false, error: 'No organization found for user' }
    }

    // Check if user belongs to the target organization
    if (profile.organization_id !== targetOrgId) {
      return { isValid: false, error: 'User does not have access to this organization' }
    }

    return { 
      isValid: true, 
      organizationId: targetOrgId 
    }
  } catch (error) {
    console.error('Error validating organization access:', error)
    return { isValid: false, error: 'Validation error occurred' }
  }
}

/**
 * Validates admin access for a user
 */
export async function validateAdminAccess(user: User | null): Promise<SecurityValidationResult> {
  if (!user) {
    return { isValid: false, error: 'User not authenticated' }
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { isValid: false, error: 'User profile not found' }
    }

    // Check if user has admin role
    if (profile.role === 'admin') {
      return { 
        isValid: true, 
        organizationId: profile.organization_id 
      }
    }

    // Fallback: Check if user is organization owner
    if (profile.organization_id) {
      const { data: organization } = await supabase
        .from('organizations')
        .select('created_by')
        .eq('id', profile.organization_id)
        .single()

      if (organization?.created_by === user.id) {
        return { 
          isValid: true, 
          organizationId: profile.organization_id 
        }
      }
    }

    return { isValid: false, error: 'User does not have admin privileges' }
  } catch (error) {
    console.error('Error validating admin access:', error)
    return { isValid: false, error: 'Validation error occurred' }
  }
}

/**
 * Validates that a resource belongs to the user's organization
 */
export async function validateResourceOwnership(
  user: User | null,
  resourceTable: string,
  resourceId: string,
  organizationId?: string
): Promise<SecurityValidationResult> {
  const accessValidation = await validateOrganizationAccess(user, organizationId)
  
  if (!accessValidation.isValid) {
    return accessValidation
  }

  try {
    // Check if resource belongs to user's organization
    const { data: resource, error } = await supabase
      .from(resourceTable)
      .select('organization_id')
      .eq('id', resourceId)
      .single()

    if (error || !resource) {
      return { isValid: false, error: 'Resource not found' }
    }

    if (resource.organization_id !== accessValidation.organizationId) {
      return { isValid: false, error: 'Resource does not belong to user organization' }
    }

    return { 
      isValid: true, 
      organizationId: accessValidation.organizationId 
    }
  } catch (error) {
    console.error('Error validating resource ownership:', error)
    return { isValid: false, error: 'Validation error occurred' }
  }
}

/**
 * Gets the current user's organization ID safely
 */
export async function getCurrentOrganizationId(user: User | null): Promise<string | null> {
  if (!user) return null

  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    return profile?.organization_id || null
  } catch (error) {
    console.error('Error getting organization ID:', error)
    return null
  }
}

/**
 * Validates that all organization IDs in a request match the user's organization
 */
export function validateOrganizationConsistency(
  userOrgId: string | null,
  requestOrgIds: (string | null | undefined)[]
): boolean {
  if (!userOrgId) return false
  
  return requestOrgIds.every(orgId => 
    orgId === null || orgId === undefined || orgId === userOrgId
  )
}

/**
 * Sanitizes organization context for database queries
 */
export function sanitizeOrganizationContext(organizationId: string | null | undefined): string | null {
  if (!organizationId || typeof organizationId !== 'string') {
    return null
  }
  
  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(organizationId) ? organizationId : null
} 