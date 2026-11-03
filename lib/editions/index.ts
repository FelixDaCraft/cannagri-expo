import { cache } from 'react'
import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { createEditionService } from './service'
import { toEditionView } from './format'

export const editionService = createEditionService(prisma)

/** Édition présentée par le site public, mémoïsée pour la durée d'un rendu. */
export const getActiveEdition = cache(() => editionService.getActive())

/** Vue de l'édition en ligne, dates écrites dans la langue du visiteur. */
export const getActiveEditionView = cache(async () => toEditionView(await getActiveEdition(), await getLocale()))

export * from './format'
export { EditionValidationError, NoActiveEditionError } from './service'
export type { EditionInput, EditionUpdateInput } from './service'
