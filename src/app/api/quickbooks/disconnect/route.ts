import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear QuickBooks tokens from database
    const { error } = await supabase
      .from('organizations')
      .update({
        quickbooks_company_id: null,
        quickbooks_access_token: null,
        quickbooks_refresh_token: null,
        quickbooks_token_expires_at: null,
        quickbooks_connected_at: null,
      })
      .eq('id', user.user_metadata?.organization_id);

    if (error) {
      console.error('Error disconnecting QuickBooks:', error);
      return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting QuickBooks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
