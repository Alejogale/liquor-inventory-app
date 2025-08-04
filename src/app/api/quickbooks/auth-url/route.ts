import { NextRequest, NextResponse } from 'next/server';
import OAuthClient from 'intuit-oauth';

export async function GET(request: NextRequest) {
  try {
    const oauthClient = new OAuthClient({
      clientId: process.env.QUICKBOOKS_CLIENT_ID!,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/quickbooks/callback`,
    });

    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: 'testState' // In production, use a secure random state
    });

    return NextResponse.json({ authUrl: authUri });
  } catch (error) {
    console.error('Error generating QuickBooks auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
