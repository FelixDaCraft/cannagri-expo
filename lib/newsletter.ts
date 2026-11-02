import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/config/site'
import { sendNewsletterConfirmation } from '@/lib/email'
import { isValidEmail, normalizeEmail } from '@/lib/checkout'

/**
 * Newsletter en double opt-in (RGPD) : l'inscription crée un abonné inactif et envoie un lien
 * de confirmation ; l'abonné n'est actif qu'après le clic. Chaque abonné a un jeton de
 * désinscription en un clic, valable tant qu'il existe.
 */

export const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const NEWSLETTER_SOURCES = ['footer', 'programme', 'billetterie', 'inscription', 'autre'] as const
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number]

const TOKEN_PATTERN = /^[\w-]{20,128}$/

export function newToken(): string {
  return randomBytes(32).toString('base64url')
}

export function isWellFormedToken(token: unknown): token is string {
  return typeof token === 'string' && TOKEN_PATTERN.test(token)
}

export function parseSource(value: unknown): NewsletterSource {
  return NEWSLETTER_SOURCES.find((s) => s === value) ?? 'autre'
}

/** E-mail normalisé et valide, sinon null */
export function parseNewsletterEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = normalizeEmail(value)
  return isValidEmail(email) ? email : null
}

const baseUrl = () => siteConfig.url.replace(/\/$/, '')
export const confirmUrl = (token: string) => `${baseUrl()}/newsletter/confirmer?token=${encodeURIComponent(token)}`
export const unsubscribeUrl = (token: string) => `${baseUrl()}/newsletter/desinscription?token=${encodeURIComponent(token)}`

/**
 * Enregistre la demande et envoie le lien de confirmation. Ne fait rien pour une adresse déjà
 * active : l'appelant répond toujours la même chose, pour ne rien révéler sur les inscrits.
 */
export async function requestSubscription(
  input: { email: string; source: NewsletterSource; locale?: string | null; name?: string | null },
  now: Date = new Date()
): Promise<void> {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: input.email } })
  if (existing?.isActive) return

  const confirmToken = newToken()
  const confirmTokenExpiresAt = new Date(now.getTime() + CONFIRM_TTL_MS)
  const locale = input.locale ?? null

  let unsubscribeToken: string
  if (existing) {
    await prisma.newsletterSubscriber.update({
      where: { id: existing.id },
      data: { confirmToken, confirmTokenExpiresAt, source: input.source, locale },
    })
    unsubscribeToken = existing.unsubscribeToken
  } else {
    unsubscribeToken = newToken()
    await prisma.newsletterSubscriber.create({
      data: {
        email: input.email,
        name: input.name ?? null,
        isActive: false,
        confirmToken,
        confirmTokenExpiresAt,
        unsubscribeToken,
        source: input.source,
        locale,
      },
    })
  }

  await sendNewsletterConfirmation({
    to: input.email,
    confirmUrl: confirmUrl(confirmToken),
    unsubscribeUrl: unsubscribeUrl(unsubscribeToken),
  })
}

/** Variante qui n'échoue jamais : pour les inscriptions annexes (achat de billet, création de compte) */
export async function requestSubscriptionQuietly(input: Parameters<typeof requestSubscription>[0]): Promise<void> {
  try {
    await requestSubscription(input)
  } catch (error) {
    console.error('Newsletter : inscription annexe impossible', error)
  }
}

export type ConfirmResult = 'confirmed' | 'invalid' | 'expired'

export async function confirmSubscription(token: unknown, now: Date = new Date()): Promise<ConfirmResult> {
  if (!isWellFormedToken(token)) return 'invalid'
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } })
  if (!subscriber) return 'invalid'
  if (!subscriber.confirmTokenExpiresAt || subscriber.confirmTokenExpiresAt < now) return 'expired'
  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { isActive: true, confirmedAt: now, confirmToken: null, confirmTokenExpiresAt: null, unsubscribedAt: null },
  })
  return 'confirmed'
}

export type UnsubscribeResult = 'unsubscribed' | 'invalid'

export async function unsubscribe(token: unknown, now: Date = new Date()): Promise<UnsubscribeResult> {
  if (!isWellFormedToken(token)) return 'invalid'
  const subscriber = await prisma.newsletterSubscriber.findUnique({ where: { unsubscribeToken: token } })
  if (!subscriber) return 'invalid'
  if (subscriber.isActive || subscriber.confirmToken) {
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: { isActive: false, unsubscribedAt: now, confirmToken: null, confirmTokenExpiresAt: null },
    })
  }
  return 'unsubscribed'
}
