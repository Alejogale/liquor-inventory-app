'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { User as UserIcon, Mail, Briefcase, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  job_title?: string
  role?: string
}

interface ProfileSettingsProps {
  user: User
  userProfile: UserProfile | null
}

export default function ProfileSettings({ user, userProfile }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(userProfile?.full_name || '')
  const [jobTitle, setJobTitle] = useState(userProfile?.job_title || '')
  const [newEmail, setNewEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [emailSaving, setEmailSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          fullName,
          jobTitle
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile')
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmail || newEmail === user.email) {
      setEmailMessage({ type: 'error', text: 'Please enter a different email address' })
      return
    }

    setEmailSaving(true)
    setEmailMessage(null)

    try {
      // Use Supabase auth to update email (sends confirmation to both addresses)
      const { error } = await supabase.auth.updateUser({ email: newEmail })

      if (error) {
        throw error
      }

      setEmailMessage({
        type: 'success',
        text: 'Confirmation emails sent to both your current and new email addresses. Please check your inbox.'
      })
      setNewEmail('')
    } catch (error: any) {
      console.error('Error updating email:', error)
      setEmailMessage({ type: 'error', text: error.message || 'Failed to update email' })
    } finally {
      setEmailSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Profile Information</h2>
        <p className="text-gray-500 text-sm mb-6">Update your personal details</p>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="e.g., Bar Manager"
              />
            </div>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
              {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'N/A'}
              <span className="text-xs text-gray-400 ml-2">(Contact admin to change)</span>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </form>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Email Change */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Email Address</h2>
        <p className="text-gray-500 text-sm mb-6">Change your account email address</p>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Current email:</span> {user.email}
          </p>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
              New Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Enter new email address"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You&apos;ll receive confirmation emails at both your current and new email addresses.
            </p>
          </div>

          {/* Email Message */}
          {emailMessage && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {emailMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {emailMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={emailSaving || !newEmail}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {emailSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            Change Email
          </button>
        </form>
      </div>
    </div>
  )
}
