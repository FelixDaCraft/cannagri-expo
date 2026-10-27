import { NextRequest, NextResponse } from 'next/server'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { editionService } from '@/lib/editions'
import { editionErrorResponse } from '@/lib/editions/http'

// POST /api/admin/editions/[id]/archive - Archiver une édition
// Pour l'édition en ligne : { successorId } (brouillon existant) ou { createSuccessorYear } (nouvelle édition « à venir »)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const body = await request.json().catch(() => ({}))
    let successorId = typeof body.successorId === 'string' && body.successorId ? body.successorId : undefined

    if (!successorId && body.createSuccessorYear !== undefined) {
      const successor = await editionService.create({ year: Number(body.createSuccessorYear) })
      successorId = successor.id
    }

    const edition = await editionService.archive(params.id, { successorId })
    return NextResponse.json({ success: true, data: edition })
  } catch (error) {
    return editionErrorResponse(error, "Erreur lors de l'archivage de l'édition")
  }
}
