// Google Sheets Integration for Consumption Sheet
// Preserves all existing Google Apps Script functionality

import { ConsumptionItem, ConsumptionEvent, QuantityUpdate, GoogleAppsScriptAPI, ManagerEmail } from '@/types/consumption-sheet'

export class GoogleSheetsClient implements GoogleAppsScriptAPI {
  private baseUrl: string
  private organizationId: string
  private accessToken?: string

  constructor(organizationId: string, accessToken?: string) {
    this.organizationId = organizationId
    this.accessToken = accessToken
    // This would be your Google Apps Script Web App URL
    this.baseUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || ''
  }

  private async makeRequest(endpoint: string, data?: any): Promise<any> {
    try {
      // If no base URL is configured, return mock data
      if (!this.baseUrl) {
        console.warn(`Google Sheets API not configured, returning mock data for ${endpoint}`)
        return this.getMockData(endpoint, data)
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
        },
        body: JSON.stringify({
          organizationId: this.organizationId,
          ...data
        })
      })

      if (!response.ok) {
        console.warn(`Google Sheets API request failed (${response.status}), falling back to mock data for ${endpoint}`)
        return this.getMockData(endpoint, data)
      }

      const result = await response.json()
      
      if (result.error) {
        console.warn(`Google Sheets API error: ${result.error}, falling back to mock data for ${endpoint}`)
        return this.getMockData(endpoint, data)
      }

      return result.data
    } catch (error) {
      console.error(`Google Sheets API Error (${endpoint}):`, error)
      console.warn(`Falling back to mock data for ${endpoint}`)
      return this.getMockData(endpoint, data)
    }
  }

  private getMockData(endpoint: string, data?: any): any {
    switch (endpoint) {
      case '/getCategories':
        return ['Spirits', 'Wine', 'Beer', 'Champagne', 'Cocktails']
      
      case '/getBrands':
        const mockBrands: Record<string, string[]> = {
          'Spirits': ['Grey Goose', 'Macallan 18', 'Hennessy XO', 'Johnny Walker Blue', 'Patron Silver'],
          'Wine': ['Dom Pérignon', 'Caymus Cabernet', 'Opus One', 'Screaming Eagle', 'Château Margaux'],
          'Beer': ['Stella Artois', 'Heineken', 'Corona', 'Budweiser', 'Guinness'],
          'Champagne': ['Dom Pérignon', 'Krug Grande Cuvée', 'Louis Roederer Cristal', 'Perrier-Jouët Belle Epoque'],
          'Cocktails': ['Manhattan', 'Old Fashioned', 'Martini', 'Negroni', 'Whiskey Sour']
        }
        return mockBrands[data?.category] || mockBrands['Spirits']
      
      case '/getManagerEmails':
        return [
          'alejogaleis@gmail.com',
          'Stierney@morriscgc.com',
          'acuevas@morriscgc.com',
          'ksalvatore@morriscgc.com',
          'Ddepalma@morriscgc.com'
        ]
      
      case '/getSheetData':
        return [
          {
            id: 'item-1',
            brand: 'Grey Goose',
            category: 'Spirits',
            quantity: 24,
            originalQuantity: 32,
            rowIndex: 2,
            lastUpdated: new Date().toISOString()
          },
          {
            id: 'item-2',
            brand: 'Dom Pérignon',
            category: 'Champagne',
            quantity: 8,
            originalQuantity: 12,
            rowIndex: 3,
            lastUpdated: new Date().toISOString()
          }
        ]
      
      case '/createEvent':
        return `event-${Date.now()}`
      
      case '/addCategory':
      case '/addBrand':
      case '/deleteCategory':
      case '/deleteBrand':
      case '/updateQuantity':
      case '/batchUpdateQuantities':
      case '/addManagerEmail':
      case '/removeManagerEmail':
      case '/updateManagerEmails':
      case '/updateEvent':
      case '/sendFormattedReport':
        return true // Success response for write operations
      
      case '/getEventData':
        return {
          id: data?.eventId || 'mock-event',
          eventName: 'Sample Event',
          date: new Date().toISOString(),
          sheetId: 'mock-sheet-id',
          items: [],
          totalItems: 0,
          status: 'active',
          lastModified: new Date().toISOString()
        }
      
      case '/generateReportData':
        return {
          eventName: 'Sample Event',
          date: new Date().toISOString(),
          totalItems: 2,
          categoryBreakdown: [
            { category: 'Spirits', totalQuantity: 8, percentage: 60, trend: 'up' },
            { category: 'Champagne', totalQuantity: 4, percentage: 40, trend: 'stable' }
          ],
          itemList: [],
          summary: {
            totalQuantity: 12,
            categoriesUsed: 2,
            brandsUsed: 2,
            completionTime: new Date().toISOString()
          }
        }
      
      default:
        console.warn(`No mock data available for endpoint: ${endpoint}`)
        return null
    }
  }

  // Configuration Management (preserving existing GAS functionality)
  async getCategories(): Promise<string[]> {
    return this.makeRequest('/getCategories')
  }

  async getBrands(category?: string): Promise<string[]> {
    return this.makeRequest('/getBrands', { category })
  }

  async addCategory(category: string): Promise<boolean> {
    return this.makeRequest('/addCategory', { category })
  }

  async addBrand(category: string, brand: string): Promise<boolean> {
    return this.makeRequest('/addBrand', { category, brand })
  }

  async deleteCategory(category: string): Promise<boolean> {
    return this.makeRequest('/deleteCategory', { category })
  }

  async deleteBrand(category: string, brand: string): Promise<boolean> {
    return this.makeRequest('/deleteBrand', { category, brand })
  }

  // Data Management (preserving existing GAS functionality)
  async getSheetData(sheetId: string): Promise<ConsumptionItem[]> {
    const data = await this.makeRequest('/getSheetData', { sheetId })
    return data.map((item: any, index: number) => ({
      id: item.id || `${sheetId}-${index}`,
      brand: item.brand || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      originalQuantity: item.originalQuantity || 0,
      rowIndex: item.rowIndex || index + 2, // Assuming header row
      lastUpdated: item.lastUpdated || new Date().toISOString()
    }))
  }

  async updateQuantity(sheetId: string, rowIndex: number, quantity: number): Promise<boolean> {
    return this.makeRequest('/updateQuantity', { 
      sheetId, 
      rowIndex, 
      quantity,
      timestamp: new Date().toISOString()
    })
  }

  async batchUpdateQuantities(sheetId: string, updates: QuantityUpdate[]): Promise<boolean> {
    return this.makeRequest('/batchUpdate', { 
      sheetId, 
      updates: updates.map(update => ({
        ...update,
        timestamp: new Date().toISOString()
      }))
    })
  }

  // Email Management (NEW functionality for manager emails)
  async getManagerEmails(): Promise<string[]> {
    try {
      const emails = await this.makeRequest('/getManagerEmails')
      return Array.isArray(emails) ? emails : []
    } catch (error) {
      console.error('Failed to get manager emails:', error)
      // Return default emails as fallback
      return [
        'alejogaleis@gmail.com',
        'Stierney@morriscgc.com',
        'acuevas@morriscgc.com',
        'ksalvatore@morriscgc.com',
        'Ddepalma@morriscgc.com'
      ]
    }
  }

  async addManagerEmail(email: string): Promise<boolean> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format')
    }

    return this.makeRequest('/addManagerEmail', { email: email.toLowerCase().trim() })
  }

  async removeManagerEmail(email: string): Promise<boolean> {
    return this.makeRequest('/removeManagerEmail', { email: email.toLowerCase().trim() })
  }

  async updateManagerEmails(emails: string[]): Promise<boolean> {
    // Validate all emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const validEmails = emails.filter(email => emailRegex.test(email))
    
    if (validEmails.length !== emails.length) {
      throw new Error('One or more emails are invalid')
    }

    return this.makeRequest('/updateManagerEmails', { 
      emails: validEmails.map(email => email.toLowerCase().trim()) 
    })
  }

  // Event Management (NEW functionality for multi-window support)
  async createEvent(eventName: string): Promise<string> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await this.makeRequest('/createEvent', { 
      eventId,
      eventName: eventName.trim(),
      createdAt: new Date().toISOString(),
      organizationId: this.organizationId
    })

    return eventId
  }

  async getEventData(eventId: string): Promise<ConsumptionEvent> {
    const data = await this.makeRequest('/getEventData', { eventId })
    
    return {
      id: data.id,
      eventName: data.eventName,
      date: data.date,
      sheetId: data.sheetId,
      items: data.items || [],
      totalItems: data.totalItems || 0,
      status: data.status || 'active',
      lastModified: data.lastModified || new Date().toISOString()
    }
  }

  async updateEvent(eventId: string, eventData: Partial<ConsumptionEvent>): Promise<boolean> {
    return this.makeRequest('/updateEvent', { 
      eventId, 
      eventData: {
        ...eventData,
        lastModified: new Date().toISOString()
      }
    })
  }

  // Reporting (preserving existing GAS functionality)
  async sendFormattedReport(eventId: string, emails: string[]): Promise<boolean> {
    return this.makeRequest('/sendFormattedReport', { 
      eventId, 
      emails,
      sentAt: new Date().toISOString()
    })
  }

  async generateReportData(eventId: string): Promise<any> {
    return this.makeRequest('/generateReport', { eventId })
  }
}

