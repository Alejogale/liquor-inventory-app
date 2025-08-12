import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, we'll simulate disconnecting QuickBooks
    console.log('📊 QuickBooks disconnect requested');
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'QuickBooks disconnected successfully (demo mode)' 
    });
  } catch (error) {
    console.error('Error disconnecting QuickBooks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
