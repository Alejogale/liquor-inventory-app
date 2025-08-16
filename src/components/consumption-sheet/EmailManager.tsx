'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Mail, Check, AlertCircle, X } from 'lucide-react'
import { ManagerEmail, EmailValidationRule } from '@/types/consumption-sheet'
import { consumptionUtils } from '@/lib/consumption-sheet/utils'

interface EmailManagerProps {
  organizationId: string
  currentEmails: string[]
  onEmailsChange: (emails: string[]) => void
  validationRules?: EmailValidationRule[]
}

export default function EmailManager({
  organizationId,
  currentEmails,
  onEmailsChange,
  validationRules = [
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
      required: true
    }
  ]
}: EmailManagerProps) {
  // State
  const [newEmailInput, setNewEmailInput] = useState('')
  const [emailToAdd, setEmailToAdd] = useState<ManagerEmail | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Default emails for reference
  const defaultEmails = [
    'alejogaleis@gmail.com',
    'Stierney@morriscgc.com',
    'acuevas@morriscgc.com',
    'ksalvatore@morriscgc.com',
    'Ddepalma@morriscgc.com'
  ]

  // Validate email
  const validateEmail = useCallback((email: string): string[] => {
    const errors: string[] = []
    
    validationRules.forEach(rule => {
      if (!rule.pattern.test(email)) {
        errors.push(rule.message)
      }
    })

    // Check for duplicates
    if (currentEmails.includes(email.toLowerCase().trim())) {
      errors.push('This email is already in the list')
    }

    return errors
  }, [currentEmails, validationRules])

  // Handle email input change
  const handleEmailInputChange = useCallback((value: string) => {
    setNewEmailInput(value)
    
    if (value.trim()) {
      const errors = validateEmail(value.trim())
      setValidationErrors(errors)
      
      if (errors.length === 0) {
        setEmailToAdd(consumptionUtils.formatManagerEmail(value.trim()))
      } else {
        setEmailToAdd(null)
      }
    } else {
      setValidationErrors([])
      setEmailToAdd(null)
    }
  }, [validateEmail])

  // Add email
  const addEmail = useCallback(async () => {
    if (!emailToAdd) return

    setIsAdding(true)
    setError(null)

    try {
      const updatedEmails = [...currentEmails, emailToAdd.email]
      await onEmailsChange(updatedEmails)
      
      setNewEmailInput('')
      setEmailToAdd(null)
      setValidationErrors([])
      setSuccess(`Added ${emailToAdd.email}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to add email:', err)
      setError(err instanceof Error ? err.message : 'Failed to add email')
    } finally {
      setIsAdding(false)
    }
  }, [emailToAdd, currentEmails, onEmailsChange])

  // Remove email
  const removeEmail = useCallback(async (emailToRemove: string) => {
    try {
      const updatedEmails = currentEmails.filter(email => email !== emailToRemove)
      await onEmailsChange(updatedEmails)
      
      setSuccess(`Removed ${emailToRemove}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to remove email:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove email')
    }
  }, [currentEmails, onEmailsChange])

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    try {
      await onEmailsChange(defaultEmails)
      setSuccess('Reset to default manager emails')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to reset emails:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset emails')
    }
  }, [onEmailsChange])

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Manager Email List</h2>
        <p className="text-slate-600">
          Manage the list of managers who will receive consumption reports. 
          All consumption reports will be sent to these email addresses.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add New Email */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Add Manager Email</h3>
        
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="email"
                  id="newEmail"
                  value={newEmailInput}
                  onChange={(e) => handleEmailInputChange(e.target.value)}
                  placeholder="manager@company.com"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    validationErrors.length > 0
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : emailToAdd
                        ? 'border-green-300 focus:border-green-500 focus:ring-green-500/20'
                        : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500/20'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && emailToAdd && !isAdding) {
                      addEmail()
                    }
                  }}
                />
                
                {/* Validation Messages */}
                {validationErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={addEmail}
                disabled={!emailToAdd || isAdding}
                className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Preview */}
          {emailToAdd && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-700">
                <Check className="w-5 h-5" />
                <span className="font-medium">Ready to add:</span>
                <span className="font-mono">{emailToAdd.email}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Manager Emails */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">
            Current Manager Emails ({currentEmails.length})
          </h3>
          
          <button
            onClick={resetToDefaults}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            Reset to Defaults
          </button>
        </div>

        {currentEmails.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-secondary">No manager emails configured</p>
            <p className="text-muted text-caption mt-1">Add emails above to start receiving reports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentEmails.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{email}</div>
                    <div className="text-sm text-slate-500">
                      {defaultEmails.includes(email) ? 'Default manager' : 'Added manager'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeEmail(email)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                  title={`Remove ${email}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Emails Reference */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Default Manager Emails</h3>
        <p className="text-slate-600 mb-4">
          These are the original manager emails from the system. You can use "Reset to Defaults" to restore this list.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {defaultEmails.map((email, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-slate-200">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="font-mono text-sm text-slate-700">{email}</span>
              {currentEmails.includes(email) && (
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">How Email Reports Work</h3>
        <div className="space-y-2 text-blue-800 text-sm">
          <p>• Reports are automatically sent when you click "Send Report" in any consumption window</p>
          <p>• All emails in this list will receive the formatted consumption report</p>
          <p>• Reports include event details, consumption totals, and category breakdowns</p>
          <p>• You can add or remove emails at any time without affecting ongoing events</p>
        </div>
      </div>
    </div>
  )
}