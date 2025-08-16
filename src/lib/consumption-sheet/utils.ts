// Consumption Sheet Utility Functions

import { ManagerEmail } from '@/types/consumption-sheet'

export const consumptionUtils = {
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

export default consumptionUtils