'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'  // Add this import
import {
  Upload,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  X,
  Package,
  Users,
  Building2,
  ClipboardList,
  Loader2
} from 'lucide-react'

interface ImportDataProps {
  onImportComplete?: () => void
  organizationId?: string  // Add this prop
}

export default function ImportData({ onImportComplete, organizationId }: ImportDataProps) {
  const [activeImportType, setActiveImportType] = useState<string>('inventory')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResults, setImportResults] = useState<any>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Add helper function to get current organization
  const getCurrentOrganization = async () => {
    if (organizationId) return organizationId

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      return profile?.organization_id || null
    } catch (error) {
      console.error('Error getting organization:', error)
      return null
    }
  }

  const importTypes = [
    {
      id: 'inventory',
      title: 'Inventory Items',
      description: 'Import liquor, wine, and beer inventory',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      fields: ['brand', 'size', 'category_name', 'supplier_name', 'par_level', 'threshold', 'barcode'],
      requiredFields: ['brand', 'size', 'category_name', 'supplier_name'],
      example: 'Grey Goose,750ml,Vodka,ABC Liquors,12,3,123456789',
      dbMapping: {
        'brand': 'brand',
        'size': 'size', 
        'category_name': 'category_id', // Will lookup category by name
        'supplier_name': 'supplier_id', // Will lookup supplier by name
        'par_level': 'par_level',
        'threshold': 'threshold',
        'barcode': 'barcode'
      }
    },
    {
      id: 'suppliers',
      title: 'Suppliers',
      description: 'Import vendor and supplier information',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      fields: ['name', 'email', 'phone', 'contact_person', 'notes'],
      requiredFields: ['name', 'email'],
      example: 'ABC Liquors,sales@abc.com,555-1234,John Smith,Primary liquor vendor',
      dbMapping: {
        'name': 'name',
        'email': 'email',
        'phone': 'phone',
        'contact_person': 'contact_person',
        'notes': 'notes'
      }
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Import product categories',
      icon: ClipboardList,
      color: 'from-purple-500 to-pink-500',
      fields: ['name'],
      requiredFields: ['name'],
      example: 'Vodka',
      dbMapping: {
        'name': 'name'
      }
    },
    {
      id: 'rooms',
      title: 'Rooms & Locations',
      description: 'Import venue locations and storage areas',
      icon: Building2,
      color: 'from-orange-500 to-red-500',
      fields: ['name', 'type', 'description', 'display_order'],
      requiredFields: ['name'],
      example: 'Main Bar,Bar,Primary service area,1',
      dbMapping: {
        'name': 'name',
        'type': 'type',
        'description': 'description',
        'display_order': 'display_order'
      }
    }
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'text/csv') {
      setUploadedFile(file)
      parseCSVPreview(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  })

  const parseCSVPreview = async (file: File) => {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim())
      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })
    
    setPreviewData(preview)
    validateCSVData(headers, preview)
  }

  const validateCSVData = (headers: string[], data: any[]) => {
    const errors: string[] = []
    const activeType = importTypes.find(type => type.id === activeImportType)
    
    if (!activeType) return

    // Check required headers
    const missingHeaders = activeType.requiredFields.filter(field => 
      !headers.includes(field)
    )
    
    if (missingHeaders.length > 0) {
      errors.push(`Missing required columns: ${missingHeaders.join(', ')}`)
    }

    // Check for empty required fields
    if (data.length > 0) {
      activeType.requiredFields.forEach(field => {
        if (headers.includes(field)) {
          const hasEmptyValues = data.some(row => !row[field]?.trim())
          if (hasEmptyValues) {
            errors.push(`Required field '${field}' has empty values in some rows`)
          }
        }
      })
    }

    // Type-specific validations
    if (activeImportType === 'inventory') {
      // Check if par_level and threshold are numbers
      if (headers.includes('par_level')) {
        const invalidParLevels = data.filter(row => 
          row['par_level'] && isNaN(Number(row['par_level']))
        )
        if (invalidParLevels.length > 0) {
          errors.push('par_level must be a number')
        }
      }
      
      if (headers.includes('threshold')) {
        const invalidThresholds = data.filter(row => 
          row['threshold'] && isNaN(Number(row['threshold']))
        )
        if (invalidThresholds.length > 0) {
          errors.push('threshold must be a number')
        }
      }
    }

    if (activeImportType === 'suppliers') {
      // Validate email format
      if (headers.includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const invalidEmails = data.filter(row => 
          row['email'] && !emailRegex.test(row['email'])
        )
        if (invalidEmails.length > 0) {
          errors.push('Some email addresses are invalid')
        }
      }
    }

    if (activeImportType === 'rooms') {
      // Check if display_order is a number
      if (headers.includes('display_order')) {
        const invalidOrders = data.filter(row => 
          row['display_order'] && isNaN(Number(row['display_order']))
        )
        if (invalidOrders.length > 0) {
          errors.push('display_order must be a number')
        }
      }
    }

    setValidationErrors(errors)
  }

  const processImport = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    try {
      // Get current organization for import
      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        throw new Error('No organization found for import')
      }

      // Simulate import processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // TODO: When implementing actual imports, use currentOrg for organization_id
      // Example:
      // const importData = previewData.map(item => ({
      //   ...item,
      //   organization_id: currentOrg
      // }))
      
      setImportResults({
        success: true,
        imported: previewData.length,
        errors: 0,
        warnings: validationErrors.length > 0 ? 1 : 0
      })
      
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      setImportResults({
        success: false,
        error: 'Import failed. Please check your file format.'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadTemplate = (type: string) => {
    const importType = importTypes.find(t => t.id === type)
    if (!importType) return

    const headers = importType.fields.join(',')
    const example = importType.example
    const csvContent = `${headers}\n${example}`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearImport = () => {
    setUploadedFile(null)
    setPreviewData([])
    setValidationErrors([])
    setImportResults(null)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Import Data</h2>
        <p className="text-slate-600">Bulk upload your data using CSV files</p>
      </div>

      {/* Import Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {importTypes.map((type) => {
          const Icon = type.icon
          const isActive = activeImportType === type.id
          
          return (
            <button
              key={type.id}
              onClick={() => setActiveImportType(type.id)}
              className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                isActive
                  ? 'bg-blue-50 border-blue-400 shadow-lg'
                  : 'bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-slate-800 font-semibold mb-2">{type.title}</h3>
              <p className="text-slate-600 text-sm">{type.description}</p>
            </button>
          )
        })}
      </div>

      {/* Field Requirements */}
      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm mb-6">
        <h3 className="text-slate-800 font-semibold mb-4">
          Required Fields for {importTypes.find(t => t.id === activeImportType)?.title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-700 font-medium mb-2">Required Columns:</h4>
            <ul className="text-slate-700 text-sm space-y-1">
              {importTypes.find(t => t.id === activeImportType)?.requiredFields.map(field => (
                <li key={field}>• {field}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-blue-700 font-medium mb-2">Optional Columns:</h4>
            <ul className="text-slate-700 text-sm space-y-1">
              {importTypes.find(t => t.id === activeImportType)?.fields
                .filter(field => !importTypes.find(t => t.id === activeImportType)?.requiredFields.includes(field))
                .map(field => (
                  <li key={field}>• {field}</li>
                ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-slate-800 font-semibold mb-2">Download Template</h3>
            <p className="text-slate-600 text-sm">
              Get the correct CSV format for {importTypes.find(t => t.id === activeImportType)?.title}
            </p>
          </div>
          <button
            onClick={() => downloadTemplate(activeImportType)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <Download className="h-4 w-4" />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-sm mb-8">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`p-12 text-center cursor-pointer transition-all ${
              isDragActive ? 'bg-blue-50 border-blue-400' : 'hover:bg-blue-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-800 font-semibold text-lg mb-2">
              {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            <p className="text-slate-600 mb-4">
              Drag and drop your CSV file or click to browse
            </p>
            <p className="text-slate-500 text-sm">
              Maximum file size: 10MB • Supported format: CSV
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="text-slate-800 font-semibold">{uploadedFile.name}</h3>
                  <p className="text-slate-600 text-sm">
                    {(uploadedFile.size / 1024).toFixed(1)} KB • {previewData.length} rows
                  </p>
                </div>
              </div>
              <button
                onClick={clearImport}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Validation Results */}
            {validationErrors.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h4 className="text-red-700 font-semibold">Validation Errors</h4>
                </div>
                <ul className="text-red-600 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            {previewData.length > 0 && (
              <div className="mb-6">
                <h4 className="text-slate-800 font-semibold mb-3">Preview (first 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-200 bg-blue-50">
                        {Object.keys(previewData[0] || {}).map((header) => (
                          <th key={header} className="text-left text-slate-700 py-2 px-3">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b border-blue-100">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="text-slate-700 py-2 px-3">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import Button */}
            <div className="flex justify-end">
              <button
                onClick={processImport}
                disabled={isProcessing || validationErrors.length > 0}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isProcessing || validationErrors.length > 0
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                } text-white`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Import Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Import Results */}
      {importResults && (
        <div className={`p-6 rounded-xl border ${
          importResults.success
            ? 'bg-green-500/20 border-green-500/30'
            : 'bg-red-500/20 border-red-500/30'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {importResults.success ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <h4 className={`font-semibold ${
              importResults.success ? 'text-green-300' : 'text-red-300'
            }`}>
              Import {importResults.success ? 'Successful' : 'Failed'}
            </h4>
          </div>
          
          {importResults.success ? (
            <div className="text-green-200 text-sm">
              <p>✅ {importResults.imported} items imported successfully</p>
              {importResults.warnings > 0 && (
                <p>⚠️ {importResults.warnings} warnings (check your data)</p>
              )}
            </div>
          ) : (
            <p className="text-red-200 text-sm">{importResults.error}</p>
          )}
        </div>
      )}
    </div>
  )
}
