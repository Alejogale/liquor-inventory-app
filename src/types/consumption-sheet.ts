// Consumption Sheet Type Definitions for Hospitality Hub Integration

// Core interfaces matching existing Google Apps Script functionality
export interface ConsumptionItem {
  id: string
  brand: string
  category: string
  quantity: number
  originalQuantity?: number
  availableStock?: number
  rowIndex: number
  lastUpdated: string
}

export interface ConsumptionEvent {
  id: string
  eventName: string
  date: string
  sheetId: string
  items: ConsumptionItem[]
  totalItems: number
  status: 'active' | 'completed' | 'sent'
  lastModified: string
}

export interface ConsumptionWindow {
  id: string
  eventId: string
  eventName: string
  position: number
  isActive: boolean
  sheetConnection: GoogleSheetConnection
  items: ConsumptionItem[]
  config: WindowConfig
}

export interface WindowConfig {
  categories: string[]
  brands: Record<string, string[]>
  emailSettings: EmailConfig
  sheetSettings: SheetSettings
}

export interface EmailConfig {
  managerEmails: string[]
  reportTemplate: 'default' | 'detailed'
  autoSend: boolean
}

export interface SheetSettings {
  sheetId: string
  sheetName: string
  dataRange: string
  headerRow: number
  startColumn: string
  endColumn: string
}

export interface GoogleSheetConnection {
  spreadsheetId: string
  sheetName: string
  apiKey?: string
  accessToken?: string
  isConnected: boolean
  lastSync: string
}

export interface ConsumptionStats {
  totalEvents: number
  activeEvents: number
  totalConsumption: number
  todayConsumption: number
  topCategories: CategoryConsumption[]
  recentActivity: ConsumptionActivity[]
}

export interface CategoryConsumption {
  category: string
  totalQuantity: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

export interface ConsumptionActivity {
  id: string
  eventName: string
  action: 'created' | 'updated' | 'completed' | 'sent'
  quantity?: number
  brand?: string
  category?: string
  timestamp: string
  userId: string
}

// Manager Email Management
export interface ManagerEmail {
  id: string
  email: string
  name?: string
  role?: string
  isActive: boolean
  addedBy: string
  dateAdded: string
}

export interface EmailManager {
  emails: ManagerEmail[]
  defaultEmails: string[]
  validationRules: EmailValidationRule[]
}

export interface EmailValidationRule {
  pattern: RegExp
  message: string
  required?: boolean
}

// Multi-Window System
export interface WindowManager {
  windows: ConsumptionWindow[]
  activeWindowId: string
  maxWindows: number
  layout: WindowLayout
  settings: WindowManagerSettings
}

export interface WindowLayout {
  arrangement: 'tabs' | 'grid' | 'cascade'
  showTabs: boolean
  allowReordering: boolean
  persistState: boolean
}

export interface WindowManagerSettings {
  autoSave: boolean
  syncInterval: number
  maxHistoryEntries: number
  enableNotifications: boolean
}

// Google Apps Script Integration
export interface GoogleAppsScriptAPI {
  // Configuration Management
  getCategories: () => Promise<string[]>
  getBrands: (category?: string) => Promise<string[]>
  addCategory: (category: string) => Promise<boolean>
  addBrand: (category: string, brand: string) => Promise<boolean>
  deleteCategory: (category: string) => Promise<boolean>
  deleteBrand: (category: string, brand: string) => Promise<boolean>
  
  // Data Management
  getSheetData: (sheetId: string) => Promise<ConsumptionItem[]>
  updateQuantity: (sheetId: string, rowIndex: number, quantity: number) => Promise<boolean>
  batchUpdateQuantities: (sheetId: string, updates: QuantityUpdate[]) => Promise<boolean>
  
  // Email Management
  getManagerEmails: () => Promise<string[]>
  addManagerEmail: (email: string) => Promise<boolean>
  removeManagerEmail: (email: string) => Promise<boolean>
  updateManagerEmails: (emails: string[]) => Promise<boolean>
  
  // Event Management
  createEvent: (eventName: string) => Promise<string>
  getEventData: (eventId: string) => Promise<ConsumptionEvent>
  updateEvent: (eventId: string, data: Partial<ConsumptionEvent>) => Promise<boolean>
  
  // Reporting
  sendFormattedReport: (eventId: string, emails: string[]) => Promise<boolean>
  generateReportData: (eventId: string) => Promise<ConsumptionReport>
}

export interface QuantityUpdate {
  rowIndex: number
  quantity: number
  brand: string
  category: string
}

export interface ConsumptionReport {
  eventName: string
  date: string
  totalItems: number
  categoryBreakdown: CategoryConsumption[]
  itemList: ConsumptionItem[]
  summary: ReportSummary
}

export interface ReportSummary {
  totalQuantity: number
  categoriesUsed: number
  brandsUsed: number
  completionTime: string
  notes?: string
}

// Platform Integration Types
export interface DashboardConsumptionStats {
  totalConsumptionToday: number
  activeEvents: number
  completedEvents: number
  pendingReports: number
}

export interface ConsumptionQuickAction {
  id: string
  title: string
  description: string
  icon: string
  action: () => void
  disabled?: boolean
}

// Component Props
export interface ConsumptionTrackerProps {
  organizationId: string
  userId: string
  windowId?: string
  initialEvent?: ConsumptionEvent
  onEventChange?: (event: ConsumptionEvent) => void
}

export interface WindowManagerProps {
  organizationId: string
  userId: string
  maxWindows?: number
  initialLayout?: WindowLayout
  onWindowChange?: (windows: ConsumptionWindow[]) => void
}

export interface EmailManagerProps {
  organizationId: string
  currentEmails: string[]
  onEmailsChange: (emails: string[]) => void
  validationRules?: EmailValidationRule[]
}

export interface ConfigurationPanelProps {
  windowId: string
  config: WindowConfig
  onConfigChange: (config: WindowConfig) => void
  googleApiClient: GoogleAppsScriptAPI
}

// Error Types
export interface ConsumptionError {
  code: string
  message: string
  details?: any
  timestamp: string
}

export type ConsumptionErrorCode = 
  | 'GOOGLE_SHEETS_CONNECTION_ERROR'
  | 'EMAIL_VALIDATION_ERROR'
  | 'WINDOW_LIMIT_EXCEEDED'
  | 'SHEET_DATA_ERROR'
  | 'PERMISSION_DENIED'
  | 'NETWORK_ERROR'
  | 'INVALID_CONFIGURATION'

// State Management
export interface ConsumptionState {
  windows: ConsumptionWindow[]
  activeWindowId: string | null
  managerEmails: ManagerEmail[]
  isLoading: boolean
  error: ConsumptionError | null
  lastSync: string | null
}

export interface ConsumptionAction {
  type: string
  payload?: any
  windowId?: string
}

// Utility Types
export type WindowPosition = 1 | 2 | 3
export type ConsumptionStatus = 'active' | 'completed' | 'sent' | 'archived'
export type ReportFormat = 'html' | 'pdf' | 'csv' | 'json'
export type SheetOperation = 'read' | 'write' | 'update' | 'delete'