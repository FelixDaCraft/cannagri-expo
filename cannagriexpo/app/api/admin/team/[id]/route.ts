import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkSuperAdminAuth, forbiddenResponse, unauthorizedResponse } from '@/lib/admin-auth'

// PATCH /api/admin/team/[id] - Update a team member's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only SUPER_ADMIN can update roles
    const session = await checkSuperAdminAuth()
    if (!session) {
      return forbiddenResponse('Seul le Super Admin peut modifier les rôles')
    }

    const { id } = await params
    const body = await request.json()
    const { role } = body

    // Validate role
    const allowedRoles = ['ADMIN', 'CONTRIBUTOR']
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Get the user to update
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Cannot modify SUPER_ADMIN
    if (user.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Impossible de modifier le rôle du Super Admin' },
        { status: 403 }
      )
    }

    // Cannot modify yourself
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 }
      )
    }

    // Update role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/team/[id] - Remove a team member or cancel invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only SUPER_ADMIN can remove team members
    const session = await checkSuperAdminAuth()
    if (!session) {
      return forbiddenResponse('Seul le Super Admin peut supprimer des membres')
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'member' or 'invitation'

    if (type === 'invitation') {
      // Cancel invitation
      const invitation = await prisma.teamInvitation.findUnique({
        where: { id },
      })

      if (!invitation) {
        return NextResponse.json(
          { error: 'Invitation non trouvée' },
          { status: 404 }
        )
      }

      await prisma.teamInvitation.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })

      return NextResponse.json({
        success: true,
        message: 'Invitation annulée',
      })
    } else {
      // Remove team member (downgrade to PRO or delete)
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      // Cannot delete SUPER_ADMIN
      if (user.role === 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Impossible de supprimer le Super Admin' },
          { status: 403 }
        )
      }

      // Cannot delete yourself
      if (user.id === session.user.id) {
        return NextResponse.json(
          { error: 'Vous ne pouvez pas vous supprimer vous-même' },
          { status: 403 }
        )
      }

      // Downgrade to PRO role instead of deleting
      await prisma.user.update({
        where: { id },
        data: { role: 'PRO' },
      })

      return NextResponse.json({
        success: true,
        message: 'Membre retiré de l\'équipe',
      })
    }
  } catch (error) {
    console.error('Error removing team member:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}
