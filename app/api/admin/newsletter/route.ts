import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { toCsv } from '@/lib/csv'

// GET /api/admin/newsletter : abonnés actifs (données personnelles : administrateurs seulement)
// ?format=csv : export pour tableur
export async function GET(request: NextRequest) {
  const session = await checkFullAdminAuth()
  if (!session) return unauthorizedResponse()

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: 'desc' },
    select: { id: true, email: true, name: true, source: true, locale: true, subscribedAt: true, confirmedAt: true },
  })

  if (request.nextUrl.searchParams.get('format') === 'csv') {
    const csv = toCsv(
      ['email', 'nom', 'origine', 'langue', 'inscrit le', 'confirmé le'],
      subscribers.map((s) => [s.email, s.name, s.source, s.locale, s.subscribedAt, s.confirmedAt])
    )
    const date = new Date().toISOString().slice(0, 10)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="abonnes-newsletter-${date}.csv"`,
        'Cache-Control': 'no-store',
      },
    })
  }

  const pending = await prisma.newsletterSubscriber.count({ where: { isActive: false, confirmToken: { not: null } } })
  return NextResponse.json({ data: subscribers, pending })
}
