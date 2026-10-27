/**
 * @jest-environment node
 */
import { Prisma } from '@prisma/client'
import {
  createEditionService,
  validateEditionInput,
  EditionValidationError,
  NoActiveEditionError,
} from '@/lib/editions/service'

function makeDb() {
  const db = {
    edition: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    stand: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  }
  // Transaction interactive : le callback reçoit le même client simulé
  db.$transaction.mockImplementation((fn: (tx: typeof db) => unknown) => fn(db))
  return db
}

const validInput = {
  year: 2027,
  startAt: new Date('2027-04-10T07:00:00Z'),
  endAt: new Date('2027-04-10T17:00:00Z'),
  venueName: 'Parc des Expositions',
  address: 'Route de Saint-Joseph, 44300 Nantes',
  city: 'Nantes',
  standardTicketPrice: 18,
  flexTicketPrice: 30,
}

describe('validateEditionInput', () => {
  it('accepte une édition complète', () => {
    expect(validateEditionInput(validInput)).toEqual([])
  })

  it('refuse une année hors bornes ou non entière', () => {
    expect(validateEditionInput({ ...validInput, year: 1999 })).toContain("L'année doit être comprise entre 2020 et 2100")
    expect(validateEditionInput({ ...validInput, year: 2027.5 })).toContain("L'année doit être comprise entre 2020 et 2100")
  })

  it('refuse une fin avant le début', () => {
    expect(
      validateEditionInput({ ...validInput, endAt: new Date('2027-04-10T06:00:00Z') })
    ).toContain("L'heure de fin doit être après l'heure de début")
  })

  it('refuse des prix négatifs', () => {
    expect(validateEditionInput({ ...validInput, standardTicketPrice: -1 })).toContain(
      'Les prix des billets doivent être positifs'
    )
  })

  it('refuse une clôture de billetterie avant son ouverture', () => {
    expect(
      validateEditionInput({
        ...validInput,
        ticketingOpenAt: new Date('2027-02-01'),
        ticketingCloseAt: new Date('2027-01-01'),
      })
    ).toContain("La clôture de la billetterie doit être après son ouverture")
  })

  it("refuse une URL d'affiche externe non HTTPS ou un schéma dangereux", () => {
    const error = "L'affiche doit être un chemin local (/...) ou une URL https"
    expect(validateEditionInput({ ...validInput, posterUrl: 'javascript:alert(1)' })).toContain(error)
    expect(validateEditionInput({ ...validInput, posterUrl: 'http://example.com/a.png' })).toContain(error)
    expect(validateEditionInput({ ...validInput, posterUrl: '//evil.com/a.png' })).toContain(error)
    expect(validateEditionInput({ ...validInput, posterUrl: '/uploads/posters/2027.png' })).toEqual([])
    expect(validateEditionInput({ ...validInput, posterUrl: 'https://cdn.example.com/a.png' })).toEqual([])
  })

  it("valide une mise à jour partielle sans exiger l'année", () => {
    expect(validateEditionInput({ city: 'Rennes' }, { partial: true })).toEqual([])
  })
})

