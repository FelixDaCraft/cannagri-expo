import { NextRequest, NextResponse } from 'next/server'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { editionService } from '@/lib/editions'
import { editionErrorResponse } from '@/lib/editions/http'

// POST /api/admin/editions/[id]/activate - Mettre l'édition en ligne (archive la précédente)
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const edition = await editionService.activate(params.id)
    return NextResponse.json({ success: true, data: edition })
  } catch (error) {
    return editionErrorResponse(error, "Erreur lors de l'activation de l'édition")
  }
}
