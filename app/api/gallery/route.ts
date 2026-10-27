import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

// Lecture en base à chaque requête (sinon la route serait figée au moment du build)
export const dynamic = 'force-dynamic'

const GALLERY_DIR = path.join(process.cwd(), 'public', 'images', 'gallery')

// GET - List all gallery photos (PUBLIC - no auth required)
export async function GET() {
  try {
    // Try to get photos from database first
    // Photos de toutes les éditions publiées (les brouillons restent privés)
    const rows = await prisma.media.findMany({
      where: { edition: { status: { in: ['ACTIVE', 'ARCHIVED'] } } },
      orderBy: [
        { edition: { year: 'desc' } },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        edition: { select: { year: true } },
        category: true,
        altText: true,
      },
    })
    // Le client regroupe les photos par année d'édition (chaîne "2024", "2025"...)
    const dbMedia = rows.map(({ edition, ...media }) => ({ ...media, edition: String(edition.year) }))

    if (dbMedia.length > 0) {
      return NextResponse.json(dbMedia)
    }

    // Fallback: read files from disk if database is empty
    if (!existsSync(GALLERY_DIR)) {
      return NextResponse.json([])
    }

    const files = await readdir(GALLERY_DIR)
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith('.') && f !== '.gitkeep'
    )

    const photos = imageFiles.map((file, index) => {
      // Try to extract edition from filename (e.g., IMG20240419... -> 2024)
      const yearMatch = file.match(/(\d{4})/)
      const edition = yearMatch ? yearMatch[1] : new Date().getFullYear().toString()

      return {
        id: `file-${index}`,
        imageUrl: `/images/gallery/${file}`,
        caption: `Photo ${edition}`,
        edition,
        category: 'Général',
        altText: `Photo ${edition}`,
      }
    })

    return NextResponse.json(photos)
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json([])
  }
}