describe('EditionService', () => {
  let db: ReturnType<typeof makeDb>
  let service: ReturnType<typeof createEditionService>

  beforeEach(() => {
    db = makeDb()
    service = createEditionService(db as never)
  })

  describe('getActive', () => {
    it("renvoie l'édition active", async () => {
      db.edition.findFirst.mockResolvedValue({ id: 'e26', year: 2026, status: 'ACTIVE' })
      await expect(service.getActive()).resolves.toMatchObject({ year: 2026 })
      expect(db.edition.findFirst).toHaveBeenCalledWith({ where: { status: 'ACTIVE' } })
    })

    it("lève NoActiveEditionError s'il n'y en a aucune", async () => {
      db.edition.findFirst.mockResolvedValue(null)
      await expect(service.getActive()).rejects.toBeInstanceOf(NoActiveEditionError)
    })
  })

  const PUBLISHED_ARCHIVE = {
    status: 'ARCHIVED',
    OR: [{ events: { some: {} } }, { sponsors: { some: {} } }, { stands: { some: { status: 'SOLD' } } }],
  }

  describe('getPublicByYear', () => {
    it("ne renvoie que l'édition en ligne ou une archive avec du contenu (jamais un brouillon)", async () => {
      db.edition.findFirst.mockResolvedValue(null)
      await expect(service.getPublicByYear(2027)).resolves.toBeNull()
      expect(db.edition.findFirst).toHaveBeenCalledWith({
        where: { year: 2027, OR: [{ status: 'ACTIVE' }, PUBLISHED_ARCHIVE] },
      })
    })
  })

  describe('listPublishedArchives', () => {
    it('liste les archives qui ont des conférences, sponsors ou stands, de la plus récente à la plus ancienne', async () => {
      db.edition.findMany.mockResolvedValue([])
      await service.listPublishedArchives()
      expect(db.edition.findMany).toHaveBeenCalledWith({
        where: PUBLISHED_ARCHIVE,
        orderBy: { year: 'desc' },
      })
    })
  })

  describe('hasPublishedArchives', () => {
    it("indique s'il existe au moins une archive à montrer (lien du menu)", async () => {
      db.edition.count.mockResolvedValue(0)
      await expect(service.hasPublishedArchives()).resolves.toBe(false)
      db.edition.count.mockResolvedValue(2)
      await expect(service.hasPublishedArchives()).resolves.toBe(true)
      expect(db.edition.count).toHaveBeenCalledWith({ where: PUBLISHED_ARCHIVE })
    })
  })

  describe('create', () => {
    it('crée une édition en brouillon', async () => {
      db.edition.create.mockResolvedValue({ id: 'e27', ...validInput, status: 'DRAFT' })
      const created = await service.create(validInput)
      expect(created.status).toBe('DRAFT')
      expect(db.edition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ year: 2027, status: 'DRAFT' }),
      })
    })

    it('refuse une saisie invalide sans toucher la base', async () => {
      await expect(service.create({ ...validInput, year: 1 })).rejects.toBeInstanceOf(EditionValidationError)
      expect(db.edition.create).not.toHaveBeenCalled()
    })

    it("traduit le doublon d'année en erreur de validation lisible", async () => {
      db.edition.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: '5.22.0',
        })
      )
      await expect(service.create(validInput)).rejects.toThrow("L'édition 2027 existe déjà")
    })

    it('copie le plan de stands demandé, remis à zéro (libres, sans exposant)', async () => {
      db.edition.create.mockResolvedValue({ id: 'e27', year: 2027, status: 'DRAFT' })
      db.edition.findUnique.mockResolvedValue({ id: 'e26', year: 2026 })
      db.stand.findMany.mockResolvedValue([
        {
          id: 's1', editionId: 'e26', number: 1, code: 'A1', surfaceM2: 9, priceHT: 450,
          status: 'SOLD', size: 'SMALL', exhibitorName: 'Ancien exposant',
          exhibitorDescription: 'desc', exhibitorLogo: '/l.png', exhibitorWebsite: 'https://x',
          exhibitorCategory: 'SERVICE', proId: 'u1', hasFurniture: true, hasElectricity: true,
          furniturePrice: 120, electricityPrice: 80, x: 10, y: 20, width: 45, height: 45,
          row: 0, col: 0, orderId: 'o1', reservedAt: new Date(), reservedUntil: new Date(),
        },
      ])

      await service.create(validInput, { copyStandsFromEditionId: 'e26' })

      expect(db.$transaction).toHaveBeenCalled()
      expect(db.stand.findMany).toHaveBeenCalledWith({ where: { editionId: 'e26' } })
      expect(db.stand.createMany).toHaveBeenCalledWith({
        data: [
          {
            editionId: 'e27', number: 1, code: 'A1', surfaceM2: 9, priceHT: 450, size: 'SMALL',
            furniturePrice: 120, electricityPrice: 80, x: 10, y: 20, width: 45, height: 45, row: 0, col: 0,
          },
        ],
      })
    })

    it("refuse de copier les stands d'une édition inconnue", async () => {
      db.edition.create.mockResolvedValue({ id: 'e27', year: 2027, status: 'DRAFT' })
      db.edition.findUnique.mockResolvedValue(null)
      await expect(
        service.create(validInput, { copyStandsFromEditionId: 'nope' })
      ).rejects.toBeInstanceOf(EditionValidationError)
      expect(db.stand.createMany).not.toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it("refuse de changer l'année ou le statut via une mise à jour", async () => {
      db.edition.update.mockResolvedValue({})
      await service.update('e27', { city: 'Rennes', year: 2030, status: 'ACTIVE' } as never)
      expect(db.edition.update).toHaveBeenCalledWith({ where: { id: 'e27' }, data: { city: 'Rennes' } })
    })

    it('valide les champs modifiés', async () => {
      await expect(service.update('e27', { standardTicketPrice: -5 })).rejects.toBeInstanceOf(
        EditionValidationError
      )
    })
  })

  describe('activate', () => {
    it("archive l'édition active puis active la cible, dans une transaction", async () => {
      db.edition.findUnique.mockResolvedValue({ ...validInput, id: 'e27', status: 'DRAFT' })
      db.edition.update.mockResolvedValue({ id: 'e27', status: 'ACTIVE' })

      await service.activate('e27')

      expect(db.$transaction).toHaveBeenCalled()
      expect(db.edition.updateMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
        data: { status: 'ARCHIVED' },
      })
      expect(db.edition.update).toHaveBeenCalledWith({ where: { id: 'e27' }, data: { status: 'ACTIVE' } })
      const archiveOrder = db.edition.updateMany.mock.invocationCallOrder[0]
      const activateOrder = db.edition.update.mock.invocationCallOrder[0]
      expect(archiveOrder).toBeLessThan(activateOrder)
    })

    it("autorise une édition dont la date et le lieu sont encore à venir", async () => {
      db.edition.findUnique.mockResolvedValue({ id: 'e27', year: 2027, status: 'DRAFT', startAt: null, venueName: null })
      db.edition.update.mockResolvedValue({ id: 'e27', status: 'ACTIVE' })
      await service.activate('e27')
      expect(db.edition.update).toHaveBeenCalledWith({ where: { id: 'e27' }, data: { status: 'ACTIVE' } })
    })

    it('ne fait rien si elle est déjà active', async () => {
      db.edition.findUnique.mockResolvedValue({ id: 'e26', status: 'ACTIVE', ...validInput })
      await service.activate('e26')
      expect(db.edition.updateMany).not.toHaveBeenCalled()
    })

    it('refuse une édition inconnue', async () => {
      db.edition.findUnique.mockResolvedValue(null)
      await expect(service.activate('nope')).rejects.toBeInstanceOf(EditionValidationError)
    })
  })

  describe('archive', () => {
    it('archive directement un brouillon', async () => {
      db.edition.findUnique.mockResolvedValue({ id: 'e27', year: 2027, status: 'DRAFT' })
      db.edition.update.mockResolvedValue({ id: 'e27', status: 'ARCHIVED' })
      await service.archive('e27')
      expect(db.edition.update).toHaveBeenCalledWith({ where: { id: 'e27' }, data: { status: 'ARCHIVED' } })
    })

    it("exige un remplaçant pour archiver l'édition en ligne (le site doit toujours en présenter une)", async () => {
      db.edition.findUnique.mockResolvedValue({ id: 'e26', year: 2026, status: 'ACTIVE' })
      await expect(service.archive('e26')).rejects.toThrow("Choisissez l'édition qui la remplace en ligne")
      expect(db.edition.update).not.toHaveBeenCalled()
    })

    it("archive l'édition en ligne et met son remplaçant en ligne, dans une transaction", async () => {
      db.edition.findUnique.mockImplementation(({ where }: { where: { id: string } }) =>
        Promise.resolve(where.id === 'e26' ? { id: 'e26', year: 2026, status: 'ACTIVE' } : { id: 'e27', year: 2027, status: 'DRAFT' })
      )
      db.edition.update.mockResolvedValue({})
      await service.archive('e26', { successorId: 'e27' })
      expect(db.$transaction).toHaveBeenCalled()
      expect(db.edition.update).toHaveBeenCalledWith({ where: { id: 'e26' }, data: { status: 'ARCHIVED' } })
      expect(db.edition.update).toHaveBeenCalledWith({ where: { id: 'e27' }, data: { status: 'ACTIVE' } })
    })

    it('refuse un remplaçant inconnu ou identique', async () => {
      db.edition.findUnique.mockImplementation(({ where }: { where: { id: string } }) =>
        Promise.resolve(where.id === 'e26' ? { id: 'e26', year: 2026, status: 'ACTIVE' } : null)
      )
      await expect(service.archive('e26', { successorId: 'nope' })).rejects.toBeInstanceOf(EditionValidationError)
      await expect(service.archive('e26', { successorId: 'e26' })).rejects.toBeInstanceOf(EditionValidationError)
      expect(db.edition.update).not.toHaveBeenCalled()
    })

    it('ne fait rien pour une édition déjà archivée', async () => {
      db.edition.findUnique.mockResolvedValue({ id: 'e24', year: 2024, status: 'ARCHIVED' })
      await service.archive('e24')
      expect(db.edition.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteDraft', () => {
    it('supprime un brouillon vide (et ses stands copiés)', async () => {
      db.edition.findUnique.mockResolvedValue({
        id: 'e27', status: 'DRAFT',
        _count: { sponsors: 0, events: 0, orders: 0, tickets: 0, promoCodes: 0, media: 0 },
      })
      await service.deleteDraft('e27')
      expect(db.stand.deleteMany).toHaveBeenCalledWith({ where: { editionId: 'e27' } })
      expect(db.edition.delete).toHaveBeenCalledWith({ where: { id: 'e27' } })
    })

    it('refuse de supprimer une édition publiée', async () => {
      db.edition.findUnique.mockResolvedValue({ id: 'e26', status: 'ARCHIVED', _count: {} })
      await expect(service.deleteDraft('e26')).rejects.toThrow('Seule une édition en brouillon peut être supprimée')
    })

    it('refuse de supprimer un brouillon qui contient déjà des données', async () => {
      db.edition.findUnique.mockResolvedValue({
        id: 'e27', status: 'DRAFT',
        _count: { sponsors: 2, events: 0, orders: 0, tickets: 0, promoCodes: 0, media: 0 },
      })
      await expect(service.deleteDraft('e27')).rejects.toThrow(
        'Cette édition contient déjà des données'
      )
      expect(db.edition.delete).not.toHaveBeenCalled()
    })
  })
})
