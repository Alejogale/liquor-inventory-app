// Guest Manager Type Definitions

export interface CountryClub {
  id: string
  name: string
  location: string
  contact_person?: string
  contact_email?: string
  phone_number?: string
  status: 'active' | 'inactive'
  notes?: string
  monthly_guests: number
  total_revenue: number
  organization_id: string
  created_at: string
  updated_at: string
}

export interface GuestVisit {
  id: string
  guest_name: string
  member_number: string
  home_club_id?: string
  home_club?: CountryClub
  visit_date: string
  total_amount: number
  status: 'active' | 'billed' | 'cancelled'
  organization_id: string
  created_at: string
  updated_at: string
  purchase_count?: number
}

export interface GuestPurchase {
  id: string
  guest_visit_id: string
  item_description: string
  quantity: number
  unit_price: number
  total_price: number
  organization_id: string
  created_at: string
}

export interface GuestFormData {
  guest_name: string
  member_number: string
  home_club_id: string
  visit_date: string
  purchases: PurchaseItem[]
}

export interface PurchaseItem {
  item_description: string
  quantity: number
  unit_price: number
  total_price?: number
}

export interface ClubFormData {
  name: string
  location: string
  contact_person?: string
  contact_email?: string
  phone_number?: string
  notes?: string
  status: 'active' | 'inactive'
}

export interface GuestManagerStats {
  total_guests_today: number
  total_revenue_today: number
  active_clubs: number
  monthly_guests: number
  monthly_revenue: number
}

export interface ExportOptions {
  format: 'csv' | 'json'
  date_from?: string
  date_to?: string
  club_id?: string
  status?: string
}

export interface GuestManagerFilters {
  date_from?: string
  date_to?: string
  club_id?: string
  status?: string
  search?: string
}
