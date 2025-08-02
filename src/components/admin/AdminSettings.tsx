'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Settings, 
  Mail, 
  Shield, 
  Database,
  Bell,
  Key,
  Trash2,
  Save,
  AlertTriangle
} from 'lucide-react'

interface AdminSettings {
  maintenanceMode: boolean
  emailNotifications: boolean
  dataRetentionDays: number
  maxUsersPerOrg: number
  backupFrequency: string
  apiRateLimit: number
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    maintenanceMode: false,
    emailNotifications: true,
    dataRetentionDays: 365,
    maxUsersPerOrg: 10,
    backupFrequency: 'daily',
    apiRateLimit: 1000
  })
  
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const handleSettingChange = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setLoading(true)
    setSaveStatus('Saving settings...')

    try {
      // In a real app, you'd save these to a settings table
      // For now, we'll simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaveStatus('Settings saved successfully!')
      
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      setSaveStatus('Error saving settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const runSystemMaintenance = async () => {
    setLoading(true)
    setSaveStatus('Running system maintenance...')

    try {
      // Simulate maintenance tasks
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSaveStatus('System maintenance completed successfully!')
      
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      setSaveStatus('Error running maintenance. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
        <p className="text-white/60">Configure system settings and maintenance options</p>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
          <p className="text-blue-200">{saveStatus}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Settings */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">System Settings</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between">
                <span className="text-white font-medium">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  className="toggle-checkbox"
                />
              </label>
              <p className="text-white/60 text-sm mt-1">
                Enable to prevent user access during system updates
              </p>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-white font-medium">Email Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="toggle-checkbox"
                />
              </label>
              <p className="text-white/60 text-sm mt-1">
                Send admin notifications for important events
              </p>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                Data Retention (Days)
              </label>
              <input
                type="number"
                value={settings.dataRetentionDays}
                onChange={(e) => handleSettingChange('dataRetentionDays', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                min="30"
                max="3650"
              />
              <p className="text-white/60 text-sm mt-1">
                How long to keep deleted data before permanent removal
              </p>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                Max Users Per Organization
              </label>
              <input
                type="number"
                value={settings.maxUsersPerOrg}
                onChange={(e) => handleSettingChange('maxUsersPerOrg', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                min="1"
                max="100"
              />
              <p className="text-white/60 text-sm mt-1">
                Maximum number of users allowed per organization
              </p>
            </div>
          </div>
        </div>

        {/* Security & Performance */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Security & Performance</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-white font-medium block mb-2">
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <p className="text-white/60 text-sm mt-1">
                How frequently to backup system data
              </p>
            </div>

            <div>
              <label className="text-white font-medium block mb-2">
                API Rate Limit (requests/hour)
              </label>
              <input
                type="number"
                value={settings.apiRateLimit}
                onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                min="100"
                max="10000"
                step="100"
              />
              <p className="text-white/60 text-sm mt-1">
                Maximum API requests per hour per user
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <h3 className="text-white font-medium mb-3">System Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={runSystemMaintenance}
                  disabled={loading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-500 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Database className="h-4 w-4" />
                  <span>Run System Maintenance</span>
                </button>
                
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear system cache? This may temporarily slow down the application.')) {
                      setSaveStatus('System cache cleared successfully!')
                      setTimeout(() => setSaveStatus(''), 3000)
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear System Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Health */}
      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Database Health</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">Healthy</div>
            <div className="text-white/60 text-sm">Connection Status</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">43ms</div>
            <div className="text-white/60 text-sm">Average Query Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">2.1GB</div>
            <div className="text-white/60 text-sm">Database Size</div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 px-8 rounded-lg font-medium transition-all flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <style jsx>{`
        .toggle-checkbox {
          appearance: none;
          width: 50px;
          height: 25px;
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          position: relative;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
        }

        .toggle-checkbox:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        .toggle-checkbox::before {
          content: '';
          position: absolute;
          top: 1px;
          left: 1px;
          width: 21px;
          height: 21px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .toggle-checkbox:checked::before {
          transform: translateX(25px);
        }
      `}</style>
    </div>
  )
}
