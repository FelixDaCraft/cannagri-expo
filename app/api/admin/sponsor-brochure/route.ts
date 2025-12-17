import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, stat } from 'fs/promises'
import path from 'path'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

const BROCHURE_PATH = path.join(process.cwd(), 'public', 'docs', 'plaquette-sponsoring.pdf')
const BROCHURE_PUBLIC_URL = '/docs/plaquette-sponsoring.pdf'

// GET /api/admin/sponsor-brochure - Check if brochure exists and get info
export async function GET() {
  try {
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    try {
      const stats = await stat(BROCHURE_PATH)
      return NextResponse.json({
        success: true,
        data: {
          exists: true,
          url: BROCHURE_PUBLIC_URL,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        },
      })
    } catch {
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          url: null,
          size: 0,
          lastModified: null,
        },
      })
    }
  } catch (error) {
    console.error('Error checking brochure:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la plaquette' },
      { status: 500 }
    )
  }
}

// POST /api/admin/sponsor-brochure - Upload new brochure (replaces existing)
export async function POST(request: NextRequest) {
  try {
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Le fichier doit être un PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier ne doit pas dépasser 10 Mo' },
        { status: 400 }
      )
    }

    // Delete existing file if it exists
    try {
      await unlink(BROCHURE_PATH)
      console.log('Existing brochure deleted')
    } catch {
      // File doesn't exist, that's fine
    }

    // Write the new file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(BROCHURE_PATH, buffer)

    console.log(`Brochure uploaded: ${file.name} (${file.size} bytes)`)

    return NextResponse.json({
      success: true,
      message: 'Plaquette uploadée avec succès',
      data: {
        url: BROCHURE_PUBLIC_URL,
        size: file.size,
        lastModified: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Error uploading brochure:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de la plaquette' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/sponsor-brochure - Delete brochure
export async function DELETE() {
  try {
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    try {
      await unlink(BROCHURE_PATH)
      return NextResponse.json({
        success: true,
        message: 'Plaquette supprimée avec succès',
      })
    } catch {
      return NextResponse.json(
        { error: 'Aucune plaquette à supprimer' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting brochure:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la plaquette' },
      { status: 500 }
    )
  }
}
