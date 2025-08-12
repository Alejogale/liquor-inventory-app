import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'
import OAuthClient from 'intuit-oauth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const realmId = searchParams.get('realmId');
  
  if (!code || !realmId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=quickbooks_auth_failed`);
  }

  try {
    // For demo purposes, we'll use a simplified approach
    // In production, you'd properly authenticate the user
    console.log('📊 QuickBooks callback received:', { code, realmId });

    const oauthClient = new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/quickbooks/callback`,
    });

    // Exchange code for tokens
    const authResponse = await oauthClient.createToken(request.url);
    const tokens = authResponse.getJson();

    // Save tokens to database
    // Determine organization to update: try to get the current authenticated user and their profile
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      console.warn('Missing SUPABASE_SERVICE_ROLE_KEY; cannot save QuickBooks tokens')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=quickbooks_server_config`)
    }

    // Create a server-side admin client for secure updates
    const admin = createClient(supabaseUrl, serviceKey)

    // We still attempt to map the current user to their organization if present via auth cookie (fallback safe)
    const { data: { user: authUser } } = await admin.auth.getUser()
    let targetOrganizationId: string | null = null
    if (authUser) {
      const { data: profile } = await admin
        .from('user_profiles')
        .select('organization_id')
        .eq('id', authUser.id)
        .single()
      targetOrganizationId = profile?.organization_id || null
    }

    if (!targetOrganizationId) {
      console.warn('No organizationId found for QuickBooks callback; aborting token save')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=quickbooks_org_missing`)
    }

    const { error } = await admin
      .from('organizations')
      .update({
        quickbooks_company_id: realmId,
        quickbooks_access_token: tokens.access_token,
        quickbooks_refresh_token: tokens.refresh_token,
        quickbooks_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        quickbooks_connected_at: new Date().toISOString(),
      })
      .eq('id', targetOrganizationId)

    if (error) {
      console.error('Error saving QuickBooks tokens:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=quickbooks_save_failed`)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=quickbooks_connected`)
  } catch (error) {
    console.error('QuickBooks OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=quickbooks_auth_failed`);
  }
}
