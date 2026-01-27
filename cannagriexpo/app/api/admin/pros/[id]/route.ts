import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

// DELETE /api/admin/pros/[id] - Delete a Pro account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stands: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Compte non trouvé' },
        { status: 404 }
      )
    }

    if (user.role !== 'PRO') {
      return NextResponse.json(
        { error: 'Ce compte n\'est pas un compte Pro' },
        { status: 400 }
      )
    }

    // Unlink stands from this user before deleting
    await prisma.stand.updateMany({
      where: { proId: id },
      data: { proId: null },
    })

    // Delete the user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès',
    })
  } catch (error) {
    console.error('Error deleting pro:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/pros/[id] - Update a Pro account (including isApproved)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const body = await request.json()
    const { isApproved, name, firstName, companyName, phone, siret, businessType } = body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Compte non trouvé' },
        { status: 404 }
      )
    }

    if (user.role !== 'PRO') {
      return NextResponse.json(
        { error: 'Ce compte n\'est pas un compte Pro' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (typeof isApproved === 'boolean') updateData.isApproved = isApproved
    if (name !== undefined) updateData.name = name
    if (firstName !== undefined) updateData.firstName = firstName
    if (companyName !== undefined) updateData.companyName = companyName
    if (phone !== undefined) updateData.phone = phone
    if (siret !== undefined) updateData.siret = siret
    if (businessType !== undefined) updateData.businessType = businessType

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        companyName: true,
        phone: true,
        siret: true,
        businessType: true,
        isApproved: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error('Error updating pro:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du compte' },
      { status: 500 }
    )
  }
}

// GET /api/admin/pros/[id] - Get a Pro account details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        companyName: true,
        phone: true,
        siret: true,
        businessType: true,
        createdAt: true,
        stands: {
          select: {
            id: true,
            number: true,
            status: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Compte non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: user })
  } catch (error) {
    console.error('Error fetching pro:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du compte' },
      { status: 500 }
    )
  }
}
