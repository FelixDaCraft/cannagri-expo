import { prisma } from '@/lib/prisma'

/**
 * Adresse du compte connecté, seulement si elle a été vérifiée.
 * Les billets étant rattachés par e-mail (achat possible sans compte), un compte
 * dont l'adresse n'est pas prouvée ne doit pas voir les billets de cette adresse.
 */
export async function getVerifiedAccountEmail(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, emailVerified: true },
  })
  if (!user?.email || !user.emailVerified) return null
  return user.email.toLowerCase()
}

export const EMAIL_NOT_VERIFIED = {
  error: 'Vérifiez votre adresse e-mail pour accéder à vos billets.',
  code: 'EMAIL_NOT_VERIFIED',
} as const
