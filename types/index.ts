// Types globaux pour Cann'Agri Expo

import type {
  Sponsor,
  Exhibitor,
  Stand,
  Ticket,
  Order,
  Event,
  Media,
  User,
  SponsorType,
  StandStatus,
  StandSize,
  TicketType,
  TicketStatus,
  OrderType,
  OrderStatus,
  EventType,
  UserRole,
  ContactType,
} from '@prisma/client'

// Re-export Prisma types
export type {
  Sponsor,
  Exhibitor,
  Stand,
  Ticket,
  Order,
  Event,
  Media,
  User,
  SponsorType,
  StandStatus,
  StandSize,
  TicketType,
  TicketStatus,
  OrderType,
  OrderStatus,
  EventType,
  UserRole,
  ContactType,
}

// Extended types with relations
export interface SponsorWithExhibitors extends Sponsor {
  exhibitors: Exhibitor[]
}

export interface ExhibitorWithSponsor extends Exhibitor {
  sponsor: Sponsor | null
}

export interface StandWithOrder extends Stand {
  order: Order | null
}

export interface OrderWithRelations extends Order {
  tickets: Ticket[]
  stands: Stand[]
}

export interface TicketWithOrder extends Ticket {
  order: Order | null
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Form types
export interface TicketPurchaseForm {
  ticketType: TicketType
  quantity: number
  customerName: string
  customerEmail: string
  customerPhone?: string
}

export interface StandBookingForm {
  standId: string
  hasFurniture: boolean
  hasElectricity: boolean
  customerName: string
  customerEmail: string
  customerPhone?: string
  companyName: string
  companySiret: string
  companyAddress?: string
}

export interface ContactForm {
  type: ContactType
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}

export interface NewsletterForm {
  email: string
  name?: string
}

// UI types
export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

export interface Pillar {
  icon: React.ReactNode
  title: string
  description: string
  link?: string
}

// Stats types
export interface DashboardStats {
  totalTicketsSold: number
  totalRevenue: number
  standsAvailable: number
  standsSold: number
  standsReserved: number
  totalSponsors: number
  premiumSponsors: number
  totalExhibitors: number
}

// Viva Wallet types
export interface VivaWalletOrderRequest {
  amount: number // in cents
  customerEmail: string
  customerFullName?: string
  customerPhone?: string
  merchantTrns: string // Our order ID
  requestLang?: string
  sourceCode?: string
}

export interface VivaWalletOrderResponse {
  orderCode: string
  checkoutUrl: string
}

export interface VivaWalletWebhookPayload {
  OrderCode: string
  StatusId: string
  EventTypeId: number
  Amount: number
  TransactionId?: string
  MerchantTrns?: string
}

// Program types
export interface DaySchedule {
  date: string
  events: Event[]
}

// Stand plan types
export interface StandPlanConfig {
  rows: number
  cols: number
  cellSize: number
  gap: number
}
