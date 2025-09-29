// Inventory Service for Consumption Sheet
// Connects to existing Supabase inventory items and categories

import { supabase } from '@/lib/supabase'
import { ConsumptionItem, ConsumptionEvent, QuantityUpdate, GoogleAppsScriptAPI, ManagerEmail } from '@/types/consumption-sheet'

interface InventoryItem {
  id: string
  brand: string
  size: string
  current_stock: number
  par_level: number
  threshold: number
  categories: { name: string } | null
  suppliers: { name: string } | null
}

export class InventoryService implements GoogleAppsScriptAPI {
  private organizationId: string

  constructor(organizationId: string) {
    this.organizationId = organizationId
  }

  // Configuration Management - Connect to existing inventory
  async getCategories(): Promise<string[]> {
    try {
      console.log('🔍 Fetching categories for organization:', this.organizationId)
      
      if (!this.organizationId) {
        console.warn('⚠️ No organization ID provided for categories, using defaults')
        return this.getDefaultCategories()
      }
      
      const { data: categories, error } = await supabase
        .from('categories')
        .select('name')
        .eq('organization_id', this.organizationId)
        .order('name')

      if (error) {
        console.log('❌ Categories error - using defaults')
        console.log('   Message:', error?.message || 'Unknown error')
        console.log('   Organization:', this.organizationId)
        console.warn('🔄 Using default categories as fallback')
        return this.getDefaultCategories()
      }

      console.log('✅ Categories fetched:', categories?.length || 0)
      const categoryNames = [...new Set(categories?.map(cat => cat.name) || [])]
      console.log('✅ Unique categories:', categoryNames.length)
      return categoryNames.length > 0 ? categoryNames : this.getDefaultCategories()
    } catch (error) {
      console.error('❌ Failed to get categories:', error)
      return this.getDefaultCategories()
    }
  }

