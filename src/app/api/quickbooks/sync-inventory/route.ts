import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import QuickBooks from 'node-quickbooks';

export async function POST(request: NextRequest) {
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

    // Get recent inventory purchases from your system
    const { data: purchases } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', user.user_metadata?.organization_id)
      .eq('action', 'stock_added')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('created_at', { ascending: false });

    if (!purchases || purchases.length === 0) {
      return NextResponse.json({ message: 'No recent purchases to sync' });
    }

    // Create QuickBooks client
    const qbo = new QuickBooks(
      process.env.QUICKBOOKS_CLIENT_ID!,
      process.env.QUICKBOOKS_CLIENT_SECRET!,
      org.quickbooks_access_token,
      false,
      org.quickbooks_company_id,
      process.env.NODE_ENV !== 'production',
      true,
      null,
      '2.0',
      null
    );

    let syncedCount = 0;

    // Process each purchase as an expense in QuickBooks
    for (const purchase of purchases) {
      try {
        const expenseData = {
          Amount: purchase.details?.cost || 0,
          PrivateNote: `Inventory purchase: ${purchase.details?.item_name || 'Unknown item'} - Quantity: ${purchase.details?.quantity || 1}`,
          TxnDate: purchase.created_at.split('T')[0], // Format: YYYY-MM-DD
          Line: [{
            Amount: purchase.details?.cost || 0,
            DetailType: 'AccountBasedExpenseLineDetail',
            AccountBasedExpenseLineDetail: {
              AccountRef: {
                value: '60' // Cost of Goods Sold account (standard QB account)
              }
            }
          }]
        };

        await new Promise((resolve, reject) => {
          qbo.createPurchase(expenseData, (err: unknown, result: unknown) => {
            if (err) {
              console.error('Error creating QB expense:', err);
              reject(err);
            } else {
              syncedCount++;
              resolve(result);
            }
          });
        });

      } catch (error) {
        console.error('Error processing purchase:', purchase.id, error);
        // Continue with next purchase
      }
    }

    return NextResponse.json({ 
      message: `Successfully synced ${syncedCount} out of ${purchases.length} purchases to QuickBooks`,
      syncedCount,
      totalPurchases: purchases.length
    });

  } catch (error) {
    console.error('Error syncing inventory to QuickBooks:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
