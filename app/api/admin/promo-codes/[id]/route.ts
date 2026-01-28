import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkFullAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// PATCH /api/admin/promo-codes/[id] - Update a promo code
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    const body = await request.json()
    const { code, type, value, maxUses, validFrom, validUntil, isActive } = body

    const data: Record<string, unknown> = {}
    if (code !== undefined) data.code = code.trim().toUpperCase()
    if (type !== undefined) data.type = type
    if (value !== undefined) data.value = parseFloat(value)
    if (maxUses !== undefined) data.maxUses = maxUses ? parseInt(maxUses) : null
    if (validFrom !== undefined) data.validFrom = new Date(validFrom)
    if (validUntil !== undefined) data.validUntil = new Date(validUntil)
    if (isActive !== undefined) data.isActive = isActive

    const promoCode = await prisma.promoCode.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, data: promoCode })
  } catch (error) {
    console.error('Error updating promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du code promo' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/promo-codes/[id] - Delete a promo code
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await checkFullAdminAuth()
    if (!session) return unauthorizedResponse()

    // Check if promo code has been used
    const promoCode = await prisma.promoCode.findUnique({
      where: { id: params.id },
      include: { _count: { select: { orders: true } } },
    })

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Code promo introuvable' },
        { status: 404 }
      )
    }

    if (promoCode._count.orders > 0) {
      // Soft delete - just deactivate
      await prisma.promoCode.update({
        where: { id: params.id },
        data: { isActive: false },
      })
      return NextResponse.json({
        success: true,
        message: 'Code promo désactivé (utilisé par des commandes existantes)',
      })
    }

    await prisma.promoCode.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo code:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du code promo' },
      { status: 500 }
    )
  }
}
