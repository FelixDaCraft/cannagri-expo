import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Détails d'un utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        image: true,
        role: true,
        isApproved: true,
        companyName: true,
        companyDescription: true,
        companyLogo: true,
        companyWebsite: true,
        phone: true,
        siret: true,
        businessType: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            provider: true,
          }
        },
        stands: {
          select: {
            id: true,
            number: true,
            status: true,
          }
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      ...user,
      authProvider: user.accounts.length > 0
        ? user.accounts.map(a => a.provider).join(', ')
        : 'email',
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// PATCH - Modifier un utilisateur (rôle, approbation)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seul SUPER_ADMIN peut modifier les utilisateurs
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { role, isApproved } = body

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Ne pas permettre de modifier son propre compte
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre compte' },
        { status: 400 }
      )
    }

    // Construire les données de mise à jour
    const updateData: Record<string, unknown> = {}

    if (role !== undefined) {
      // Valider le rôle
      const validRoles = ['USER', 'PRO', 'CONTRIBUTOR', 'ADMIN', 'SUPER_ADMIN']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
      }
      updateData.role = role
    }

    if (isApproved !== undefined) {
      updateData.isApproved = isApproved
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isApproved: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Seul SUPER_ADMIN peut supprimer des utilisateurs
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    // Ne pas permettre de se supprimer soi-même
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        stands: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Ne pas permettre de supprimer un SUPER_ADMIN
    if (existingUser.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Impossible de supprimer un Super Admin' },
        { status: 400 }
      )
    }

    // Libérer les stands associés
    if (existingUser.stands.length > 0) {
      await prisma.stand.updateMany({
        where: { proId: params.id },
        data: {
          proId: null,
          status: 'FREE',
        },
      })
    }

    // Supprimer l'utilisateur (cascade supprime les sessions et accounts)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}
