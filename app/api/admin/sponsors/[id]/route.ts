import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/sponsors/[id] - Get a specific sponsor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const sponsor = await prisma.sponsor.findUnique({
      where: { id: params.id },
      include: {
        stand: true,
      },
    })

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: sponsor })
  } catch (error) {
    console.error('Error fetching sponsor:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du sponsor' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/sponsors/[id] - Update a sponsor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      type,
      logoUrl,
      description,
      websiteUrl,
      articleTitle,
      articleBody,
      articleImage,
      displayOrder,
      isActive,
      // Champs exposant
      standId,
      exhibitorDescription,
      exhibitorCategory,
      contactName,
      contactEmail,
      contactPhone,
    } = body

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id: params.id },
    })

    if (!existingSponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 })
    }

    // Check if new slug conflicts with another sponsor
    if (slug && slug !== existingSponsor.slug) {
      const slugConflict = await prisma.sponsor.findUnique({
        where: { slug },
      })
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Ce slug existe déjà' },
          { status: 400 }
        )
      }
    }

    // Vérifier si le stand change
    const oldStandId = existingSponsor.standId
    const newStandId = standId !== undefined ? (standId || null) : existingSponsor.standId

    // Si un nouveau stand est sélectionné, vérifier qu'il est disponible
    if (newStandId && newStandId !== oldStandId) {
      const standAlreadyAssigned = await prisma.sponsor.findFirst({
        where: {
          standId: newStandId,
          id: { not: params.id },
        },
      })
      if (standAlreadyAssigned) {
        return NextResponse.json(
          { error: 'Ce stand est déjà attribué à un autre sponsor' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour avec transaction pour gérer les changements de stand
    const sponsor = await prisma.$transaction(async (tx) => {
      // Si l'ancien stand est différent du nouveau, libérer l'ancien stand
      if (oldStandId && oldStandId !== newStandId) {
        await tx.stand.update({
          where: { id: oldStandId },
          data: {
            status: 'FREE',
            exhibitorName: null,
          },
        })
      }

      // Mettre à jour le sponsor
      const updatedSponsor = await tx.sponsor.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(slug !== undefined && { slug }),
          ...(type !== undefined && { type }),
          ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
          ...(description !== undefined && { description: description || null }),
          ...(websiteUrl !== undefined && { websiteUrl: websiteUrl || null }),
          ...(articleTitle !== undefined && { articleTitle: articleTitle || null }),
          ...(articleBody !== undefined && { articleBody: articleBody || null }),
          ...(articleImage !== undefined && { articleImage: articleImage || null }),
          ...(displayOrder !== undefined && { displayOrder }),
          ...(isActive !== undefined && { isActive }),
          // Champs exposant
          ...(standId !== undefined && { standId: standId || null }),
          ...(exhibitorDescription !== undefined && { exhibitorDescription: exhibitorDescription || null }),
          ...(exhibitorCategory !== undefined && { exhibitorCategory: exhibitorCategory || null }),
          ...(contactName !== undefined && { contactName: contactName || null }),
          ...(contactEmail !== undefined && { contactEmail: contactEmail || null }),
          ...(contactPhone !== undefined && { contactPhone: contactPhone || null }),
        },
        include: {
          stand: true,
        },
      })

      // Si un nouveau stand est attribué, le marquer comme SOLD
      if (newStandId && newStandId !== oldStandId) {
        await tx.stand.update({
          where: { id: newStandId },
          data: {
            status: 'SOLD',
            exhibitorName: name || existingSponsor.name,
          },
        })
      }

      return updatedSponsor
    })

    return NextResponse.json({ success: true, data: sponsor })
  } catch (error) {
    console.error('Error updating sponsor:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du sponsor' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/sponsors/[id] - Delete a sponsor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id: params.id },
    })

    if (!existingSponsor) {
      return NextResponse.json({ error: 'Sponsor non trouvé' }, { status: 404 })
    }

    // Supprimer avec transaction pour libérer le stand
    await prisma.$transaction(async (tx) => {
      // Libérer le stand si attribué
      if (existingSponsor.standId) {
        await tx.stand.update({
          where: { id: existingSponsor.standId },
          data: {
            status: 'FREE',
            exhibitorName: null,
          },
        })
      }

      // Supprimer le sponsor
      await tx.sponsor.delete({
        where: { id: params.id },
      })
    })

    return NextResponse.json({ success: true, message: 'Sponsor supprimé' })
  } catch (error) {
    console.error('Error deleting sponsor:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du sponsor' },
      { status: 500 }
    )
  }
}
