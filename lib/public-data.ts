import type { Prisma } from '@prisma/client'

/**
 * Listes blanches des champs publiés par les routes et pages publiques (sans authentification).
 * Ne jamais renvoyer un objet Prisma complet : contacts, e-mails, téléphones, commandes et
 * identifiants d'utilisateurs restent dans l'administration.
 */

export const PUBLIC_SPONSOR_SELECT = {
  id: true,
  name: true,
  slug: true,
  type: true,
  logoUrl: true,
  description: true,
  descriptionTranslations: true,
  websiteUrl: true,
  articleTitle: true,
  articleTitleTranslations: true,
  articleBody: true,
  articleBodyTranslations: true,
  articleImage: true,
  exhibitorDescription: true,
  exhibitorDescriptionTranslations: true,
  exhibitorCategory: true,
  displayOrder: true,
  isActive: true,
} satisfies Prisma.SponsorSelect

export type PublicSponsor = Prisma.SponsorGetPayload<{ select: typeof PUBLIC_SPONSOR_SELECT }>

export const PUBLIC_EVENT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  startAt: true,
  endAt: true,
  location: true,
  speakers: true,
  speakerName: true,
  speakerTitle: true,
  speakerCompany: true,
  speakerPhoto: true,
  speakerBio: true,
  isPlatinumCBDCup: true,
  isHighlighted: true,
  displayOrder: true,
  titleTranslations: true,
  descriptionTranslations: true,
} satisfies Prisma.EventSelect

/** Plan des stands vu par un visiteur ou un exposant : géométrie, prix de vente, statut, nom affiché */
export const PUBLIC_STAND_SELECT = {
  id: true,
  number: true,
  code: true,
  surfaceM2: true,
  priceHT: true,
  status: true,
  size: true,
  exhibitorName: true,
  exhibitorCategory: true,
  hasFurniture: true,
  hasElectricity: true,
  furniturePrice: true,
  electricityPrice: true,
  x: true,
  y: true,
  width: true,
  height: true,
  row: true,
  col: true,
  sponsor: { select: { id: true, name: true, type: true } },
} satisfies Prisma.StandSelect
