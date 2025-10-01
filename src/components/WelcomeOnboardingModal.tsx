'use client'

import { X, Download, Upload, Plus, Save, AlertTriangle, CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

interface WelcomeOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
}

export default function WelcomeOnboardingModal({ isOpen, onClose, userName }: WelcomeOnboardingModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const steps = [
    {
      number: 1,
      title: "Download & Fill Template (Fastest Setup)",
      description: "Get started quickly by downloading our Excel template, filling it with your inventory, then importing it back.",
      icon: Download,
      color: "from-orange-500 to-red-500",
      tips: [
        "Include all your current inventory items",
        "Set accurate par levels and thresholds",
        "Double-check category names match your needs"
      ]
    },
    {
      number: 2,
      title: "Or Start by Adding Categories",
      description: "If you prefer to build manually, start by creating your product categories first.",
      icon: Plus,
      color: "from-blue-500 to-indigo-500",
      tips: [
        "Create categories like 'Spirits', 'Wine', 'Beer', etc.",
        "Categories help organize your inventory",
        "You can always edit categories later"
      ]
    },
    {
      number: 3,
      title: "Save Counts Immediately",
      description: "Always save your inventory counts as soon as you finish counting each item.",
      icon: Save,
      color: "from-green-500 to-emerald-500",
      important: true,
      tips: [
        "🟠 Orange items = Not saved yet (SAVE NOW!)",
        "🔵 Blue items = Successfully saved",
        "Autosave doesn't guarantee your data is saved"
      ]
    },
    {
      number: 4,
      title: "Import Your Data",
      description: "Upload your completed template to bulk import all your inventory items at once.",
      icon: Upload,
      color: "from-purple-500 to-pink-500",
      tips: [
        "Use the Import feature in the main menu",
        "Review the preview before confirming",
        "Any errors will be highlighted for you to fix"
      ]
    }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl bg-white rounded-xl border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-2xl font-bold">Hello {userName}! 👋</h2>
                <p className="text-orange-100 mt-1">Welcome to Easy Inventory - Let's get you set up for success</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Recommended Setup Steps</h3>
              <p className="text-slate-600">Follow these steps to get the most out of your inventory management system:</p>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className={`relative rounded-xl border-2 p-6 ${
                    step.important ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-800 text-white text-sm font-bold rounded-full">
                            {step.number}
                          </span>
                          <h4 className="text-lg font-semibold text-slate-800">{step.title}</h4>
                          {step.important && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Important
                            </span>
                          )}
                        </div>
                        
                        <p className="text-slate-600 mb-3">{step.description}</p>
                        
                        <ul className="space-y-1">
                          {step.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-orange-800 mb-1">Critical Reminder: Save Your Work!</h4>
                  <p className="text-orange-700 text-sm">
                    Watch the item colors when counting: <span className="font-medium">Orange = Unsaved</span>, <span className="font-medium">Blue = Saved</span>. 
                    Always click save after counting each item to prevent data loss.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Got it, let's start!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}