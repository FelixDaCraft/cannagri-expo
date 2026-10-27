import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth, checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { editionService } from '@/lib/editions'
import { getAdminEdition } from '@/lib/editions/admin'
import { parseEditionForm } from '@/lib/editions/form'
import { editionErrorResponse } from '@/lib/editions/http'
import { prisma } from '@/lib/prisma'

// GET /api/admin/editions - Liste des éditions et édition actuellement gérée
export async function GET() {
  try {
    const session = await checkAdminAuth()
    if (!session) return unauthorizedResponse()

    const [editions, current] = await Promise.all([
      prisma.edition.findMany({
        orderBy: { year: 'desc' },
        include: {
          _count: { select: { sponsors: true, events: true, stands: true, tickets: true, media: true } },
        },
      }),
      getAdminEdition(),
    ])

    return NextResponse.json({ success: true, data: editions, currentEditionId: current.id })
  } catch (error) {
    return editionErrorResponse(error, 'Erreur lors de la récupération des éditions')
  }
}

// POST /api/admin/editions - Créer une édition (brouillon)
export async function POST(request: NextRequest) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const body = await request.json()
    const input = parseEditionForm(body)
    const copyStandsFromEditionId =
      typeof body.copyStandsFromEditionId === 'string' && body.copyStandsFromEditionId
        ? body.copyStandsFromEditionId
        : undefined

    const edition = await editionService.create(
      { ...input, year: input.year ?? NaN },
      { copyStandsFromEditionId }
    )
    return NextResponse.json({ success: true, data: edition }, { status: 201 })
  } catch (error) {
    return editionErrorResponse(error, "Erreur lors de la création de l'édition")
  }
}