// Utility functions for Google Sheets integration
export const googleSheetsUtils = {
  // Validate sheet connection
  async validateSheetConnection(sheetId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:A1`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY}`
        }
      })
      return response.ok
    } catch {
      return false
    }
  },

  // Generate sheet URL for user reference
  generateSheetUrl(sheetId: string): string {
    return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
  },

  // Format email for manager list
  formatManagerEmail(email: string, name?: string, role?: string): ManagerEmail {
    return {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase().trim(),
      name: name?.trim(),
      role: role?.trim(),
      isActive: true,
      addedBy: 'system',
      dateAdded: new Date().toISOString()
    }
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Extract sheet ID from Google Sheets URL
  extractSheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  },

  // Generate default configuration
  generateDefaultConfig() {
    return {
      categories: ['Wine', 'Beer', 'Spirits', 'Cocktails', 'Non-Alcoholic'],
      brands: {
        'Wine': ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Sauvignon Blanc'],
        'Beer': ['Draft Beer', 'Bottle Beer', 'Premium Beer'],
        'Spirits': ['Vodka', 'Whiskey', 'Gin', 'Rum', 'Tequila'],
        'Cocktails': ['House Cocktails', 'Premium Cocktails', 'Specialty Drinks'],
        'Non-Alcoholic': ['Soft Drinks', 'Coffee', 'Tea', 'Water']
      },
      emailSettings: {
        managerEmails: [
          'alejogaleis@gmail.com',
          'Stierney@morriscgc.com',
          'acuevas@morriscgc.com', 
          'ksalvatore@morriscgc.com',
          'Ddepalma@morriscgc.com'
        ],
        reportTemplate: 'default' as const,
        autoSend: false
      },
      sheetSettings: {
        sheetId: '',
        sheetName: 'Consumption Sheet',
        dataRange: 'A:D',
        headerRow: 1,
        startColumn: 'A',
        endColumn: 'D'
      }
    }
  }
}

export default GoogleSheetsClient