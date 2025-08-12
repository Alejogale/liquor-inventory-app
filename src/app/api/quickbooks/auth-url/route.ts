import { NextRequest, NextResponse } from 'next/server';
import OAuthClient from 'intuit-oauth';

export async function GET(request: NextRequest) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const clientId = process.env.QUICKBOOKS_CLIENT_ID
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET

    if (!appUrl || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'QuickBooks not configured', configured: false },
        { status: 503 }
      )
    }

    const oauthClient = new OAuthClient({
      clientId,
      clientSecret,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      redirectUri: `${appUrl}/api/quickbooks/callback`,
    });

    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: 'qb_state'
    });

    return NextResponse.json({ authUrl: authUri, configured: true });
  } catch (error) {
    console.error('Error generating QuickBooks auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
