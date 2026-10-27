import { cookies } from 'next/headers'
import type { Edition } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getActiveEdition } from '@/lib/editions'

/** Cookie mémorisant l'édition sur laquelle travaille l'administrateur. */
export const ADMIN_EDITION_COOKIE = 'admin-edition'

/**
 * Édition gérée dans l'administration : celle choisie dans le sélecteur
 * (par exemple un brouillon en préparation), sinon l'édition active.
 */
export async function getAdminEdition(): Promise<Edition> {
  const id = cookies().get(ADMIN_EDITION_COOKIE)?.value
  if (id) {
    const edition = await prisma.edition.findUnique({ where: { id } })
    if (edition) return edition
  }
  return getActiveEdition()
}

/** Retrouve une édition à partir d'une année saisie (formulaire, nom de fichier...). */
export async function findEditionByYear(value: unknown): Promise<Edition | null> {
  const year = Number(value)
  if (!Number.isInteger(year)) return null
  return prisma.edition.findUnique({ where: { year } })
}