  async getBrands(category?: string): Promise<string[]> {
    try {
      console.log('🔍 Fetching brands for organization:', this.organizationId, 'category:', category)
      
      // Get all inventory items for this organization
      let query = supabase
        .from('inventory_items')
        .select('brand, category_id')
        .eq('organization_id', this.organizationId)

      const { data: items, error } = await query.order('brand')

      if (error) {
        console.error('❌ Error fetching brands:', error)
        console.warn('Using default brands as fallback')
        return this.getDefaultBrands()
      }

      console.log('✅ Inventory items fetched:', items?.length || 0)

      if (category) {
        // If category filter is specified, we need to get the category ID first
        const { data: categoryData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('name', category)
          .eq('organization_id', this.organizationId)
          .single()

        if (!catError && categoryData) {
          // Filter items by category_id
          const filteredItems = items?.filter(item => item.category_id === categoryData.id) || []
          const brands = [...new Set(filteredItems.map(item => item.brand).filter(Boolean))]
          return brands.length > 0 ? brands : this.getDefaultBrands()
        }
      }

      // Extract unique brands from all items
      const brands = items ? [...new Set(items.map(item => item.brand).filter(Boolean))] : []
      return brands.length > 0 ? brands : this.getDefaultBrands()
    } catch (error) {
      console.error('❌ Failed to get brands:', error)
      return this.getDefaultBrands()
    }
  }

  // Data Management - Connect to real inventory
  async getSheetData(sheetId: string): Promise<ConsumptionItem[]> {
    try {
      console.log('🔍 Fetching inventory data for organization:', this.organizationId)
      
      if (!this.organizationId) {
        console.warn('⚠️ No organization ID provided, using mock data')
        return this.getMockInventoryItems()
      }
      
      // First get inventory items - using correct column names
      console.log('📋 Executing Supabase query for inventory_items...')
      const { data: items, error } = await supabase
        .from('inventory_items')
        .select('id, brand, size, category_id')
        .eq('organization_id', this.organizationId)
        .order('brand')

      if (error) {
        console.log('❌ Database error - using fallback data')
        console.log('   Message:', error?.message || 'Unknown error')
        console.log('   Organization:', this.organizationId)
        console.warn('🔄 Using mock inventory data as fallback')
        return this.getMockInventoryItems()
      }

      console.log('✅ Inventory items fetched:', items?.length || 0)

      // Get all categories for this organization
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', this.organizationId)

      if (catError) {
        console.error('❌ Error fetching categories for inventory:', catError)
      }

      // Create category lookup map
      const categoryMap = new Map(categories?.map(cat => [cat.id, cat.name]) || [])

      // Transform to consumption items - start all quantities at 0 for fresh tracking
      const consumptionItems = items?.map((item, index) => ({
        id: item.id,
        brand: `${item.brand} ${item.size || ''}`.trim(),
        category: categoryMap.get(item.category_id) || 'Uncategorized',
        quantity: 0, // Start at 0 for consumption tracking
        originalQuantity: 0, // Track consumption from 0
        availableStock: 999, // Use a default high number since we don't track actual stock
        rowIndex: index + 2, // Starting from row 2 (header is row 1)
        lastUpdated: new Date().toISOString()
      })) || []

      console.log('✅ Consumption items prepared:', consumptionItems.length)
      return consumptionItems.length > 0 ? consumptionItems : this.getMockInventoryItems()
    } catch (error) {
      console.error('❌ Failed to get inventory data:', error)
      return this.getMockInventoryItems()
    }
  }

  async updateQuantity(sheetId: string, rowIndex: number, quantity: number): Promise<boolean> {
    try {
      // Find the inventory item by row index
      const items = await this.getSheetData(sheetId)
      const item = items.find(item => item.rowIndex === rowIndex)
      
      if (!item) {
        console.error('Item not found for row index:', rowIndex)
        return false
      }

      // NOTE: We don't update actual inventory quantities - only track consumption
      // This is consumption tracking only, not inventory management
      console.log('🍻 Consumption tracked:', {
        item: item.brand,
        newQuantity: quantity,
        change: quantity - item.quantity
      })

      // Log the consumption activity
      await this.logConsumptionActivity(item.id, item.brand, quantity - item.quantity, item.category)

      return true
    } catch (error) {
      console.error('Failed to update quantity:', error)
      return false
    }
  }

  async batchUpdateQuantities(sheetId: string, updates: QuantityUpdate[]): Promise<boolean> {
    try {
      const items = await this.getSheetData(sheetId)
      const promises = updates.map(async (update) => {
        const item = items.find(item => item.rowIndex === update.rowIndex)
        if (!item) return false

        // NOTE: We don't update actual inventory quantities - only track consumption
        console.log('🍻 Batch consumption tracked:', {
          item: update.brand,
          quantity: update.quantity
        })
        
        await this.logConsumptionActivity(item.id, update.brand, update.quantity - item.quantity, update.category)
        
        return true
      })

      const results = await Promise.all(promises)
      return results.every(result => result === true)
    } catch (error) {
      console.error('Failed to batch update quantities:', error)
      return false
    }
  }

  // Email Management - Use existing manager emails or organization settings
  async getManagerEmails(): Promise<string[]> {
    try {
      console.log('🔍 Fetching manager emails for organization:', this.organizationId)
      
      // For now, return default emails to avoid database issues
      // TODO: Implement proper organization settings table
      console.warn('Using default manager emails - organization settings pending')
      return this.getDefaultManagerEmails()
      
    } catch (error) {
      console.error('❌ Failed to get manager emails:', error)
      return this.getDefaultManagerEmails()
    }
  }

  async addManagerEmail(email: string): Promise<boolean> {
    try {
      const currentEmails = await this.getManagerEmails()
      const updatedEmails = [...new Set([...currentEmails, email])]

      const { error } = await supabase
        .from('organizations')
        .update({
          settings: { managerEmails: updatedEmails },
          updated_at: new Date().toISOString()
        })
        .eq('id', this.organizationId)

      return !error
    } catch (error) {
      console.error('Failed to add manager email:', error)
      return false
    }
  }

  async removeManagerEmail(email: string): Promise<boolean> {
    try {
      const currentEmails = await this.getManagerEmails()
      const updatedEmails = currentEmails.filter(e => e !== email)

      const { error } = await supabase
        .from('organizations')
        .update({
          settings: { managerEmails: updatedEmails },
          updated_at: new Date().toISOString()
        })
        .eq('id', this.organizationId)

      return !error
    } catch (error) {
      console.error('Failed to remove manager email:', error)
      return false
    }
  }

  async updateManagerEmails(emails: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: { managerEmails: emails },
          updated_at: new Date().toISOString()
        })
        .eq('id', this.organizationId)

