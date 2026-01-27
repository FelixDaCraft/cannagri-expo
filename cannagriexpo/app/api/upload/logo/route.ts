import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/upload/logo - Upload company logo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Check if user is PRO and approved
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isApproved: true },
    })

    if (!user || user.role !== 'PRO' || !user.isApproved) {
      return NextResponse.json(
        { error: 'Accès réservé aux comptes PRO validés' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('logo') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.' },
        { status: 400 }
      )
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier est trop volumineux. Maximum 2 Mo.' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `${session.user.id}-${Date.now()}.${ext}`
    const filepath = path.join(uploadsDir, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update user with logo URL
    const logoUrl = `/uploads/logos/${filename}`
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyLogo: logoUrl },
    })

    return NextResponse.json({
      success: true,
      logoUrl,
      message: 'Logo uploadé avec succès',
    })
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du logo' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload/logo - Delete company logo
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Remove logo URL from user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { companyLogo: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Logo supprimé',
    })
  } catch (error) {
    console.error('Error deleting logo:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du logo' },
      { status: 500 }
    )
  }
}
