import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { findEditionByYear } from '@/lib/editions/admin'

// DELETE - Remove media
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

    // Get media from database
    const media = await prisma.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete file from disk
    const filepath = path.join(process.cwd(), 'public', media.imageUrl)
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    // Delete from database
    await prisma.media.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}

// PATCH - Update media info
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
    const { caption, edition, category, displayOrder } = body

    // L'édition est transmise sous forme d'année ("2025")
    let editionId: string | undefined
    if (edition !== undefined) {
      const target = await findEditionByYear(edition)
      if (!target) {
        return NextResponse.json({ error: `L'édition ${edition} n'existe pas` }, { status: 400 })
      }
      editionId = target.id
    }

    const media = await prisma.media.update({
      where: { id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(editionId !== undefined && { editionId }),
        ...(category !== undefined && { category }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
      include: { edition: { select: { year: true } } },
    })

    return NextResponse.json({ ...media, edition: String(media.edition.year) })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}
