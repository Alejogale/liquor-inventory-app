import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import QuickBooks from 'node-quickbooks';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization with QuickBooks tokens
    const { data: org } = await supabase
      .from('organizations')
      .select('quickbooks_company_id, quickbooks_access_token')
      .eq('id', user.user_metadata?.organization_id)
      .single();

    if (!org?.quickbooks_access_token) {
      return NextResponse.json({ error: 'QuickBooks not connected' }, { status: 400 });
    }

    // Create QuickBooks client
    const qbo = new QuickBooks(
      process.env.QUICKBOOKS_CLIENT_ID!,
      process.env.QUICKBOOKS_CLIENT_SECRET!,
      org.quickbooks_access_token,
      false, // no token secret for OAuth 2.0
      org.quickbooks_company_id,
      process.env.NODE_ENV !== 'production', // use sandbox
      true, // enable debugging
      null, // minor version
      '2.0', // oauth version
      null // refresh token
    );

    // Get company info
    return new Promise<Response>((resolve) => {
      qbo.getCompanyInfo(org.quickbooks_company_id, (err: unknown, companyInfo: any) => {
        if (err) {
          console.error('QuickBooks API error:', err);
          resolve(NextResponse.json({ error: 'Failed to fetch company info' }, { status: 500 }));
        } else {
          resolve(NextResponse.json(companyInfo.QueryResponse.CompanyInfo[0]));
        }
      });
    });

  } catch (error) {
    console.error('Error fetching QuickBooks company info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
