'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  sendGuestReportEmail,
  sendLowStockAlertEmail,
  sendTeamInvitationEmail,
  sendReservationConfirmationEmail,
  sendInvoiceEmail,
  sendNotificationEmail
} from '@/lib/email-service'
import { 
  Mail, 
  Users, 
  Package, 
  Calendar, 
  CreditCard, 
  Bell,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'

interface EmailTestResult {
  type: string
  success: boolean
  message: string
  timestamp: Date
}

export default function EmailTester() {
  const { organization } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<EmailTestResult[]>([])

  const addResult = (type: string, success: boolean, message: string) => {
    setResults(prev => [{
      type,
      success,
      message,
      timestamp: new Date()
    }, ...prev.slice(0, 9)]) // Keep last 10 results
  }

  const testEmail = async (emailFunction: () => Promise<any>, type: string) => {
    if (!email) {
      addResult(type, false, 'Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const result = await emailFunction()
      if (result.success) {
        addResult(type, true, `✅ ${type} email sent successfully!`)
      } else {
        addResult(type, false, `❌ ${type} email failed: ${result.error?.message || 'Unknown error'}`)
      }
    } catch (error) {
      addResult(type, false, `❌ ${type} email error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testGuestReport = () => testEmail(async () => {
    return await sendGuestReportEmail({
      to: email,
      clubName: 'Test Country Club',
      clubLocation: 'Beverly Hills, CA',
      contactPerson: 'John Manager',
      guestData: [
        {
          guest_name: 'Alice Johnson',
          member_number: 'M001',
          visit_date: '2024-01-15',
          total_amount: 125.50,
          status: 'active'
        },
        {
          guest_name: 'Bob Smith',
          member_number: 'M002',
          visit_date: '2024-01-15',
          total_amount: 89.75,
          status: 'billed'
        }
      ],
      totalGuests: 2,
      totalRevenue: 215.25,
      reportDate: new Date().toLocaleDateString()
    })
  }, 'Guest Report')

  const testLowStockAlert = () => testEmail(async () => {
    return await sendLowStockAlertEmail({
      to: email,
      organizationName: organization?.Name || 'Test Organization',
      lowStockItems: [
        {
          name: 'Premium Vodka',
          brand: 'Grey Goose',
          current_stock: 5,
          threshold: 10,
          category: { name: 'Spirits' }
        },
        {
          name: 'Champagne',
          brand: 'Dom Pérignon',
          current_stock: 3,
          threshold: 8,
          category: { name: 'Wine' }
        }
      ],
      totalItems: 2
    })
  }, 'Low Stock Alert')

  const testTeamInvitation = () => testEmail(async () => {
    return await sendTeamInvitationEmail({
      to: email,
      inviterName: 'Sarah Admin',
      organizationName: organization?.Name || 'Test Organization',
      role: 'manager',
      inviteUrl: 'https://app.hospitalityhub.com/invite/test-token',
      customMessage: 'Welcome to our team! We\'re excited to have you join us.'
    })
  }, 'Team Invitation')

  const testReservationConfirmation = () => testEmail(async () => {
    return await sendReservationConfirmationEmail({
      to: email,
      guestName: 'Michael Guest',
      reservationDate: '2024-01-20',
      roomName: 'Private Dining Room',
      organizationName: organization?.Name || 'Test Organization',
      confirmationNumber: 'RES-2024-001'
    })
  }, 'Reservation Confirmation')

  const testInvoice = () => testEmail(async () => {
    return await sendInvoiceEmail({
      to: email,
      organizationName: organization?.Name || 'Test Organization',
      invoiceNumber: 'INV-2024-001',
      amount: 999.00,
      dueDate: '2024-02-15',
      invoiceUrl: 'https://app.hospitalityhub.com/invoice/test'
    })
  }, 'Invoice')

  const testNotification = () => testEmail(async () => {
    return await sendNotificationEmail({
      to: email,
      subject: 'System Maintenance Notice',
      title: 'Scheduled Maintenance',
      message: 'We will be performing system maintenance on January 20th from 2-4 AM. During this time, the platform will be temporarily unavailable.',
      appName: 'System',
      actionUrl: 'https://app.hospitalityhub.com/status',
      actionText: 'Check Status'
    })
  }, 'Notification')

  const testAllEmails = async () => {
    setLoading(true)
    const tests = [
      { name: 'Guest Report', func: testGuestReport },
      { name: 'Low Stock Alert', func: testLowStockAlert },
      { name: 'Team Invitation', func: testTeamInvitation },
      { name: 'Reservation Confirmation', func: testReservationConfirmation },
      { name: 'Invoice', func: testInvoice },
      { name: 'Notification', func: testNotification }
    ]

    for (const test of tests) {
      await test.func()
      // Small delay between emails
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Mail className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Email Template Tester</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address to test"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testGuestReport}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          <span>Test Guest Report</span>
        </button>

        <button
          onClick={testLowStockAlert}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <Package className="h-4 w-4" />
          <span>Test Low Stock Alert</span>
        </button>

        <button
          onClick={testTeamInvitation}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <Users className="h-4 w-4" />
          <span>Test Team Invitation</span>
        </button>

        <button
          onClick={testReservationConfirmation}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Calendar className="h-4 w-4" />
          <span>Test Reservation</span>
        </button>

        <button
          onClick={testInvoice}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <CreditCard className="h-4 w-4" />
          <span>Test Invoice</span>
        </button>

        <button
          onClick={testNotification}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <Bell className="h-4 w-4" />
          <span>Test Notification</span>
        </button>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={testAllEmails}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 mx-auto"
        >
          {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          <span>{loading ? 'Testing All Emails...' : 'Test All Email Templates'}</span>
        </button>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No test results yet. Run a test to see results here.</p>
          ) : (
            results.map((result, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  result.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.type}
                  </p>
                  <p className={`text-xs ${
                    result.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.message}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {result.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">📧 Email System Features</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>Consistent Design:</strong> All emails use the same UI/UX system</li>
          <li>✅ <strong>Responsive:</strong> Works perfectly on mobile and desktop</li>
          <li>✅ <strong>Brand Colors:</strong> Uses your app's color scheme</li>
          <li>✅ <strong>Professional:</strong> Country club appropriate styling</li>
          <li>✅ <strong>Free Service:</strong> Uses Resend (3,000 emails/month free)</li>
        </ul>
      </div>
    </div>
  )
}
