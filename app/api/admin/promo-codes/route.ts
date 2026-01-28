import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// GET /api/admin/promo-codes - List all promo codes
export async function GET() {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { orders: true } },
      },
    })

    return NextResponse.json({ success: true, data: promoCodes })
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des codes promo' },
      { status: 500 }
    )
  }
}

// POST /api/admin/promo-codes - Create a promo code
export async function POST(request: NextRequest) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const body = await request.json()
    const { code, type, value, maxUses, validFrom, validUntil } = body

    if (!code || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'Champs requis : code, type, value, validFrom, validUntil' },
        { status: 400 }
      )
    }

    if (!['PERCENTAGE', 'FIXED_AMOUNT'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide. Utilisez PERCENTAGE ou FIXED_AMOUNT' },
        { status: 400 }
      )
    }

    if (type === 'PERCENTAGE' && (value <= 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Le pourcentage doit être entre 1 et 100' },
        { status: 400 }
      )
    }

    if (type === 'FIXED_AMOUNT' && value <= 0) {
      return NextResponse.json(
        { error: 'Le montant doit être supérieur à 0' },
        { status: 400 }
      )
    }

    const existing = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code promo existe déjà' },
        { status: 409 }
      )
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value),
        maxUses: maxUses ? parseInt(maxUses) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
      },
    })

    return NextResponse.json({ success: true, data: promoCode }, { status: 201 })
  } catch (error) {
    console.error('Error creating promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du code promo' },
      { status: 500 }
    )
  }
}
