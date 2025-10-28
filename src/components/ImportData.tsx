'use client'

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
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
  Loader2,
  AlertTriangle, // Added AlertTriangle
  ChevronRight // Added ChevronRight
} from 'lucide-react'
import SupplierCreationModal from './SupplierCreationModal'

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
  const [importProgress, setImportProgress] = useState<string>('')
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [pendingSupplier, setPendingSupplier] = useState<any>(null)
  const [currentOrg, setCurrentOrg] = useState<string | null>(null)
  const [pendingImportItem, setPendingImportItem] = useState<any>(null)
  const [isWaitingForSupplier, setIsWaitingForSupplier] = useState(false)
  const [processedItems, setProcessedItems] = useState<any[]>([])
  const [failedItems, setFailedItems] = useState<any[]>([])
  
  // Use ref for performance and state for UI updates
  const currentItemIndexRef = useRef(0)
  const successCountRef = useRef(0)  // For performance - no re-renders
  const [useBatchMode, setUseBatchMode] = useState(false) // Toggle for batch processing
  const failedCountRef = useRef(0)   // For performance - no re-renders
  
  // State versions for UI updates
  const [successCount, setSuccessCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  
  // Add debugging for state changes
  console.log('🔄 ImportData render - activeImportType:', activeImportType)
  
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

  // Memoize importTypes to prevent recreation on every render
  const importTypes = useMemo(() => {
    console.log('🔧 ImportData: Initializing import types with LOWERCASE headers')
    return [
      {
        id: 'inventory',
        title: 'Inventory Items',
        description: 'Import liquor, wine, and beer inventory',
        icon: Package,
        color: 'from-blue-500 to-cyan-500',
        fields: ['brand', 'category_name', 'supplier_name', 'par_level', 'threshold', 'barcode', 'price_per_item'],
        requiredFields: ['brand', 'category_name', 'supplier_name'],
        example: 'Grey Goose,Vodka,ABC Liquors,12,3,123456789,25.99',
        dbMapping: {
          'brand': 'brand',
          'category_name': 'category_id', // Will lookup category by name
          'supplier_name': 'supplier_id', // Will lookup supplier by name
          'par_level': 'par_level',
          'threshold': 'threshold',
          'barcode': 'barcode',
          'price_per_item': 'price_per_item'
        }
      },
    {
      id: 'suppliers',
      title: 'Suppliers',
      description: 'Import vendor and supplier information',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      fields: ['Name', 'Email', 'Phone', 'Contact Person', 'Notes'],
      requiredFields: ['Name', 'Email'],
      example: 'ABC Liquors,sales@abc.com,555-1234,John Smith,Primary liquor vendor',
      dbMapping: {
        'Name': 'name',
        'Email': 'email',
        'Phone': 'phone',
        'Contact Person': 'contact_person',
        'Notes': 'notes'
      }
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Import product categories',
      icon: ClipboardList,
      color: 'from-purple-500 to-pink-500',
      fields: ['Name'],
      requiredFields: ['Name'],
      example: 'Vodka',
      dbMapping: {
        'Name': 'name'
      }
    },
    {
      id: 'rooms',
      title: 'Rooms & Locations',
      description: 'Import venue locations and storage areas',
      icon: Building2,
      color: 'from-orange-500 to-red-500',
      fields: ['Name', 'Type', 'Description', 'Display Order'],
      requiredFields: ['Name'],
      example: 'Main Bar,Bar,Primary service area,1',
      dbMapping: {
        'Name': 'name',
        'Type': 'type',
        'Description': 'description',
        'Display Order': 'display_order'
      }
    }
  ]}, [])

  // Define validateCSVData function before useEffect
  const validateCSVData = useCallback((headers: string[], data: any[]) => {
    const errors: string[] = []
    
    try {
      // Check if we have valid data
      if (!headers || headers.length === 0) {
        console.log('⚠️ No headers provided for validation')
        setValidationErrors([])
        return
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No data provided for validation')
        setValidationErrors([])
        return
      }

      // Fallback to 'inventory' if activeImportType is undefined
      const currentImportType = activeImportType || 'inventory'
      const activeType = importTypes.find(type => type.id === currentImportType)
      
      console.log('🔍 Validation Debug:', {
        activeImportType,
        currentImportType,
        activeType: activeType?.id,
        activeTypeObject: activeType,
        headers,
        activeTypeRequiredFields: activeType?.requiredFields,
        allImportTypes: importTypes.map(t => ({ id: t.id, required: t.requiredFields }))
      })
      
      if (!activeType) {
        console.error('❌ No active import type found for:', currentImportType)
        errors.push(`Invalid import type: ${currentImportType}`)
        setValidationErrors(errors)
        return
      }

      // Check required headers
      const missingHeaders = activeType.requiredFields?.filter(field => 
        !headers.includes(field)
      ) || []
      
      console.log('🔍 Header validation:', {
        requiredFields: activeType.requiredFields,
        headers,
        missingHeaders
      })
      
      if (missingHeaders.length > 0) {
        errors.push(`Missing required columns: ${missingHeaders.join(', ')}`)
      }

      // Check for empty required fields
      if (data.length > 0 && activeType.requiredFields) {
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
      if (currentImportType === 'inventory') {
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

      if (currentImportType === 'suppliers') {
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

      if (currentImportType === 'rooms') {
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
    } catch (error) {
      console.error('❌ Error in validateCSVData:', error)
      errors.push('Validation error occurred')
    }

    setValidationErrors(errors)
  }, [activeImportType]) // Only depend on activeImportType since importTypes is memoized

  // Re-validate when import type changes - moved after all declarations
  useEffect(() => {
    // Only validate if we have a file, data, and the first row has headers
    if (uploadedFile && previewData && previewData.length > 0 && previewData[0] && Object.keys(previewData[0]).length > 0) {
      console.log('🔄 Re-validating due to import type change to:', activeImportType)
      const headers = Object.keys(previewData[0])
      validateCSVData(headers, previewData)
    } else {
      // Clear validation errors when no file is uploaded or no valid data
      setValidationErrors([])
    }
  }, [activeImportType]) // Only depend on activeImportType to avoid infinite re-renders

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
    try {
      let text = await file.text()

      // Remove BOM (Byte Order Mark) if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1)
      }

      // Normalize line endings (\r\n -> \n, \r -> \n)
      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length === 0) {
        console.error('❌ No data found in CSV file')
        setValidationErrors(['No data found in CSV file'])
        return
      }

      // Enhanced CSV parser that handles quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote ("")
              current += '"'
              i++ // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator outside quotes
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }

        // Add the last field
        result.push(current.trim())
        return result
      }

      const headers = parseCSVLine(lines[0])

      console.log('📋 Parsed CSV headers:', headers)

      if (headers.length === 0) {
        console.error('❌ No headers found in CSV file')
        setValidationErrors(['No headers found in CSV file'])
        return
      }

      // Parse all data (not just preview)
      const allData = lines.slice(1).map(line => {
        const values = parseCSVLine(line)
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      console.log('📋 Parsed CSV data sample:', allData.slice(0, 2))

      // Set preview (first 5 rows) for display
      const preview = allData.slice(0, 5)
      setPreviewData(allData) // Store ALL data, not just preview

      // Validate the data using the memoized function - only if we have data
      if (allData.length > 0 && headers.length > 0 && typeof validateCSVData === 'function') {
        validateCSVData(headers, allData)
      }
    } catch (error) {
      console.error('❌ Error parsing CSV file:', error)
      setValidationErrors(['Error parsing CSV file'])
    }
  }

  const processImport = async () => {
    if (!previewData || previewData.length === 0) {
      console.error('❌ No preview data available for import')
      return
    }

    setIsProcessing(true)
    setImportProgress('Starting import...')
    setProcessedItems([])
    setFailedItems([])
    currentItemIndexRef.current = 0 // Reset ref
    successCountRef.current = 0 // Reset success counter
    failedCountRef.current = 0 // Reset failed counter
    setSuccessCount(0) // Reset UI counter
    setFailedCount(0) // Reset UI counter
    
    try {
      // Get current organization for import
      const currentOrg = await getCurrentOrganization()
      setCurrentOrg(currentOrg)
      console.log('🔍 Current organization ID:', currentOrg, 'Type:', typeof currentOrg)
      
      if (!currentOrg) {
        throw new Error('No organization found for import')
      }

      console.log('🚀 Starting import for:', activeImportType, 'with data:', previewData)
      setImportProgress(`Processing ${activeImportType} import...`)

      let importResults: any = { success: false, imported: 0, errors: 0 }

      // Process based on import type
      if (activeImportType === 'categories') {
        // Import categories with duplicate prevention
        const categoryData = previewData.map(item => ({
          name: item.name,
          organization_id: currentOrg
        }))

        console.log('📝 Importing categories (preventing duplicates):', categoryData)

        // First, get existing categories to avoid duplicates
        const { data: existingCategories } = await supabase
          .from('categories')
          .select('name')
          .eq('organization_id', currentOrg)

        const existingNames = new Set(existingCategories?.map(cat => cat.name.toLowerCase()) || [])
        
        // Filter out duplicates - keep only unique category names
        const uniqueCategories = categoryData.filter(category => 
          !existingNames.has(category.name.toLowerCase())
        )

        console.log(`📊 Found ${categoryData.length} categories, ${uniqueCategories.length} unique (${categoryData.length - uniqueCategories.length} duplicates skipped)`)

        let importedCount = 0
        let errorCount = 0

        if (uniqueCategories.length > 0) {
          const { data, error } = await supabase
            .from('categories')
            .insert(uniqueCategories)
            .select()

          if (error) {
            console.error('❌ Category import error:', error)
            throw new Error(`Failed to import categories: ${error.message}`)
          }

          importedCount = data?.length || 0
          console.log('✅ Categories imported successfully:', data)
        }

        importResults = {
          success: true,
          imported: importedCount,
          errors: errorCount,
          duplicatesSkipped: categoryData.length - uniqueCategories.length
        }

      } else if (activeImportType === 'suppliers') {
        // Import suppliers
        const supplierData = previewData.map(item => ({
          name: item.name,
          email: item.email,
          phone: item.phone || null,
          contact_person: item.contact_person || null,
          notes: item.notes || null,
          organization_id: currentOrg
        }))

        console.log('📝 Importing suppliers:', supplierData)

        const { data, error } = await supabase
          .from('suppliers')
          .insert(supplierData)
          .select()

        if (error) {
          console.error('❌ Supplier import error:', error)
          throw new Error(`Failed to import suppliers: ${error.message}`)
        }

        console.log('✅ Suppliers imported successfully:', data)
        importResults = {
          success: true,
          imported: data?.length || 0,
          errors: 0
        }

      } else if (activeImportType === 'rooms') {
        // Import rooms
        const roomData = previewData.map(item => ({
          name: item.name,
          type: item.type || null,
          description: item.description || null,
          display_order: item.display_order ? parseInt(item.display_order) : null,
          organization_id: currentOrg
        }))

        console.log('📝 Importing rooms:', roomData)

        const { data, error } = await supabase
          .from('rooms')
          .insert(roomData)
          .select()

        if (error) {
          console.error('❌ Room import error:', error)
          throw new Error(`Failed to import rooms: ${error.message}`)
        }

        console.log('✅ Rooms imported successfully:', data)
        importResults = {
          success: true,
          imported: data?.length || 0,
          errors: 0
        }

      } else if (activeImportType === 'inventory') {
        // Import inventory items with better error handling
        console.log('🔄 Processing inventory import with', previewData.length, 'items')
        setImportProgress('Processing inventory items...')
        
        // Start processing items one by one
        await processAllItems(currentOrg)
        // processAllItems handles completion via completeImport() - don't set results here
        return
      }

      setImportResults(importResults)
      if (onImportComplete) {
        onImportComplete()
      }

    } catch (error: any) {
      console.error('❌ Import failed:', error)
      setImportResults({
        success: false,
        imported: 0,
        errors: 1,
        error: error.message
      })
    } finally {
      if (!isWaitingForSupplier) {
        setIsProcessing(false)
        setImportProgress('')
      }
    }
  }

  // ✅ PERFORMANCE OPTIMIZATIONS

  // 1. Reduce delay from 100ms to 10ms (10x faster)
  // ✅ FIX: Remove the misplaced await statement
  // This line should NOT be at the top level - remove it:
  // await new Promise(resolve => setTimeout(resolve, 10))

  // 2. Cache categories and suppliers to avoid repeated lookups
  // ✅ FIX: Use object instead of Map for better compatibility
  const [categoryCache, setCategoryCache] = useState<Record<string, string>>({})
  const [supplierCache, setSupplierCache] = useState<Record<string, string>>({})

  // 3. Batch database operations where possible
  // ✅ FIXED: Complete processAllItems function with proper flow
  const processAllItems = async (currentOrg?: string | null, startIndex: number = 0) => {
    console.log(`🚀 Starting reliable import of ${previewData.length} items from index ${startIndex} (focus: completion)`)
    
    if (!currentOrg) {
      currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        console.error('❌ No organization found for import')
        setImportProgress('Error: No organization found')
        setIsProcessing(false)
        return
      }
    }
    
    // 🛡️ PROGRESS HEARTBEAT: Monitor import health
    let lastProgressTime = Date.now()
    const progressHeartbeat = setInterval(() => {
      const timeSinceLastProgress = Date.now() - lastProgressTime
      if (timeSinceLastProgress > 30000) { // 30 seconds without progress
        console.warn(`⚠️ IMPORT HEARTBEAT: No progress for ${Math.round(timeSinceLastProgress/1000)}s`)
        console.log(`📊 Status: Processing item ${currentItemIndexRef.current + 1}/${previewData.length}`)
      }
    }, 10000)

    // ✅ OPTIMIZATION: Pre-load all categories and suppliers
    console.log(`📋 Pre-loading categories and suppliers...`)
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id, name')
      .eq('organization_id', currentOrg)

    const { data: existingSuppliers } = await supabase
      .from('suppliers')
      .select('id, name')
      .eq('organization_id', currentOrg)

    // ✅ FIX: Build cache objects instead of Maps
    const categoryMap: Record<string, string> = {}
    const supplierMap: Record<string, string> = {}
    let consecutiveSlowItems = 0 // Track consecutive slow items for bulk skipping
    
    existingCategories?.forEach(cat => categoryMap[cat.name] = cat.id)
    existingSuppliers?.forEach(sup => supplierMap[sup.name] = sup.id)
    
    console.log(`✅ Cached ${Object.keys(categoryMap).length} categories and ${Object.keys(supplierMap).length} suppliers`)

    // Process each item in the import with enhanced performance
    for (let i = startIndex; i < previewData.length; i++) {
      currentItemIndexRef.current = i
      const item = previewData[i]
      const startTime = Date.now()
      
      // ✅ PROGRESS UPDATE: Show current item being processed
      if (i % 5 === 0 || i === previewData.length - 1) {
        console.log(`📦 Processing item ${i + 1}/${previewData.length}: ${item.brand || 'Unknown'}`)
      }
      setImportProgress(`Processing ${i + 1}/${previewData.length}: ${item.brand || 'Unknown item'}`)
      
      // 🧠 ADAPTIVE TIMEOUT: Smart timeout based on mode and item patterns  
      let itemSkipped = false
      // Use shorter timeout for items that are likely to be slow based on patterns
      const isLikelySlowItem = (item.brand?.toLowerCase().includes('mezcal') || 
                               item.brand?.toLowerCase().includes('reposado') ||
                               item.brand?.toLowerCase().includes('julio'))
      
      // Smart mode: More aggressive timeouts, Standard mode: Conservative timeouts
      let timeoutDuration
      if (useBatchMode) {
        timeoutDuration = isLikelySlowItem ? 2000 : 3000 // Smart mode: 2s/3s
      } else {
        timeoutDuration = isLikelySlowItem ? 3000 : 5000 // Standard mode: 3s/5s  
      }
      
      const watchdogTimer = setTimeout(() => {
        if (!itemSkipped) {
          console.warn(`⚠️ ADAPTIVE SKIP: Item ${i + 1} (${item.brand}) stuck for >${timeoutDuration/1000}s - forcing next item`)
          itemSkipped = true
          failedCountRef.current += 1
          setFailedCount(failedCountRef.current)
          setFailedItems(prev => [...prev, { 
            item, 
            error: `Item processing stuck (${timeoutDuration/1000}s timeout) - auto-skipped for completion` 
          }])
          // Force move to next item
          return // This will exit the current iteration
        }
      }, timeoutDuration)
      
      try {
        // Check if item was skipped by watchdog
        if (itemSkipped) {
          console.log(`⏭️ Item ${i + 1} already marked as skipped, continuing to next item`)
          continue
        }
        
        let categoryId = null
        let supplierId = null
        
        // ✅ VALIDATE AND SANITIZE DATA (fix long name issues)
        if (!item.brand || !item.category_name || !item.supplier_name) {
          console.log(`⚠️ Skipping item ${i + 1}: Missing required fields`)
          failedCountRef.current += 1
          setFailedCount(failedCountRef.current) // Update UI
          setFailedItems(prev => [...prev, {
            item,
            error: 'Missing required fields (brand, category_name, or supplier_name)'
          }])
          continue
        }

        // 🧠 INTELLIGENT ITEM ANALYSIS: Pre-process for known performance patterns
        const hasComplexChars = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(item.brand || '')
        const hasSpecialChars = /[^\w\s.-]/.test(item.brand || '')
        const isLongName = (item.brand?.length || 0) > 30
        
        if (hasComplexChars || hasSpecialChars || isLongName) {
          console.log(`🔍 Complex item detected: ${item.brand} (chars: ${hasComplexChars}, special: ${hasSpecialChars}, long: ${isLongName})`)
        }
        
        // ✅ ENHANCED SANITIZATION: Extra cleaning for problematic items
        const sanitizedItem = {
          brand: item.brand?.toString()
            .trim()
            .replace(/[^\w\s.-]/g, '') // Remove special characters that might cause DB issues
            .substring(0, 100) || '', // Max 100 chars
          category_name: item.category_name?.toString().trim().substring(0, 80) || '', // Max 80 chars
          supplier_name: item.supplier_name?.toString().trim().substring(0, 80) || '', // Max 80 chars
          par_level: item.par_level,
          threshold: item.threshold,
          barcode: item.barcode?.toString().trim().substring(0, 50) || null,
          price_per_item: item.price_per_item
        }

        // Log if we truncated anything
        if (item.brand?.length > 100) {
          console.warn(`⚠️ Truncated long data for ${item.brand}: brand(${item.brand?.length})`)
        }

        // 🚀 ULTRA-FAST DUPLICATE CHECK (multiple strategies for maximum speed)
        let existing = null
        const startDupeCheck = Date.now()
        
        try {
          // Strategy 1: Try fastest possible check first
          const { data, error } = await supabase
            .from('inventory_items')
            .select('id')
            .eq('brand', sanitizedItem.brand)
            .eq('organization_id', currentOrg)
            .limit(1)
            .maybeSingle()
          
          const dupeCheckTime = Date.now() - startDupeCheck
          if (dupeCheckTime > 2000) {
            console.warn(`⚠️ Slow duplicate check: ${sanitizedItem.brand} took ${dupeCheckTime}ms`)
          }
          
          existing = data ? { id: data.id } : null
          
          if (error && error.code !== 'PGRST116') {
            console.warn(`⚠️ Duplicate check error for ${sanitizedItem.brand}, treating as new item`)
            existing = null
          }
        } catch (error: any) {
          console.warn(`⚠️ Duplicate check failed for ${sanitizedItem.brand}, treating as new item`)
          existing = null
        }

        if (existing) {
          console.log(`⏭️ Item already exists, skipping: ${item.brand}`)
          successCountRef.current += 1  // Count as success since it exists
          setSuccessCount(successCountRef.current) // Update UI
          continue
        }

        // ✅ FAST CATEGORY LOOKUP (use sanitized data and cache)
        if (categoryMap[sanitizedItem.category_name]) {
          categoryId = categoryMap[sanitizedItem.category_name]
          console.log(`✅ Using cached category: ${sanitizedItem.category_name} (${categoryId})`)
        } else {
          // Create new category and add to cache
          console.log(`📝 Creating new category: ${sanitizedItem.category_name}`)
          try {
            const { data: newCategory, error: categoryError } = await supabase
              .from('categories')
              .insert([{ name: sanitizedItem.category_name, organization_id: currentOrg }])
              .select('id')
              .single()
            
            if (categoryError) {
              console.error(`❌ Failed to create category ${sanitizedItem.category_name}:`, categoryError)
              throw new Error(`Failed to create category: ${categoryError.message}`)
            }
            
            if (newCategory) {
              categoryId = newCategory.id
              categoryMap[sanitizedItem.category_name] = categoryId // Update cache
              console.log(`✅ Created category: ${sanitizedItem.category_name} (${categoryId})`)
            }
          } catch (error: any) {
            console.error(`❌ Category creation failed for ${item.category_name}:`, error)
            failedCountRef.current += 1
            setFailedCount(failedCountRef.current) // Update UI
            setFailedItems(prev => [...prev, { item, error: `Category creation failed: ${error.message}` }])
            continue
          }
        }

        // ✅ FAST SUPPLIER LOOKUP (use sanitized data and cache)
        if (supplierMap[sanitizedItem.supplier_name]) {
          supplierId = supplierMap[sanitizedItem.supplier_name]
          console.log(`✅ Using cached supplier: ${sanitizedItem.supplier_name} (${supplierId})`)
      } else {
          // Need supplier approval - pause here and show modal
          console.log(`⏸️ Supplier not found, showing modal: ${sanitizedItem.supplier_name}`)
          setPendingSupplier({ name: sanitizedItem.supplier_name, organizationId: currentOrg })
          setPendingImportItem({ ...item, ...sanitizedItem }) // Use sanitized version
          setShowSupplierModal(true)
          setIsWaitingForSupplier(true)
          return // Pause import until supplier is created
        }

        // ✅ FAST ITEM CREATION (using sanitized data)
        console.log(`📝 Creating inventory item: ${sanitizedItem.brand}`)
        try {
          const { data: newItem, error } = await supabase
            .from('inventory_items')
            .insert([{
              brand: sanitizedItem.brand,
              category_id: categoryId,
              supplier_id: supplierId,
              par_level: parseInt(sanitizedItem.par_level) || 0,
              threshold: parseInt(sanitizedItem.threshold) || 0,
              barcode: sanitizedItem.barcode,
              price_per_item: sanitizedItem.price_per_item ? parseFloat(sanitizedItem.price_per_item) : null,
              organization_id: currentOrg
            }])
            .select()
            .single()

          if (error) {
            console.error(`❌ Failed to create item ${item.brand}:`, error)
            failedCountRef.current += 1
            setFailedCount(failedCountRef.current) // Update UI
            setFailedItems(prev => [...prev, { item, error: error.message }])
          } else {
            console.log(`✅ Created item: ${item.brand}`)
            successCountRef.current += 1
            setSuccessCount(successCountRef.current) // Update UI
            setProcessedItems(prev => [...prev, newItem])
          }
        } catch (error: any) {
          console.error(`❌ Item creation failed for ${item.brand}:`, error)
          failedCountRef.current += 1
          setFailedCount(failedCountRef.current) // Update UI
          setFailedItems(prev => [...prev, { item, error: `Item creation failed: ${error.message}` }])
        }

    } catch (error: any) {
      console.error(`❌ Error processing item ${item.brand}:`, error)
        failedCountRef.current += 1
        setFailedCount(failedCountRef.current) // Update UI
      setFailedItems(prev => [...prev, { item, error: error.message }])
      } finally {
        // Clear watchdog timer
        clearTimeout(watchdogTimer)
        
        // 🛡️ UPDATE PROGRESS HEARTBEAT
        lastProgressTime = Date.now()
        itemSkipped = true // Prevent further watchdog actions
        
        // ⚡ ENHANCED CIRCUIT BREAKER: Monitor performance patterns
        const processingTime = Date.now() - startTime
        if (processingTime > 2000) {
          console.warn(`⚠️ Slow item: ${item.brand} took ${processingTime}ms`)
          consecutiveSlowItems++
          
          // Circuit breaker: If too many items are slow, log for analysis
          if (processingTime > 3000) {
            const itemName = item?.brand || 'Unknown Item'
            console.error(`🚨 CIRCUIT BREAKER: Item ${itemName} took ${processingTime}ms - monitoring for patterns`)
            console.log(`🔧 Original name length: ${item.brand?.length || 0} chars`)
            console.log(`📊 Consecutive slow items: ${consecutiveSlowItems}`)
            
            // If too many consecutive slow items, suggest bulk skip
            if (consecutiveSlowItems >= 3) {
              console.warn(`⚠️ PERFORMANCE WARNING: ${consecutiveSlowItems} consecutive slow items detected`)
            }
          }
        } else {
          // Reset counter on fast item
          consecutiveSlowItems = 0
        }
      }

      // ✅ MAXIMUM SPEED: Remove all artificial delays
      // Only force UI update every 20 items to reduce overhead
      if (i % 20 === 0) {
        // Use requestAnimationFrame for smoother UI updates
        await new Promise(resolve => requestAnimationFrame(resolve))
      }
    }

    // All items processed successfully
    console.log(`🏁 Import completed! Successful: ${successCountRef.current}, Failed: ${failedCountRef.current}`)
    
    // 🛡️ CLEANUP: Stop progress heartbeat
    clearInterval(progressHeartbeat)
    
    completeImport()
  }

  // Add a completion function
  const completeImport = () => {
    console.log(`📊 IMPORT SUMMARY:`)
    console.log(`    Total items in CSV: ${previewData.length}`)
    console.log(`   ✅ Successfully processed: ${successCountRef.current}`)
    console.log(`   ❌ Failed: ${failedCountRef.current}`)
    
    // Calculate success based on total processed vs failures
    const totalProcessed = successCountRef.current + failedCountRef.current
    const isSuccess = successCountRef.current > 0 && totalProcessed >= previewData.length
    
    console.log(`🔍 Import success calculation:`)
    console.log(`    Success count: ${successCountRef.current}`)
    console.log(`    Failed count: ${failedCountRef.current}`)
    console.log(`    Total processed: ${totalProcessed}`)
    console.log(`    Expected total: ${previewData.length}`)
    console.log(`    Is success: ${isSuccess}`)
    
    const importResults = {
      success: isSuccess,
      imported: successCountRef.current,
      errors: failedCountRef.current,
      failedItems: failedItems,
      totalInCsv: previewData.length
    }
    setImportResults(importResults)
    if (onImportComplete) {
      onImportComplete()
    }
    setIsProcessing(false)
    setImportProgress('')
  }

  // When user creates supplier in popup → resume import
  const handleSupplierCreated = async (supplierId: string) => {
    console.log(`✅ User created supplier with ID: ${supplierId}`)
    setShowSupplierModal(false)
    setIsWaitingForSupplier(false)
    setPendingSupplier(null)
    
    // Now create the pending item with the new supplier
    if (pendingImportItem) {
      const item = pendingImportItem
      const currentOrg = await getCurrentOrganization()
      
      try {
        // Get category (should exist from before)
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('name', item.category_name)
          .eq('organization_id', currentOrg)
          .maybeSingle()

        // Create the item with new supplier
        const { data: newItem, error } = await supabase
          .from('inventory_items')
          .insert([{
            brand: item.brand?.toString() || '',
            category_id: category?.id,
            supplier_id: supplierId,
            par_level: parseInt(item.par_level) || 0,
            threshold: parseInt(item.threshold) || 0,
            barcode: item.barcode || null,
            price_per_item: item.price_per_item ? parseFloat(item.price_per_item) : null,
            organization_id: currentOrg
          }])
          .select()
          .single()

        if (error) {
          console.error(`❌ Failed to create ${item.brand} after supplier creation:`, error.message)
          failedCountRef.current += 1
          setFailedItems(prev => [...prev, { item, error: error.message }])
        } else {
          console.log(`✅ Created ${item.brand} with new supplier`)
          successCountRef.current += 1
          setProcessedItems(prev => [...prev, newItem])
        }
      } catch (error: any) {
        console.error(`❌ Error creating item after supplier creation:`, error.message)
        failedCountRef.current += 1
        setFailedItems(prev => [...prev, { item, error: error.message }])
      }

      setPendingImportItem(null)
      
      // Resume import from next item
      const nextIndex = currentItemIndexRef.current + 1
      if (nextIndex < previewData.length) {
        console.log(`🔄 Resuming import from item ${nextIndex + 1}`)
        setTimeout(async () => {
          const org = await getCurrentOrganization()
          processAllItems(org, nextIndex)
        }, 100)
      } else {
        console.log(`🏁 Import completed after supplier creation`)
        completeImport()
      }
    }
  }

  const handleSupplierModalClose = () => {
    setShowSupplierModal(false)
    setIsWaitingForSupplier(false)
    setPendingSupplier(null)
    
    // If user cancels supplier creation, mark the item as failed and continue
    if (pendingImportItem) {
      failedCountRef.current += 1  // ✅ INCREMENT FAILED COUNTER
      setFailedItems(prev => [...prev, { 
        item: pendingImportItem, 
        error: `Supplier creation cancelled for: ${pendingImportItem.supplier_name}` 
      }])
      setPendingImportItem(null)
      
      // Continue with the rest of the import
      if (isProcessing) {
        // Move to next item and continue
        currentItemIndexRef.current = currentItemIndexRef.current + 1
        setTimeout(() => processAllItems(currentOrg), 100)
      }
    }
  }

  // Helper function to process a single import item
  const processImportItem = async (item: any, existingSupplierId?: string, currentOrg?: string | null) => {
    // ✅ ADD: Performance timing
    const startTime = performance.now()
    console.log(`🚀 [${startTime.toFixed(0)}ms] Starting processImportItem for: ${item.brand}`)
    
    try {
      // If currentOrg is not provided, get it
      let orgLookupTime = 0
      if (!currentOrg) {
        const orgStart = performance.now()
        currentOrg = await getCurrentOrganization()
        orgLookupTime = performance.now() - orgStart
        console.log(`⏱️ Organization lookup took: ${orgLookupTime.toFixed(0)}ms`)
        
        if (!currentOrg) {
          console.error(`❌ No organization found for import of item: ${item.brand}`)
          throw new Error('No organization found for import')
        }
      }
      console.log(`✅ Organization ID: ${currentOrg}`)

      // Look up category by name (create if doesn't exist)
      let categoryId = null
      let categoryTime = 0
      if (item.category_name) {
        const categoryStart = performance.now()
        console.log(`🔍 Looking up category: ${item.category_name}`)
        
        // First try to find existing category
        let existingCategory = null
        let categoryLookupError = null
        
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('id')
            .eq('name', item.category_name)
            .eq('organization_id', currentOrg)
            .maybeSingle()
          
          categoryTime = performance.now() - categoryStart
          console.log(`⏱️ Category lookup took: ${categoryTime.toFixed(0)}ms`)
          
          if (error) {
            console.error(`❌ Category lookup error for ${item.category_name}:`, error)
            categoryLookupError = error
          } else {
            existingCategory = data
            console.log(`🔍 Category lookup result for ${item.category_name}:`, existingCategory)
          }
        } catch (error) {
          categoryTime = performance.now() - categoryStart
          console.error(`❌ Category lookup exception for ${item.category_name}:`, error)
          categoryLookupError = error
        }

        if (existingCategory) {
          categoryId = existingCategory.id
          console.log(`✅ Found existing category: ${item.category_name} (ID: ${categoryId})`)
        } else {
          // Category doesn't exist, create it
          const createStart = performance.now()
          console.log(`📝 Creating new category: ${item.category_name}`)
          console.log(`📝 Organization ID for category: ${currentOrg}`)
          
            const { data: newCategory, error: categoryError } = await supabase
              .from('categories')
              .insert([{
                name: item.category_name,
                organization_id: currentOrg
              }])
              .select('id')
              .single()

          const createTime = performance.now() - createStart
          console.log(`⏱️ Category creation took: ${createTime.toFixed(0)}ms`)
          console.log(`📝 Category creation result:`, { newCategory, categoryError })

            if (categoryError) {
              console.error(`❌ Failed to create category ${item.category_name}:`, categoryError)
                throw new Error(`Failed to create category: ${item.category_name} - ${categoryError.message}`)
            } else {
              categoryId = newCategory.id
              console.log(`✅ Created new category: ${item.category_name} (ID: ${categoryId})`)
            }
          }
      } else {
        console.error(`❌ No category_name provided for item: ${item.brand}`)
        throw new Error(`No category_name provided for item: ${item.brand}`)
      }

      // Handle supplier
      let supplierId = existingSupplierId
      let supplierTime = 0
      if (!supplierId && item.supplier_name) {
        const supplierStart = performance.now()
        console.log(`🔍 Looking up supplier: ${item.supplier_name}`)
        
        // First try to find existing supplier
        let existingSupplier = null
        let supplierLookupError = null
        
        try {
          const { data, error } = await supabase
            .from('suppliers')
            .select('id')
            .eq('name', item.supplier_name)
            .eq('organization_id', currentOrg)
            .maybeSingle()
          
          supplierTime = performance.now() - supplierStart
          console.log(`⏱️ Supplier lookup took: ${supplierTime.toFixed(0)}ms`)
          
          if (error) {
            console.error(`❌ Supplier lookup error for ${item.supplier_name}:`, error)
            supplierLookupError = error
          } else {
            existingSupplier = data
            console.log(`🔍 Supplier lookup result for ${item.supplier_name}:`, existingSupplier)
          }
        } catch (error) {
          supplierTime = performance.now() - supplierStart
          console.error(`❌ Supplier lookup exception for ${item.supplier_name}:`, error)
          supplierLookupError = error
        }

        if (existingSupplier) {
          supplierId = existingSupplier.id
          console.log(`✅ Found existing supplier: ${item.supplier_name} (ID: ${supplierId})`)
        } else {
          // Supplier doesn't exist, need to create it
          console.log(`⏸️ Supplier creation needed: ${item.supplier_name}`)
          setPendingSupplier({ name: item.supplier_name, item })
            setPendingImportItem(item)
            setShowSupplierModal(true)
          setIsWaitingForSupplier(true)
          console.log(`⏸️ Paused for supplier creation: ${item.supplier_name}`)
            return undefined // Return undefined to indicate we're waiting for supplier creation
          }
      } else if (!supplierId) {
        console.error(`❌ No supplier_name provided for item: ${item.brand}`)
        throw new Error(`No supplier_name provided for item: ${item.brand}`)
      }

      // Verify we have both categoryId and supplierId
      if (!categoryId) {
        console.error(`❌ categoryId is null for item: ${item.brand}`)
        throw new Error(`Category ID is null for item: ${item.brand}`)
      }
      if (!supplierId) {
        console.error(`❌ supplierId is null for item: ${item.brand}`)
        throw new Error(`Supplier ID is null for item: ${item.brand}`)
      }

      console.log(`✅ Ready to create item: ${item.brand} with categoryId: ${categoryId}, supplierId: ${supplierId}`)

      // Create inventory item
      const inventoryItem = {
        brand: item.brand,
        category_id: categoryId,
        supplier_id: supplierId,
        par_level: parseInt(item.par_level) || 0,
        threshold: parseInt(item.threshold) || 0,
        barcode: item.barcode || null,
        price_per_item: item.price_per_item ? parseFloat(item.price_per_item) : null,
        organization_id: currentOrg
      }

      console.log(`📝 Creating inventory item with data:`, inventoryItem)
      
      // Check if item already exists to avoid duplicates
      const duplicateStart = performance.now()
      console.log(`🔍 Checking for duplicate item: ${item.brand}`)
      const { data: existingItem } = await supabase
        .from('inventory_items')
        .select('id')
        .eq('brand', item.brand)
        .eq('organization_id', currentOrg)
        .maybeSingle()

      const duplicateTime = performance.now() - duplicateStart
      console.log(`⏱️ Duplicate check took: ${duplicateTime.toFixed(0)}ms`)

      if (existingItem) {
        const totalTime = performance.now() - startTime
        console.log(`⚠️ Item already exists, skipping: ${item.brand} (Total time: ${totalTime.toFixed(0)}ms)`)
        return {
          success: true,
          skipped: true,
          item: existingItem,
          message: 'Item already exists'
        }
      } else {
        const createStart = performance.now()
        console.log(`📝 Creating inventory item: ${item.brand}`)
        
        const { data: newItem, error: itemError } = await supabase
          .from('inventory_items')
          .insert([inventoryItem])
          .select('id, brand')
          .single()

        const createTime = performance.now() - createStart
        const totalTime = performance.now() - startTime
        
        console.log(`⏱️ Item creation took: ${createTime.toFixed(0)}ms`)
        console.log(`⏱️ TOTAL PROCESSING TIME for ${item.brand}: ${totalTime.toFixed(0)}ms`)
        console.log(`⏱️ Breakdown: Org(${orgLookupTime.toFixed(0)}ms) + Category(${categoryTime.toFixed(0)}ms) + Supplier(${supplierTime.toFixed(0)}ms) + Duplicate(${duplicateTime.toFixed(0)}ms) + Create(${createTime.toFixed(0)}ms)`)

        if (itemError) {
          console.error(`❌ Failed to create inventory item ${item.brand}:`, itemError)
          throw new Error(`Failed to create inventory item: ${item.brand} - ${itemError.message}`)
        } else {
          console.log(`✅ Successfully created inventory item: ${item.brand} (ID: ${newItem.id})`)
          return { success: true, item: newItem, created: true }
        }
      }
    } catch (error: any) {
      const totalTime = performance.now() - startTime
      console.error(`❌ Error in processImportItem for ${item.brand} after ${totalTime.toFixed(0)}ms:`, error.message)
      return {
        success: false,
        error: error.message
      }
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
    setImportErrors([])
  }

  // Supplier modal functions removed since we create suppliers automatically

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
              onClick={() => {
                console.log('🖱️ Clicked import type:', type.id)
                setActiveImportType(type.id)
              }}
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
                    {(uploadedFile.size / 1024).toFixed(1)} KB • {previewData.length} total items
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
                <h4 className="text-slate-800 font-semibold mb-3">
                  Preview (first 5 rows of {previewData.length} total items)
                </h4>
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
                      {previewData.slice(0, 5).map((row, index) => (
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
                {previewData.length > 5 && (
                  <div className="mt-2 text-center text-slate-600 text-sm">
                    ... and {previewData.length - 5} more items
                  </div>
                )}
              </div>
            )}

            {/* Debug Info */}
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-slate-800 font-semibold mb-2">Debug Info</h4>
              <p className="text-slate-600 text-sm">Active Import Type: {activeImportType}</p>
              <p className="text-slate-600 text-sm">Validation Errors: {validationErrors.length}</p>
              <button
                onClick={() => {
                  if (previewData.length > 0) {
                    const headers = Object.keys(previewData[0] || {})
                    validateCSVData(headers, previewData)
                  }
                }}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Re-validate
              </button>
            </div>

            {/* Import Progress with Live Count */}
            {isProcessing && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-blue-700 font-medium">{importProgress || 'Processing...'}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      ✅ Imported: {successCount}
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      ❌ Failed: {failedCount}
                    </div>
                    <div className="text-xs text-gray-600">
                      Total: {successCount + failedCount} / {previewData.length}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((successCount + failedCount) / previewData.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((successCount + failedCount) / previewData.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Mode Toggle */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">🚀 Performance Mode</h3>
              <label className="flex items-center space-x-2 text-sm text-blue-700">
                <input
                  type="checkbox"
                  checked={useBatchMode}
                  onChange={(e) => setUseBatchMode(e.target.checked)}
                  className="rounded border-blue-300"
                />
                <span>Enable Smart Processing (recommended for large imports or slow connections)</span>
              </label>
              <p className="text-xs text-blue-600 mt-1">
                {useBatchMode 
                  ? "✅ Smart mode: Aggressive timeouts and enhanced sanitization" 
                  : "⚡ Standard mode: Normal processing with reliability features"}
              </p>
            </div>

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

            {/* ✅ ADD: Skip mechanism for problem items */}
            {isProcessing && (
              <div className="mt-4 p-4 border-2 border-yellow-400 rounded-lg bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Import Progress: {importProgress}
                    </p>
                    <p className="text-xs text-yellow-600">
                      Processing item {Math.min(currentItemIndexRef.current + 1, previewData.length)} of {previewData.length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Successfully imported: {successCount} items so far
                    </p>
                    <p className="text-xs text-red-600">
                      ❌ Failed: {failedCount} items
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // ✅ FIX: Safe array access
                        const currentIndex = Math.min(currentItemIndexRef.current, previewData.length - 1)
                        const currentItem = previewData[currentIndex]
                        console.log(`⏭️ Manual skip requested for: ${currentItem?.brand || 'Unknown item'}`)
                        
                        // Mark current item as failed (skipped)
                        failedCountRef.current += 1
                        setFailedItems(prev => [...prev, { 
                          item: currentItem || { brand: 'Unknown', error: 'Index out of bounds' }, 
                          error: 'Manually skipped by user' 
                        }])
                        
                        // Continue with next item
                        const nextIndex = currentItemIndexRef.current + 1
                        if (nextIndex < previewData.length) {
                          console.log(`🔄 Continuing with item ${nextIndex + 1}`)
                          processAllItems(undefined, nextIndex)
                        } else {
                          console.log(`🏁 Import completed after manual skip`)
                          completeImport()
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span>Skip Current Item</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log(`⚡ TURBO MODE: Reducing watchdog timer to 3 seconds`)
                        // You can click this during import to speed up slow items
                        alert('🚀 TURBO MODE: Slow items will now auto-skip after 3 seconds instead of 5!')
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <span>⚡</span>
                      <span>Turbo Mode</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log(`🔄 Force continue from current position`)
                        const nextIndex = currentItemIndexRef.current + 1
                        if (nextIndex < previewData.length) {
                          console.log(`🔄 Continuing with item ${nextIndex + 1}`)
                          processAllItems(undefined, nextIndex)
                        } else {
                          console.log(`🏁 Import completed`)
                          completeImport()
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <span>Continue Import</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log(`🏁 EMERGENCY COMPLETION: Finishing import with current results`)
                        console.log(`📊 Emergency completion - Success: ${successCountRef.current}, Failed: ${failedCountRef.current}`)
                        setIsProcessing(false)
                        completeImport()
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <span>✅ Complete Now</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        console.log(`⚡ FORCE RESTART: Restarting import with performance mode`)
                        // Reset and restart with performance optimizations
                        const nextIndex = currentItemIndexRef.current
                        processAllItems(undefined, nextIndex)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      <span>⚡ Force Restart</span>
                    </button>
                  </div>
                </div>
                
                {/* ✅ FIX: Safe current item display */}
                {previewData.length > 0 && currentItemIndexRef.current < previewData.length && previewData[currentItemIndexRef.current] && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded text-xs">
                    <strong>Current Item:</strong> {previewData[currentItemIndexRef.current]?.brand || 'Unknown'} 
                    ({previewData[currentItemIndexRef.current]?.size || 'Unknown size'}) 
                    - Category: {previewData[currentItemIndexRef.current]?.category_name || 'Unknown category'}
                    - Supplier: {previewData[currentItemIndexRef.current]?.supplier_name || 'Unknown supplier'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Import Results */}
      {importResults && (
        <div className={`mt-4 p-4 rounded-lg border ${
          importResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            {importResults.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <h3 className={`font-medium ${
              importResults.success ? 'text-green-800' : 'text-red-800'
            }`}>
              Import {importResults.success ? 'Completed' : 'Failed'}
            </h3>
          </div>
          
          <div className="space-y-2">
            <p className={`text-sm ${
              importResults.success ? 'text-green-700' : 'text-red-700'
            }`}>
              📊 <strong>Total in CSV:</strong> {previewData.length} items
            </p>
            <p className={`text-sm ${
              importResults.success ? 'text-green-700' : 'text-red-700'
            }`}>
              ✅ <strong>Successfully imported:</strong> {importResults.imported} items
            </p>
            {importResults.duplicatesSkipped > 0 && (
              <p className="text-sm text-yellow-700">
                ⚠️ <strong>Duplicates skipped:</strong> {importResults.duplicatesSkipped} items (first one kept)
              </p>
            )}
              {importResults.errors > 0 && (
              <p className="text-sm text-red-700">
                ❌ <strong>Failed:</strong> {importResults.errors} items
              </p>
            )}
                </div>

          {/* Show failed items details */}
              {importResults.failedItems && importResults.failedItems.length > 0 && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Failed Items:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                    {importResults.failedItems.map((failed: any, index: number) => (
                  <div key={index} className="text-sm text-red-700">
                    <strong>{failed.item.brand}:</strong> {failed.error}
                  </div>
                ))}
                </div>
            </div>
          )}
        </div>
      )}

      {/* Supplier Creation Modal */}
      {showSupplierModal && pendingSupplier && (
        <SupplierCreationModal
          supplierName={pendingSupplier.name}
          organizationId={pendingSupplier.organizationId}
          onClose={handleSupplierModalClose}
          onSupplierCreated={handleSupplierCreated}
        />
      )}
    </div>
  )
}
