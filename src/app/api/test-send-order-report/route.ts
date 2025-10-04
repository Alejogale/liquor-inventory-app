import { NextRequest, NextResponse } from 'next/server'
import { sendOrderReport } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing sendOrderReport function directly')
    
    // Create minimal test data
    const testData = {
      to: 'alejogaleis@gmail.com',
      organizationName: 'Test Organization',
      reportDate: '2024-10-04',
      reportData: {
        totalItems: 2,
        totalValue: 100.50,
        categories: 2,
        items: [
          {
            brand: 'Test Item 1',
            category_name: 'Category A',
            current_stock: 10,
            threshold: 5,
            par_level: 20,
            price_per_item: 25.00,
            total_value: 250.00,
            supplier_name: 'Test Supplier',
            barcode: '123456789',
            rooms_with_stock: []
          },
          {
            brand: 'Test Item 2',
            category_name: 'Category B',
            current_stock: 3,
            threshold: 5,
            par_level: 15,
            price_per_item: 10.25,
            total_value: 30.75,
            supplier_name: 'Test Supplier 2',
            barcode: '987654321',
            rooms_with_stock: []
          }
        ]
      }
    }

    console.log('🧪 Calling sendOrderReport with test data...')
    const result = await sendOrderReport(testData)
    
    console.log('🧪 sendOrderReport result:', result)
    
    return NextResponse.json({ 
      success: true, 
      result,
      testData: {
        itemCount: testData.reportData.items.length,
        organizationName: testData.organizationName
      }
    })

  } catch (error) {
    console.error('💥 Test sendOrderReport error:', error)
    console.error('💥 Error details:', {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
  }
}