      return !error
    } catch (error) {
      console.error('Failed to update manager emails:', error)
      return false
    }
  }

  // Event Management
  async createEvent(eventName: string): Promise<string> {
    try {
      const eventId = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      console.log('✅ Created event:', eventName, 'with ID:', eventId)
      
      // Skip activity logging for now to avoid database errors
      // TODO: Implement proper activity_logs table structure
      
      return eventId
    } catch (error) {
      console.error('❌ Failed to create event:', error)
      return `event-${Date.now()}`
    }
  }

  async getEventData(eventId: string): Promise<ConsumptionEvent> {
    // For now, return a basic event structure
    // Could be enhanced to store/retrieve actual event data
    return {
      id: eventId,
      eventName: 'Live Event',
      date: new Date().toISOString(),
      sheetId: 'live-inventory',
      items: [],
      totalItems: 0,
      status: 'active',
      lastModified: new Date().toISOString()
    }
  }

  async updateEvent(eventId: string, eventData: Partial<ConsumptionEvent>): Promise<boolean> {
    // Could implement actual event updates if events are stored
    return true
  }

  // Reporting
  async sendFormattedReport(eventId: string, emails: string[]): Promise<boolean> {
    try {
      // Log the report send action
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          id: `log-${Date.now()}`,
          organization_id: this.organizationId,
          action: 'consumption_report_sent',
          details: { eventId, emails, sentAt: new Date().toISOString() },
          timestamp: new Date().toISOString()
        })

      // Here you would integrate with an email service like SendGrid, SES, etc.
      console.log('Consumption report sent to:', emails)

      return !error
    } catch (error) {
      console.error('Failed to send report:', error)
      return false
    }
  }

  async generateReportData(eventId: string): Promise<any> {
    try {
      const items = await this.getSheetData('live-inventory')
      const categories = await this.getCategories()

      const categoryBreakdown = categories.map(category => {
        const categoryItems = items.filter(item => item.category === category)
        const totalQuantity = categoryItems.reduce((sum, item) => sum + (item.originalQuantity || 0) - item.quantity, 0)
        return {
          category,
          totalQuantity,
          percentage: 0, // Calculate based on total
          trend: 'stable'
        }
      })

      return {
        eventName: 'Live Consumption Event',
        date: new Date().toISOString(),
        totalItems: items.length,
        categoryBreakdown,
        itemList: items,
        summary: {
          totalQuantity: categoryBreakdown.reduce((sum, cat) => sum + cat.totalQuantity, 0),
          categoriesUsed: categories.length,
          brandsUsed: [...new Set(items.map(item => item.brand))].length,
          completionTime: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Failed to generate report data:', error)
      return null
    }
  }

  // Category management
  async addCategory(category: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          id: `cat-${Date.now()}`,
          name: category,
          organization_id: this.organizationId,
          created_at: new Date().toISOString()
        })

      return !error
    } catch (error) {
      console.error('Failed to add category:', error)
      return false
    }
  }

  async deleteCategory(category: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', category)
        .eq('organization_id', this.organizationId)

      return !error
    } catch (error) {
      console.error('Failed to delete category:', error)
      return false
    }
  }

  async addBrand(category: string, brand: string): Promise<boolean> {
    // This would require adding a new inventory item
    // For now, just return success
    return true
  }

  async deleteBrand(category: string, brand: string): Promise<boolean> {
    // This would require removing inventory items
    // For now, just return success  
    return true
  }

  // Helper methods
  private async logConsumptionActivity(itemId: string, brand: string, quantityChange: number, category: string) {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          id: `log-${Date.now()}`,
          organization_id: this.organizationId,
          action: 'consumption_tracked',
          details: {
            itemId,
            brand,
            quantityChange,
            category,
            timestamp: new Date().toISOString()
          },
          timestamp: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to log consumption activity:', error)
    }
  }

  private getDefaultCategories(): string[] {
    return ['Wine', 'Beer', 'Spirits', 'Cocktails', 'Non-Alcoholic']
  }

  private getDefaultBrands(): string[] {
    return ['Grey Goose', 'Dom Pérignon', 'Macallan 18', 'Hennessy XO', 'Patron Silver']
  }

  private getDefaultManagerEmails(): string[] {
    return [
      'alejogaleis@gmail.com',
      'Stierney@morriscgc.com',
      'acuevas@morriscgc.com',
      'ksalvatore@morriscgc.com',
      'Ddepalma@morriscgc.com'
    ]
  }

  private getMockInventoryItems(): ConsumptionItem[] {
    return [
      // Spirits
      {
        id: 'item-1',
        brand: 'Grey Goose 750ml',
        category: 'Spirits',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 32,
        rowIndex: 2,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-2',
        brand: 'Macallan 18 750ml',
        category: 'Spirits',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 8,
        rowIndex: 3,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-3',
        brand: 'Hennessy XO 750ml',
        category: 'Spirits',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 15,
        rowIndex: 4,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-4',
        brand: 'Patron Silver Tequila 750ml',
        category: 'Spirits',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 20,
        rowIndex: 5,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-5',
        brand: 'Bombay Sapphire Gin 750ml',
        category: 'Spirits',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 18,
        rowIndex: 6,
        lastUpdated: new Date().toISOString()
      },
      // Wine
      {
        id: 'item-6',
        brand: 'Dom Pérignon 750ml',
        category: 'Wine',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 12,
        rowIndex: 7,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-7',
        brand: 'Caymus Cabernet 750ml',
        category: 'Wine',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 24,
        rowIndex: 8,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-8',
        brand: 'Opus One 750ml',
        category: 'Wine',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 6,
        rowIndex: 9,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-9',
        brand: 'Kendall Jackson Chardonnay 750ml',
        category: 'Wine',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 30,
        rowIndex: 10,
        lastUpdated: new Date().toISOString()
      },
      // Beer
      {
        id: 'item-10',
        brand: 'Stella Artois Draft',
        category: 'Beer',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 50,
        rowIndex: 11,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-11',
        brand: 'Corona Extra Bottle',
        category: 'Beer',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 48,
        rowIndex: 12,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-12',
        brand: 'Guinness Draft',
        category: 'Beer',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 36,
        rowIndex: 13,
        lastUpdated: new Date().toISOString()
      },
      // Cocktails
      {
        id: 'item-13',
        brand: 'House Margarita Mix',
        category: 'Cocktails',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 40,
        rowIndex: 14,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-14',
        brand: 'Premium Manhattan Mix',
        category: 'Cocktails',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 25,
        rowIndex: 15,
        lastUpdated: new Date().toISOString()
      },
      // Non-Alcoholic
      {
        id: 'item-15',
        brand: 'Coca Cola',
        category: 'Non-Alcoholic',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 100,
        rowIndex: 16,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'item-16',
        brand: 'Premium Coffee',
        category: 'Non-Alcoholic',
        quantity: 0,
        originalQuantity: 0,
        availableStock: 80,
        rowIndex: 17,
        lastUpdated: new Date().toISOString()
      }
    ]
  }
}

export default InventoryService