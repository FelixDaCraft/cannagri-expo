import { NextRequest, NextResponse } from 'next/server'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { editionService } from '@/lib/editions'
import { parseEditionForm } from '@/lib/editions/form'
import { editionErrorResponse } from '@/lib/editions/http'

// PATCH /api/admin/editions/[id] - Modifier date, lieu, tarifs, affiche, infos pratiques...
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    // L'année et le statut ne se modifient pas ici
    const { year: _year, ...input } = parseEditionForm(await request.json())
    const edition = await editionService.update(params.id, input)
    return NextResponse.json({ success: true, data: edition })
  } catch (error) {
    return editionErrorResponse(error, "Erreur lors de la mise à jour de l'édition")
  }
}

// DELETE /api/admin/editions/[id] - Supprimer un brouillon vide
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    await editionService.deleteDraft(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return editionErrorResponse(error, "Erreur lors de la suppression de l'édition")
  }
}
