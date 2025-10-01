'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'

export default function EmailTestPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    emailType: 'welcome',
    to: '',
    userName: 'Test User',
    inviterName: 'Restaurant Owner',
    organizationName: 'Test Restaurant'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to send test email' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Email Template Tester</h1>
              <p className="text-gray-600">Test your InvyEasy email templates</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Type
              </label>
              <select
                value={formData.emailType}
                onChange={(e) => setFormData({ ...formData, emailType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="welcome">Welcome Email</option>
                <option value="verification">Email Verification</option>
                <option value="team-invitation">Team Invitation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To (Email)
              </label>
              <input
                type="email"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="your-email@gmail.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Name
              </label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {formData.emailType === 'team-invitation' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inviter Name
                  </label>
                  <input
                    type="text"
                    value={formData.inviterName}
                    onChange={(e) => setFormData({ ...formData, inviterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || !formData.to}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Email sent successfully!</span>
                </div>
              ) : (
                <div className="text-red-800">
                  <span className="font-semibold">Error:</span> {result.error}
                </div>
              )}
              {result.emailId && (
                <p className="text-sm text-green-600 mt-1">Email ID: {result.emailId}</p>
              )}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Testing Tips:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure you've added your RESEND_API_KEY to Vercel environment variables</li>
                <li>• Check your email (including spam folder) for the test emails</li>
                <li>• Each email type has different styling and content</li>
                <li>• Test on both desktop and mobile email clients</li>
              </ul>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">🔐 Password Reset:</h3>
              <p className="text-sm text-orange-800">
                Password reset emails are automatically handled by <strong>Supabase Auth</strong> for security. 
                To test: Use <code className="bg-orange-100 px-1 rounded">supabase.auth.resetPasswordForEmail()</code> 
                in your frontend code. The branded email template is already configured in your Supabase project.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}