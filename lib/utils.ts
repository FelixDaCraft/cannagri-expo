import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(price)
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CAE-${timestamp}-${random}`
}

export function generateQRCodeData(orderId: string, ticketId: string): string {
  const timestamp = Date.now()
  return `CANNAGRI-${orderId}-${ticketId}-${timestamp}`
}

export function getStandStatusColor(status: string): string {
  switch (status) {
    case 'FREE':
      return 'bg-green-500'
    case 'RESERVED':
      return 'bg-orange-500'
    case 'SOLD':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

export function getStandStatusLabel(status: string): string {
  switch (status) {
    case 'FREE':
      return 'Libre'
    case 'RESERVED':
      return 'Réservé'
    case 'SOLD':
      return 'Vendu'
    default:
      return status
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidSiret(siret: string): boolean {
  // French SIRET validation (14 digits)
  const cleanSiret = siret.replace(/\s/g, '')
  return /^\d{14}$/.test(cleanSiret)
}

