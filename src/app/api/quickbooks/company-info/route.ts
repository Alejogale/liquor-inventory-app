import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import QuickBooks from 'node-quickbooks';

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, we'll return sample company info
    console.log('📊 QuickBooks company info requested');
    
    // Return demo company info
    return NextResponse.json({
      success: true,
      data: {
        companyName: 'Demo Restaurant',
        legalName: 'Demo Restaurant LLC',
        email: 'demo@restaurant.com',
        phone: '(555) 123-4567',
        address: '123 Main St, Demo City, DC 12345'
      }
    });

  } catch (error) {
    console.error('Error fetching QuickBooks company info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
