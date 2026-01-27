import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

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

    const media = await prisma.media.update({
      where: { id },
      data: {
        ...(caption !== undefined && { caption }),
        ...(edition !== undefined && { edition }),
        ...(category !== undefined && { category }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}
