import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { ADMIN_EDITION_COOKIE } from '@/lib/editions/admin'
import { prisma } from '@/lib/prisma'

// POST /api/admin/editions/select - Choisir l'édition gérée dans l'administration
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdminAuth()
    if (!session) return unauthorizedResponse()

    const { editionId } = await request.json()
    const edition =
      typeof editionId === 'string' ? await prisma.edition.findUnique({ where: { id: editionId } }) : null
    if (!edition) {
      return NextResponse.json({ error: 'Édition introuvable' }, { status: 404 })
    }

    const response = NextResponse.json({ success: true, data: { id: edition.id, year: edition.year } })
    response.cookies.set(ADMIN_EDITION_COOKIE, edition.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  } catch (error) {
    console.error('Error selecting edition:', error)
    return NextResponse.json({ error: "Erreur lors du choix de l'édition" }, { status: 500 })
  }
}
