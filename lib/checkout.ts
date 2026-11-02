import { siteConfig } from '@/config/site'

/**
 * Validation des coordonnées de l'acheteur d'une commande de billets.
 * Un compte n'est pas nécessaire : tout ce qui vient du navigateur est vérifié ici.
 */

const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 254
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_PATTERN = /^\+?[\d\s().-]{6,30}$/

export class CheckoutValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CheckoutValidationError'
  }
}

export interface VisitorCustomer {
  name: string
  email: string
  phone: string | null
}

/** Nom du champ piège, invisible pour un humain : un robot qui le remplit est refusé. */
export const HONEYPOT_FIELD = 'website'

/** Adresse e-mail au format attendu (après normalisation) */
export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email)
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function parseVisitorCustomer(raw: unknown): VisitorCustomer {
  if (!raw || typeof raw !== 'object') throw new CheckoutValidationError('Coordonnées de l’acheteur manquantes')
  const input = raw as Record<string, unknown>

  const honeypot = input[HONEYPOT_FIELD]
  if (typeof honeypot === 'string' ? honeypot.trim() !== '' : honeypot != null) {
    throw new CheckoutValidationError('Formulaire invalide')
  }

  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : ''
  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    throw new CheckoutValidationError('Indiquez votre nom (2 à 100 caractères)')
  }

  const email = typeof input.email === 'string' ? normalizeEmail(input.email) : ''
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    throw new CheckoutValidationError('Adresse e-mail invalide')
  }

  let phone: string | null = null
  if (input.phone != null && input.phone !== '') {
    const value = typeof input.phone === 'string' ? input.phone.trim() : ''
    if (!PHONE_PATTERN.test(value)) throw new CheckoutValidationError('Numéro de téléphone invalide')
    phone = value
  }

  if (input.acceptTerms !== true) {
    throw new CheckoutValidationError('Vous devez accepter les conditions générales de vente')
  }

  return { name, email, phone }
}

/**
 * Version des CGV en vigueur (à changer à chaque modification de la page /cgv) et adresse
 * de la page : enregistrées sur la commande comme preuve d'acceptation.
 */
export const CGV_VERSION = '2025-12'
export const CGV_URL = `${siteConfig.url.replace(/\/$/, '')}/cgv`

/** Champs de la commande qui prouvent l'acceptation des CGV (vide si elles n'ont pas été acceptées) */
export function termsAcceptance(
  accepted: unknown,
  now: Date = new Date()
): { termsAcceptedAt?: Date; termsVersion?: string } {
  if (accepted !== true) return {}
  return { termsAcceptedAt: now, termsVersion: `${CGV_VERSION} ${CGV_URL}` }
}
