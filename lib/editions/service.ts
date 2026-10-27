import { Prisma, type Edition, type PrismaClient } from '@prisma/client'

export class NoActiveEditionError extends Error {
  constructor() {
    super("Aucune édition active : activez une édition depuis l'administration")
    this.name = 'NoActiveEditionError'
  }
}

export class EditionValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join(' · '))
    this.name = 'EditionValidationError'
  }
}

/** Champs saisis par l'administrateur (l'année et le statut ne se modifient pas après création). */
export interface EditionInput {
  year: number
  startAt?: Date | null
  endAt?: Date | null
  venueName?: string | null
  address?: string | null
  city?: string | null
  posterUrl?: string | null
  ticketingOpenAt?: Date | null
  ticketingCloseAt?: Date | null
  standardTicketPrice?: number
  flexTicketPrice?: number
  accessTransport?: string | null
  accessParking?: string | null
  accessInfo?: string | null
  ticketInfo?: string | null
  archiveSummary?: string | null
}

export type EditionUpdateInput = Partial<Omit<EditionInput, 'year'>>

const UPDATABLE_FIELDS = [
  'startAt', 'endAt', 'venueName', 'address', 'city', 'posterUrl',
  'ticketingOpenAt', 'ticketingCloseAt', 'standardTicketPrice', 'flexTicketPrice',
  'accessTransport', 'accessParking', 'accessInfo', 'ticketInfo', 'archiveSummary',
] as const satisfies readonly (keyof EditionUpdateInput)[]

// Chemin local servi par le site, ou URL https. Exclut "//hote", "javascript:", "http:".
const SAFE_POSTER_URL = /^(\/(?!\/)|https:\/\/)/

export function validateEditionInput(
  input: Partial<EditionInput>,
  { partial = false }: { partial?: boolean } = {}
): string[] {
  const errors: string[] = []

  if (!partial || input.year !== undefined) {
    const { year } = input
    if (typeof year !== 'number' || !Number.isInteger(year) || year < 2020 || year > 2100) {
      errors.push("L'année doit être comprise entre 2020 et 2100")
    }
  }
  if (input.startAt && input.endAt && input.endAt <= input.startAt) {
    errors.push("L'heure de fin doit être après l'heure de début")
  }
  if (
    (input.standardTicketPrice !== undefined && !(input.standardTicketPrice >= 0)) ||
    (input.flexTicketPrice !== undefined && !(input.flexTicketPrice >= 0))
  ) {
    errors.push('Les prix des billets doivent être positifs')
  }
  if (input.ticketingOpenAt && input.ticketingCloseAt && input.ticketingCloseAt <= input.ticketingOpenAt) {
    errors.push('La clôture de la billetterie doit être après son ouverture')
  }
  if (input.posterUrl && !SAFE_POSTER_URL.test(input.posterUrl)) {
    errors.push("L'affiche doit être un chemin local (/...) ou une URL https")
  }
  return errors
}

function pickUpdatable(input: EditionUpdateInput): EditionUpdateInput {
  const data: Record<string, unknown> = {}
  for (const field of UPDATABLE_FIELDS) {
    if (input[field] !== undefined) data[field] = input[field]
  }
  return data as EditionUpdateInput
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

type EditionDb = Pick<PrismaClient, 'edition' | 'stand' | '$transaction'>

export function createEditionService(db: EditionDb) {
  async function getActive(): Promise<Edition> {
    const edition = await db.edition.findFirst({ where: { status: 'ACTIVE' } })
    if (!edition) throw new NoActiveEditionError()
    return edition
  }

  /** Édition visible du public (active ou archivée). Les brouillons restent privés. */
  function getPublicByYear(year: number): Promise<Edition | null> {
    return db.edition.findFirst({ where: { year, status: { in: ['ACTIVE', 'ARCHIVED'] } } })
  }

  function listArchived(): Promise<Edition[]> {
    return db.edition.findMany({ where: { status: 'ARCHIVED' }, orderBy: { year: 'desc' } })
  }

  function listAll(): Promise<Edition[]> {
    return db.edition.findMany({ orderBy: { year: 'desc' } })
  }

  async function create(
    input: EditionInput,
    { copyStandsFromEditionId }: { copyStandsFromEditionId?: string } = {}
  ): Promise<Edition> {
    const errors = validateEditionInput(input)
    if (errors.length) throw new EditionValidationError(errors)

    try {
      return await db.$transaction(async (tx) => {
        const edition = await tx.edition.create({
          data: { ...pickUpdatable(input), year: input.year, status: 'DRAFT' },
        })

        if (copyStandsFromEditionId) {
          const source = await tx.edition.findUnique({ where: { id: copyStandsFromEditionId } })
          if (!source) throw new EditionValidationError(["L'édition source du plan de stands est introuvable"])

          // Seule la géométrie et la tarification du plan sont reprises :
          // les stands repartent libres, sans exposant ni commande.
          const stands = await tx.stand.findMany({ where: { editionId: source.id } })
          if (stands.length) {
            await tx.stand.createMany({
              data: stands.map((s) => ({
                editionId: edition.id,
                number: s.number,
                code: s.code,
                surfaceM2: s.surfaceM2,
                priceHT: s.priceHT,
                size: s.size,
                furniturePrice: s.furniturePrice,
                electricityPrice: s.electricityPrice,
                x: s.x,
                y: s.y,
                width: s.width,
                height: s.height,
                row: s.row,
                col: s.col,
              })),
            })
          }
        }
        return edition
      })
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new EditionValidationError([`L'édition ${input.year} existe déjà`])
      }
      throw error
    }
  }

  async function update(id: string, input: EditionUpdateInput): Promise<Edition> {
    const data = pickUpdatable(input)
    const errors = validateEditionInput(data, { partial: true })
    if (errors.length) throw new EditionValidationError(errors)
    return db.edition.update({ where: { id }, data })
  }

  /** Active une édition et archive la précédente : il n'y a jamais deux éditions actives. */
  async function activate(id: string): Promise<Edition> {
    return db.$transaction(async (tx) => {
      const edition = await tx.edition.findUnique({ where: { id } })
      if (!edition) throw new EditionValidationError(['Édition introuvable'])
      if (edition.status === 'ACTIVE') return edition
      if (!edition.startAt || !edition.venueName) {
        throw new EditionValidationError(["Renseignez la date et le lieu avant d'activer l'édition"])
      }
      await tx.edition.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'ARCHIVED' } })
      return tx.edition.update({ where: { id }, data: { status: 'ACTIVE' } })
    })
  }

  /** Supprime une édition créée par erreur, tant qu'elle n'a reçu aucune donnée. */
  async function deleteDraft(id: string): Promise<void> {
    await db.$transaction(async (tx) => {
      const edition = await tx.edition.findUnique({
        where: { id },
        include: {
          _count: {
            select: { sponsors: true, events: true, orders: true, tickets: true, promoCodes: true, media: true },
          },
        },
      })
      if (!edition) throw new EditionValidationError(['Édition introuvable'])
      if (edition.status !== 'DRAFT') {
        throw new EditionValidationError(['Seule une édition en brouillon peut être supprimée'])
      }
      if (Object.values(edition._count).some((count) => count > 0)) {
        throw new EditionValidationError([
          'Cette édition contient déjà des données (sponsors, programme, commandes...) : supprimez-les d\'abord',
        ])
      }
      await tx.stand.deleteMany({ where: { editionId: id } })
      await tx.edition.delete({ where: { id } })
    })
  }

  return { getActive, getPublicByYear, listArchived, listAll, create, update, activate, deleteDraft }
}

export type EditionService = ReturnType<typeof createEditionService>
