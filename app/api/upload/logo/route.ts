import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { GALLERY_DIR } from '@/lib/gallery'
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
    // Formats servis par le volume de la galerie (l'extension vient du type, jamais du nom de fichier)
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
    const ext = extensions[file.type]
    if (!ext) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.' },
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

    // Volume persistant de la galerie (public/uploads est perdu à chaque déploiement) ;
    // le préfixe « ext- » tient ces fichiers à l'écart des photos de la galerie
    await mkdir(GALLERY_DIR, { recursive: true })
    const filename = `ext-logo-${session.user.id}-${Date.now()}.${ext}`
    const filepath = path.join(GALLERY_DIR, filename)

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update user with logo URL
    const logoUrl = `/images/gallery/${filename}`
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
