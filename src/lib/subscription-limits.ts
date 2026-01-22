import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export interface LimitCheckResult {
  allowed: boolean
  error?: string
  current: number
  limit: number
  upgradeRequired?: boolean
}

/**
 * Check if organization can add more storage areas
 */
export async function checkStorageAreaLimit(
  organizationId: string,
  supabaseClient?: any
): Promise<LimitCheckResult> {
  try {
    const client = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get organization limits
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('storage_area_limit, is_grandfathered')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return {
        allowed: false,
        error: 'Organization not found',
        current: 0,
        limit: 0
      }
    }

    // Grandfathered orgs have unlimited access
    if (org.is_grandfathered) {
      return {
        allowed: true,
        current: 0,
        limit: -1
      }
    }

    // Check if limit is unlimited
    if (org.storage_area_limit === -1) {
      return {
        allowed: true,
        current: 0,
        limit: -1
      }
    }

    // Count current storage areas
    const { count, error: countError } = await client
      .from('storage_areas')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    if (countError) {
      console.error('Error counting storage areas:', countError)
      return {
        allowed: false,
        error: 'Failed to check storage area count',
        current: 0,
        limit: org.storage_area_limit
      }
    }

    const currentCount = count || 0
    const canAdd = currentCount < org.storage_area_limit

    return {
      allowed: canAdd,
      error: canAdd ? undefined : `You've reached your storage area limit (${org.storage_area_limit}). Please upgrade your plan to add more.`,
      current: currentCount,
      limit: org.storage_area_limit,
      upgradeRequired: !canAdd
    }
  } catch (error) {
    console.error('Error in checkStorageAreaLimit:', error)
    return {
      allowed: false,
      error: 'Failed to check limit',
      current: 0,
      limit: 0
    }
  }
}

/**
 * Check if organization can add more inventory items
 */
export async function checkItemLimit(
  organizationId: string,
  supabaseClient?: any
): Promise<LimitCheckResult> {
  try {
    const client = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get organization limits
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('item_limit, is_grandfathered')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return {
        allowed: false,
        error: 'Organization not found',
        current: 0,
        limit: 0
      }
    }

    // Grandfathered orgs have unlimited access
    if (org.is_grandfathered) {
      return {
        allowed: true,
        current: 0,
        limit: -1
      }
    }

    // Check if limit is unlimited
    if (org.item_limit === -1) {
      return {
        allowed: true,
        current: 0,
        limit: -1
      }
    }

    // Count current items
    const { count, error: countError } = await client
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    if (countError) {
      console.error('Error counting items:', countError)
      return {
        allowed: false,
        error: 'Failed to check item count',
        current: 0,
        limit: org.item_limit
      }
    }

    const currentCount = count || 0
    const canAdd = currentCount < org.item_limit

    return {
      allowed: canAdd,
      error: canAdd ? undefined : `You've reached your item limit (${org.item_limit}). Please upgrade your plan to add more.`,
      current: currentCount,
      limit: org.item_limit,
      upgradeRequired: !canAdd
    }
  } catch (error) {
    console.error('Error in checkItemLimit:', error)
    return {
      allowed: false,
      error: 'Failed to check limit',
      current: 0,
      limit: 0
    }
  }
}

/**
 * Check if organization can add more users
 */
export async function checkUserLimit(
  organizationId: string,
  supabaseClient?: any
): Promise<LimitCheckResult> {
  try {
    const client = supabaseClient || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get organization limits
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('user_limit, is_grandfathered')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return {
        allowed: false,
        error: 'Organization not found',
        current: 0,
        limit: 0
      }
    }

    // Grandfathered orgs have unlimited access
    if (org.is_grandfathered) {
      return {
        allowed: true,
        current: 0,
        limit: -1
      }
    }

    // Check if limit is unlimited
    if (org.user_limit === -1) {
      return {
        allowed: true,
        current: 0,
        limit: -1
      }
    }

    // Count current active users
    const { count, error: countError } = await client
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    if (countError) {
      console.error('Error counting users:', countError)
      return {
        allowed: false,
        error: 'Failed to check user count',
        current: 0,
        limit: org.user_limit
      }
    }

    const currentCount = count || 0
    const canAdd = currentCount < org.user_limit

    return {
      allowed: canAdd,
      error: canAdd ? undefined : `You've reached your user limit (${org.user_limit}). Please upgrade your plan to add more users.`,
      current: currentCount,
      limit: org.user_limit,
      upgradeRequired: !canAdd
    }
  } catch (error) {
    console.error('Error in checkUserLimit:', error)
    return {
      allowed: false,
      error: 'Failed to check limit',
      current: 0,
      limit: 0
    }
  }
}
