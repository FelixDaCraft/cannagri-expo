import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// DELETE /api/admin/sponsor-requests/[id] - Supprime une demande (spam passé à travers le filtre)
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await checkFullAdminAuth()
  if (!session) {
    return unauthorizedResponse()
  }

  try {
    await prisma.sponsorRequest.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }
    console.error('Error deleting sponsor request:', error)
    return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 })
  }
}
