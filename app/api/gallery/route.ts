import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

const GALLERY_DIR = path.join(process.cwd(), 'public', 'images', 'gallery')

// GET - List all gallery photos (PUBLIC - no auth required)
export async function GET() {
  try {
    // Try to get photos from database first
    const dbMedia = await prisma.media.findMany({
      orderBy: [
        { edition: 'desc' },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        edition: true,
        category: true,
        altText: true,
      },
    })

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
